#!/usr/bin/env python3
from __future__ import annotations

import datetime as dt
import hashlib
import html
import json
import re
import subprocess
import time
import unicodedata
import urllib.parse
import urllib.request
import urllib.robotparser
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "config" / "external-market-sources.json"
OUTPUT_PATH = ROOT / "data" / "market-observations" / "inbox" / "_runtime-external.json"
REPORT_DIR = ROOT / "reports" / "price-monitor"

BLOCK_TAGS = {
    "address", "article", "aside", "blockquote", "br", "div", "dl", "dt", "dd", "fieldset",
    "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6",
    "header", "hr", "li", "main", "nav", "ol", "p", "pre", "section", "table", "tbody",
    "td", "tfoot", "th", "thead", "tr", "ul"
}

PRICE_RE = re.compile(
    r"(?<!\d)(\d{1,3}(?:[.\s]\d{3})+(?:,\d{1,2})?|\d{4,6}(?:,\d{1,2})?)\s*(?:TL|₺)",
    re.IGNORECASE,
)
STORAGE_RE = re.compile(r"(?<!\d)(\d+(?:[.,]\d+)?)\s*(TB|GB)\b", re.IGNORECASE)


class TextCollector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.skip_depth = 0

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if tag in {"script", "style", "noscript", "svg"}:
            self.skip_depth += 1
            return
        if self.skip_depth == 0 and tag in BLOCK_TAGS:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in {"script", "style", "noscript", "svg"}:
            if self.skip_depth:
                self.skip_depth -= 1
            return
        if self.skip_depth == 0 and tag in BLOCK_TAGS:
            self.parts.append("\n")

    def handle_data(self, data):
        if self.skip_depth == 0 and data:
            self.parts.append(data)

    def lines(self):
        text = html.unescape("".join(self.parts))
        return [re.sub(r"\s+", " ", line).strip() for line in text.splitlines() if line.strip()]


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


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
    proc = subprocess.run(
        ["node", "-e", code, str(js)],
        check=True,
        capture_output=True,
        text=True,
        cwd=ROOT,
    )
    return json.loads(proc.stdout)


def normalize_text(value):
    text = str(value or "").strip().casefold()
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.translate(str.maketrans({"ı": "i", "ş": "s", "ğ": "g", "ü": "u", "ö": "o", "ç": "c"}))
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def normalize_storage(value):
    if value is None or str(value).strip() == "":
        return None
    raw = str(value).strip().lower().replace(",", ".")
    m = re.search(r"(\d+(?:\.\d+)?)\s*(tb|gb)?", raw)
    if not m:
        return None
    number = float(m.group(1))
    unit = m.group(2) or "gb"
    gb = int(round(number * 1024)) if unit == "tb" else int(round(number))
    return str(gb)


def flatten_models(data):
    models = {}
    for brand, model_map in (data or {}).items():
        if not isinstance(model_map, dict):
            continue
        for model, storages in model_map.items():
            if not isinstance(storages, dict):
                continue
            models[(brand, model)] = {
                "brand": brand,
                "model": model,
                "brand_n": normalize_text(brand),
                "model_n": normalize_text(model),
                "storages": {normalize_storage(s) for s in storages.keys() if normalize_storage(s)},
            }
    signatures = sorted(models.values(), key=lambda x: len(x["model_n"]), reverse=True)
    return models, signatures


def parse_price(token):
    value = str(token or "").replace("\xa0", " ").strip().replace(" ", "")
    if not value:
        return None
    if "," in value:
        value = value.replace(".", "").replace(",", ".")
    elif "." in value:
        parts = value.split(".")
        if len(parts) > 1 and all(len(p) == 3 for p in parts[1:]):
            value = "".join(parts)
    try:
        return float(value)
    except ValueError:
        return None


def extract_prices(text):
    values = []
    for match in PRICE_RE.finditer(str(text or "")):
        price = parse_price(match.group(1))
        if price is not None and 500 <= price <= 500000:
            values.append(price)
    return values


def storage_candidates(text):
    values = []
    for match in STORAGE_RE.finditer(str(text or "")):
        normalized = normalize_storage(f"{match.group(1)} {match.group(2)}")
        if normalized:
            values.append(normalized)
    return values


def model_matches(text, signatures):
    normalized = " " + normalize_text(text) + " "
    found = []
    for item in signatures:
        model_n = item["model_n"]
        if not model_n or (" " + model_n + " ") not in normalized:
            continue
        generic = model_n.isdigit() or len(model_n) <= 4
        if generic and (" " + item["brand_n"] + " ") not in normalized:
            continue
        found.append(item)
    return found


def exact_model_for_text(text, signatures):
    found = model_matches(text, signatures)
    return found[0] if found else None


def extract_jsonld_products(raw_html):
    out = []
    pattern = re.compile(
        r"<script[^>]*type=[\"']application/ld\+json[\"'][^>]*>(.*?)</script>",
        re.IGNORECASE | re.DOTALL,
    )

    def walk(node):
        if isinstance(node, list):
            for item in node:
                walk(item)
            return
        if not isinstance(node, dict):
            return
        node_type = node.get("@type")
        types = set(node_type if isinstance(node_type, list) else [node_type])
        if "Product" in types:
            offers = node.get("offers")
            offer_list = offers if isinstance(offers, list) else [offers]
            prices = []
            urls = []
            for offer in offer_list:
                if not isinstance(offer, dict):
                    continue
                raw_price = offer.get("price") or offer.get("lowPrice") or offer.get("highPrice")
                if raw_price is not None:
                    try:
                        token = str(raw_price)
                        price = float(token.replace(".", "").replace(",", ".")) if "," in token else float(token)
                        if 500 <= price <= 500000:
                            prices.append(price)
                    except (TypeError, ValueError):
                        pass
                if offer.get("url"):
                    urls.append(str(offer["url"]))
            out.append({
                "name": node.get("name"),
                "url": node.get("url") or (urls[0] if urls else None),
                "prices": prices,
            })
        for value in node.values():
            if isinstance(value, (dict, list)):
                walk(value)

    for match in pattern.finditer(raw_html):
        body = html.unescape(match.group(1)).strip()
        try:
            payload = json.loads(body)
        except Exception:
            continue
        walk(payload)
    return out


def make_observation(source_id, source_cfg, model, storage, price, source_url, item_token, observed_at):
    stable = "|".join([source_id, source_url or "", str(item_token), model["brand"], model["model"], storage, str(price)])
    source_item_id = hashlib.sha256(stable.encode("utf-8")).hexdigest()[:24]
    return {
        "source_id": source_id,
        "source_item_id": source_item_id,
        "source_url": source_url,
        "source_role": source_cfg["role"],
        "observation_type": source_cfg["observation_type"],
        "category": "phone",
        "brand": model["brand"],
        "model": model["model"],
        "storage": storage,
        "price": int(round(price)),
        "observed_at": observed_at,
    }


def observations_from_jsonld(source_id, source_cfg, raw_html, page_url, signatures, observed_at):
    out = []
    for index, product in enumerate(extract_jsonld_products(raw_html)):
        name = str(product.get("name") or "")
        model = exact_model_for_text(name, signatures)
        if not model:
            continue
        storages = [s for s in storage_candidates(name) if s in model["storages"]]
        if not storages:
            continue
        prices = [p for p in product.get("prices", []) if 500 <= p <= 500000]
        if not prices:
            continue
        out.append(make_observation(
            source_id,
            source_cfg,
            model,
            storages[0],
            max(prices),
            product.get("url") or page_url,
            f"jsonld:{index}",
            observed_at,
        ))
    return out


def observations_from_text(source_id, source_cfg, raw_html, page_url, signatures, observed_at):
    parser = TextCollector()
    try:
        parser.feed(raw_html)
    except Exception:
        pass
    lines = parser.lines()
    out = []
    for i, line in enumerate(lines):
        direct = exact_model_for_text(line, signatures)
        if not direct:
            continue
        start = max(0, i - 2)
        end = min(len(lines), i + 7)
        chunk = " ".join(lines[start:end])
        candidates = model_matches(chunk, signatures)
        model = direct
        if candidates and len(candidates[0]["model_n"]) > len(model["model_n"]):
            model = candidates[0]
        storages = [s for s in storage_candidates(chunk) if s in model["storages"]]
        if not storages:
            continue

        priced_lines = []
        for j in range(start, end):
            values = extract_prices(lines[j])
            if values:
                priced_lines.append((abs(j - i), j, max(values)))
        if not priced_lines:
            continue
        priced_lines.sort(key=lambda row: (row[0], -row[2]))
        nearest_distance = priced_lines[0][0]
        nearest = [row for row in priced_lines if row[0] == nearest_distance]
        price = max(row[2] for row in nearest)

        out.append(make_observation(
            source_id,
            source_cfg,
            model,
            storages[0],
            price,
            page_url,
            f"text:{i}",
            observed_at,
        ))
    return out


def dedupe_observations(observations, max_items):
    out = []
    seen = set()
    for obs in observations:
        signature = (
            obs["source_id"], obs["brand"], obs["model"], obs["storage"], obs["price"], obs.get("source_url")
        )
        if signature in seen:
            continue
        seen.add(signature)
        out.append(obs)
        if len(out) >= max_items:
            break
    return out


def fetch_text(url, request_cfg):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": request_cfg["user_agent"],
            "Accept": "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
            "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.6",
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
        robots_text, _ = fetch_text(robots_url, request_cfg)
    except Exception as exc:
        return False, f"robots_unavailable:{type(exc).__name__}"
    parser = urllib.robotparser.RobotFileParser()
    parser.set_url(robots_url)
    parser.parse(robots_text.splitlines())
    if not parser.can_fetch(request_cfg["user_agent"], url):
        return False, "robots_disallow"
    return True, None


def main():
    cfg = load_json(CONFIG_PATH)
    if cfg.get("mode") != "dry-run":
        raise SystemExit("Guvenlik: Faz 3 harici kaynak toplayici sadece dry-run modunda calisir.")

    request_cfg = cfg["request"]
    _, signatures = flatten_models(extract_phone_prices())
    observed_at = dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

    all_observations = []
    source_reports = []
    enabled_sources = [(sid, scfg) for sid, scfg in cfg["sources"].items() if scfg.get("enabled")]

    for source_index, (source_id, source_cfg) in enumerate(enabled_sources):
        source_obs = []
        source_report = {
            "source_id": source_id,
            "label": source_cfg.get("label"),
            "role": source_cfg.get("role"),
            "urls": [],
            "observations": 0,
            "status": "ok",
        }
        for url_index, url in enumerate(source_cfg.get("urls", [])):
            url_report = {"url": url, "status": "pending", "http_status": None, "observations": 0}
            try:
                if cfg.get("respect_robots_txt", True):
                    allowed, reason = robots_allowed(url, request_cfg)
                    if not allowed:
                        url_report["status"] = reason
                        source_report["urls"].append(url_report)
                        continue

                raw_html, status = fetch_text(url, request_cfg)
                url_report["http_status"] = status
                extracted = observations_from_jsonld(source_id, source_cfg, raw_html, url, signatures, observed_at)
                extracted += observations_from_text(source_id, source_cfg, raw_html, url, signatures, observed_at)
                extracted = dedupe_observations(extracted, int(source_cfg["max_observations"]))
                source_obs.extend(extracted)
                source_obs = dedupe_observations(source_obs, int(source_cfg["max_observations"]))
                url_report["observations"] = len(extracted)
                url_report["status"] = "ok"
            except Exception as exc:
                url_report["status"] = f"fetch_error:{type(exc).__name__}"
                url_report["error"] = str(exc)[:300]
            source_report["urls"].append(url_report)
            if url_index + 1 < len(source_cfg.get("urls", [])):
                time.sleep(float(request_cfg.get("delay_between_requests_seconds", 1.5)))

        source_report["observations"] = len(source_obs)
        if not source_obs:
            statuses = {row["status"] for row in source_report["urls"]}
            source_report["status"] = "no_observations" if statuses == {"ok"} else ",".join(sorted(statuses))
        all_observations.extend(source_obs)
        source_reports.append(source_report)
        if source_index + 1 < len(enabled_sources):
            time.sleep(float(request_cfg.get("delay_between_requests_seconds", 1.5)))

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "phase": 3,
        "mode": "dry-run",
        "generated_at_utc": observed_at,
        "observations": all_observations,
    }
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    counts = defaultdict(int)
    for obs in all_observations:
        counts[obs["source_id"]] += 1

    report = {
        "phase": 3,
        "mode": "dry-run",
        "generated_at_utc": observed_at,
        "safety": {
            "live_price_mutation": False,
            "supabase_mutation": False,
            "login_or_captcha_bypass": False,
            "robots_txt_respected": bool(cfg.get("respect_robots_txt", True)),
        },
        "summary": {
            "enabled_sources": len(enabled_sources),
            "observations": len(all_observations),
            "by_source": dict(sorted(counts.items())),
        },
        "sources": source_reports,
    }

    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    json_path = REPORT_DIR / "external-sources-latest.json"
    md_path = REPORT_DIR / "external-sources-latest.md"
    json_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    md = [
        "# KaçaGider Faz 3 — Harici Piyasa Kaynakları",
        "",
        "- Mod: **dry-run / canlı fiyat yazımı kapalı**",
        f"- Etkin kaynak: **{len(enabled_sources)}**",
        f"- Toplanan gözlem: **{len(all_observations)}**",
        "- `robots.txt` kuralları uygulanır; giriş/captcha aşılmaz.",
        "",
        "## Kaynak durumu",
        "",
    ]
    for source in source_reports:
        md.append(
            f"- **{source['source_id']}** · rol `{source['role']}` · "
            f"{source['observations']} gözlem · durum `{source['status']}`"
        )
        for row in source["urls"]:
            md.append(f"  - {row['status']} · {row.get('observations', 0)} gözlem · {row['url']}")
    md_path.write_text("\n".join(md) + "\n", encoding="utf-8")

    print(json.dumps(report["summary"], ensure_ascii=False, indent=2))
    print(f"Runtime input: {OUTPUT_PATH.relative_to(ROOT)}")
    print(f"Rapor: {md_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
