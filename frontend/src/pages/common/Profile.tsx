import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Shield, Building, Mail, Hash, Calendar, CheckCircle2, Key } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 font-bold text-2xl">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{user?.name || 'Enterprise User'}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Active Session
              </span>
              <span>•</span>
              <span>Enterprise ID: {user?.employeeId}</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-slate-900 text-amber-400 border border-slate-800">
            <Shield className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            {user?.role} ACCESS
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identity & Account Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <User className="w-4 h-4 text-amber-600" />
            Identity & Authorization
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" /> Employee ID
              </span>
              <span className="font-semibold text-slate-800">{user?.employeeId}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
              </span>
              <span className="font-semibold text-slate-800">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-400" /> System Role
              </span>
              <span className="font-bold text-indigo-600">{user?.role}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" /> Assigned CPSE
              </span>
              <span className="font-semibold text-slate-800">{user?.cpse || 'Government Organization'}</span>
            </div>
          </div>
        </div>

        {/* Security & Access Info Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <Key className="w-4 h-4 text-amber-600" />
            Security & Authentication
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Authentication Protocol</span>
              <span className="font-semibold text-slate-800">JWT (HMAC-SHA512)</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-slate-500">API Gateway</span>
              <span className="font-semibold text-slate-800">Spring Boot 3.3.4 (Port 8080)</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Session Status</span>
              <span className="font-semibold text-emerald-600">Authenticated & Active</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Compliance Check
              </span>
              <span className="font-semibold text-slate-800">SIH-2024 Harmonization Standard</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
