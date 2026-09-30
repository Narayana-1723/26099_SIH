import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading platform data...',
  subMessage = 'Connecting to CPSE Standardization Engine',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg border border-slate-200 shadow-sm my-4">
      <Loader2 className="w-8 h-8 text-gov-navy animate-spin mb-3" />
      <h3 className="text-base font-semibold text-slate-800">{message}</h3>
      {subMessage && <p className="text-xs text-slate-500 mt-1 max-w-sm">{subMessage}</p>}
    </div>
  );
};
