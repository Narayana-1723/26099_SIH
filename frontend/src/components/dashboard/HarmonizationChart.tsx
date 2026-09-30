import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { CPSEHarmonizationStat, MonthlyProcessingTrend } from '../../types/analytics';

interface CPSEBarChartProps {
  data: CPSEHarmonizationStat[];
}

export const CPSEBarChart: React.FC<CPSEBarChartProps> = ({ data }) => {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="cpse" tick={{ fontSize: 11, fill: '#475569' }} />
          <YAxis tick={{ fontSize: 11, fill: '#475569' }} tickFormatter={(v) => `${v / 1000}k`} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f2942',
              borderColor: '#1e3a8a',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '12px',
            }}
            formatter={(val: number) => [`${val.toLocaleString()} records`, '']}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          <Bar dataKey="harmonized" name="Harmonized Records" fill="#047857" radius={[2, 2, 0, 0]} />
          <Bar dataKey="pendingReview" name="Pending Review" fill="#d97706" radius={[2, 2, 0, 0]} />
          <Bar dataKey="duplicates" name="Duplicates Found" fill="#3b82f6" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface MonthlyTrendChartProps {
  data: MonthlyProcessingTrend[];
}

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ data }) => {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="colorHarmonized" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#047857" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#047857" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="colorUploaded" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0f2942" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#0f2942" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} />
          <YAxis tick={{ fontSize: 11, fill: '#475569' }} tickFormatter={(v) => `${v / 1000}k`} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f2942',
              borderColor: '#1e3a8a',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          <Area
            type="monotone"
            dataKey="uploaded"
            name="Batch Uploaded"
            stroke="#0f2942"
            fillOpacity={1}
            fill="url(#colorUploaded)"
          />
          <Area
            type="monotone"
            dataKey="harmonized"
            name="AI Harmonized"
            stroke="#047857"
            fillOpacity={1}
            fill="url(#colorHarmonized)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
