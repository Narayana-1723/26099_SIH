import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Unauthorized: React.FC = () => {
  const { user } = useAuth();

  const homePath = user?.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl border border-red-200 p-8 text-center shadow-lg space-y-5">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">403 — Access Restricted</h1>
          <p className="text-xs text-slate-500 mt-2">
            You do not have the required security credentials ({user?.role || 'Guest'}) to view this administrative resource.
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to={homePath}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        </div>
      </div>
    </div>
  );
};
