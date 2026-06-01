import requests
import psycopg2
from datetime import datetime, timezone, date
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
    nasa_key  = os.getenv("NASA_API_KEY", "DEMO_KEY")
    today     = date.today().isoformat()
    url       = f"https://api.nasa.gov/neo/rest/v1/feed?start_date={today}&end_date={today}&api_key={nasa_key}"
    headers   = {"User-Agent": "CosmosLens/1.0"}

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Asteroids API error: {e}")
        return

    data = response.json()
    near_earth_objects = data.get("near_earth_objects", {})

    try:
        conn = get_db()
        cur  = conn.cursor()
        count = 0

        for date_key, asteroids in near_earth_objects.items():
            for asteroid in asteroids:
                try:
                    neo_id              = asteroid.get("id")
                    name                = asteroid.get("name")
                    nasa_jpl_url        = asteroid.get("nasa_jpl_url")
                    is_potentially_hazardous = asteroid.get("is_potentially_hazardous_asteroid", False)
                    is_sentry_object    = asteroid.get("is_sentry_object", False)

                    # Diameter estimates (meters)
                    diameter            = asteroid.get("estimated_diameter", {})
                    diam_min_m          = diameter.get("meters", {}).get("estimated_diameter_min")
                    diam_max_m          = diameter.get("meters", {}).get("estimated_diameter_max")

                    # Closest approach data for today
                    close_approaches    = asteroid.get("close_approach_data", [])
                    approach            = close_approaches[0] if close_approaches else {}

                    close_approach_time = approach.get("close_approach_date_full")  # e.g. "2024-Jan-01 10:30"
                    miss_distance_km    = float(approach.get("miss_distance", {}).get("kilometers", 0) or 0)
                    relative_velocity   = float(approach.get("relative_velocity", {}).get("kilometers_per_hour", 0) or 0)
                    orbiting_body       = approach.get("orbiting_body")

                    cur.execute("""
                        INSERT INTO asteroids
                            (neo_id, name, nasa_jpl_url, is_potentially_hazardous, is_sentry_object,
                             diam_min_m, diam_max_m,
                             close_approach_time, miss_distance_km, relative_velocity_kmh, orbiting_body)
                        VALUES
                            (%s, %s, %s, %s, %s,
                             %s, %s,
                             %s::timestamptz, %s, %s, %s)
                        ON CONFLICT (neo_id, close_approach_time) DO NOTHING
                    """, (neo_id, name, nasa_jpl_url, is_potentially_hazardous, is_sentry_object,
                          diam_min_m, diam_max_m,
                          close_approach_time, miss_distance_km, relative_velocity, orbiting_body))
                    count += 1

                except (ValueError, KeyError) as e:
                    print(f"Row error: {e}")
                    continue

        conn.commit()
        cur.close()
        conn.close()
        print(f"Inserted {count} asteroids")

    except Exception as e:
        print(f"DB error: {e}")

fetch_asteroids()