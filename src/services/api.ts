import { type User, UserRole, type Task, type DailyReport, type LoginCredentials } from '../types';

// Базовый URL для API запросов
const API_BASE_URL = '/api';

// Функция для выполнения HTTP запросов
const fetchWithTimeout = async <T>(
    url: string,
    options: RequestInit = {},
    timeout = 10000
): Promise<T> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json() as T;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Запрос был отменен из-за таймаута');
      }
      throw error;
    }
    throw new Error('Произошла неизвестная ошибка при запросе');
  }
};

// Функция для сброса данных приложения
export const resetData = async (): Promise<void> => {
  console.log('Сброс всех данных и реинициализация приложения');

  try {
    await fetchWithTimeout<{ success: boolean, message: string }>(
        `${API_BASE_URL}/reset`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
    );
  } catch (error) {
    console.error('Ошибка при сбросе данных:', error);
  }
};

// Инициализация данных (пустая функция, так как данные инициализируются на сервере)
export const initializeData = (): void => {
  console.log('Данные инициализируются на сервере');
};

// Функции для работы с пользователями
export const getUsers = async (): Promise<User[]> => {
  try {
    return await fetchWithTimeout<User[]>(`${API_BASE_URL}/users`);
  } catch (error) {
    console.error('Ошибка при получении списка пользователей:', error);
    return [];
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    return await fetchWithTimeout<User>(`${API_BASE_URL}/users/${id}`);
  } catch (error) {
    console.error(`Ошибка при получении пользователя с ID ${id}:`, error);
    return null;
  }
};

export const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
  return await fetchWithTimeout<User>(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User | null> => {
  try {
    return await fetchWithTimeout<User>(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
  } catch (error) {
    console.error(`Ошибка при обновлении пользователя с ID ${id}:`, error);
    return null;
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    const response = await fetchWithTimeout<{ success: boolean }>(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });
    return response.success;
  } catch (error) {
    console.error(`Ошибка при удалении пользователя с ID ${id}:`, error);
    return false;
  }
};

// Функции для аутентификации
export const login = async (credentials: LoginCredentials): Promise<{ user: User; token: string } | null> => {
  try {
    return await fetchWithTimeout<{ user: User; token: string }>(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
  } catch (error) {
    console.error('Ошибка при аутентификации:', error);
    return null;
  }
};

// Функции для работы с задачами
export const getTasks = async (): Promise<Task[]> => {
  try {
    return await fetchWithTimeout<Task[]>(`${API_BASE_URL}/tasks`);
  } catch (error) {
    console.error('Ошибка при получении списка задач:', error);
    return [];
  }
};

export const getTaskById = async (id: string): Promise<Task | null> => {
  try {
    return await fetchWithTimeout<Task>(`${API_BASE_URL}/tasks/${id}`);
  } catch (error) {
    console.error(`Ошибка при получении задачи с ID ${id}:`, error);
    return null;
  }
};

export const createTask = async (taskData: Omit<Task, 'id'>): Promise<Task> => {
  return await fetchWithTimeout<Task>(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });
};

export const updateTask = async (id: string, taskData: Partial<Task>): Promise<Task | null> => {
  try {
    return await fetchWithTimeout<Task>(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
  } catch (error) {
    console.error(`Ошибка при обновлении задачи с ID ${id}:`, error);
    return null;
  }
};

export const deleteTask = async (id: string): Promise<boolean> => {
  try {
    const response = await fetchWithTimeout<{ success: boolean }>(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    return response.success;
  } catch (error) {
    console.error(`Ошибка при удалении задачи с ID ${id}:`, error);
    return false;
  }
};

// Функции для работы с ежедневными отчетами
export const getDailyReports = async (): Promise<DailyReport[]> => {
  try {
    return await fetchWithTimeout<DailyReport[]>(`${API_BASE_URL}/daily-reports`);
  } catch (error) {
    console.error('Ошибка при получении списка отчетов:', error);
    return [];
  }
};

export const getDailyReportsByUserId = async (userId: string): Promise<DailyReport[]> => {
  try {
    return await fetchWithTimeout<DailyReport[]>(`${API_BASE_URL}/daily-reports/user/${userId}`);
  } catch (error) {
    console.error(`Ошибка при получении отчетов для пользователя с ID ${userId}:`, error);
    return [];
  }
};

export const getDailyReportById = async (id: string): Promise<DailyReport | null> => {
  try {
    return await fetchWithTimeout<DailyReport>(`${API_BASE_URL}/daily-reports/${id}`);
  } catch (error) {
    console.error(`Ошибка при получении отчета с ID ${id}:`, error);
    return null;
  }
};

export const getDailyReportByUserAndDate = async (userId: string, date: string): Promise<DailyReport | null> => {
  try {
    return await fetchWithTimeout<DailyReport>(`${API_BASE_URL}/daily-reports/user/${userId}/date/${date}`);
  } catch (error) {
    console.error(`Ошибка при получении отчета для пользователя с ID ${userId} за дату ${date}:`, error);
    return null;
  }
};

export const createDailyReport = async (reportData: Omit<DailyReport, 'id'>): Promise<DailyReport> => {
  return await fetchWithTimeout<DailyReport>(`${API_BASE_URL}/daily-reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reportData),
  });
};

export const updateDailyReport = async (id: string, reportData: Partial<DailyReport>): Promise<DailyReport | null> => {
  try {
    return await fetchWithTimeout<DailyReport>(`${API_BASE_URL}/daily-reports/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    });
  } catch (error) {
    console.error(`Ошибка при обновлении отчета с ID ${id}:`, error);
    return null;
  }
};
