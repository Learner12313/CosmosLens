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

def fetch_asteroids():
    nasa_key = os.getenv("NASA_KEY")
    today = datetime.now(tz=timezone.utc).strftime("%Y-%m-%d")
    url = f"https://api.nasa.gov/neo/rest/v1/feed?start_date={today}&end_date={today}&api_key={nasa_key}"
    headers = {"User-Agent": "CosmosLens/1.0"}

    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"NeoWs API error: {e}")
        return

    data = response.json()

    try:
        conn = get_db()
        cur  = conn.cursor()
        count = 0

        for date_key, asteroids in data["near_earth_objects"].items():
            for asteroid in asteroids:
                ast_id      = asteroid["id"]
                name        = asteroid["name"]
                diam_min    = asteroid["estimated_diameter"]["kilometers"]["estimated_diameter_min"]
                diam_max    = asteroid["estimated_diameter"]["kilometers"]["estimated_diameter_max"]
                is_hazardous = asteroid["is_potentially_hazardous_asteroid"]
                is_sentry   = asteroid["is_sentry_object"]
                abs_mag     = asteroid["absolute_magnitude_h"]

                approach    = asteroid["close_approach_data"][0]
                approach_date = approach["close_approach_date"]
                approach_dt   = datetime.fromtimestamp(
                    approach["epoch_date_close_approach"] / 1000, tz=timezone.utc
                )
                miss_km     = float(approach["miss_distance"]["kilometers"])
                miss_lunar  = float(approach["miss_distance"]["lunar"])
                vel_kmh     = float(approach["relative_velocity"]["kilometers_per_hour"])
                vel_kms     = float(approach["relative_velocity"]["kilometers_per_second"])

                cur.execute("""
                    INSERT INTO asteroids
                        (id, name, diameter_min_km, diameter_max_km, is_hazardous,
                         close_approach_date, close_approach_datetime,
                         miss_distance_km, miss_distance_lunar,
                         velocity_kmh, velocity_kms,
                         absolute_magnitude, is_sentry_object)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (id) DO NOTHING
                """, (ast_id, name, diam_min, diam_max, is_hazardous,
                      approach_date, approach_dt,
                      miss_km, miss_lunar,
                      vel_kmh, vel_kms,
                      abs_mag, is_sentry))
                count += 1

        conn.commit()
        cur.close()
        conn.close()
        print(f"Inserted {count} asteroids")

    except Exception as e:
        print(f"DB error: {e}")

fetch_asteroids()