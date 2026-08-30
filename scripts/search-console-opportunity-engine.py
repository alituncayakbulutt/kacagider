#!/usr/bin/env python3
from __future__ import annotations

import csv
import datetime as dt
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INPUT_DIR = ROOT / "data" / "search-console"
REPORT_DIR = ROOT / "reports"
TODAY = dt.datetime.now(dt.timezone.utc).date().isoformat()

ALIASES = {
    "query": {"query", "sorgu", "top queries", "search query"},
    "page": {"page", "sayfa", "landing page", "url"},
    "clicks": {"clicks", "tıklamalar", "tiklamalar"},
    "impressions": {"impressions", "gösterimler", "gosterimler"},
    "ctr": {"ctr", "tıklama oranı", "tiklama orani"},
    "position": {"position", "konum", "average position", "ortalama konum"},
}


def norm(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip().lower())


def map_headers(fieldnames):
    mapped = {}
    for source in fieldnames or []:
        n = norm(source)
        for target, names in ALIASES.items():
            if n in names:
                mapped[target] = source
                break
    return mapped


def number(value, percent=False):
    text = str(value or "").strip().replace("\u00a0", "")
    if not text:
        return 0.0
    if percent or text.endswith("%"):
        text = text.rstrip("%").replace(",", ".")
        try:
            return float(text) / 100.0
        except ValueError:
            return 0.0
    text = text.replace(".", "").replace(",", ".") if text.count(",") == 1 and text.count(".") >= 1 else text.replace(",", ".")
    try:
        return float(text)
    except ValueError:
        return 0.0


def score(row):
    impressions = max(row["impressions"], 0)
    ctr = min(max(row["ctr"], 0), 1)
    position = row["position"]
    if impressions < 20 or position <= 0:
        return 0
    if position <= 3:
        position_factor = 0.55
    elif position <= 10:
        position_factor = 1.0
    elif position <= 20:
        position_factor = 0.9
    else:
        position_factor = 0.35
    ctr_gap = max(0.03, 0.12 - ctr)
    return impressions * ctr_gap * position_factor / math.sqrt(max(position, 1))


def read_rows():
    rows = []
    for path in sorted(INPUT_DIR.glob("*.csv")):
        with path.open("r", encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f)
            headers = map_headers(reader.fieldnames)
            required = {"query", "clicks", "impressions", "ctr", "position"}
            if not required.issubset(headers):
                continue
            for raw in reader:
                row = {
                    "source": path.name,
                    "query": str(raw.get(headers["query"], "")).strip(),
                    "page": str(raw.get(headers.get("page", ""), "")).strip() if headers.get("page") else "",
                    "clicks": number(raw.get(headers["clicks"])),
                    "impressions": number(raw.get(headers["impressions"])),
                    "ctr": number(raw.get(headers["ctr"]), percent=True),
                    "position": number(raw.get(headers["position"])),
                }
                row["opportunity_score"] = round(score(row), 2)
                if row["query"] and row["opportunity_score"] > 0:
                    rows.append(row)
    return rows


def classify(row):
    p = row["position"]
    ctr = row["ctr"]
    if p <= 10 and ctr < 0.05:
        return "CTR iyileştirme"
    if 10 < p <= 20:
        return "İlk sayfaya taşıma"
    if p <= 5 and row["impressions"] >= 100:
        return "Snippet/intent savunma"
    return "İçerik ve iç link fırsatı"


def main():
    INPUT_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    rows = sorted(read_rows(), key=lambda r: (-r["opportunity_score"], -r["impressions"]))[:100]
    for row in rows:
        row["action"] = classify(row)

    (REPORT_DIR / "search-console-opportunities.json").write_text(
        json.dumps({"generated_on": TODAY, "input_directory": "data/search-console/", "opportunity_count": len(rows), "opportunities": rows}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    md = ["# Search Console Fırsat Motoru", "", f"Tarih: {TODAY}", ""]
    if not rows:
        md += [
            "Henüz işlenecek Search Console CSV dışa aktarımı bulunamadı.",
            "",
            "CSV dosyalarını `data/search-console/` klasörüne eklediğinizde motor Query/Sorgu, Page/Sayfa, Clicks/Tıklamalar, Impressions/Gösterimler, CTR ve Position/Konum sütunlarını otomatik tanır.",
            "",
            "Motor hiçbir sayfayı körlemesine değiştirmez; önce yüksek gösterim + düşük CTR ve 4–20 sıra aralığındaki fırsatları puanlayıp raporlar.",
        ]
    else:
        md += [
            f"Toplam {len(rows)} öncelikli fırsat bulundu.",
            "",
            "| # | Sorgu | Sayfa | Gösterim | CTR | Konum | Aksiyon | Skor |",
            "|---:|---|---|---:|---:|---:|---|---:|",
        ]
        for i, row in enumerate(rows[:50], 1):
            query = row["query"].replace("|", "\\|")
            page = row["page"].replace("|", "\\|")
            md.append(f"| {i} | {query} | {page} | {int(row['impressions'])} | {row['ctr']:.1%} | {row['position']:.1f} | {row['action']} | {row['opportunity_score']:.2f} |")
    (REPORT_DIR / "search-console-opportunities.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    print(f"Search Console fırsat motoru: {len(rows)} fırsat")


if __name__ == "__main__":
    main()
