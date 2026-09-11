from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "data" / "seo-v3-intents.json"
SITEMAP_PATH = ROOT / "sitemap.xml"
SITE = "https://kacagider.com.tr"
DEVICE_ROOTS = {"telefon", "tablet", "bilgisayar", "akilli-saat", "oyun-konsolu"}
VARIANT_RE = re.compile(r"^(?:\d+(?:gb|tb|mm)|\d+-?(?:gb|tb|mm))$", re.I)
YEAR_RE = re.compile(r"\b20\d{2}\b")


def read_frontmatter(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return {}
    end = text.find("\n---\n", 4)
    if end == -1:
        return {}
    result: dict[str, object] = {}
    for line in text[4:end].splitlines():
        if ": " not in line:
            continue
        key, raw = line.split(": ", 1)
        try:
            result[key] = json.loads(raw)
        except json.JSONDecodeError:
            result[key] = raw.strip('"')
    return result


def path_for_url(url_path: str) -> Path:
    return ROOT / url_path.strip("/") / "index.md"


def text_blob(meta: dict) -> str:
    keys = ("seo_title", "seo_description", "seo_h1", "seo_intro", "seo_context_heading", "seo_context", "seo_sections", "seo_faqs")
    return json.dumps({k: meta.get(k, "") for k in keys}, ensure_ascii=False).lower()


def audit_core_pages(config: dict, errors: list[str]) -> None:
    for key, item in config["categories"].items():
        category_url = item["category_url"]
        valuation_url = item["valuation_url"]
        category_file = path_for_url(category_url)
        valuation_file = path_for_url(valuation_url)

        if not category_file.exists():
            errors.append(f"missing category page: {category_url}")
            continue
        if not valuation_file.exists():
            errors.append(f"missing valuation page: {valuation_url}")
            continue

        category = read_frontmatter(category_file)
        valuation = read_frontmatter(valuation_file)
        if category.get("seo_h1") != item["category_h1"]:
            errors.append(f"{category_url}: category H1 must be '{item['category_h1']}'")
        if valuation.get("seo_h1") != item["valuation_h1"]:
            errors.append(f"{valuation_url}: valuation H1 must be '{item['valuation_h1']}'")

        expected_category_canonical = SITE + category_url
        expected_valuation_canonical = SITE + valuation_url
        if category.get("seo_canonical") != expected_category_canonical:
            errors.append(f"{category_url}: canonical mismatch")
        if valuation.get("seo_canonical") != expected_valuation_canonical:
            errors.append(f"{valuation_url}: canonical mismatch")

        category_text = text_blob(category)
        valuation_text = text_blob(valuation)
        if YEAR_RE.search(str(category.get("seo_title", ""))) or YEAR_RE.search(str(category.get("seo_h1", ""))):
            errors.append(f"{category_url}: hard-coded year in evergreen title/H1")
        if YEAR_RE.search(str(valuation.get("seo_title", ""))) or YEAR_RE.search(str(valuation.get("seo_h1", ""))):
            errors.append(f"{valuation_url}: hard-coded year in evergreen title/H1")

        # Category pages own market/discovery intent; valuation pages own first-person calculator intent.
        first_person = item["valuation_h1"].lower().replace("?", "")
        if first_person and first_person in str(category.get("seo_h1", "")).lower():
            errors.append(f"{category_url}: category H1 overlaps valuation intent")
        if "ikinci el" not in category_text:
            errors.append(f"{category_url}: category market intent missing")
        if "değer" not in valuation_text and "deger" not in valuation_text:
            errors.append(f"{valuation_url}: valuation intent missing")


def sitemap_urls(errors: list[str]) -> list[str]:
    if not SITEMAP_PATH.exists():
        errors.append("sitemap.xml missing")
        return []
    try:
        tree = ET.parse(SITEMAP_PATH)
    except ET.ParseError as exc:
        errors.append(f"sitemap.xml invalid XML: {exc}")
        return []
    root = tree.getroot()
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = [node.text.strip() for node in root.findall("sm:url/sm:loc", ns) if node.text]
    return urls


def audit_sitemap(config: dict, errors: list[str]) -> None:
    urls = sitemap_urls(errors)
    if not urls:
        return

    required = {SITE + item["category_url"] for item in config["categories"].values()}
    required |= {SITE + item["valuation_url"] for item in config["categories"].values()}
    missing = sorted(required - set(urls))
    for url in missing:
        errors.append(f"core URL missing from primary sitemap: {url}")

    leaked_variants: list[str] = []
    for url in urls:
        parts = [p for p in urlparse(url).path.split("/") if p]
        if len(parts) == 4 and parts[0] in DEVICE_ROOTS and VARIANT_RE.fullmatch(parts[-1]):
            leaked_variants.append(url)
    if leaked_variants:
        errors.append(f"primary sitemap contains {len(leaked_variants)} storage/mm variant URL(s); first: {leaked_variants[:5]}")

    # Guard against accidental programmatic explosion. Existing V3 baseline is 823 URLs.
    if len(urls) > 900:
        errors.append(f"primary sitemap URL count {len(urls)} exceeds V3 safety ceiling 900")


def is_model_page(path: Path, meta: dict) -> bool:
    rel = path.relative_to(ROOT)
    parts = rel.parts
    if len(parts) != 4 or parts[-1] != "index.md" or parts[0] not in DEVICE_ROOTS:
        return False
    if meta.get("seo_page_type") == "series_hub":
        return False
    return True


def audit_model_pages(config: dict, errors: list[str]) -> tuple[int, int]:
    forbidden = [str(x).lower() for x in config.get("forbidden_patterns", [])]
    checked = 0
    warnings = 0
    for root_name in sorted(DEVICE_ROOTS):
        base = ROOT / root_name
        if not base.exists():
            continue
        for path in sorted(base.glob("*/*/index.md")):
            meta = read_frontmatter(path)
            if not meta or not is_model_page(path, meta):
                continue
            checked += 1
            rel = "/" + "/".join(path.relative_to(ROOT).parts[:-1]) + "/"
            expected_canonical = SITE + rel
            canonical = str(meta.get("seo_canonical", ""))
            h1 = str(meta.get("seo_h1", ""))
            title = str(meta.get("seo_title", ""))
            blob = text_blob(meta)

            if canonical != expected_canonical:
                errors.append(f"{rel}: model canonical must be self-canonical")
            if "Ne Kadar Eder?" not in h1:
                warnings += 1
            if title.count("?") > 1:
                errors.append(f"{rel}: title contains multiple question intents")
            for marker in forbidden:
                if marker and marker in blob:
                    errors.append(f"{rel}: forbidden synthetic/overloaded intent marker '{marker}'")
                    break

            faqs = meta.get("seo_faqs")
            if isinstance(faqs, list) and len(faqs) > int(config["model_page"].get("faq_max", 4)):
                errors.append(f"{rel}: too many FAQs ({len(faqs)}), max is {config['model_page']['faq_max']}")

    return checked, warnings


def main() -> int:
    if not CONFIG_PATH.exists():
        print("SEO V3 ARCHITECTURE AUDIT: FAIL - config missing")
        return 1
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    errors: list[str] = []

    audit_core_pages(config, errors)
    audit_sitemap(config, errors)
    checked_models, model_h1_warnings = audit_model_pages(config, errors)

    print("SEO V3 ARCHITECTURE AUDIT")
    print(f"Categories: {len(config['categories'])}")
    print(f"Model pages checked: {checked_models}")
    print(f"Model H1 migration notices: {model_h1_warnings}")
    print(f"Errors: {len(errors)}")
    if errors:
        for item in errors[:100]:
            print(f"- {item}")
        if len(errors) > 100:
            print(f"- ... +{len(errors) - 100} more")
        return 1

    print("SEO V3 ARCHITECTURE AUDIT: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
