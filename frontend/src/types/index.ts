export type MapLayerType = 'hvi' | 'lst' | 'ndvi' | 'ndbi' | 'cluster';

export type RiskCategory = 'Low' | 'Moderate' | 'High' | 'Extreme';

export interface ObservationMetadata {
  satellite_sensor?: string | null;
  satellite_observation_date?: string | null;
  spatial_resolution?: string | null;
  weather_source?: string | null;
  weather_timestamp?: string | null;
  retrieved_at?: string | null;
  timezone?: string | null;
  provenance_status?: string;
}

export interface MetricProvenance {
  metric_name?: string;
  source_type?: 'api' | 'static_dataset' | 'demo_data' | 'derived_estimate' | 'satellite_observed' | 'ml_prediction' | 'simulation' | 'unavailable' | string;
  source_name?: string | null;
  source_endpoint?: string | null;
  value?: number | string | null;
  unit?: string | null;
  definition?: string | null;
  observation_time?: string | null;
  retrieved_at?: string | null;
  timezone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  data_status?: string;
  calculation_method?: string | null;
  formula?: string | null;
  input_values?: Record<string, number | string | null> | null;
  methodology_version?: string | null;
  is_demo_data?: boolean;
  is_estimated?: boolean;
  limitations?: string | null;
}

export interface WardMetrics {
  ward_id: string;
  ward_code: string;
  ward_name: string;
  zone: string;
  area_sqkm: number;
  hvi_score: number;
  risk_tier: RiskCategory;
  lst_mean_celsius: number;
  ndvi_mean: number;
  ndbi_mean: number;
  population_density: number;
  cluster_id: number;
  cluster_name: string;
  is_demo_data: boolean;
  observation_metadata: ObservationMetadata;
  metric_provenance?: Record<string, MetricProvenance>;
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
}

export interface CurrentWeather {
  latitude: number;
  longitude: number;
  air_temp_celsius: number;
  relative_humidity_pct: number;
  apparent_temperature_celsius: number;
  /** Deprecated API compatibility alias; represents apparent temperature, not a separately computed heat index. */
  heat_index_celsius?: number;
  wind_speed_kmh: number;
  precipitation_mm: number;
  recorded_at: string;
  data_source: string;
  is_demo_data: boolean;
  data_status?: 'current_api' | 'stale_cache' | string;
  is_stale?: boolean;
  retrieved_at?: string;
  last_successful_fetch?: string | null;
  timezone?: string;
  stale_reason?: string | null;
}

export interface AirQualityResponse {
  latitude: number;
  longitude: number;
  radius_meters: number;
  measurements: Array<{ parameter: string; value: number; unit: string; measured_at: string; location: string | null }>;
  data_source: string;
  data_status: 'current_api' | 'unavailable' | 'stale_cache' | string;
  is_demo_data: false;
  retrieved_at: string;
  message?: string;
}

export interface HistoricalPoint {
  date: string;
  air_temp_celsius: number;
  apparent_temperature_celsius: number;
  /** Satellite LST is not supplied by the weather API and is therefore null. */
  lst_mean_celsius: number | null;
  is_demo_data?: boolean;
  source?: string;
  lst_status?: string;
  data_status?: string;
  timezone?: string;
}

export interface CitySummary {
  city_name: string;
  total_wards: number;
  average_hvi: number;
  average_lst: number;
  highest_risk_ward: string;
  lowest_risk_ward: string;
  extreme_wards_count: number;
  high_wards_count: number;
  moderate_wards_count: number;
  low_wards_count: number;
}

export interface LayerConfig {
  id: MapLayerType;
  label: string;
  unit: string;
  description: string;
  propertyKey: string;
  colors: string[];
  stops: [number, string][];
  formatValue: (val: number | string) => string;
}

// Machine Learning Types
export interface ClusterArchetype {
  name: string;
  description: string;
  color: string;
}

export interface ClusterCentroid {
  lst_mean_celsius: number;
  ndvi_mean: number;
  ndbi_mean: number;
  population_density: number;
}

export interface ClusteringSummary {
  n_clusters: number;
  silhouette_score: number | null;
  is_fitted: boolean;
  engine_type: string;
  archetypes: Record<number, ClusterArchetype>;
  centroids: Record<number, ClusterCentroid>;
  counts?: Record<number, number>;
}

export interface RegressionCoefficients {
  ndvi_slope: number;
  ndbi_slope: number;
  pop_density_slope: number;
}

export interface RegressionSummary {
  is_fitted: boolean;
  r2_score: number | null;
  intercept: number;
  coefficients: RegressionCoefficients;
  interpretation: string;
}

export interface MLSummaryResponse {
  clustering: ClusteringSummary;
  regression: RegressionSummary;
  total_wards_analyzed: number;
  status: string;
}

export interface SimulationRequest {
  ward_id: string;
  delta_ndvi: number;
  delta_ndbi: number;
  base_lst: number;
  base_ndvi: number;
  base_ndbi: number;
  base_pop_density: number;
  base_hvi: number;
}

export interface SimulationResponse {
  ward_id: string;
  inputs: {
    delta_ndvi: number;
    delta_ndbi: number;
    base_ndvi: number;
    base_ndbi: number;
    new_ndvi: number;
    new_ndbi: number;
  };
  results: {
    base_lst_celsius: number;
    simulated_lst_celsius: number;
    delta_lst_celsius: number;
    base_hvi: number;
    simulated_hvi: number;
    delta_hvi: number;
    base_risk_tier: RiskCategory;
    simulated_risk_tier: RiskCategory;
    tier_improved: boolean;
  };
  data_status?: string;
  is_validated?: boolean;
  methodology?: string;
  formula?: string;
  limitations?: string[];
}
