export type RiskTier = 'Low' | 'Moderate' | 'High' | 'Extreme';

export interface WardRecord {
  ward_id: string;
  ward_code: string;
  ward_name: string;
  zone: string;
  area_sqkm: number;
  hvi_score: number;
  risk_tier: RiskTier;
  lst_mean_celsius: number;
  ndvi_mean: number;
  ndbi_mean: number;
  population_density: number;
  cluster_id: number;
  cluster_name: string;
  is_demo_data: boolean;
  observation_metadata: Record<string, string | null>;
  metric_provenance?: Record<string, Record<string, unknown>>;
  data_status?: string;
  data_status_reason?: string;
  data_source?: string;
  last_synced_at?: string | null;
  last_refresh_attempt_at?: string | null;
  last_successful_refresh_at?: string | null;
  is_stale?: boolean;
  surface_temperature_metric_name?: string;
  surface_temperature_source_type?: string;
  surface_temperature_methodology?: string;
  [key: string]: unknown;
}

export interface WeatherResponse {
  latitude: number;
  longitude: number;
  air_temp_celsius: number;
  relative_humidity_pct: number;
  apparent_temperature_celsius: number;
  heat_index_celsius: number | null;
  wind_speed_kmh: number;
  precipitation_mm: number;
  recorded_at: string;
  data_source: string;
  is_demo_data: boolean;
  data_status: 'current_api' | 'stale_cache';
  is_stale: boolean;
  retrieved_at: string;
  last_successful_fetch: string | null;
  timezone: string;
  stale_reason: string | null;
}

export interface AirQualityResponse {
  latitude: number;
  longitude: number;
  radius_meters: number;
  measurements: Array<{
    parameter: string;
    value: number;
    unit: string;
    measured_at: string;
    location: string | null;
  }>;
  data_source: string;
  data_status: 'current_api' | 'unavailable' | 'stale_cache';
  is_demo_data: false;
  retrieved_at: string;
  message?: string;
}
