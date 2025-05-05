import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
import { type DailyReport } from '@/types';
import { getDailyReportsByUserId, getDailyReports } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const ManagerReportsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setError("Пользователь не найден");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Загрузка отчетов для пользователя:", user.id);

        // В отладочных целях получим все отчеты
        const allReports = await getDailyReports();
        console.log("Все отчеты:", allReports);

        const reportsData = await getDailyReportsByUserId(user.id);
        console.log("Отчеты пользователя:", reportsData);

        if (reportsData.length === 0) {
          console.log("Отчеты не найдены для пользователя:", user.id);
        }

        // Сортируем отчеты по дате (от новых к старым)
        reportsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setReports(reportsData);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setError("Не удалось загрузить историю отчетов");
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить историю отчетов',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

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
            <h1 className="text-2xl font-bold">История отчетов</h1>
            <Button asChild>
              <Link to="/manager/daily-report">Текущий отчет</Link>
            </Button>
          </div>

          <Card>
            <CardContent className="flex items-center justify-center p-10">
              <div className="text-center">
                <h3 className="text-lg font-medium text-red-600">{error}</h3>
                <p className="mt-2 text-gray-600">Попробуйте обновить страницу или обратитесь к администратору.</p>
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

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">История отчетов</h1>
          <Button asChild>
            <Link to="/manager/daily-report">Текущий отчет</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Мои отчеты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-sm">
              <strong>ID пользователя:</strong> {user?.id}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Задачи</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length > 0 ? (
                    reports.map((report) => {
                      const completedTasks = report.tasks.filter(
                          (task) => task.status === 'completed'
                      ).length;
                      const totalTasks = report.tasks.length;

                      return (
                          <TableRow key={report.id}>
                            <TableCell>
                              {new Date(report.date).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
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
                              {completedTasks} из {totalTasks} выполнено
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                >
                                  <Link to={`/manager/daily-report?date=${report.date}`}>
                                    {report.completed ? 'Редактировать' : 'Продолжить'}
                                  </Link>
                                </Button>
                                {report.completed && (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    asChild
                                  >
                                    <Link to={`/manager/reports/${report.id}`}>
                                      Просмотр
                                    </Link>
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                      );
                    })
                ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        У вас пока нет отчетов.
                        <Button variant="link" asChild className="p-1">
                          <Link to="/manager/daily-report">Создать первый отчет</Link>
                        </Button>
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

export default ManagerReportsPage;
