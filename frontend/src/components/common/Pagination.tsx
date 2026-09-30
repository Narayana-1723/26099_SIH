import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PAGINATION_DEFAULTS } from '../../utils/constants';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const startRecord = Math.min((currentPage - 1) * pageSize + 1, totalRecords);
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-200">
      <div className="text-xs text-slate-600">
        Showing <span className="font-semibold text-slate-900">{totalRecords > 0 ? startRecord : 0}</span> to{' '}
        <span className="font-semibold text-slate-900">{endRecord}</span> of{' '}
        <span className="font-semibold text-slate-900">{totalRecords}</span> entries
      </div>

      <div className="flex items-center gap-4">
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="text-xs border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
            >
              {PAGINATION_DEFAULTS.PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="inline-flex items-center gap-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            aria-label="First page"
            className="p-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className="p-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded">
            Page {currentPage} of {Math.max(totalPages, 1)}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            className="p-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            aria-label="Last page"
            className="p-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
