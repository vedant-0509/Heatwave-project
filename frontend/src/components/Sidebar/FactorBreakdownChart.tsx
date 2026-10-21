import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { WardMetrics } from '../../types';

interface FactorBreakdownChartProps {
  ward: WardMetrics;
  cityAvgLst?: number;
}

export const FactorBreakdownChart: React.FC<FactorBreakdownChartProps> = ({
  ward,
  cityAvgLst: _cityAvgLst = 35.6
}) => {
  // Normalize factors to 0-100 scale for intuitive comparison
  const data = [
    {
      name: 'Surface-temperature-like value',
      score: Math.min(100, Math.max(0, ((ward.lst_mean_celsius - 28) / 14) * 100)),
      raw: `${ward.lst_mean_celsius}°C`,
      color: '#f97316'
    },
    {
      name: 'Built-up index (NDBI)',
      score: Math.min(100, Math.max(0, ward.ndbi_mean * 100)),
      raw: ward.ndbi_mean.toFixed(2),
      color: '#e11d48'
    },
    {
      name: 'Vegetation index context (NDVI)',
      score: Math.min(100, Math.max(0, (1 - ward.ndvi_mean) * 100)),
      raw: `${(1 - ward.ndvi_mean).toFixed(2)} (NDVI: ${ward.ndvi_mean.toFixed(2)})`,
      color: '#eab308'
    }
  ];

  return (
    <div className="w-full mt-2">
      <p className="text-[10px] text-amber-300 mb-1.5">These bars are simple display rescalings, not HVI factor contributions or validated risk weights. The population field is omitted because its unit is unverified.</p>
      <div className="w-full h-40">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
        >
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis 
            type="category" 
            dataKey="name" 
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            width={120}
          />
          <Tooltip 
            formatter={(_value: any, _name: any, item: any) => [item.payload.raw, 'Intensity']}
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '11px'
            }}
          />
          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={12}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
};
