import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  UploadCloud,
  Sparkles,
  CopyCheck,
  CheckSquare,
  FolderTree,
  FileCheck2,
  BarChart3,
  FileSpreadsheet,
  Users,
  Database,
  Sliders,
  Cpu,
  ShieldCheck,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  portalRole: 'USER' | 'ADMIN';
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export const Sidebar: React.FC<SidebarProps> = ({ portalRole }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const userNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/user/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Materials Catalog', href: '/user/materials', icon: <Boxes className="w-4 h-4" /> },
    { label: 'Upload Materials', href: '/user/upload', icon: <UploadCloud className="w-4 h-4" /> },
    { label: 'AI Harmonization', href: '/user/harmonization', icon: <Sparkles className="w-4 h-4" /> },
    { label: 'Potential Duplicates', href: '/user/duplicates', icon: <CopyCheck className="w-4 h-4" /> },
    { label: 'Taxonomy Browser', href: '/user/taxonomy', icon: <FolderTree className="w-4 h-4" /> },
    { label: 'My Profile', href: '/profile', icon: <Users className="w-4 h-4" /> },
  ];

  const reviewerNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/user/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Materials Catalog', href: '/user/materials', icon: <Boxes className="w-4 h-4" /> },
    { label: 'AI Harmonization', href: '/user/harmonization', icon: <Sparkles className="w-4 h-4" /> },
    { label: 'Review Queue', href: '/user/review-queue', icon: <CheckSquare className="w-4 h-4" /> },
    { label: 'Canonical Materials', href: '/user/canonical-materials', icon: <FileCheck2 className="w-4 h-4" /> },
    { label: 'Analytics', href: '/user/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Reports', href: '/user/reports', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { label: 'My Profile', href: '/profile', icon: <Users className="w-4 h-4" /> },
  ];

  const adminNavItems: NavItem[] = [
    { label: 'Admin Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'User Management', href: '/admin/users', icon: <Users className="w-4 h-4" /> },
    { label: 'Material Management', href: '/admin/materials', icon: <Boxes className="w-4 h-4" /> },
    { label: 'Upload Ingestion', href: '/user/upload', icon: <UploadCloud className="w-4 h-4" /> },
    { label: 'AI Harmonization', href: '/user/harmonization', icon: <Sparkles className="w-4 h-4" /> },
    { label: 'Review Management', href: '/admin/reviews', icon: <Sliders className="w-4 h-4" /> },
    { label: 'Taxonomy Management', href: '/admin/taxonomy', icon: <FolderTree className="w-4 h-4" /> },
    { label: 'Canonical Materials', href: '/admin/canonical-materials', icon: <FileCheck2 className="w-4 h-4" /> },
    { label: 'AI / ML Status', href: '/admin/model-status', icon: <Cpu className="w-4 h-4" />, badge: 'Healthy' },
    { label: 'System Analytics', href: '/admin/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: <ShieldCheck className="w-4 h-4" /> },
    { label: 'My Profile', href: '/profile', icon: <Users className="w-4 h-4" /> },
  ];

  const items = user?.role === 'ADMIN' ? adminNavItems : user?.role === 'REVIEWER' ? reviewerNavItems : userNavItems;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-full lg:w-64 bg-slate-900 text-slate-200 flex lg:flex-col flex-shrink-0 lg:min-h-[calc(100vh-69px)] border-b lg:border-b-0 lg:border-r border-slate-800 select-none">
      {/* Sidebar Section Title */}
      <div className="hidden lg:flex px-4 py-3 border-b border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-400 items-center justify-between">
        <span>{portalRole === 'ADMIN' ? 'Administration Services' : 'Procurement Navigation'}</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
      </div>

      {/* Nav Link List */}
      <nav className="flex lg:flex-1 lg:flex-col min-w-0 px-2 lg:px-3 py-2 lg:py-4 gap-1 lg:gap-0 lg:space-y-1 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `flex flex-shrink-0 lg:w-full items-center justify-between whitespace-nowrap px-3 py-2.5 rounded text-xs font-medium transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-slate-950' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      isActive
                        ? 'bg-slate-950 text-amber-300'
                        : item.badge === 'Healthy'
                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                        : 'bg-slate-800 text-amber-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="hidden lg:block p-3 border-t border-slate-800 bg-slate-950/60">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Session</span>
        </button>
      </div>
    </aside>
  );
};
