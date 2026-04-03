import { api } from './client';

// Departments
export const getDepartments = () => api.get<any[]>('/departments');
export const getDepartment = (slug: string) => api.get<any>(`/departments/${slug}`);

// Content
export const getContentCategories = (department?: string) => {
  const params = department ? `?department=${department}` : '';
  return api.get<any[]>(`/content/categories${params}`);
};
export const getContentModules = (params?: { category?: string; status?: string; department?: string }) => {
  const qs = new URLSearchParams();
  if (params?.category) qs.set('category', params.category);
  if (params?.status) qs.set('status', params.status);
  if (params?.department) qs.set('department', params.department);
  const query = qs.toString();
  return api.get<any[]>(`/content/modules${query ? `?${query}` : ''}`);
};
export const getContentModule = (id: number) => api.get<any>(`/content/modules/${id}`);

// Notices
export const getNotices = (limit?: number) =>
  api.get<any[]>(`/notices${limit ? `?limit=${limit}` : ''}`);

// Discharge
export const getDischargeCategories = (department?: string) => {
  const params = department ? `?department=${department}` : '';
  return api.get<any[]>(`/discharge/categories${params}`);
};

// Patients
export const getPatient = (id: number) => api.get<any>(`/patients/${id}`);
export const getPatientJourney = (id: number) => api.get<any[]>(`/patients/${id}/journey`);
export const getPatientExaminations = (id: number) => api.get<any[]>(`/patients/${id}/examinations`);
export const getPatientVitalsLatest = (id: number) => api.get<any>(`/patients/${id}/vitals/latest`);
export const getPatientVitalsHistory = (id: number, hours?: number) =>
  api.get<any[]>(`/patients/${id}/vitals/history${hours ? `?hours=${hours}` : ''}`);
export const recordVitals = (id: number, data: any) => api.post<any>(`/patients/${id}/vitals`, data);

// Notifications
export const getNotifications = () => api.get<any[]>('/notifications');
export const getUnreadCount = () => api.get<{ count: number }>('/notifications/unread-count');
export const markNotificationRead = (id: number) => api.put<any>(`/notifications/${id}/read`, {});

// AI Chat
export const getChatSessions = () => api.get<any[]>('/ai/sessions');
export const createChatSession = () => api.post<any>('/ai/sessions', {});
export const sendChatMessage = (sessionId: number, message: string) =>
  api.post<any>('/ai/chat', { sessionId, message });

// Admin
export const getContentStats = () => api.get<any>('/admin/content/stats');
export const bulkPublishModules = () => api.put<{ published: number }>('/admin/content/modules/bulk-publish', {});
export const createModule = (data: any) => api.post<any>('/admin/content/modules', data);
export const updateModule = (id: number, data: any) => api.put<any>(`/admin/content/modules/${id}`, data);
export const deleteModule = (id: number) => api.delete<any>(`/admin/content/modules/${id}`);

export const getAdminPatients = () => api.get<any[]>('/admin/patients');
export const createNotice = (data: any) => api.post<any>('/admin/notices', data);
export const updateNotice = (id: number, data: any) => api.put<any>(`/admin/notices/${id}`, data);
export const deleteNotice = (id: number) => api.delete<any>(`/admin/notices/${id}`);
export const updateJourneyStep = (patientId: number, stepId: number, data: any) =>
  api.put<any>(`/admin/patients/${patientId}/journey/${stepId}`, data);
export const broadcastNotification = (data: any) => api.post<any>('/admin/notifications/broadcast', data);
