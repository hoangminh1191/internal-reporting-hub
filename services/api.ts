import { User, ReportDefinition, ReportSubmission, Department, ReportStatus } from '../types';
import { auth } from './auth';

const API_URL = 'http://localhost:3003/api';

const request = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const headers = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || `Request failed: ${res.statusText}`);
  }

  // Handle empty responses (like DELETE)
  const text = await res.text();
  return text ? JSON.parse(text) : {} as T;
};

export const api = {
  // --- AUTH ---
  getCurrentUser: async (): Promise<User> => {
    const userId = auth.getSessionUserId();
    if (!userId) throw new Error('Unauthorized');
    return request<User>(`/users/${userId}`);
  },

  // --- USERS & DEPARTMENTS (ADMIN) ---
  getAllUsers: () => request<User[]>('/users'),

  getAllDepartments: () => request<Department[]>('/departments'),

  createDepartment: (data: Partial<Department>) => request<Department>('/departments', { method: 'POST', body: JSON.stringify(data) }),

  updateDepartment: (id: string, data: Partial<Department>) => request<Department>(`/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteDepartment: (id: string) => request<boolean>(`/departments/${id}`, { method: 'DELETE' }),

  createUser: (user: Partial<User> & { password?: string }) => request<User>('/users', { method: 'POST', body: JSON.stringify(user) }),

  updateUser: (id: string, data: Partial<User> & { password?: string }) => request<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteUser: (id: string) => request<boolean>(`/users/${id}`, { method: 'DELETE' }),

  // --- REPORTS ---
  getDefinitions: () => request<ReportDefinition[]>('/reports/definitions'),

  getDefinitionById: (id: string) => request<ReportDefinition>(`/reports/definitions/${id}`).catch(() => undefined),

  createDefinition: (def: ReportDefinition) => request<ReportDefinition>('/reports/definitions', { method: 'POST', body: JSON.stringify(def) }),

  updateDefinition: (id: string, data: Partial<ReportDefinition>) => request<ReportDefinition>(`/reports/definitions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteDefinition: (id: string) => request<boolean>(`/reports/definitions/${id}`, { method: 'DELETE' }),

  // --- SUBMISSIONS ---

  getMySubmissions: async (userId: string): Promise<ReportSubmission[]> => {
    return request<ReportSubmission[]>(`/submissions?userId=${userId}`);
  },

  getAllSubmissions: () => request<ReportSubmission[]>('/submissions'),

  getPendingApprovals: async (departmentId: string): Promise<ReportSubmission[]> => {
    const user = await api.getCurrentUser();
    const myViewableSubmissions = await request<ReportSubmission[]>(`/submissions?userId=${user.id}`);
    return myViewableSubmissions.filter(s => s.status === ReportStatus.SUBMITTED);
  },

  getSubmissionById: (id: string) => request<ReportSubmission>(`/submissions/${id}`).catch(() => undefined),

  createSubmission: (submission: ReportSubmission) => request<ReportSubmission>('/submissions', { method: 'POST', body: JSON.stringify(submission) }),

  updateSubmission: (id: string, data: Partial<ReportSubmission>) => request<ReportSubmission>(`/submissions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // --- DASHBOARD STATS (Aggregations) ---
  getDashboardStats: async () => {
    const user = await api.getCurrentUser();
    const submissions = await request<ReportSubmission[]>(`/submissions?userId=${user.id}`);

    const pending = submissions.filter(s => s.status === ReportStatus.SUBMITTED).length;
    const completed = submissions.filter(s => s.status === ReportStatus.APPROVED).length;

    // Simple logic for overdue: Not approved and periodEnd < now
    const now = new Date();
    const overdue = submissions.filter(s =>
      s.status !== ReportStatus.APPROVED &&
      s.status !== ReportStatus.REJECTED &&
      new Date(s.periodEnd) < now
    ).length;

    // Performance: (Approved / Total) * 100
    const total = submissions.length;
    const performance = total > 0 ? Math.round((completed / total) * 100) + '%' : '100%';

    // Chart Data: Aggregate by month (simple logic based on periodStart)
    const months = ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'];
    const currentMonth = now.getMonth();
    // Get last 5 months
    const chartData = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setMonth(currentMonth - i);
      const monthIdx = d.getMonth();
      const monthName = months[monthIdx];

      // Count for this month
      const count = submissions.filter(s => {
        const sd = new Date(s.periodStart);
        return sd.getMonth() === monthIdx && sd.getFullYear() === d.getFullYear();
      }).length;

      // Mocking split of active/downtime based on count for demo
      chartData.push({ name: monthName, active: count, downtime: Math.max(0, count - 1) });
    }

    return {
      stats: [
        { title: 'Chờ duyệt', value: pending.toString(), type: 'pending' },
        { title: 'Đã hoàn thành', value: completed.toString(), type: 'success' },
        { title: 'Quá hạn', value: overdue.toString(), type: 'danger' },
        { title: 'Hiệu suất', value: performance, type: 'info' },
      ],
      chartData,
      recentSubmissions: submissions.slice(0, 5)
    };
  }
};
