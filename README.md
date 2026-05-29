# CosmosLens

> Earth & Space Intelligence Platform

A live Earth & Space Intelligence Platform — tracking wildfires, earthquakes, aurora, ISS, near-Earth asteroids, solar storms, and atmospheric anomalies on a single interactive globe. Real data. Real time. Zero cost.

---

[![Python](https://img.shields.io/badge/Backend-Python%20FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20PostGIS-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![CesiumJS](https://img.shields.io/badge/Globe-CesiumJS-00D4FF?style=flat-square&logo=cesium)](https://cesium.com/cesiumjs/)
[![Python](https://img.shields.io/badge/ML-scikit--learn%20%2B%20NumPy-F7931E?style=flat-square&logo=scikit-learn)](https://scikit-learn.org/)
[![Docker](https://img.shields.io/badge/Containers-Docker-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![Render](https://img.shields.io/badge/Deploy-Render%20%2B%20Vercel-000000?style=flat-square)](https://render.com/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=flat-square&logo=githubactions)](https://github.com/features/actions)

---

## What is CosmosLens?

CosmosLens is an **interactive 3D Earth globe** that layers real-time space and environmental data from NASA, ESA, USGS, and NOAA — all in one place. Think Google Earth meets a live space mission control dashboard.

Users can spin the globe, click any region, and toggle layers — wildfires, earthquakes, aurora probability, ISS position, asteroid flybys, solar wind, air quality. **Every data point is real and live.** Users can subscribe to any region for weekly change alerts.

NASA's own tools are **fragmented across 12 different websites.** CosmosLens is the unified layer nobody built yet. One globe. All of Earth and near-space. Built by undergrads from VIT-AP.

A recruiter sees a team that ingested **6 live government APIs**, built a geospatial data pipeline, rendered a 3D globe with real overlays, and deployed it — without spending a rupee. That's not a college project. That's a product.

---

## Architecture

```
GOVERNMENT APIS (NASA FIRMS / USGS / DONKI / NeoWs / Open Notify / GIBS)
      |  polled by Python APScheduler every 15 min
      v
+----------------------------------------------------------+
|              FASTAPI BACKEND SERVER                        |
|                                                            |
|  APScheduler Jobs              REST Controllers             |
|  (poll every 15m)        <-->  (@GetMapping)               |
|       |                              |                     |
|       v                              v                     |
|   Cache Layer  <---- Check here FIRST                      |
|       | MISS                                              |
|       v                                                   |
|   PostgreSQL + PostGIS Data Warehouse                      |
|   (geospatial indexing, lat/long queries)                  |
+----------------------------------------------------------+
      |  FastAPI serves to frontend via REST + WebSocket
      v
React + Vite Web App
  └── CesiumJS / Leaflet 3D Globe (6 toggleable data layers)
  └── Recharts + D3.js Charts & Dashboards
  └── Before/After Satellite Imagery Slider
```

---

## 6 Live Data Layers

| # | Module | What It Does | Data Source | Cost |
|---|--------|-------------|-------------|------|
| 1 | **Wildfire Watch** | Live satellite-detected active fire locations updated every 15 minutes. Click any fire to see intensity, duration, and affected area in sq km. | NASA FIRMS API | Free |
| 2 | **Seismic & Disaster** | Real-time earthquake feed with magnitude, depth, and aftershock probability. Overlaid with UN disaster event reports for humanitarian context. | USGS Earthquake API + UN ReliefWeb | Free |
| 3 | **ISS + Satellite Tracker** | Live ISS position on the globe, updated every second. Ground track projection for next 90 minutes. Visibility window calculator for your location. | Open Notify API + CelesTrak TLE | Free |
| 4 | **Solar & Space Weather** | Solar flare alerts, geomagnetic storm indices, aurora borealis probability map by latitude. CME (Coronal Mass Ejection) impact predictions. | NASA DONKI API | Free |
| 5 | **Near-Earth Objects** | Asteroids and comets passing within 7.5M km of Earth this week. Visualized as orbital paths around Earth. Size comparison with familiar objects. | NASA NeoWs API | Free |
| 6 | **Earth Change Detection** | Before/after satellite imagery comparison for any location — glaciers, deforestation, urban growth, coastline erosion over 10 years of data. | NASA GIBS / Copernicus Open Access | Free |

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Ingestion | Python + APScheduler | Reliable scheduled polling of 6 government APIs |
| Database | PostgreSQL + PostGIS | Geospatial indexing, lat/long queries, sub-200ms response |
| Backend | FastAPI + WebSockets | Async Python, real-time ISS WebSocket feed |
| Globe | CesiumJS / Leaflet | Interactive 3D Earth with toggleable overlays |
| Frontend | React + Vite | Fast builds, component-based UI |
| Charts | Recharts + D3.js | Rich data visualization and dashboards |
| ML | scikit-learn + NumPy | Wildfire spread analysis, asteroid risk scoring, aurora modeling |
| Deploy | Render + Vercel | Free tier hosting, zero cost |

---

## Project Structure

```
CosmosLens/
├── backend/                            # Python FastAPI
│   └── app/
│       ├── main.py                     # FastAPI entry point
│       ├── config/                     # Settings, CORS, Redis config
│       ├── controllers/                # /fires, /earthquakes, /iss, /asteroids, /solar
│       ├── services/                   # DataService, CacheService, AlertService
│       ├── models/                     # SQLAlchemy models (Fire, Earthquake, ISS, NEO, Solar)
│       ├── schemas/                    # Pydantic request/response schemas
│       ├── scheduler/                  # APScheduler jobs (poll every 15 min)
│       ├── websocket/                  # Live ISS position WebSocket
│       └── utils/                      # Geo helpers, API key rotation
│
├── frontend/                           # React + Vite
│   └── src/
│       ├── components/
│       │   ├── globe/                  # CesiumJS 3D globe, layer toggles
│       │   ├── dashboard/              # Sidebar panels, data cards, detail popups
│       │   ├── charts/                 # Recharts + D3.js visualizations
│       │   └── imagery/               # Before/after satellite slider
│       ├── pages/                      # Home, Layer Detail, Region Alerts
│       ├── styles/                     # CSS variables, dark space theme
│       ├── hooks/                      # useLiveISS, useLayerData, useRegion
│       └── utils/                      # API helpers, formatters
│
├── ml-service/                         # Python ML microservice
│   └── app/
│       ├── models/                     # Wildfire spread, asteroid risk, aurora Kp-index
│       ├── data/                       # Feature engineering, NASA dataset loaders
│       └── utils/                      # Prediction helpers, change detection (NumPy)
│
├── docker/                             # Docker configs
│   ├── docker-compose.yml              # Full stack: FastAPI + React + Postgres + Redis
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── Dockerfile.ml
│
├── .github/workflows/                  # CI/CD pipelines
└── docs/                               # Architecture diagrams, API docs
```

---

## REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fires` | All active wildfire locations with intensity data |
| GET | `/api/fires/{id}` | Detailed fire info: intensity, duration, affected area |
| GET | `/api/earthquakes` | Real-time earthquake feed with magnitude and depth |
| GET | `/api/earthquakes/{id}` | Earthquake detail with aftershock probability |
| GET | `/api/iss/position` | Current ISS position (also via WebSocket) |
| GET | `/api/iss/track` | ISS ground track projection for next 90 min |
| GET | `/api/iss/visibility` | ISS visibility window for user's location |
| GET | `/api/solar/flares` | Recent solar flare alerts |
| GET | `/api/solar/storms` | Geomagnetic storm indices and CME predictions |
| GET | `/api/solar/aurora` | Aurora borealis probability map by latitude |
| GET | `/api/asteroids` | Near-Earth objects passing within 7.5M km this week |
| GET | `/api/asteroids/{id}` | Asteroid detail with orbital path and size comparison |
| GET | `/api/imagery/before-after` | Before/after satellite imagery for any location |
| GET | `/api/alerts/subscribe` | Subscribe to region for weekly change alerts |
| WS | `/ws/iss` | Live ISS position updates every second |

---

## API Data Strategy

| Source | What You Get | Rate Limit | Use For |
|--------|-------------|------------|---------|
| NASA FIRMS | Active fire locations, intensity, FRP | 5000 req/day | Wildfire Watch |
| USGS Earthquake | Real-time earthquake feed, magnitude, depth | Unlimited | Seismic & Disaster |
| UN ReliefWeb | Disaster event reports, humanitarian data | Unlimited | Disaster Context |
| NASA DONKI | Solar flares, CME, geomagnetic storms | 5000 req/day | Solar & Space Weather |
| NASA NeoWs | Near-Earth asteroid approaches, orbits | 1000 req/hr | Near-Earth Objects |
| Open Notify | ISS current position | Unlimited | ISS Tracker |
| CelesTrak TLE | Satellite orbital elements | Unlimited | Ground Track |
| NASA GIBS | Satellite imagery tiles (10yr+ archive) | Unlimited | Change Detection |
| Copernicus | Open satellite imagery | Unlimited | Change Detection |

**Key Strategy:** All APIs are **free with no daily cost**. APScheduler polls every 15 minutes, caches in Redis, and stores in PostgreSQL. Frontend never calls external APIs directly.

---

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 15+ with PostGIS extension (or use Docker)
- Redis (or use Docker)
- Git

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/Learner12313/SportPulse.git
cd SportPulse

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your NASA API keys (free registration at api.nasa.gov)

# 3. Start all services
docker-compose up --build

# 4. Access the application
# Frontend  -> http://localhost:5173
# Backend   -> http://localhost:8000
# ML API    -> http://localhost:8001
# PostgreSQL -> localhost:5432
# Redis     -> localhost:6379
```

### Without Docker (local development)

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev

# ML Service
cd ml-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

---

## Team Division

| # | Role | Member | Focus |
|---|------|--------|-------|
| 01 | Data Pipeline Engineer | M1 | Builds Python schedulers that hit NASA FIRMS, USGS, DONKI, NeoWs every 15 min. Cleans, normalizes, and loads into PostgreSQL. Owns data freshness. |
| 02 | Geospatial & DB Architect | M2 | Designs PostgreSQL schema with lat/long indexing. Writes geospatial queries. Owns the before/after satellite image storage and retrieval pipeline. |
| 03 | FastAPI Backend Developer | M3 | Builds all REST endpoints — /fires, /earthquakes, /iss, /asteroids, /solar. Handles WebSocket for live ISS position. Owns API rate limiting and caching. |
| 04 | 3D Globe & Map Engineer | M4 | Builds the interactive globe using Leaflet.js or CesiumJS. Renders all data layers as toggleable overlays. Owns the core visual experience. |
| 05 | UI/UX & Dashboard Developer | M5 | Builds the sidebar panels, layer toggles, detail popups, and data cards. Owns all charts (Recharts), the before/after slider, and mobile responsiveness. |
| 06 | ML & Analytics Engineer | M6 | Builds wildfire spread trend analysis. Asteroid approach risk scorer. Aurora probability model from Kp-index. Change detection on satellite imagery using NumPy. |
| 07 | DevOps + Auth + Alerts | M7 | Docker Compose for full local stack. Deployment on Render + Vercel. Builds the region subscription system — users get weekly email alerts for their chosen area. |

**7 members · 3-month build timeline · Zero cost**

---

## Timeline

### Month 1 — Foundation: Data + Backend

- All 6 NASA/ESA/USGS APIs integrated and running
- PostgreSQL schema designed and seeded with real data
- All FastAPI endpoints returning live data
- WebSocket for ISS live tracking working
- Docker Compose file — full stack runs in one command

### Month 2 — Globe + Features

- Interactive 3D globe live with all 6 data layer toggles
- Click any event — detailed popup with stats and charts
- Before/after satellite image slider for any location
- ML risk scoring for asteroids and wildfire trends
- Aurora probability heatmap on globe

### Month 3 — Polish + Deploy + Demo

- Region subscription alerts system live
- Deployed on Render (backend) + Vercel (frontend)
- Demo video recorded — 3 minute walkthrough
- GitHub README with architecture diagram
- LinkedIn posts + resume entries for all 7 members

---

## Resume Impact Lines

| Member | Resume Line |
|--------|-------------|
| M1 (Data Pipeline) | Built automated ingestion pipeline consuming 6 live NASA/USGS/ESA APIs, processing 50,000+ geospatial events daily using Python + APScheduler |
| M2 (DB Architect) | Designed PostgreSQL geospatial schema with coordinate indexing supporting sub-200ms query response across 500K+ event records |
| M3 (Backend) | Developed 18-endpoint REST API in FastAPI with WebSocket support for real-time ISS tracking, serving live space and environmental data |
| M4 (Globe) | Engineered interactive 3D Earth globe using CesiumJS with 6 toggleable real-time data overlays — wildfires, seismic, solar, orbital, atmospheric |
| M5 (UI/UX) | Built responsive React dashboard with before/after satellite imagery comparison slider and real-time data visualization using Recharts + D3.js |
| M6 (ML) | Implemented wildfire spread trend analysis, asteroid approach risk scoring, and aurora probability modelling using scikit-learn + NumPy on NASA datasets |
| M7 (DevOps) | Containerized full 7-service architecture with Docker Compose, deployed on Render + Vercel, built region-based email alert subscription system |

---

## Design System

- **Void Black** (background) - `#020408`
- **Deep Navy** - `#050D1A`
- **Nebula** - `#0A1628`
- **Star White** (text) - `#E8F4FF`
- **Accent Cyan** - `#00D4FF` (highlights, links, data points)
- **Accent Gold** - `#FFC843` (secondary accent)
- **Fire Orange** - `#FF6B35` (wildfire, LIVE indicators)
- **Green** - `#00FF88` (success, aurora)
- **Font** - Orbitron (headings) + DM Mono (body) + Syne (section titles)

---

## Non-Negotiable Rules

- Never commit `.env` to GitHub
- Never call NASA/USGS API from frontend code
- Never store passwords in your database
- Never skip the Redis cache check before hitting external APIs
- Never poll API when data hasn't changed (use ETags/Last-Modified)
- Never push directly to `main`
- Never hardcode credentials in code
- Always use PostGIS functions for geospatial queries

---

## License

MIT License — see [LICENSE](LICENSE) for details.
