/**
 * 饼图组件
 */
import React from 'react';
import { PieChart as TPieChart } from 'tdesign-react';

interface DataPoint {
  x: string | number;
  y: number;
}

interface PieChartProps {
  data: DataPoint[];
  height?: number;
  loading?: boolean;
  angleField?: string;
  colorField?: string;
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  height = 300,
  loading = false,
  angleField = 'y',
  colorField = 'x',
}) => {
  const option = {
    data,
    angleField,
    colorField,
    radius: 0.8,
    label: {
      type: 'inner',
      offset: -50,
      style: {
        textAlign: 'center',
        fontSize: 12,
      },
      formatter: (datum: any) => `${datum[colorField]}: ${datum[angleField]}`,
    },
    legend: {
      position: 'right',
    },
  };

  if (loading) {
    return (
      <div className="chart-loading" style={{ height }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return <TPieChart {...option} style={{ height }} />;
};

export default PieChart;