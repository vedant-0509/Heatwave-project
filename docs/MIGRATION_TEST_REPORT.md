# UrbanHeat Migration Test Report

The backend compatibility tests cover risk-tier boundaries and intervention arithmetic. The backend TypeScript build validates the Express source and seed script. The frontend remains the migrated React application; its configured lint and production build commands are documented in the root README.

Run from `Urban_heat_wave`:

```powershell
cd backend
npm test
npm run build
cd ..\frontend
npm run lint
npm run build
```

Live Open-Meteo checks are intentionally not part of deterministic tests. They require network access and are surfaced as provider errors or stale-cache responses when unavailable.

## Results from this migration

- Backend TypeScript build: passed.
- Backend Vitest suite: passed.
- Frontend TypeScript/Vite production build: passed.
- Frontend Oxlint: passed with the existing Fast Refresh warning in `RouterContext.tsx`.
- Runtime smoke test: passed for health, satellite status, ML summary, and ward metrics.

MongoDB seed execution was not run because no user-provided MongoDB deployment was available. The seed is type-checked and uses idempotent upserts; it does not reset or drop collections. Browser automation was not available, so visual interaction testing remains a manual acceptance step.
