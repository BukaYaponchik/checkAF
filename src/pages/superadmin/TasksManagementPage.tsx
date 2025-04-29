import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Task } from '@/types';
import { getTasks, createTask, updateTask, deleteTask } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const TasksManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    required: true,
    order: 0,
  });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const tasksData = await getTasks();

      // Сортируем задачи по порядку
      const sortedTasks = [...tasksData].sort((a, b) => a.order - b.order);
      setTasks(sortedTasks);
    } catch (error) {
      console.error('Ошибка при загрузке задач:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список задач',
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

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, required: checked }));
  };

  const handleOpenDialog = (task?: Task) => {
    if (task) {
      // Редактирование задачи
      setEditingTaskId(task.id);
      setFormData({
        title: task.title,
        description: task.description,
        required: task.required,
        order: task.order,
      });
    } else {
      // Добавление новой задачи
      setEditingTaskId(null);

      // Устанавливаем порядок на 1 больше, чем у последней задачи
      const lastOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order)) : 0;

      setFormData({
        title: '',
        description: '',
        required: true,
        order: lastOrder + 1,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTaskId(null);
    setFormData({
      title: '',
      description: '',
      required: true,
      order: 0,
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const success = await deleteTask(taskId);

      if (success) {
        toast({
          title: 'Успешно',
          description: 'Задача удалена',
        });
        loadTasks();
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось удалить задачу',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error);
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при удалении задачи',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTaskId) {
        // Обновление существующей задачи
        const taskData: Partial<Task> = {
          title: formData.title,
          description: formData.description,
          required: formData.required,
          order: Number(formData.order),
        };

        const updatedTask = await updateTask(editingTaskId, taskData);

        if (updatedTask) {
          toast({
            title: 'Успешно',
            description: 'Задача обновлена',
          });
          loadTasks();
          handleCloseDialog();
        } else {
          toast({
            title: 'Ошибка',
            description: 'Не удалось обновить задачу',
            variant: 'destructive',
          });
        }
      } else {
        // Создание новой задачи
        const newTask = await createTask({
          title: formData.title,
          description: formData.description,
          required: formData.required,
          order: Number(formData.order),
        });

        toast({
          title: 'Успешно',
          description: 'Новая задача создана',
        });
        loadTasks();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Ошибка при сохранении задачи:', error);
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при сохранении задачи',
        variant: 'destructive',
      });
    }
  };

  const handleMoveUp = async (task: Task, index: number) => {
    if (index === 0) return; // Уже первый элемент

    try {
      // Получаем предыдущую задачу
      const prevTask = tasks[index - 1];

      // Меняем порядок между текущей и предыдущей задачей
      await updateTask(task.id, { order: prevTask.order });
      await updateTask(prevTask.id, { order: task.order });

      loadTasks();
    } catch (error) {
      console.error('Ошибка при изменении порядка задач:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить порядок задач',
        variant: 'destructive',
      });
    }
  };

  const handleMoveDown = async (task: Task, index: number) => {
    if (index === tasks.length - 1) return; // Уже последний элемент

    try {
      // Получаем следующую задачу
      const nextTask = tasks[index + 1];

      // Меняем порядок между текущей и следующей задачей
      await updateTask(task.id, { order: nextTask.order });
      await updateTask(nextTask.id, { order: task.order });

      loadTasks();
    } catch (error) {
      console.error('Ошибка при изменении порядка задач:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить порядок задач',
        variant: 'destructive',
      });
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
          <h1 className="text-2xl font-bold">Управление задачами</h1>
          <p className="text-gray-500">Создание и редактирование задач для управляющих</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>Добавить задачу</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список задач</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Обязательная</TableHead>
                <TableHead>Порядок</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task, index) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>{task.description}</TableCell>
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
                  <TableCell>{task.order}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveUp(task, index)}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveDown(task, index)}
                        disabled={index === tasks.length - 1}
                      >
                        ↓
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(task)}>
                        Изменить
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {tasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    Нет доступных задач
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
            <DialogTitle>{editingTaskId ? 'Редактировать задачу' : 'Создать задачу'}</DialogTitle>
            <DialogDescription>
              {editingTaskId
                ? 'Внесите изменения в настройки задачи'
                : 'Заполните информацию для создания новой задачи'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Название задачи
                </label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Описание
                </label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="order" className="text-sm font-medium">
                  Порядок
                </label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  min="1"
                  value={formData.order.toString()}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="required"
                  checked={formData.required}
                  onCheckedChange={handleCheckboxChange}
                />
                <label htmlFor="required" className="text-sm font-medium">
                  Обязательная задача
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Отмена
              </Button>
              <Button type="submit">{editingTaskId ? 'Сохранить' : 'Создать'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TasksManagementPage;
