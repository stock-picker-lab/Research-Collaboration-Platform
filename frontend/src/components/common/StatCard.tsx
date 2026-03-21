/**
 * 统计卡片组件
 */
import React from 'react';
import { Card } from 'tdesign-react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isUp: boolean;
  };
  icon?: React.ReactNode;
  color?: 'primary' | 'warning' | 'danger' | 'success';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  icon,
  color = 'primary',
}) => {
  const colorMap = {
    primary: 'var(--td-brand-color)',
    warning: 'var(--td-warning-color)',
    danger: 'var(--td-error-color)',
    success: 'var(--td-success-color)',
  };

  return (
    <Card className="stat-card">
      <div className="stat-card-content">
        <div className="stat-card-info">
          <div className="stat-card-title">{title}</div>
          <div className="stat-card-value">{value}</div>
          {trend && (
            <div className={`stat-card-trend ${trend.isUp ? 'up' : 'down'}`}>
              <span>{trend.isUp ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className="stat-card-icon"
            style={{ backgroundColor: `${colorMap[color]}15`, color: colorMap[color] }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;