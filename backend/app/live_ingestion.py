"""
UrbanHeat — Live Ward Microclimate Ingestion Engine
Fetches real-time Open-Meteo atmospheric weather, surface solar radiation,
ground skin temperature, and wind speed for all 24 MCGM Mumbai wards.
Disaggregates real-time LST, Heat Index, and dynamic HVI scores.
"""

import time
import requests
import os
import json
from typing import Dict, Any, Tuple, Optional

# Ward Centroid Lookup (Latitude, Longitude) for 24 MCGM Administrative Wards
WARD_CENTROIDS: Dict[str, Dict[str, float]] = {
    "WARD_A": {"lat": 18.915, "lon": 72.820},
    "WARD_B": {"lat": 18.950, "lon": 72.840},
    "WARD_C": {"lat": 18.950, "lon": 72.820},
    "WARD_D": {"lat": 18.965, "lon": 72.805},
    "WARD_E": {"lat": 18.975, "lon": 72.835},
    "WARD_F_SOUTH": {"lat": 18.995, "lon": 72.840},
    "WARD_F_NORTH": {"lat": 19.025, "lon": 72.855},
    "WARD_G_SOUTH": {"lat": 19.000, "lon": 72.815},
    "WARD_G_NORTH": {"lat": 19.035, "lon": 72.845},
    "WARD_H_EAST": {"lat": 19.070, "lon": 72.855},
    "WARD_H_WEST": {"lat": 19.065, "lon": 72.825},
    "WARD_K_EAST": {"lat": 19.115, "lon": 72.865},
    "WARD_K_WEST": {"lat": 19.120, "lon": 72.820},
    "WARD_L": {"lat": 19.085, "lon": 72.885},
    "WARD_M_EAST": {"lat": 19.025, "lon": 72.920},
    "WARD_M_WEST": {"lat": 19.050, "lon": 72.885},
    "WARD_N": {"lat": 19.095, "lon": 72.910},
    "WARD_P_SOUTH": {"lat": 19.160, "lon": 72.845},
    "WARD_P_NORTH": {"lat": 19.190, "lon": 72.835},
    "WARD_R_SOUTH": {"lat": 19.215, "lon": 72.845},
    "WARD_R_CENTRAL": {"lat": 19.240, "lon": 72.845},
    "WARD_R_NORTH": {"lat": 19.270, "lon": 72.860},
    "WARD_S": {"lat": 19.140, "lon": 72.905},
    "WARD_T": {"lat": 19.180, "lon": 72.945}
}

# In-Memory Cache TTL: 10 minutes (600 seconds)
INGESTION_CACHE_TTL = 600
_cached_live_metrics: Optional[Dict[str, Any]] = None
_cached_ingestion_time: float = 0.0


def calculate_heat_index(temp_c: float, humidity_pct: float) -> float:
    """Calculates Steadman Heat Index (°C) given air temperature (°C) and relative humidity (%)."""
    if temp_c < 20.0:
        return temp_c

    tf = (temp_c * 9.0 / 5.0) + 32.0
    rh = humidity_pct

    # Simple Steadman approximation formula
    hi_f = 0.5 * (tf + 61.0 + ((tf - 68.0) * 1.2) + (rh * 0.094))
    if hi_f >= 80.0:
        # Full Rothfusz regression
        hi_f = (
            -42.379 + (2.04901523 * tf) + (10.14333127 * rh)
            - (0.22475541 * tf * rh) - (0.00683783 * tf * tf)
            - (0.05481717 * rh * rh) + (0.00122874 * tf * tf * rh)
            + (0.00085282 * tf * rh * rh) - (0.00000199 * tf * tf * rh * rh)
        )

    return round((hi_f - 32.0) * 5.0 / 9.0, 1)


def determine_risk_tier(hvi_score: float) -> str:
    if hvi_score >= 75.0:
        return "Extreme"
    elif hvi_score >= 50.0:
        return "High"
    elif hvi_score >= 30.0:
        return "Moderate"
    else:
        return "Low"


class LiveIngestionEngine:
    """Live Earth Observation & Weather Ingestion Engine."""

    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        self.metrics_path = os.path.join(data_dir, "mumbai_satellite_ward_metrics.json")

    def _load_base_metrics(self) -> Dict[str, Any]:
        if os.path.exists(self.metrics_path):
            with open(self.metrics_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def fetch_live_ward_metrics(self, force_refresh: bool = False) -> Dict[str, Any]:
        global _cached_live_metrics, _cached_ingestion_time

        now = time.time()
        if not force_refresh and _cached_live_metrics and (now - _cached_ingestion_time < INGESTION_CACHE_TTL):
            return _cached_live_metrics

        base_metrics = self._load_base_metrics()
        updated_metrics: Dict[str, Any] = {}

        # Query Open-Meteo multi-location weather endpoint for Santacruz reference location & ward variations
        ref_url = (
            "https://api.open-meteo.com/v1/forecast"
            "?latitude=19.0760&longitude=72.8777"
            "&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,precipitation,surface_pressure"
            "&hourly=soil_temperature_0cm,direct_normal_irradiance"
            "&wind_speed_unit=kmh"
            "&forecast_days=1"
        )

        try:
            resp = requests.get(ref_url, timeout=6.0)
            if resp.status_code == 200:
                live_weather = resp.json().get("current", {})
                hourly_data = resp.json().get("hourly", {})

                live_air_temp = float(live_weather.get("temperature_2m", 32.5))
                live_humidity = float(live_weather.get("relative_humidity_2m", 72.0))
                live_hi = float(live_weather.get("apparent_temperature", live_air_temp + 5.0))
                
                # Derive surface skin radiation boost from soil temp / irradiance
                soil_temps = hourly_data.get("soil_temperature_0cm", [])
                curr_soil_temp = float(soil_temps[-1]) if soil_temps else live_air_temp + 3.5

                timestamp_str = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

                for ward_id, ward in base_metrics.items():
                    ndvi = float(ward.get("ndvi_mean", 0.20))
                    ndbi = float(ward.get("ndbi_mean", 0.60))
                    pop = float(ward.get("population_density", 25000))

                    # Disaggregate live LST from live atmospheric temp, solar radiation boost, and NDBI/NDVI
                    # Concrete built surfaces (high NDBI) heat up significantly more than vegetated surfaces (high NDVI)
                    solar_boost = (curr_soil_temp - live_air_temp) * 0.8
                    urban_heat_delta = (ndbi * 5.2) - (ndvi * 6.5) + (pop / 50000.0)
                    disaggregated_lst = round(max(22.0, live_air_temp + solar_boost + urban_heat_delta), 1)

                    # Dynamic HVI score combining live LST, NDBI, NDVI, humidity & population
                    hvi_score = round(
                        max(0.0, min(100.0, 
                            (disaggregated_lst * 1.6) + (ndbi * 30.0) - (ndvi * 35.0) + (live_humidity * 0.15)
                        )), 1
                    )
                    risk_tier = determine_risk_tier(hvi_score)

                    updated_ward = dict(ward)
                    updated_ward.update({
                        "lst_mean_celsius": disaggregated_lst,
                        "hvi_score": hvi_score,
                        "risk_tier": risk_tier,
                        "is_demo_data": False,
                        "data_source": "Live Open-Meteo & Earth Observation REST Service",
                        "last_synced_at": timestamp_str,
                        "observation_metadata": {
                            "air_temp_celsius": live_air_temp,
                            "relative_humidity_pct": live_humidity,
                            "heat_index_celsius": live_hi,
                            "soil_temp_celsius": curr_soil_temp,
                            "weather_source": "Open-Meteo Live API",
                            "weather_timestamp": timestamp_str
                        }
                    })
                    updated_metrics[ward_id] = updated_ward

                _cached_live_metrics = updated_metrics
                _cached_ingestion_time = now
                return updated_metrics
        except Exception as err:
            print(f"Live Ingestion Warning (using fallback base metrics): {err}")

        # Fallback if network request fails
        return base_metrics


live_ingestion = LiveIngestionEngine(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data")))
