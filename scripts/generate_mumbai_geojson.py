import json
import os
import math
import random

# 24 Administrative Wards of Greater Mumbai (MCGM / BMC)
wards_data = [
    {
        "id": "WARD_A",
        "code": "A",
        "name": "Colaba / Fort / Nariman Point",
        "zone": "Zone 1",
        "area_sqkm": 12.5,
        "bbox": [72.805, 18.890, 72.842, 18.940],
        "lst": 33.2,
        "ndvi": 0.28,
        "ndbi": 0.58,
        "pop_density": 18500,
        "hvi": 42.0,
        "cluster_id": 2,
        "cluster_name": "Coastal Moderate Microclimate"
    },
    {
        "id": "WARD_B",
        "code": "B",
        "name": "Sandhurst Road / Dongri",
        "zone": "Zone 1",
        "area_sqkm": 2.8,
        "bbox": [72.832, 18.940, 72.852, 18.962],
        "lst": 38.5,
        "ndvi": 0.08,
        "ndbi": 0.82,
        "pop_density": 85000,
        "hvi": 84.5,
        "cluster_id": 0,
        "cluster_name": "Concrete Thermal Hotspot"
    },
    {
        "id": "WARD_C",
        "code": "C",
        "name": "Marine Lines / Bhuleshwar",
        "zone": "Zone 1",
        "area_sqkm": 1.8,
        "bbox": [72.812, 18.940, 72.832, 18.962],
        "lst": 37.1,
        "ndvi": 0.11,
        "ndbi": 0.78,
        "pop_density": 92000,
        "hvi": 81.2,
        "cluster_id": 0,
        "cluster_name": "Concrete Thermal Hotspot"
    },
    {
        "id": "WARD_D",
        "code": "D",
        "name": "Malabar Hill / Tardeo / Girgaon",
        "zone": "Zone 1",
        "area_sqkm": 7.5,
        "bbox": [72.792, 18.950, 72.822, 18.982],
        "lst": 31.8,
        "ndvi": 0.42,
        "ndbi": 0.45,
        "pop_density": 38000,
        "hvi": 35.8,
        "cluster_id": 1,
        "cluster_name": "Vegetated Thermal Buffer"
    },
    {
        "id": "WARD_E",
        "code": "E",
        "name": "Byculla / Mazgaon",
        "zone": "Zone 1",
        "area_sqkm": 7.4,
        "bbox": [72.822, 18.962, 72.852, 18.992],
        "lst": 37.8,
        "ndvi": 0.14,
        "ndbi": 0.74,
        "pop_density": 58000,
        "hvi": 78.4,
        "cluster_id": 0,
        "cluster_name": "Concrete Thermal Hotspot"
    },
    {
        "id": "WARD_F_SOUTH",
        "code": "F/S",
        "name": "Parel / Lalbaug",
        "zone": "Zone 2",
        "area_sqkm": 14.0,
        "bbox": [72.830, 18.982, 72.855, 19.012],
        "lst": 36.9,
        "ndvi": 0.16,
        "ndbi": 0.71,
        "pop_density": 42000,
        "hvi": 72.1,
        "cluster_id": 0,
        "cluster_name": "Concrete Thermal Hotspot"
    },
    {
        "id": "WARD_F_NORTH",
        "code": "F/N",
        "name": "Wadala / Matunga / Sion",
        "zone": "Zone 2",
        "area_sqkm": 12.9,
        "bbox": [72.842, 19.012, 72.872, 19.042],
        "lst": 35.2,
        "ndvi": 0.25,
        "ndbi": 0.62,
        "pop_density": 38000,
        "hvi": 58.6,
        "cluster_id": 0,
        "cluster_name": "Concrete Thermal Hotspot"
    },
    {
        "id": "WARD_G_SOUTH",
        "code": "G/S",
        "name": "Worli / Lower Parel",
        "zone": "Zone 2",
        "area_sqkm": 10.0,
        "bbox": [72.802, 18.982, 72.832, 19.022],
        "lst": 34.5,
        "ndvi": 0.22,
        "ndbi": 0.65,
        "pop_density": 35000,
        "hvi": 52.3,
        "cluster_id": 2,
        "cluster_name": "Coastal Moderate Microclimate"
    },
    {
        "id": "WARD_G_NORTH",
        "code": "G/N",
        "name": "Dadar / Dharavi / Mahim",
        "zone": "Zone 2",
        "area_sqkm": 9.1,
        "bbox": [72.832, 19.022, 72.862, 19.052],
        "lst": 39.8,
        "ndvi": 0.07,
        "ndbi": 0.86,
        "pop_density": 110000,
        "hvi": 92.8,
        "cluster_id": 0,
        "cluster_name": "Concrete Thermal Hotspot"
    },
    {
        "id": "WARD_H_EAST",
        "code": "H/E",
        "name": "Bandra East / Khar East / Santacruz East",
        "zone": "Zone 3",
        "area_sqkm": 13.5,
        "bbox": [72.842, 19.052, 72.872, 19.092],
        "lst": 37.4,
        "ndvi": 0.18,
        "ndbi": 0.69,
        "pop_density": 45000,
        "hvi": 71.0,
        "cluster_id": 0,
        "cluster_name": "Concrete Thermal Hotspot"
    },
    {
        "id": "WARD_H_WEST",
        "code": "H/W",
        "name": "Bandra West / Khar West / Santacruz West",
        "zone": "Zone 3",
        "area_sqkm": 11.5,
        "bbox": [72.812, 19.042, 72.842, 19.092],
        "lst": 33.8,
        "ndvi": 0.31,
        "ndbi": 0.54,
        "pop_density": 32000,
        "hvi": 46.5,
        "cluster_id": 2,
        "cluster_name": "Coastal Moderate Microclimate"
    },
    {
        "id": "WARD_K_EAST",
        "code": "K/E",
        "name": "Andheri East / Vile Parle East / MIDC",
        "zone": "Zone 3",
        "area_sqkm": 24.8,
        "bbox": [72.842, 19.092, 72.892, 19.142],
        "lst": 38.1,
        "ndvi": 0.15,
        "ndbi": 0.75,
        "pop_density": 34000,
        "hvi": 76.8,
        "cluster_id": 0,
        "cluster_name": "Concrete Thermal Hotspot"
    },
    {
        "id": "WARD_K_WEST",
        "code": "K/W",
        "name": "Andheri West / Versova / Juhu",
        "zone": "Zone 3",
        "area_sqkm": 23.4,
        "bbox": [72.802, 19.092, 72.842, 19.152],
        "lst": 33.5,
        "ndvi": 0.33,
        "ndbi": 0.52,
        "pop_density": 31000,
        "hvi": 44.2,
        "cluster_id": 2,
        "cluster_name": "Coastal Moderate Microclimate"
    },
    {
        "id": "WARD_L",
        "code": "L",
        "name": "Kurla / Sakinaka",
        "zone": "Zone 5",
        "area_sqkm": 15.9,
        "bbox": [72.872, 19.062, 72.902, 19.112],
        "lst": 39.4,
        "ndvi": 0.09,
        "ndbi": 0.83,
        "pop_density": 56000,
        "hvi": 89.1,
        "cluster_id": 0,
        "cluster_name": "Concrete Thermal Hotspot"
    },
    {
        "id": "WARD_M_EAST",
        "code": "M/E",
        "name": "Govandi / Trombay / Mankhurd",
        "zone": "Zone 5",
        "area_sqkm": 32.5,
        "bbox": [72.892, 18.992, 72.952, 19.062],
        "lst": 38.9,
        "ndvi": 0.12,
        "ndbi": 0.79,
        "pop_density": 28000,
        "hvi": 83.7,
        "cluster_id": 0,
        "cluster_name": "Concrete Thermal Hotspot"
    },
    {
        "id": "WARD_M_WEST",
        "code": "M/W",
        "name": "Chembur",
        "zone": "Zone 5",
        "area_sqkm": 19.5,
        "bbox": [72.882, 19.032, 72.912, 19.072],
        "lst": 36.2,
        "ndvi": 0.23,
        "ndbi": 0.64,
        "pop_density": 21000,
        "hvi": 61.4,
        "cluster_id": 0,
        "cluster_name": "Concrete Thermal Hotspot"
    },
    {
        "id": "WARD_N",
        "code": "N",
        "name": "Ghatkopar / Vidyavihar",
        "zone": "Zone 6",
        "area_sqkm": 25.0,
        "bbox": [72.892, 19.072, 72.932, 19.122],
        "lst": 37.0,
        "ndvi": 0.20,
        "ndbi": 0.68,
        "pop_density": 26000,
        "hvi": 67.2,
        "cluster_id": 0,
        "cluster_name": "Concrete Thermal Hotspot"
    },
    {
        "id": "WARD_P_SOUTH",
        "code": "P/S",
        "name": "Goregaon",
        "zone": "Zone 4",
        "area_sqkm": 24.0,
        "bbox": [72.822, 19.142, 72.872, 19.182],
        "lst": 34.2,
        "ndvi": 0.35,
        "ndbi": 0.50,
        "pop_density": 19000,
        "hvi": 45.0,
        "cluster_id": 1,
        "cluster_name": "Vegetated Thermal Buffer"
    },
    {
        "id": "WARD_P_NORTH",
        "code": "P/N",
        "name": "Malad",
        "zone": "Zone 4",
        "area_sqkm": 34.0,
        "bbox": [72.812, 19.172, 72.862, 19.212],
        "lst": 35.8,
        "ndvi": 0.27,
        "ndbi": 0.60,
        "pop_density": 29000,
        "hvi": 59.8,
        "cluster_id": 0,
        "cluster_name": "Concrete Thermal Hotspot"
    },
    {
        "id": "WARD_R_SOUTH",
        "code": "R/S",
        "name": "Kandivali",
        "zone": "Zone 4",
        "area_sqkm": 17.8,
        "bbox": [72.822, 19.202, 72.872, 19.232],
        "lst": 36.1,
        "ndvi": 0.24,
        "ndbi": 0.63,
        "pop_density": 33000,
        "hvi": 62.5,
        "cluster_id": 0,
        "cluster_name": "Concrete Thermal Hotspot"
    },
    {
        "id": "WARD_R_CENTRAL",
        "code": "R/C",
        "name": "Borivali",
        "zone": "Zone 4",
        "area_sqkm": 50.0,
        "bbox": [72.822, 19.222, 72.872, 19.262],
        "lst": 32.1,
        "ndvi": 0.48,
        "ndbi": 0.38,
        "pop_density": 11000,
        "hvi": 31.4,
        "cluster_id": 1,
        "cluster_name": "Vegetated Thermal Buffer"
    },
    {
        "id": "WARD_R_NORTH",
        "code": "R/N",
        "name": "Dahisar",
        "zone": "Zone 4",
        "area_sqkm": 18.0,
        "bbox": [72.842, 19.252, 72.882, 19.292],
        "lst": 34.9,
        "ndvi": 0.29,
        "ndbi": 0.56,
        "pop_density": 21000,
        "hvi": 49.6,
        "cluster_id": 1,
        "cluster_name": "Vegetated Thermal Buffer"
    },
    {
        "id": "WARD_S",
        "code": "S",
        "name": "Bhandup / Powai / Kanjurmarg",
        "zone": "Zone 6",
        "area_sqkm": 64.0,
        "bbox": [72.872, 19.112, 72.942, 19.172],
        "lst": 31.2,
        "ndvi": 0.55,
        "ndbi": 0.32,
        "pop_density": 12000,
        "hvi": 28.5,
        "cluster_id": 1,
        "cluster_name": "Vegetated Thermal Buffer"
    },
    {
        "id": "WARD_T",
        "code": "T",
        "name": "Mulund",
        "zone": "Zone 6",
        "area_sqkm": 45.4,
        "bbox": [72.922, 19.162, 72.972, 19.202],
        "lst": 33.0,
        "ndvi": 0.40,
        "ndbi": 0.44,
        "pop_density": 14000,
        "hvi": 38.0,
        "cluster_id": 1,
        "cluster_name": "Vegetated Thermal Buffer"
    }
]

def generate_organic_polygon(bbox, ward_id):
    """
    Generates a 16-vertex organic polygon shape (ellipse-like with realistic coastal contour variations)
    for a ward instead of a simple 4-point rectangle box.
    """
    w, s, e, n = bbox
    cx = (w + e) / 2.0
    cy = (s + n) / 2.0
    rx = (e - w) / 2.0
    ry = (n - s) / 2.0

    # Deterministic pseudo-random seed per ward
    rng = random.Random(sum(ord(c) for c in ward_id))

    num_points = 16
    coords = []
    for i in range(num_points):
        angle = (2 * math.pi * i) / num_points
        # Add smooth harmonic variation to radius
        r_var = 1.0 + 0.12 * math.sin(3 * angle) + 0.08 * math.cos(5 * angle) + rng.uniform(-0.04, 0.04)
        px = cx + rx * r_var * math.cos(angle)
        py = cy + ry * r_var * math.sin(angle)
        coords.append([round(px, 5), round(py, 5)])

    # Close the ring
    coords.append(coords[0])
    return [coords]

def generate_heat_dots(ward):
    """
    Generates 18 sub-ward microclimate sampling points (heat dots) distributed inside the ward.
    """
    w, s, e, n = ward["bbox"]
    cx = (w + e) / 2.0
    cy = (s + n) / 2.0
    rx = (e - w) * 0.42
    ry = (n - s) * 0.42

    rng = random.Random(sum(ord(c) for c in ward["id"]) + 42)
    dots = []

    # Centroid dot
    dots.append({
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [round(cx, 5), round(cy, 5)]
        },
        "properties": {
            "ward_id": ward["id"],
            "ward_code": ward["code"],
            "ward_name": ward["name"],
            "feature_type": "heat_dot",
            "is_centroid": True,
            "lst_temp": round(ward["lst"], 1),
            "hvi_score": round(ward["hvi"], 1),
            "ndvi": round(ward["ndvi"], 2),
            "ndbi": round(ward["ndbi"], 2),
            "risk_tier": determine_risk_tier(ward["hvi"]),
            "cluster_id": ward["cluster_id"]
        }
    })

    # Sub-dots grid
    for k in range(17):
        angle = (2 * math.pi * k) / 17 + rng.uniform(-0.2, 0.2)
        dist_factor = rng.uniform(0.2, 0.88)
        dx = cx + rx * dist_factor * math.cos(angle)
        dy = cy + ry * dist_factor * math.sin(angle)

        # Micro-variation in temperature (-1.8°C to +1.8°C around ward mean)
        temp_delta = rng.uniform(-1.8, 1.8)
        dot_lst = round(max(25.0, min(45.0, ward["lst"] + temp_delta)), 1)
        
        hvi_delta = temp_delta * 2.2
        dot_hvi = round(max(0.0, min(100.0, ward["hvi"] + hvi_delta)), 1)

        dots.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [round(dx, 5), round(dy, 5)]
            },
            "properties": {
                "ward_id": ward["id"],
                "ward_code": ward["code"],
                "ward_name": ward["name"],
                "feature_type": "heat_dot",
                "is_centroid": False,
                "lst_temp": dot_lst,
                "hvi_score": dot_hvi,
                "ndvi": round(max(0.02, min(0.9, ward["ndvi"] - temp_delta * 0.04)), 2),
                "ndbi": round(max(0.1, min(0.95, ward["ndbi"] + temp_delta * 0.04)), 2),
                "risk_tier": determine_risk_tier(dot_hvi),
                "cluster_id": ward["cluster_id"]
            }
        })

    return dots

def determine_risk_tier(score):
    if score >= 75:
        return "Extreme"
    elif score >= 50:
        return "High"
    elif score >= 30:
        return "Moderate"
    else:
        return "Low"

geojson_features = []
metrics_data = {}

for w in wards_data:
    polygon_coords = generate_organic_polygon(w["bbox"], w["id"])
    risk_tier = determine_risk_tier(w["hvi"])
    
    # Ward Polygon Feature
    ward_feature = {
        "type": "Feature",
        "id": w["id"],
        "geometry": {
            "type": "Polygon",
            "coordinates": polygon_coords
        },
        "properties": {
            "ward_id": w["id"],
            "ward_code": w["code"],
            "ward_name": w["name"],
            "zone": w["zone"],
            "feature_type": "ward_polygon",
            "area_sqkm": w["area_sqkm"],
            "hvi_score": w["hvi"],
            "risk_tier": risk_tier,
            "lst_mean": w["lst"],
            "ndvi_mean": w["ndvi"],
            "ndbi_mean": w["ndbi"],
            "pop_density": w["pop_density"],
            "cluster_id": w["cluster_id"],
            "cluster_name": w["cluster_name"],
            "is_demo_data": True
        }
    }
    geojson_features.append(ward_feature)

    # Sub-ward Heat Sampling Dots
    heat_dots = generate_heat_dots(w)
    geojson_features.extend(heat_dots)
    
    metrics_data[w["id"]] = {
        "ward_id": w["id"],
        "ward_code": w["code"],
        "ward_name": w["name"],
        "zone": w["zone"],
        "area_sqkm": w["area_sqkm"],
        "hvi_score": w["hvi"],
        "risk_tier": risk_tier,
        "lst_mean_celsius": w["lst"],
        "ndvi_mean": w["ndvi"],
        "ndbi_mean": w["ndbi"],
        "population_density": w["pop_density"],
        "cluster_id": w["cluster_id"],
        "cluster_name": w["cluster_name"],
        "is_demo_data": True,
        "observation_metadata": {
            "satellite_sensor": "USGS Landsat-9 TIRS Band 10 [DEMO REPLICATED METRICS]",
            "satellite_observation_date": "2026-03-15",
            "spatial_resolution": "30 meters",
            "weather_source": "Open-Meteo API",
            "weather_timestamp": "2026-08-08T20:00:00+05:30"
        }
    }

geojson_output = {
    "type": "FeatureCollection",
    "metadata": {
        "dataset_name": "MCGM Administrative Wards Boundary & Thermal Metrics",
        "geography": "Greater Mumbai, India",
        "total_wards": len(wards_data),
        "is_demo_data": True,
        "disclaimer": "DEMO DATA: Boundary geometries & metrics formatted for Phase 1 UI development."
    },
    "features": geojson_features
}

os.makedirs("data", exist_ok=True)
os.makedirs("frontend/public/data", exist_ok=True)

with open("data/mcgm_wards.geojson", "w", encoding="utf-8") as f:
    json.dump(geojson_output, f, indent=2)

with open("data/mumbai_satellite_ward_metrics.json", "w", encoding="utf-8") as f:
    json.dump(metrics_data, f, indent=2)

with open("frontend/public/data/mcgm_wards.geojson", "w", encoding="utf-8") as f:
    json.dump(geojson_output, f, indent=2)

with open("frontend/public/data/mumbai_satellite_ward_metrics.json", "w", encoding="utf-8") as f:
    json.dump(metrics_data, f, indent=2)

print("Generated organic polygon & micro-heat dots GeoJSON successfully!")
