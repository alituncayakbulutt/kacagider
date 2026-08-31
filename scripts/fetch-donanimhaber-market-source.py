#!/usr/bin/env python3
from __future__ import annotations

import datetime as dt
import html
import json
import re
import subprocess
import time
import unicodedata
import urllib.parse
import urllib.request
import urllib.robotparser
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "config" / "donanimhaber-market-source.json"
OUTPUT_PATH = ROOT / "data" / "market-observations" / "inbox" / "_runtime-donanimhaber.json"
REPORT_DIR = ROOT / "reports" / "price-monitor"

MONTHS = {
    "ocak": 1, "subat": 2, "mart": 3, "nisan": 4, "mayis": 5, "haziran": 6,
    "temmuz": 7, "agustos": 8, "eylul": 9, "ekim": 10, "kasim": 11, "aralik": 12,
}
PRICE_RE = re.compile(r"(?<!\d)(\d{1,3}(?:[.\s]\d{3})+|\d{4,6})\s*(?:TL|₺)\b", re.IGNORECASE)
STORAGE_RE = re.compile(r"(?<!\d)(\d+(?:[.,]\d+)?)\s*(TB|GB)\b", re.IGNORECASE)
HREF_RE = re.compile(r"href=[\"']([^\"']+)[\"']", re.IGNORECASE)
TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.IGNORECASE | re.DOTALL)
DATE_RE = re.compile(
    r"\b(\d{1,2})\s+(Ocak|Şubat|Subat|Mart|Nisan|Mayıs|Mayis|Haziran|Temmuz|Ağustos|Agustos|Eylül|Eylul|Ekim|Kasım|Kasim|Aralık|Aralik)\s+(20\d{2})\b",
    re.IGNORECASE,
)


class TextCollector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if tag in {"script", "style", "noscript", "svg"}:
            self.skip += 1
        elif not self.skip and tag in {"br", "p", "div", "li", "h1", "h2", "h3", "section", "article", "tr"}:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in {"script", "style", "noscript", "svg"}:
            if self.skip:
                self.skip -= 1
        elif not self.skip and tag in {"p", "div", "li", "h1", "h2", "h3", "section", "article", "tr"}:
            self.parts.append("\n")

    def handle_data(self, data):
        if not self.skip and data:
            self.parts.append(data)

    def lines(self):
        text = html.unescape("".join(self.parts))
        return [re.sub(r"\s+", " ", x).strip() for x in text.splitlines() if x.strip()]


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def normalize_text(value):
    text = str(value or "").strip().casefold()
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.translate(str.maketrans({"ı": "i", "ş": "s", "ğ": "g", "ü": "u", "ö": "o", "ç": "c"}))
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def normalize_storage(value):
    if value is None:
        return None
    raw = str(value).strip().lower().replace(",", ".")
    m = re.search(r"(\d+(?:\.\d+)?)\s*(tb|gb)?", raw)
    if not m:
        return None
    number = float(m.group(1))
    unit = m.group(2) or "gb"
    return str(int(round(number * 1024 if unit == "tb" else number)))


def extract_phone_prices():
    js = ROOT / "data" / "phone-prices.js"
    code = r'''
const fs = require('fs');
const vm = require('vm');
const src = fs.readFileSync(process.argv[1], 'utf8');
const sandbox = { console };
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(src, sandbox, { filename: process.argv[1] });
process.stdout.write(vm.runInContext('JSON.stringify(PHONE_PRICE_DATA)', sandbox));
'''
    proc = subprocess.run(["node", "-e", code, str(js)], check=True, capture_output=True, text=True, cwd=ROOT)
    return json.loads(proc.stdout)


def catalog_signatures(data):
    out = []
    for brand, models in (data or {}).items():
        if not isinstance(models, dict):
            continue
        for model, storages in models.items():
            if not isinstance(storages, dict):
                continue
            out.append({
                "brand": brand,
                "model": model,
                "brand_n": normalize_text(brand),
                "model_n": normalize_text(model),
                "storages": {normalize_storage(s) for s in storages if normalize_storage(s)},
            })
    return sorted(out, key=lambda x: len(x["model_n"]), reverse=True)


def fetch_text(url, request_cfg):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": request_cfg["user_agent"],
            "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.5",
            "Cache-Control": "no-cache",
        },
    )
    with urllib.request.urlopen(req, timeout=float(request_cfg["timeout_seconds"])) as response:
        data = response.read(int(request_cfg["max_bytes"]) + 1)
        if len(data) > int(request_cfg["max_bytes"]):
            raise RuntimeError("response_too_large")
        charset = response.headers.get_content_charset() or "utf-8"
        return data.decode(charset, errors="replace"), int(getattr(response, "status", 200) or 200)


def robots_allowed(url, request_cfg):
    parsed = urllib.parse.urlsplit(url)
    robots_url = urllib.parse.urlunsplit((parsed.scheme, parsed.netloc, "/robots.txt", "", ""))
    try:
        raw, _ = fetch_text(robots_url, request_cfg)
    except Exception as exc:
        return False, f"robots_unavailable:{type(exc).__name__}"
    parser = urllib.robotparser.RobotFileParser()
    parser.set_url(robots_url)
    parser.parse(raw.splitlines())
    allowed = parser.can_fetch(request_cfg["user_agent"], url)
    return allowed, "robots_allow" if allowed else "robots_disallow"


def detail_links(raw_html, base_url, limit):
    seen = set()
    out = []
    base_host = urllib.parse.urlsplit(base_url).netloc.casefold()
    for href in HREF_RE.findall(raw_html):
        url = urllib.parse.urljoin(base_url, html.unescape(href))
        parsed = urllib.parse.urlsplit(url)
        if parsed.netloc.casefold() != base_host:
            continue
        if not re.search(r"--\d+/?$", parsed.path):
            continue
        if "--f528" in parsed.path:
            continue
        clean = urllib.parse.urlunsplit((parsed.scheme, parsed.netloc, parsed.path, "", ""))
        if clean in seen:
            continue
        seen.add(clean)
        out.append(clean)
        if len(out) >= limit:
            break
    return out


def page_title(raw_html):
    m = TITLE_RE.search(raw_html)
    if not m:
        return ""
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html.unescape(m.group(1)))).strip()


def match_model(text, signatures):
    normalized = " " + normalize_text(text) + " "
    for item in signatures:
        model = item["model_n"]
        if not model or (" " + model + " ") not in normalized:
            continue
        if (model.isdigit() or len(model) <= 4) and (" " + item["brand_n"] + " ") not in normalized:
            continue
        return item
    return None


def storage_from_text(text, allowed):
    for m in STORAGE_RE.finditer(text or ""):
        s = normalize_storage(f"{m.group(1)} {m.group(2)}")
        if s in allowed:
            return s
    return None


def parse_price(lines, minimum, maximum):
    candidates = []
    preferred = []
    for index, line in enumerate(lines):
        prices = []
        for m in PRICE_RE.finditer(line):
            token = m.group(1).replace(" ", "").replace(".", "")
            try:
                value = int(token)
            except ValueError:
                continue
            if minimum <= value <= maximum:
                prices.append(value)
        if not prices:
            continue
        normalized = normalize_text(line)
        target = preferred if any(k in normalized for k in ("fiyat", "tl", "istedigim fiyat")) else candidates
        for price in prices:
            target.append((index, price))
    pool = preferred or candidates
    if not pool:
        return None
    values = [p for _, p in pool]
    values.sort()
    return values[len(values) // 2]


def parse_post_date(text):
    normalized = normalize_text(text)
    m = DATE_RE.search(text)
    if not m:
        return None
    day = int(m.group(1))
    month = MONTHS.get(normalize_text(m.group(2)))
    year = int(m.group(3))
    if not month:
        return None
    try:
        return dt.datetime(year, month, day, tzinfo=dt.timezone.utc)
    except ValueError:
        return None


def listing_observation(url, raw_html, signatures, cfg, observed_now):
    parser = TextCollector()
    try:
        parser.feed(raw_html)
    except Exception:
        pass
    lines = parser.lines()
    title = page_title(raw_html)
    model = match_model(title, signatures)
    if not model:
        for line in lines[:120]:
            model = match_model(line, signatures)
            if model:
                break
    if not model:
        return None, "model_not_found"

    storage = storage_from_text(title, model["storages"])
    if not storage:
        for line in lines[:160]:
            if model["model_n"] in normalize_text(line):
                storage = storage_from_text(line, model["storages"])
                if storage:
                    break
    if not storage:
        return None, "storage_not_found"

    price = parse_price(lines, cfg["collection"]["minimum_price_tl"], cfg["collection"]["maximum_price_tl"])
    if price is None:
        return None, "price_not_found"

    full_text = "\n".join(lines[:250])
    status_text = normalize_text(title + " " + full_text)
    sold = any(token in status_text for token in ("satildi", "forum disina satildi", "urun dh forum uzerinden satilmistir"))
    observed_at = observed_now
    if sold:
        post_date = parse_post_date(full_text)
        if post_date:
            observed_at = post_date

    item_match = re.search(r"--(\d+)/?$", urllib.parse.urlsplit(url).path)
    item_id = item_match.group(1) if item_match else url
    return {
        "source_id": cfg["source_id"],
        "source_item_id": item_id,
        "source_url": url,
        "observation_type": "sold" if sold else "asking",
        "category": "phone",
        "brand": model["brand"],
        "model": model["model"],
        "storage": f"{storage} GB",
        "price": int(price),
        "observed_at": observed_at.isoformat().replace("+00:00", "Z"),
        "market_status": "sold" if sold else "active",
    }, None


def main():
    cfg = load_json(CONFIG_PATH)
    safety = cfg.get("safety", {})
    if cfg.get("mode") != "dry-run" or safety.get("allow_live_price_write") or safety.get("allow_supabase_write"):
        raise SystemExit("Guvenlik: DonanimHaber toplayici yalnizca dry-run modunda calisabilir.")

    request_cfg = cfg["request"]
    signatures = catalog_signatures(extract_phone_prices())
    now = dt.datetime.now(dt.timezone.utc).replace(microsecond=0)
    observations = []
    report_rows = []
    rejected = {}

    for category_url in cfg.get("category_urls", []):
        row = {"category_url": category_url, "status": "pending", "detail_links": 0, "observations": 0}
        try:
            if safety.get("respect_robots_txt", True):
                allowed, reason = robots_allowed(category_url, request_cfg)
                row["robots_status"] = reason
                if not allowed:
                    row["status"] = reason
                    report_rows.append(row)
                    continue
            raw, status = fetch_text(category_url, request_cfg)
            row["http_status"] = status
            links = detail_links(raw, category_url, int(cfg["collection"]["maximum_detail_pages"]))
            row["detail_links"] = len(links)
            for index, url in enumerate(links):
                if len(observations) >= int(cfg["collection"]["maximum_observations"]):
                    break
                try:
                    detail_html, _ = fetch_text(url, request_cfg)
                    obs, reason = listing_observation(url, detail_html, signatures, cfg, now)
                    if obs:
                        observations.append(obs)
                    else:
                        rejected[reason] = rejected.get(reason, 0) + 1
                except Exception as exc:
                    key = f"detail_fetch_{type(exc).__name__}"
                    rejected[key] = rejected.get(key, 0) + 1
                if index + 1 < len(links):
                    time.sleep(float(request_cfg.get("delay_between_requests_seconds", 0.8)))
            row["observations"] = len(observations)
            row["status"] = "ok"
        except Exception as exc:
            row["status"] = f"fetch_error:{type(exc).__name__}"
            row["error"] = str(exc)[:250]
        report_rows.append(row)

    unique = []
    seen = set()
    for obs in observations:
        key = (obs["source_item_id"], obs["brand"], obs["model"], obs["storage"], obs["price"])
        if key in seen:
            continue
        seen.add(key)
        unique.append(obs)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps({
        "phase": "3b",
        "mode": "dry-run",
        "generated_at_utc": now.isoformat().replace("+00:00", "Z"),
        "observations": unique,
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    active = sum(1 for x in unique if x.get("market_status") == "active")
    sold = sum(1 for x in unique if x.get("market_status") == "sold")
    report = {
        "phase": "3b",
        "mode": "dry-run",
        "source_id": cfg["source_id"],
        "generated_at_utc": now.isoformat().replace("+00:00", "Z"),
        "summary": {
            "observations": len(unique),
            "active": active,
            "sold": sold,
            "rejected": rejected,
        },
        "pages": report_rows,
        "safety": {
            "live_price_mutation": False,
            "supabase_mutation": False,
            "login_or_captcha_bypass": False,
            "robots_txt_respected": bool(safety.get("respect_robots_txt", True)),
        },
    }
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    (REPORT_DIR / "donanimhaber-source-latest.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    md = [
        "# KaçaGider Faz 3B — DonanımHaber İkinci El Kaynağı",
        "",
        "- Mod: **dry-run / canlı fiyat yazımı kapalı**",
        f"- Toplanan gözlem: **{len(unique)}**",
        f"- Aktif ilan: **{active}**",
        f"- Satıldı işaretli ilan: **{sold}**",
        f"- Reddedilenler: `{json.dumps(rejected, ensure_ascii=False)}`",
        "- Giriş/captcha aşılmaz; robots.txt kuralları uygulanır.",
    ]
    (REPORT_DIR / "donanimhaber-source-latest.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    print(json.dumps(report["summary"], ensure_ascii=False, indent=2))
    print(f"Runtime input: {OUTPUT_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
