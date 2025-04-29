import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, AuthState, LoginCredentials } from '../types';
import { login as loginApi, getUserById } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    token: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setAuthState((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        // Декодируем токен для получения ID пользователя
        const tokenData = JSON.parse(atob(token));
        const userId = tokenData.userId;

        if (!userId) {
          throw new Error('Invalid token');
        }

        // Получаем данные пользователя
        const user = await getUserById(userId);

        if (!user) {
          throw new Error('User not found');
        }

        setAuthState({
          user,
          token,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
      } catch (error) {
        localStorage.removeItem('token');
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: 'Ошибка аутентификации. Пожалуйста, войдите снова.',
        });
      }
    };

    loadUser();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await loginApi(credentials);

      if (!result) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: 'Неверное имя пользователя или пароль',
        }));
        return false;
      }

      const { user, token } = result;
      localStorage.setItem('token', token);

      setAuthState({
        user,
        token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      return true;
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: 'Произошла ошибка при входе в систему',
      }));
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  };

  const clearError = () => {
    setAuthState((prev) => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        loading: authState.loading,
        error: authState.error,
        login,
        logout,
        clearError,
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
