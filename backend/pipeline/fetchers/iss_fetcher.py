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

def fetch_iss():
    url = "https://api.wheretheiss.at/v1/satellites/25544"
    headers = {"User-Agent": "CosmosLens/1.0"}
    response = requests.get(url, headers = headers, timeout=10)
    data = response.json()

    latitude = float(data['latitude'])
    longitude = float(data['longitude'])
    timestamp = datetime.fromtimestamp(data['timestamp'], tz=timezone.utc)
    location = f"SRID:4326;POINT({longitude} {latitude})"

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO iss_positions (latitude, longitude, timestamp, location) 
        VALUES (%s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326))
        ON CONFLICT (timestamp) DO NOTHING
    """, (latitude, longitude, timestamp, longitude, latitude))
    conn.commit()
    cur.close()
    conn.close()
    print(f"Inserted — Latitude: {latitude}, Longitude: {longitude}, Timestamp: {timestamp}")

fetch_iss()
