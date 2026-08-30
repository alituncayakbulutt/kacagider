from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

PATCHES = {
    "scripts/expand-model-query-intents.py": (
        "    if len(rel.parts) != 4 or rel.parts[-1] != \"index.md\" or rel.parts[0] not in DEVICE_ROOTS:\n        return False\n",
        "    if meta.get(\"seo_page_type\") == \"series_hub\":\n        return False\n    if len(rel.parts) != 4 or rel.parts[-1] != \"index.md\" or rel.parts[0] not in DEVICE_ROOTS:\n        return False\n",
    ),
    "scripts/seo-model-intent-audit.py": (
        "            if not meta:\n                failures.append(f\"frontmatter okunamadı: {path.relative_to(ROOT)}\")\n                continue\n            breadcrumbs = meta.get(\"seo_breadcrumbs\")\n",
        "            if not meta:\n                failures.append(f\"frontmatter okunamadı: {path.relative_to(ROOT)}\")\n                continue\n            if meta.get(\"seo_page_type\") == \"series_hub\":\n                continue\n            breadcrumbs = meta.get(\"seo_breadcrumbs\")\n",
    ),
    "scripts/expand-model-listing-intents.py": (
        "    if len(rel.parts) != 4 or rel.parts[-1] != \"index.md\" or rel.parts[0] not in DEVICE_ROOTS:\n        return False\n",
        "    if meta.get(\"seo_page_type\") == \"series_hub\":\n        return False\n    if len(rel.parts) != 4 or rel.parts[-1] != \"index.md\" or rel.parts[0] not in DEVICE_ROOTS:\n        return False\n",
    ),
    "scripts/seo-model-listing-intent-audit.py": (
        "            data = meta(path)\n            crumbs = data.get(\"seo_breadcrumbs\")\n            if data and (not crumbs or (isinstance(crumbs, list) and len(crumbs) == 4)):\n                yield path, data\n",
        "            data = meta(path)\n            if data.get(\"seo_page_type\") == \"series_hub\":\n                continue\n            crumbs = data.get(\"seo_breadcrumbs\")\n            if data and (not crumbs or (isinstance(crumbs, list) and len(crumbs) == 4)):\n                yield path, data\n",
    ),
}


def patch_file(rel: str, old: str, new: str) -> str:
    path = ROOT / rel
    text = path.read_text(encoding="utf-8")
    if new in text:
        return "already-safe"
    if old not in text:
        raise RuntimeError(f"Expected patch anchor not found in {rel}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")
    return "patched"


def main():
    print("SERIES HUB COMPATIBILITY HARDENING")
    for rel, (old, new) in PATCHES.items():
        print(f"  {rel}: {patch_file(rel, old, new)}")


if __name__ == "__main__":
    main()
