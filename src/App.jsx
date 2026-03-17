import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/main.scss';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { setApiUser } from './services/api';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Sidebar from './components/Sidebar';
import AddTaskModal from './components/AddTaskModal';
import AddCategoryModal from './components/AddCategoryModal';
import AssignTaskModal from './components/AssignTaskModal';
import TaskDetailPanel from './components/TaskDetailPanel';
import ToastContainer from './components/ToastContainer';
import NetworkError from './components/NetworkError';
import Dashboard from './pages/Dashboard';
import MyTasks from './pages/MyTasks';
import Calendar from './pages/Calendar';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import useToast from './hooks/useToast';

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getUsers,
  getAssignments,
  assignUsers,
  unassignUser,
} from './services/index';

// ── App Shell ─────────────────────────────────────────────────────────────────
const AppShell = () => {
  const { firstName, signOut, isAdmin, user } = useAuth();

  setApiUser(user?.email);

  const [activePage, setActivePage] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [assignModal, setAssignModal] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // ── Theme ──────────────────────────────────────────────────────────────────
  const [themeMode, setThemeMode] = useState(
    () => localStorage.getItem('tf-theme') ?? 'system'
  );

  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('tf-theme', themeMode);
  }, [isDark, themeMode]);

  useEffect(() => {
    if (themeMode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) =>
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [themeMode]);

  const { toasts, toast, remove: removeToast } = useToast();

  // ── Fetch all data ─────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setNetworkError(false);

    try {
      const promises = [getTasks(), getCategories()];
      if (isAdmin) promises.push(getUsers());

      const results = await Promise.all(promises);
      const [tasksData, catsData, usersData] = results;

      setTasks(tasksData);
      setCategories(catsData);
      if (usersData) setUsers(usersData);

      const allAssignments = await Promise.all(
        tasksData.map((t) => getAssignments(t.id).catch(() => []))
      );
      setAssignments(allAssignments.flat());
    } catch {
      setNetworkError(true);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (user?.email) fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, isAdmin]);

  // ── Task handlers ──────────────────────────────────────────────────────────
  const handleAddTask = async (t) => {
    const created = await createTask(t);
    setTasks((prev) => [created, ...prev]);
    toast.success(`"${created.title}" added!`);
  };

  const handleDeleteTask = async (id) => {
    const task = tasks.find((t) => t.id === id);
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setAssignments((prev) => prev.filter((a) => a.task_id !== id));

    if (detailTask?.id === id) {
      setDetailTask(null);
      setSelectedNotification(null);
    }

    toast.info(`"${task?.title}" deleted.`);
  };

  const handleToggleTask = async (id) => {
    const task = tasks.find((t) => t.id === id);
    const updated = await updateTask(id, { completed: !task.completed });
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const handleOpenEdit = (task) => {
    setTaskToEdit(task);
    setModalOpen(true);
  };

  const handleSaveEdit = async (id, updates) => {
    const updated = await updateTask(id, updates);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    toast.success('Task updated!');
  };

  const handleOpenAdd = () => {
    setTaskToEdit(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTaskToEdit(null);
  };

  // ── Assignment handlers ────────────────────────────────────────────────────
  const handleOpenAssign = (task) => {
    setTaskToAssign(task);
    setAssignModal(true);
  };

  const handleCloseAssign = () => {
    setAssignModal(false);
    setTaskToAssign(null);
  };

  const handleAssign = async (taskId, userIds) => {
    const newOnes = await assignUsers(taskId, userIds);
    setAssignments((prev) => [...prev, ...newOnes]);
    toast.success(`Assigned to ${userIds.length} member${userIds.length !== 1 ? 's' : ''}!`);
  };

  const handleUnassign = async (taskId, userId) => {
    await unassignUser(taskId, userId);
    setAssignments((prev) =>
      prev.filter((a) => !(a.task_id === taskId && a.user_id === userId))
    );
  };

  // ── Category handlers ──────────────────────────────────────────────────────
  const handleOpenAddCategory = () => {
    setCategoryToEdit(null);
    setCatModalOpen(true);
  };

  const handleOpenEditCategory = (cat) => {
    setCategoryToEdit(cat);
    setCatModalOpen(true);
  };

  const handleCloseCatModal = () => {
    setCatModalOpen(false);
    setCategoryToEdit(null);
  };

  const handleAddCategory = async (data) => {
    const created = await createCategory(data);
    setCategories((prev) => [...prev, created]);
    toast.success(`"${created.name}" category added!`);
  };

  const handleSaveEditCategory = async (id, updates) => {
    const updated = await updateCategory(id, updates);
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    toast.success('Category updated!');
  };

  const handleDeleteCategory = async (id) => {
    const cat = categories.find((c) => c.id === id);
    await deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast.info(`"${cat?.name}" deleted.`);
  };

  // ── Members only see assigned tasks ───────────────────────────────────────
  const myAssignments = assignments.filter(
    (a) => a.user_id === user?.id || a.profiles?.id === user?.id
  );
  const myTaskIds = new Set(myAssignments.map((a) => a.task_id));
  const visibleTasks = isAdmin ? tasks : tasks.filter((t) => myTaskIds.has(t.id));

  const pageProps = {
    tasks: visibleTasks,
    loading,
    categories,
    firstName,
    isAdmin,
    assignments,
    users,
    onOpenAddTask: handleOpenAdd,
    onToggle: handleToggleTask,
    onEdit: isAdmin ? handleOpenEdit : undefined,
    onDelete: isAdmin ? handleDeleteTask : undefined,
    onAssign: isAdmin ? handleOpenAssign : undefined,
    onClickTask: (task, notification = null) => {
      setDetailTask(task);
      setSelectedNotification(notification);
    },
    onOpenAddCategory: handleOpenAddCategory,
    onEditCategory: handleOpenEditCategory,
    onDeleteCategory: handleDeleteCategory,
  };

  if (networkError) {
    return (
      <div className="app">
        <Sidebar activePage={activePage} onNavigate={setActivePage} onSignOut={signOut} />
        <main className="main-content">
          <NetworkError onRetry={fetchAll} />
        </main>
      </div>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard {...pageProps} />;
      case 'tasks':
        return <MyTasks {...pageProps} />;
      case 'calendar':
        return <Calendar {...pageProps} />;
      case 'categories':
        return <Categories {...pageProps} />;
      case 'settings':
        return (
          <Settings
            {...pageProps}
            darkMode={isDark}
            themeMode={themeMode}
            onThemeChange={setThemeMode}
          />
        );
      default:
        return <Dashboard {...pageProps} />;
    }
  };

  return (
    <div className="app" style={{ position: 'relative' }}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} onSignOut={signOut} />

      <main
        className="main-content"
        style={{ marginRight: detailTask ? 400 : 0, transition: 'margin 0.2s ease' }}
      >
        {renderPage()}
      </main>

      {detailTask && (
        <TaskDetailPanel
          task={detailTask}
          assignments={assignments.filter((a) => a.task_id === detailTask.id)}
          isAdmin={isAdmin}
          selectedNotification={selectedNotification}
          onClose={() => {
            setDetailTask(null);
            setSelectedNotification(null);
          }}
        />
      )}

      <AddTaskModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onAddTask={handleAddTask}
        onSaveEdit={handleSaveEdit}
        categories={categories}
        taskToEdit={taskToEdit}
      />

      <AddCategoryModal
        isOpen={catModalOpen}
        onClose={handleCloseCatModal}
        onAddCategory={handleAddCategory}
        onSaveEdit={handleSaveEditCategory}
        categoryToEdit={categoryToEdit}
      />

      <AssignTaskModal
        isOpen={assignModal}
        onClose={handleCloseAssign}
        task={taskToAssign}
        users={users.filter((u) => u.email !== import.meta.env.VITE_ADMIN_EMAIL)}
        onAssign={handleAssign}
        onUnassign={handleUnassign}
        assignments={assignments.filter((a) => a.task_id === taskToAssign?.id)}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

// ── Root ──────────────────────────────────────────────────────────────────────
const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;