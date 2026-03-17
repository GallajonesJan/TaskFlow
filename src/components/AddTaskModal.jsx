import { useEffect, useState } from 'react';
import './AddTaskModal.scss';
import useTaskForm from '../hooks/useTaskForm';

const XIcon     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const CheckIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;

const AddTaskModal = ({ isOpen, onClose, onAddTask, onSaveEdit, categories = [], taskToEdit = null }) => {
  const isEditing = Boolean(taskToEdit);
  const [submitting, setSubmitting] = useState(false);

  const { fields, errors, handleChange, handleSubmit, reset, resetTo } = useTaskForm(
    async (taskData) => {
      setSubmitting(true);
      try {
        if (isEditing) {
          await onSaveEdit(taskToEdit.id, taskData);
        } else {
          await onAddTask(taskData);
        }
        onClose();
      } finally {
        setSubmitting(false);
      }
    },
    categories
  );

  useEffect(() => {
    if (isOpen && taskToEdit) {
      resetTo(taskToEdit);
    } else if (isOpen && !taskToEdit) {
      reset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, taskToEdit]);

  if (!isOpen) return null;

  const handleClose = () => { reset(); onClose(); };
  const handleBackdrop = (e) => { if (e.target === e.currentTarget) handleClose(); };

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal" role="dialog" aria-modal="true">

        <div className="modal__header">
          <h2 className="modal__title">{isEditing ? 'Edit Task' : 'Add New Task'}</h2>
          <button className="modal__close" onClick={handleClose} disabled={submitting}><XIcon /></button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit} noValidate>

          {/* Title */}
          <div className="form-field">
            <label className="form-field__label" htmlFor="title">
              Title <span className="form-field__required">*</span>
            </label>
            <input id="title" name="title" type="text" autoFocus
              className={`form-field__input ${errors.title ? 'form-field__input--error' : ''}`}
              placeholder="What needs to be done?"
              value={fields.title} onChange={handleChange} />
            {errors.title && <p className="form-field__error">{errors.title}</p>}
          </div>

          {/* Priority + Due Date */}
          <div className="modal__row">
            <div className="form-field">
              <label className="form-field__label" htmlFor="priority">Priority</label>
              <select id="priority" name="priority" className="form-field__select"
                value={fields.priority} onChange={handleChange}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-field__label" htmlFor="due_date">
                Due Date <span className="form-field__required">*</span>
              </label>
              <input id="due_date" name="due_date" type="date"
                className={`form-field__input ${errors.due_date ? 'form-field__input--error' : ''}`}
                value={fields.due_date} onChange={handleChange} />
              {errors.due_date && <p className="form-field__error">{errors.due_date}</p>}
            </div>
          </div>

          {/* Category — text dropdown from categories list */}
          <div className="form-field">
            <label className="form-field__label" htmlFor="category">Category</label>
            <select id="category" name="category" className="form-field__select"
              value={fields.category} onChange={handleChange}>
              <option value="">No category</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="form-field">
            <label className="form-field__label" htmlFor="description">Notes</label>
            <textarea id="description" name="description" rows={3}
              className="form-field__textarea"
              placeholder="Add any extra details..."
              value={fields.description} onChange={handleChange} />
          </div>

          <div className="modal__actions">
            <button type="button" className="modal__btn-cancel"
              onClick={handleClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              <CheckIcon />
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Task'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;