#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "scripts" / "fetch-donanimhaber-market-source-v2.py"

spec = importlib.util.spec_from_file_location("kg_dh_v2", BASE)
if spec is None or spec.loader is None:
    raise SystemExit("DonanimHaber V2 collector could not be loaded.")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

_original_listing_observation = mod.listing_observation


def listing_observation(url, raw, signatures, cfg, now):
    obs, reason = _original_listing_observation(url, raw, signatures, cfg, now)
    if not obs:
        return obs, reason

    # A DonanimHaber detail page can contain links/titles from unrelated sold topics.
    # Only the listing's own page title is authoritative enough for a sold marker.
    title_n = mod.normalize_text(mod.page_title(raw))
    title_is_sold = "satildi" in title_n
    if not title_is_sold:
        obs["observation_type"] = "asking"
        obs["market_status"] = "active"
        obs["observed_at"] = now.isoformat().replace("+00:00", "Z")
    return obs, None


mod.listing_observation = listing_observation

if __name__ == "__main__":
    mod.main()
