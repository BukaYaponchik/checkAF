import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  redirectPath = '/login',
}) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Если загрузка еще идет, покажем спиннер или другую индикацию загрузки
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
      </div>
    );
  }

  // Если пользователь не аутентифицирован, перенаправляем на страницу входа
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectPath} replace />;
  }

  // Если у пользователя нет нужной роли, перенаправляем на соответствующую страницу
  if (!allowedRoles.includes(user.role)) {
    // Перенаправление в зависимости от роли пользователя
    switch (user.role) {
      case UserRole.SUPER_ADMIN:
        return <Navigate to="/superadmin" replace />;
      case UserRole.ADMIN:
        return <Navigate to="/admin" replace />;
      case UserRole.MANAGER:
        return <Navigate to="/manager" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // Если пользователь аутентифицирован и имеет нужную роль, отображаем дочерние компоненты
  return <Outlet />;
};

export default ProtectedRoute;
