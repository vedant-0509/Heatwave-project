import React, { useEffect, useMemo, useState } from 'react';
import { Header } from '../Header';
import { MapView } from '../Map/MapView';
import { AnalyticsSidebar } from '../Sidebar/AnalyticsSidebar';
import { ScienceModal } from '../Educational/ScienceModal';
import { useRouter } from '../../router/RouterContext';
import {
  fetchWardGeoJSON,
  fetchWardMetrics,
  refreshLiveWardMetrics,
  fetchCurrentWeather,
  fetchCurrentAirQuality,
  MUMBAI_DEFAULT_COORDS,
  WARD_CENTROIDS,
  downloadWardReport
} from '../../services/api';
import type { FeatureCollection } from 'geojson';
import type { MapLayerType, WardMetrics, CurrentWeather, AirQualityResponse } from '../../types';
import { AlertCircle, Loader2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { navigate } = useRouter();
  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | null>(null);
  const [wardMetricsMap, setWardMetricsMap] = useState<Record<string, WardMetrics>>({});
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityResponse | null>(null);
  const [isRefreshingLive, setIsRefreshingLive] = useState<boolean>(false);
  const [refreshNotice, setRefreshNotice] = useState<{ kind: 'info' | 'error'; message: string } | null>(null);
  
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('hvi');
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [initialError, setInitialError] = useState<string | null>(null);

  // Educational Science Modal state
  const [isScienceOpen, setIsScienceOpen] = useState<boolean>(false);

  const handleRefreshLive = async () => {
    try {
      setIsRefreshingLive(true);
      setRefreshNotice(null);
      const metrics = await refreshLiveWardMetrics();
      setWardMetricsMap(metrics);
      const representativeWard = Object.values(metrics)[0];
      if (representativeWard?.is_stale || representativeWard?.data_status === 'stale_mixed_data_refresh_failed') {
        setRefreshNotice({ kind: 'info', message: 'Refresh returned stale cached estimates. The previous successful retrieval time remains visible in Metric Details.' });
      } else if (representativeWard?.data_status === 'demo_fallback_provider_unavailable' || representativeWard?.data_status === 'partial_data_invalid_static_input') {
        setRefreshNotice({ kind: 'info', message: 'The weather provider or required input data are unavailable. The dashboard is showing explicitly labelled demo/fallback values, not fresh live ward data.' });
      } else {
        setRefreshNotice({ kind: 'info', message: 'Ward estimates refreshed. Weather inputs may be API-backed, but bundled environmental inputs remain demo data.' });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to refresh ward estimates.';
      console.warn('Live refresh error:', err);
      setRefreshNotice({ kind: 'error', message });
    } finally {
      setIsRefreshingLive(false);
    }
  };

  // Load initial spatial datasets
  useEffect(() => {
    async function loadInitialData() {
      try {
        setInitialLoading(true);
        setInitialError(null);

        const [geoJson, metrics] = await Promise.all([
          fetchWardGeoJSON(),
          fetchWardMetrics()
        ]);

        setGeoJsonData(geoJson);
        setWardMetricsMap(metrics);
      } catch (err: any) {
        console.error('Initial Data Loading Error:', err);
        setInitialError(err.message || 'Failed to load UrbanHeat spatial datasets.');
      } finally {
        setInitialLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Fetch real atmospheric weather based on selected ward centroid or default Mumbai coordinates
  const loadWeather = async (lat: number, lon: number) => {
    try {
      setWeatherLoading(true);
      setWeatherError(null);
      const data = await fetchCurrentWeather(lat, lon);
      setWeather(data);
    } catch (err: any) {
      console.error('Weather Fetch Error:', err);
      setWeatherError('Weather data temporarily unavailable');
      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
    try {
      setAirQuality(await fetchCurrentAirQuality(lat, lon));
    } catch (err) {
      console.warn('Air-quality fetch error:', err);
      setAirQuality(null);
    }
  };

  // Weather effect triggered on mount and when selected Ward changes
  useEffect(() => {
    if (selectedWardId && WARD_CENTROIDS[selectedWardId]) {
      const { lat, lon } = WARD_CENTROIDS[selectedWardId];
      loadWeather(lat, lon);
    } else {
      loadWeather(MUMBAI_DEFAULT_COORDS.lat, MUMBAI_DEFAULT_COORDS.lon);
    }
  }, [selectedWardId]);

  const wardNames = Object.values(wardMetricsMap).map(w => ({
    id: w.ward_id,
    name: w.ward_name,
    code: w.ward_code
  }));

  // Keep the map's displayed values on the same active ward records used by the summary and inspector.
  // The bundled polygons are geometry; metric properties are projected from the active API/demo source.
  const mapGeoJsonData = useMemo<FeatureCollection | null>(() => {
    if (!geoJsonData) return null;
    return {
      ...geoJsonData,
      features: geoJsonData.features.map((feature) => {
        const properties = feature.properties as Record<string, unknown> | null | undefined;
        const wardId = typeof properties?.ward_id === 'string' ? properties.ward_id : null;
        const metric = wardId ? wardMetricsMap[wardId] : undefined;
        if (!metric) return feature;
        return {
          ...feature,
          properties: {
            ...properties,
            hvi_score: metric.hvi_score,
            risk_tier: metric.risk_tier,
            lst_mean: metric.lst_mean_celsius,
            lst_temp: metric.lst_mean_celsius,
            lst_mean_celsius: metric.lst_mean_celsius,
            ndvi_mean: metric.ndvi_mean,
            // Field-specific provenance avoids labelling demo NDVI as current merely
            // because another metric (for example weather) came from an API.
            ndvi_source_type: metric.metric_provenance?.ndvi?.source_type ?? (metric.is_demo_data ? 'demo_data' : 'unknown'),
            ndvi_data_status: metric.metric_provenance?.ndvi?.data_status ?? metric.metric_provenance?.ndvi?.source_type ?? (metric.is_demo_data ? 'demo_data' : 'unknown'),
            ndbi_mean: metric.ndbi_mean,
            pop_density: metric.population_density,
            cluster_id: metric.cluster_id,
            cluster_name: metric.cluster_name,
            is_demo_data: metric.is_demo_data,
            data_status: metric.data_status ?? (metric.is_demo_data ? 'demo_data' : 'unknown'),
            is_stale: metric.is_stale ?? false,
            surface_temperature_source_type: metric.surface_temperature_source_type ?? 'demo_data'
          }
        };
      })
    };
  }, [geoJsonData, wardMetricsMap]);

  const selectedWard = selectedWardId ? wardMetricsMap[selectedWardId] || null : null;

  if (initialLoading) {
    return (
      <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 gap-3">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
        <h2 className="text-sm font-semibold tracking-wider text-slate-300">
          Loading UrbanHeat Mumbai Spatial Intelligence...
        </h2>
      </div>
    );
  }

  if (initialError) {
    return (
      <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-6">
        <div className="glass-panel p-6 rounded-2xl max-w-md w-full border border-red-500/30 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-100">Unable to Initialize Platform</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{initialError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs rounded-lg transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const activeWards = Object.values(wardMetricsMap);
  const citySummary = activeWards.length ? (() => {
    const average = (values: number[]) => values.length ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)) : 0;
    const counts = { Extreme: 0, High: 0, Moderate: 0, Low: 0 };
    activeWards.forEach(w => { counts[w.risk_tier] = (counts[w.risk_tier] ?? 0) + 1; });
    const ranked = [...activeWards].sort((a, b) => b.hvi_score - a.hvi_score);
    return { city_name: 'Greater Mumbai', total_wards: activeWards.length, average_hvi: average(activeWards.map(w => w.hvi_score)), average_lst: average(activeWards.map(w => w.lst_mean_celsius)), highest_risk_ward: ranked[0]?.ward_name ?? 'Unavailable', lowest_risk_ward: ranked[ranked.length - 1]?.ward_name ?? 'Unavailable', extreme_wards_count: counts.Extreme, high_wards_count: counts.High, moderate_wards_count: counts.Moderate, low_wards_count: counts.Low };
  })() : {
    city_name: 'Greater Mumbai', total_wards: 0, average_hvi: 0, average_lst: 0,
    highest_risk_ward: 'Unavailable', lowest_risk_ward: 'Unavailable',
    extreme_wards_count: 0, high_wards_count: 0, moderate_wards_count: 0, low_wards_count: 0
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 overflow-hidden select-none">
      {/* Top Glass Header */}
      <Header
        weather={weather}
        airQuality={airQuality}
        weatherLoading={weatherLoading}
        wardNames={wardNames}
        onSelectWard={(id) => setSelectedWardId(id)}
        selectedWardId={selectedWardId}
        onOpenScience={() => setIsScienceOpen(true)}
        onNavigateHome={() => navigate('/')}
        onRefreshLive={handleRefreshLive}
        isRefreshingLive={isRefreshingLive}
        onDownloadReport={downloadWardReport}
      />

      {refreshNotice && (
        <div
          role={refreshNotice.kind === 'error' ? 'alert' : 'status'}
          aria-live={refreshNotice.kind === 'error' ? 'assertive' : 'polite'}
          className={`absolute top-20 right-4 z-50 max-w-md rounded-lg border px-3 py-2 text-xs shadow-xl ${refreshNotice.kind === 'error' ? 'border-rose-500/40 bg-rose-950/95 text-rose-200' : 'border-sky-500/30 bg-slate-950/95 text-sky-100'}`}
        >
          <div className="flex items-start gap-3">
            <span>{refreshNotice.message}</span>
            <button type="button" onClick={() => setRefreshNotice(null)} className="shrink-0 text-current/80 hover:text-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400" aria-label="Dismiss refresh message">×</button>
          </div>
        </div>
      )}

      {/* Main Viewport: 70% Map / 30% Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Map Viewport (70% desktop width) */}
        <main className="flex-1 relative h-full">
          <MapView
            geoJsonData={mapGeoJsonData}
            selectedWardId={selectedWardId}
            onSelectWard={(id) => setSelectedWardId(id)}
            activeLayer={activeLayer}
            onChangeLayer={(layer) => setActiveLayer(layer)}
          />
        </main>

        {/* Analytics Sidebar (30% desktop width) */}
        <AnalyticsSidebar
          selectedWard={selectedWard}
          summary={citySummary}
          weather={weather}
          weatherLoading={weatherLoading}
          weatherError={weatherError}
          onRetryWeather={() => {
            if (selectedWardId && WARD_CENTROIDS[selectedWardId]) {
              const { lat, lon } = WARD_CENTROIDS[selectedWardId];
              loadWeather(lat, lon);
            } else {
              loadWeather(MUMBAI_DEFAULT_COORDS.lat, MUMBAI_DEFAULT_COORDS.lon);
            }
          }}
          onClearSelection={() => setSelectedWardId(null)}
          onSelectWardByName={(name) => {
            const match = Object.values(wardMetricsMap).find(w => w.ward_name.includes(name));
            if (match) setSelectedWardId(match.ward_id);
          }}
        />
      </div>

      {/* Educational Science Modal */}
      <ScienceModal
        isOpen={isScienceOpen}
        onClose={() => setIsScienceOpen(false)}
      />
    </div>
  );
};
