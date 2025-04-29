import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Получаем инициалы пользователя для аватара
  const getInitials = () => {
    if (!user || !user.fullName) return 'U';
    return user.fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Настраиваем навигационные пункты в зависимости от роли пользователя
  const getNavItems = () => {
    switch (user?.role) {
      case UserRole.SUPER_ADMIN:
        return [
          { name: 'Обзор', path: '/superadmin' },
          { name: 'Пользователи', path: '/superadmin/users' },
          { name: 'Задачи', path: '/superadmin/tasks' },
          { name: 'Отчеты', path: '/superadmin/reports' },
        ];
      case UserRole.ADMIN:
        return [
          { name: 'Обзор', path: '/admin' },
          { name: 'Управляющие', path: '/admin/managers' },
          { name: 'Отчеты', path: '/admin/reports' },
        ];
      case UserRole.MANAGER:
        return [
          { name: 'Рабочий стол', path: '/manager' },
          { name: 'Ежедневный отчет', path: '/manager/daily-report' },
          { name: 'История отчетов', path: '/manager/reports' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              Система Управления
            </Link>
          </div>

          <div className="hidden items-center space-x-4 md:flex">
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{user?.fullName}</span>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Выйти
            </Button>
          </div>

          {/* Мобильное меню */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isMobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Мобильное меню (выпадающее) */}
        {isMobileMenuOpen && (
          <div className="border-t md:hidden">
            <div className="container mx-auto divide-y px-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block py-3 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-sm">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="ml-2 text-sm">{user?.fullName}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Выйти
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="flex flex-1">
        {/* Сайдбар */}
        <aside className="hidden w-64 border-r bg-white md:block">
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="block rounded-lg px-4 py-2 hover:bg-gray-100"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Основной контент */}
        <main className="flex-1 bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
