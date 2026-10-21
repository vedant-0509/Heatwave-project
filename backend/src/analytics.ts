import type { RiskTier, WardRecord } from './types.js';

export const archetypes = {
  0: { name: 'Concrete Thermal Hotspot', description: 'High surface temperatures, dense impervious surface (NDBI > 0.65), low canopy greenness, high population density.', color: '#ef4444' },
  1: { name: 'Vegetated Thermal Buffer', description: 'Elevated canopy density (NDVI > 0.35), lower skin temperatures, substantial urban forestry buffer.', color: '#10b981' },
  2: { name: 'Coastal Moderate Microclimate', description: 'Moderated by sea breezes, moderate built density, balanced thermal skin profile.', color: '#0ea5e9' }
} as const;

export function riskTier(score: number): RiskTier {
  if (score >= 75) return 'Extreme';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Moderate';
  return 'Low';
}

export function clusterSummary(records: WardRecord[]) {
  const groups: Record<number, WardRecord[]> = { 0: [], 1: [], 2: [] };
  for (const record of records) {
    const cluster = record.ndbi_mean > 0.68 || record.population_density > 45000 || record.lst_mean_celsius > 37
      ? 0
      : record.ndvi_mean >= 0.25 && record.lst_mean_celsius < 34.5 ? 1 : 2;
    groups[cluster]?.push(record);
  }
  const centroids = Object.fromEntries(Object.entries(groups).map(([id, group]) => {
    const average = (key: keyof WardRecord) => group.reduce((sum, item) => sum + Number(item[key]), 0) / group.length;
    return [id, {
      ...(group.length ? {
        lst_mean_celsius: Number(average('lst_mean_celsius').toFixed(2)),
        ndvi_mean: Number(average('ndvi_mean').toFixed(3)),
        ndbi_mean: Number(average('ndbi_mean').toFixed(3)),
        population_density: Math.round(average('population_density'))
      } : {})
    }];
  }));
  return {
    n_clusters: Object.values(groups).filter((group) => group.length > 0).length,
    silhouette_score: null,
    is_fitted: false,
    engine_type: 'Rule-based microclimate archetype assignment (not K-Means)',
    archetypes,
    centroids,
    counts: Object.fromEntries(Object.entries(groups).map(([id, group]) => [id, group.length])),
    valid_sample_count: records.length,
    skipped_sample_count: 0,
    data_status: records.length ? 'available_demo_records' : 'unavailable_no_valid_records'
  };
}

export function regressionSummary(records: WardRecord[]) {
  const n = records.length || 1;
  const mean = (key: keyof WardRecord) => records.reduce((sum, item) => sum + Number(item[key]), 0) / n;
  const meanY = mean('lst_mean_celsius');
  const meanNdvi = mean('ndvi_mean');
  const meanNdbi = mean('ndbi_mean');
  const slope = (key: keyof WardRecord, average: number, fallback: number, min: number, max: number) => {
    const numerator = records.reduce((sum, item) => sum + (Number(item[key]) - average) * (item.lst_mean_celsius - meanY), 0);
    const denominator = records.reduce((sum, item) => sum + (Number(item[key]) - average) ** 2, 0) || 1;
    const candidate = numerator / denominator;
    return Number(Math.max(min, Math.min(max, Math.abs(candidate) > 0.1 ? candidate : fallback)).toFixed(2));
  };
  const ndviSlope = slope('ndvi_mean', meanNdvi, -7.45, -15, -3);
  const ndbiSlope = slope('ndbi_mean', meanNdbi, 12.18, 5, 20);
  const intercept = Number((meanY - ndviSlope * meanNdvi - ndbiSlope * meanNdbi).toFixed(2));
  return {
    is_fitted: false, r2_score: null, intercept,
    coefficients: { ndvi_slope: ndviSlope, ndbi_slope: ndbiSlope, pop_density_slope: 0.000045 },
    interpretation: `Illustrative, untrained sensitivity coefficients only: a +0.10 NDVI change maps to ${Math.abs(ndviSlope * 0.1).toFixed(2)}°C in the scenario formula. No ground-truth target or held-out evaluation is available.`
  };
}

export function mlSummary(records: WardRecord[]) {
  return { clustering: clusterSummary(records), regression: regressionSummary(records), total_wards_analyzed: records.length, status: 'illustrative_unvalidated' };
}

export function simulate(input: {
  ward_id: string; delta_ndvi: number; delta_ndbi: number; base_lst: number; base_ndvi: number;
  base_ndbi: number; base_pop_density: number; base_hvi: number;
}, regression = { ndvi_slope: -7.45, ndbi_slope: 12.18 }) {
  const newNdvi = Math.max(0, Math.min(1, input.base_ndvi + input.delta_ndvi));
  const newNdbi = Math.max(0, Math.min(1, input.base_ndbi + input.delta_ndbi));
  const deltaLst = Number((regression.ndvi_slope * input.delta_ndvi + regression.ndbi_slope * input.delta_ndbi).toFixed(2));
  const simulatedLst = Number(Math.max(20, input.base_lst + deltaLst).toFixed(1));
  const simulatedHvi = Number(Math.max(0, Math.min(100, input.base_hvi + deltaLst * 2.5 + input.delta_ndbi * 25 - input.delta_ndvi * 30)).toFixed(1));
  return {
    ward_id: input.ward_id,
    inputs: { delta_ndvi: Number(input.delta_ndvi.toFixed(2)), delta_ndbi: Number(input.delta_ndbi.toFixed(2)), base_ndvi: Number(input.base_ndvi.toFixed(3)), base_ndbi: Number(input.base_ndbi.toFixed(3)), new_ndvi: Number(newNdvi.toFixed(3)), new_ndbi: Number(newNdbi.toFixed(3)) },
    results: { base_lst_celsius: input.base_lst, simulated_lst_celsius: simulatedLst, delta_lst_celsius: deltaLst, base_hvi: input.base_hvi, simulated_hvi: simulatedHvi, delta_hvi: Number((simulatedHvi - input.base_hvi).toFixed(1)), base_risk_tier: riskTier(input.base_hvi), simulated_risk_tier: riskTier(simulatedHvi), tier_improved: riskTier(simulatedHvi) !== riskTier(input.base_hvi) },
    data_status: 'illustrative_simulation_unvalidated',
    is_validated: false,
    methodology: 'Project-defined sensitivity formula using illustrative coefficients; not a validated predictive model.',
    formula: 'delta_surface_temperature = ndvi_slope*delta_ndvi + ndbi_slope*delta_ndbi; delta_HVI = 2.5*delta_surface_temperature + 25*delta_ndbi - 30*delta_ndvi; HVI clamped to 0–100',
    limitations: [
      'Baseline inputs may be bundled demo values with unverified provenance.',
      'No ground-truth surface temperature or independently evaluated intervention data are available.',
      'The output is an illustrative scenario, not a guarantee of real-world cooling.'
    ]
  };
}
