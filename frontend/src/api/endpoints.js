import api from './client';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
};

export const userApi = {
  updateProfile: (data) => api.put('/users/profile', data),
  updateProfilePicture: (formData) =>
    api.put('/users/profile-picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const dashboardApi = {
  get: () => api.get('/dashboard'),
  weekly: () => api.get('/dashboard/weekly'),
};

export const workoutApi = {
  list: (params) => api.get('/workouts', { params }),
  get: (id) => api.get(`/workouts/${id}`),
  create: (data) => api.post('/workouts', data),
  update: (id, data) => api.put(`/workouts/${id}`, data),
  remove: (id) => api.delete(`/workouts/${id}`),
};

export const mealApi = {
  list: (params) => api.get('/meals', { params }),
  summary: (date) => api.get('/meals/summary', { params: { date } }),
  create: (data) => api.post('/meals', data),
  update: (id, data) => api.put(`/meals/${id}`, data),
  remove: (id) => api.delete(`/meals/${id}`),
};

export const weightApi = {
  list: (params) => api.get('/weight', { params }),
  goalProgress: () => api.get('/weight/goal-progress'),
  create: (data) => api.post('/weight', data),
  update: (id, data) => api.put(`/weight/${id}`, data),
  remove: (id) => api.delete(`/weight/${id}`),
};

export const waterApi = {
  today: () => api.get('/water/today'),
  history: (days) => api.get('/water/history', { params: { days } }),
  add: (data) => api.post('/water', data),
  remove: (id) => api.delete(`/water/${id}`),
  setGoal: (goal) => api.put('/water/goal', { goal }),
};

export const sleepApi = {
  list: (params) => api.get('/sleep', { params }),
  weeklyReport: () => api.get('/sleep/weekly-report'),
  create: (data) => api.post('/sleep', data),
  update: (id, data) => api.put(`/sleep/${id}`, data),
  remove: (id) => api.delete(`/sleep/${id}`),
};

export const goalApi = {
  list: (params) => api.get('/goals', { params }),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  remove: (id) => api.delete(`/goals/${id}`),
};

export const notificationApi = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  remove: (id) => api.delete(`/notifications/${id}`),
};

export const reportApi = {
  get: (period) => api.get('/reports', { params: { period } }),
};

export const adminApi = {
  stats: () => api.get('/admin/stats'),
  users: (params) => api.get('/admin/users', { params }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  toggleBlock: (id) => api.put(`/admin/users/${id}/block`),
};
