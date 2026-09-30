import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Building2, Lock, User as UserIcon, Mail, Hash, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

const CPSE_OPTIONS = [
  { id: 1, code: 'ONGC', name: 'Oil and Natural Gas Corporation' },
  { id: 2, code: 'BHEL', name: 'Bharat Heavy Electricals Limited' },
  { id: 3, code: 'IOCL', name: 'Indian Oil Corporation Limited' },
  { id: 4, code: 'NTPC', name: 'NTPC Limited' },
  { id: 5, code: 'SAIL', name: 'Steel Authority of India Limited' },
];

export const Register: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [cpse, setCpse] = useState('ONGC');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim() || !employeeId.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('All marked fields are required.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: name.trim(),
        employeeId: employeeId.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        cpse: cpse,
        password: password,
      });

      setSuccessMsg('Account created successfully! Please sign in.');
      showToast('success', 'Registration Successful', 'Account created successfully. Please sign in.');

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please check details.';
      setErrorMsg(msg);
      showToast('error', 'Registration Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg my-8">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gov-navy px-8 py-6 text-center border-b-4 border-amber-500 text-white">
          <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 mx-auto flex items-center justify-center text-amber-400 mb-3 shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="text-[11px] uppercase tracking-widest text-amber-400 font-bold">
            Government of India &bull; CPSE Consortium
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Create Personnel Account
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Enterprise Material Harmonization Platform Registration
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <p className="font-bold">{successMsg}</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">Redirecting to login portal...</p>
              </div>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Official Name <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                required
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gov-navy focus:border-transparent"
              />
            </div>
          </div>

          {/* Employee ID & CPSE Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Employee ID <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. ONGC-7821"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded bg-white text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-gov-navy focus:border-transparent font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Designated CPSE <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <select
                  value={cpse}
                  onChange={(e) => setCpse(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gov-navy focus:border-transparent"
                >
                  {CPSE_OPTIONS.map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Official Email Address <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. ramesh.k@ongc.in"
                required
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gov-navy focus:border-transparent"
              />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 chars"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gov-navy focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Confirm Password <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gov-navy focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Information badge */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-800">Security Notice:</span> Public registrations are provisioned with standardized <span className="font-bold text-indigo-700">USER</span> credentials. Reviewer and Administrative access rights are granted exclusively via executive governance authorization.
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Return to Sign In */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-600">
              Already have an enterprise account?{' '}
              <Link to="/login" className="font-bold text-amber-600 hover:text-amber-700 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified Government Gateway
          </span>
          <span>SIH-2024 &bull; Standard RBAC</span>
        </div>
      </div>
    </div>
  );
};
