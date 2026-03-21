/**
 * 柱状图组件
 * 使用纯 CSS/SVG 实现简单柱状图
 */
import React from 'react';

interface DataPoint {
  x: string | number;
  y: number;
}

interface BarChartProps {
  data: DataPoint[];
  height?: number;
  loading?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  horizontal?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({
  data = [],
  height = 300,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="chart-loading flex items-center justify-center" style={{ height }}>
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
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

  return (
    <div className="relative" style={{ height }}>
      <div className="flex items-end justify-around h-full gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
              style={{
                height: `${(item.y / maxY) * 100}%`,
                minHeight: item.y > 0 ? '4px' : '0',
              }}
            />
            <div className="text-xs text-gray-500 mt-2 truncate w-full text-center">
              {item.x}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;