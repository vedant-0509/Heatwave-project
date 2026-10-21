export interface ScienceConcept {
  id: string;
  title: string;
  category: 'Atmospheric' | 'Satellite' | 'Geospatial' | 'Risk & ML';
  shortSummary: string;
  whatItMeans: string;
  whyUrbanHeatUsesIt: string;
  howItRelatesToProject: string;
  iconName?: string;
}

export interface MetricQuickTooltip {
  title: string;
  shortDef: string;
  updateFrequency: string;
  sourceName: string;
  scienceTip: string;
}

export const SCIENCE_CONCEPTS: ScienceConcept[] = [
  {
    id: 'air-temperature',
    title: 'Air Temperature (T_air)',
    category: 'Atmospheric',
    shortSummary: 'Ambient kinetic temperature of air at 2m height above ground.',
    whatItMeans: 'Air Temperature is the standard weather measurement of thermal energy in the atmosphere at human breathing height (2 meters above the ground), shielded from direct solar radiation.',
    whyUrbanHeatUsesIt: 'It measures the actual atmospheric temperature that humans feel and experience when walking outdoors.',
    howItRelatesToProject: 'UrbanHeat requests Open-Meteo weather-model air temperature for a selected ward reference coordinate or the default Mumbai reference location. It is not guaranteed to be a ward-wide observation.',
    iconName: 'Thermometer'
  },
  {
    id: 'apparent-temperature',
    title: 'Apparent Temperature (feels like)',
    category: 'Atmospheric',
    shortSummary: 'Provider-computed feels-like temperature; distinct from a separately calculated heat index.',
    whatItMeans: 'Apparent temperature is a provider-computed estimate of how weather conditions may feel. Its method may combine atmospheric variables; this project displays Open-Meteo apparent_temperature and does not independently compute a heat index.',
    whyUrbanHeatUsesIt: 'Because Mumbai is a tropical coastal peninsula, high humidity during pre-monsoon and summer months elevates thermal stress significantly above dry air temperature alone.',
    howItRelatesToProject: 'Fetched as Open-Meteo apparent_temperature when the provider request succeeds. The project does not relabel it as a separately calculated heat index.',
    iconName: 'Flame'
  },
  {
    id: 'humidity',
    title: 'Relative Humidity (%)',
    category: 'Atmospheric',
    shortSummary: 'Percentage of moisture present in the air relative to maximum saturation.',
    whatItMeans: 'Relative Humidity measures the water vapor content in the air. At 100% humidity, air is fully saturated and sweat cannot evaporate from human skin.',
    whyUrbanHeatUsesIt: 'Mumbai\'s coastal geography surrounded by the Arabian Sea leads to typical afternoon humidity levels of 65%–85%, compounding heatwave severity.',
    howItRelatesToProject: 'Live humidity feeds are displayed in the header weather ticker and sidebar microclimate inspector.',
    iconName: 'Droplets'
  },
  {
    id: 'urban-heat-island',
    title: 'Urban Heat Island (UHI) Effect',
    category: 'Geospatial',
    shortSummary: 'Microclimate phenomenon where urban areas are significantly warmer than surrounding rural zones.',
    whatItMeans: 'The Urban Heat Island effect occurs when natural vegetation is replaced by dense concrete structures, asphalt roads, and roofs. These materials absorb solar radiation during the day and continuously re-radiate heat at night.',
    whyUrbanHeatUsesIt: 'Mumbai contains extreme microclimate disparities—dense commercial and informal settlements absorb high heat, while forested zones like Sanjay Gandhi National Park remain significantly cooler.',
    howItRelatesToProject: 'UrbanHeat disaggregates Mumbai\'s 24 administrative wards to map UHI hotspots and target urban forestry interventions.',
    iconName: 'Building2'
  },
  {
    id: 'land-surface-temperature',
    title: 'Surface Temperature and LST',
    category: 'Satellite',
    shortSummary: 'Radiative skin temperature of roofs, concrete, soil, and vegetation from space.',
    whatItMeans: 'Land Surface Temperature (LST) is the thermal skin temperature of ground surfaces observed by satellite thermal infrared sensors. On sunny afternoons, dark asphalt or concrete roofs can reach 45°C–55°C, while air temperature remains 34°C.',
    whyUrbanHeatUsesIt: 'LST identifies which specific urban materials and wards are physically absorbing and storing thermal energy.',
    howItRelatesToProject: 'This repository does not currently process Landsat thermal scenes. Displayed ward values are bundled demo values or an explicitly unvalidated weather-plus-demo heuristic, not satellite LST.',
    iconName: 'Sun'
  },
  {
    id: 'satellite-data',
    title: 'Satellite Earth Observation Data',
    category: 'Satellite',
    shortSummary: 'Remote sensing data captured by spaceborne optical and thermal sensors.',
    whatItMeans: 'Earth Observation satellites orbit hundreds of kilometers above Earth, capturing multi-spectral radiation across visible, infrared, and thermal bands.',
    whyUrbanHeatUsesIt: 'Provides uniform, objective spatial coverage across all 24 wards of Greater Mumbai without requiring physical installation of thousands of ground sensors.',
    howItRelatesToProject: 'Satellite concepts explain a future data path. This repository has no verified scene ingestion or raster processing pipeline; NDVI/NDBI values are bundled demo data.',
    iconName: 'Satellite'
  },
  {
    id: 'weather-data',
    title: 'Weather Data & Stations',
    category: 'Atmospheric',
    shortSummary: 'Provider-returned weather-model values; these are not necessarily direct station measurements.',
    whatItMeans: 'Meteorological variables such as air temperature, relative humidity, apparent temperature, precipitation, and wind. The source used in this project is Open-Meteo weather-model data, not a direct connection to the named local stations.',
    whyUrbanHeatUsesIt: 'Tracks short-term atmospheric weather fluctuations and coastal sea breezes across Mumbai.',
    howItRelatesToProject: 'The FastAPI backend requests current and daily weather-model values from Open-Meteo. Requests can fail, and a cached result is labelled stale when reused.',
    iconName: 'CloudCheck'
  },
  {
    id: 'historical-climate-data',
    title: 'Historical Climate Data & Timelines',
    category: 'Atmospheric',
    shortSummary: 'Recent daily weather-model values for context; not a multi-year satellite or climate record.',
    whatItMeans: 'A time series of weather variables. This project requests a recent daily series and does not currently calculate long-term climatological anomalies.',
    whyUrbanHeatUsesIt: 'Provides recent atmospheric context; the current display alone is not a formal heatwave detection or early-warning system.',
    howItRelatesToProject: 'The chart displays daily maximum air and apparent temperature from the Open-Meteo weather-model endpoint. It does not contain satellite LST or a generated substitute curve.',
    iconName: 'Calendar'
  },
  {
    id: 'vegetation-ndvi',
    title: 'Vegetation Index (NDVI)',
    category: 'Satellite',
    shortSummary: 'Normalized Difference Vegetation Index measuring green canopy density.',
    whatItMeans: 'NDVI is a satellite index ranging from -1.0 to +1.0 calculated from near-infrared and red light reflectance. Healthy green leaves absorb red light and strongly reflect near-infrared radiation.',
    whyUrbanHeatUsesIt: 'Trees and urban parks cool cities through shading and evapotranspiration (natural water evaporation from leaf stomata). High NDVI indicates a natural thermal buffer.',
    howItRelatesToProject: 'The current ward values are bundled demo values. No Sentinel-2 scenes are downloaded or processed. The live heuristic uses NDVI as one input when available.',
    iconName: 'Trees'
  },
  {
    id: 'built-up-ndbi',
    title: 'Built-Up Index (NDBI)',
    category: 'Satellite',
    shortSummary: 'Normalized Difference Built-up Index measuring concrete & roof density.',
    whatItMeans: 'NDBI isolates impervious urban surfaces (buildings, pavement, industrial roofs) using shortwave infrared and near-infrared satellite bands.',
    whyUrbanHeatUsesIt: 'Concrete and metal roofs absorb intense solar radiation. High NDBI values correlate directly with severe localized heat trapping.',
    howItRelatesToProject: 'The current ward values are bundled demo values, not verified current satellite-derived indices. The live heuristic uses NDBI as one input when available.',
    iconName: 'Building'
  },
  {
    id: 'geospatial-data',
    title: 'Geospatial GIS Boundaries',
    category: 'Geospatial',
    shortSummary: 'Geographically referenced polygon boundaries representing municipal wards.',
    whatItMeans: 'Digital GIS data containing precise longitude/latitude coordinates for administrative borders, coastline boundaries, and land contours.',
    whyUrbanHeatUsesIt: 'Ensures spatial insights align directly with Mumbai\'s 24 administrative MCGM / BMC ward divisions for policy decision-making.',
    howItRelatesToProject: 'Rendered as interactive vector choropleth polygons on MapLibre GL JS basemaps.',
    iconName: 'MapPin'
  },
  {
    id: 'heat-map-choropleth',
    title: 'Interactive Choropleth Heat Map',
    category: 'Geospatial',
    shortSummary: 'Color-coded spatial map visualising risk disparities across city wards.',
    whatItMeans: 'A thematic map where geographical areas are shaded or patterned in proportion to a statistical variable (such as Heat Risk, LST, or Vegetation).',
    whyUrbanHeatUsesIt: 'Allows citizens and urban planners to instantly identify high-risk thermal hotspots across Mumbai at a glance.',
    howItRelatesToProject: 'Interactive MapLibre vector map taking 70% of the screen viewport with 5 switchable thematic layers.',
    iconName: 'Layers'
  },
  {
    id: 'heat-risk-hvi',
    title: 'Baseline Heat Risk Index (HVI)',
    category: 'Risk & ML',
    shortSummary: 'Transparent 0–100 composite score weighting exposure, built-up density & greenery.',
    whatItMeans: 'Baseline scores are bundled demo values. The live-ingestion formula is clamp(1.6 × estimated surface temperature + 30 × NDBI − 35 × NDVI + 0.15 × relative humidity, 0, 100); it does not directly include population density.',
    whyUrbanHeatUsesIt: 'Provides an explainable project-defined composite indicator. Its current weights and baseline values are not externally validated against observed heat-health outcomes.',
    howItRelatesToProject: 'The documented application thresholds are Low <40, Moderate 40–<60, High 60–<75, and Extreme ≥75. Bundled baseline scores are demo values.',
    iconName: 'AlertTriangle'
  },
  {
    id: 'microclimate-clustering',
    title: 'Unsupervised Microclimate Clustering',
    category: 'Risk & ML',
    shortSummary: 'Rule-based classification grouping demo ward records into illustrative microclimate archetypes.',
    whatItMeans: 'Current implementation applies explicit threshold rules to demo ward records; it is not an unsupervised K-Means fit and is not bias-free.',
    whyUrbanHeatUsesIt: 'Identifies distinct structural microclimate zones: 1) Concrete Thermal Hotspots, 2) Vegetated Buffers, and 3) Coastal Moderate Zones.',
    howItRelatesToProject: 'Rule-based archetype labels are assigned from the current ward metric fields. No validated model performance is claimed.',
    iconName: 'Cpu'
  }
];

export const METRIC_TOOLTIPS: Record<string, MetricQuickTooltip> = {
  hvi: {
    title: 'Baseline Heat Risk Index (HVI)',
    shortDef: 'Project-defined 0–100 composite score. Baseline values are precomputed demo data; the live heuristic uses estimated surface temperature, NDBI, NDVI and relative humidity.',
    updateFrequency: 'Baseline values are static until the dataset is explicitly updated',
    sourceName: 'Bundled demo score; original formula unknown',
    scienceTip: 'A higher score indicates greater combined thermal exposure and vulnerability.'
  },
  lst: {
    title: 'Surface Temperature and LST',
    shortDef: 'Radiative skin temperature normally derived from satellite thermal sensors. This repository currently displays demo values or an unvalidated heuristic estimate, not a verified satellite retrieval.',
    updateFrequency: 'No satellite refresh is implemented',
    sourceName: 'Bundled demo data / unvalidated heuristic; no verified scene pipeline',
    scienceTip: 'The field displayed here is not verified satellite LST and should not be interpreted as a measured surface temperature.'
  },
  ndvi: {
    title: 'Vegetation Index (NDVI) — bundled demo data',
    shortDef: 'Dimensionless index commonly derived from red and near-infrared reflectance; current project values are bundled demo data.',
    updateFrequency: 'No satellite refresh is implemented',
    sourceName: 'Bundled demo dataset; imagery provenance unknown',
    scienceTip: 'Trees cool cities via shade & evapotranspiration. High NDVI indicates a natural thermal buffer.'
  },
  ndbi: {
    title: 'Built-Up Index (NDBI) — bundled demo data',
    shortDef: 'Dimensionless index commonly derived from NIR and SWIR reflectance; current project values are bundled demo data.',
    updateFrequency: 'No satellite refresh is implemented',
    sourceName: 'Bundled demo dataset; imagery provenance unknown',
    scienceTip: 'Concrete & metal absorb shortwave solar energy and trap heat into the evening.'
  },
  apparent_temp: {
    title: 'Apparent Temperature',
    shortDef: 'Open-Meteo apparent_temperature (“feels like”); not a separately calculated heat index.',
    updateFrequency: 'Provider cadence; cached for up to 10 minutes; stale values labelled',
    sourceName: 'Open-Meteo Forecast API (weather-model data)',
    scienceTip: 'High humidity impairs sweat evaporation, making 34°C feel like 40°C in Mumbai.'
  },
  air_temp: {
    title: 'Ambient Air Temperature',
    shortDef: 'Open-Meteo temperature_2m weather-model value; not necessarily a physical weather-station observation.',
    updateFrequency: 'Provider cadence; cached for up to 10 minutes; stale values labelled',
    sourceName: 'Open-Meteo Forecast API (weather-model data)',
    scienceTip: 'Represents general atmospheric comfort at human breathing height.'
  }
};
