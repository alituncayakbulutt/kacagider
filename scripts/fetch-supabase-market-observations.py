#!/usr/bin/env python3
from __future__ import annotations

import datetime as dt
import json
import re
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CLIENT_FILE = ROOT / "assets" / "supabase-marketplace.js"
OUT_FILE = ROOT / "data" / "market-observations" / "inbox" / "_runtime-supabase.json"
MAX_AGE_DAYS = 21


def read_public_config():
    text = CLIENT_FILE.read_text(encoding="utf-8")
    url_match = re.search(r'const\s+SUPABASE_URL\s*=\s*"([^"]+)"', text)
    key_match = re.search(r'const\s+SUPABASE_PUBLISHABLE_KEY\s*=\s*"([^"]+)"', text)
    if not url_match or not key_match:
        raise RuntimeError("Supabase public config could not be read from the existing client file.")
    return url_match.group(1).rstrip("/"), key_match.group(1)


def fetch_rows(base_url: str, publishable_key: str):
    endpoint = base_url + "/rest/v1/rpc/get_market_price_observations_for_engine"
    since = (dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=MAX_AGE_DAYS)).replace(microsecond=0).isoformat()
    body = json.dumps({"p_since": since}).encode("utf-8")
    request = urllib.request.Request(
        endpoint,
        data=body,
        method="POST",
        headers={
            "apikey": publishable_key,
            "Authorization": "Bearer " + publishable_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:500]
        raise RuntimeError(f"Supabase sanitized observation RPC failed with HTTP {exc.code}: {detail}") from exc
    if not isinstance(payload, list):
        raise RuntimeError("Supabase sanitized observation RPC returned an unexpected payload.")
    return payload


def sanitize(rows):
    allowed = {
        "source_id", "category", "brand", "model", "storage",
        "price", "observation_type", "observed_at",
    }
    clean = []
    for row in rows:
        if not isinstance(row, dict):
            continue
        item = {key: row.get(key) for key in allowed}
        # Runtime file intentionally carries no user/contact/listing description/image/raw/url fields.
        clean.append(item)
    return clean


def main():
    base_url, publishable_key = read_public_config()
    rows = sanitize(fetch_rows(base_url, publishable_key))
    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text(json.dumps({"observations": rows}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Sanitized Supabase market observations fetched: {len(rows)}")
    print(f"Runtime input: {OUT_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
