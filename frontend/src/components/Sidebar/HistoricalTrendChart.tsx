import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fetchHistoricalTrend, WARD_CENTROIDS } from '../../services/api';
import type { HistoricalPoint } from '../../types';

interface HistoricalTrendChartProps { wardId: string; baseLst: number; }

export const HistoricalTrendChart: React.FC<HistoricalTrendChartProps> = ({ wardId }) => {
  const [data, setData] = useState<HistoricalPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const coords = WARD_CENTROIDS[wardId];
    fetchHistoricalTrend(coords?.lat, coords?.lon).then(points => { if (active) setData(points); })
      .catch(err => { if (active) setError(err instanceof Error ? err.message : 'Historical weather unavailable'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [wardId]);

  if (loading) return <p className="text-xs text-slate-400 py-5">Loading historical weather…</p>;
  if (error || data.length === 0) return <div className="text-xs text-slate-400 py-4">Historical weather is unavailable right now. No simulated curve is shown. {error}</div>;

  return <div>
    <p className="text-[10px] text-amber-300 mb-2">Open-Meteo historical weather model data. This chart does not contain satellite LST.</p>
    <div className="w-full h-48 mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 9 }} tickFormatter={(str) => str.slice(5)} />
          <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 9 }} />
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '11px' }} />
          <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
          <Line type="monotone" dataKey="air_temp_celsius" name="Daily max air temp (°C)" stroke="#38bdf8" strokeWidth={1.5} dot={false} />
          <Line type="monotone" dataKey="apparent_temperature_celsius" name="Daily max apparent temp (°C)" stroke="#f97316" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>;
};
