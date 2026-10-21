import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  BookOpen,
  Info,
  Thermometer,
  Flame,
  Droplets,
  Building2,
  Sun,
  Satellite,
  CloudCheck,
  Calendar,
  Trees,
  Building,
  MapPin,
  Layers,
  AlertTriangle,
  Cpu,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { SCIENCE_CONCEPTS } from '../../constants/scienceContent';

interface ScienceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Thermometer: <Thermometer className="w-5 h-5 text-sky-400" />,
  Flame: <Flame className="w-5 h-5 text-rose-500" />,
  Droplets: <Droplets className="w-5 h-5 text-teal-400" />,
  Building2: <Building2 className="w-5 h-5 text-amber-500" />,
  Sun: <Sun className="w-5 h-5 text-amber-400" />,
  Satellite: <Satellite className="w-5 h-5 text-indigo-400" />,
  CloudCheck: <CloudCheck className="w-5 h-5 text-emerald-400" />,
  Calendar: <Calendar className="w-5 h-5 text-rose-400" />,
  Trees: <Trees className="w-5 h-5 text-emerald-500" />,
  Building: <Building className="w-5 h-5 text-slate-400" />,
  MapPin: <MapPin className="w-5 h-5 text-sky-400" />,
  Layers: <Layers className="w-5 h-5 text-purple-400" />,
  AlertTriangle: <AlertTriangle className="w-5 h-5 text-red-400" />,
  Cpu: <Cpu className="w-5 h-5 text-indigo-400" />
};

export const ScienceModal: React.FC<ScienceModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Handle Esc key to close modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = ['All', 'Atmospheric', 'Satellite', 'Geospatial', 'Risk & ML'];

  const filteredConcepts = SCIENCE_CONCEPTS.filter((concept) => {
    const matchesCategory = selectedCategory === 'All' || concept.category === selectedCategory;
    const matchesSearch =
      concept.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      concept.shortSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      concept.whatItMeans.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="science-modal-title"
    >
      {/* Modal Dialog Card */}
      <div className="glass-panel w-full max-w-5xl max-h-[90vh] rounded-2xl border border-white/15 flex flex-col shadow-2xl overflow-hidden relative">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="science-modal-title" className="text-lg font-bold text-slate-100 tracking-tight">
                  Explore the Science
                </h2>
                <span className="text-[10px] font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full uppercase">
                  UrbanHeat Educational Layer
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Understand the physics, Remote Sensing, and meteorological models behind UrbanHeat Mumbai.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* CRITICAL SCIENTIFIC CLARIFICATION BANNER */}
          <div className="glass-card p-5 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/30 via-slate-900/50 to-sky-950/30 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <Info className="w-4 h-4 shrink-0 text-rose-400" />
              <span>Important Scientific Clarifications & Data Disaggregation</span>
            </div>

            {/* Timestamps & Update Frequency Rule */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <strong className="text-amber-400">Observation Timestamps:</strong> UrbanHeat does not measure temperature at every location every second. Different datasets have different update and observation frequencies. Current weather, forecasts, historical climate data and satellite observations are therefore displayed according to their respective timestamps or observation dates.
            </div>

            {/* Air Temp vs LST Comparison Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Air Temperature */}
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-sky-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-400 flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4" />
                    Air Temperature (T_air)
                  </span>
                  <span className="text-[10px] bg-sky-500/10 text-sky-300 px-2 py-0.5 rounded font-mono">
                    API timestamp
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Open-Meteo temperature_2m represents weather-model air temperature 2 metres above ground. It is not necessarily a direct station observation; inspect the returned provider timestamp and cache status.
                </p>
              </div>

              {/* Land Surface Temperature */}
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-rose-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-400 flex items-center gap-1.5">
                    <Sun className="w-4 h-4" />
                    Land Surface Temp (LST)
                  </span>
                  <span className="text-[10px] bg-rose-500/10 text-rose-300 px-2 py-0.5 rounded font-mono">
                    Not implemented
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  In general, satellite thermal sensors can estimate radiative skin temperature of ground surfaces. This repository does not currently process verified satellite scenes; its ward values are demo values or unvalidated estimates.
                </p>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono text-center pt-1 border-t border-white/5">
              ⚠️ <strong>Rule:</strong> Air Temperature ≠ Land Surface Temperature. UrbanHeat currently has no verified satellite LST retrieval pipeline.
            </div>
          </div>

          {/* Data Sources & Methodology: source/status truth for the values actually used by this build. */}
          <section aria-label="Data Sources and Methodology" className="glass-card rounded-2xl border border-sky-500/20 p-5 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-sky-300">Data Sources &amp; Methodology</h3>
              <p className="text-[11px] text-slate-400 mt-1">Each displayed value belongs to one of these source paths. Unknown provenance stays unknown; no satellite scene or validation result is inferred.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <article className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 space-y-1">
                <h4 className="font-semibold text-slate-100">Current atmospheric weather</h4>
                <p className="text-slate-300">Source: Open-Meteo Forecast API weather-model fields (temperature_2m, relative_humidity_2m, apparent_temperature).</p>
                <p className="text-slate-400">Units: °C and %. The provider timestamp, retrieval timestamp, location, timezone and stale-cache status are shown in Metric Details. A response is not necessarily a station observation.</p>
              </article>
              <article className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 space-y-1">
                <h4 className="font-semibold text-slate-100">Ward environmental baseline</h4>
                <p className="text-slate-300">Source: data/mumbai_satellite_ward_metrics.json.</p>
                <p className="text-slate-400">NDVI, NDBI, population-related values, baseline HVI and surface-temperature-like values are bundled demo fields. The underlying public source and original processing are not independently verified; population unit is unknown.</p>
              </article>
              <article className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 space-y-1">
                <h4 className="font-semibold text-slate-100">Estimated surface temperature and recalculated HVI</h4>
                <p className="text-slate-300">Method: documented heuristic combines current Open-Meteo weather with bundled demo NDVI/NDBI/population-related inputs; HVI uses an explicit clamped formula.</p>
                <p className="text-slate-400">Status: mixed API + demo-derived, unvalidated. These values are not satellite-observed LST and are not validated heat-health outcomes.</p>
              </article>
              <article className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 space-y-1">
                <h4 className="font-semibold text-slate-100">Historical charts</h4>
                <p className="text-slate-300">Source: Open-Meteo daily weather-model series.</p>
                <p className="text-slate-400">Shows daily maximum air and apparent temperature only. Satellite LST is unavailable; failed requests show an unavailable state instead of a fabricated curve.</p>
              </article>
              <article className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 space-y-1">
                <h4 className="font-semibold text-slate-100">Archetypes and ML metrics</h4>
                <p className="text-slate-300">Method: explicit threshold rules classify demonstration ward records into archetypes.</p>
                <p className="text-slate-400">This build does not train a validated K-Means/Ridge model. Silhouette score and regression R² are unavailable, not fabricated.</p>
              </article>
              <article className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 space-y-1">
                <h4 className="font-semibold text-slate-100">Cooling scenario simulator</h4>
                <p className="text-slate-300">Method: fixed illustrative sensitivity coefficients and a project-defined HVI adjustment formula.</p>
                <p className="text-slate-400">Outputs are assumptions-based scenarios, not a trained-model prediction, validated impact, or guarantee of real-world cooling.</p>
              </article>
              <article className="rounded-xl bg-slate-950/70 border border-amber-500/20 p-3 space-y-1 md:col-span-2">
                <h4 className="font-semibold text-amber-300">Satellite LST availability</h4>
                <p className="text-slate-300">A typed backend provider contract is present, but no satellite provider is configured and no scene has been processed. Sensor, acquisition date, spatial resolution, cloud/QA flags and observed LST remain unavailable.</p>
              </article>
            </div>
          </section>

          {/* Search & Category Filter Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search science concepts (e.g. LST, NDVI, Heat Index, UHI)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-sky-500/60 text-slate-200 text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all placeholder:text-slate-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-sky-500 text-slate-950 font-bold shadow-lg shadow-sky-500/20'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Concepts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredConcepts.map((concept) => (
              <div
                key={concept.id}
                className="glass-card p-5 rounded-2xl border border-white/10 hover:border-sky-500/30 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                        {concept.iconName && ICON_MAP[concept.iconName] ? (
                          ICON_MAP[concept.iconName]
                        ) : (
                          <Sparkles className="w-5 h-5 text-sky-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100 text-sm">{concept.title}</h3>
                        <span className="text-[10px] text-slate-400 font-mono">{concept.category}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                      Concept
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/80 font-medium">
                    {concept.shortSummary}
                  </p>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div>
                      <strong className="text-sky-400 text-[11px] uppercase tracking-wider block mb-0.5">
                        What it means:
                      </strong>
                      <p className="text-slate-300 leading-normal">{concept.whatItMeans}</p>
                    </div>

                    <div>
                      <strong className="text-amber-400 text-[11px] uppercase tracking-wider block mb-0.5">
                        Why UrbanHeat uses it:
                      </strong>
                      <p className="text-slate-300 leading-normal">{concept.whyUrbanHeatUsesIt}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>How it relates: <strong className="text-slate-200">{concept.howItRelatesToProject}</strong></span>
                </div>
              </div>
            ))}
          </div>

          {filteredConcepts.length === 0 && (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold">No science concepts found for "{searchQuery}"</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-xs text-sky-400 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>UrbanHeat Scientific Knowledge Base • Greater Mumbai, India</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-xs rounded-xl border border-slate-700 transition-colors"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
