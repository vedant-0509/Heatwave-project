# UrbanHeat API Contracts

All routes use `/api/v1`.

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/health` | Runtime status, loaded ward count, data and ML limitations |
| GET | `/ready` | 200 when configured persistence and datasets are ready; 503 otherwise |
| GET | `/wards/geojson` | Greater Mumbai ward FeatureCollection |
| GET | `/wards/metrics` | Ward records keyed by stable `ward_id` |
| GET | `/wards/live-metrics` | Compatibility route; static/demo records when live ingestion is unavailable |
| POST | `/wards/refresh-live` | Compatibility refresh route |
| GET | `/weather/current` | Open-Meteo current weather with coordinate validation and stale-cache metadata |
| GET | `/weather/historical` | Open-Meteo daily weather model points; satellite LST is unavailable |
| GET | `/air-quality/current` | Latest OpenAQ station measurements near the requested coordinates, or explicit unavailable status |
| GET | `/ml/summary` | Rule-based archetype and illustrative regression summary |
| GET | `/ml/clusters` | Archetype summary |
| POST | `/ml/simulate` | Validated intervention sensitivity scenario |
| GET | `/satellite/lst/status` | Satellite provider availability contract |
| GET | `/satellite/lst` | Latest satellite result or explicit unavailable response |
| POST | `/auth/register` | Create a local account; first account receives the admin role |
| POST | `/auth/login` | Authenticate and return a signed 24-hour bearer token |
| GET | `/auth/me` | Return the authenticated account |
| GET | `/users/saved-wards` | Return saved ward IDs for the authenticated account |
| PUT | `/users/saved-wards` | Replace saved ward IDs for the authenticated account |
| POST | `/admin/wards/refresh` | Admin-only status endpoint for the demo/static refresh pipeline |
| POST | `/wards/compare` | Compare up to five stable ward IDs and rank by HVI |
| GET | `/wards/recommendations/:wardId` | Return explainable factor-based recommendations |
| GET | `/alerts` | Return demo heat alerts for wards at or above the high-risk threshold |
| GET | `/reports/wards.csv` | Download the current ward metrics as CSV |

Invalid simulation payloads return HTTP 422. Invalid coordinates and historical ranges return HTTP 400. Provider failures return HTTP 503. Unknown routes return HTTP 404 with `{ "detail": "Route not found." }`.

Authentication routes require `USE_MONGODB=true`; protected routes accept `Authorization: Bearer <token>`. The comparison, recommendation, alert, and report routes are read-only and can be used without authentication. Ward environmental fields remain explicitly labelled demo data, and satellite LST remains unavailable until a provider is configured.

OpenAQ is optional and requires `OPENAQ_ENABLED=true` plus a free `OPENAQ_API_KEY`. NASA MODIS/VIIRS and HLS are satellite products with observation/processing latency; they must not be labelled instantaneous live values. Their credentials and product configuration are intentionally backend-only.
