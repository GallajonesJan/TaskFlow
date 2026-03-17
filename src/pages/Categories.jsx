import './Categories.scss';

const PlusIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const EditIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;

/**
 * Props:
 *   tasks              {Task[]}
 *   categories         {Category[]}
 *   onOpenAddCategory  {fn}
 *   onEditCategory     {fn(category)}
 *   onDeleteCategory   {fn(id)}
 */
const Categories = ({ tasks = [], categories = [], onOpenAddCategory, onEditCategory, onDeleteCategory }) => {
  // Derive per-category task counts from live task state
  const enriched = categories.map(cat => {
    const catTasks       = tasks.filter(t => t.category_id === cat.id);
    const totalTasks     = catTasks.length;
    const completedTasks = catTasks.filter(t => t.completed).length;
    const pct            = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    // Generate a light bg from the color
    const bg = `${cat.color}18`;
    return { ...cat, bg, totalTasks, completedTasks, pct };
  });

  const totalCompleted = tasks.filter(t => t.completed).length;
  const totalActive    = tasks.filter(t => !t.completed).length;

  return (
    <div className="categories">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Categories</h1>
          <p className="page-header__subtitle">Organize your tasks by category</p>
        </div>
        <button className="btn-primary" onClick={onOpenAddCategory}>
          <PlusIcon />Add Category
        </button>
      </div>

      {/* Summary Stats */}
      <div className="categories__stats">
        {[
          { label: 'Total Categories', val: categories.length,  color: '#1e293b' },
          { label: 'Total Tasks',      val: tasks.length,       color: '#1e293b' },
          { label: 'Completed',        val: totalCompleted,     color: '#22c55e' },
          { label: 'Active',           val: totalActive,        color: '#6366f1' },
        ].map(s => (
          <div className="categories__mini-stat" key={s.label}>
            <p className="categories__mini-label">{s.label}</p>
            <p className="categories__mini-value" style={{ color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {categories.length === 0 && (
        <div className="task-list task-list--empty">
          <div className="task-list__empty-icon">📂</div>
          <p className="task-list__empty-text">No categories yet — add one above!</p>
        </div>
      )}

      {/* Category Cards */}
      <div className="categories__grid">
        {enriched.map(c => (
          <div className="cat-card" key={c.id}>
            <div className="cat-card__header">
              <div className="cat-card__info">
                <div className="cat-card__icon" style={{ background: c.bg }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke={c.color} strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                  </svg>
                </div>
                <div>
                  <p className="cat-card__name">{c.name}</p>
                  <p className="cat-card__count">{c.totalTasks} tasks</p>
                </div>
              </div>
              <div className="cat-card__actions">
                <button
                  className="cat-card__action-btn cat-card__action-btn--edit"
                  onClick={() => onEditCategory(c)}
                  aria-label="Edit category"
                >
                  <EditIcon />
                </button>
                <button
                  className="cat-card__action-btn cat-card__action-btn--delete"
                  onClick={() => onDeleteCategory(c.id)}
                  aria-label="Delete category"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>

            <div className="cat-card__progress-label">
              <span>Progress</span>
              <span>{c.pct}%</span>
            </div>
            <div className="cat-card__progress-track">
              <div className="cat-card__progress-fill" style={{ width: `${c.pct}%`, background: c.color }}/>
            </div>
            <div className="cat-card__progress-footer">
              <span>{c.completedTasks} completed</span>
              <span>{c.totalTasks - c.completedTasks} remaining</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Categories;
