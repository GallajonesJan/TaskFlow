import { useState } from 'react';
import './Calendar.scss';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PRIORITY_COLORS = {
  High:   { bg: '#fecaca', dot: '#ef4444' },
  Medium: { bg: '#fef3c7', dot: '#f59e0b' },
  Low:    { bg: '#bbf7d0', dot: '#22c55e' },
};

const ChevronLeftIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevronRightIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;

/**
 * Props:
 *   tasks {Task[]} — real tasks from App state
 */
const Calendar = ({ tasks = [] }) => {
  const today = new Date();

  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed

  // ── Navigation ─────────────────────────────────────────────────────────────
  const goToPrev = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const goToNext = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const goToToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  };

  // ── Build calendar grid ────────────────────────────────────────────────────
  const firstDay   = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Fill leading empty cells + day numbers
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  // ── Map tasks to day numbers for this month/year ───────────────────────────
  // due_date from Supabase is 'YYYY-MM-DD' or a timestamptz
  const tasksByDay = {};
  tasks.forEach(task => {
    if (!task.due_date) return;
    const d = new Date(task.due_date);
    if (d.getFullYear() !== year || d.getMonth() !== month) return;
    const day = d.getDate();
    if (!tasksByDay[day]) tasksByDay[day] = [];
    tasksByDay[day].push(task);
  });

  // ── Today's day number (only highlight if same month/year) ─────────────────
  const todayDay = (today.getFullYear() === year && today.getMonth() === month)
    ? today.getDate()
    : null;

  const monthLabel = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="calendar-page">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Calendar</h1>
          <p className="page-header__subtitle">View your tasks in calendar view</p>
        </div>
        <button className="btn-primary" onClick={goToToday}>Today</button>
      </div>

      {/* Month nav */}
      <div className="calendar-page__nav">
        <h2 className="calendar-page__month">{monthLabel}</h2>
        <div className="calendar-page__nav-btns">
          <button className="calendar-page__nav-btn" onClick={goToPrev}><ChevronLeftIcon /></button>
          <button className="calendar-page__nav-btn" onClick={goToNext}><ChevronRightIcon /></button>
        </div>
      </div>

      {/* Grid */}
      <div className="cal-grid">
        <div className="cal-grid__header">
          {DAYS.map(d => <div key={d} className="cal-grid__day-name">{d}</div>)}
        </div>

        <div className="cal-grid__body">
          {cells.map((d, i) => {
            const dayTasks = d ? (tasksByDay[d] ?? []) : [];
            return (
              <div key={i} className={`cal-cell ${d === todayDay ? 'cal-cell--today' : ''}`}>
                {d && <div className="cal-cell__date">{d}</div>}
                {dayTasks.map((task, j) => {
                  const colors = PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.Medium;
                  return (
                    <div key={j} className="cal-cell__event" style={{ background: colors.bg }}>
                      <span className="cal-cell__event-dot" style={{ background: colors.dot }}/>
                      {task.title}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="calendar-page__legend">
        <span className="calendar-page__legend-label">Legend:</span>
        {[
          { color: '#ef4444', label: 'High Priority' },
          { color: '#f59e0b', label: 'Medium Priority' },
          { color: '#22c55e', label: 'Low Priority' },
        ].map(l => (
          <div key={l.label} className="calendar-page__legend-item">
            <span className="calendar-page__legend-dot" style={{ background: l.color }}/>
            {l.label}
          </div>
        ))}
      </div>

    </div>
  );
};

export default Calendar;