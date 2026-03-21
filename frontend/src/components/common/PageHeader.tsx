/**
 * 页面标题组件
 */
import React from 'react';
import { Breadcrumb, BreadcrumbItem, Button } from 'tdesign-react';
import { AddIcon } from 'tdesign-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; path?: string }[];
  actions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions = [],
}) => {
  return (
    <div className="page-header">
      {breadcrumbs.length > 0 && (
        <Breadcrumb className="page-header-breadcrumb">
          {breadcrumbs.map((item, index) => (
            <BreadcrumbItem key={index} to={item.path}>
              {item.label}
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
      )}
      <div className="page-header-content">
        <div className="page-header-info">
          <h1 className="page-header-title">{title}</h1>
          {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>
        {actions.length > 0 && (
          <div className="page-header-actions">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant === 'danger' ? 'danger' : action.variant === 'secondary' ? 'secondary' : 'primary'}
                icon={action.icon}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;