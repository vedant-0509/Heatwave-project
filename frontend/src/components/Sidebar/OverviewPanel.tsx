import React, { useEffect, useState } from 'react';
import { Flame, ShieldAlert, Thermometer, Droplets, Wind, Cpu, Database, Loader2, CloudAlert, RefreshCw, Cloud, Brain, Sparkles, Layers } from 'lucide-react';
import type { CitySummary, CurrentWeather, MLSummaryResponse } from '../../types';
import { InfoPopover } from '../Common/InfoPopover';
import { fetchMLSummary } from '../../services/api';

interface OverviewPanelProps {
  summary: CitySummary;
  weather: CurrentWeather | null;
  weatherLoading?: boolean;
  weatherError?: string | null;
  onRetryWeather?: () => void;
  onSelectWardByName: (wardName: string) => void;
}

export const OverviewPanel: React.FC<OverviewPanelProps> = ({
  summary,
  weather,
  weatherLoading = false,
  weatherError = null,
  onRetryWeather,
  onSelectWardByName: _onSelectWardByName
}) => {
  const [mlSummary, setMlSummary] = useState<MLSummaryResponse | null>(null);
  const [mlLoading, setMlLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadMlStats() {
      try {
        setMlLoading(true);
        const data = await fetchMLSummary();
        setMlSummary(data);
      } catch (err) {
        console.error('Failed to load ML summary:', err);
      } finally {
        setMlLoading(false);
      }
    }
    loadMlStats();
  }, []);

  return (
    <div className="space-y-5 text-slate-200 animate-fadeIn">
      {/* Overview Header Banner */}
      <div className="glass-card rounded-xl p-4 border border-white/10 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            Citywide Overview
          </span>
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold tracking-wider uppercase ${weather?.is_stale ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : weather ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800/60 border-slate-700 text-slate-300'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${weather?.is_stale ? 'bg-amber-300' : weather ? 'bg-emerald-400' : 'bg-slate-400'}`} />
            <span>{weather?.is_stale ? 'STALE WEATHER + DEMO WARD DATA' : weather ? 'OPEN-METEO MODEL + DEMO WARD DATA' : 'WEATHER UNAVAILABLE + DEMO WARD DATA'}</span>
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-100 tracking-tight mb-1">
          Greater Mumbai Microclimate
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Aggregated spatial intelligence across 24 administrative municipal wards of Mumbai. Select any ward on the map to inspect microclimate risk parameters.
        </p>

        {/* Quick City Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">City Avg HVI</span>
              <InfoPopover metricKey="hvi" />
            </div>
            <div className="text-lg font-bold text-amber-400 mt-0.5">
              {summary.average_hvi} <span className="text-xs font-normal text-slate-500">/ 100</span>
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg Estimated Surface Temp</span>
              <InfoPopover metricKey="lst" />
            </div>
            <div className="text-lg font-bold text-rose-400 mt-0.5">
              {summary.average_lst}°C
            </div>
          </div>
        </div>
      </div>

      {/* Current Atmospheric Weather Card (Real Open-Meteo Integration) */}
      <div className="glass-card rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Thermometer className="w-4 h-4 text-sky-400" />
            Current Atmospheric Conditions
          </h3>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border flex items-center gap-1 ${weather?.is_stale ? 'text-amber-300 bg-amber-500/10 border-amber-500/20' : weather ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-slate-300 bg-slate-800/50 border-slate-700'}`}>
            <Cloud className="w-3 h-3" />
            {weather?.is_stale ? 'Cached (stale)' : weather ? 'Open-Meteo model data' : 'Weather unavailable'}
          </span>
        </div>

        {weatherLoading ? (
          <div className="py-6 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
            <span className="text-xs">Querying Open-Meteo API...</span>
          </div>
        ) : weatherError ? (
          <div className="p-4 bg-slate-900/90 rounded-lg border border-red-500/30 text-center space-y-2">
            <CloudAlert className="w-7 h-7 text-red-400 mx-auto" />
            <p className="text-xs text-red-300 font-medium">{weatherError}</p>
            {onRetryWeather && (
              <button
                onClick={onRetryWeather}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-md border border-slate-700 transition-colors"
              >
                <RefreshCw className="w-3 h-3 text-sky-400" />
                <span>Retry Weather</span>
              </button>
            )}
          </div>
        ) : weather ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
                  <Thermometer className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Air Temp (2m)</span>
                  <span className="text-sm font-bold text-slate-100">{weather.air_temp_celsius}°C</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-400">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Apparent Temp</span>
                  <span className="text-sm font-bold text-rose-400">{weather.apparent_temperature_celsius}°C</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-400">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Humidity</span>
                  <span className="text-sm font-bold text-slate-100">{weather.relative_humidity_pct}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center text-teal-400">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Wind Speed</span>
                  <span className="text-sm font-bold text-slate-100">{weather.wind_speed_kmh} km/h</span>
                </div>
              </div>
            </div>

            {/* Freshness Callout */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
              <span>Atmospheric data • Open-Meteo {weather.is_stale ? "(stale cache)" : "(weather model)"}</span>
              <span className="font-mono text-slate-400">{weather.recorded_at}</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Data Science & ML Analytics Card */}
      <div className="glass-card rounded-xl p-4 border border-indigo-500/20 space-y-3 bg-gradient-to-b from-slate-900/90 to-slate-950/90">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-indigo-400" />
            Machine Learning Insights
          </h3>
          <span className="text-[10px] text-indigo-300 font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            Exploratory / Unvalidated
          </span>
        </div>

        {mlLoading ? (
          <div className="py-4 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
            <span>Loading ML Analytics...</span>
          </div>
        ) : mlSummary ? (
          <div className="space-y-2.5">
            {/* Model Performance Row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Regression R²</span>
                <span className="text-base font-bold text-emerald-400 mt-0.5 block">
                  {mlSummary.regression.r2_score == null ? 'N/A' : mlSummary.regression.r2_score}
                </span>
                <span className="text-[9px] text-slate-500 block">Unavailable without validation data</span>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cluster Silhouette</span>
                <span className="text-base font-bold text-indigo-400 mt-0.5 block">
                  {mlSummary.clustering.silhouette_score == null ? 'N/A' : mlSummary.clustering.silhouette_score}
                </span>
                <span className="text-[9px] text-slate-500 block">Rule-based; not K-Means</span>
              </div>
            </div>

            {/* Microclimate Archetypes Distribution */}
            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-400" />
                Archetype Classification
              </span>
              <div className="space-y-1 text-xs">
                {Object.entries(mlSummary.clustering.archetypes).map(([id, arch]) => (
                  <div key={id} className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: arch.color }} />
                      <span className="text-slate-200">{arch.name}</span>
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {mlSummary.clustering.counts?.[Number(id)] ?? 0} wards
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Regression Cooling Sensitivity Statement */}
            <div className="bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/20 text-[11px] text-emerald-300 leading-relaxed flex items-start gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{mlSummary.regression.interpretation}</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Ward Heat Risk Breakdown */}
      <div className="glass-card rounded-xl p-4 border border-white/10">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          Ward Risk Distribution
        </h3>

        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-red-400 font-medium">Extreme Risk (&ge;75)</span>
              <span className="font-bold text-slate-200">{summary.extreme_wards_count} Wards</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-red-500" style={{ width: `${(summary.extreme_wards_count / Math.max(summary.total_wards, 1)) * 100}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-rose-400 font-medium">High Risk (60–74)</span>
              <span className="font-bold text-slate-200">{summary.high_wards_count} Wards</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500" style={{ width: `${(summary.high_wards_count / Math.max(summary.total_wards, 1)) * 100}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-amber-400 font-medium">Moderate Risk (40–59)</span>
              <span className="font-bold text-slate-200">{summary.moderate_wards_count} Wards</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400" style={{ width: `${(summary.moderate_wards_count / Math.max(summary.total_wards, 1)) * 100}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-teal-400 font-medium">Low Risk (&lt;40)</span>
              <span className="font-bold text-slate-200">{summary.low_wards_count} Wards</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-teal-400" style={{ width: `${(summary.low_wards_count / Math.max(summary.total_wards, 1)) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Platform Scientific Architecture Summary */}
      <div className="glass-card rounded-xl p-4 border border-white/10 space-y-2.5">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-rose-400" />
          How UrbanHeat Science Works
        </h3>

        <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
          <li>
            <strong className="text-slate-200">Atmospheric vs estimated surface temperature</strong>: Open-Meteo measures 2m ambient air temperature. The current ward surface temperature is a heuristic estimate; satellite LST is not currently available in this data path.
          </li>
          <li>
            <strong className="text-slate-200">HVI</strong>: bundled scores are demo values; the live heuristic uses estimated surface temperature, NDBI, NDVI and relative humidity, clamped to 0–100. It does not directly include population density.
          </li>
        </ul>
      </div>

      {/* Data Lineage Card */}
      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <Database className="w-3.5 h-3.5 text-sky-400" />
          <span>Data Lineage & Provenance</span>
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
          <div>Boundary: <span className="text-slate-300 font-mono">Bundled ward GeoJSON</span></div>
          <div>Atmospheric: <span className={`font-mono font-semibold ${weather?.is_stale ? "text-amber-300" : "text-emerald-400"}`}>{weather?.is_stale ? "Open-Meteo cached" : weather ? "Open-Meteo model" : "Unavailable"}</span></div>
          <div>Satellite: <span className="text-amber-300 font-mono">Not available</span></div>
          <div>Vegetation: <span className="text-amber-300 font-mono">Bundled demo values</span></div>
        </div>
      </div>
    </div>
  );
};
