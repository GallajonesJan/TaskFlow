import { api } from './api';

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const getTasks       = ()           => api.get('/tasks');
export const createTask     = (data)       => api.post('/tasks', data);
export const updateTask     = (id, data)   => api.put(`/tasks/${id}`, data);
export const deleteTask     = (id)         => api.delete(`/tasks/${id}`);

// ── Categories ────────────────────────────────────────────────────────────────
export const getCategories    = ()         => api.get('/categories');
export const createCategory   = (data)     => api.post('/categories', data);
export const updateCategory   = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory   = (id)       => api.delete(`/categories/${id}`);

// ── Users (admin only) ────────────────────────────────────────────────────────
export const getUsers = () => api.get('/users');

// ── Assignments ───────────────────────────────────────────────────────────────
export const getAssignments  = (taskId)            => api.get(`/tasks/${taskId}/assignments`);
export const assignUsers     = (taskId, userIds)   => api.post(`/tasks/${taskId}/assignments`, { userIds });
export const unassignUser    = (taskId, userId)    => api.delete(`/tasks/${taskId}/assignments/${userId}`);
export const updateCompletion = (taskId, userId, completed) =>
  api.patch(`/tasks/${taskId}/assignments/${userId}`, { completed });

// ── Comments ──────────────────────────────────────────────────────────────────
export const getComments   = (taskId)              => api.get(`/tasks/${taskId}/comments`);
export const postComment   = (taskId, body, userId) => api.post(`/tasks/${taskId}/comments`, { body, userId });
export const deleteComment = (taskId, commentId)   => api.delete(`/tasks/${taskId}/comments/${commentId}`);
