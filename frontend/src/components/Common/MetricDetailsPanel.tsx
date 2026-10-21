import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Database, Info } from 'lucide-react';
import type { MetricProvenance, WardMetrics, CurrentWeather } from '../../types';

interface Props { ward: WardMetrics; weather: CurrentWeather | null; }
interface MetricRow {
  key: string;
  name: string;
  value: string;
  fallbackDefinition: string;
  fallbackSource: string;
  fallbackMethod: string;
  fallbackLimitations: string;
  provenance?: MetricProvenance;
}

function sourceStatusLabel(sourceType?: string | null, dataStatus?: string): string {
  const source = (sourceType || 'unknown').replaceAll('_', ' ');
  return dataStatus ? `${source} · ${dataStatus.replaceAll('_', ' ')}` : source;
}

function showValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Unknown / unavailable';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'Unknown / unavailable';
  return String(value);
}

export const MetricDetailsPanel: React.FC<Props> = ({ ward, weather }) => {
  const [open, setOpen] = useState(false);
  const provenance = ward.metric_provenance ?? {};
  const dataStatus = ward.data_status ?? (ward.is_demo_data ? 'demo_data' : 'unknown');
  const rows: MetricRow[] = [
    {
      key: 'estimated_surface_temperature', name: 'Estimated / bundled surface temperature',
      value: `${ward.lst_mean_celsius} °C`, provenance: provenance.estimated_surface_temperature,
      fallbackDefinition: 'A stored project surface-temperature-like value. Its original physical interpretation is not verified.',
      fallbackSource: 'Bundled demonstration dataset',
      fallbackMethod: 'Precomputed baseline value; original formula and source are unknown.',
      fallbackLimitations: 'Not satellite-observed Land Surface Temperature (LST). No verified scene, acquisition timestamp, raster processing, or ground-truth validation is available.'
    },
    {
      key: 'hvi', name: 'Heat Vulnerability Index (HVI)', value: `${ward.hvi_score} / 100`, provenance: provenance.hvi,
      fallbackDefinition: 'Project-defined composite indicator with values from 0 to 100.',
      fallbackSource: 'Bundled demonstration dataset',
      fallbackMethod: 'Precomputed baseline score. The original formula is not verified; a separate formula is used by live-ingestion estimates.',
      fallbackLimitations: 'Not a measured physical quantity or a validated health outcome.'
    },
    {
      key: 'ndvi', name: 'NDVI — vegetation index', value: ward.ndvi_mean.toFixed(3), provenance: provenance.ndvi,
      fallbackDefinition: 'Dimensionless normalized difference index commonly calculated from near-infrared and red reflectance.',
      fallbackSource: 'Bundled demonstration dataset; source imagery unverified',
      fallbackMethod: '(NIR − Red) / (NIR + Red) when reflectance data are available; this application only reads a preloaded number.',
      fallbackLimitations: 'The repository does not include verified source imagery, acquisition metadata, cloud masking, or per-ward raster processing.'
    },
    {
      key: 'ndbi', name: 'NDBI — built-up index', value: ward.ndbi_mean.toFixed(3), provenance: provenance.ndbi,
      fallbackDefinition: 'Dimensionless normalized difference index commonly calculated from short-wave infrared and near-infrared reflectance.',
      fallbackSource: 'Bundled demonstration dataset; source imagery unverified',
      fallbackMethod: '(SWIR − NIR) / (SWIR + NIR) when reflectance data are available; this application only reads a preloaded number.',
      fallbackLimitations: 'The repository does not include verified source imagery, acquisition metadata, cloud masking, or per-ward raster processing.'
    },
    {
      key: 'population_density', name: 'Population-related ward field', value: showValue(ward.population_density), provenance: provenance.population_density,
      fallbackDefinition: 'A population-related numeric field bundled with each ward.',
      fallbackSource: 'Bundled demonstration dataset; original source not verified',
      fallbackMethod: 'Read from the JSON dataset; no conversion is applied.',
      fallbackLimitations: 'The source unit and definition are unverified. Do not assume the value means people per square kilometre.'
    },
    {
      key: 'cluster_assignment', name: 'Bundled archetype assignment', value: `${ward.cluster_name} (ID ${ward.cluster_id})`, provenance: provenance.cluster_assignment,
      fallbackDefinition: 'A categorical archetype stored in the baseline ward dataset.',
      fallbackSource: 'Bundled demonstration dataset',
      fallbackMethod: 'Read from the preloaded JSON; separate backend summaries use explicit rules.',
      fallbackLimitations: 'Does not represent a verified K-Means fit or validated climate classification.'
    }
  ];

  const weatherRows = [
    {
      name: 'Air temperature (2 m)', value: weather ? `${weather.air_temp_celsius} °C` : 'Unavailable',
      source: weather?.data_source ?? 'No successful provider response',
      status: weather ? (weather.is_stale ? 'stale_cache' : (weather.data_status ?? 'current_api')) : 'unavailable',
      definition: 'Open-Meteo temperature_2m: weather-model air temperature at 2 metres above ground; not necessarily a direct station observation.',
      time: weather?.recorded_at ?? null
    },
    {
      name: 'Relative humidity', value: weather ? `${weather.relative_humidity_pct}%` : 'Unavailable',
      source: weather?.data_source ?? 'No successful provider response',
      status: weather ? (weather.is_stale ? 'stale_cache' : (weather.data_status ?? 'current_api')) : 'unavailable',
      definition: 'Open-Meteo relative_humidity_2m, expressed as a percentage; this is not absolute humidity.',
      time: weather?.recorded_at ?? null
    },
    {
      name: 'Apparent temperature', value: weather ? `${weather.apparent_temperature_celsius} °C` : 'Unavailable',
      source: weather?.data_source ?? 'No successful provider response',
      status: weather ? (weather.is_stale ? 'stale_cache' : (weather.data_status ?? 'current_api')) : 'unavailable',
      definition: 'Open-Meteo apparent_temperature (“feels like”). It is not relabelled as a separately calculated heat index.',
      time: weather?.recorded_at ?? null
    }
  ];

  return <section className="glass-card rounded-xl border border-sky-500/20 overflow-hidden">
    <button type="button" aria-expanded={open} onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between gap-3 p-3 text-left hover:bg-slate-800/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500">
      <span className="flex items-center gap-2 text-xs font-bold text-sky-300"><Database className="w-4 h-4" /> Metric details & data provenance</span>
      {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
    </button>
    {open && <div className="p-4 pt-1 space-y-4">
      <div className="rounded-lg bg-slate-950/70 border border-slate-800 p-3">
        <p className="text-[11px] text-slate-200"><strong>Ward data status:</strong> {sourceStatusLabel(dataStatus, ward.is_stale ? 'stale' : undefined)}</p>
        <p className="text-[10px] text-slate-400 mt-1">{ward.data_status_reason ?? ward.data_source ?? 'Bundled data provenance is not fully verified.'}</p>
        <p className="text-[10px] text-slate-500 mt-1">Last successful ward refresh: {ward.last_synced_at ?? ward.last_successful_refresh_at ?? 'Not recorded'} · Last attempt: {ward.last_refresh_attempt_at ?? 'Not recorded'}</p>
      </div>

      {rows.map(row => {
        const p = row.provenance;
        const inputValues = p?.input_values ? Object.entries(p.input_values).map(([key, value]) => `${key}: ${showValue(value)}`).join(' · ') : null;
        return <article key={row.key} className="rounded-lg bg-slate-950/70 border border-slate-800 p-3 space-y-1.5">
          <div className="flex justify-between gap-3"><h4 className="text-xs font-semibold text-slate-100">{row.name}</h4><span className="text-xs font-mono text-sky-200 text-right">{row.value}</span></div>
          <p className="text-[10px] text-slate-400"><strong className="text-slate-300">Definition:</strong> {p?.definition ?? row.fallbackDefinition}</p>
          <p className="text-[10px] text-slate-400"><strong className="text-slate-300">Source/status:</strong> {p?.source_name ?? row.fallbackSource} · {sourceStatusLabel(p?.source_type, p?.data_status)}</p>
          {p?.source_endpoint && <p className="text-[10px] text-slate-500"><strong>Source identifier:</strong> {p.source_endpoint}</p>}
          <p className="text-[10px] text-slate-400"><strong className="text-slate-300">Method:</strong> {p?.formula ?? p?.calculation_method ?? row.fallbackMethod}</p>
          {inputValues && <p className="text-[10px] text-slate-400"><strong className="text-slate-300">Actual inputs:</strong> {inputValues}</p>}
          {(p?.retrieved_at || p?.observation_time) && <p className="text-[10px] text-slate-500"><strong>Timing:</strong> retrieved {p?.retrieved_at ?? 'unknown'}; provider time {p?.observation_time ?? 'unknown'} {p?.timezone ? `(${p.timezone})` : ''}</p>}
          <p className="text-[10px] text-amber-300"><strong>Limitations:</strong> {p?.limitations ?? row.fallbackLimitations}</p>
        </article>;
      })}

      <h4 className="text-xs font-bold text-sky-300 pt-1">Atmospheric weather</h4>
      {weatherRows.map(row => <article key={row.name} className="rounded-lg bg-slate-950/70 border border-slate-800 p-3 space-y-1.5">
        <div className="flex justify-between gap-3"><h4 className="text-xs font-semibold text-slate-100">{row.name}</h4><span className="text-xs font-mono text-sky-200 text-right">{row.value}</span></div>
        <p className="text-[10px] text-slate-400"><strong className="text-slate-300">Source/status:</strong> {row.source} · {row.status.replaceAll('_', ' ')}</p>
        <p className="text-[10px] text-slate-400"><strong className="text-slate-300">Definition:</strong> {row.definition}</p>
        <p className="text-[10px] text-slate-500"><strong>Location:</strong> {weather ? `${weather.latitude}, ${weather.longitude}` : 'Unknown'} · <strong>Provider time:</strong> {row.time ?? 'Unknown'} · <strong>Retrieved:</strong> {weather?.retrieved_at ?? 'Unknown'} · <strong>Timezone:</strong> {weather?.timezone ?? 'Unknown'}</p>
        {weather?.is_stale && <p className="text-[10px] text-amber-300"><Info className="inline w-3 h-3 mr-1" />Cached weather is stale. {weather.stale_reason ?? 'A newer provider request failed.'}</p>}
      </article>)}
      <p className="text-[10px] text-slate-500">Satellite metadata: {ward.observation_metadata?.provenance_status ?? 'not verified'}. Sensor: {ward.observation_metadata?.satellite_sensor ?? 'unknown'}; acquisition date: {ward.observation_metadata?.satellite_observation_date ?? 'unknown'}; spatial resolution: {ward.observation_metadata?.spatial_resolution ?? 'unknown'}. The current project archive does not process satellite scenes.</p>
    </div>}
  </section>;
};
