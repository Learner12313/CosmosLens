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

def fetch_geomagnetic_storms():
    nasa_key = os.getenv("NASA_KEY")
    today = datetime.now(tz=timezone.utc).strftime("%Y-%m-%d")
    url = f"https://api.nasa.gov/DONKI/GST?startDate=2026-05-01&endDate={today}&api_key={nasa_key}"
    headers = {"User-Agent": "CosmosLens/1.0"}

    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"DONKI GST API error: {e}")
        return

    data = response.json()

    if not data:
        print("No geomagnetic storm data")
        return

    try:
        conn = get_db()
        cur  = conn.cursor()
        count = 0

        for storm in data:
            gst_id     = storm["gstID"]
            start_time = parse_time(storm["startTime"])

            kp_readings = storm.get("allKpIndex", [])
            if not kp_readings:
                continue

            max_reading   = max(kp_readings, key=lambda x: x["kpIndex"])
            kp_index      = max_reading["kpIndex"]
            observed_time = parse_time(max_reading["observedTime"])

            cur.execute("""
                INSERT INTO geomagnetic_storms
                    (gst_id, start_time, kp_index, observed_time)
                VALUES (%s,%s,%s,%s)
                ON CONFLICT (gst_id) DO NOTHING
            """, (gst_id, start_time, kp_index, observed_time))
            count += 1

        conn.commit()
        cur.close()
        conn.close()
        print(f"Inserted {count} geomagnetic storms")

    except Exception as e:
        print(f"DB error: {e}")

fetch_geomagnetic_storms()