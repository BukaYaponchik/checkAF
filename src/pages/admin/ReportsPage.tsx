import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { type User, type DailyReport, UserRole } from '@/types';
import { getUsers, getDailyReports, getDailyReportById } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const { reportId } = useParams<{ reportId: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Загрузка отчетов для администратора, текущий пользователь:", user);

        // Получаем всех пользователей
        const usersData = await getUsers();
        console.log("Загруженные пользователи:", usersData);
        setUsers(usersData);

        // Получаем все отчеты
        const reportsData = await getDailyReports();
        console.log("Все отчеты:", reportsData);
        setReports(reportsData);

        // Если указан ID отчета, загружаем его
        if (reportId) {
          console.log("Загрузка отчета по ID:", reportId);
          const report = await getDailyReportById(reportId);
          console.log("Загруженный отчет:", report);
          setSelectedReport(report);
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setError("Не удалось загрузить данные отчетов");
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить данные отчетов',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reportId, toast, user]);

  const getUserNameById = (userId: string): string => {
    const user = users.find((u) => u.id === userId);
    return user ? user.fullName : 'Неизвестный пользователь';
  };

  // Фильтрация отчетов в зависимости от роли пользователя
  const filteredReports = reports.filter((report) => {
    // Супер-админ видит все отчеты
    if (user?.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    // Админ видит отчеты только от менеджеров
    if (user?.role === UserRole.ADMIN) {
      const reportUser = users.find((u) => u.id === report.userId);
      return reportUser?.role === UserRole.MANAGER;
    }

    return false;
  });

  console.log("Отфильтрованные отчеты:", filteredReports);

  if (loading) {
    return (
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-gray-900" />
        </div>
    );
  }

  if (error) {
    return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Отчеты сотрудников</h1>
          </div>

          <Card>
            <CardContent className="flex items-center justify-center p-10">
              <div className="text-center">
                <h3 className="text-lg font-medium text-red-600">{error}</h3>
                <p className="mt-2 text-gray-600">Попробуйте обновить страницу или обратитесь к системному администратору.</p>
                <Button
                    className="mt-4"
                    onClick={() => window.location.reload()}
                >
                  Обновить страницу
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
    );
  }

  if (selectedReport) {
    // Отображаем детали выбранного отчета
    const reportUser = users.find((u) => u.id === selectedReport.userId);

    return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Детали отчета</h1>
              <p className="text-gray-500">
                {new Date(selectedReport.date).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to={user?.role === UserRole.SUPER_ADMIN ? '/superadmin/reports' : '/admin/reports'}>Назад к списку</Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Информация о пользователе</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <strong>Имя:</strong> {reportUser?.fullName || 'Неизвестно'}
                </div>
                <div>
                  <strong>Email:</strong> {reportUser?.email || 'Неизвестно'}
                </div>
                <div>
                  <strong>Статус отчета:</strong>{' '}
                  {selectedReport.completed ? (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                    Завершен
                  </span>
                  ) : (
                      <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                    В процессе
                  </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Задачи</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedReport.tasks.map((task) => (
                    <Card key={task.taskId} className="border-t-4 border-t-blue-500">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Задача: {task.taskId}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <strong>Статус:</strong>{' '}
                            {task.status === 'completed' ? (
                                <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                            Выполнено
                          </span>
                            ) : task.status === 'in_progress' ? (
                                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                            В процессе
                          </span>
                            ) : (
                                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800">
                            Не начато
                          </span>
                            )}
                          </div>

                          {task.startTime && (
                              <div>
                                <strong>Время начала:</strong>{' '}
                                {new Date(task.startTime).toLocaleTimeString('ru-RU')}
                              </div>
                          )}

                          {task.endTime && (
                              <div>
                                <strong>Время завершения:</strong>{' '}
                                {new Date(task.endTime).toLocaleTimeString('ru-RU')}
                              </div>
                          )}

                          {task.notes && (
                              <div>
                                <strong>Заметки:</strong> {task.notes}
                              </div>
                          )}

                          <div>
                            <strong>Чек-лист:</strong>
                            {task.checklistItems.length > 0 ? (
                                <ul className="ml-6 mt-2 list-disc space-y-1">
                                  {task.checklistItems.map((item) => (
                                      <li key={item.id} className={item.completed ? 'text-gray-500 line-through' : ''}>
                                        {item.description}{' '}
                                        {item.completed ? '(выполнено)' : '(не выполнено)'}
                                      </li>
                                  ))}
                                </ul>
                            ) : (
                                <div className="mt-2 text-sm text-gray-500">Нет элементов в чек-листе</div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Отчеты сотрудников</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Все отчеты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-sm">
              <strong>Роль пользователя:</strong> {user?.role}
              <br />
              <strong>Всего отчетов в системе:</strong> {reports.length}
              <br />
              <strong>Отфильтрованных отчетов:</strong> {filteredReports.length}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Сотрудник</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>{getUserNameById(report.userId)}</TableCell>
                          <TableCell>
                            {new Date(report.date).toLocaleDateString('ru-RU')}
                          </TableCell>
                          <TableCell>
                            {report.completed ? (
                                <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                          Завершен
                        </span>
                            ) : (
                                <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                          В процессе
                        </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`${user?.role === UserRole.SUPER_ADMIN ? '/superadmin' : '/admin'}/reports/details/${report.id}`}>Подробнее</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        Нет доступных отчетов
                      </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
  );
};

export default ReportsPage;
