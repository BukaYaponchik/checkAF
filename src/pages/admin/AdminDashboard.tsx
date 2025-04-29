import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type User, type DailyReport, UserRole } from '@/types';
import { getUsers, getDailyReports } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [managers, setManagers] = useState<User[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Загружаем список пользователей и находим всех управляющих
        const users = await getUsers();
        const managerUsers = users.filter((u) => u.role === UserRole.MANAGER);
        setManagers(managerUsers);

        // Загружаем все отчеты
        const allReports = await getDailyReports();
        setReports(allReports);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Отфильтровываем отчеты за сегодня
  const today = new Date().toISOString().split('T')[0];
  const todayReports = reports.filter((report) => report.date === today);

  // Отфильтровываем отчеты за последнюю неделю
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weekAgoStr = oneWeekAgo.toISOString().split('T')[0];

  const weekReports = reports.filter(
    (report) => report.date >= weekAgoStr && report.date <= today
  );

  // Функция для получения имени пользователя по ID
  const getUserNameById = (userId: string): string => {
    const user = managers.find((u) => u.id === userId);
    return user ? user.fullName : 'Неизвестный пользователь';
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Панель администратора</h1>
        <p className="text-gray-500">Мониторинг работы управляющих</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Управляющие</CardTitle>
            <CardDescription>
              Всего управляющих: {managers.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/admin/managers">Управление</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Отчеты за сегодня</CardTitle>
            <CardDescription>
              {`Выполнено: ${todayReports.filter((r) => r.completed).length} из ${managers.length}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link to="/admin/reports">Просмотр отчетов</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Активность за неделю</CardTitle>
            <CardDescription>
              {`Отчетов за неделю: ${weekReports.length}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link to="/admin/reports">Анализ активности</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Последние отчеты</CardTitle>
          <CardDescription>
            Отчеты управляющих за последние дни
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Управляющий</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.slice(0, 5).map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                    {getUserNameById(report.userId)}
                  </TableCell>
                  <TableCell>
                    {new Date(report.date).toLocaleDateString('ru-RU')}
                  </TableCell>
                  <TableCell>
                    {report.completed ? (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                        Выполнен
                      </span>
                    ) : (
                      <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                        В процессе
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/admin/reports/${report.id}`}>Подробнее</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {reports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500">
                    Нет доступных отчетов
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {reports.length > 5 && (
            <div className="mt-4 text-center">
              <Button asChild variant="link">
                <Link to="/admin/reports">Показать все отчеты</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
