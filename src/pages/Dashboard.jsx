import './Dashboard.scss';
import TaskList from '../components/TaskList';
import NotificationBell from '../components/NotificationBell';

const WEEKLY_DATA = [
  { day: 'Mon', val: 7 },
  { day: 'Tue', val: 5 },
  { day: 'Wed', val: 2 },
  { day: 'Thu', val: 2 },
  { day: 'Fri', val: 4 },
  { day: 'Sat', val: 9 },
  { day: 'Sun', val: 2 },
];

const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const Dashboard = ({
  tasks = [],
  loading,
  firstName = 'there',
  isAdmin = false,
  users = [],
  assignments = [],
  onOpenAddTask,
  onToggle,
  onEdit,
  onDelete,
  onAssign,
  onClickTask,
}) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = tasks.filter((t) => !t.completed).length;

  const overdue = tasks.filter((t) => {
    if (t.completed || !t.due_date) return false;
    return new Date(t.due_date) < new Date(new Date().toDateString());
  }).length;

  const todayISO = new Date().toISOString().split('T')[0];

  const todayTasks = tasks.filter((t) => t.due_date?.startsWith(todayISO));

  const overdueTasks = tasks.filter((t) => {
    if (t.completed || !t.due_date) return false;
    return new Date(t.due_date) < new Date(new Date().toDateString());
  });

  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const r = 40;
  const circ = 2 * Math.PI * r;

  const memberProgress = isAdmin
    ? users
        .filter((u) => u.email !== import.meta.env.VITE_ADMIN_EMAIL)
        .map((u) => {
          const mine = assignments.filter(
            (a) => a.user_id === u.id || a.profiles?.id === u.id
          );

          const doneMine = mine.filter((a) => {
            const task = tasks.find((t) => t.id === a.task_id);
            return task?.completed;
          }).length;

          const pctMine =
            mine.length > 0 ? Math.round((doneMine / mine.length) * 100) : 0;

          return { ...u, total: mine.length, done: doneMine, pct: pctMine };
        })
    : [];

  const taskProgress = isAdmin
    ? tasks.slice(0, 5).map((task) => {
        const taskAssigns = assignments.filter((a) => a.task_id === task.id);
        const doneCount = taskAssigns.filter((a) => a.completed).length;
        const pctTask =
          taskAssigns.length > 0
            ? Math.round((doneCount / taskAssigns.length) * 100)
            : 0;

        return { ...task, assignedCount: taskAssigns.length, doneCount, pctTask };
      })
    : [];

  if (loading) {
    return (
      <div className="dashboard">
        <div className="state-box">
          <div className="state-box__spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        <div>
          <h1 className="dashboard__greeting">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="dashboard__date">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <NotificationBell
          onOpenTask={(taskId, notification) => {
            console.log('Dashboard received taskId:', taskId);
            console.log('Dashboard received notification:', notification);
            console.log('Dashboard tasks:', tasks);

            const matchedTask = tasks.find((t) => t.id === taskId);

            console.log('Matched task:', matchedTask);

            if (matchedTask) {
              onClickTask(matchedTask, notification);
            } else {
              console.warn('No matching task found for notification taskId:', taskId);
            }
          }}
        />
      </div>

      <div className="dashboard__stats">
        {[
          { label: 'Total Tasks', val: total, color: '#6366f1', bg: '#eef2ff' },
          { label: 'Completed', val: completed, color: '#22c55e', bg: '#f0fdf4' },
          { label: 'Pending', val: pending, color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Overdue', val: overdue, color: '#ef4444', bg: '#fef2f2' },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-card__icon" style={{ background: s.bg }}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeLinecap="round"
                strokeWidth="2"
                style={{ stroke: s.color, width: 20, height: 20 }}
              >
                <rect x="3" y="3" width="18" height="18" rx="3" />
              </svg>
            </div>
            <p className="stat-card__value" style={{ color: s.color }}>
              {s.val}
            </p>
            <p className="stat-card__label">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="dashboard__charts">
        <div className="chart-card">
          <h3 className="chart-card__title">Completion Rate</h3>
          <div className="donut-wrap">
            <div className="donut">
              <svg viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={r}
                  fill="none"
                  stroke="var(--surface-2)"
                  strokeWidth="12"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={r}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  strokeDasharray={circ}
                  strokeDashoffset={circ * (pct / 100)}
                  strokeLinecap="round"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={r}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="12"
                  strokeDasharray={circ}
                  strokeDashoffset={circ * (1 - pct / 100)}
                  strokeLinecap="round"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
              </svg>
              <div className="donut__label">
                <span className="donut__pct">{pct}%</span>
                <span className="donut__sub">done</span>
              </div>
            </div>
            <ul className="donut-legend">
              <li className="donut-legend__item">
                <span
                  className="donut-legend__dot"
                  style={{ background: '#22c55e' }}
                />
                Completed ({completed})
              </li>
              <li className="donut-legend__item">
                <span
                  className="donut-legend__dot"
                  style={{ background: '#f59e0b' }}
                />
                Pending ({pending})
              </li>
            </ul>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-card__title">Weekly Activity</h3>
          <div className="bar-chart-wrap">
            <div className="bar-chart__y-axis">
              {[12, 9, 6, 3, 0].map((n) => (
                <span key={n}>{n}</span>
              ))}
            </div>
            <div className="bar-chart">
              {WEEKLY_DATA.map((d) => (
                <div className="bar-chart__col" key={d.day}>
                  <div
                    className="bar-chart__bar"
                    style={{ height: `${(d.val / 12) * 100}%` }}
                  />
                  <span className="bar-chart__label">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isAdmin && memberProgress.length > 0 && (
        <div className="dashboard__section">
          <h3 className="section-header__title" style={{ marginBottom: 12 }}>
            Team Progress
          </h3>
          <div className="dashboard__member-grid">
            {memberProgress.map((m) => (
              <div className="dashboard__member-card" key={m.id}>
                <div className="dashboard__member-header">
                  <div className="dashboard__member-avatar">
                    {(m.name ?? m.email ?? '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="dashboard__member-name">{m.name ?? '—'}</p>
                    <p className="dashboard__member-sub">
                      {m.done}/{m.total} tasks
                    </p>
                  </div>
                  <span className="dashboard__member-pct">{m.pct}%</span>
                </div>
                <div className="dashboard__member-track">
                  <div
                    className="dashboard__member-fill"
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isAdmin && taskProgress.length > 0 && (
        <div className="dashboard__section">
          <h3 className="section-header__title" style={{ marginBottom: 12 }}>
            Task Progress
          </h3>
          <div className="chart-card">
            {taskProgress.map((t) => (
              <div className="dashboard__task-progress" key={t.id}>
                <p className="dashboard__task-progress-title">{t.title}</p>
                <div className="dashboard__task-progress-bar-wrap">
                  <div className="dashboard__task-progress-bar">
                    <div
                      className="dashboard__task-progress-fill"
                      style={{ width: `${t.pctTask}%` }}
                    />
                  </div>
                  <span className="dashboard__task-progress-label">
                    {t.doneCount}/{t.assignedCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {overdueTasks.length > 0 && (
        <div className="dashboard__section">
          <div className="section-header">
            <h3 className="section-header__title">⚠️ Overdue Tasks</h3>
          </div>
          <TaskList
            tasks={overdueTasks}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            onAssign={onAssign}
            onClickTask={onClickTask}
            isAdmin={isAdmin}
            assignments={assignments}
            empty=""
          />
        </div>
      )}

      <div className="section-header">
        <h3 className="section-header__title">Today's Tasks</h3>
        {isAdmin && (
          <button className="btn-primary" onClick={onOpenAddTask}>
            <PlusIcon />
            Add Task
          </button>
        )}
      </div>

      <TaskList
        tasks={todayTasks}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        onAssign={onAssign}
        onClickTask={onClickTask}
        isAdmin={isAdmin}
        assignments={assignments}
        empty="No tasks due today — enjoy your day! 🎉"
      />
    </div>
  );
};

export default Dashboard;