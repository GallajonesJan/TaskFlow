const API_URL = import.meta.env.VITE_API_BASE_URL;

// ── GET all tasks ─────────────────────────────────────────────────────────────
export const getTasks = async () => {
  const response = await fetch(`${API_URL}/tasks`);

  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }

  return response.json();
};

// ── GET single task by ID ─────────────────────────────────────────────────────
export const getTaskById = async (id) => {
  const response = await fetch(`${API_URL}/tasks/${id}`);

  if (!response.ok) {
    throw new Error('Task not found');
  }

  return response.json();
};

// ── POST create a new task ────────────────────────────────────────────────────
export const createTask = async (taskData) => {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create task');
  }

  return response.json();
};

// ── PUT update a task ─────────────────────────────────────────────────────────
export const updateTask = async (id, updates) => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update task');
  }

  return response.json();
};

// ── DELETE a task ─────────────────────────────────────────────────────────────
export const deleteTask = async (id) => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete task');
  }

  return response.json();
};