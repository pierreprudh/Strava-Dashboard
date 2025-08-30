"""
Export personal Strava data using the official API endpoint
https://developers.strava.com/docs/reference/#api-Activities-getLoggedInAthleteActivities

This script:
- Reads credentials from your `.env`
- Exchanges the refresh token for a short-lived access token
- Calls `/api/v3/athlete/activities` with pagination
- Saves results to JSON or CSV

Required env vars in .env:
  STRAVA_CLIENT_ID=...
  STRAVA_CLIENT_SECRET=...
  STRAVA_REFRESH_TOKEN=...

Usage examples:
  python export_data.py --out data/activities.json
  python export_data.py --out data/activities.csv --per-page 200 --max-pages 3
  python export_data.py --after 2024-01-01 --before 2024-12-31

Install deps:
  pip install requests python-dotenv
"""
from __future__ import annotations
import argparse
import csv
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

import requests
from dotenv import load_dotenv

STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token"
STRAVA_ACTIVITIES_URL = "https://www.strava.com/api/v3/athlete/activities"


def load_env() -> Tuple[str, str, str]:
    """Load required credentials from .env and return (client_id, client_secret, refresh_token).

    We explicitly point to the .env next to this script to avoid issues with
    python-dotenv's automatic discovery (which can fail in some REPL/heredoc contexts).
    """
    
    # First try the .env next to this file; then fall back to CWD for convenience
    script_env = Path(__file__).with_name(".env")
    if script_env.exists():
        load_dotenv(dotenv_path=script_env)
    else:
        load_dotenv()

    client_id = os.getenv("STRAVA_CLIENT_ID")
    client_secret = os.getenv("STRAVA_CLIENT_SECRET")
    refresh_token = os.getenv("STRAVA_REFRESH_TOKEN")
    missing = [k for k, v in {
        "STRAVA_CLIENT_ID": client_id,
        "STRAVA_CLIENT_SECRET": client_secret,
        "STRAVA_REFRESH_TOKEN": refresh_token,
    }.items() if not v]
    if missing:
        hint = f" Looked for .env at: {script_env.resolve()} and current working directory."
        raise RuntimeError(
            "Missing env vars: " + ", ".join(missing) + ". Add them to your .env file." + hint)
    return client_id, client_secret, refresh_token


def get_access_token(client_id: str, client_secret: str, refresh_token: str) -> Dict[str, Any]:
    """Exchange the refresh token for a new access token. Returns the token payload JSON."""
    resp = requests.post(
        STRAVA_TOKEN_URL,
        data={
            "client_id": client_id,
            "client_secret": client_secret,
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
        },
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()


def _parse_date_to_epoch(date_str: Optional[str]) -> Optional[int]:
    if not date_str:
        return None
    # Accept YYYY-MM-DD; treat as local date at 00:00 and convert to epoch seconds UTC
    try:
        dt = datetime.fromisoformat(date_str)
    except ValueError as e:
        raise ValueError(f"Invalid date format '{date_str}'. Use YYYY-MM-DD.") from e
    # Naive => assume local time, then convert to UTC epoch
    if dt.tzinfo is None:
        dt = dt.replace(hour=0, minute=0, second=0, microsecond=0)
        dt = dt.astimezone()
    return int(dt.timestamp())


def fetch_activities(access_token: str, per_page: int = 200, after: Optional[int] = None,
                     before: Optional[int] = None, max_pages: Optional[int] = None) -> List[Dict[str, Any]]:
    """Fetch activities for the logged-in athlete. Paginates until empty or max_pages reached."""
    headers = {"Authorization": f"Bearer {access_token}"}
    activities: List[Dict[str, Any]] = []
    page = 1
    while True:
        params = {"per_page": per_page, "page": page}
        if after is not None:
            params["after"] = after
        if before is not None:
            params["before"] = before
        r = requests.get(STRAVA_ACTIVITIES_URL, headers=headers, params=params, timeout=30)
        # Raise clear error for token/permission issues
        if r.status_code == 401:
            raise RuntimeError("Unauthorized (401). Check your access token scope and validity.")
        r.raise_for_status()
        batch = r.json()
        if not isinstance(batch, list):
            raise RuntimeError("Unexpected response format from Strava API.")
        if not batch:
            break
        activities.extend(batch)
        if max_pages is not None and page >= max_pages:
            break
        page += 1
    return activities


def save_json(data: Any, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def save_csv(activities: List[Dict[str, Any]], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not activities:
        # Create an empty file with a minimal header
        with path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["id", "name", "start_date_local", "distance", "moving_time", "elapsed_time", "type"])
        return
    # Flatten selected fields commonly useful for dashboards
    fieldnames = [
        "id", "name", "start_date", "start_date_local", "timezone", "utc_offset",
        "type", "sport_type", "distance", "moving_time", "elapsed_time", "total_elevation_gain",
        "average_speed", "max_speed", "average_heartrate", "max_heartrate", "suffer_score", "calories",
        "commute", "trainer", "private"
    ]
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        for a in activities:
            writer.writerow(a)


def main() -> None:
    parser = argparse.ArgumentParser(description="Export personal Strava activities")
    parser.add_argument("--per-page", type=int, default=200, help="Items per page (max 200)")
    parser.add_argument("--max-pages", type=int, default=None, help="Stop after N pages (optional)")
    parser.add_argument("--after", type=str, default=None, help="Only include activities after YYYY-MM-DD (local)")
    parser.add_argument("--before", type=str, default=None, help="Only include activities before YYYY-MM-DD (local)")
    parser.add_argument("--out", type=Path, default=Path("data/activities.json"), help="Output path (.json or .csv)")
    args = parser.parse_args()

    client_id, client_secret, refresh_token = load_env()
    token_payload = get_access_token(client_id, client_secret, refresh_token)
    access_token = token_payload.get("access_token")
    if not access_token:
        raise RuntimeError("No access_token returned by Strava. Check your credentials.")

    after_epoch = _parse_date_to_epoch(args.after)
    before_epoch = _parse_date_to_epoch(args.before)

    activities = fetch_activities(
        access_token=access_token,
        per_page=args.per_page,
        after=after_epoch,
        before=before_epoch,
        max_pages=args.max_pages,
    )

    out_path: Path = args.out
    if out_path.suffix.lower() == ".csv":
        save_csv(activities, out_path)
    else:
        # Default to JSON
        payload = {
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "count": len(activities),
            "activities": activities,
        }
        save_json(payload, out_path)

    print(f"Saved {len(activities)} activities to {out_path}")


if __name__ == "__main__":
    main()