import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { UserRole } from '@/types';
import { resetData } from '@/services/api';
import { Toaster } from '@/components/ui/toaster';

// Импорт страниц для главного администратора
import SuperAdminDashboard from '@/pages/superadmin/SuperAdminDashboard';
import UsersManagementPage from '@/pages/superadmin/UsersManagementPage';
import TasksManagementPage from '@/pages/superadmin/TasksManagementPage';
import AdminReportsPage from '@/pages/admin/ReportsPage';

// Импорт страниц для администратора
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminReportDetailsPage from '@/pages/admin/ReportDetailsPage';
import ManagersPage from '@/pages/admin/ManagersPage';

// Импорт страниц для управляющего
import ManagerDashboard from '@/pages/manager/ManagerDashboard';
import DailyReportPage from '@/pages/manager/DailyReportPage';
import ManagerReportsPage from '@/pages/manager/ReportsPage';
import ManagerReportDetailsPage from '@/pages/manager/ReportDetailsPage';

function App() {
    useEffect(() => {
        // Сбрасываем и инициализируем данные при запуске приложения
        resetData();
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
                            <Route path="/superadmin/reports/details/:reportId" element={<AdminReportDetailsPage />} />
                            <Route path="/superadmin/reports/:reportId" element={<AdminReportsPage />} />
                            <Route path="/superadmin/reports" element={<AdminReportsPage />} />
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
                            <Route path="/admin/managers" element={<ManagersPage />} />
                            <Route path="/admin/reports/details/:reportId" element={<AdminReportDetailsPage />} />
                            <Route path="/admin/reports/:reportId" element={<AdminReportsPage />} />
                            <Route path="/admin/reports" element={<AdminReportsPage />} />
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
                            <Route path="/manager/reports" element={<ManagerReportsPage />} />
                            <Route path="/manager/reports/:reportId" element={<ManagerReportDetailsPage />} />
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
