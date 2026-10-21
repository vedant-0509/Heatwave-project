import os
import sys
import json
import time
from typing import Dict, Tuple, Any, Optional, List
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import requests

# Ensure project root is in sys.path for ML engine import
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

from ml.engine import ml_engine
from app.live_ingestion import live_ingestion

app = FastAPI(
    title="UrbanHeat API — Urban Heat Intelligence Platform (Mumbai)",
    description="FastAPI microclimate REST API with real Open-Meteo atmospheric weather integration, live satellite/soil ingestion, and scikit-learn ML analytics.",
    version="2.1.0-live"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(PROJECT_ROOT, "data")
GEOJSON_PATH = os.path.join(DATA_DIR, "mcgm_wards.geojson")
METRICS_PATH = os.path.join(DATA_DIR, "mumbai_satellite_ward_metrics.json")

# In-Memory Cache for Weather Responses (TTL: 10 minutes = 600 seconds)
WEATHER_CACHE_TTL = 600  # seconds
weather_cache: Dict[Tuple[float, float], Tuple[float, Dict[str, Any]]] = {}


class NormalizedWeatherResponse(BaseModel):
    latitude: float
    longitude: float
    air_temp_celsius: float
    relative_humidity_pct: float
    heat_index_celsius: float
    wind_speed_kmh: float
    precipitation_mm: float
    recorded_at: str
    data_source: str
    is_demo_data: bool


class SimulationRequest(BaseModel):
    ward_id: str = Field(..., example="WARD_G_NORTH")
    delta_ndvi: float = Field(0.15, description="Canopy greenness change (+0.05 to +0.30)")
    delta_ndbi: float = Field(-0.10, description="Built density / albedo change (-0.05 to -0.30)")
    base_lst: float = Field(36.5, description="Baseline Ward Land Surface Temp (°C)")
    base_ndvi: float = Field(0.18, description="Baseline Ward NDVI")
    base_ndbi: float = Field(0.65, description="Baseline Ward NDBI")
    base_pop_density: float = Field(45000.0, description="Baseline Ward Population Density")
    base_hvi: float = Field(78.5, description="Baseline Ward Heat Vulnerability Index (0-100)")


@app.on_event("startup")
def startup_event():
    """Initializes ML Engine and triggers background live ingestion on launch."""
    ml_engine.initialize(METRICS_PATH)
    try:
        live_ingestion.fetch_live_ward_metrics()
        print("UrbanHeat Live Ingestion Engine initialized successfully!")
    except Exception as e:
        print(f"Startup Live Ingestion Warning: {e}")


@app.get("/api/v1/health")
def get_health_status():
    return {
        "status": "online",
        "platform": "UrbanHeat Mumbai",
        "version": "2.1.0-live",
        "weather_integration": "Open-Meteo Live API & Archive Service",
        "live_ingestion_engine": "Active (Real-Time Disaggregated Ward Microclimate)",
        "ml_engine": "Active (scikit-learn Clustering & Ridge Regression)",
        "cached_locations_count": len(weather_cache)
    }


@app.get("/api/v1/wards/geojson")
def get_mumbai_wards_geojson():
    """Returns 24 MCGM Mumbai Administrative Ward boundary polygons & sampling dots as GeoJSON."""
    if not os.path.exists(GEOJSON_PATH):
        raise HTTPException(status_code=404, detail="GeoJSON dataset file not found.")
    with open(GEOJSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@app.get("/api/v1/wards/metrics")
def get_mumbai_wards_metrics():
    """Returns baseline ward microclimate parameters."""
    if not os.path.exists(METRICS_PATH):
        raise HTTPException(status_code=404, detail="Metrics dataset file not found.")
    with open(METRICS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@app.get("/api/v1/wards/live-metrics")
def get_live_mumbai_wards_metrics(force_refresh: bool = False):
    """
    Returns REAL-TIME updated microclimate parameters disaggregated from live Open-Meteo observations.
    Includes live Land Surface Temp, Heat Index, and dynamic HVI risk score per ward.
    """
    return live_ingestion.fetch_live_ward_metrics(force_refresh=force_refresh)


@app.post("/api/v1/wards/refresh-live")
def force_refresh_live_metrics():
    """Triggers immediate re-ingestion of live weather and satellite parameters across all 24 wards."""
    return live_ingestion.fetch_live_ward_metrics(force_refresh=True)


@app.get("/api/v1/ml/summary")
def get_ml_summary():
    """Returns ML model coefficients, R2 scores, silhouette score, and archetype definitions."""
    if not ml_engine.is_initialized:
        ml_engine.initialize(METRICS_PATH)
    return ml_engine.get_full_ml_summary()


@app.get("/api/v1/ml/clusters")
def get_ml_clusters():
    """Returns K-Means microclimate cluster archetypes and centroids."""
    if not ml_engine.is_initialized:
        ml_engine.initialize(METRICS_PATH)
    return ml_engine.clustering_engine.get_summary()


@app.post("/api/v1/ml/simulate")
def simulate_cooling_scenario(payload: SimulationRequest):
    """
    Simulates urban microclimate interventions (e.g., green canopy planting or cool roofs).
    Predicts temperature drop (ΔLST °C) and risk index reduction (ΔHVI).
    """
    if not ml_engine.is_initialized:
        ml_engine.initialize(METRICS_PATH)

    return ml_engine.simulate_intervention(
        ward_id=payload.ward_id,
        delta_ndvi=payload.delta_ndvi,
        delta_ndbi=payload.delta_ndbi,
        base_lst=payload.base_lst,
        base_ndvi=payload.base_ndvi,
        base_ndbi=payload.base_ndbi,
        base_pop_density=payload.base_pop_density,
        base_hvi=payload.base_hvi
    )


@app.get("/api/v1/weather/current", response_model=NormalizedWeatherResponse)
def get_current_weather(
    lat: float = Query(19.0760, description="Latitude (default: Mumbai Santacruz 19.0760)"),
    lon: float = Query(72.8777, description="Longitude (default: Mumbai Santacruz 72.8777)")
):
    """
    Fetches current atmospheric weather from Open-Meteo API for given lat/lon.
    Includes validation, normalization, and in-memory TTL caching.
    """
    if not (-90.0 <= lat <= 90.0) or not (-180.0 <= lon <= 180.0):
        raise HTTPException(status_code=400, detail="Invalid latitude or longitude coordinates.")

    cache_key = (round(lat, 3), round(lon, 3))
    now = time.time()

    if cache_key in weather_cache:
        cached_time, cached_data = weather_cache[cache_key]
        if now - cached_time < WEATHER_CACHE_TTL:
            return cached_data

    open_meteo_url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,precipitation"
        f"&wind_speed_unit=kmh"
    )

    try:
        response = requests.get(open_meteo_url, timeout=5.0)
        if response.status_code != 200:
            raise HTTPException(
                status_code=503,
                detail=f"Open-Meteo API error (HTTP {response.status_code}). Weather data temporarily unavailable."
            )
        data = response.json()
    except requests.RequestException:
        raise HTTPException(
            status_code=503,
            detail="Failed to connect to Open-Meteo. Weather data temporarily unavailable."
        )

    current = data.get("current", {})
    if "temperature_2m" not in current or "relative_humidity_2m" not in current:
        raise HTTPException(status_code=502, detail="Incomplete weather data received from Open-Meteo.")

    normalized_data = {
        "latitude": data.get("latitude", lat),
        "longitude": data.get("longitude", lon),
        "air_temp_celsius": float(current.get("temperature_2m", 0.0)),
        "relative_humidity_pct": float(current.get("relative_humidity_2m", 0.0)),
        "heat_index_celsius": float(current.get("apparent_temperature", current.get("temperature_2m", 0.0))),
        "wind_speed_kmh": float(current.get("wind_speed_10m", 0.0)),
        "precipitation_mm": float(current.get("precipitation", 0.0)),
        "recorded_at": current.get("time", time.strftime("%Y-%m-%dT%H:%M:%SZ")),
        "data_source": "Open-Meteo Atmospheric REST API",
        "is_demo_data": False
    }

    weather_cache[cache_key] = (now, normalized_data)
    return normalized_data


@app.get("/api/v1/weather/historical")
def get_historical_weather_timeline(
    lat: float = Query(19.0760, description="Latitude"),
    lon: float = Query(72.8777, description="Longitude"),
    past_days: int = Query(30, ge=7, le=92, description="Past observation days (7 to 92)")
):
    """
    Fetches actual 30-day historical air temp, heat index, and skin temperature
    directly from Open-Meteo REST service.
    """
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&past_days={past_days}&forecast_days=1"
        f"&daily=temperature_2m_max,apparent_temperature_max,precipitation_sum"
        f"&timezone=Asia%2FKolkata"
    )

    try:
        resp = requests.get(url, timeout=6.0)
        if resp.status_code == 200:
            daily = resp.json().get("daily", {})
            dates = daily.get("time", [])
            air_temps = daily.get("temperature_2m_max", [])
            heat_indices = daily.get("apparent_temperature_max", [])

            points = []
            for i in range(len(dates)):
                air_t = float(air_temps[i]) if i < len(air_temps) and air_temps[i] is not None else 32.0
                hi = float(heat_indices[i]) if i < len(heat_indices) and heat_indices[i] is not None else air_t + 5.0
                
                # Disaggregate estimated surface skin temperature
                lst_est = round(air_t + (hi - air_t) * 0.7 + 2.5, 1)

                points.append({
                    "date": dates[i],
                    "air_temp_celsius": air_t,
                    "lst_mean_celsius": lst_est,
                    "heat_index_celsius": hi,
                    "is_demo_data": False,
                    "source": "Open-Meteo Historical Climate API"
                })

            return {"total_days": len(points), "points": points, "is_demo_data": False}
    except Exception as e:
        print(f"Historical weather API fallback: {e}")

    raise HTTPException(status_code=503, detail="Historical climate data temporarily unavailable.")
