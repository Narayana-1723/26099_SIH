import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types/user';
import { LoginCredentials, AuthState, RegisterPayload } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('cpse_auth_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch {
          localStorage.removeItem('cpse_auth_token');
          localStorage.removeItem('cpse_auth_user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const register = async (payload: RegisterPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const createdUser = await authService.register(payload);
      return createdUser;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setToken(response.token);
      setUser(response.user);
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
