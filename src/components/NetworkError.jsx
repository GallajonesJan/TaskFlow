import './NetworkError.scss';

/**
 * NetworkError
 * Shown when the backend API is unreachable.
 * Props:
 *   onRetry {fn} — called when user clicks Retry
 */
const NetworkError = ({ onRetry }) => (
  <div className="network-error">
    <div className="network-error__icon">🔌</div>
    <h2 className="network-error__title">Can't reach the server</h2>
    <p className="network-error__message">
      Make sure your backend is running on{' '}
      <code>http://localhost:3000</code> and try again.
    </p>
    <button className="btn-primary" onClick={onRetry}>
      Retry
    </button>
  </div>
);

export default NetworkError;
