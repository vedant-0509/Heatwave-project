import React, { useState, useEffect } from 'react';
import type { WardMetrics, CurrentWeather, SimulationResponse } from '../../types';
import { ArrowLeft, Thermometer, Trees, Building2, Grid, Calendar, Info, Loader2, CloudAlert, RefreshCw, MapPin, Sliders, Sparkles, TrendingDown, ShieldCheck } from 'lucide-react';
import { DemoBadge } from '../Common/DemoBadge';
import { InfoPopover } from '../Common/InfoPopover';
import { FactorBreakdownChart } from './FactorBreakdownChart';
import { HistoricalTrendChart } from './HistoricalTrendChart';
import { simulateCoolingScenario } from '../../services/api';
import { MetricDetailsPanel } from '../Common/MetricDetailsPanel';
import { VegetationMetricDetails } from './VegetationMetricDetails';

interface WardDetailsPanelProps {
  ward: WardMetrics;
  weather: CurrentWeather | null;
  weatherLoading?: boolean;
  weatherError?: string | null;
  onRetryWeather?: () => void;
  onBack: () => void;
}

export const WardDetailsPanel: React.FC<WardDetailsPanelProps> = ({
  ward,
  weather,
  weatherLoading = false,
  weatherError = null,
  onRetryWeather,
  onBack
}) => {
  // Interactive What-If Intervention Simulation state
  const [deltaNdvi, setDeltaNdvi] = useState<number>(0.10);
  const [deltaNdbi, setDeltaNdbi] = useState<number>(-0.10);
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);

  useEffect(() => {
    async function runSimulation() {
      try {
        setSimulating(true);
        const res = await simulateCoolingScenario({
          ward_id: ward.ward_id,
          delta_ndvi: deltaNdvi,
          delta_ndbi: deltaNdbi,
          base_lst: ward.lst_mean_celsius,
          base_ndvi: ward.ndvi_mean,
          base_ndbi: ward.ndbi_mean,
          base_pop_density: ward.population_density,
          base_hvi: ward.hvi_score
        });
        setSimulation(res);
      } catch (err) {
        console.error('Simulation error:', err);
      } finally {
        setSimulating(false);
      }
    }
    runSimulation();
  }, [ward, deltaNdvi, deltaNdbi]);

  const getRiskColor = (tier: string) => {
    switch (tier) {
      case 'Extreme': return { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', badge: 'bg-red-500 text-white' };
      case 'High': return { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30', badge: 'bg-rose-500 text-white' };
      case 'Moderate': return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', badge: 'bg-amber-500 text-slate-900' };
      default: return { bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/30', badge: 'bg-teal-500 text-slate-900' };
    }
  };

  const riskStyle = getRiskColor(ward.risk_tier);

  return (
    <div className="space-y-7 text-slate-200 animate-fadeIn">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100 transition-colors bg-slate-900/60 border border-slate-800 px-2.5 py-1 rounded-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to City Overview</span>
        </button>

        <DemoBadge size="sm" label="DEMO LAYERS" />
      </div>

      {/* Ward Main Banner */}
      <div className="glass-card rounded-xl p-5 border border-white/10 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              Ward Code {ward.ward_code} • {ward.zone}
            </span>
            <h2 className="text-xl font-bold text-slate-100 mt-1.5 tracking-tight">
              {ward.ward_name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Area: {ward.area_sqkm} km² • Population field: {ward.population_density.toLocaleString()} (unit unverified)
            </p>
          </div>

          <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${riskStyle.badge}`}>
            {ward.risk_tier} Risk
          </span>
        </div>

        <MetricDetailsPanel ward={ward} weather={weather} />

      {/* HVI Score Gauge Bar */}
        <div className={`mt-6 p-4 rounded-xl border ${riskStyle.bg} ${riskStyle.border} flex items-center justify-between`}>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              Baseline Heat Risk Index (HVI)
              <InfoPopover metricKey="hvi" ward={ward} />
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-2xl font-black ${riskStyle.text}`}>
                {ward.hvi_score.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
          </div>

          <div className="text-right max-w-[140px]">
            <span className="text-[10px] text-slate-400 block leading-tight">Primary Archetype</span>
            <span className="text-xs font-semibold text-slate-200 block truncate" title={ward.cluster_name}>
              {ward.cluster_name}
            </span>
          </div>
        </div>
      </div>

      {/* Always visible ward-specific NDVI details; independent of weather API availability. */}
      <VegetationMetricDetails ward={ward} />

      {/* Environmental & Atmospheric Parameters Grid */}
      <div className="glass-card rounded-xl p-5 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Current Microclimate Metrics
          </h3>

          {weather && (
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-sky-400" />
              {weather.latitude.toFixed(3)}°N, {weather.longitude.toFixed(3)}°E
            </span>
          )}
        </div>

        {weatherLoading ? (
          <div className="py-6 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
            <span className="text-xs">Requesting Ward Atmospheric Weather...</span>
          </div>
        ) : weatherError ? (
          <div className="p-3 bg-slate-900/90 rounded-lg border border-red-500/30 text-center space-y-2">
            <CloudAlert className="w-6 h-6 text-red-400 mx-auto" />
            <p className="text-xs text-red-300 font-medium">{weatherError}</p>
            {onRetryWeather && (
              <button
                onClick={onRetryWeather}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded border border-slate-700 transition-colors"
              >
                <RefreshCw className="w-3 h-3 text-sky-400" />
                <span>Retry Weather</span>
              </button>
            )}
          </div>
        ) : weather ? (
          <div className="grid grid-cols-2 gap-2.5">
            {/* Real Air Temperature */}
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-sky-400 font-medium flex items-center gap-1">
                  Air Temp (2m)
                  <InfoPopover metricKey="air_temp" />
                </span>
                <Thermometer className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="text-base font-bold text-slate-100 mt-1">
                {weather.air_temp_celsius}°C
              </div>
              <span className={`text-[9px] block mt-0.5 ${weather.is_stale ? "text-amber-300" : "text-sky-300"}`}>{weather.is_stale ? "Open-Meteo cached (stale)" : "Open-Meteo weather model"}</span>
            </div>

            {/* Estimated surface temperature (not satellite-observed LST) */}
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-rose-400 font-medium flex items-center gap-1">
                  Estimated Surface Temp
                  <InfoPopover metricKey="lst" />
                </span>
                <Thermometer className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-base font-bold text-slate-100 mt-1">
                {ward.lst_mean_celsius}°C
              </div>
              <span className="text-[9px] text-amber-400 block mt-0.5">{ward.data_status === 'mixed_api_and_demo_derived' ? 'Unvalidated heuristic estimate' : 'Bundled demo value'}</span>
            </div>

            {/* Built-up Index NDBI */}
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                  NDBI (Built-up)
                  <InfoPopover metricKey="ndbi" />
                </span>
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-base font-bold text-slate-100 mt-1">
                {ward.ndbi_mean.toFixed(2)}
              </div>
              <span className="text-[9px] text-amber-400 block mt-0.5">Bundled demo data</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Interactive What-If ML Intervention Simulator */}
      <div className="glass-card rounded-xl p-4 border border-rose-500/20 space-y-3.5 bg-gradient-to-b from-slate-900/90 to-slate-950/90">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            "What-If" Microclimate Simulator
          </h3>
          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Illustrative sensitivity model
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Explore an illustrative scenario using fixed sensitivity coefficients. Outputs are not a trained-model prediction and are not validated against observed cooling outcomes.
        </p>

        <div className="space-y-3 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
          {/* Slider 1: NDVI Greening */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Trees className="w-3 h-3 text-emerald-400" />
                Urban Canopy Increase (+ΔNDVI)
              </span>
              <span className="font-mono text-emerald-300 font-bold">+{deltaNdvi.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.00"
              max="0.30"
              step="0.05"
              value={deltaNdvi}
              onChange={(e) => setDeltaNdvi(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>0.00 (Current)</span>
              <span>+0.15 (Moderate)</span>
              <span>+0.30 (Dense Park)</span>
            </div>
          </div>

          {/* Slider 2: NDBI Cool Roofs */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <Building2 className="w-3 h-3 text-amber-400" />
                Cool Roofs / Albedo Deficit (-ΔNDBI)
              </span>
              <span className="font-mono text-amber-300 font-bold">{deltaNdbi.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="-0.30"
              max="0.00"
              step="0.05"
              value={deltaNdbi}
              onChange={(e) => setDeltaNdbi(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>-0.30 (Max Albedo)</span>
              <span>-0.15 (Cool Roofs)</span>
              <span>0.00 (Current)</span>
            </div>
          </div>
        </div>

        {/* Simulation Output Dashboard */}
        {simulating ? (
          <div className="py-4 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />
            <span>Calculating illustrative intervention scenario...</span>
          </div>
        ) : simulation ? (
          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {/* Cooling Effect */}
              <div className="bg-emerald-950/40 p-2 rounded border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 font-semibold uppercase flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-emerald-400" />
                  Illustrative Surface Temp Change
                </span>
                <div className="text-lg font-black text-emerald-300 mt-0.5">
                  {simulation.results.delta_lst_celsius < 0 ? simulation.results.delta_lst_celsius : `+${simulation.results.delta_lst_celsius}`}°C
                </div>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  Estimate: {ward.lst_mean_celsius}°C → <span className="text-emerald-300 font-bold">{simulation.results.simulated_lst_celsius}°C</span>
                </span>
              </div>

              {/* HVI Index Reduction */}
              <div className="bg-sky-950/40 p-2 rounded border border-sky-500/30">
                <span className="text-[10px] text-sky-400 font-semibold uppercase flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-sky-400" />
                  Simulated HVI Index
                </span>
                <div className="text-lg font-black text-sky-300 mt-0.5">
                  {simulation.results.simulated_hvi} <span className="text-xs text-sky-400 font-normal">({simulation.results.delta_hvi})</span>
                </div>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  HVI: {ward.hvi_score.toFixed(1)} → <span className="text-sky-300 font-bold">{simulation.results.simulated_hvi}</span>
                </span>
              </div>
            </div>

            {/* Risk Tier Shift Banner */}
            {simulation.results.tier_improved && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded text-center flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Risk tier improved: {simulation.results.base_risk_tier} → {simulation.results.simulated_risk_tier}</span>
              </div>
            )}
          </div>
        ) : null}
        {simulation && <p className="text-[10px] text-amber-300 leading-relaxed">
          {simulation.methodology ?? 'Illustrative scenario only; no independently validated predictive model is available.'}
          {' '}{simulation.is_validated === false ? 'Not validated.' : ''}
          {simulation.limitations?.length ? ` ${simulation.limitations[0]}` : ''}
        </p>}
      </div>

      {/* Microclimate Cluster Archetype Card */}
      <div className="glass-card rounded-xl p-3.5 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
            <Grid className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Microclimate Cluster Archetype
            </span>
            <span className="text-xs font-bold text-slate-100">
              {ward.cluster_name}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
          Cluster #{ward.cluster_id}
        </span>
      </div>

      {/* Factor Breakdown Chart */}
      <div className="glass-card rounded-xl p-4 border border-white/10">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
          Heat Risk Factor Breakdown
        </h3>
        <p className="text-[11px] text-slate-400">
          Relative intensity of contributing environmental risk factors vs city average.
        </p>
        <FactorBreakdownChart ward={ward} />
      </div>

      {/* Historical Temperature Trend Chart */}
      <div className="glass-card rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-rose-400" />
            Past 30-Day Thermal Timeline
          </h3>
        </div>
        <p className="text-[11px] text-slate-400">
          Recent Open-Meteo daily maximum air and apparent temperature. Satellite LST is unavailable in this chart.
        </p>
        <HistoricalTrendChart wardId={ward.ward_id} baseLst={ward.lst_mean_celsius} />
      </div>

      {/* Ward Data Lineage Disclaimer */}
      <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>Ward Data Provenance</span>
        </div>
        <div className="space-y-0.5 text-[10px] font-mono text-slate-400">
          <p>Atmospheric Source: <span className="text-emerald-400 font-semibold">{ward.observation_metadata.weather_source ?? (ward.data_status === 'mixed_api_and_demo_derived' ? 'Open-Meteo Forecast API (weather-model data)' : 'Unavailable / not attached')}</span></p>
          <p>Satellite Sensor: {ward.observation_metadata.satellite_sensor}</p>
          <p>Spatial Resolution: {ward.observation_metadata.spatial_resolution}</p>
        </div>
      </div>
    </div>
  );
};
