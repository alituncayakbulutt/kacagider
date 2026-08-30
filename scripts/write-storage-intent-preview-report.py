from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEVICE_ROOTS = ("telefon", "tablet", "bilgisayar", "akilli-saat", "oyun-konsolu")
CLUSTER_MARKER = "storage-intent-v1"
STORAGE_RE = re.compile(r"^\d+(?:gb|tb)$", re.I)
REPORT = ROOT / "SEO_STORAGE_INTENT_PREVIEW_REPORT.md"


def read_meta(path: Path):
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return {}
    end = text.find("\n---\n", 4)
    if end == -1:
        return {}
    meta = {}
    for line in text[4:end].splitlines():
        if ": " not in line:
            continue
        key, raw = line.split(": ", 1)
        try:
            meta[key] = json.loads(raw)
        except json.JSONDecodeError:
            meta[key] = raw.strip('"')
    return meta


def main():
    rows = []
    model_counts = Counter()
    capacity_counts = Counter()
    category_counts = Counter()

    for root_name in DEVICE_ROOTS:
        base = ROOT / root_name
        if not base.exists():
            continue
        for path in sorted(base.glob("*/*/*/index.md")):
            rel = path.relative_to(ROOT)
            if not STORAGE_RE.fullmatch(rel.parts[-2]):
                continue
            meta = read_meta(path)
            if not meta:
                continue
            crumbs = meta.get("seo_breadcrumbs")
            if not isinstance(crumbs, list) or len(crumbs) != 5:
                continue
            sections = meta.get("seo_sections") or []
            if not any(isinstance(s, dict) and s.get("kg_intent_cluster") == CLUSTER_MARKER for s in sections):
                continue
            category_counts[root_name] += 1
            model_counts["/".join(rel.parts[:3])] += 1
            capacity_counts[str(crumbs[-1].get("label", rel.parts[-2]))] += 1
            rows.append((str(rel), str(meta.get("seo_canonical", ""))))

    lines = [
        "# SEO 4 — Hafıza / Kapasite Arama Niyeti Önizleme Raporu",
        "",
        "Bu çalışma yalnızca katalogda zaten bulunan gerçek hafıza/kapasite URL'lerini güçlendirir. Yeni veya katalog dışı kapasite sayfası üretmez.",
        "",
        f"- Güçlendirilen gerçek varyant sayfası: **{len(rows)}**",
        f"- Varyantı bulunan model sayısı: **{len(model_counts)}**",
        "- Yeni sorgu kümesi: **storage-intent-v1**",
        "- Model başına/kapasite başına hedeflenen ek arama niyeti: en fazla **6**",
        "",
        "## Kategori dağılımı",
        "",
        "| Kategori | Gerçek varyant sayfası |",
        "|---|---:|",
    ]
    for category in DEVICE_ROOTS:
        lines.append(f"| {category} | {category_counts[category]} |")

    lines.extend([
        "",
        "## Hedeflenen ek sorgular",
        "",
        "- `[MARKA] [MODEL] [KAPASİTE] kaç para eder`",
        "- `[MARKA] [MODEL] [KAPASİTE] kaça satarım`",
        "- `[MARKA] [MODEL] [KAPASİTE] kaça satabilirim`",
        "- `[MARKA] [MODEL] [KAPASİTE] satsam ne kadar eder`",
        "- `[MARKA] [MODEL] [KAPASİTE] ikinci el fiyatları ne kadar`",
        "- `[MARKA] [MODEL] [KAPASİTE] güncel ikinci el fiyatı ne kadar`",
        "",
        "Mevcut `ne kadar eder`, `kaça satılır`, `piyasa değeri` ve `ikinci el fiyatı` ifadeleri tekrar eklenmez; generator görünür içeriği tarayıp yalnızca eksik niyetleri ekler.",
        "",
        "## En yaygın kapasite etiketleri",
        "",
    ])
    for capacity, count in capacity_counts.most_common(20):
        lines.append(f"- **{capacity}:** {count} sayfa")

    lines.extend([
        "",
        "## Güvenlik kuralları",
        "",
        "- Yalnızca `category/brand/model/NNgb|NNtb/index.md` biçimindeki mevcut gerçek varyant sayfaları işlenir.",
        "- Parent model sayfası olmayan varyant işlenmez.",
        "- Canonical URL değiştirilmez.",
        "- Title, H1, breadcrumb, mevcut temel SEO bölümleri ve fiyat/değerleme akışı korunur.",
        "- Seri/marka merkezleri ile SEO 1 ve SEO 2 sorgu katmanları korunur.",
        "- Canlı `main` dalına otomatik geçiş yapılmaz.",
        "",
        "## Örnek sayfalar",
        "",
    ])
    for rel, canonical in rows[:20]:
        lines.append(f"- `{rel}` — `{canonical}`")

    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Preview report written: {REPORT.name} ({len(rows)} storage pages)")


if __name__ == "__main__":
    main()
