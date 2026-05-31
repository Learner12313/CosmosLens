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

def fetch_earthquakes():
    url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson"
    headers = {"User-Agent": "CosmosLens/1.0"}

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Earthquake API error: {e}")
        return

    data = response.json()

    try:
        conn = get_db()
        cur  = conn.cursor()

        for feature in data["features"]:
            props     = feature["properties"]
            geom      = feature["geometry"]

            eq_id     = feature["id"]
            longitude, latitude, depth = geom["coordinates"]
            magnitude = props.get("mag")
            mag_type  = props.get("magType")
            place     = props.get("place")
            time      = props.get("time")
            tsunami   = props.get("tsunami", 0)
            sig       = props.get("sig")
            felt      = props.get("felt")

            cur.execute("""
                INSERT INTO earthquakes 
                    (id, latitude, longitude, depth, magnitude, mag_type, place, time, tsunami, sig, felt, location)
                VALUES 
                    (%s, %s, %s, %s, %s, %s, %s, to_timestamp(%s/1000.0), %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326))
                ON CONFLICT (id) DO NOTHING
            """, (eq_id, latitude, longitude, depth, magnitude, mag_type, place, time, tsunami, sig, felt, longitude, latitude))

        conn.commit()
        cur.close()
        conn.close()
        print(f"Inserted {len(data['features'])} earthquakes")

    except Exception as e:
        print(f"DB error: {e}")

fetch_earthquakes()