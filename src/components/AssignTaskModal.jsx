import { useState, useEffect } from 'react';
import './AssignTaskModal.scss';

const XIcon     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const CheckIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const SearchIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

/**
 * AssignTaskModal
 * Props:
 *   isOpen       {boolean}
 *   onClose      {fn}
 *   task         {Task|null}       — the task being assigned
 *   users        {Profile[]}       — all registered members
 *   onAssign     {fn(taskId, userIds)}
 *   onUnassign   {fn(taskId, userId)}
 *   assignments  {Assignment[]}    — current assignments for this task
 */
const AssignTaskModal = ({ isOpen, onClose, task, users = [], onAssign, onUnassign, assignments = [] }) => {
  const [search,     setSearch]     = useState('');
  const [selected,   setSelected]   = useState(new Set());
  const [submitting, setSubmitting] = useState(false);

  // Pre-select already assigned users
  useEffect(() => {
    if (isOpen && assignments.length > 0) {
      setSelected(new Set(assignments.map(a => a.profiles?.id).filter(Boolean)));
    } else if (isOpen) {
      setSelected(new Set());
    }
    setSearch('');
  }, [isOpen, assignments]);

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleUser = (userId) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleSave = async () => {
    if (!task) return;
    setSubmitting(true);
    try {
      const currentIds  = new Set(assignments.map(a => a.profiles?.id).filter(Boolean));
      const toAdd    = [...selected].filter(id => !currentIds.has(id));
      const toRemove = [...currentIds].filter(id => !selected.has(id));

      if (toAdd.length > 0)    await onAssign(task.id, toAdd);
      for (const id of toRemove) await onUnassign(task.id, id);

      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !task) return null;

  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal assign-modal">

        <div className="modal__header">
          <div>
            <h2 className="modal__title">Assign Task</h2>
            <p className="assign-modal__task-name">{task.title}</p>
          </div>
          <button className="modal__close" onClick={onClose}><XIcon /></button>
        </div>

        <div className="assign-modal__body">
          {/* Search */}
          <div className="assign-modal__search">
            <SearchIcon />
            <input
              className="assign-modal__search-input"
              placeholder="Search members..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Selected count */}
          {selected.size > 0 && (
            <p className="assign-modal__count">
              {selected.size} member{selected.size !== 1 ? 's' : ''} selected
            </p>
          )}

          {/* User list */}
          <div className="assign-modal__list">
            {filteredUsers.length === 0 ? (
              <p className="assign-modal__empty">No members found.</p>
            ) : filteredUsers.map(u => {
              const isSelected = selected.has(u.id);
              return (
                <button
                  key={u.id}
                  className={`assign-modal__user ${isSelected ? 'assign-modal__user--selected' : ''}`}
                  onClick={() => toggleUser(u.id)}
                  type="button"
                >
                  <div className="assign-modal__avatar">
                    {(u.name ?? u.email ?? '?')[0].toUpperCase()}
                  </div>
                  <div className="assign-modal__user-info">
                    <p className="assign-modal__user-name">{u.name ?? '—'}</p>
                    <p className="assign-modal__user-email">{u.email}</p>
                  </div>
                  {isSelected && (
                    <div className="assign-modal__check"><CheckIcon /></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="modal__actions" style={{ padding: '0 24px 24px' }}>
          <button className="modal__btn-cancel" onClick={onClose} disabled={submitting}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={submitting}>
            <CheckIcon />
            {submitting ? 'Saving...' : 'Save Assignments'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AssignTaskModal;