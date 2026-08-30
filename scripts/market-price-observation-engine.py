#!/usr/bin/env python3
from __future__ import annotations

import datetime as dt
import hashlib
import json
import math
import re
import statistics
import subprocess
import unicodedata
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "config" / "market-price-engine.json"
REPORT_DIR = ROOT / "reports" / "price-monitor"


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
    proc = subprocess.run(["node", "-e", code, str(js)], check=True, capture_output=True, text=True, cwd=ROOT)
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


def flatten_catalog(data):
    rows = {}
    by_model = defaultdict(list)
    for brand, models in (data or {}).items():
        if not isinstance(models, dict):
            continue
        for model, storages in models.items():
            if not isinstance(storages, dict):
                continue
            for storage, row in storages.items():
                if not isinstance(row, dict):
                    continue
                key = f"{brand}|{model}|{storage}"
                entry = {"key": key, "brand": brand, "model": model, "storage": str(storage), **row}
                rows[key] = entry
                by_model[(normalize_text(brand), normalize_text(model))].append(entry)
    return rows, by_model


def parse_time(value):
    if not value:
        return None
    text = str(value).strip().replace("Z", "+00:00")
    try:
        parsed = dt.datetime.fromisoformat(text)
    except ValueError:
        try:
            parsed = dt.datetime.combine(dt.date.fromisoformat(text[:10]), dt.time.min, tzinfo=dt.timezone.utc)
        except ValueError:
            return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=dt.timezone.utc)
    return parsed.astimezone(dt.timezone.utc)


def load_observations(pattern):
    observations = []
    files = sorted(ROOT.glob(pattern))
    for path in files:
        try:
            payload = load_json(path)
        except Exception as exc:
            observations.append({"__load_error__": f"{path.relative_to(ROOT)}: {exc}"})
            continue
        if isinstance(payload, list):
            items = payload
        elif isinstance(payload, dict) and isinstance(payload.get("observations"), list):
            items = payload["observations"]
        elif isinstance(payload, dict):
            items = [payload]
        else:
            items = []
        for item in items:
            if isinstance(item, dict):
                item = dict(item)
                item["__file__"] = str(path.relative_to(ROOT))
                observations.append(item)
    return observations, [str(p.relative_to(ROOT)) for p in files]


def observation_fingerprint(obs):
    stable = "|".join([
        str(obs.get("source_id") or ""), str(obs.get("source_item_id") or ""),
        str(obs.get("source_url") or ""), str(obs.get("brand") or ""),
        str(obs.get("model") or ""), str(obs.get("storage") or ""),
        str(obs.get("price") or ""), str(obs.get("observed_at") or "")
    ])
    return hashlib.sha256(stable.encode("utf-8")).hexdigest()


def match_catalog(obs, by_model):
    brand_n = normalize_text(obs.get("brand"))
    model_n = normalize_text(obs.get("model"))
    if brand_n and model_n.startswith(brand_n + " "):
        model_n = model_n[len(brand_n) + 1:]
    candidates = by_model.get((brand_n, model_n), [])
    if not candidates:
        return None, "model_not_found"
    storage_n = normalize_storage(obs.get("storage"))
    if storage_n:
        exact = [row for row in candidates if normalize_storage(row["storage"]) == storage_n]
        if len(exact) == 1:
            return exact[0], None
        return None, "storage_not_found"
    if len(candidates) == 1:
        return candidates[0], None
    return None, "storage_required"


def percentile(values, p):
    if not values:
        return None
    vals = sorted(values)
    if len(vals) == 1:
        return vals[0]
    pos = (len(vals) - 1) * p
    lo, hi = math.floor(pos), math.ceil(pos)
    if lo == hi:
        return vals[lo]
    return vals[lo] + (vals[hi] - vals[lo]) * (pos - lo)


def filter_outliers(items, multiplier):
    if len(items) < 4:
        return items, []
    prices = sorted(float(x["price"]) for x in items)
    q1, q3 = percentile(prices, 0.25), percentile(prices, 0.75)
    iqr = q3 - q1
    if iqr <= 0:
        return items, []
    low, high = q1 - multiplier * iqr, q3 + multiplier * iqr
    kept = [x for x in items if low <= float(x["price"]) <= high]
    removed = [x for x in items if x not in kept]
    return kept, removed


def weighted_quantile(items, q):
    rows = sorted((float(x["price"]), float(x["weight"])) for x in items)
    total = sum(w for _, w in rows)
    if not rows or total <= 0:
        return None
    threshold = total * q
    running = 0.0
    for price, weight in rows:
        running += weight
        if running >= threshold:
            return price
    return rows[-1][0]


def round_price(value, step):
    if value is None:
        return None
    step = max(1, int(step))
    return int(round(float(value) / step) * step)


def confidence_score(items, source_count, now):
    n = len(items)
    obs_score = min(40, n * 5)
    source_score = min(30, source_count * 10)
    ages = [max(0.0, (now - x["observed_at_dt"]).total_seconds() / 86400.0) for x in items]
    avg_age = statistics.fmean(ages) if ages else 999
    recency_score = 15 if avg_age <= 7 else 10 if avg_age <= 14 else 5 if avg_age <= 21 else 0
    prices = [float(x["price"]) for x in items]
    med = statistics.median(prices) if prices else 0
    spread = ((max(prices) - min(prices)) / med) if med else 999
    dispersion_score = 15 if spread <= 0.10 else 10 if spread <= 0.20 else 5 if spread <= 0.30 else 0
    return min(100, int(round(obs_score + source_score + recency_score + dispersion_score)))


def classify(change_abs, thresholds, confidence, review_below):
    if confidence < review_below:
        return "review"
    if change_abs <= thresholds["normal"]:
        return "normal"
    if change_abs <= thresholds["verify"]:
        return "verify"
    if change_abs <= thresholds["review"]:
        return "review"
    return "hold"


def main():
    cfg = load_json(CONFIG_PATH)
    safety = cfg.get("safety", {})
    if cfg.get("mode") != "dry-run" or any(safety.get(k) for k in ("allow_live_price_write", "allow_supabase_write", "allow_git_commit")):
        raise SystemExit("Guvenlik: Faz 3 yalnizca dry-run ve yazma izinleri kapali iken calisabilir.")

    catalog, by_model = flatten_catalog(extract_phone_prices())
    observations, input_files = load_observations(cfg["observation_glob"])
    now = dt.datetime.now(dt.timezone.utc)
    agg = cfg["aggregation"]
    source_cfg = cfg["sources"]
    thresholds = cfg["change_thresholds_percent"]
    candidate_roles = set(agg.get("candidate_price_roles", []))

    accepted = []
    rejected = []
    seen = set()

    for raw in observations:
        if raw.get("__load_error__"):
            rejected.append({"reason": "load_error", "detail": raw["__load_error__"]})
            continue
        source_id = str(raw.get("source_id") or "").strip()
        source = source_cfg.get(source_id)
        if not source:
            rejected.append({"reason": "unknown_source", "source_id": source_id, "file": raw.get("__file__")})
            continue
        if not source.get("enabled"):
            rejected.append({"reason": "source_disabled", "source_id": source_id, "file": raw.get("__file__")})
            continue
        observed = parse_time(raw.get("observed_at"))
        if not observed:
            rejected.append({"reason": "invalid_observed_at", "file": raw.get("__file__")})
            continue
        age_days = (now - observed).total_seconds() / 86400.0
        if age_days < -1 or age_days > agg["maximum_observation_age_days"]:
            rejected.append({"reason": "stale_or_future", "source_id": source_id, "age_days": round(age_days, 1)})
            continue
        try:
            price = float(raw.get("price"))
        except (TypeError, ValueError):
            rejected.append({"reason": "invalid_price", "source_id": source_id})
            continue
        if not agg["minimum_price_tl"] <= price <= agg["maximum_price_tl"]:
            rejected.append({"reason": "price_out_of_bounds", "source_id": source_id, "price": price})
            continue
        match, reason = match_catalog(raw, by_model)
        if not match:
            rejected.append({"reason": reason, "source_id": source_id, "brand": raw.get("brand"), "model": raw.get("model"), "storage": raw.get("storage")})
            continue
        fp = observation_fingerprint(raw)
        if fp in seen:
            rejected.append({"reason": "duplicate", "source_id": source_id, "catalog_key": match["key"]})
            continue
        seen.add(fp)
        accepted.append({
            "catalog_key": match["key"],
            "source_id": source_id,
            "source_item_id": raw.get("source_item_id"),
            "observation_type": raw.get("observation_type"),
            "role": source.get("role") or raw.get("source_role") or "unknown",
            "price": price,
            "weight": float(source["weight"]),
            "observed_at": observed.isoformat(),
            "observed_at_dt": observed,
            "fingerprint": fp,
        })

    grouped = defaultdict(list)
    for item in accepted:
        grouped[item["catalog_key"]].append(item)

    candidates = []
    insufficient = []
    outlier_count = 0
    for key, items in sorted(grouped.items()):
        filtered, removed = filter_outliers(items, float(agg["outlier_iqr_multiplier"]))
        outlier_count += len(removed)
        sources = sorted({x["source_id"] for x in filtered})
        pricing_items = [x for x in filtered if x["role"] in candidate_roles]
        pricing_sources = sorted({x["source_id"] for x in pricing_items})
        anchor_items = [x for x in filtered if x["role"] not in candidate_roles]
        anchor_sources = sorted({x["source_id"] for x in anchor_items})

        reasons = []
        if len(filtered) < agg["minimum_observations"]:
            reasons.append("minimum_observations")
        if len(sources) < agg["minimum_independent_sources"]:
            reasons.append("minimum_independent_sources")
        if len(pricing_sources) < agg["minimum_peer_or_transaction_sources"]:
            reasons.append("minimum_peer_or_transaction_sources")
        if not pricing_items:
            reasons.append("no_candidate_price_role")
        if reasons:
            insufficient.append({
                "catalog_key": key,
                "observations": len(filtered),
                "sources": len(sources),
                "source_ids": sources,
                "pricing_observations": len(pricing_items),
                "pricing_sources": len(pricing_sources),
                "pricing_source_ids": pricing_sources,
                "anchor_sources": anchor_sources,
                "reasons": reasons,
            })
            continue

        current = catalog[key]
        candidate = round_price(weighted_quantile(pricing_items, 0.50), agg["round_to_tl"])
        quick = round_price(weighted_quantile(pricing_items, 0.25), agg["round_to_tl"])
        listing = round_price(weighted_quantile(pricing_items, 0.75), agg["round_to_tl"])
        retail_anchor = round_price(weighted_quantile(anchor_items, 0.50), agg["round_to_tl"]) if anchor_items else None
        current_price = float(current.get("estimated_price") or 0)
        change_pct = ((candidate - current_price) / current_price * 100.0) if current_price else 0.0
        confidence = confidence_score(pricing_items, len(pricing_sources), now)
        decision = classify(abs(change_pct), thresholds, confidence, cfg["confidence"]["review_below"])
        candidates.append({
            "catalog_key": key,
            "current_price": current.get("estimated_price"),
            "candidate_price": candidate,
            "quick_sale_candidate": quick,
            "listing_price_candidate": listing,
            "retail_anchor_price": retail_anchor,
            "change_percent": round(change_pct, 2),
            "observation_count": len(filtered),
            "source_count": len(sources),
            "source_ids": sources,
            "pricing_observation_count": len(pricing_items),
            "pricing_source_count": len(pricing_sources),
            "pricing_source_ids": pricing_sources,
            "anchor_source_count": len(anchor_sources),
            "anchor_source_ids": anchor_sources,
            "confidence_score": confidence,
            "decision": decision,
            "outliers_removed": len(removed),
        })

    candidates.sort(key=lambda x: abs(x["change_percent"]), reverse=True)
    decisions = {k: 0 for k in ("normal", "verify", "review", "hold")}
    for row in candidates:
        decisions[row["decision"]] += 1

    report = {
        "engine": "KaçaGider Market Observation Engine V3",
        "mode": "dry-run",
        "generated_at_utc": now.replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "safety": {"live_price_mutation": False, "supabase_mutation": False, "git_commit": False},
        "inputs": input_files,
        "summary": {
            "catalog_variants": len(catalog),
            "raw_observations": len(observations),
            "accepted_observations": len(accepted),
            "rejected_observations": len(rejected),
            "outliers_removed": outlier_count,
            "candidate_prices": len(candidates),
            "insufficient_groups": len(insufficient),
            "decisions": decisions,
        },
        "policy": {
            "minimum_observations": agg["minimum_observations"],
            "minimum_independent_sources": agg["minimum_independent_sources"],
            "minimum_peer_or_transaction_sources": agg["minimum_peer_or_transaction_sources"],
            "candidate_price_roles": sorted(candidate_roles),
            "maximum_observation_age_days": agg["maximum_observation_age_days"],
            "change_thresholds_percent": thresholds,
            "retail_anchors_do_not_set_candidate_price": True,
            "preserve_current_price_when_data_missing": True,
        },
        "candidates": candidates[:500],
        "insufficient": insufficient[:500],
        "rejections": rejected[:500],
    }

    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    json_path = REPORT_DIR / "market-candidates-latest.json"
    md_path = REPORT_DIR / "market-candidates-latest.md"
    json_path.write_text(json.dumps(report, ensure_ascii=False, indent=2, default=str) + "\n", encoding="utf-8")

    md = [
        "# KaçaGider Faz 3 — Piyasa Gözlem ve Aday Fiyat Raporu", "",
        "- Mod: **dry-run / canlı fiyat yazımı kapalı**",
        f"- Katalog varyantı: **{len(catalog)}**",
        f"- Ham gözlem: **{len(observations)}**",
        f"- Kabul edilen gözlem: **{len(accepted)}**",
        f"- Reddedilen gözlem: **{len(rejected)}**",
        f"- Uç değer olarak çıkarılan: **{outlier_count}**",
        f"- Aday fiyat üretilebilen varyant: **{len(candidates)}**",
        f"- Veri yetersiz grup: **{len(insufficient)}**", "",
        "## Güvenlik", "",
        "En az 5 geçerli gözlem, 3 bağımsız kaynak ve en az 2 kullanıcı piyasası/doğrulanmış işlem kaynağı olmadan aday fiyat üretilmez. Yenilenmiş/perakende kaynaklar yalnızca piyasa çıpasıdır ve aday fiyatı doğrudan belirlemez. Faz 3 canlı `phone-prices.js` dosyasına veya Supabase fiyat alanlarına yazmaz.",
    ]
    if candidates:
        md += ["", "## En büyük aday değişimleri", ""]
        for row in candidates[:25]:
            anchor = f" · perakende çıpası {row['retail_anchor_price']} TL" if row.get("retail_anchor_price") else ""
            md.append(
                f"- `{row['catalog_key']}`: {row['current_price']} → {row['candidate_price']} TL "
                f"({row['change_percent']:+.2f}%) · piyasa kaynağı {row['pricing_source_count']} · "
                f"güven {row['confidence_score']}/100 · **{row['decision']}**{anchor}"
            )
    md_path.write_text("\n".join(md) + "\n", encoding="utf-8")

    print(json.dumps(report["summary"], ensure_ascii=False, indent=2))
    print(f"Rapor: {md_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
