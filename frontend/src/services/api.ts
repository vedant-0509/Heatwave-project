import type { FeatureCollection } from 'geojson';
import type {
  WardMetrics,
  CurrentWeather,
  AirQualityResponse,
  HistoricalPoint,
  MLSummaryResponse,
  SimulationRequest,
  SimulationResponse
} from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');
const API_TIMEOUT_MS = 10_000;

export interface WardRecommendation {
  intervention: string;
  reason: string;
  expected_effect: string;
  priority: 'high' | 'medium';
}

export interface WardAlert {
  severity: string;
  ward_id: string;
  ward_name: string;
  hvi_score: number;
  message: string;
  source: string;
  is_demo_data: boolean;
}

export async function compareWards(wardIds: string[]): Promise<{ wards: WardMetrics[]; ranking: Pick<WardMetrics, 'ward_id' | 'ward_name' | 'hvi_score' | 'risk_tier'>[] }> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/wards/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ward_ids: wardIds })
  });
  if (!response.ok) throw new Error(await errorMessage(response, 'Ward comparison failed'));
  return await response.json();
}

export async function fetchWardRecommendations(wardId: string): Promise<{ ward_id: string; data_status: string; validated: boolean; recommendations: WardRecommendation[] }> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/wards/recommendations/${encodeURIComponent(wardId)}`);
  if (!response.ok) throw new Error(await errorMessage(response, 'Recommendations unavailable'));
  return await response.json();
}

export async function fetchHeatAlerts(): Promise<{ generated_at: string; alerts: WardAlert[] }> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/alerts`);
  if (!response.ok) throw new Error(await errorMessage(response, 'Heat alerts unavailable'));
  return await response.json();
}

export function downloadWardReport(): void {
  window.open(`${API_BASE_URL}/reports/wards.csv`, '_blank', 'noopener,noreferrer');
}

export async function fetchCurrentAirQuality(lat: number, lon: number): Promise<AirQualityResponse> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/air-quality/current?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`);
  if (!response.ok) throw new Error(await errorMessage(response, 'Air-quality data unavailable'));
  return await response.json();
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = API_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: init.signal ?? controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${Math.round(timeoutMs / 1000)} seconds`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function errorMessage(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => ({}));
  const detail = body && typeof body.detail === 'string' ? body.detail : null;
  return detail || `${fallback} (HTTP ${response.status})`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function finiteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function expectedRiskTier(score: number): string {
  if (score >= 75) return 'Extreme';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Moderate';
  return 'Low';
}

/** Refuse mismatched/invalid server data instead of rendering silent numeric corruption. */
function validateWardMetrics(payload: unknown, source: string): Record<string, WardMetrics> {
  if (!isRecord(payload)) throw new Error(`${source} ward metrics payload is not an object`);
  const entries = Object.entries(payload);
  if (entries.length !== 24) throw new Error(`${source} ward metrics should contain 24 wards; got ${entries.length}`);
  const result: Record<string, WardMetrics> = {};
  for (const [key, value] of entries) {
    if (!isRecord(value) || value.ward_id !== key) throw new Error(`${source} ward ID/key mismatch for ${key}`);
    const requiredNumbers = ['hvi_score', 'lst_mean_celsius', 'ndvi_mean', 'ndbi_mean', 'population_density', 'cluster_id'];
    if (requiredNumbers.some(field => !finiteNumber(value[field]))) throw new Error(`${source} ward ${key} has missing/non-finite metrics`);
    if ((value.hvi_score as number) < 0 || (value.hvi_score as number) > 100) throw new Error(`${source} ward ${key} has HVI outside 0–100`);
    if (Math.abs(value.ndvi_mean as number) > 1 || Math.abs(value.ndbi_mean as number) > 1) throw new Error(`${source} ward ${key} has NDVI/NDBI outside -1–1`);
    if ((value.lst_mean_celsius as number) < 0 || (value.lst_mean_celsius as number) > 80 || (value.population_density as number) < 0) throw new Error(`${source} ward ${key} has implausible numeric bounds`);
    if (value.risk_tier !== expectedRiskTier(value.hvi_score as number)) throw new Error(`${source} ward ${key} risk tier does not match HVI thresholds`);
    if (typeof value.ward_name !== 'string' || typeof value.ward_code !== 'string') throw new Error(`${source} ward ${key} is missing its name/code`);
    result[key] = value as unknown as WardMetrics;
  }
  return result;
}

function validateWardGeoJSON(payload: unknown, source: string): FeatureCollection {
  if (!isRecord(payload) || payload.type !== 'FeatureCollection' || !Array.isArray(payload.features)) {
    throw new Error(`${source} ward GeoJSON is not a FeatureCollection`);
  }
  const polygonIds = payload.features
    .filter((feature: unknown) => isRecord(feature) && isRecord(feature.properties) && feature.properties.feature_type === 'ward_polygon')
    .map((feature: unknown) => (feature as Record<string, unknown>).properties as Record<string, unknown>)
    .map(properties => properties.ward_id)
    .filter((id): id is string => typeof id === 'string');
  if (polygonIds.length !== 24 || new Set(polygonIds).size !== 24) {
    throw new Error(`${source} GeoJSON should contain 24 unique ward polygons; got ${new Set(polygonIds).size}`);
  }
  return payload as unknown as FeatureCollection;
}


// Default Mumbai reference location (Santacruz Meteorological Observatory area)
export const MUMBAI_DEFAULT_COORDS = { lat: 19.0760, lon: 72.8777 };

// Ward Centroid Lookup (Latitude, Longitude) for 24 MCGM Administrative Wards
export const WARD_CENTROIDS: Record<string, { lat: number; lon: number }> = {
  WARD_A: { lat: 18.915, lon: 72.820 },
  WARD_B: { lat: 18.950, lon: 72.840 },
  WARD_C: { lat: 18.950, lon: 72.820 },
  WARD_D: { lat: 18.965, lon: 72.805 },
  WARD_E: { lat: 18.975, lon: 72.835 },
  WARD_F_SOUTH: { lat: 18.995, lon: 72.840 },
  WARD_F_NORTH: { lat: 19.025, lon: 72.855 },
  WARD_G_SOUTH: { lat: 19.000, lon: 72.815 },
  WARD_G_NORTH: { lat: 19.035, lon: 72.845 },
  WARD_H_EAST: { lat: 19.070, lon: 72.855 },
  WARD_H_WEST: { lat: 19.065, lon: 72.825 },
  WARD_K_EAST: { lat: 19.115, lon: 72.865 },
  WARD_K_WEST: { lat: 19.120, lon: 72.820 },
  WARD_L: { lat: 19.085, lon: 72.885 },
  WARD_M_EAST: { lat: 19.025, lon: 72.920 },
  WARD_M_WEST: { lat: 19.050, lon: 72.895 },
  WARD_N: { lat: 19.095, lon: 72.910 },
  WARD_P_SOUTH: { lat: 19.160, lon: 72.845 },
  WARD_P_NORTH: { lat: 19.190, lon: 72.835 },
  WARD_R_SOUTH: { lat: 19.215, lon: 72.845 },
  WARD_R_CENTRAL: { lat: 19.240, lon: 72.845 },
  WARD_R_NORTH: { lat: 19.270, lon: 72.860 },
  WARD_S: { lat: 19.140, lon: 72.905 },
  WARD_T: { lat: 19.180, lon: 72.945 }
};

// Generate historical trend data for a ward (30 days)
export async function fetchHistoricalTrend(lat = MUMBAI_DEFAULT_COORDS.lat, lon = MUMBAI_DEFAULT_COORDS.lon): Promise<HistoricalPoint[]> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/weather/historical?lat=${lat}&lon=${lon}&past_days=30`);
  if (!res.ok) {
    throw new Error(await errorMessage(res, 'Historical weather data temporarily unavailable'));
  }
  const data = await res.json();
  if (!Array.isArray(data.points)) throw new Error('Historical weather response has an invalid format');
  return data.points;
}

/** Kept for compatibility with older imports; synthetic curves are deliberately not generated. */
export function getHistoricalTrend(_wardId: string, _baseLst: number): HistoricalPoint[] {
  return [];
}

export async function fetchWardGeoJSON(): Promise<FeatureCollection> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/wards/geojson`);
    if (res.ok) return validateWardGeoJSON(await res.json(), 'Backend');
  } catch (err) {
    console.warn('Backend GeoJSON unavailable or invalid; validating the bundled GeoJSON instead.', err);
  }

  const res = await fetchWithTimeout('/data/mcgm_wards.geojson');
  if (!res.ok) throw new Error('Failed to load Mumbai Ward GeoJSON dataset');
  return validateWardGeoJSON(await res.json(), 'Bundled');
}

export async function fetchWardMetrics(): Promise<Record<string, WardMetrics>> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/wards/live-metrics`);
    if (res.ok) return validateWardMetrics(await res.json(), 'Backend live');
    console.warn(`Backend live metrics returned HTTP ${res.status}; trying baseline data.`);
  } catch (err) {
    console.warn('Backend live metrics unavailable or invalid; attempting baseline data.', err);
  }

  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/wards/metrics`);
    if (res.ok) return validateWardMetrics(await res.json(), 'Backend baseline');
  } catch (err) {
    console.warn('Backend baseline metrics unavailable or invalid; loading bundled metrics.', err);
  }

  const res = await fetchWithTimeout('/data/mumbai_satellite_ward_metrics.json');
  if (!res.ok) throw new Error('Failed to load Ward Metrics dataset');
  return validateWardMetrics(await res.json(), 'Bundled');
}

export async function refreshLiveWardMetrics(): Promise<Record<string, WardMetrics>> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/wards/refresh-live`, { method: 'POST' });
  if (!res.ok) {
    throw new Error(await errorMessage(res, 'Failed to refresh ward metrics'));
  }
  return validateWardMetrics(await res.json(), 'Backend refreshed');
}

/**
 * Fetches REAL atmospheric weather from FastAPI backend (which queries Open-Meteo).
 * Strictly handles errors — does NOT fabricate fake fallback weather on failure.
 */
export async function fetchCurrentWeather(lat = MUMBAI_DEFAULT_COORDS.lat, lon = MUMBAI_DEFAULT_COORDS.lon): Promise<CurrentWeather> {
  const url = `${API_BASE_URL}/weather/current?lat=${lat}&lon=${lon}`;
  
  const res = await fetchWithTimeout(url);
  if (!res.ok) {
    throw new Error(await errorMessage(res, 'Weather data temporarily unavailable'));
  }
  
  const data = await res.json();
  return {
    latitude: data.latitude,
    longitude: data.longitude,
    air_temp_celsius: data.air_temp_celsius,
    relative_humidity_pct: data.relative_humidity_pct,
    apparent_temperature_celsius: data.apparent_temperature_celsius,
    heat_index_celsius: data.heat_index_celsius ?? undefined,
    wind_speed_kmh: data.wind_speed_kmh,
    precipitation_mm: data.precipitation_mm ?? 0.0,
    recorded_at: data.recorded_at,
    data_source: data.data_source,
    is_demo_data: data.is_demo_data,
    data_status: data.data_status ?? 'unknown',
    is_stale: data.is_stale ?? false,
    retrieved_at: data.retrieved_at,
    last_successful_fetch: data.last_successful_fetch ?? null,
    timezone: data.timezone ?? 'unknown',
    stale_reason: data.stale_reason ?? null
  };
}

/**
 * Fetches ML Summary metrics from backend API with fallback.
 */
export async function fetchMLSummary(): Promise<MLSummaryResponse> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/ml/summary`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    console.warn('Backend ML API offline. Using client-side model metrics.');
  }

  return {
    clustering: {
      n_clusters: 0,
      silhouette_score: null,
      is_fitted: false,
      engine_type: 'Unavailable: backend ML endpoint could not be reached',
      archetypes: {},
      centroids: {}
    },
    regression: {
      is_fitted: false,
      r2_score: null,
      intercept: 0,
      coefficients: { ndvi_slope: 0, ndbi_slope: 0, pop_density_slope: 0 },
      interpretation: 'Model metrics unavailable. No performance values are fabricated when the API is offline.'
    },
    total_wards_analyzed: 0,
    status: 'unavailable'
  };
}

/**
 * Simulates microclimate intervention (cooling effect of NDVI greening & NDBI cool roofs).
 */
export async function simulateCoolingScenario(payload: SimulationRequest): Promise<SimulationResponse> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/ml/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      return await res.json();
    }
    if (res.status < 500) {
      throw new Error(await errorMessage(res, 'Scenario request was rejected'));
    }
    console.warn('Backend scenario service returned an error; using the documented offline illustrative formula.');
  } catch (err) {
    if (err instanceof Error && !/timed out|fetch|network/i.test(err.message)) throw err;
    console.warn('Backend scenario service is offline. Using the documented offline illustrative formula.');
  }

  // Client-side fallback calculation matching python ML engine
  // Illustrative scenario only; no trained/validated regression coefficients are available offline.
  const ndviSlope = -7.45;
  const ndbiSlope = 12.18;

  const deltaLst = parseFloat(((ndviSlope * payload.delta_ndvi) + (ndbiSlope * payload.delta_ndbi)).toFixed(2));
  const simulatedLst = parseFloat((Math.max(20.0, payload.base_lst + deltaLst)).toFixed(1));

  const hviChange = (deltaLst * 2.5) + (payload.delta_ndbi * 25.0) - (payload.delta_ndvi * 30.0);
  const simulatedHvi = parseFloat((Math.max(0.0, Math.min(100.0, payload.base_hvi + hviChange))).toFixed(1));
  const deltaHvi = parseFloat((simulatedHvi - payload.base_hvi).toFixed(1));

  const getTier = (score: number) => {
    if (score >= 75.0) return 'Extreme';
    if (score >= 60.0) return 'High';
    if (score >= 40.0) return 'Moderate';
    return 'Low';
  };

  const baseTier = getTier(payload.base_hvi);
  const simulatedTier = getTier(simulatedHvi);

  return {
    ward_id: payload.ward_id,
    inputs: {
      delta_ndvi: parseFloat(payload.delta_ndvi.toFixed(2)),
      delta_ndbi: parseFloat(payload.delta_ndbi.toFixed(2)),
      base_ndvi: parseFloat(payload.base_ndvi.toFixed(3)),
      base_ndbi: parseFloat(payload.base_ndbi.toFixed(3)),
      new_ndvi: parseFloat((Math.min(1.0, payload.base_ndvi + payload.delta_ndvi)).toFixed(3)),
      new_ndbi: parseFloat((Math.max(0.0, payload.base_ndbi + payload.delta_ndbi)).toFixed(3))
    },
    results: {
      base_lst_celsius: payload.base_lst,
      simulated_lst_celsius: simulatedLst,
      delta_lst_celsius: deltaLst,
      base_hvi: payload.base_hvi,
      simulated_hvi: simulatedHvi,
      delta_hvi: deltaHvi,
      base_risk_tier: baseTier,
      simulated_risk_tier: simulatedTier,
      tier_improved: simulatedHvi < payload.base_hvi && (['Low', 'Moderate', 'High', 'Extreme'].indexOf(simulatedTier) < ['Low', 'Moderate', 'High', 'Extreme'].indexOf(baseTier))
    },
    data_status: 'offline_illustrative_fallback',
    is_validated: false,
    methodology: 'Offline illustrative sensitivity formula using fixed coefficients; not a trained regression model.',
    formula: 'delta_surface_temperature = -7.45*delta_ndvi + 12.18*delta_ndbi; delta_HVI = 2.5*delta_surface_temperature + 25*delta_ndbi - 30*delta_ndvi',
    limitations: ['Baseline values may be bundled demo data.', 'No ground-truth surface temperature or independently evaluated intervention data are available.', 'The scenario is not a guarantee of real-world cooling.']
  };
}
