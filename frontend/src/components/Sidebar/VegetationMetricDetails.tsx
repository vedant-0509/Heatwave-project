import React from 'react';
import { CheckCircle2, Database, Info, Trees } from 'lucide-react';
import type { WardMetrics } from '../../types';

interface VegetationMetricDetailsProps {
  ward: WardMetrics;
}

/**
 * A ward-specific explanation of the vegetation number shown in UrbanHeat.
 * The bundled project's NDVI values currently come from the static/demo JSON;
 * this component explains the scientific formula without pretending to run it
 * on satellite pixels in the browser.
 */
export const VegetationMetricDetails: React.FC<VegetationMetricDetailsProps> = ({ ward }) => {
  const provenance = ward.metric_provenance?.ndvi;
  const ndviValue = Number.isFinite(ward.ndvi_mean) ? ward.ndvi_mean : null;
  const sourceType = provenance?.source_type ?? (ward.is_demo_data ? 'demo_data' : 'unknown');
  const isDemo = provenance?.is_demo_data ?? ward.is_demo_data;
  const isSatelliteDerived = sourceType === 'satellite_observed' && isDemo === false;
  const sourceName = provenance?.source_name ?? ward.data_source ?? 'Bundled ward metrics JSON';
  const sourceStatus = (provenance?.data_status ?? ward.data_status ?? sourceType).replaceAll('_', ' ');

  return (
    <section
      aria-label={`Vegetation index details for ${ward.ward_name}`}
      className="glass-card rounded-xl border border-emerald-500/25 p-5 space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2">
            <Trees className="w-4 h-4 text-emerald-300" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Vegetation for {ward.ward_name}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Ward {ward.ward_code} · Normalized Difference Vegetation Index (NDVI)</p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${isSatelliteDerived ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border border-amber-500/25'}`}>
          {isSatelliteDerived ? 'Satellite-derived' : isDemo ? 'Demo value' : 'Source unverified'}
        </span>
      </div>

      <div className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3">
        <div>
          <div className="text-[10px] text-slate-400">Displayed vegetation index</div>
          <div className="mt-0.5 font-mono text-2xl font-black text-emerald-300" aria-label={`NDVI value ${ndviValue === null ? 'unavailable' : ndviValue.toFixed(3)}`}>
            {ndviValue === null ? 'Unavailable' : ndviValue.toFixed(3)}
          </div>
          <div className="text-[9px] text-slate-500">Dimensionless index · theoretical range −1 to +1</div>
        </div>
        <div className="border-l border-slate-800 pl-3">
          <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-200"><Database className="w-3 h-3 text-sky-300" /> Source and status</div>
          <p className="mt-1 text-[10px] leading-relaxed text-slate-400">{sourceName}</p>
          <p className="mt-1 text-[9px] capitalize text-amber-300">{sourceStatus}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <h4 className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-200"><Info className="w-3.5 h-3.5" /> How NDVI is calculated from satellite reflectance</h4>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 px-3 py-2 text-center">
          <code className="text-sm font-bold tracking-wide text-emerald-100">NDVI = (NIR − Red) / (NIR + Red)</code>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-400">
          <strong className="text-slate-300">NIR</strong> is near-infrared reflectance and <strong className="text-slate-300">Red</strong> is red-band reflectance. A real ward summary is made by calculating NDVI for valid image pixels inside the ward boundary and aggregating those pixel values (for example, their mean), after appropriate quality/cloud masking.
        </p>
      </div>

      {isSatelliteDerived ? (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
          <p className="text-[10px] leading-relaxed text-slate-300">The metric metadata identifies this value as satellite-derived. Check the acquisition date, processing method, valid-pixel count, and source identifier in Metric Details before treating it as an observation.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-2.5 space-y-1">
          <p className="text-[10px] font-bold text-amber-200">Important: the current app does not calculate this number from satellite images.</p>
          <p className="text-[10px] leading-relaxed text-slate-300">
            This ward's NDVI value is read from the bundled metrics dataset. The repository does not include verified red/NIR pixel inputs, source-scene metadata, or a ward-level raster calculation pipeline, so the displayed value is a demonstration value rather than a freshly measured vegetation result.
          </p>
        </div>
      )}

      <p className="text-[10px] leading-relaxed text-slate-500">
        NDVI is an index, not a percentage of tree cover. For example, NDVI = 0.250 does not mean 25% vegetation coverage. {provenance?.limitations ?? 'Source imagery and processing details have not been verified.'}
      </p>
    </section>
  );
};
