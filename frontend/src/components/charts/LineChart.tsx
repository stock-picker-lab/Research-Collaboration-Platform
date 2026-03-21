/**
 * 折线图组件 - 基于 TDesign Charts
 */
import React from 'react';
import { LineChart as TLineChart } from 'tdesign-react';

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
  data,
  height = 300,
  loading = false,
  xAxisLabel,
  yAxisLabel,
}) => {
  const option = {
    data,
    xField: 'x',
    yField: 'y',
    smooth: true,
    label: false,
    point: {
      size: 3,
      shape: 'circle',
      style: {
        fill: 'white',
        stroke: '#005acl',
        lineWidth: 2,
      },
    },
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

  return <TLineChart {...option} style={{ height }} />;
};

export default LineChart;