import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const NotFound: React.FC = () => {
  const { user } = useAuth();
  const homePath = user?.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-8 text-center shadow-lg space-y-5">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">404 — Page Not Found</h1>
          <p className="text-xs text-slate-500 mt-2">
            The requested CPSE harmonization resource or endpoint does not exist or has been relocated.
          </p>
        </div>
        <div className="pt-2 flex justify-center">
          <Link
            to={homePath}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors shadow-xs"
          >
            <Home className="w-4 h-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
