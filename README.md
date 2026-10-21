# UrbanHeat — Urban Heat Intelligence & Risk Mapping Platform (Mumbai)

[![UrbanHeat Phase 1](https://img.shields.io/badge/Status-Phase%201%20Frontend%20%26%20Data%20Foundation-emerald)](https://github.com)

UrbanHeat is a spatial microclimate intelligence web application designed for **Greater Mumbai, India**. The platform synthesizes satellite-derived Land Surface Temperature (LST), atmospheric weather, environmental vegetation/built-up indices (NDVI/NDBI), and administrative ward demographics into an interactive geospatial risk assessment platform.

---

## 1. Project Directory Structure

```
Urban_heat_wave/
├── frontend/             # Vite + React + TypeScript + MapLibre GL JS + Tailwind CSS
│   ├── public/data/      # Bundled static GeoJSON & DEMO datasets for offline dev
│   ├── src/
│   │   ├── components/   # Header, MapView, LayerSelector, MapLegend, Sidebar, Inspector
│   │   ├── constants/    # Layer configurations & color scales
│   │   ├── services/     # API client with automatic backend fallback
│   │   ├── types/        # TypeScript interfaces & types
│   │   ├── App.tsx       # Root layout & state manager
│   │   └── index.css     # Global CSS & glassmorphism utilities
├── backend/              # Node.js + Express REST service
│   ├── src/               # Routes, analytics, weather integration, and seed script
│   ├── tests/             # Deterministic backend compatibility tests
│   └── package.json
├── data/                 # Master GeoJSON boundaries & satellite metrics
│   ├── mcgm_wards.geojson                     # 24 MCGM Mumbai Ward Polygons
│   └── mumbai_satellite_ward_metrics.json    # Ward-level thermal metrics
├── ml/                   # Legacy/reference Python modules; not required at runtime
├── scripts/              # Legacy/reference data-generation helpers
├── docs/                 # Architecture, contracts, provenance, parity and test reports
└── README.md
```

---

## 2. Quick Start Guide

### Windows PowerShell: frontend
```powershell
Set-Location "C:\path\to\Urban_heat_wave\frontend"
npm install
npm run dev -- --host 127.0.0.1
```
The frontend dev server will launch at `http://localhost:5173`.

### Windows PowerShell: backend
```powershell
Set-Location "C:\path\to\Urban_heat_wave\backend"
npm install
Copy-Item .env.example .env -ErrorAction SilentlyContinue
npm run dev
```
The API is available at `http://localhost:8000/api/v1`. Python is not required by the active runtime.

The backend uses the checked-in datasets in local-demo mode (`USE_MONGODB=false`), so MongoDB is optional for the dashboard. To seed MongoDB, start a local MongoDB service, set `USE_MONGODB=true` and `MONGODB_URI` in `backend/.env`, then run `npm run seed`. Seeding is idempotent and never drops unrelated collections.

### Windows PowerShell: MongoDB mode

Install MongoDB Community Server or use a MongoDB deployment, then configure `backend\.env`:

```powershell
Set-Location "C:\path\to\Urban_heat_wave\backend"
Copy-Item .env.example .env
# Edit .env and set USE_MONGODB=true and MONGODB_URI as needed.
npm run seed
npm run dev
```

The seed command validates stable ward IDs and reports inserted, updated, unchanged, skipped, source, and seeded counts. It never drops collections.

MongoDB mode also enables local JWT authentication, saved wards, admin-only refresh status, ward comparison, factor-based recommendations, demo heat alerts, and CSV export. Register or log in through the `/api/v1/auth` routes; the first registered account is an administrator. Keep `JWT_SECRET` private and replace the development value before deployment.

### Free live and near-live data providers

Open-Meteo weather is already enabled without a key. To add measured air quality, create a free OpenAQ API key and set:

```env
OPENAQ_ENABLED=true
OPENAQ_API_KEY=your-key
OPENAQ_RADIUS_METERS=15000
```

The dashboard then calls `/api/v1/air-quality/current` and displays the latest nearby station measurements with their measurement timestamps. If no station or key is available, it shows an explicit unavailable status and never substitutes demo air-quality values.

NASA MODIS/VIIRS LST and NASA HLS NDVI/NDBI are free/open satellite products, but they are not instantaneous: satellite overpass, cloud screening, processing, and download latency apply. They require a separate NASA Earthdata/provider ingestion configuration. Until that provider is configured, the existing ward LST/NDVI/NDBI/HVI values remain labelled demo fallback values.

The MERN runtime includes the functionality previously implemented in the Python project:

- Ward GeoJSON mapping, HVI/LST/NDVI/NDBI/cluster layers, ward inspection, metric detail and provenance panels.
- Current and historical Open-Meteo weather integration with bounded caching and explicit stale/error states.
- Rule-based microclimate archetypes and transparent, unvalidated intervention sensitivity simulation.
- Science/education modal, factor breakdowns, vegetation details, historical trends, and satellite-LST availability status.
- Ward CSV export from the dashboard header and API-backed comparison/recommendation/alert capabilities.

The Python files from the source project are retained only as scientific reference material; they are not required to run the MERN application.

### Checks
```powershell
cd backend
npm test
npm run build
cd ..\frontend
npm install
npm run lint
npm run build
```

Set `VITE_API_BASE_URL=http://localhost:8000/api/v1` in `frontend/.env.local` only when the backend uses a non-default URL. MongoDB credentials must remain in the backend environment only.

---

## 3. Current DEMO Data Architecture & Provenance

The bundled environmental ward metrics are explicitly marked as demo data. Current weather is API-backed when Open-Meteo succeeds; it may be stale or unavailable and is labeled accordingly.

- **Geographic Boundaries**: 24 administrative municipal wards of the Municipal Corporation of Greater Mumbai (MCGM / BMC), formatted from verified public GIS sources (`DataMeet / sanjanakrishnan/mumbai_spatial_data`).
- **Surface-temperature-like field and indices**: Bundled demonstration values. They are not verified satellite observations.
- **Atmospheric Weather**: Current and historical values are requested from Open-Meteo by the Node backend with timeout, cache, source, and freshness metadata.

Verified satellite ingestion is not configured. The API and UI explicitly report satellite LST as unavailable rather than inventing observations.

---

## 4. Scientific Terminology Standards

- **Air Temperature ($T_{air}$)**: Open-Meteo weather-model output at a requested coordinate.
- **Apparent Temperature**: Provider-computed feels-like value; not silently relabeled as a separately calculated heat index.
- **Land Surface Temperature ($LST$)**: Verified satellite observations are unavailable in the current runtime; bundled surface-temperature-like values remain demo data.
- **Baseline Heat Risk Index ($HVI$)**: Bundled project-defined score (0-100), preserved with provenance and limitations.

## Documentation

- [Feature parity audit](docs/FEATURE_PARITY_AUDIT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [API contracts](docs/API_CONTRACTS.md)
- [Data provenance](docs/DATA_PROVENANCE.md)
- [Migration plan](docs/MIGRATION_PLAN.md)
- [Migration test report](docs/MIGRATION_TEST_REPORT.md)

---
