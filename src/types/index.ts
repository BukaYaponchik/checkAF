export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
}

export interface User {
  id: string;
  username: string;
  password: string; // В реальном приложении пароль должен быть хешированным
  role: UserRole;
  fullName: string;
  email: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  required: boolean;
  order: number;
}

export interface ChecklistItem {
  id: string;
  taskId: string;
  description: string;
  completed: boolean;
  timestamp: string;
}

export interface DailyReport {
  id: string;
  userId: string;
  date: string;
  completed: boolean;
  tasks: {
    taskId: string;
    status: 'not_started' | 'in_progress' | 'completed';
    startTime?: string;
    endTime?: string;
    checklistItems: ChecklistItem[];
    notes?: string;
  }[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;
}
