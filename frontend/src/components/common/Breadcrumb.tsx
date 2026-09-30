import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 py-2">
      <ol className="inline-flex items-center space-x-1 sm:space-x-2">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center text-slate-600 hover:text-gov-navy font-medium"
          >
            <Home className="w-3.5 h-3.5 mr-1" />
            <span>Portal</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="inline-flex items-center">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 mx-1" />
              {isLast || !item.href ? (
                <span className="font-semibold text-slate-800" aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link to={item.href} className="text-slate-600 hover:text-gov-navy font-medium">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
