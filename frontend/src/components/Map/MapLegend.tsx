import React from 'react';
import type { MapLayerType } from '../../types';
import { LAYER_CONFIGS } from '../../constants/layers';
import { Info } from 'lucide-react';

interface MapLegendProps {
  activeLayer: MapLayerType;
}

export const MapLegend: React.FC<MapLegendProps> = ({ activeLayer }) => {
  const config = LAYER_CONFIGS[activeLayer];

  return (
    <div className="glass-panel rounded-xl p-3 shadow-2xl border border-white/10 z-20 max-w-xs w-full">
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-xs font-semibold text-slate-200">{config.label}</h4>
        <span className="text-[10px] text-slate-400 font-mono">{config.unit}</span>
      </div>

      <p className="text-[11px] text-slate-400 mb-2 leading-tight">
        {config.description}
      </p>

      {/* Legend scale uses explicit categories for HVI so its colours match backend cut-offs. */}
      {activeLayer === 'hvi' ? (
        <div className="space-y-1 mt-2">
          <div className="flex items-center gap-2 text-xs text-slate-300"><span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: '#2ec4b6' }} /><span>Low: &lt; 40</span></div>
          <div className="flex items-center gap-2 text-xs text-slate-300"><span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: '#f7b801' }} /><span>Moderate: 40–&lt;60</span></div>
          <div className="flex items-center gap-2 text-xs text-slate-300"><span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: '#f15bb5' }} /><span>High: 60–&lt;75</span></div>
          <div className="flex items-center gap-2 text-xs text-slate-300"><span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: '#e63946' }} /><span>Extreme: ≥ 75</span></div>
        </div>
      ) : activeLayer === 'cluster' ? (
        <div className="space-y-1 mt-2">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
            <span>Cluster 0: Concrete Thermal Hotspot</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <span>Cluster 1: Vegetated Thermal Buffer</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
            <span>Cluster 2: Coastal Moderate Microclimate</span>
          </div>
        </div>
      ) : (
        <div>
          <div 
            className="h-2.5 w-full rounded-full mb-1"
            style={{
              background: `linear-gradient(to right, ${config.colors.join(', ')})`
            }}
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>{config.stops[0][0]}</span>
            <span>{config.stops[1][0]}</span>
            <span>{config.stops[2][0]}</span>
            <span>{config.stops[3][0]}</span>
          </div>
        </div>
      )}

      {/* Scientific disclaimer tag */}
      <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center gap-1.5 text-[10px] text-slate-500">
        <Info className="w-3 h-3 shrink-0 text-slate-400" />
        <span>Choropleth rendered on 24 bundled Mumbai ward polygons; boundary provenance has not been independently audited.</span>
      </div>
    </div>
  );
};
