import './TaskItem.scss';

const formatDate = (iso) => {
  if (!iso) return null;
  try { return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
  catch { return iso; }
};
const isOverdue = (iso, completed) => !iso || completed ? false : new Date(iso) < new Date(new Date().toDateString());

const CheckIcon  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const EditIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;
const CalIcon    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const PeopleIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

const TaskItem = ({ task, onToggle, onEdit, onDelete, onAssign, onClick, isAdmin = false, assignedCount = 0 }) => {
  const { id, title, priority, category, due_date, completed } = task;
  const priClass = priority?.toLowerCase() ?? 'medium';
  const date     = formatDate(due_date);
  const overdue  = isOverdue(due_date, completed);

  const stopAndCall = (fn) => (e) => { e.stopPropagation(); fn?.(); };

  return (
    <div
      className={`task-item ${completed ? 'task-item--done' : ''} ${overdue ? 'task-item--overdue' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <button
        className={`task-item__checkbox ${completed ? 'task-item__checkbox--checked' : ''}`}
        onClick={stopAndCall(() => onToggle?.(id))}
        aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {completed && <CheckIcon />}
      </button>

      <span className={`task-item__title ${completed ? 'task-item__title--done' : ''}`}>
        {title}
      </span>

      {/* Assigned count — admin view */}
      {isAdmin && assignedCount > 0 && (
        <span className="task-item__assigned-badge">
          <PeopleIcon />{assignedCount}
        </span>
      )}

      <div className="task-item__meta">
        <span className={`task-item__priority task-item__priority--${priClass}`}>
          <span className="task-item__priority-dot" />{priority}
        </span>
        {category && <span className="task-item__category">{category}</span>}
        {date && (
          <span className={`task-item__date ${overdue ? 'task-item__date--overdue' : ''}`}>
            <CalIcon />{date}
          </span>
        )}
      </div>

      <div className="task-item__actions">
        {isAdmin && (
          <button className="task-item__action-btn task-item__action-btn--assign"
            onClick={stopAndCall(() => onAssign?.(task))} title="Assign to members">
            <PeopleIcon />
          </button>
        )}
        {isAdmin && (
          <button className="task-item__action-btn task-item__action-btn--edit"
            onClick={stopAndCall(() => onEdit?.(task))}>
            <EditIcon />
          </button>
        )}
        {isAdmin && (
          <button className="task-item__action-btn task-item__action-btn--delete"
            onClick={stopAndCall(() => onDelete?.(id))}>
            <TrashIcon />
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskItem;