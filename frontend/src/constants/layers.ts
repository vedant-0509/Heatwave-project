import type { LayerConfig, MapLayerType } from '../types';

export const LAYER_CONFIGS: Record<MapLayerType, LayerConfig> = {
  hvi: {
    id: 'hvi',
    label: 'Heat Risk Index',
    unit: 'Score 0-100',
    description: 'Project-defined score; bundled baseline values are demo data. Live heuristic uses estimated surface temperature, NDBI, NDVI and relative humidity.',
    propertyKey: 'hvi_score',
    colors: ['#2ec4b6', '#f7b801', '#f15bb5', '#e63946'],
    stops: [
      [0, '#2ec4b6'],
      [40, '#f7b801'],
      [60, '#f15bb5'],
      [75, '#e63946']
    ],
    formatValue: (val) => `${typeof val === 'number' ? val.toFixed(1) : val} / 100`
  },
  lst: {
    id: 'lst',
    label: 'Estimated Surface Temp',
    unit: '°C',
    description: 'Bundled demo value or unvalidated heuristic estimate; not verified satellite-observed LST.',
    propertyKey: 'lst_mean',
    colors: ['#3b82f6', '#eab308', '#f97316', '#dc2626'],
    stops: [
      [30.0, '#3b82f6'],
      [34.0, '#eab308'],
      [37.0, '#f97316'],
      [39.5, '#dc2626']
    ],
    formatValue: (val) => `${typeof val === 'number' ? val.toFixed(1) : val} °C`
  },
  ndvi: {
    id: 'ndvi',
    label: 'Vegetation Index (NDVI)',
    unit: 'Index (-1 to +1)',
    description: 'Dimensionless vegetation-greenness indicator; current ward values are bundled demo data, not recalculated from satellite imagery.',
    propertyKey: 'ndvi_mean',
    colors: ['#ef4444', '#facc15', '#84cc16', '#15803d'],
    stops: [
      [0.05, '#ef4444'],
      [0.20, '#facc15'],
      [0.35, '#84cc16'],
      [0.55, '#15803d']
    ],
    formatValue: (val) => `${typeof val === 'number' ? val.toFixed(2) : val}`
  },
  ndbi: {
    id: 'ndbi',
    label: 'Built-Up Index (NDBI)',
    unit: 'Index (-1 to +1)',
    description: 'Dimensionless built-up indicator; current ward values are bundled demo data, not recalculated from satellite imagery.',
    propertyKey: 'ndbi_mean',
    colors: ['#38bdf8', '#94a3b8', '#f97316', '#b91c1c'],
    stops: [
      [0.35, '#38bdf8'],
      [0.55, '#94a3b8'],
      [0.72, '#f97316'],
      [0.85, '#b91c1c']
    ],
    formatValue: (val) => `${typeof val === 'number' ? val.toFixed(2) : val}`
  },
  cluster: {
    id: 'cluster',
    label: 'Microclimate Cluster',
    unit: 'Archetype',
    description: 'Rule-based demo archetype assignment; not a trained K-Means clustering model.',
    propertyKey: 'cluster_id',
    colors: ['#ef4444', '#22c55e', '#3b82f6'],
    stops: [
      [0, '#ef4444'], // Concrete Hotspot
      [1, '#22c55e'], // Vegetated Buffer
      [2, '#3b82f6']  // Coastal Moderate
    ],
    formatValue: (val) => {
      if (val === 0) return 'Concrete Hotspot';
      if (val === 1) return 'Vegetated Buffer';
      if (val === 2) return 'Coastal Moderate';
      return String(val);
    }
  }
};
