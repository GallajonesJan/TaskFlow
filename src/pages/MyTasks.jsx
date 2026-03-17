import { useState } from 'react';
import './MyTasks.scss';
import TaskList from '../components/TaskList';

const PlusIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const XIcon      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

const MyTasks = ({
  tasks = [], loading, error,
  isAdmin = false, assignments = [],
  onOpenAddTask, onToggle, onEdit, onDelete, onAssign, onClickTask,
}) => {
  const [filter,   setFilter]   = useState('All');
  const [priority, setPriority] = useState('All');
  const [sortBy,   setSortBy]   = useState('due_date');
  const [search,   setSearch]   = useState('');

  if (loading) {
    return (
      <div className="my-tasks">
        <div className="page-header"><h1 className="page-header__title">My Tasks</h1></div>
        <div className="state-box"><div className="state-box__spinner" /><p>Loading tasks...</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-tasks">
        <div className="page-header"><h1 className="page-header__title">My Tasks</h1></div>
        <div className="state-box state-box--error"><p>⚠️ {error}</p></div>
      </div>
    );
  }

  const visibleTasks = (() => {
    let result = [...tasks];

    if (filter === 'Active')    result = result.filter(t => !t.completed);
    if (filter === 'Completed') result = result.filter(t =>  t.completed);
    if (priority !== 'All')     result = result.filter(t =>
      t.priority?.toLowerCase() === priority.toLowerCase()
    );

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description ?? t.notes ?? '').toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'due_date') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      }
      if (sortBy === 'priority') {
        return (PRIORITY_ORDER[a.priority?.toLowerCase()] ?? 3) - (PRIORITY_ORDER[b.priority?.toLowerCase()] ?? 3);
      }
      if (sortBy === 'created_date') {
        return new Date(b.created_date) - new Date(a.created_date);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  })();

  const emptyMessage = search
    ? `No tasks matching "${search}".`
    : filter !== 'All'
      ? `No ${filter.toLowerCase()} tasks.`
      : 'No tasks yet — add one above!';

  return (
    <div className="my-tasks">
      <div className="page-header">
        <div>
          <h1 className="page-header__title">
            My Tasks
            <span className="my-tasks__count-badge">{tasks.length} tasks</span>
          </h1>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={onOpenAddTask}>
            <PlusIcon />Add Task
          </button>
        )}
      </div>

      <div className="my-tasks__filters">
        <div className="my-tasks__tab-group">
          {['All', 'Active', 'Completed'].map(f => (
            <button key={f}
              className={`my-tasks__filter-tab ${filter === f ? 'my-tasks__filter-tab--active' : ''}`}
              onClick={() => setFilter(f)}
            >{f}</button>
          ))}
        </div>

        <select className="my-tasks__select" value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select className="my-tasks__select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="due_date">Due Date</option>
          <option value="created_date">Created Date</option>
          <option value="priority">Priority</option>
          <option value="title">Title (A–Z)</option>
        </select>

        <div className="my-tasks__search">
          <SearchIcon />
          <input
            className="my-tasks__search-input"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="my-tasks__search-clear" onClick={() => setSearch('')}>
              <XIcon />
            </button>
          )}
        </div>
      </div>

      {(search || filter !== 'All' || priority !== 'All') && (
        <p className="my-tasks__results-count">
          {visibleTasks.length} task{visibleTasks.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* All the required props now passed down */}
      <TaskList
        tasks={visibleTasks}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        onAssign={onAssign}
        onClickTask={onClickTask}
        isAdmin={isAdmin}
        assignments={assignments}
        empty={emptyMessage}
      />
    </div>
  );
};

export default MyTasks;