/**
 * 折线图组件
 */
import React from 'react';

interface DataPoint {
  x: string | number;
  y: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  loading?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  data = [],
  height = 300,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="chart-loading flex items-center justify-center" style={{ height }}>
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center text-gray-400" style={{ height }}>
        暂无数据
      </div>
    );
  }

  const maxY = Math.max(...data.map(d => d.y));
  const minY = Math.min(...data.map(d => d.y));
  const range = maxY - minY || 1;

  const points = data.map((item, index) => ({
    x: (index / (data.length - 1 || 1)) * 100,
    y: 100 - ((item.y - minY) / range) * 100,
    value: item.y,
    label: item.x,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="relative" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#e5e7eb" strokeWidth="0.5" />
        ))}
        {/* Line */}
        <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {/* Points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2" fill="#10b981" />
        ))}
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 px-2">
        {points.filter((_, i) => i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2)).map((p, i) => (
          <span key={i}>{p.label}</span>
        ))}
      </div>
    </div>
  );
};

export default LineChart;