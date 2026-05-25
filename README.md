SportPulse
Multi-Sport Real-Time Analytics Platform

Live cricket scores, deep statistics, player profiles, and AI-powered match predictions — all in one place.

Tech Stack
Layer	Technology
Frontend	React + Vite + Vanilla CSS
Backend	Java Spring Boot
Database	PostgreSQL# SportPulse

> Multi-Sport Real-Time Analytics Platform

Real-time cricket scores, deep match statistics, player profiles, team standings, and AI-powered match predictions — all in one place.

---

[![Java](https://img.shields.io/badge/Backend-Java%20Spring%20Boot-6DB33F?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Cache-Redis-DC382D?style=flat-square&logo=redis)](https://redis.io/)
[![Python](https://img.shields.io/badge/ML-Python%20%2B%20XGBoost-3776AB?style=flat-square&logo=python)](https://fastapi.tiangolo.com/)
[![Firebase](https://img.shields.io/badge/Auth-Firebase-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Docker](https://img.shields.io/badge/Containers-Docker-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=flat-square&logo=githubactions)](https://github.com/features/actions)

---

## What is SportPulse?

SportPulse is a real-time sports analytics web platform built with a Java Spring Boot backend and React frontend. It gives users live scores, deep match statistics, player profiles, team standings, and AI-powered match predictions — starting with Cricket and designed to scale to Football, Basketball, and Tennis.

The platform is **always live, always fast, and never wastes a single API call** — data is smartly warehoused with Redis caching so no external API is ever hit more than absolutely necessary.

---

## Architecture

```
EXTERNAL APIS (CricketData.org / TheSportsDB)
      |  called ONLY by @Scheduled background jobs
      v
+--------------------------------------------------+
|           SPRING BOOT BACKEND SERVER              |
|                                                    |
|  @Scheduled Jobs            REST Controllers       |
|  (poll every 60s)      <--> (@GetMapping)          |
|       |                         |                  |
|       v                         v                  |
|   Redis Cache  <---- Check here FIRST              |
|       | MISS                                       |
|       v                                            |
|   PostgreSQL Data Warehouse                        |
|   (permanent store of all data)                    |
+--------------------------------------------------+
      |  Spring Boot serves to frontend
      v
React Web App (1 user or 10,000 = same API calls)
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React + Vite | Fast builds, component-based |
| Styling | Vanilla CSS + CSS Variables | Full dark/light mode control |
| Backend | Java Spring Boot | Robust, scalable, industry-standard |
| ORM | Spring Data JPA + Hibernate | Clean entity mapping |
| Scheduler | Spring @Scheduled | Built-in, no extra service needed |
| ML Models | Python, XGBoost, scikit-learn | Best for tabular sports data |
| ML Bridge | FastAPI microservice | Predictions exposed as REST |
| Database | PostgreSQL | Relational, powerful for complex stats |
| Cache | Redis + @Cacheable | Sub-millisecond reads, auto TTL |
| Auth | Firebase Auth + Admin SDK | Never store passwords |
| Charts | Chart.js | Lightweight, great defaults |
| Containers | Docker + Docker Compose | Consistent environments |
| CI/CD | GitHub Actions | Auto-test and deploy on push |

---

## Project Structure

```
SportPulse/
├── backend/                        # Java Spring Boot
│   └── src/main/java/com/sportpulse/
│       ├── config/                 # SecurityConfig, RedisConfig, FirebaseConfig
│       ├── controller/             # MatchController, TeamController, PlayerController
│       ├── service/                # MatchService, CacheService, ApiKeyRotatorService
│       ├── repository/             # MatchRepository, PlayerRepository (JPA)
│       ├── model/entity/           # Match, Player, Team, Venue, Scorecard
│       ├── model/dto/              # MatchDTO, ScorecardDTO, PredictionDTO
│       ├── scheduler/              # LiveMatchPoller, DailyScheduleFetcher
│       ├── security/               # FirebaseTokenFilter, JwtVerificationService
│       └── exception/              # GlobalExceptionHandler
│
├── frontend/                       # React + Vite
│   └── src/
│       ├── components/             # Reusable UI components
│       ├── pages/                  # Home, Scorecard, Teams, Players, Analytics
│       ├── styles/                 # CSS variables, design system
│       ├── hooks/                  # Custom React hooks
│       └── utils/                  # API helpers, formatters
│
├── ml-service/                     # Python FastAPI
│   └── app/
│       ├── models/                 # XGBoost models (score, win%, MOM)
│       ├── data/                   # Feature engineering, training scripts
│       └── utils/                  # Prediction helpers
│
├── docker/                         # Docker configs
├── .github/workflows/              # CI/CD pipelines
└── docs/                           # Documentation
```

---

## REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matches/live` | All live matches with current scores |
| GET | `/api/matches/upcoming` | Upcoming fixtures |
| GET | `/api/matches/{id}/scorecard` | Full batting + bowling scorecard |
| GET | `/api/matches/{id}/h2h` | Head-to-head historical record |
| GET | `/api/teams` | All teams |
| GET | `/api/teams/{id}` | Team detail + squad + recent form |
| GET | `/api/players/{id}` | Player profile + career stats |
| GET | `/api/players/search?q=` | Player search by name |
| GET | `/api/series` | All active series |
| GET | `/api/series/{id}/standings` | Points table for a series |
| GET | `/api/predict/{matchId}` | ML: score + win% + MOM prediction |
| GET | `/api/analytics/top-scorers` | Top run scorers (tournament-wide) |
| GET | `/api/analytics/top-wickets` | Top wicket takers |

---

## Quick Start

### Prerequisites

- Java 17+
- Node.js 18+
- Python 3.10+
- Docker and Docker Compose
- Git

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/SportPulse.git
cd SportPulse

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your API keys and Firebase credentials

# 3. Start all services
docker-compose up --build

# 4. Access the application
# Frontend  -> http://localhost:5173
# Backend   -> http://localhost:8080
# ML API    -> http://localhost:8000
# PostgreSQL -> localhost:5432
# Redis     -> localhost:6379
```

### Without Docker (local development)

```bash
# Backend
cd backend
./mvnw spring-boot:run

# Frontend
cd frontend
npm install
npm run dev

# ML Service
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## API Data Strategy

| Source | What You Get | Daily Limit | Use For |
|--------|-------------|-------------|---------|
| Cricsheet.org | Ball-by-ball data (IPL, T20I, ODI, Tests) | Unlimited | ML Training |
| Kaggle Datasets | Pre-cleaned cricket datasets | Unlimited | ML Training |
| CricketData.org | Live scores, scorecards, fantasy points | 100 req/key | Live Scores |
| TheSportsDB | Team logos, player photos, metadata | 1,000 req/day | Metadata |

**Key Rotation:** 7 team members x 100 req/day = **700 calls/day** per API. With Redis caching, actual usage is ~250 calls/day.

---

## Design System

- **Dark mode** (default) - `#0E1117` background
- **Light mode** - `#F4F6F9` background
- **Brand Blue** - `#1A6BFF` (CTAs, links)
- **Accent Orange** - `#FF6B35` (LIVE indicator, alerts)
- **Font** - Inter via Google Fonts

---

## Team and Sprint

| Role | Member | Focus |
|------|--------|-------|
| ML Engineer (Lead) | M1 | XGBoost models, FastAPI endpoints |
| ML Engineer (Data) | M2 | Feature engineering, Cricsheet ETL |
| Backend Lead | M3 | Spring Boot, Firebase Auth, REST APIs |
| Backend (ETL) | M4 | @Scheduled jobs, API key rotation, Redis |
| Frontend | M5 | React pages, CSS design system, charts |
| Database and Analytics | M6 | PostgreSQL schema, Chart.js, SQL views |
| DevOps | M7 | Docker, CI/CD, deployment, monitoring |

**7-day sprint - May 2026**

---

## Non-Negotiable Rules

- Never commit `.env` to GitHub
- Never call sports API from frontend code
- Never store passwords in your database
- Never skip the Redis cache check
- Never poll API when no match is live
- Never push directly to `main`
- Never hardcode credentials in code

---

## License

Internal project - not for public distribution.

Cache	Redis
Auth	Firebase Authentication
ML	Python + XGBoost + FastAPI
Containers	Docker + Docker Compose
CI/CD	GitHub Actions
Quick Start
git clone https://github.com/YOUR_USERNAME/SportPulse.gitcd SportPulsecp .env.example .envdocker-compose up --build
Frontend: http://localhost:5173
Backend: http://localhost:8080
ML Service: http://localhost:8000
Team
7 members · 7-day sprint · May 2026