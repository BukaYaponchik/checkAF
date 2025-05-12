// Импорты модулей
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Папка для хранения данных
const DATA_DIR = path.join(__dirname, 'server-data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Пути к файлам с данными
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const REPORTS_FILE = path.join(DATA_DIR, 'daily-reports.json');

// Вспомогательные функции для работы с файлами
const readDataFile = (filePath, defaultData = []) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData));
      return defaultData;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Ошибка при чтении файла ${filePath}:`, error);
    return defaultData;
  }
};

const writeDataFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Ошибка при записи в файл ${filePath}:`, error);
    return false;
  }
};

// Инициализация данных, если файлы не существуют
const initializeData = () => {
  // Определим стандартных пользователей
  const defaultUsers = [
    {
      id: '1',
      username: 'superadmin',
      password: 'qwefscaghev12',
      role: 'super_admin',
      fullName: 'Главный Администратор',
      email: 'superadmin@example.com',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      username: 'adminokk',
      password: 'okk2025',
      role: 'admin',
      fullName: 'ОКК',
      email: 'admin@example.com',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      username: 'managersiz',
      password: 'siz2025',
      role: 'manager',
      fullName: 'Сизиков Игорь',
      email: 'manager@example.com',
      createdAt: new Date().toISOString(),
    },
  ];

  // Определим стандартные задачи
  const defaultTasks = [
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

  // Проверим и запишем файлы, если они не существуют
  readDataFile(USERS_FILE, defaultUsers);
  readDataFile(TASKS_FILE, defaultTasks);
  readDataFile(REPORTS_FILE, []);
};

// Инициализация данных при запуске сервера
initializeData();

// Middleware для обработки JSON
app.use(express.json());

// Middleware для логирования запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API для пользователей
app.get('/api/users', (req, res) => {
  const users = readDataFile(USERS_FILE, []);
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const users = readDataFile(USERS_FILE, []);
  const user = users.find(u => u.id === req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'Пользователь не найден' });
  }
});

app.post('/api/users', (req, res) => {
  const users = readDataFile(USERS_FILE, []);
  const newUser = {
    ...req.body,
    id: Math.random().toString(36).substring(2, 11),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  if (writeDataFile(USERS_FILE, users)) {
    res.status(201).json(newUser);
  } else {
    res.status(500).json({ error: 'Ошибка при сохранении пользователя' });
  }
});

app.put('/api/users/:id', (req, res) => {
  const users = readDataFile(USERS_FILE, []);
  const userIndex = users.findIndex(u => u.id === req.params.id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }

  const updatedUser = { ...users[userIndex], ...req.body };
  users[userIndex] = updatedUser;

  if (writeDataFile(USERS_FILE, users)) {
    res.json(updatedUser);
  } else {
    res.status(500).json({ error: 'Ошибка при обновлении пользователя' });
  }
});

app.delete('/api/users/:id', (req, res) => {
  const users = readDataFile(USERS_FILE, []);
  const filteredUsers = users.filter(u => u.id !== req.params.id);

  if (users.length === filteredUsers.length) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }

  if (writeDataFile(USERS_FILE, filteredUsers)) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Ошибка при удалении пользователя' });
  }
});

// API для аутентификации
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = readDataFile(USERS_FILE, []);
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Неверные учетные данные' });
  }

  // Обновляем время последнего входа
  const userIndex = users.findIndex(u => u.id === user.id);
  users[userIndex] = {
    ...user,
    lastLogin: new Date().toISOString()
  };
  writeDataFile(USERS_FILE, users);

  // В реальном приложении здесь будет генерация JWT токена
  const token = Buffer.from(JSON.stringify({
    userId: user.id,
    role: user.role,
    time: Date.now()
  })).toString('base64');

  res.json({ user, token });
});

// API для задач
app.get('/api/tasks', (req, res) => {
  const tasks = readDataFile(TASKS_FILE, []);
  res.json(tasks);
});

app.get('/api/tasks/:id', (req, res) => {
  const tasks = readDataFile(TASKS_FILE, []);
  const task = tasks.find(t => t.id === req.params.id);

  if (task) {
    res.json(task);
  } else {
    res.status(404).json({ error: 'Задача не найдена' });
  }
});

app.post('/api/tasks', (req, res) => {
  const tasks = readDataFile(TASKS_FILE, []);
  const newTask = {
    ...req.body,
    id: Math.random().toString(36).substring(2, 11),
  };

  tasks.push(newTask);
  if (writeDataFile(TASKS_FILE, tasks)) {
    res.status(201).json(newTask);
  } else {
    res.status(500).json({ error: 'Ошибка при сохранении задачи' });
  }
});

app.put('/api/tasks/:id', (req, res) => {
  const tasks = readDataFile(TASKS_FILE, []);
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }

  const updatedTask = { ...tasks[taskIndex], ...req.body };
  tasks[taskIndex] = updatedTask;

  if (writeDataFile(TASKS_FILE, tasks)) {
    res.json(updatedTask);
  } else {
    res.status(500).json({ error: 'Ошибка при обновлении задачи' });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  const tasks = readDataFile(TASKS_FILE, []);
  const filteredTasks = tasks.filter(t => t.id !== req.params.id);

  if (tasks.length === filteredTasks.length) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }

  if (writeDataFile(TASKS_FILE, filteredTasks)) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Ошибка при удалении задачи' });
  }
});

// API для ежедневных отчетов
app.get('/api/daily-reports', (req, res) => {
  const reports = readDataFile(REPORTS_FILE, []);
  res.json(reports);
});

app.get('/api/daily-reports/user/:userId', (req, res) => {
  const reports = readDataFile(REPORTS_FILE, []);
  const userReports = reports.filter(r => r.userId === req.params.userId);
  res.json(userReports);
});

app.get('/api/daily-reports/:id', (req, res) => {
  const reports = readDataFile(REPORTS_FILE, []);
  const report = reports.find(r => r.id === req.params.id);

  if (report) {
    res.json(report);
  } else {
    res.status(404).json({ error: 'Отчет не найден' });
  }
});

app.get('/api/daily-reports/user/:userId/date/:date', (req, res) => {
  const reports = readDataFile(REPORTS_FILE, []);
  const report = reports.find(r => r.userId === req.params.userId && r.date === req.params.date);

  if (report) {
    res.json(report);
  } else {
    res.status(404).json({ error: 'Отчет не найден' });
  }
});

app.post('/api/daily-reports', (req, res) => {
  const reports = readDataFile(REPORTS_FILE, []);
  const newReport = {
    ...req.body,
    id: Math.random().toString(36).substring(2, 11),
  };

  reports.push(newReport);
  if (writeDataFile(REPORTS_FILE, reports)) {
    res.status(201).json(newReport);
  } else {
    res.status(500).json({ error: 'Ошибка при сохранении отчета' });
  }
});

app.put('/api/daily-reports/:id', (req, res) => {
  const reports = readDataFile(REPORTS_FILE, []);
  const reportIndex = reports.findIndex(r => r.id === req.params.id);

  if (reportIndex === -1) {
    return res.status(404).json({ error: 'Отчет не найден' });
  }

  const updatedReport = { ...reports[reportIndex], ...req.body };
  reports[reportIndex] = updatedReport;

  if (writeDataFile(REPORTS_FILE, reports)) {
    res.json(updatedReport);
  } else {
    res.status(500).json({ error: 'Ошибка при обновлении отчета' });
  }
});

// Функция для сброса данных
app.post('/api/reset', (req, res) => {
  try {
    initializeData();
    res.json({ success: true, message: 'Данные были сброшены и переинициализированы' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при сбросе данных' });
  }
});

// Раздача статических файлов из папки dist
app.use(express.static(path.join(__dirname, 'dist')));

// Обработка всех маршрутов для SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});