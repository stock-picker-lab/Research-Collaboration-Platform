/**
 * 柱状图组件
 */
import React from 'react';
import { BarChart as TBarChart } from 'tdesign-react';

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
  data,
  height = 300,
  loading = false,
  xAxisLabel,
  yAxisLabel,
  horizontal = false,
}) => {
  const option = {
    data,
    xField: horizontal ? 'y' : 'x',
    yField: horizontal ? 'x' : 'y',
    seriesField: 'x',
    label: false,
    color: '#005acl',
    xAxis: {
      label: xAxisLabel ? { formatter: (v: string) => v } : undefined,
      title: xAxisLabel ? { text: xAxisLabel } : undefined,
    },
    yAxis: {
      label: yAxisLabel ? { formatter: (v: string) => v } : undefined,
      title: yAxisLabel ? { text: yAxisLabel } : undefined,
    },
  };

  if (loading) {
    return (
      <div className="chart-loading" style={{ height }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return <TBarChart {...option} style={{ height }} />;
};

export default BarChart;