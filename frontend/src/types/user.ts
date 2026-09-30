export type UserRole = 'USER' | 'ADMIN' | 'REVIEWER';

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  cpse: string;
  cpseId?: number;
  role: UserRole;
  designation: string;
  status: 'ACTIVE' | 'INACTIVE';
  active?: boolean;
  lastLogin?: string;
  createdAt: string;
}
