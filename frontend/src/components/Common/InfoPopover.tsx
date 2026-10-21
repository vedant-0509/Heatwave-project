import React, { useState, useRef, useEffect } from 'react';
import { Info, X, Clock, Database, Sparkles } from 'lucide-react';
import { METRIC_TOOLTIPS, type MetricQuickTooltip } from '../../constants/scienceContent';
import type { WardMetrics } from '../../types';
import { createPortal } from 'react-dom';

interface InfoPopoverProps {
  metricKey: keyof typeof METRIC_TOOLTIPS;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
  /** Optional selected-ward context for a location-specific HVI explanation. */
  ward?: WardMetrics;
}

export const InfoPopover: React.FC<InfoPopoverProps> = ({
  metricKey,
  label,
  size = 'sm',
  className = '',
  ward
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverCardRef = useRef<HTMLDivElement>(null);
  const isWardHviPopover = Boolean(ward && metricKey === 'hvi');
  const [popoverPosition, setPopoverPosition] = useState({ top: 16, left: 16, width: 320, maxHeight: 560 });
  const info: MetricQuickTooltip | undefined = METRIC_TOOLTIPS[metricKey];
  const hviProvenance = metricKey === 'hvi' ? ward?.metric_provenance?.hvi : undefined;
  const hviInputs = hviProvenance?.input_values ?? null;
  const temperatureProvenance = metricKey === 'hvi' ? ward?.metric_provenance?.estimated_surface_temperature : undefined;
  const temperatureInputs = temperatureProvenance?.input_values ?? null;
  const temperatureFormula = typeof temperatureProvenance?.formula === 'string' && temperatureProvenance.formula.trim()
    ? temperatureProvenance.formula
    : null;
  const hviFormula = typeof hviProvenance?.formula === 'string' && hviProvenance.formula.trim()
    ? hviProvenance.formula
    : null;
  // A ward's bundled baseline HVI has no verified formula. Only explain a formula as
  // the basis for the displayed value when the active response includes its provenance.
  const hasFormulaBackedHvi = Boolean(ward && hviProvenance?.source_type === 'derived_estimate' && hviFormula);

  const formatInput = (value: number | string | null | undefined, suffix = '') => {
    if (value === null || value === undefined || value === '') return 'Not supplied';
    if (typeof value === 'number') return `${Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: 3 }) : 'Unavailable'}${suffix}`;
    return `${value}${suffix}`;
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (popoverRef.current?.contains(target) || popoverCardRef.current?.contains(target)) return;
      setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Esc key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!info) return null;

  const iconSizeClass = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  const handleTriggerClick = () => {
    const nextOpen = !isOpen;
    if (nextOpen && isWardHviPopover && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const width = Math.min(320, Math.max(180, viewportWidth - 24));
      const maxHeight = Math.min(viewportHeight * 0.7, 640);
      const belowSpace = Math.max(0, viewportHeight - rect.bottom - 16);
      const aboveSpace = Math.max(0, rect.top - 16);
      const placeBelow = belowSpace >= Math.min(360, maxHeight) || belowSpace >= aboveSpace;
      const availableHeight = Math.max(120, placeBelow ? belowSpace : aboveSpace);
      const popupHeight = Math.min(maxHeight, availableHeight);
      const top = placeBelow
        ? Math.min(rect.bottom + 8, Math.max(8, viewportHeight - popupHeight - 8))
        : Math.max(8, rect.top - popupHeight - 8);
      const left = Math.min(Math.max(12, rect.left), Math.max(12, viewportWidth - width - 12));
      setPopoverPosition({ top, left, width, maxHeight: popupHeight });
    }
    setIsOpen(nextOpen);
  };

  const popoverCard = isOpen ? (
    <div
      ref={popoverCardRef}
      style={isWardHviPopover ? { position: 'fixed', top: popoverPosition.top, left: popoverPosition.left, width: popoverPosition.width, maxHeight: popoverPosition.maxHeight } : undefined}
      className={`${isWardHviPopover ? 'fixed overflow-y-auto overscroll-contain' : 'absolute left-0 bottom-full mb-2 w-72 md:w-80'} glass-panel p-4 rounded-xl border border-sky-500/30 shadow-2xl ${isWardHviPopover ? 'z-[100]' : 'z-50'} animate-fadeIn text-slate-200 text-xs space-y-2.5 backdrop-blur-xl`}
    >
      <div className="flex items-start justify-between border-b border-slate-800 pb-2">
        <h4 className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          {info.title}
        </h4>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800"
          aria-label="Close calculation explanation"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {ward && metricKey === 'hvi' ? (
        <div className="space-y-2.5">
          <p className="text-[11px] text-slate-300 leading-relaxed">
            <strong className="text-slate-100">{ward.ward_name}</strong> currently displays an HVI score of{' '}
            <strong className="text-slate-100">{ward.hvi_score.toFixed(1)} / 100</strong> ({ward.risk_tier} risk).
            This is UrbanHeat's project-defined composite risk indicator, not the standard meteorological Heat Index or a validated health prediction.
          </p>

          {hasFormulaBackedHvi ? (
            <>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-1.5">
                <h5 className="text-[10px] uppercase tracking-wide font-semibold text-sky-300">Formula recorded for this score</h5>
                <p className="font-mono text-[10px] text-slate-200 leading-relaxed break-words">{hviFormula}</p>
                <p className="text-[10px] text-slate-400">The score is clamped to 0–100. In the recorded formula, estimated surface temperature, NDBI and relative humidity increase the score; NDVI reduces it.</p>
              </div>

              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-1.5">
                <h5 className="text-[10px] uppercase tracking-wide font-semibold text-slate-300">Inputs recorded for {ward.ward_name}</h5>
                <div className="flex justify-between gap-3 text-[10px]"><span className="text-slate-400">Estimated surface temperature</span><strong className="text-slate-100 font-mono">{formatInput(hviInputs?.estimated_surface_temperature_c, ' °C')}</strong></div>
                <div className="flex justify-between gap-3 text-[10px]"><span className="text-slate-400">NDBI (built-up index)</span><strong className="text-slate-100 font-mono">{formatInput(hviInputs?.ndbi)}</strong></div>
                <div className="flex justify-between gap-3 text-[10px]"><span className="text-slate-400">NDVI (vegetation index)</span><strong className="text-slate-100 font-mono">{formatInput(hviInputs?.ndvi)}</strong></div>
                <div className="flex justify-between gap-3 text-[10px]"><span className="text-slate-400">Relative humidity</span><strong className="text-slate-100 font-mono">{formatInput(hviInputs?.relative_humidity_pct, '%')}</strong></div>
                <p className="text-[10px] text-slate-400 leading-relaxed">NDVI/NDBI and the population field are bundled demo inputs. The temperature estimate mixes those fields with Open-Meteo weather where available; relative humidity is provider-backed when refresh succeeds.</p>
                {temperatureFormula && (
                  <details className="pt-1 border-t border-slate-800">
                    <summary className="cursor-pointer text-[10px] text-sky-300 hover:text-sky-200">How the surface-temperature input is estimated</summary>
                    <div className="pt-1.5 space-y-1.5">
                      <p className="font-mono text-[10px] text-slate-300 leading-relaxed break-words">{temperatureFormula}</p>
                      <div className="flex justify-between gap-3 text-[10px]"><span className="text-slate-400">Air temperature (2 m)</span><strong className="text-slate-100 font-mono">{formatInput(temperatureInputs?.air_temperature_2m_c, ' °C')}</strong></div>
                      <div className="flex justify-between gap-3 text-[10px]"><span className="text-slate-400">Soil temperature (0 cm)</span><strong className="text-slate-100 font-mono">{formatInput(temperatureInputs?.soil_temperature_0cm_c, ' °C')}</strong></div>
                      <div className="flex justify-between gap-3 text-[10px]"><span className="text-slate-400">Population field (unit unverified)</span><strong className="text-slate-100 font-mono">{formatInput(temperatureInputs?.population_field_unit_unverified)}</strong></div>
                    </div>
                  </details>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-amber-500/20 space-y-1.5">
                <h5 className="text-[10px] uppercase tracking-wide font-semibold text-amber-300">Calculation basis: precomputed demo value</h5>
                <p className="text-[10px] text-slate-300 leading-relaxed">The bundled record stores this score as a precomputed value. Its original formula, weights and input values are not recorded, so the calculation that produced this baseline score cannot be verified. No ML model is documented as producing this value.</p>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-1.5">
                <h5 className="text-[10px] uppercase tracking-wide font-semibold text-slate-300">Related ward fields (not verified as original HVI inputs)</h5>
                <div className="flex justify-between gap-3 text-[10px]"><span className="text-slate-400">Surface-temperature-like field</span><strong className="text-slate-100 font-mono">{formatInput(ward.lst_mean_celsius, ' °C')}</strong></div>
                <div className="flex justify-between gap-3 text-[10px]"><span className="text-slate-400">NDVI (vegetation index)</span><strong className="text-slate-100 font-mono">{formatInput(ward.ndvi_mean)}</strong></div>
                <div className="flex justify-between gap-3 text-[10px]"><span className="text-slate-400">NDBI (built-up index)</span><strong className="text-slate-100 font-mono">{formatInput(ward.ndbi_mean)}</strong></div>
                <p className="text-[10px] text-slate-400 leading-relaxed">These values are available for the selected ward, but the stored baseline score does not establish that they were used to calculate it.</p>
              </div>
            </>
          )}

          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-1 text-[10px] text-slate-400">
            <div className="flex items-start gap-1.5"><Database className="w-3 h-3 text-sky-400 shrink-0 mt-0.5" /><span><strong className="text-slate-200">Source:</strong> {hviProvenance?.source_name || ward.data_source || 'Bundled ward metrics JSON'}{hviProvenance?.data_status ? ` · ${hviProvenance.data_status}` : ` · ${ward.data_status || 'baseline data'}`}</span></div>
            {hviProvenance?.limitations && <p className="leading-relaxed">{hviProvenance.limitations}</p>}
            {!hasFormulaBackedHvi && <p className="leading-relaxed">The bundled baseline comes from <code className="text-slate-300">data/mumbai_satellite_ward_metrics.json</code>; source and original processing have not been independently verified.</p>}
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed">Risk bands: Low &lt; 40 · Moderate 40–&lt; 60 · High 60–&lt; 75 · Extreme ≥ 75.</p>
        </div>
      ) : (
        <>
          <p className="text-[11px] text-slate-300 leading-relaxed">{info.shortDef}</p>
          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-1 text-[10px] text-slate-400">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-emerald-400" />Frequency:</span>
              <strong className="text-slate-200 font-mono">{info.updateFrequency}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1"><Database className="w-3 h-3 text-sky-400" />Provider:</span>
              <strong className="text-slate-200 font-mono">{info.sourceName}</strong>
            </div>
          </div>
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-[10px] text-amber-300 leading-normal">💡 <strong>Science Tip:</strong> {info.scienceTip}</div>
        </>
      )}
    </div>
  ) : null;

  return (
    <div className={`inline-flex items-center gap-1.5 relative ${className}`} ref={popoverRef}>
      {label && <span className="text-xs font-medium text-slate-300">{label}</span>}
      <button
        type="button"
        ref={triggerRef}
        onClick={handleTriggerClick}
        className="text-slate-400 hover:text-sky-400 transition-colors p-0.5 rounded-full hover:bg-slate-800/60 outline-none focus:ring-1 focus:ring-sky-500/50"
        title={ward && metricKey === 'hvi' ? 'How is this heat risk value calculated?' : `Explore science behind ${info.title}`}
        aria-label={ward && metricKey === 'hvi' ? `How is the heat risk score calculated for ${ward.ward_name}?` : `Scientific definition for ${info.title}`}
        aria-expanded={isOpen}
      >
        <Info className={`${iconSizeClass} shrink-0`} />
      </button>

      {/* Selected-ward HVI content is portaled to avoid being clipped by map/sidebar overflow containers. */}
      {popoverCard && (isWardHviPopover ? createPortal(popoverCard, document.body) : popoverCard)}
    </div>
  );
};
