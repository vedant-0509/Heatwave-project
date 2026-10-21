# UrbanHeat — System Architecture & Scientific Documentation

## 1. Overview
UrbanHeat is an Urban Heat Intelligence and Risk Mapping Platform designed for **Greater Mumbai, India**. The platform disaggregates atmospheric weather observations from satellite-derived surface temperature skin observations.

## 2. Scientific Data Disaggregation
- **Air Temperature ($T_{air}$)**: Open-Meteo weather-model output at the requested coordinates.
- **Apparent Temperature**: Provider-computed feels-like value. It is not relabeled as a separately calculated heat index.
- **Land Surface Temperature ($LST$)**: The bundled ward surface-temperature-like field is demo data. Verified satellite observations are unavailable in this runtime and are exposed as unavailable through `/api/v1/satellite/lst`.
- **Vegetation Index ($NDVI$)** and **Built-up Index ($NDBI$)**: Bundled demonstration ward metrics; their original source and processing provenance are not independently verified.

## 3. Data Science Component
- **HVI**: Bundled project-defined scores are served unchanged and explicitly marked as demo data; the runtime does not recompute them from unavailable satellite observations.
- **Microclimate archetypes**: Deterministic threshold assignment preserved from the reference implementation. This is not K-Means and returns no fabricated silhouette score.
- **Intervention sensitivity**: Fixed illustrative coefficients are used for the what-if simulator. It is explicitly marked unvalidated and is not a predictive model.

## 4. Runtime Architecture
- **Frontend**: Vite + React + TypeScript + MapLibre GL JS + Recharts + Tailwind CSS.
- **Backend**: Node.js + Express + TypeScript REST service.
- **Persistence**: Optional MongoDB/Mongoose `Ward` collection with stable `ward_id` upserts; local-demo mode reads the checked-in datasets.
- **Data**: Preprocessed static GeoJSON (`data/mcgm_wards.geojson`) and structured metrics (`data/mumbai_satellite_ward_metrics.json`). Demo and unavailable fields remain explicitly labeled.
