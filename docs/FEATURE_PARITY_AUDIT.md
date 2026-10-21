# UrbanHeat Python-to-MERN Feature Parity Audit

## Scope and sources

The Python reference was extracted from `UrbanHeat_Final_Project.zip` and the MERN candidate from `UrbanHeat-MERN-migration.zip`. The working project is the MERN candidate with the authoritative reference data and frontend parity files merged into it. The archives remain unchanged in the session migration workspace.

## Feature matrix

| Feature | Python evidence | MERN implementation | Status | Acceptance check |
| --- | --- | --- | --- | --- |
| Landing page and dashboard | `frontend/src/App.tsx`, `components/Landing`, `components/Dashboard` | Same React surfaces under `frontend/src` | Complete | Frontend build and `/explore` smoke test |
| Mumbai ward map | `main.py` GeoJSON route and `frontend/src/components/Map` | Express `/api/v1/wards/geojson`, MapLibre `MapView` | Complete | GeoJSON contains 24 ward polygons and build passes |
| Ward selection/search | Python frontend `Header`, `MapView`, `Dashboard` | Migrated React `Header`, `MapView`, `Dashboard` | Complete | Ward selection updates inspector and map properties |
| HVI/LST/NDVI/NDBI layers | Python `layers.ts`, ward metrics JSON | Migrated `layers.ts`, metrics JSON and MapLibre layer projection | Complete | Metric IDs and feature IDs are joined before rendering |
| Ward details/provenance | Python `MetricDetailsPanel`, `VegetationMetricDetails`, `InfoPopover` | Same components and expanded `WardMetrics` type | Complete | Demo, unavailable, source and limitation fields render |
| City summary/rankings | Python `Dashboard` derived summary | MERN `Dashboard` derives summary from active records | Complete | Summary uses current record set, not hardcoded counts |
| Current weather | Python `main.py` Open-Meteo route | TypeScript `weather.ts` with validation, timeout and cache | Complete | `/weather/current` returns API or explicit stale/503 status |
| Historical weather | Python `/weather/historical` | TypeScript `/weather/historical` with daily model fields and null LST | Complete | No weather value is mislabeled as satellite LST |
| Live refresh compatibility | Python live ingestion routes | Express compatibility routes return authoritative records | Complete with limitation | Refresh is explicitly demo/static unless a provider is configured |
| ML/archetypes | Python `ml/engine.py` threshold archetypes | `backend/src/analytics.ts` threshold archetypes | Complete | No fabricated K-Means/silhouette claims |
| Regression/simulation | Python illustrative coefficients and simulator | TypeScript `regressionSummary` and `simulate` | Complete | Existing analytics tests verify risk boundaries and arithmetic |
| Satellite availability | Python `satellite_pipeline.py` availability contract | Express `/api/v1/satellite/lst/status` and `/lst` | Complete with limitation | Returns unavailable rather than invented scenes |
| MongoDB persistence | Python reference had no required Mongo runtime | Mongoose `Ward` model, optional data store, idempotent seed | Complete | Seed validates stable IDs and reports insert/update/unchanged/skipped |
| Static offline mode | Bundled JSON/GeoJSON | `USE_MONGODB=false` data store fallback | Complete | App starts without MongoDB or Python |
| Error/loading states | Python frontend loading/error/stale notices | Migrated React states and centralized Express errors | Complete | Build/lint and endpoint contract tests |

## Verified differences and limitations

1. The reference project labels the satellite pipeline unavailable unless configured. The MERN runtime preserves that truthful behavior; it does not invent satellite observations.
2. The reference ML module is rule-based and explicitly unvalidated. The MERN implementation keeps the threshold behavior and returns `null` evaluation values rather than copying fabricated scores.
3. MongoDB is optional in local-demo mode. When `USE_MONGODB=true`, the server requires a connected MongoDB instance and reads the `Ward` collection.
4. Weather is external and can fail. The MERN client displays provider errors or stale-cache metadata rather than synthesizing a successful live response.

## Search results for Python runtime dependency

The active Node server imports only TypeScript/Node modules. Python files under `backend/app` and `ml` are retained as reference material from the supplied migration archive; they are not imported by `backend/src/server.ts`, the frontend, build scripts, or runtime startup.
