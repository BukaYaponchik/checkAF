import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type User, type Task, UserRole } from '@/types';
import { getUsers, getTasks } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Загружаем список пользователей и задач
        const usersData = await getUsers();
        setUsers(usersData);

        const tasksData = await getTasks();
        setTasks(tasksData);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Получаем количество пользователей по ролям
  const getUserCountByRole = (role: UserRole): number => {
    return users.filter((u) => u.role === role).length;
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
        <h1 className="text-2xl font-bold">Панель главного администратора</h1>
        <p className="text-gray-500">Управление системой</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Пользователи</CardTitle>
            <CardDescription>
              Всего пользователей: {users.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-2">
              <div className="flex justify-between">
                <span>Главные администраторы:</span>
                <span>{getUserCountByRole(UserRole.SUPER_ADMIN)}</span>
              </div>
              <div className="flex justify-between">
                <span>Администраторы:</span>
                <span>{getUserCountByRole(UserRole.ADMIN)}</span>
              </div>
              <div className="flex justify-between">
                <span>Управляющие:</span>
                <span>{getUserCountByRole(UserRole.MANAGER)}</span>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link to="/superadmin/users">Управление пользователями</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Задачи</CardTitle>
            <CardDescription>
              Всего задач: {tasks.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/superadmin/tasks">Управление задачами</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Система</CardTitle>
            <CardDescription>
              Настройки и мониторинг
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link to="/superadmin/settings">Настройки системы</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Последние пользователи</CardTitle>
            <CardDescription>
              Недавно добавленные пользователи
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead>
                  <TableHead>Логин</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead className="text-right">Дата создания</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.slice(0, 5).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      {user.role === UserRole.SUPER_ADMIN
                        ? 'Главный администратор'
                        : user.role === UserRole.ADMIN
                        ? 'Администратор'
                        : 'Управляющий'}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500">
                      Нет данных о пользователях
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Последние задачи</CardTitle>
            <CardDescription>
              Текущие задачи для управляющих
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Обязательная</TableHead>
                  <TableHead className="text-right">Порядок</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                      {task.required ? (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                          Да
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800">
                          Нет
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{task.order}</TableCell>
                  </TableRow>
                ))}
                {tasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500">
                      Нет доступных задач
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
