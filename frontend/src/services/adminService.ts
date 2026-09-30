import { apiClient, IS_DEMO_MODE, simulateLatency } from './api';
import { User, UserRole } from '../types/user';
import { MLModelStatus, AuditLogItem } from '../types/analytics';
import { DEMO_USERS, DEMO_ML_STATUS, DEMO_AUDIT_LOGS } from '../data/demoData';

let localUsers: User[] = [...DEMO_USERS];

export const adminService = {
  getUsers: async (): Promise<User[]> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(200);
      return localUsers;
    }

    // Spring Boot REST endpoint: GET /api/admin/users
    const response = await apiClient.get<User[]>('/admin/users');
    return response.data;
  },

  createUser: async (user: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(300);
      const newUser: User = {
        ...user,
        id: `usr-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString(),
      };
      localUsers.unshift(newUser);
      return newUser;
    }

    // Spring Boot REST endpoint: POST /api/admin/users
    const response = await apiClient.post<User>('/admin/users', user);
    return response.data;
  },

  toggleUserStatus: async (userId: string): Promise<User> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(200);
      const user = localUsers.find((u) => u.id === userId);
      if (!user) throw new Error('User not found');
      user.status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      return user;
    }

    // Spring Boot REST endpoint: PUT /api/admin/users/{id}/status
    const response = await apiClient.put<User>(`/admin/users/${userId}/status`);
    return response.data;
  },

  updateUserRole: async (userId: string, role: UserRole): Promise<User> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(200);
      const user = localUsers.find((u) => u.id === userId);
      if (!user) throw new Error('User not found');
      user.role = role;
      return user;
    }

    // Spring Boot REST endpoint: PUT /api/admin/users/{id}/role
    const response = await apiClient.put<User>(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  getModelStatus: async (): Promise<MLModelStatus> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(250);
      return DEMO_ML_STATUS;
    }

    // Spring Boot REST endpoint: GET /api/admin/model-status
    const response = await apiClient.get<MLModelStatus>('/admin/model-status');
    return response.data;
  },

  getAuditLogs: async (params?: { user?: string; action?: string }): Promise<AuditLogItem[]> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(200);
      let logs = [...DEMO_AUDIT_LOGS];
      if (params?.user) {
        logs = logs.filter((l) => l.user.toLowerCase().includes(params.user!.toLowerCase()));
      }
      if (params?.action) {
        logs = logs.filter((l) => l.action.includes(params.action!));
      }
      return logs;
    }

    // Spring Boot REST endpoint: GET /api/admin/audit-logs
    const response = await apiClient.get<AuditLogItem[]>('/admin/audit-logs', { params });
    return response.data;
  },
};
