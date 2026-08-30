from __future__ import annotations

import json
import subprocess
from collections import Counter
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEVICE_ROOTS = ("telefon", "tablet", "bilgisayar", "akilli-saat", "oyun-konsolu")
SERIES_PAGE_TYPE = "series_hub"
REPORT = ROOT / "SEO_BRAND_SERIES_HUBS_PREVIEW.md"


def read_meta(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return {}
    end = text.find("\n---\n", 4)
    if end == -1:
        return {}
    out = {}
    for line in text[4:end].splitlines():
        if ": " not in line:
            continue
        key, raw = line.split(": ", 1)
        try:
            out[key] = json.loads(raw)
        except json.JSONDecodeError:
            out[key] = raw.strip('"')
    return out


def git(*args: str) -> str:
    try:
        return subprocess.check_output(["git", *args], cwd=ROOT, text=True).strip()
    except Exception:
        return "unknown"


def main():
    brands = Counter()
    series = Counter()
    models = Counter()
    series_rows = []
    linked_models = 0

    for category in DEVICE_ROOTS:
        base = ROOT / category
        if not base.exists():
            continue
        for brand_dir in sorted(p for p in base.iterdir() if p.is_dir()):
            if (brand_dir / "index.md").exists():
                brands[category] += 1
        for path in sorted(base.glob("*/*/index.md")):
            meta = read_meta(path)
            if meta.get("seo_page_type") == SERIES_PAGE_TYPE:
                series[category] += 1
                links = meta.get("seo_links") if isinstance(meta.get("seo_links"), list) else []
                crumbs = meta.get("seo_breadcrumbs") if isinstance(meta.get("seo_breadcrumbs"), list) else []
                brand = crumbs[-2].get("label", path.parts[-3]) if len(crumbs) >= 4 else path.parts[-3]
                label = crumbs[-1].get("label", path.parent.name) if crumbs else path.parent.name
                series_rows.append((category, brand, label, len(links), str(meta.get("seo_canonical", ""))))
            else:
                models[category] += 1
                links = meta.get("seo_links") if isinstance(meta.get("seo_links"), list) else []
                if any(isinstance(link, dict) and link.get("kg_series_link") == "brand-series-v1" for link in links):
                    linked_models += 1

    base = git("merge-base", "HEAD", "origin/main")
    head = git("rev-parse", "HEAD")
    total_brands = sum(brands.values())
    total_series = sum(series.values())
    total_models = sum(models.values())

    lines = [
        "# KaçaGider — SEO Program 3: Brand + Series Hubs Preview",
        "",
        f"Generated: {date.today().isoformat()}",
        f"Branch: `seo-brand-series-hubs-preview`",
        f"Base merge point: `main` @ `{base}`",
        f"Preview HEAD when report was generated: `{head}`",
        "",
        "## Goal",
        "",
        "Strengthen existing canonical brand hubs and create only qualified series hubs that group real KaçaGider model pages. No duplicate query-specific model URLs are created.",
        "",
        "Target search families include brand/series variations of:",
        "",
        "- `ikinci el fiyatları`",
        "- `piyasa değeri`",
        "- `ne kadar eder`",
        "- `kaça satılır`",
        "- `değer hesaplama / satış öncesi değer kontrolü`",
        "",
        "## Coverage",
        "",
        "| Category | Brand hubs enriched | Qualified series hubs | Real model pages preserved |",
        "| --- | ---: | ---: | ---: |",
    ]
    for category in DEVICE_ROOTS:
        lines.append(f"| {category} | {brands[category]} | {series[category]} | {models[category]} |")
    lines.extend([
        f"| **Total** | **{total_brands}** | **{total_series}** | **{total_models}** |",
        "",
        f"Models receiving a model → series internal link: **{linked_models}**.",
        "",
        "A series hub is generated only when a curated series rule matches at least **3 real model pages**. This prevents one-product/thin series pages.",
        "",
        "## Qualified series hubs",
        "",
        "| Category | Brand | Series | Models | Canonical |",
        "| --- | --- | --- | ---: | --- |",
    ])
    for category, brand, label, count, canonical in sorted(series_rows):
        lines.append(f"| {category} | {brand} | {label} | {count} | `{canonical}` |")
    lines.extend([
        "",
        "## Brand hub enrichment",
        "",
        "Existing brand URLs, titles, H1s, canonicals and real model lists are preserved. The program adds three category-aware explanatory sections, three FAQs and internal guide links to qualified series hubs, the category hub and `/ucretsiz-ilan-ver/`.",
        "",
        "## Series hub structure",
        "",
        "Each series hub has its own canonical URL, real model links, breadcrumb hierarchy, natural `ne kadar eder / kaça satılır / ikinci el fiyatları / piyasa değeri` coverage, FAQs and links back to the brand hub and free-listing hub.",
        "",
        "## Safety boundaries",
        "",
        "- No new per-query doorway model URLs.",
        "- No invented device prices, review scores or market statistics.",
        "- No series page with fewer than 3 real models.",
        "- Existing valuation, marketplace, auth, Analytics and model canonical URLs are not changed.",
        "- Program 1 price-intent and Program 2 seller-intent content on real model pages is preserved; Program 3 only appends one series internal link to qualified models.",
        "",
        "## Live status",
        "",
        "**NOT LIVE.** This preview branch must not be fast-forwarded or merged into `main` without explicit user approval.",
        "",
    ])
    REPORT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {REPORT.name}: {total_brands} brands, {total_series} series, {total_models} real models, {linked_models} linked models")


if __name__ == "__main__":
    main()
