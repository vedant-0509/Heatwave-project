# UrbanHeat Data Provenance

- `data/mcgm_wards.geojson` contains the checked-in MCGM ward boundaries.
- `data/mumbai_satellite_ward_metrics.json` contains 24 stable ward records. Its replicated/demo values are marked `is_demo_data: true`; the migration does not relabel them as fresh satellite observations.
- Current and historical atmospheric values come from Open-Meteo when the provider succeeds. Responses include source, retrieval timestamp, timezone, and freshness status. Apparent temperature remains labelled as apparent temperature and is not silently relabeled as a separately calculated heat index.
- The historical weather response uses the legacy heuristic `air + 0.7 * (apparent - air) + 2.5` only when that compatibility field is available in the reference behavior. It is not represented as a satellite measurement.
- No verified satellite ingestion provider is configured. `/api/v1/satellite/lst/status` and `/api/v1/satellite/lst` explicitly report unavailability.
- When MongoDB is enabled, the `Ward` collection stores validated records under unique indexed `ward_id` values. `npm run seed` performs idempotent upserts and reports insert/update/unchanged/skipped counts without dropping data.
