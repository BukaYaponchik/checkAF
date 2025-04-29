import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { UserRole } from '@/types';
import { initializeData } from '@/services/api';
import { Toaster } from '@/components/ui/toaster';

// Импорт страниц для главного администратора
import SuperAdminDashboard from '@/pages/superadmin/SuperAdminDashboard';
import UsersManagementPage from '@/pages/superadmin/UsersManagementPage';
import TasksManagementPage from '@/pages/superadmin/TasksManagementPage';

// Импорт страниц для администратора
import AdminDashboard from '@/pages/admin/AdminDashboard';

// Импорт страниц для управляющего
import ManagerDashboard from '@/pages/manager/ManagerDashboard';
import DailyReportPage from '@/pages/manager/DailyReportPage';

function App() {
  useEffect(() => {
    // Инициализируем демо-данные при запуске приложения
    initializeData();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Маршруты для главного администратора */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.SUPER_ADMIN]}
                redirectPath="/login"
              />
            }
          >
            <Route element={<DashboardLayout />}>
              <Route path="/superadmin" element={<SuperAdminDashboard />} />
              <Route path="/superadmin/users" element={<UsersManagementPage />} />
              <Route path="/superadmin/tasks" element={<TasksManagementPage />} />
              {/* Здесь можно добавить другие маршруты для главного администратора */}
            </Route>
          </Route>

          {/* Маршруты для администратора */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN]}
                redirectPath="/login"
              />
            }
          >
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              {/* Здесь можно добавить другие маршруты для администратора */}
            </Route>
          </Route>

          {/* Маршруты для управляющего */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.MANAGER]}
                redirectPath="/login"
              />
            }
          >
            <Route element={<DashboardLayout />}>
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route path="/manager/daily-report" element={<DailyReportPage />} />
              {/* Здесь можно добавить другие маршруты для управляющего */}
            </Route>
          </Route>

          {/* Перенаправление на страницу входа для неизвестных маршрутов */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
