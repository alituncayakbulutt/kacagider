#!/usr/bin/env python3
from __future__ import annotations

import datetime as dt
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "config" / "weekly-price-monitor.json"
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
const out = vm.runInContext('JSON.stringify(PHONE_PRICE_DATA)', sandbox);
process.stdout.write(out);
'''
    proc = subprocess.run(
        ["node", "-e", code, str(js)],
        check=True,
        capture_output=True,
        text=True,
        cwd=ROOT,
    )
    return json.loads(proc.stdout)


def flatten(data):
    out = {}
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
                out[key] = {"brand": brand, "model": model, "storage": str(storage), **row}
    return out


def latest_snapshot():
    manifest_path = ROOT / "data" / "price-history" / "index.json"
    if not manifest_path.exists():
        return None, {}
    manifest = load_json(manifest_path)
    latest = manifest.get("latest_snapshot")
    if not latest:
        return None, {}
    snapshot_path = ROOT / "data" / "price-history" / f"{latest}.json"
    if not snapshot_path.exists():
        return latest, {}
    payload = load_json(snapshot_path)
    return latest, flatten(payload.get("data", {}))


def parse_date(value):
    if not value:
        return None
    try:
        return dt.date.fromisoformat(str(value)[:10])
    except ValueError:
        return None


def pct_change(old, new):
    try:
        old = float(old)
        new = float(new)
    except (TypeError, ValueError):
        return None
    if old == 0:
        return None
    return (new - old) / old * 100.0


def classify_change(abs_pct, thresholds):
    if abs_pct is None:
        return "unknown"
    if abs_pct <= thresholds["normal"]:
        return "normal"
    if abs_pct <= thresholds["verify"]:
        return "verify"
    if abs_pct <= thresholds["review"]:
        return "review"
    return "hold"


def main():
    config = load_json(CONFIG_PATH)
    if config.get("mode") != "dry-run":
        raise SystemExit("Guvenlik: Faz 1 yalnizca dry-run modunda calisabilir.")
    safety = config.get("safety", {})
    if safety.get("allow_live_price_write") or safety.get("allow_supabase_write") or safety.get("allow_git_commit"):
        raise SystemExit("Guvenlik: dry-run yazma izinleri kapali olmali.")

    today = dt.datetime.now(dt.timezone.utc).date()
    current = flatten(extract_phone_prices())
    snapshot_date, previous = latest_snapshot()
    confidence_cfg = config["confidence"]
    freshness_cfg = config["freshness_days"]
    thresholds = config["change_thresholds_percent"]

    brands = {}
    low_confidence = []
    missing_updated_at = []
    stale_watch = []
    stale_review = []
    stale_critical = []
    changes = []

    for key, row in current.items():
        brand = row["brand"]
        brands[brand] = brands.get(brand, 0) + 1
        confidence = row.get("confidence_score")
        try:
            confidence_num = float(confidence)
        except (TypeError, ValueError):
            confidence_num = None
        if confidence_num is None or confidence_num < confidence_cfg["low_below"]:
            low_confidence.append({"key": key, "confidence_score": confidence, "observation_count": row.get("observation_count")})

        updated = parse_date(row.get("updated_at"))
        if not updated:
            missing_updated_at.append(key)
        else:
            age = (today - updated).days
            item = {"key": key, "age_days": age, "updated_at": updated.isoformat()}
            if age > freshness_cfg["critical_after"]:
                stale_critical.append(item)
            elif age > freshness_cfg["review_after"]:
                stale_review.append(item)
            elif age > freshness_cfg["watch_after"]:
                stale_watch.append(item)

        old = previous.get(key)
        if old:
            change = pct_change(old.get("estimated_price"), row.get("estimated_price"))
            if change is not None:
                changes.append({
                    "key": key,
                    "old_estimated_price": old.get("estimated_price"),
                    "current_estimated_price": row.get("estimated_price"),
                    "change_percent": round(change, 2),
                    "classification": classify_change(abs(change), thresholds),
                })

    changes.sort(key=lambda x: abs(x["change_percent"]), reverse=True)
    low_confidence.sort(key=lambda x: (x["confidence_score"] is not None, x["confidence_score"] or -1))
    stale_watch.sort(key=lambda x: x["age_days"], reverse=True)
    stale_review.sort(key=lambda x: x["age_days"], reverse=True)
    stale_critical.sort(key=lambda x: x["age_days"], reverse=True)

    change_counts = {"normal": 0, "verify": 0, "review": 0, "hold": 0, "unknown": 0}
    for item in changes:
        change_counts[item["classification"]] += 1

    report = {
        "engine": "KaçaGider Weekly Price Monitor V1",
        "mode": "dry-run",
        "generated_at_utc": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "source_catalog": config["source_catalog"],
        "comparison_snapshot": snapshot_date,
        "safety": {"live_price_mutation": False, "supabase_mutation": False, "git_commit": False},
        "summary": {
            "total_variants": len(current),
            "brands": brands,
            "low_confidence": len(low_confidence),
            "missing_updated_at": len(missing_updated_at),
            "stale_watch": len(stale_watch),
            "stale_review": len(stale_review),
            "stale_critical": len(stale_critical),
            "compared_variants": len(changes),
            "change_classifications": change_counts,
        },
        "policy": {
            "change_thresholds_percent": thresholds,
            "freshness_days": freshness_cfg,
            "confidence": confidence_cfg,
            "preserve_current_price_when_data_missing": True,
        },
        "top_changes": changes[:100],
        "low_confidence_items": low_confidence[:100],
        "stale_critical_items": stale_critical[:100],
        "stale_review_items": stale_review[:100],
        "stale_watch_items": stale_watch[:100],
        "missing_updated_at_items": missing_updated_at[:100],
        "next_phase": "Faz 2'de piyasa kaynaklari sadece gozlem verisi olarak baglanacak; guvenlik esiklerinden gecmeyen fiyatlar canliya yazilmayacak.",
    }

    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    json_path = REPORT_DIR / "weekly-latest.json"
    md_path = REPORT_DIR / "weekly-latest.md"
    json_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    md = [
        "# KaçaGider Haftalık Fiyat İzleme Raporu",
        "",
        "- Mod: **dry-run / sadece okuma**",
        f"- Toplam varyant: **{len(current)}**",
        f"- Karşılaştırılan snapshot: **{snapshot_date or 'yok'}**",
        f"- Düşük güven skorlu kayıt: **{len(low_confidence)}**",
        f"- `updated_at` eksik kayıt: **{len(missing_updated_at)}**",
        f"- 14+ gün izlenecek: **{len(stale_watch)}**",
        f"- 28+ gün inceleme: **{len(stale_review)}**",
        f"- 60+ gün kritik: **{len(stale_critical)}**",
        "",
        "## Fiyat değişimi sınıfları",
        "",
        f"- Normal (≤ %{thresholds['normal']}): **{change_counts['normal']}**",
        f"- Doğrulama (≤ %{thresholds['verify']}): **{change_counts['verify']}**",
        f"- İnceleme (≤ %{thresholds['review']}): **{change_counts['review']}**",
        f"- Durdur (> %{thresholds['review']}): **{change_counts['hold']}**",
        "",
        "## Güvenlik",
        "",
        "Bu çalışma `data/phone-prices.js`, Supabase veya canlı site dosyalarına yazmaz. Yeni piyasa verisi bulunamadığında mevcut fiyat korunur.",
    ]
    if changes:
        md += ["", "## En büyük değişimler", ""]
        for item in changes[:20]:
            md.append(f"- `{item['key']}`: {item['old_estimated_price']} → {item['current_estimated_price']} TL ({item['change_percent']:+.2f}%) — **{item['classification']}**")
    md_path.write_text("\n".join(md) + "\n", encoding="utf-8")

    print(json.dumps(report["summary"], ensure_ascii=False, indent=2))
    print(f"Rapor: {md_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
