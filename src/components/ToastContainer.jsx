import './ToastContainer.scss';

const icons = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
};

const ToastContainer = ({ toasts, onRemove }) => {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.type}`} onClick={() => onRemove(t.id)}>
          <span className="toast__icon">{icons[t.type]}</span>
          <span className="toast__message">{t.message}</span>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
