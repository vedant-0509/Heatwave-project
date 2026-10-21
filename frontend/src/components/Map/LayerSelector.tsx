import React from 'react';
import { Layers, Thermometer, Trees, Building2, Grid, ShieldAlert } from 'lucide-react';
import type { MapLayerType } from '../../types';
import { LAYER_CONFIGS } from '../../constants/layers';
import { InfoPopover } from '../Common/InfoPopover';

interface LayerSelectorProps {
  activeLayer: MapLayerType;
  onSelectLayer: (layer: MapLayerType) => void;
}

export const LayerSelector: React.FC<LayerSelectorProps> = ({ activeLayer, onSelectLayer }) => {
  const getIcon = (id: MapLayerType) => {
    switch (id) {
      case 'hvi': return <ShieldAlert className="w-4 h-4" />;
      case 'lst': return <Thermometer className="w-4 h-4" />;
      case 'ndvi': return <Trees className="w-4 h-4" />;
      case 'ndbi': return <Building2 className="w-4 h-4" />;
      case 'cluster': return <Grid className="w-4 h-4" />;
    }
  };

  return (
    <div className="glass-panel rounded-xl p-1.5 shadow-2xl border border-white/10 flex flex-col gap-1 z-20 max-w-[220px]">
      <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-white/5 mb-0.5">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3 h-3 text-sky-400" />
          <span>Spatial Map Layers</span>
        </div>
        <InfoPopover metricKey={activeLayer === 'hvi' ? 'hvi' : activeLayer === 'lst' ? 'lst' : activeLayer === 'ndvi' ? 'ndvi' : 'ndbi'} />
      </div>

      {(Object.keys(LAYER_CONFIGS) as MapLayerType[]).map((layerId) => {
        const config = LAYER_CONFIGS[layerId];
        const isActive = activeLayer === layerId;

        return (
          <button
            key={layerId}
            onClick={() => onSelectLayer(layerId)}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-all ${
              isActive
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={isActive ? 'text-rose-400' : 'text-slate-400'}>
                {getIcon(layerId)}
              </span>
              <span>{config.label}</span>
            </div>
            <span className="text-[10px] opacity-70 font-mono">
              {config.unit.includes('°C') ? '°C' : ''}
            </span>
          </button>
        );
      })}
    </div>
  );
};
