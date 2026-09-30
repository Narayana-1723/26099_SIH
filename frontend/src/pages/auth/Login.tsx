import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Building2, Lock, User, AlertCircle, ArrowRight, ShieldCheck, Check, UserPlus } from 'lucide-react';

const SEEDED_ACCOUNTS = [
  { label: 'Admin', empId: 'ADM001', role: 'ADMIN', cpse: 'ONGC', pass: 'password' },
  { label: 'Reviewer', empId: 'REV001', role: 'REVIEWER', cpse: 'BHEL', pass: 'password' },
  { label: 'Officer', empId: 'USR001', role: 'USER', cpse: 'ONGC', pass: 'password' },
];

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('USR001');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/user/dashboard';

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setErrorMsg('Your session has expired. Please sign in again.');
    }
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both Employee ID / Email and Password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const user = await login({ username: username.trim(), password });
      showToast('success', 'Authentication Successful', `Welcome, ${user.name} (${user.cpse || user.role})`);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from === '/login' ? '/user/dashboard' : from, { replace: true });
      }
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || (
        status === 404
          ? 'The backend returned 404 for /api/auth/login. Check that the Spring Boot backend is running and exposes this route.'
          : !err.response
            ? 'Cannot reach the backend. Start the Spring Boot service on port 8080 and try again.'
            : status === 401
              ? 'Invalid Employee ID or password. Please check your credentials.'
              : err.message || 'Authentication failed. Please try again.'
      );
      setErrorMsg(msg);
      showToast('error', 'Login Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = (acc: typeof SEEDED_ACCOUNTS[0]) => {
    setUsername(acc.empId);
    setPassword(acc.pass);
    setErrorMsg(null);
  };

  return (
    <div className="w-full max-w-md">
      {/* Login Card */}
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
        {/* Card Header */}
        <div className="bg-gov-navy px-8 py-6 text-center border-b-4 border-amber-500 text-white">
          <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 mx-auto flex items-center justify-center text-amber-400 mb-3 shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="text-[11px] uppercase tracking-widest text-amber-400 font-bold">
            Government of India &bull; CPSE Consortium
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Material Harmonization Portal
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Single Sign-On Authentication Gateway
          </p>
        </div>

        {/* Card Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Employee ID or Official Email <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. USR001 or ADM001"
                required
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gov-navy focus:border-transparent font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Secure Password <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter authorized password"
                required
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gov-navy focus:border-transparent"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Test Accounts Switcher */}
          <div className="pt-3 border-t border-slate-200 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Quick Test Credentials (Pre-seeded in DB)
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {SEEDED_ACCOUNTS.map((acc) => (
                <button
                  key={acc.empId}
                  type="button"
                  onClick={() => handleQuickSelect(acc)}
                  className={`p-2 text-left rounded border text-[11px] transition-colors ${
                    username === acc.empId
                      ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold ring-1 ring-blue-400'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{acc.label}</span>
                    {username === acc.empId && <Check className="w-3 h-3 text-blue-700" />}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{acc.empId}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Register New Account Link */}
          <div className="pt-3 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-600">
              New CPSE Personnel?{' '}
              <Link
                to="/register"
                className="font-bold text-gov-navy hover:text-amber-600 hover:underline inline-flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Register New Account
              </Link>
            </p>
          </div>
        </form>

        {/* Card Footer */}
        <div className="px-4 sm:px-8 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            256-bit TLS Encrypted
          </span>
          <span>Spring Boot RBAC Protected</span>
        </div>
      </div>
    </div>
  );
};
