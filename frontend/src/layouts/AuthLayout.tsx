import React from 'react';
import { Outlet } from 'react-router-dom';
import { Building2, ShieldCheck, Lock } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between text-slate-200">
      {/* Top Banner */}
      <div className="bg-gov-navy border-b-2 border-amber-500 py-3 px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-3 shadow-md">
        <div className="flex min-w-0 items-center gap-3">
          <div className="w-9 h-9 rounded bg-white/10 border border-white/20 flex items-center justify-center text-amber-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[9px] sm:text-[11px] uppercase tracking-wider text-amber-400 font-bold leading-snug">
              Government of India &bull; Department of Public Enterprises
            </div>
            <div className="text-xs sm:text-sm font-bold text-white tracking-tight leading-snug">
              CPSE Material Code Standardization &amp; Harmonization System
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>NIC Certified Secure Gateway</span>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 flex items-start sm:items-center justify-center p-3 sm:p-8">
        <Outlet />
      </main>

      {/* Bottom Footer */}
      <footer className="bg-slate-950 py-4 px-6 text-center text-xs text-slate-400 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            Official Government Use Only &bull; Unauthorized Access Prohibited
          </span>
          <span>&bull;</span>
          <span>SIH26099 &bull; AI-Driven CPSE Inter-Operability</span>
          <span>&bull;</span>
          <span>Strict REST Gateway Integration</span>
        </div>
      </footer>
    </div>
  );
};
