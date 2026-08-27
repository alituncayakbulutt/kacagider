from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
DEVICE_ROOTS = ("telefon", "tablet", "bilgisayar", "akilli-saat", "oyun-konsolu")
TITLE_LIMIT = 75
DESCRIPTION_LIMIT = 180

FIELD_RE = re.compile(r'^(seo_title|seo_description|seo_h1):\s*"(.*)"\s*$', re.MULTILINE)


def fields(text: str):
    return {m.group(1): m.group(2) for m in FIELD_RE.finditer(text)}


def replace_field(text: str, key: str, value: str) -> str:
    value = value.replace('"', "'")
    return re.sub(
        rf'^{re.escape(key)}:\s*".*"\s*$',
        f'{key}: "{value}"',
        text,
        count=1,
        flags=re.MULTILINE,
    )


def compact_title(title: str) -> str:
    if len(title) <= TITLE_LIMIT:
        return title

    candidate = title.replace(" Güncel İkinci El Fiyatı", " İkinci El Fiyatı")
    candidate = candidate.replace(" 2026 İkinci El Fiyatı", " İkinci El Fiyatı")
    candidate = candidate.replace(" Türkiye 2026", "")
    if len(candidate) <= TITLE_LIMIT:
        return candidate

    suffix = " | KaçaGider"
    core = candidate[:-len(suffix)] if candidate.endswith(suffix) else candidate

    if " Ne Kadar Eder?" in core:
        subject = core.split(" Ne Kadar Eder?", 1)[0].strip()
        candidate = f"{subject} Ne Kadar Eder?{suffix}"
        if len(candidate) <= TITLE_LIMIT:
            return candidate

    for marker in (" İkinci El Fiyatları", " İkinci El Fiyatı", " Kaça Satılır?"):
        if marker in core:
            subject = core.split(marker, 1)[0].strip()
            candidate = f"{subject}{marker}{suffix}"
            if len(candidate) <= TITLE_LIMIT:
                return candidate

    max_core = TITLE_LIMIT - len(suffix)
    if len(core) > max_core:
        trimmed = core[:max_core].rsplit(" ", 1)[0].rstrip(" -–|,:;")
        core = trimmed or core[:max_core]
    return f"{core}{suffix}" if suffix not in core else core


def subject_from_h1(h1: str, title: str) -> str:
    subject = h1.strip()
    endings = (
        " 2026 İkinci El Telefon Fiyatları",
        " 2026 İkinci El Fiyatları",
        " 2026 İkinci El Fiyatı",
        " İkinci El Telefon Fiyatları",
        " İkinci El Fiyatları",
        " İkinci El Fiyatı",
    )
    for ending in endings:
        if subject.endswith(ending):
            subject = subject[:-len(ending)].strip()
            break
    if " Ne Kadar Eder?" in subject:
        subject = subject.split(" Ne Kadar Eder?", 1)[0].strip()
    if not subject:
        core = title.replace(" | KaçaGider", "").strip()
        subject = core.split(" Ne Kadar Eder?", 1)[0].strip()
    return subject


def compact_description(description: str, h1: str, title: str) -> str:
    if len(description) <= DESCRIPTION_LIMIT:
        return description
    subject = subject_from_h1(h1, title)
    if not subject:
        return description
    candidate = (
        f"{subject} ne kadar eder? İkinci el fiyatı ve piyasa değerini "
        "cihaz özellikleri ve kondisyonuna göre KaçaGider ile öğren."
    )
    return candidate if len(candidate) <= DESCRIPTION_LIMIT else description


changed = []
long_titles_before = 0
long_descriptions_before = 0
long_titles_after = 0
long_descriptions_after = 0

for root_name in DEVICE_ROOTS:
    base = ROOT / root_name
    if not base.exists():
        continue
    for path in base.rglob("index.md"):
        text = path.read_text(encoding="utf-8")
        meta = fields(text)
        title = meta.get("seo_title", "")
        description = meta.get("seo_description", "")
        h1 = meta.get("seo_h1", "")
        if not title or not description or not h1:
            continue

        # Rehber içeriklerinin niyetini değiştirme; yalnızca değerleme/fiyat sayfalarını sıkılaştır.
        valuation_page = any(token in (title + " " + h1) for token in (
            "İkinci El", "Ne Kadar Eder", "Kaça Satılır", "Piyasa Değeri"
        ))
        if not valuation_page:
            continue

        if len(title) > TITLE_LIMIT:
            long_titles_before += 1
        if len(description) > DESCRIPTION_LIMIT:
            long_descriptions_before += 1

        new_title = compact_title(title)
        new_description = compact_description(description, h1, new_title)
        updated = text
        if new_title != title:
            updated = replace_field(updated, "seo_title", new_title)
        if new_description != description:
            updated = replace_field(updated, "seo_description", new_description)

        if updated != text:
            path.write_text(updated, encoding="utf-8")
            changed.append(str(path.relative_to(ROOT)))

        if len(new_title) > TITLE_LIMIT:
            long_titles_after += 1
        if len(new_description) > DESCRIPTION_LIMIT:
            long_descriptions_after += 1

print(
    "SEO meta normalization: "
    f"{len(changed)} file(s) updated; "
    f"long titles {long_titles_before}->{long_titles_after}; "
    f"long descriptions {long_descriptions_before}->{long_descriptions_after}."
)
