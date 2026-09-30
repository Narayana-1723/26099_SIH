import React, { ReactNode } from 'react';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  breadcrumbs,
  actions,
}) => {
  return (
    <div className="mb-6">
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gov-navy tracking-tight">{title}</h1>
            {badge}
          </div>
          {description && <p className="text-xs sm:text-sm text-slate-500 mt-1">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
};
