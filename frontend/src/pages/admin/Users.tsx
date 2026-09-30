import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { User, UserRole } from '../../types/user';
import { CPSE_LIST } from '../../utils/constants';
import { formatDateOnly } from '../../utils/formatters';
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  Shield,
  Filter,
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');

  // Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({
    employeeId: '',
    name: '',
    email: '',
    cpse: 'ONGC',
    role: 'USER' as UserRole,
    designation: 'Materials Specialist',
    status: 'ACTIVE' as const,
  });

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve registered users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (user: User) => {
    try {
      const updated = await adminService.toggleUserStatus(user.id);
      showToast(
        'info',
        'User Status Updated',
        `${updated.name} is now ${updated.status}.`
      );
      loadUsers();
    } catch (err: any) {
      showToast('error', 'Status Change Failed', err.message);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      showToast('success', 'Role Updated', `Authorized role set to ${newRole}.`);
      loadUsers();
    } catch (err: any) {
      showToast('error', 'Role Update Failed', err.message);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.employeeId || !newUser.name || !newUser.email) {
      showToast('error', 'Validation Error', 'Please complete all required fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminService.createUser(newUser);
      showToast('success', 'User Created', `Provisioned identity for ${newUser.name}.`);
      setCreateModalOpen(false);
      setNewUser({
        employeeId: '',
        name: '',
        email: '',
        cpse: 'ONGC',
        role: 'USER',
        designation: 'Materials Specialist',
        status: 'ACTIVE',
      });
      loadUsers();
    } catch (err: any) {
      showToast('error', 'Creation Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.cpse.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const columns: Column<User>[] = [
    {
      key: 'employeeId',
      header: 'Employee ID',
      sortable: true,
      render: (u) => <span className="font-mono font-bold text-gov-navy text-xs">{u.employeeId}</span>,
    },
    {
      key: 'name',
      header: 'Full Name & Designation',
      sortable: true,
      render: (u) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{u.name}</div>
          <div className="text-[11px] text-slate-500">{u.designation}</div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Official Email',
      render: (u) => <span className="text-slate-700 text-xs font-mono">{u.email}</span>,
    },
    {
      key: 'cpse',
      header: 'Assigned CPSE',
      render: (u) => (
        <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-slate-100 text-slate-800 border border-slate-300">
          {u.cpse}
        </span>
      ),
    },
    {
      key: 'role',
      header: 'System Role',
      render: (u) => (
        <select
          value={u.role}
          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
          className="text-xs font-bold border border-slate-300 rounded px-2 py-1 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-gov-navy"
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
          <option value="REVIEWER">REVIEWER</option>
        </select>
      ),
    },
    {
      key: 'status',
      header: 'Account Status',
      render: (u) => (
        <button
          onClick={() => handleToggleStatus(u)}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border transition-colors ${
            u.status === 'ACTIVE'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
              : 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200'
          }`}
          title="Click to toggle status"
        >
          {u.status === 'ACTIVE' ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          ) : (
            <XCircle className="w-3 h-3 text-red-600" />
          )}
          <span>{u.status}</span>
        </button>
      ),
    },
    {
      key: 'createdAt',
      header: 'Provisioned Date',
      render: (u) => <span className="text-xs text-slate-500">{formatDateOnly(u.createdAt)}</span>,
    },
  ];

  if (isLoading && users.length === 0) {
    return <LoadingState message="Loading Registered CPSE Personnel..." />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Consortium Identity &amp; Access Management"
        description="Provision, role-assign, and audit authorized officers across CPSE procurement directorates"
        breadcrumbs={[{ label: 'Admin Console', href: '/admin/dashboard' }, { label: 'User Management' }]}
        actions={
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Provision New Officer</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by officer name, employee ID, or enterprise..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-gov-navy"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
          >
            <option value="ALL">All Authorized Roles</option>
            <option value="USER">USER (Procurement Officer)</option>
            <option value="ADMIN">ADMIN (System Administrator)</option>
            <option value="REVIEWER">REVIEWER (Technical Auditor)</option>
          </select>
        </div>
      </div>

      {error && <ErrorState message={error} />}

      <DataTable
        columns={columns}
        data={filteredUsers}
        keyField="id"
        emptyMessage="No officers matched query."
      />

      {/* Modal: Create User */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Provision Authorized Officer Identity"
        subtitle="Registers officer for Single Sign-On and Role-Based Authorization"
        maxWidth="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Employee ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newUser.employeeId}
              onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
              placeholder="e.g. EMP-99812"
              required
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-gov-navy font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Officer Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="e.g. Meera Nambiar"
              required
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-gov-navy"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Official Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="e.g. meera.n@bhel.in"
              required
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-gov-navy font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Designated CPSE
              </label>
              <select
                value={newUser.cpse}
                onChange={(e) => setNewUser({ ...newUser, cpse: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
              >
                {CPSE_LIST.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Authorized Role
              </label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy font-semibold"
              >
                <option value="USER">USER</option>
                <option value="REVIEWER">REVIEWER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-xs"
            >
              {isSubmitting ? 'Provisioning...' : 'Provision Officer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
