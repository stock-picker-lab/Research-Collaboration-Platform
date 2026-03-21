/**
 * 页面标题组件
 */
import React from 'react';
import { Button } from 'tdesign-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
}) => {
  return (
    <div className="page-header mb-6">
      <div className="page-header-content">
        <div className="page-header-info">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;