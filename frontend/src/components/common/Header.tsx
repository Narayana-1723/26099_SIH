import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Bell,
  LogOut,
  User,
  Shield,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { IS_DEMO_MODE } from '../../utils/constants';

interface HeaderProps {
  portalRole: 'USER' | 'ADMIN';
}

export const Header: React.FC<HeaderProps> = ({ portalRole }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-gov-navy text-white shadow-md border-b-2 border-amber-500 sticky top-0 z-40">
      {/* Top micro-bar for Government / Department indication */}
      <div className="bg-gov-navy-950 px-3 sm:px-8 py-1 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] text-slate-300 border-b border-slate-700/50">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400"></span>
          <span className="truncate">Government of India &bull; Ministry of Heavy Industries &bull; Department of Public Enterprises</span>
        </div>
        <div className="flex flex-shrink-0 items-center gap-3">
          {IS_DEMO_MODE && (
            <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded text-[10px] font-medium tracking-wide">
              DEMO EVALUATION MODE
            </span>
          )}
          <span className="hidden sm:inline">SIH26099 Enterprise Portal</span>
        </div>
      </div>

      {/* Main Header Content */}
      <div className="px-3 sm:px-8 py-3 flex items-center justify-between gap-2">
        {/* Left: Emblem and Platform Branding */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 rounded bg-white/10 border border-white/20 flex items-center justify-center text-amber-400 shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="hidden sm:flex text-xs uppercase tracking-wider text-amber-400 font-semibold items-center gap-1.5">
              <span>National CPSE Consortium</span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-slate-300">{portalRole === 'ADMIN' ? 'Administration Console' : 'Procurement Portal'}</span>
            </div>
            <h1 className="text-sm sm:text-lg font-bold tracking-tight text-white leading-tight">
              Material Harmonization &amp; Standardization Platform
            </h1>
          </div>
        </div>

        {/* Right: Notifications, Role indicator & Profile dropdown */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notifications button */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded hover:bg-white/10 text-slate-200 hover:text-white transition-colors relative"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full"></span>
            </button>

            {/* Notification drop */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded shadow-xl border border-slate-200 z-50 py-2 text-xs">
                <div className="px-4 py-2 border-b border-slate-100 font-bold text-gov-navy flex items-center justify-between">
                  <span>System Alerts &amp; Jobs</span>
                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">3 New</span>
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="px-4 py-2.5 hover:bg-slate-50">
                    <div className="font-semibold text-slate-900">Job #JOB-8842 Completed</div>
                    <div className="text-slate-500 text-[11px]">Ingested 4,850 materials for ONGC Mehsana Asset.</div>
                    <div className="text-[10px] text-slate-400 mt-1">10 mins ago</div>
                  </div>
                  <div className="px-4 py-2.5 hover:bg-slate-50">
                    <div className="font-semibold text-slate-900">Review Required</div>
                    <div className="text-slate-500 text-[11px]">3 high-priority matches require technical audit.</div>
                    <div className="text-[10px] text-slate-400 mt-1">1 hour ago</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Card & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded hover:bg-white/10 border border-transparent hover:border-white/20 transition-all text-left"
              aria-expanded={dropdownOpen}
            >
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold text-xs">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold text-white leading-snug">{user?.name || 'Authorized Officer'}</div>
                <div className="text-[10px] text-amber-300 font-medium">
                  {user?.cpse} &bull; {user?.role}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-300" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded shadow-xl border border-slate-200 z-50 py-2">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="text-xs font-bold text-gov-navy">{user?.name}</div>
                  <div className="text-[11px] text-slate-500">{user?.email}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-gov-navy border border-slate-300">
                      {user?.employeeId}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      {user?.role}
                    </span>
                  </div>
                </div>

                <div className="py-1 text-xs">
                  {user?.role === 'ADMIN' ? (
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/user/dashboard');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Layers className="w-4 h-4 text-gov-navy" />
                      <span>Switch to User View</span>
                    </button>
                  ) : null}

                  {user?.role === 'ADMIN' ? (
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/admin/dashboard');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Shield className="w-4 h-4 text-gov-navy" />
                      <span>Admin Console</span>
                    </button>
                  ) : null}

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/user/materials');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span>My CPSE Records</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-700 flex items-center gap-2 text-xs font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
