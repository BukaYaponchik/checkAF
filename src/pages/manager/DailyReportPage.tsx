import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { Task, DailyReport, ChecklistItem } from '@/types';
import {
  getTasks,
  getDailyReportByUserAndDate,
  updateDailyReport,
  createDailyReport,
} from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/input';

const DailyReportPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [report, setReport] = useState<DailyReport | null>(null);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [taskNote, setTaskNote] = useState('');
  const [isReopenDialogOpen, setIsReopenDialogOpen] = useState(false);

  // Получаем дату из параметров URL или используем текущую
  const queryParams = new URLSearchParams(location.search);
  const dateParam = queryParams.get('date');
  const targetDate = dateParam || new Date().toISOString().split('T')[0];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Загружаем список задач
        const tasksData = await getTasks();
        setTasks(tasksData);

        // Проверяем, есть ли отчет на указанную дату
        if (user) {
          const reportData = await getDailyReportByUserAndDate(user.id, targetDate);

          if (reportData) {
            setReport(reportData);
            // Устанавливаем активную задачу
            if (!activeTask && reportData.tasks.length > 0) {
              setActiveTask(reportData.tasks[0].taskId);
            }

            // Если задача выбрана, загрузим заметки к ней
            if (activeTask) {
              const activeTaskData = reportData.tasks.find(task => task.taskId === activeTask);
              if (activeTaskData?.notes) {
                setTaskNote(activeTaskData.notes);
              } else {
                setTaskNote('');
              }
            }
          } else {
            // Создаем новый отчет, если его нет
            const newReport: Omit<DailyReport, 'id'> = {
              userId: user.id,
              date: targetDate,
              completed: false,
              tasks: tasksData.map((task) => ({
                taskId: task.id,
                status: 'not_started',
                checklistItems: [],
              })),
            };

            const createdReport = await createDailyReport(newReport);
            setReport(createdReport);

            if (tasksData.length > 0) {
              setActiveTask(tasksData[0].id);
            }
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить данные',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, targetDate, toast]);

  // Обновление заметок при смене активной задачи
  useEffect(() => {
    if (report && activeTask) {
      const activeTaskData = report.tasks.find(task => task.taskId === activeTask);
      setTaskNote(activeTaskData?.notes || '');
    }
  }, [activeTask, report]);

  // Получаем текущую активную задачу из отчета
  const getActiveTaskReport = () => {
    if (!report || !activeTask) return null;
    return report.tasks.find((task) => task.taskId === activeTask) || null;
  };

  // Получаем информацию о задаче по ID
  const getTaskById = (taskId: string) => {
    return tasks.find((task) => task.id === taskId) || null;
  };

  // Обработчик начала выполнения задачи
  const handleStartTask = async () => {
    if (!report || !activeTask) return;

    try {
      setSaving(true);

      // Обновляем статус задачи на "в процессе"
      const updatedTasks = report.tasks.map((task) =>
        task.taskId === activeTask
          ? { ...task, status: 'in_progress' as const, startTime: new Date().toISOString() }
          : task
      );

      const updatedReport = await updateDailyReport(report.id, {
        tasks: updatedTasks,
      });

      setReport(updatedReport);
      toast({
        title: 'Успешно',
        description: 'Задача начата',
      });
    } catch (error) {
      console.error('Ошибка при обновлении отчета:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить отчет',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Обработчик завершения задачи
  const handleCompleteTask = async () => {
    if (!report || !activeTask) return;

    try {
      setSaving(true);

      // Обновляем статус задачи на "завершена"
      const updatedTasks = report.tasks.map((task) =>
        task.taskId === activeTask
          ? { ...task, status: 'completed' as const, endTime: new Date().toISOString() }
          : task
      );

      const updatedReport = await updateDailyReport(report.id, {
        tasks: updatedTasks,
      });

      setReport(updatedReport);
      toast({
        title: 'Успешно',
        description: 'Задача завершена',
      });
    } catch (error) {
      console.error('Ошибка при обновлении отчета:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить отчет',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Обработчик сохранения заметок к задаче
  const handleSaveTaskNote = async () => {
    if (!report || !activeTask) return;

    try {
      setSaving(true);

      // Обновляем заметки к задаче
      const updatedTasks = report.tasks.map((task) =>
        task.taskId === activeTask
          ? { ...task, notes: taskNote }
          : task
      );

      const updatedReport = await updateDailyReport(report.id, {
        tasks: updatedTasks,
      });

      setReport(updatedReport);
      toast({
        title: 'Успешно',
        description: 'Заметки сохранены',
      });
    } catch (error) {
      console.error('Ошибка при обновлении заметок:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить заметки',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Обработчик добавления нового элемента в чеклист
  const handleAddChecklistItem = async () => {
    if (!report || !activeTask || !newChecklistItem.trim()) return;

    try {
      setSaving(true);

      // Создаем новый элемент чеклиста
      const newItem: ChecklistItem = {
        id: Math.random().toString(36).substring(2, 11),
        taskId: activeTask,
        description: newChecklistItem.trim(),
        completed: false,
        timestamp: new Date().toISOString(),
      };

      // Обновляем задачу с новым элементом чеклиста
      const updatedTasks = report.tasks.map((task) => {
        if (task.taskId === activeTask) {
          return {
            ...task,
            checklistItems: [...(task.checklistItems || []), newItem],
          };
        }
        return task;
      });

      const updatedReport = await updateDailyReport(report.id, {
        tasks: updatedTasks,
      });

      setReport(updatedReport);
      setNewChecklistItem('');
    } catch (error) {
      console.error('Ошибка при добавлении элемента чеклиста:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить элемент',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Обработчик изменения статуса элемента чеклиста
  const handleToggleChecklistItem = async (itemId: string, checked: boolean) => {
    if (!report || !activeTask) return;

    try {
      // Находим активную задачу в отчете
      const activeTaskReport = getActiveTaskReport();
      if (!activeTaskReport) return;

      // Обновляем статус элемента чеклиста
      const updatedItems = activeTaskReport.checklistItems.map((item) =>
        item.id === itemId ? { ...item, completed: checked } : item
      );

      // Обновляем задачу с обновленным элементом чеклиста
      const updatedTasks = report.tasks.map((task) => {
        if (task.taskId === activeTask) {
          return {
            ...task,
            checklistItems: updatedItems,
          };
        }
        return task;
      });

      const updatedReport = await updateDailyReport(report.id, {
        tasks: updatedTasks,
      });

      setReport(updatedReport);
    } catch (error) {
      console.error('Ошибка при обновлении элемента чеклиста:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить элемент',
        variant: 'destructive',
      });
    }
  };

  // Обработчик завершения отчета
  const handleCompleteReport = async () => {
    if (!report) return;

    try {
      setSaving(true);

      const updatedReport = await updateDailyReport(report.id, {
        completed: true,
      });

      setReport(updatedReport);
      toast({
        title: 'Успешно',
        description: 'Отчет завершен',
      });

      // Перенаправляем на страницу управляющего
      navigate('/manager');
    } catch (error) {
      console.error('Ошибка при завершении отчета:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось завершить отчет',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Обработчик переоткрытия завершенного отчета
  const handleReopenReport = async () => {
    if (!report) return;

    try {
      setSaving(true);

      const updatedReport = await updateDailyReport(report.id, {
        completed: false,
      });

      setReport(updatedReport);
      setIsReopenDialogOpen(false);

      toast({
        title: 'Успешно',
        description: 'Отчет открыт для редактирования',
      });
    } catch (error) {
      console.error('Ошибка при открытии отчета:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось открыть отчет',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-gray-900" />
      </div>
    );
  }

  const activeTaskReport = getActiveTaskReport();
  const activeTaskInfo = activeTask ? getTaskById(activeTask) : null;
  const isCurrentDay = targetDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isCurrentDay ? 'Ежедневный отчет' : 'Отчет за прошлую дату'}
          </h1>
          <p className="text-gray-500">
            {new Date(targetDate).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex space-x-2">
          {report && !report.completed && (
            <Button onClick={handleCompleteReport} disabled={saving}>
              Завершить отчет
            </Button>
          )}
          {report && report.completed && (
            <Button variant="outline" onClick={() => setIsReopenDialogOpen(true)} disabled={saving}>
              Дополнить отчет
            </Button>
          )}
        </div>
      </div>

      {report?.completed && !isReopenDialogOpen ? (
        <Card>
          <CardHeader>
            <CardTitle>Отчет завершен</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Ваш отчет за {new Date(targetDate).toLocaleDateString('ru-RU')} завершен.</p>
            <p className="mt-2">Чтобы внести дополнительные изменения, нажмите кнопку "Дополнить отчет".</p>
            <div className="mt-4 flex space-x-4">
              <Button variant="outline" onClick={() => navigate('/manager/reports')}>
                История отчетов
              </Button>
              <Button variant="outline" onClick={() => navigate('/manager')}>
                Вернуться на главную
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Список задач */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Список задач</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tasks.map((task) => {
                  const taskReport = report?.tasks.find((t) => t.taskId === task.id);
                  const status = taskReport?.status || 'not_started';

                  return (
                    <div
                      key={task.id}
                      className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                        activeTask === task.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setActiveTask(task.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{task.title}</div>
                        <div>
                          {status === 'completed' ? (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                              Выполнено
                            </span>
                          ) : status === 'in_progress' ? (
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                              В процессе
                            </span>
                          ) : (
                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800">
                              Не начато
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Детали задачи */}
          <Card className="lg:col-span-3">
            {activeTaskInfo && activeTaskReport ? (
              <>
                <CardHeader>
                  <CardTitle>{activeTaskInfo.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <p className="text-gray-700">{activeTaskInfo.description}</p>

                    <div className="flex space-x-4">
                      {activeTaskReport.status === 'not_started' ? (
                        <Button onClick={handleStartTask} disabled={saving}>
                          Начать задачу
                        </Button>
                      ) : activeTaskReport.status === 'in_progress' ? (
                        <Button onClick={handleCompleteTask} disabled={saving}>
                          Завершить задачу
                        </Button>
                      ) : (
                        <Button variant="outline" disabled>
                          Задача выполнена
                        </Button>
                      )}
                    </div>

                    <Tabs defaultValue="checklist">
                      <TabsList>
                        <TabsTrigger value="checklist">Чек-лист</TabsTrigger>
                        <TabsTrigger value="notes">Заметки</TabsTrigger>
                      </TabsList>

                      {/* Вкладка с чек-листом */}
                      <TabsContent value="checklist">
                        <div className="space-y-4">
                          {(activeTaskReport.status !== 'not_started' || report.completed === false) && (
                            <div className="flex space-x-2">
                              <Input
                                placeholder="Добавить новый пункт..."
                                value={newChecklistItem}
                                onChange={(e) => setNewChecklistItem(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAddChecklistItem();
                                  }
                                }}
                              />
                              <Button onClick={handleAddChecklistItem} disabled={saving || !newChecklistItem.trim()}>
                                Добавить
                              </Button>
                            </div>
                          )}

                          <div className="space-y-2">
                            {activeTaskReport.checklistItems && activeTaskReport.checklistItems.length > 0 ? (
                              activeTaskReport.checklistItems.map((item) => (
                                <div key={item.id} className="flex items-start space-x-2">
                                  <Checkbox
                                    id={item.id}
                                    checked={item.completed}
                                    onCheckedChange={(checked) => handleToggleChecklistItem(item.id, !!checked)}
                                  />
                                  <label
                                    htmlFor={item.id}
                                    className={`text-sm ${
                                      item.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                                    }`}
                                  >
                                    {item.description}
                                  </label>
                                </div>
                              ))
                            ) : (
                              <div className="text-center text-gray-500">
                                {activeTaskReport.status === 'not_started'
                                  ? 'Начните задачу, чтобы добавлять элементы в чек-лист'
                                  : 'Нет элементов в чек-листе. Добавьте первый!'}
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>

                      {/* Вкладка с заметками */}
                      <TabsContent value="notes">
                        <div className="space-y-4">
                          <textarea
                            className="w-full min-h-[150px] p-3 border rounded-md"
                            placeholder="Введите заметки к задаче..."
                            value={taskNote}
                            onChange={(e) => setTaskNote(e.target.value)}
                          />
                          <Button onClick={handleSaveTaskNote} disabled={saving}>
                            Сохранить заметки
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex h-full items-center justify-center p-6">
                <div className="text-center text-gray-500">
                  Выберите задачу из списка слева
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* Диалог подтверждения для переоткрытия отчета */}
      <Dialog open={isReopenDialogOpen} onOpenChange={setIsReopenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Дополнение отчета</DialogTitle>
            <DialogDescription>
              Вы собираетесь дополнить завершенный отчет. Это позволит вам внести дополнительные изменения.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReopenDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleReopenReport} disabled={saving}>
              Дополнить отчет
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyReportPage;
