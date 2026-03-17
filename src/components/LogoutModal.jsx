import './LogoutModal.scss';

const LogoutModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div className="logout-modal-backdrop" onClick={handleBackdrop}>
      <div className="logout-modal">

        {/* Icon */}
        <div className="logout-modal__icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </div>

        <h2 className="logout-modal__title">Sign out?</h2>
        <p className="logout-modal__message">
          Are you sure you want to sign out of TaskFlow?
        </p>

        <div className="logout-modal__actions">
          <button className="logout-modal__btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="logout-modal__btn-confirm" onClick={onConfirm}>
            Yes, sign out
          </button>
        </div>

      </div>
    </div>
  );
};

export default LogoutModal;