import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { FeatureCollection } from 'geojson';
import type { MapLayerType } from '../../types';
import { LAYER_CONFIGS } from '../../constants/layers';
import { LayerSelector } from './LayerSelector';
import { MapLegend } from './MapLegend';
import { RotateCcw } from 'lucide-react';

interface MapViewProps {
  geoJsonData: FeatureCollection | null;
  selectedWardId: string | null;
  onSelectWard: (wardId: string | null) => void;
  activeLayer: MapLayerType;
  onChangeLayer: (layer: MapLayerType) => void;
}

// CARTO DarkMatter Vector Style URL
const CARTO_DARK_STYLE_URL = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

// Self-contained raster fallback style
const CARTO_DARK_RASTER_FALLBACK: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'carto-dark-basemap': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }
  },
  layers: [
    {
      id: 'carto-dark-tiles',
      type: 'raster',
      source: 'carto-dark-basemap',
      minzoom: 0,
      maxzoom: 19,
      paint: {
        'raster-opacity': 0.85
      }
    }
  ]
};

// Initial fallback center (Greater Mumbai Peninsula)
const MUMBAI_DEFAULT_CENTER: [number, number] = [72.8650, 19.0800];
const DEFAULT_ZOOM = 11.0;

// GeoJSON properties are data, not trusted HTML. Escape every dynamic value
// inserted into MapLibre's HTML popup or marker templates.
function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Helper: Computes exact bounding box [minLng, minLat, maxLng, maxLat] for a feature or collection
function getFeatureBounds(featureOrCollection: any): maplibregl.LngLatBoundsLike | null {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  const extractCoords = (coords: any) => {
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      const [lng, lat] = coords;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    } else if (Array.isArray(coords)) {
      coords.forEach(extractCoords);
    }
  };

  const features = featureOrCollection.type === 'FeatureCollection' 
    ? featureOrCollection.features 
    : [featureOrCollection];

  features.forEach((feature: any) => {
    if (feature.geometry && 'coordinates' in feature.geometry) {
      extractCoords(feature.geometry.coordinates);
    }
  });

  if (minLng === Infinity || minLat === Infinity) return null;
  return [[minLng, minLat], [maxLng, maxLat]];
}

export const MapView: React.FC<MapViewProps> = ({
  geoJsonData,
  selectedWardId,
  onSelectWard,
  activeLayer,
  onChangeLayer
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const selectedMarkerRef = useRef<maplibregl.Marker | null>(null);
  const boundsRef = useRef<maplibregl.LngLatBoundsLike | null>(null);
  const hasFittedRef = useRef<boolean>(false);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredWardId, setHoveredWardId] = useState<string | null>(null);

  // 1. Initialize MapLibre GL instance
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: CARTO_DARK_STYLE_URL,
        center: MUMBAI_DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        attributionControl: false
      });
    } catch (err) {
      console.warn('Failed to load CARTO GL vector style, falling back to raster tiles:', err);
      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: CARTO_DARK_RASTER_FALLBACK,
        center: MUMBAI_DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        attributionControl: false
      });
    }

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    map.on('load', () => {
      setMapLoaded(true);
      map.resize();
    });

    map.on('error', (e) => {
      console.warn('MapLibre internal event:', e);
    });

    mapRef.current = map;

    const handleResize = () => map.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (selectedMarkerRef.current) selectedMarkerRef.current.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Compute bounds & auto-fit to Greater Mumbai when GeoJSON loads
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geoJsonData) return;

    const bounds = getFeatureBounds(geoJsonData);
    if (bounds) {
      boundsRef.current = bounds;

      if (mapLoaded && !hasFittedRef.current) {
        map.fitBounds(bounds, {
          padding: { top: 40, bottom: 40, left: 40, right: 40 },
          maxZoom: 12.5,
          duration: 1000
        });
        hasFittedRef.current = true;
      }
    }
  }, [mapLoaded, geoJsonData]);

  // 3. Auto-Zoom / Fly-To when a ward is selected (e.g., Dharavi searched or clicked)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !geoJsonData) return;

    if (selectedWardId) {
      // Find matching ward features (polygon or dots)
      const wardFeatures = geoJsonData.features.filter(
        (f: any) => f.properties?.ward_id === selectedWardId
      );

      if (wardFeatures.length > 0) {
        const bounds = getFeatureBounds({ type: 'FeatureCollection', features: wardFeatures });
        if (bounds) {
          map.fitBounds(bounds, {
            padding: { top: 70, bottom: 70, left: 70, right: 70 },
            maxZoom: 14.5,
            duration: 1200,
            essential: true
          });
        }
      }

      // Add elegant pulsing centroid marker for selected ward
      const centroidFeature = wardFeatures.find(
        (f: any) => f.properties?.is_centroid || f.properties?.feature_type === 'ward_polygon'
      );

      if (centroidFeature && centroidFeature.geometry) {
        const coords = centroidFeature.geometry.type === 'Point' 
          ? centroidFeature.geometry.coordinates 
          : getFeatureBounds(centroidFeature)
            ? [
                ((getFeatureBounds(centroidFeature) as any)[0][0] + (getFeatureBounds(centroidFeature) as any)[1][0]) / 2,
                ((getFeatureBounds(centroidFeature) as any)[0][1] + (getFeatureBounds(centroidFeature) as any)[1][1]) / 2
              ]
            : null;

        if (coords) {
          if (selectedMarkerRef.current) {
            selectedMarkerRef.current.remove();
          }

          const el = document.createElement('div');
          el.className = 'flex flex-col items-center pointer-events-none z-30';
          el.innerHTML = `
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-white shadow-lg"></span>
            </div>
            <div className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 text-rose-300 border border-rose-500/50 text-[10px] font-bold shadow-xl backdrop-blur-sm whitespace-nowrap">
              ${escapeHtml(centroidFeature.properties?.ward_name || selectedWardId)}
            </div>
          `;

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([coords[0], coords[1]])
            .addTo(map);

          selectedMarkerRef.current = marker;
        }
      }
    } else {
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.remove();
        selectedMarkerRef.current = null;
      }
    }
  }, [selectedWardId, mapLoaded, geoJsonData]);

  // 4. Reset View to Greater Mumbai Bounds & Clear Ward Selection
  const handleResetMumbaiView = () => {
    onSelectWard(null);

    const map = mapRef.current;
    if (!map) return;

    if (boundsRef.current) {
      map.fitBounds(boundsRef.current, {
        padding: { top: 40, bottom: 40, left: 40, right: 40 },
        maxZoom: 12.5,
        duration: 900
      });
    } else {
      map.flyTo({
        center: MUMBAI_DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        essential: true
      });
    }
  };

  // 5. Render Sources & Clean Microclimate Layers (Dots + Layer-Aware Heatmap + Ward Boundaries)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !geoJsonData) return;

    const config = LAYER_CONFIGS[activeLayer];
    map.resize();

    // Source Registration
    if (map.getSource('mumbai-wards')) {
      (map.getSource('mumbai-wards') as maplibregl.GeoJSONSource).setData(geoJsonData);
    } else {
      map.addSource('mumbai-wards', {
        type: 'geojson',
        data: geoJsonData
      });
    }

    // Dynamic Color Expressions
    let dotColorExpr: any;
    let fillColorExpr: any;

    if (activeLayer === 'cluster') {
      dotColorExpr = [
        'match',
        ['coalesce', ['to-number', ['get', 'cluster_id']], 0],
        0, '#ef4444',
        1, '#10b981',
        2, '#0ea5e9',
        '#64748b'
      ];
      fillColorExpr = dotColorExpr;
    } else if (activeLayer === 'hvi') {
      // Exact cut-offs match API/data risk tiers: <40 low, 40–<60 moderate, 60–<75 high, >=75 extreme.
      const score = ['coalesce', ['to-number', ['get', 'hvi_score']], 0];
      dotColorExpr = ['step', score, '#2ec4b6', 40, '#f7b801', 60, '#f15bb5', 75, '#e63946'];
      fillColorExpr = dotColorExpr;
    } else {
      const stops = config.stops;
      const propKey = activeLayer === 'lst' ? 'lst_temp' : config.propertyKey;

      dotColorExpr = [
        'interpolate',
        ['linear'],
        ['coalesce', ['to-number', ['get', propKey]], ['to-number', ['get', config.propertyKey]], stops[0][0]],
        stops[0][0], stops[0][1],
        stops[1][0], stops[1][1],
        stops[2][0], stops[2][1],
        stops[3][0], stops[3][1]
      ];
      fillColorExpr = dotColorExpr;
    }

    // 1. Heatmap Layer for continuous thermal heat gradient
    if (!map.getLayer('wards-heatmap')) {
      map.addLayer({
        id: 'wards-heatmap',
        type: 'heatmap',
        source: 'mumbai-wards',
        filter: ['==', ['get', 'feature_type'], 'heat_dot'],
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['coalesce', ['to-number', ['get', 'lst_temp']], ['to-number', ['get', 'hvi_score']], 30],
            25, 0.2,
            40, 1.0
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 0.8,
            15, 2.5
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(15, 23, 42, 0)',
            0.2, 'rgba(14, 165, 233, 0.35)',
            0.4, 'rgba(16, 185, 129, 0.55)',
            0.7, 'rgba(245, 158, 11, 0.75)',
            1.0, 'rgba(239, 68, 68, 0.92)'
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 14,
            14, 32
          ],
          'heatmap-opacity': 0.55
        }
      });
    }

    // The heat density layer represents the surface-temperature-like field only. Hide it for
    // HVI/NDVI/NDBI/cluster selections so it cannot visually imply those layers are temperatures.
    if (map.getLayer('wards-heatmap')) {
      map.setLayoutProperty('wards-heatmap', 'visibility', activeLayer === 'lst' ? 'visible' : 'none');
    }

    // 2. Soft Translucent Ward Polygon Shading (Clean UI - NO harsh blocky solid squares!)
    const fillOpacityExpr: any = [
      'case',
      ['==', ['get', 'ward_id'], selectedWardId || ''],
      0.25,
      0.12
    ];

    if (!map.getLayer('wards-fill')) {
      map.addLayer({
        id: 'wards-fill',
        type: 'fill',
        source: 'mumbai-wards',
        filter: ['==', ['get', 'feature_type'], 'ward_polygon'],
        paint: {
          'fill-color': fillColorExpr,
          'fill-opacity': fillOpacityExpr
        }
      });
    } else {
      map.setPaintProperty('wards-fill', 'fill-color', fillColorExpr);
      map.setPaintProperty('wards-fill', 'fill-opacity', fillOpacityExpr);
    }

    // 3. Ward Boundaries Line Layer
    if (!map.getLayer('wards-borders')) {
      map.addLayer({
        id: 'wards-borders',
        type: 'line',
        source: 'mumbai-wards',
        filter: ['==', ['get', 'feature_type'], 'ward_polygon'],
        paint: {
          'line-color': '#38bdf8',
          'line-width': 1.2,
          'line-opacity': 0.6
        }
      });
    }

    // 4. Microclimate Heat Sampling Dots Layer (Clean dots representing heat distribution)
    if (!map.getLayer('wards-heat-dots')) {
      map.addLayer({
        id: 'wards-heat-dots',
        type: 'circle',
        source: 'mumbai-wards',
        filter: ['==', ['get', 'feature_type'], 'heat_dot'],
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 3.5,
            13, 5.5,
            16, 9.0
          ],
          'circle-color': dotColorExpr,
          'circle-opacity': 0.85,
          'circle-stroke-width': 1.0,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.7,
          'circle-blur': 0.15
        }
      });
    } else {
      map.setPaintProperty('wards-heat-dots', 'circle-color', dotColorExpr);
    }

    // Hover Highlight Line Layer (Gold glowing border)
    if (!map.getLayer('wards-hover')) {
      map.addLayer({
        id: 'wards-hover',
        type: 'line',
        source: 'mumbai-wards',
        filter: ['==', ['get', 'feature_type'], 'ward_polygon'],
        paint: {
          'line-color': '#fbbf24',
          'line-width': 2.5,
          'line-opacity': 1.0
        }
      });
      map.setFilter('wards-hover', ['all', ['==', ['get', 'feature_type'], 'ward_polygon'], ['==', ['get', 'ward_id'], '']]);
    }

    // Selected Ward Boundary Highlight Layer (Bright white glowing border)
    if (!map.getLayer('wards-selected')) {
      map.addLayer({
        id: 'wards-selected',
        type: 'line',
        source: 'mumbai-wards',
        filter: ['all', ['==', ['get', 'feature_type'], 'ward_polygon'], ['==', ['get', 'ward_id'], selectedWardId || '']],
        paint: {
          'line-color': '#ffffff',
          'line-width': 3.5,
          'line-opacity': 1.0
        }
      });
    } else {
      map.setFilter('wards-selected', ['all', ['==', ['get', 'feature_type'], 'ward_polygon'], ['==', ['get', 'ward_id'], selectedWardId || '']]);
    }

    // Tooltip Popup Setup
    const popup = popupRef.current || new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 14
    });
    popupRef.current = popup;

    // Mouse Movement / Hover Handler (Handles hover over both dots & ward polygons)
    const handleMouseMove = (e: maplibregl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['wards-heat-dots', 'wards-fill'] });
      if (features && features.length > 0) {
        map.getCanvas().style.cursor = 'pointer';
        const feature = features[0];
        const props = feature.properties;
        if (!props) return;

        setHoveredWardId(props.ward_id);

        const isDot = props.feature_type === 'heat_dot';
        const val = isDot && props.lst_temp !== undefined ? props.lst_temp : props[config.propertyKey];
        const formattedVal = escapeHtml(config.formatValue(val));
        const wardName = escapeHtml(props.ward_name || props.ward_id || 'Unknown ward');
        const wardCode = escapeHtml(props.ward_code || '');
        const riskTier = escapeHtml(props.risk_tier || 'Unknown');
        const metricLabel = escapeHtml(config.label);
        const surfaceTemp = escapeHtml(props.lst_mean ?? props.lst_temp ?? 'unknown');
        const rawNdvi = props.ndvi_mean;
        const vegetationValue = rawNdvi !== undefined && rawNdvi !== null && Number.isFinite(Number(rawNdvi))
          ? Number(rawNdvi).toFixed(3)
          : 'unavailable';
        const vegetationStatus = escapeHtml(String(props.ndvi_data_status ?? props.ndvi_source_type ?? (props.is_demo_data ? 'demo_data' : 'unknown')).replaceAll('_', ' '));

        const html = `
          <div style="font-family: Inter, sans-serif; padding: 4px 6px;">
            <div style="font-size: 12px; font-weight: 700; color: #ffffff; margin-bottom: 2px; display: flex; items-center; justify-content: space-between;">
              <span>${wardName}</span>
              <span style="color: #94a3b8; font-weight: 500; font-size: 10px; margin-left: 8px;">(${wardCode})</span>
            </div>
            ${isDot ? `<div style="font-size: 10px; color: #38bdf8; margin-bottom: 2px;">📍 Ward reference point</div>` : ''}
            <div style="font-size: 13px; font-weight: 700; color: #fb7185; margin-top: 2px;">
              ${metricLabel}: <span style="color: #ffffff;">${formattedVal}</span>
            </div>
            <div style="font-size: 11px; color: #cbd5e1; margin-top: 3px; display: flex; justify-content: space-between; gap: 12px;">
              <span>Risk Tier: <strong style="color: #f59e0b;">${riskTier}</strong></span>
              <span>Estimated surface temp: <strong>${surfaceTemp}°C</strong></span>
            </div>
            <div style="font-size: 11px; color: #a7f3d0; margin-top: 4px; border-top: 1px solid rgba(148,163,184,.2); padding-top: 4px;">
              Vegetation NDVI: <strong style="color: #ffffff;">${escapeHtml(vegetationValue)}</strong>
              <span style="color: #fbbf24; font-size: 10px;">(${vegetationStatus})</span>
            </div>
            <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">Click this ward to open its vegetation formula and source details.</div>
          </div>
        `;

        popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
      } else {
        map.getCanvas().style.cursor = '';
        setHoveredWardId(null);
        popup.remove();
      }
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = '';
      setHoveredWardId(null);
      popup.remove();
    };

    // Click Handler (Ward polygons & dots select ward & zoom)
    const handleClick = (e: maplibregl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['wards-heat-dots', 'wards-fill'] });
      if (features && features.length > 0) {
        const feature = features[0];
        const wardId = feature.properties?.ward_id;
        if (wardId) {
          onSelectWard(wardId);
        }
      }
    };

    map.on('mousemove', handleMouseMove);
    map.on('mouseleave', 'wards-fill', handleMouseLeave);
    map.on('mouseleave', 'wards-heat-dots', handleMouseLeave);
    map.on('click', handleClick);

    return () => {
      map.off('mousemove', handleMouseMove);
      map.off('mouseleave', 'wards-fill', handleMouseLeave);
      map.off('mouseleave', 'wards-heat-dots', handleMouseLeave);
      map.off('click', handleClick);
    };
  }, [mapLoaded, geoJsonData, activeLayer, selectedWardId, onSelectWard]);

  // Separate effect for lightweight hover filter updates
  useEffect(() => {
    const map = mapRef.current;
    if (map && mapLoaded && map.getLayer('wards-hover')) {
      map.setFilter('wards-hover', ['all', ['==', ['get', 'feature_type'], 'ward_polygon'], ['==', ['get', 'ward_id'], hoveredWardId || '']]);
    }
  }, [hoveredWardId, mapLoaded]);

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden bg-slate-950">
      {/* MapLibre DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0" />

      {/* Floating Layer Selector Controls */}
      <div className="absolute top-4 left-4 z-20">
        <LayerSelector activeLayer={activeLayer} onSelectLayer={onChangeLayer} />
      </div>

      {/* Floating Map Legend */}
      <div className="absolute bottom-6 left-4 z-20">
        <MapLegend activeLayer={activeLayer} />
      </div>

      {/* Reset Mumbai View Control */}
      <div className="absolute top-4 right-14 z-20">
        <button
          onClick={handleResetMumbaiView}
          className="glass-panel px-3 py-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800/90 transition-all shadow-xl border border-white/15 flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          title="Reset Map to Greater Mumbai Bounds & Clear Ward Selection"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
          <span>Reset Mumbai View</span>
        </button>
      </div>

      {/* Floating Data Freshness & Watermark Badge */}
      <div className="absolute bottom-6 right-16 z-10 glass-panel px-3 py-1 rounded-full text-[10px] text-slate-400 border border-white/10 hidden md:block">
        Basemap: CARTO DarkMatter | Heat Sampling Dots & Microclimate Layers
      </div>
    </div>
  );
};
