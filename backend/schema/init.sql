CREATE TABLE IF NOT EXISTS wildfires (
    latitude        DECIMAL(9,6)    NOT NULL,
    longitude       DECIMAL(9,6)    NOT NULL,
    acq_date        DATE            NOT NULL,
    acq_time        VARCHAR(4)      NOT NULL,
    daynight        VARCHAR(1)      NOT NULL CHECK (daynight IN ('D', 'N')),
    frp             DECIMAL(10,2),
    confidence      VARCHAR(10),
    bright_ti4      DECIMAL(10,2),
    satellite       VARCHAR(10),
    instrument      VARCHAR(20),
    location        GEOMETRY(POINT, 4326),
    created_at      TIMESTAMP       DEFAULT NOW(),
    PRIMARY KEY (latitude, longitude, acq_date, acq_time)
);

CREATE TABLE IF NOT EXISTS earthquakes (
    id              VARCHAR(20)     PRIMARY KEY,
    latitude        DECIMAL(9,6)    NOT NULL,
    longitude       DECIMAL(9,6)    NOT NULL,
    depth           DECIMAL(8,2),
    magnitude       DECIMAL(4,2),
    mag_type        VARCHAR(10),
    place           TEXT,
    time            TIMESTAMP       NOT NULL,
    tsunami         SMALLINT        DEFAULT 0,
    sig             INTEGER,
    felt            INTEGER,
    location        GEOMETRY(POINT, 4326),
    created_at      TIMESTAMP       DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS iss_positions (
    id              SERIAL          PRIMARY KEY,
    latitude        DECIMAL(9,6)    NOT NULL,
    longitude       DECIMAL(9,6)    NOT NULL,
    timestamp       TIMESTAMP       NOT NULL UNIQUE,
    location        GEOMETRY(POINT, 4326),
    created_at      TIMESTAMP       DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asteroids (
    id                      VARCHAR(20)     PRIMARY KEY,
    name                    VARCHAR(100),
    diameter_min_km         DECIMAL(10,6),
    diameter_max_km         DECIMAL(10,6),
    is_hazardous            BOOLEAN         DEFAULT FALSE,
    close_approach_date     DATE,
    close_approach_datetime TIMESTAMP,
    miss_distance_km        DECIMAL(20,3),
    miss_distance_lunar     DECIMAL(15,3),
    velocity_kmh            DECIMAL(15,3),
    velocity_kms            DECIMAL(10,6),
    absolute_magnitude      DECIMAL(6,2),
    is_sentry_object        BOOLEAN         DEFAULT FALSE,
    created_at              TIMESTAMP       DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS solar_flares (
    flr_id              VARCHAR(60)     PRIMARY KEY,
    class_type          VARCHAR(10),
    begin_time          TIMESTAMP,
    peak_time           TIMESTAMP,
    end_time            TIMESTAMP,
    source_location     VARCHAR(20),
    active_region_num   INTEGER,
    created_at          TIMESTAMP       DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS geomagnetic_storms (
    gst_id              VARCHAR(60)     PRIMARY KEY,
    start_time          TIMESTAMP       NOT NULL,
    kp_index            DECIMAL(4,2),
    observed_time       TIMESTAMP,
    created_at          TIMESTAMP       DEFAULT NOW()
);