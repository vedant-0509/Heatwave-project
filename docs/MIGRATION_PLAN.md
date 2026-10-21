# UrbanHeat Node/Mongo Migration Plan

## Inventory

The legacy FastAPI application exposed:

| Method | Route | Replacement |
| --- | --- | --- |
| GET | `/api/v1/health` | Express health route |
| GET | `/api/v1/ready` | Express readiness route |
| GET | `/api/v1/wards/geojson` | Express GeoJSON route |
| GET | `/api/v1/wards/metrics` | Express metrics route |
| GET | `/api/v1/wards/live-metrics` | Express compatibility route |
| POST | `/api/v1/wards/refresh-live` | Express compatibility route |
| GET | `/api/v1/ml/summary` | TypeScript analytics route |
| GET | `/api/v1/ml/clusters` | TypeScript analytics route |
| POST | `/api/v1/ml/simulate` | Validated TypeScript simulation route |
| GET | `/api/v1/weather/current` | Open-Meteo TypeScript integration |
| GET | `/api/v1/weather/historical` | Open-Meteo TypeScript integration |

## Decisions

- The React frontend and its visible UI are retained. Existing API paths remain under `/api/v1`.
- The authoritative JSON files remain the reproducible local-demo source. MongoDB seeding is available through `backend/src/scripts/seedDatabase.ts`; this avoids requiring a database for static map development.
- The legacy analytics implementation is deterministic threshold clustering and empirical regression, not a trained model. The TypeScript implementation preserves those formulas and response fields.
- Weather provider errors return explicit 4xx/5xx responses. The backend does not fabricate weather data after a provider failure.

## Verification order

1. Build and test the backend.
2. Run the frontend lint and production build.
3. Start Express and Vite independently and verify the existing dashboard API calls.
4. Run the MongoDB seed script against a local MongoDB instance when database-backed deployment is required.
