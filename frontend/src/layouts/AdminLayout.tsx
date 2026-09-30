import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';
import { ShieldAlert } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      <Header portalRole="ADMIN" />
      
      {/* High-privilege administrative indicator stripe */}
      <div className="bg-slate-800 text-amber-300 px-6 py-1 text-[11px] font-semibold flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Privileged System Mode: Cross-CPSE Master Configuration &amp; Governance</span>
        </div>
        <div className="text-slate-400 font-mono text-[10px]">
          SESSION AUDITED &bull; SPRING BOOT RBAC ACTIVE
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <Sidebar portalRole="ADMIN" />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
