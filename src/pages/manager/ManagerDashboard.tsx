import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Task, DailyReport } from '@/types';
import { getTasks, getDailyReportByUserAndDate, createDailyReport } from '@/services/api';

const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayReport, setTodayReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);

  // Получаем текущую дату в формате YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Загружаем список задач
        const tasksData = await getTasks();
        setTasks(tasksData);

        // Проверяем, есть ли отчет на сегодня
        if (user) {
          const report = await getDailyReportByUserAndDate(user.id, today);
          setTodayReport(report);
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, today]);

  const handleStartDailyReport = async () => {
    try {
      if (!user) return;

      // Если отчета на сегодня еще нет, создаем новый
      if (!todayReport) {
        const newReport: Omit<DailyReport, 'id'> = {
          userId: user.id,
          date: today,
          completed: false,
          tasks: tasks.map((task) => ({
            taskId: task.id,
            status: 'not_started',
            checklistItems: [],
          })),
        };

        const createdReport = await createDailyReport(newReport);
        setTodayReport(createdReport);

        // Перенаправляем на страницу ежедневного отчета
        navigate('/manager/daily-report');
      } else {
        // Если отчет уже существует, сразу перенаправляем
        navigate('/manager/daily-report');
      }
    } catch (error) {
      console.error('Ошибка при создании отчета:', error);
    }
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
        <h1 className="text-2xl font-bold">Рабочий стол</h1>
        <p className="text-gray-500">Управление ежедневными задачами</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Ежедневный отчет</CardTitle>
            <CardDescription>
              {todayReport
                ? todayReport.completed
                  ? 'Отчет за сегодня уже заполнен'
                  : 'У вас есть незавершенный отчет'
                : 'Начните ваш ежедневный отчет'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleStartDailyReport}
              className="w-full"
              variant={todayReport?.completed ? 'outline' : 'default'}
              disabled={loading}
            >
              {todayReport
                ? todayReport.completed
                  ? 'Просмотреть отчет'
                  : 'Продолжить отчет'
                : 'Начать отчет'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Задачи</CardTitle>
            <CardDescription>
              {`У вас ${tasks.length} активных задач`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {tasks.slice(0, 3).map((task) => (
                <li key={task.id} className="rounded-lg border p-3">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-gray-500 line-clamp-1">
                    {task.description}
                  </div>
                </li>
              ))}
              {tasks.length > 3 && (
                <div className="text-center text-sm text-gray-500">
                  И еще {tasks.length - 3} задач
                </div>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Статистика</CardTitle>
            <CardDescription>
              Статистика ваших задач и отчетов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Выполнено за неделю:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Выполнено за месяц:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Всего отчетов:</span>
                <span className="font-medium">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;
