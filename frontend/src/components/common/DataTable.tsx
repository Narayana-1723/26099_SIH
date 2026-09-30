import React, { ReactNode } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (item: T, index: number) => ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T | ((item: T) => string);
  isLoading?: boolean;
  emptyMessage?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;
  onRowClick?: (item: T) => void;
  actionsHeader?: string;
  renderActions?: (item: T) => ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  keyField,
  isLoading = false,
  emptyMessage = 'No data available',
  sortBy,
  sortOrder,
  onSort,
  onRowClick,
  actionsHeader = 'Actions',
  renderActions,
}: DataTableProps<T>) {
  if (isLoading) {
    return <LoadingState message="Fetching table records..." />;
  }

  if (!data || data.length === 0) {
    return <EmptyState description={emptyMessage} />;
  }

  const getKey = (item: T, idx: number): string => {
    if (typeof keyField === 'function') return keyField(item);
    return String(item[keyField] ?? idx);
  };

  return (
    <div className="w-full overflow-x-auto border border-slate-200 rounded-md bg-white shadow-sm">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-200">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={`px-4 py-3 font-semibold text-slate-700 uppercase tracking-wider ${
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'right'
                    ? 'text-right'
                    : 'text-left'
                } ${col.sortable ? 'cursor-pointer select-none hover:bg-slate-200/70' : ''}`}
                onClick={() => col.sortable && onSort && onSort(col.key)}
              >
                <div
                  className={`inline-flex items-center gap-1.5 ${
                    col.align === 'center'
                      ? 'justify-center'
                      : col.align === 'right'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <span>{col.header}</span>
                  {col.sortable && (
                    <span className="text-slate-400">
                      {sortBy === col.key ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-gov-navy" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-gov-navy" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
            {renderActions && (
              <th className="px-4 py-3 font-semibold text-slate-700 uppercase tracking-wider text-right">
                {actionsHeader}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {data.map((item, idx) => {
            const key = getKey(item, idx);
            return (
              <tr
                key={key}
                onClick={() => onRowClick && onRowClick(item)}
                className={`transition-colors hover:bg-slate-50/90 ${
                  onRowClick ? 'cursor-pointer' : ''
                } ${idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-slate-800 ${
                      col.align === 'center'
                        ? 'text-center'
                        : col.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                    }`}
                  >
                    {col.render ? col.render(item, idx) : String((item as any)[col.key] ?? '—')}
                  </td>
                ))}
                {renderActions && (
                  <td
                    className="px-4 py-3 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {renderActions(item)}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
