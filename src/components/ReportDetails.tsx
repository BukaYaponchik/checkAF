import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type User, type DailyReport } from '@/types';
import { getUsers } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface ReportDetailsProps {
  report: DailyReport;
  backUrl: string;
  backLabel?: string;
}

const ReportDetails: React.FC<ReportDetailsProps> = ({ report, backUrl, backLabel = 'Назад к списку' }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
        setError("Не удалось загрузить данные пользователей");
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить данные пользователей',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

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
          <h1 className="text-2xl font-bold">Детали отчета</h1>
          <Button variant="outline" asChild>
            <Link to={backUrl}>{backLabel}</Link>
          </Button>
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

  // Получаем информацию о пользователе из отчета
  const reportUser = users.find((u) => u.id === report.userId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Детали отчета</h1>
          <p className="text-gray-500">
            {new Date(report.date).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to={backUrl}>{backLabel}</Link>
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
              {report.completed ? (
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
            {report.tasks.map((task) => (
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
};

export default ReportDetails;
