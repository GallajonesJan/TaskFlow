import { useState, useEffect } from 'react';
import './AddCategoryModal.scss';

const XIcon     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const CheckIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#f59e0b', '#22c55e', '#14b8a6',
  '#3b82f6', '#64748b',
];

const EMPTY = { name: '', color: '#6366f1' };

const AddCategoryModal = ({ isOpen, onClose, onAddCategory, onSaveEdit, categoryToEdit = null }) => {
  const isEditing = Boolean(categoryToEdit);
  const [fields,     setFields]     = useState(EMPTY);
  const [error,      setError]      = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && categoryToEdit) {
      setFields({ name: categoryToEdit.name, color: categoryToEdit.color });
    } else if (isOpen) {
      setFields(EMPTY);
    }
    setError('');
  }, [isOpen, categoryToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fields.name.trim()) return setError('Name is required.');
    if (fields.name.trim().length > 50) return setError('Name must be 50 characters or less.');

    setSubmitting(true);
    try {
      if (isEditing) {
        await onSaveEdit(categoryToEdit.id, { name: fields.name, color: fields.color });
      } else {
        await onAddCategory({ name: fields.name, color: fields.color });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal">

        <div className="modal__header">
          <h2 className="modal__title">{isEditing ? 'Edit Category' : 'Add Category'}</h2>
          <button className="modal__close" onClick={onClose} disabled={submitting}><XIcon /></button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit} noValidate>

          {/* Name */}
          <div className="form-field">
            <label className="form-field__label" htmlFor="cat-name">
              Name <span className="form-field__required">*</span>
            </label>
            <input id="cat-name" type="text"
              className={`form-field__input ${error ? 'form-field__input--error' : ''}`}
              placeholder="e.g. Work, Personal, Health..."
              value={fields.name}
              onChange={e => { setFields(p => ({ ...p, name: e.target.value })); setError(''); }}
              autoFocus maxLength={50} />
            {error && <p className="form-field__error">{error}</p>}
            <p className="form-field__hint">{fields.name.length}/50</p>
          </div>

          {/* Color picker */}
          <div className="form-field">
            <label className="form-field__label">Color</label>
            <div className="cat-modal__colors">
              {PRESET_COLORS.map(c => (
                <button key={c} type="button"
                  className={`cat-modal__color-btn ${fields.color === c ? 'cat-modal__color-btn--active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setFields(p => ({ ...p, color: c }))}
                  aria-label={c} />
              ))}
            </div>

            {/* Live preview */}
            <div className="cat-modal__preview">
              <div className="cat-modal__preview-badge"
                style={{ background: `${fields.color}20`, color: fields.color }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: fields.color, display: 'inline-block', marginRight: 6 }}/>
                {fields.name || 'Category name'}
              </div>
            </div>
          </div>

          <div className="modal__actions">
            <button type="button" className="modal__btn-cancel"
              onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              <CheckIcon />
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Category'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
