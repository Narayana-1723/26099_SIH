import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/user';
import { ShieldX } from 'lucide-react';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
  const { user, hasRole, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole(allowedRoles)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="bg-white border border-red-200 rounded-lg p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 mb-4">
            <ShieldX className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-red-950">403 — Access Denied</h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Your authorized identity ({user.employeeId} &bull; {user.role}) is not provisioned for the requested Administrative Console area.
          </p>
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-500 text-left">
            Role enforcement is validated both at client navigation and Spring Boot REST API layer.
          </div>
          <a
            href="/user/dashboard"
            className="mt-6 inline-block btn-primary text-xs w-full py-2.5"
          >
            Return to User Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
