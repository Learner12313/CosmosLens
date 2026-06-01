import requests
import psycopg2
from datetime import datetime, timezone
from dotenv import load_dotenv
import os
load_dotenv()

def get_db():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )

def parse_time(t):
    if t is None:
        return None
    return datetime.fromisoformat(t.replace("Z", "+00:00"))

def fetch_solar_flares():
    nasa_key = os.getenv("NASA_KEY")
    today = datetime.now(tz=timezone.utc).strftime("%Y-%m-%d")
    url = f"https://api.nasa.gov/DONKI/FLR?startDate=2026-05-01&endDate={today}&api_key={nasa_key}"
    headers = {"User-Agent": "CosmosLens/1.0"}

    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"DONKI FLR API error: {e}")
        return

    data = response.json()

    if not data:
        print("No solar flare data")
        return

    try:
        conn = get_db()
        cur  = conn.cursor()
        count = 0

        for flare in data:
            flr_id      = flare["flrID"]
            class_type  = flare["classType"]
            begin_time  = parse_time(flare.get("beginTime"))
            peak_time   = parse_time(flare.get("peakTime"))
            end_time    = parse_time(flare.get("endTime"))
            source_loc  = flare.get("sourceLocation")
            active_reg  = flare.get("activeRegionNum")

            cur.execute("""
                INSERT INTO solar_flares
                    (flr_id, class_type, begin_time, peak_time, end_time,
                     source_location, active_region_num)
                VALUES (%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (flr_id) DO NOTHING
            """, (flr_id, class_type, begin_time, peak_time, end_time,
                  source_loc, active_reg))
            count += 1

        conn.commit()
        cur.close()
        conn.close()
        print(f"Inserted {count} solar flares")

    except Exception as e:
        print(f"DB error: {e}")

fetch_solar_flares()