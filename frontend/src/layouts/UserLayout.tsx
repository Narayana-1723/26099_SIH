import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';

export const UserLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      <Header portalRole="USER" />
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <Sidebar portalRole="USER" />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
