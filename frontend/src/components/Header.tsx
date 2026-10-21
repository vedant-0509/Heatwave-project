import React, { useState } from 'react';
import { Flame, Search, Thermometer, Droplets, MapPin, Loader2, CloudCheck, BookOpen, RefreshCw, Download } from 'lucide-react';
import type { AirQualityResponse, CurrentWeather } from '../types';

interface HeaderProps {
  weather: CurrentWeather | null;
  airQuality?: AirQualityResponse | null;
  weatherLoading?: boolean;
  wardNames: { id: string; name: string; code: string }[];
  onSelectWard: (wardId: string) => void;
  selectedWardId: string | null;
  onOpenScience?: () => void;
  onNavigateHome?: () => void;
  onRefreshLive?: () => void;
  isRefreshingLive?: boolean;
  onDownloadReport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  weather,
  airQuality = null,
  weatherLoading = false,
  wardNames,
  onSelectWard,
  selectedWardId,
  onOpenScience,
  onNavigateHome,
  onRefreshLive,
  isRefreshingLive = false,
  onDownloadReport
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredWards = searchQuery.trim() === '' 
    ? [] 
    : wardNames.filter(w => {
        const query = searchQuery.toLowerCase().trim();
        return (
          w.name.toLowerCase().includes(query) || 
          w.code.toLowerCase().includes(query) ||
          w.id.toLowerCase().includes(query)
        );
      });

  return (
    <header className="min-h-16 h-auto w-full glass-panel border-b border-white/10 px-4 md:px-6 py-2 flex items-center justify-between gap-3 z-30 relative shrink-0">
      {/* Brand Logo & Title */}
      <div 
        onClick={onNavigateHome}
        className={`flex items-center gap-3 min-w-0 ${onNavigateHome ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
        title={onNavigateHome ? "Return to UrbanHeat Landing Page" : undefined}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0">
          <Flame className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-bold text-lg text-slate-100 tracking-tight leading-tight whitespace-nowrap">
              Urban<span className="text-rose-500">Heat</span>
            </h1>
            <span className="text-[11px] font-semibold tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full uppercase">
              Mumbai
            </span>
            <div className={`hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold tracking-wider uppercase ${weather?.is_stale ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : weather ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800/60 border-slate-700 text-slate-300'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${weather?.is_stale ? 'bg-amber-300' : weather ? 'bg-emerald-400' : 'bg-slate-400'}`} />
              <span>{weather?.is_stale ? 'STALE WEATHER' : weather ? 'LIVE WEATHER' : 'WEATHER UNAVAILABLE'}</span>
            </div>
            {onRefreshLive && (
              <button
                onClick={onRefreshLive}
                disabled={isRefreshingLive}
                aria-label="Refresh weather and ward estimates"
                aria-busy={isRefreshingLive}
                className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs border border-white/10 flex items-center justify-center cursor-pointer"
                title="Refresh Open-Meteo weather and heuristic ward estimates"
              >
                <RefreshCw className={`w-3 h-3 text-emerald-400 ${isRefreshingLive ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 font-normal hidden sm:block mt-1 whitespace-nowrap">
            Urban Heat Intelligence · Weather + Live air quality + Explainable Ward Estimates
          </p>
          <div className="hidden lg:flex items-center gap-2 text-[10px] mt-1">
            <span className={airQuality?.data_status === 'current_api' ? 'text-emerald-400' : 'text-amber-300'}>
              Air quality: {airQuality?.data_status === 'current_api' ? 'OpenAQ live' : 'OpenAQ unavailable'}
            </span>
            {airQuality?.data_status === 'current_api' && airQuality.measurements[0] && (
              <span className="text-slate-400">
                {airQuality.measurements[0].parameter.toUpperCase()} {airQuality.measurements[0].value} {airQuality.measurements[0].unit}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Ward Search Bar */}
      <div className="relative max-w-xs md:max-w-sm w-full mx-2 md:mx-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Mumbai ward (e.g. Bandra, Dharavi)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full bg-slate-900/80 border border-slate-700/70 focus:border-rose-500/60 text-slate-200 text-xs rounded-lg pl-9 pr-4 py-2 outline-none transition-all placeholder:text-slate-500"
          />
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && filteredWards.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900/95 border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto backdrop-blur-md">
            {filteredWards.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  onSelectWard(w.id);
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-rose-500/20 transition-colors border-b border-slate-800/60 last:border-none ${
                  selectedWardId === w.id ? 'bg-rose-500/30 text-rose-300 font-semibold' : 'text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{w.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                  Ward {w.code}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Science Entry Point Button & Weather Quick Ticker */}
      <div className="flex items-center gap-3 text-xs">
        {/* Explore the Science Entry Point Button */}
        {onOpenScience && (
          <button
            onClick={onOpenScience}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/15 text-sky-300 hover:text-white hover:bg-sky-500/30 border border-sky-500/30 transition-all text-xs font-semibold shadow-sm hover:shadow-sky-500/10 cursor-pointer"
            title="Explore the Science & Disaggregation Models behind UrbanHeat"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Explore the Science</span>
            <span className="sm:hidden">Science</span>
          </button>
        )}
        {onDownloadReport && (
          <button
            onClick={onDownloadReport}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700 transition-all text-xs"
            title="Download ward CSV report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        )}

        <div className="hidden lg:flex items-center gap-3">
          {weatherLoading ? (
            <div className="flex items-center gap-2 text-slate-400 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
              <span className="text-xs">Fetching Weather...</span>
            </div>
          ) : weather ? (
            <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/80 rounded-lg px-3 py-1.5">
              <div className="flex items-center gap-1.5 text-amber-400" title="Ambient Air Temperature (Open-Meteo API)">
                <Thermometer className="w-3.5 h-3.5" />
                <span className="font-semibold">{weather.air_temp_celsius}°C</span>
                <span className="text-[10px] text-slate-400">Air</span>
              </div>
              <div className="h-3 w-px bg-slate-800" />
              <div className="flex items-center gap-1.5 text-sky-400" title="Relative Humidity">
                <Droplets className="w-3.5 h-3.5" />
                <span className="font-semibold">{weather.relative_humidity_pct}%</span>
              </div>
              <div className="h-3 w-px bg-slate-800" />
              <div className="flex items-center gap-1.5 text-rose-400" title="Apparent temperature from Open-Meteo">
                <span className="font-semibold">{weather.apparent_temperature_celsius}°C</span>
                <span className="text-[10px] text-rose-300 bg-rose-500/10 px-1 rounded">FEELS</span>
              </div>
            </div>
          ) : null}

          {/* Data Provenance Badge */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900/40 border border-slate-800 px-2.5 py-1.5 rounded-lg">
            <CloudCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Atmospheric: <strong className={weather?.is_stale ? "text-amber-300" : "text-emerald-400"}>{weather?.is_stale ? "Open-Meteo cached (stale)" : weather ? "Open-Meteo model data" : "Weather unavailable"}</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
};
