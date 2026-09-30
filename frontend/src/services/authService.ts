import { apiClient, IS_DEMO_MODE, simulateLatency } from './api';
import { LoginCredentials, AuthResponse, RegisterPayload } from '../types/auth';
import { User } from '../types/user';
import { DEMO_USERS } from '../data/demoData';

const CPSE_ID_MAP: Record<number, string> = {
  1: 'ONGC',
  2: 'BHEL',
  3: 'IOCL',
  4: 'NTPC',
  5: 'SAIL',
  6: 'GAIL',
  7: 'CIL',
  8: 'BPCL',
};

const normalizeUser = (u: any): User => {
  if (!u) return u;
  const role = (u.role || 'USER') as any;
  return {
    id: String(u.id || ''),
    employeeId: u.employeeId || '',
    name: u.name || u.employeeId || 'CPSE Officer',
    email: u.email || '',
    cpseId: u.cpseId,
    cpse: u.cpse || (u.cpseId ? CPSE_ID_MAP[u.cpseId] || 'ONGC' : 'ONGC'),
    role: role,
    designation: u.designation || (role === 'ADMIN' ? 'System Administrator' : role === 'REVIEWER' ? 'Senior Technical Reviewer' : 'Procurement Officer'),
    status: u.status || (u.active === false ? 'INACTIVE' : 'ACTIVE'),
    active: u.active ?? true,
    lastLogin: u.lastLogin || new Date().toISOString(),
    createdAt: u.createdAt || new Date().toISOString(),
  };
};

export const authService = {
  register: async (payload: RegisterPayload): Promise<User> => {
    // Production Spring Boot REST call: POST /api/auth/register
    const response = await apiClient.post<User>('/auth/register', payload);
    return normalizeUser(response.data);
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    if (IS_DEMO_MODE) {
      await simulateLatency(400);
      // Check demo credentials or fallback to matched role
      const isEmail = credentials.username.includes('@');
      let matched = DEMO_USERS.find(
        (u) =>
          (isEmail && u.email.toLowerCase() === credentials.username.toLowerCase()) ||
          (!isEmail && u.employeeId.toLowerCase() === credentials.username.toLowerCase())
      );

      // If no exact match, assign User or Admin based on username keyword
      if (!matched) {
        if (credentials.username.toLowerCase().includes('admin')) {
          matched = DEMO_USERS[1]; // Admin
        } else {
          matched = DEMO_USERS[0]; // Regular CPSE User
        }
      }

      const dummyToken = `demo_jwt_token_${matched.id}_${Date.now()}`;
      localStorage.setItem('cpse_auth_token', dummyToken);
      localStorage.setItem('cpse_auth_user', JSON.stringify(matched));

      return {
        token: dummyToken,
        user: matched,
      };
    }

    // Production Spring Boot REST call: POST /api/auth/login
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    const normalizedUser = normalizeUser(response.data.user);
    const result: AuthResponse = {
      ...response.data,
      user: normalizedUser,
    };
    if (result.token) {
      localStorage.setItem('cpse_auth_token', result.token);
      localStorage.setItem('cpse_auth_user', JSON.stringify(result.user));
    }
    return result;
  },

  getCurrentUser: async (): Promise<User> => {
    if (IS_DEMO_MODE) {
      const stored = localStorage.getItem('cpse_auth_user');
      if (stored) {
        return JSON.parse(stored);
      }
      return DEMO_USERS[0];
    }

    // Production Spring Boot REST call: GET /api/auth/me
    const response = await apiClient.get<User>('/auth/me');
    const normalized = normalizeUser(response.data);
    localStorage.setItem('cpse_auth_user', JSON.stringify(normalized));
    return normalized;
  },

  logout: async (): Promise<void> => {
    try {
      if (!IS_DEMO_MODE) {
        await apiClient.post('/auth/logout');
      }
    } finally {
      localStorage.removeItem('cpse_auth_token');
      localStorage.removeItem('cpse_auth_user');
    }
  },
};
