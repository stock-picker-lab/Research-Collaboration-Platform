/**
 * 饼图组件
 */
import React from 'react';

interface DataPoint {
  x: string | number;
  y: number;
}

interface PieChartProps {
  data: DataPoint[];
  height?: number;
  loading?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const PieChart: React.FC<PieChartProps> = ({
  data = [],
  height = 300,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="chart-loading flex items-center justify-center" style={{ height }}>
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
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

  const total = data.reduce((sum, item) => sum + item.y, 0);

  let currentAngle = 0;
  const slices = data.map((item, index) => {
    const percentage = item.y / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (startAngle + angle - 90) * (Math.PI / 180);

    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathD = angle === 100
      ? `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`
      : `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return {
      path: pathD,
      color: COLORS[index % COLORS.length],
      label: item.x,
      value: item.y,
      percentage: (percentage * 100).toFixed(1),
    };
  });

  return (
    <div className="flex items-center gap-4" style={{ height }}>
      <svg viewBox="0 0 100 100" className="w-1/2 h-full">
        {slices.map((slice, i) => (
          <path key={i} d={slice.path} fill={slice.color} />
        ))}
        <circle cx="50" cy="50" r="20" fill="white" />
      </svg>
      <div className="flex flex-col gap-2">
        {slices.map((slice, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: slice.color }} />
            <span className="text-gray-600">{slice.label}:</span>
            <span className="font-medium">{slice.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;