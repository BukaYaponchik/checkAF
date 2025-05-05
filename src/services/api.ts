import { type User, UserRole, type Task, type DailyReport, type LoginCredentials } from '../types';

// В реальном приложении данные будут храниться на сервере
// Здесь мы используем localStorage для демонстрации

// Вспомогательные функции для работы с localStorage
const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    console.log(`Чтение из localStorage: ключ=${key}, значение=${item ? 'существует' : 'не существует'}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Ошибка при чтении из localStorage: ключ=${key}`, error);
    return defaultValue;
  }
};

const setItem = <T>(key: string, value: T): void => {
  try {
    console.log(`Запись в localStorage: ключ=${key}`, value);
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Ошибка при записи в localStorage: ключ=${key}`, error);
  }
};

// Инициализация данных
export const initializeData = (): void => {
  // Проверяем, инициализированы ли данные
  if (!localStorage.getItem('initialized')) {
    // Создаем суперадмина
    const defaultUsers: User[] = [
      {
        id: '1',
        username: 'superadmin',
        password: 'qwefscaghev12', // В реальном приложении должен быть хешированный пароль
        role: UserRole.SUPER_ADMIN,
        fullName: 'Главный Администратор',
        email: 'superadmin@example.com',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        username: 'adminokk',
        password: 'okk2025',
        role: UserRole.ADMIN,
        fullName: 'ОКК',
        email: 'admin@example.com',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        username: 'managersiz',
        password: 'siz2025',
        role: UserRole.MANAGER,
        fullName: 'Сизиков Игорь',
        email: 'manager@example.com',
        createdAt: new Date().toISOString(),
      },
    ];

    const defaultTasks: Task[] = [
      {
        id: '1',
        title: 'Проверка счетов по юр. лицам',
        description: 'Проверить все счета юридических лиц за текущий месяц',
        required: true,
        order: 1,
      },
      {
        id: '2',
        title: 'Обработка новых заявок',
        description: 'Просмотреть и обработать новые заявки от клиентов',
        required: true,
        order: 2,
      },
    ];

    setItem('users', defaultUsers);
    setItem('tasks', defaultTasks);
    setItem('dailyReports', []);
    setItem('initialized', true);
  }
};

// Функции для работы с пользователями
export const getUsers = async (): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getItem<User[]>('users', []));
    }, 300);
  });
};

export const getUserById = async (id: string): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getItem<User[]>('users', []);
      const user = users.find((user) => user.id === id) || null;
      resolve(user);
    }, 300);
  });
};

export const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getItem<User[]>('users', []);
      const newUser: User = {
        ...userData,
        id: Math.random().toString(36).substring(2, 11),
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      setItem('users', users);
      resolve(newUser);
    }, 300);
  });
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getItem<User[]>('users', []);
      const userIndex = users.findIndex((user) => user.id === id);

      if (userIndex === -1) {
        resolve(null);
        return;
      }

      const updatedUser = { ...users[userIndex], ...userData };
      users[userIndex] = updatedUser;
      setItem('users', users);
      resolve(updatedUser);
    }, 300);
  });
};

export const deleteUser = async (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getItem<User[]>('users', []);
      const filteredUsers = users.filter((user) => user.id !== id);

      if (filteredUsers.length === users.length) {
        resolve(false);
        return;
      }

      setItem('users', filteredUsers);
      resolve(true);
    }, 300);
  });
};

// Функции для аутентификации
export const login = async (credentials: LoginCredentials): Promise<{ user: User; token: string } | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getItem<User[]>('users', []);
      const user = users.find(
          (user) => user.username === credentials.username && user.password === credentials.password
      );

      if (!user) {
        resolve(null);
        return;
      }

      // Обновляем время последнего входа
      updateUser(user.id, { lastLogin: new Date().toISOString() });

      // В реальном приложении здесь будет генерация JWT токена
      const token = btoa(JSON.stringify({ userId: user.id, role: user.role, time: Date.now() }));
      resolve({ user, token });
    }, 500);
  });
};

// Функции для работы с задачами
export const getTasks = async (): Promise<Task[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getItem<Task[]>('tasks', []));
    }, 300);
  });
};

export const getTaskById = async (id: string): Promise<Task | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tasks = getItem<Task[]>('tasks', []);
      const task = tasks.find((task) => task.id === id) || null;
      resolve(task);
    }, 300);
  });
};

export const createTask = async (taskData: Omit<Task, 'id'>): Promise<Task> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tasks = getItem<Task[]>('tasks', []);
      const newTask: Task = {
        ...taskData,
        id: Math.random().toString(36).substring(2, 11),
      };

      tasks.push(newTask);
      setItem('tasks', tasks);
      resolve(newTask);
    }, 300);
  });
};

export const updateTask = async (id: string, taskData: Partial<Task>): Promise<Task | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tasks = getItem<Task[]>('tasks', []);
      const taskIndex = tasks.findIndex((task) => task.id === id);

      if (taskIndex === -1) {
        resolve(null);
        return;
      }

      const updatedTask = { ...tasks[taskIndex], ...taskData };
      tasks[taskIndex] = updatedTask;
      setItem('tasks', tasks);
      resolve(updatedTask);
    }, 300);
  });
};

export const deleteTask = async (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tasks = getItem<Task[]>('tasks', []);
      const filteredTasks = tasks.filter((task) => task.id !== id);

      if (filteredTasks.length === tasks.length) {
        resolve(false);
        return;
      }

      setItem('tasks', filteredTasks);
      resolve(true);
    }, 300);
  });
};

// Функции для работы с ежедневными отчетами
export const getDailyReports = async (): Promise<DailyReport[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getItem<DailyReport[]>('dailyReports', []));
    }, 300);
  });
};

export const getDailyReportsByUserId = async (userId: string): Promise<DailyReport[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const reports = getItem<DailyReport[]>('dailyReports', []);
      const userReports = reports.filter((report) => report.userId === userId);
      resolve(userReports);
    }, 300);
  });
};

export const getDailyReportById = async (id: string): Promise<DailyReport | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const reports = getItem<DailyReport[]>('dailyReports', []);
      const report = reports.find((report) => report.id === id) || null;
      resolve(report);
    }, 300);
  });
};

export const getDailyReportByUserAndDate = async (userId: string, date: string): Promise<DailyReport | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const reports = getItem<DailyReport[]>('dailyReports', []);
      const report = reports.find((report) => report.userId === userId && report.date === date) || null;
      resolve(report);
    }, 300);
  });
};

export const createDailyReport = async (reportData: Omit<DailyReport, 'id'>): Promise<DailyReport> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const reports = getItem<DailyReport[]>('dailyReports', []);
      const newReport: DailyReport = {
        ...reportData,
        id: Math.random().toString(36).substring(2, 11),
      };

      reports.push(newReport);
      setItem('dailyReports', reports);
      resolve(newReport);
    }, 300);
  });
};

export const updateDailyReport = async (id: string, reportData: Partial<DailyReport>): Promise<DailyReport | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const reports = getItem<DailyReport[]>('dailyReports', []);
      const reportIndex = reports.findIndex((report) => report.id === id);

      if (reportIndex === -1) {
        resolve(null);
        return;
      }

      const updatedReport = { ...reports[reportIndex], ...reportData };
      reports[reportIndex] = updatedReport;
      setItem('dailyReports', reports);
      resolve(updatedReport);
    }, 300);
  });
};
