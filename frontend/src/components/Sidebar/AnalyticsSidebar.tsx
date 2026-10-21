import React from 'react';
import type { WardMetrics, CurrentWeather, CitySummary } from '../../types';
import { OverviewPanel } from './OverviewPanel';
import { WardDetailsPanel } from './WardDetailsPanel';
import { X } from 'lucide-react';

interface AnalyticsSidebarProps {
  selectedWard: WardMetrics | null;
  summary: CitySummary;
  weather: CurrentWeather | null;
  weatherLoading?: boolean;
  weatherError?: string | null;
  onRetryWeather?: () => void;
  onClearSelection: () => void;
  onSelectWardByName: (wardName: string) => void;
}

export const AnalyticsSidebar: React.FC<AnalyticsSidebarProps> = ({
  selectedWard,
  summary,
  weather,
  weatherLoading = false,
  weatherError = null,
  onRetryWeather,
  onClearSelection,
  onSelectWardByName
}) => {
  return (
    <aside className="w-full lg:w-[380px] xl:w-[420px] h-full glass-panel border-l border-white/10 flex flex-col z-20 overflow-hidden relative shrink-0">
      {/* Sidebar Header */}
      <div className="h-12 px-4 border-b border-white/10 flex items-center justify-between bg-slate-950/40 shrink-0">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {selectedWard ? 'Ward Microclimate Inspector' : 'Mumbai Heat Intelligence'}
        </span>

        {selectedWard && (
          <button
            onClick={onClearSelection}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800 transition-colors"
            title="Close Ward Inspector"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        {selectedWard ? (
          <WardDetailsPanel
            ward={selectedWard}
            weather={weather}
            weatherLoading={weatherLoading}
            weatherError={weatherError}
            onRetryWeather={onRetryWeather}
            onBack={onClearSelection}
          />
        ) : (
          <OverviewPanel
            summary={summary}
            weather={weather}
            weatherLoading={weatherLoading}
            weatherError={weatherError}
            onRetryWeather={onRetryWeather}
            onSelectWardByName={onSelectWardByName}
          />
        )}
      </div>
    </aside>
  );
};
