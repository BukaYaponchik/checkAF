import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type User, UserRole } from '@/types';
import { getUsers, createUser, updateUser, deleteUser } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const UsersManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: UserRole.MANAGER,
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Ошибка при загрузке пользователей:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список пользователей',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value as UserRole }));
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      // Редактирование пользователя
      setEditingUserId(user.id);
      setFormData({
        username: user.username,
        password: '', // Не заполняем пароль при редактировании
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      });
    } else {
      // Добавление нового пользователя
      setEditingUserId(null);
      setFormData({
        username: '',
        password: '',
        fullName: '',
        email: '',
        role: UserRole.MANAGER,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUserId(null);
    setFormData({
      username: '',
      password: '',
      fullName: '',
      email: '',
      role: UserRole.MANAGER,
    });
  };

  const handleDeleteUser = async (userId: string) => {
    // Проверяем, не удаляет ли пользователь сам себя
    if (currentUser?.id === userId) {
      toast({
        title: 'Ошибка',
        description: 'Вы не можете удалить свою учетную запись',
        variant: 'destructive',
      });
      return;
    }

    try {
      const success = await deleteUser(userId);

      if (success) {
        toast({
          title: 'Успешно',
          description: 'Пользователь удален',
        });
        loadUsers();
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось удалить пользователя',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при удалении пользователя',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUserId) {
        // Обновление существующего пользователя
        const userData: Partial<User> = {
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role,
        };

        // Добавляем пароль только если он был введен
        if (formData.password) {
          userData.password = formData.password;
        }

        const updatedUser = await updateUser(editingUserId, userData);

        if (updatedUser) {
          toast({
            title: 'Успешно',
            description: 'Пользователь обновлен',
          });
          loadUsers();
          handleCloseDialog();
        } else {
          toast({
            title: 'Ошибка',
            description: 'Не удалось обновить пользователя',
            variant: 'destructive',
          });
        }
      } else {
        // Создание нового пользователя
        const newUser = await createUser(formData);

        toast({
          title: 'Успешно',
          description: 'Новый пользователь создан',
        });
        loadUsers();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Ошибка при сохранении пользователя:', error);
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при сохранении пользователя',
        variant: 'destructive',
      });
    }
  };

  // Функция для преобразования роли в текст
  const getRoleText = (role: UserRole): string => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'Главный администратор';
      case UserRole.ADMIN:
        return 'Администратор';
      case UserRole.MANAGER:
        return 'Управляющий';
      default:
        return 'Неизвестная роль';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Управление пользователями</h1>
          <p className="text-gray-500">Создание и редактирование пользовательских учетных записей</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>Добавить пользователя</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список пользователей</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Логин</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Дата создания</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleText(user.role)}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString('ru-RU')}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(user)}>
                        Изменить
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={currentUser?.id === user.id}
                      >
                        Удалить
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    Нет доступных пользователей
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUserId ? 'Редактировать пользователя' : 'Создать пользователя'}</DialogTitle>
            <DialogDescription>
              {editingUserId
                ? 'Внесите изменения в профиль пользователя'
                : 'Заполните информацию для создания нового пользователя'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Полное имя
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Логин
                </label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingUserId} // Нельзя изменять логин при редактировании
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Пароль {editingUserId && '(оставьте пустым, чтобы не менять)'}
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingUserId} // Обязательное поле только при создании
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">
                  Роль
                </label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.SUPER_ADMIN}>Главный администратор</SelectItem>
                    <SelectItem value={UserRole.ADMIN}>Администратор</SelectItem>
                    <SelectItem value={UserRole.MANAGER}>Управляющий</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Отмена
              </Button>
              <Button type="submit">{editingUserId ? 'Сохранить' : 'Создать'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagementPage;
