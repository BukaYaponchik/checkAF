import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type User, UserRole } from '@/types';
import { getUsers, createUser, updateUser, deleteUser } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const ManagersPage: React.FC = () => {
    const { toast } = useToast();
    const [managers, setManagers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [currentManager, setCurrentManager] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        email: '',
    });

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        loadManagers();
    }, []);

    // Функция загрузки списка управляющих
    const loadManagers = async () => {
        try {
            setLoading(true);
            const users = await getUsers();
            const managerUsers = users.filter((u) => u.role === UserRole.MANAGER);
            setManagers(managerUsers);
        } catch (error) {
            console.error('Ошибка при загрузке данных:', error);
            toast({
                title: 'Ошибка',
                description: 'Не удалось загрузить список управляющих',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // Обработчик изменения полей формы
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Функция добавления нового управляющего
    const handleAddManager = async () => {
        try {
            if (!formData.username || !formData.password || !formData.fullName || !formData.email) {
                toast({
                    title: 'Ошибка',
                    description: 'Пожалуйста, заполните все поля',
                    variant: 'destructive',
                });
                return;
            }

            await createUser({
                username: formData.username,
                password: formData.password,
                fullName: formData.fullName,
                email: formData.email,
                role: UserRole.MANAGER,
            });

            toast({
                title: 'Успешно',
                description: 'Управляющий успешно добавлен',
            });

            // Очищаем форму и обновляем список
            setFormData({
                username: '',
                password: '',
                fullName: '',
                email: '',
            });
            setIsAddDialogOpen(false);
            loadManagers();
        } catch (error) {
            console.error('Ошибка при добавлении управляющего:', error);
            toast({
                title: 'Ошибка',
                description: 'Не удалось добавить управляющего',
                variant: 'destructive',
            });
        }
    };

    // Функция редактирования управляющего
    const handleEditManager = async () => {
        try {
            if (!currentManager || !formData.fullName || !formData.email) {
                toast({
                    title: 'Ошибка',
                    description: 'Пожалуйста, заполните все обязательные поля',
                    variant: 'destructive',
                });
                return;
            }

            const updateData: Partial<User> = {
                fullName: formData.fullName,
                email: formData.email,
            };

            // Обновляем пароль только если он был указан
            if (formData.password) {
                updateData.password = formData.password;
            }

            await updateUser(currentManager.id, updateData);

            toast({
                title: 'Успешно',
                description: 'Данные управляющего успешно обновлены',
            });

            setIsEditDialogOpen(false);
            loadManagers();
        } catch (error) {
            console.error('Ошибка при обновлении данных управляющего:', error);
            toast({
                title: 'Ошибка',
                description: 'Не удалось обновить данные управляющего',
                variant: 'destructive',
            });
        }
    };

    // Функция удаления управляющего
    const handleDeleteManager = async (id: string) => {
        if (!window.confirm('Вы уверены, что хотите удалить этого управляющего?')) {
            return;
        }

        try {
            await deleteUser(id);
            toast({
                title: 'Успешно',
                description: 'Управляющий успешно удален',
            });
            loadManagers();
        } catch (error) {
            console.error('Ошибка при удалении управляющего:', error);
            toast({
                title: 'Ошибка',
                description: 'Не удалось удалить управляющего',
                variant: 'destructive',
            });
        }
    };

    // Открываем диалог редактирования и заполняем форму данными управляющего
    const openEditDialog = (manager: User) => {
        setCurrentManager(manager);
        setFormData({
            username: manager.username,
            password: '', // Оставляем пароль пустым при редактировании
            fullName: manager.fullName,
            email: manager.email,
        });
        setIsEditDialogOpen(true);
    };

    // Форматирование даты для отображения
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                    <h1 className="text-2xl font-bold">Управление персоналом</h1>
                    <p className="text-gray-500">Список управляющих и их информация</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Добавить управляющего</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Добавить нового управляющего</DialogTitle>
                            <DialogDescription>
                                Заполните информацию о новом управляющем. После создания он сможет авторизоваться в системе.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="username" className="text-right">
                                    Логин
                                </Label>
                                <Input
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="password" className="text-right">
                                    Пароль
                                </Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="fullName" className="text-right">
                                    ФИО
                                </Label>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                Отмена
                            </Button>
                            <Button onClick={handleAddManager}>Добавить</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Диалог редактирования */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Редактировать данные управляющего</DialogTitle>
                            <DialogDescription>
                                Измените информацию об управляющем.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-username" className="text-right">
                                    Логин
                                </Label>
                                <Input
                                    id="edit-username"
                                    value={formData.username}
                                    disabled
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-password" className="text-right">
                                    Новый пароль
                                </Label>
                                <Input
                                    id="edit-password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Оставьте пустым, чтобы не менять"
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-fullName" className="text-right">
                                    ФИО
                                </Label>
                                <Input
                                    id="edit-fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-email" className="text-right">
                                    Email
                                </Label>
                                <Input
                                    id="edit-email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Отмена
                            </Button>
                            <Button onClick={handleEditManager}>Сохранить</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Управляющие</CardTitle>
                    <CardDescription>
                        Всего: {managers.length}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ФИО</TableHead>
                                <TableHead>Логин</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Дата регистрации</TableHead>
                                <TableHead>Последний вход</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {managers.length > 0 ? (
                                managers.map((manager) => (
                                    <TableRow key={manager.id}>
                                        <TableCell className="font-medium">{manager.fullName}</TableCell>
                                        <TableCell>{manager.username}</TableCell>
                                        <TableCell>{manager.email}</TableCell>
                                        <TableCell>{formatDate(manager.createdAt)}</TableCell>
                                        <TableCell>
                                            {manager.lastLogin ? formatDate(manager.lastLogin) : 'Нет данных'}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditDialog(manager)}
                                            >
                                                Изменить
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteManager(manager.id)}
                                            >
                                                Удалить
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                                        Управляющие не найдены
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

export default ManagersPage;
