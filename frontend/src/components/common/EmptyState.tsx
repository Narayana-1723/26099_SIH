import React, { ReactNode } from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Records Found',
  description = 'No materials match the selected filters or search criteria.',
  icon,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg border border-slate-200 shadow-sm my-4">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        {icon || <PackageOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
