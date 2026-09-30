import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'System Error Encountered',
  message = 'Unable to retrieve material data from backend service. Please verify connectivity or retry.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50/60 rounded-lg border border-red-200 my-4">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-red-900">{title}</h3>
      <p className="text-sm text-red-700 mt-1 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded shadow-sm transition-colors focus:ring-2 focus:ring-red-500"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
};
