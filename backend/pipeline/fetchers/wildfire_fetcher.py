import csv
import io
import os
import requests
import psycopg2
from dotenv import load_dotenv
load_dotenv()

def get_db():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )

def fetch_wildfires():
    firms_key = os.getenv("FIRMS_KEY")
    url = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{firms_key}/VIIRS_SNPP_NRT/world/1"
    headers = {"User-Agent": "CosmosLens/1.0"}

    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"FIRMS API error: {e}")
        return

    reader = csv.DictReader(io.StringIO(response.text))
    rows = list(reader)

    if not rows:
        print("No wildfire data returned")
        return

    try:
        conn = get_db()
        cur  = conn.cursor()
        count = 0

        for row in rows:
            try:
                latitude   = float(row["latitude"])
                longitude  = float(row["longitude"])
                acq_date   = row["acq_date"]
                acq_time   = row["acq_time"]
                daynight   = row["daynight"]
                frp        = float(row["frp"]) if row["frp"] else None
                confidence = row["confidence"]
                bright_ti4 = float(row["bright_ti4"]) if row["bright_ti4"] else None
                satellite  = row["satellite"]
                instrument = row["instrument"]

                cur.execute("""
                    INSERT INTO wildfires 
                        (latitude, longitude, acq_date, acq_time, daynight, frp, confidence, bright_ti4, satellite, instrument, location)
                    VALUES 
                        (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326))
                    ON CONFLICT (latitude, longitude, acq_date, acq_time) DO NOTHING
                """, (latitude, longitude, acq_date, acq_time, daynight, frp, confidence, bright_ti4, satellite, instrument, longitude, latitude))
                count += 1

            except (ValueError, KeyError) as e:
                print(f"Row error: {e}")
                continue

        conn.commit()
        cur.close()
        conn.close()
        print(f"Inserted {count} wildfires")

    except Exception as e:
        print(f"DB error: {e}")

fetch_wildfires()