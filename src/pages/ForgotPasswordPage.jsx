import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AuthPage.scss';

const ForgotPasswordPage = () => {
  const { sendPasswordReset } = useAuth();
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setError('Email is required.');
    setLoading(true);
    setError('');
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-page__left">
        <div className="auth-page__left-inner">
          <div className="auth-page__logo">
            <div className="auth-page__logo-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" stroke="#fff"/>
                <polyline points="12 6 12 12 16 14" stroke="#fff"/>
              </svg>
            </div>
            <span>TaskFlow</span>
          </div>
          <h2 className="auth-page__left-title">
            {'No worries.\nWe\'ll get you\nback in.'}
          </h2>
        </div>
      </div>

      <div className="auth-page__right">
        <div className="auth-page__form-wrap">

          {sent ? (
            /* ── Success state ── */
            <div className="auth-page__sent">
              <div className="auth-page__sent-icon">📬</div>
              <h1 className="auth-page__title">Check your email</h1>
              <p className="auth-page__subtitle" style={{ marginBottom: 28 }}>
                We sent a password reset link to <strong>{email}</strong>.
                Check your inbox and click the link to reset your password.
              </p>
              <Link to="/login" className="auth-page__link">← Back to login</Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <h1 className="auth-page__title">Forgot your password?</h1>
              <p className="auth-page__subtitle">
                Enter your email and we'll send you a reset link.
              </p>

              {error && <div className="auth-page__error">⚠️ {error}</div>}

              <form className="auth-page__form" onSubmit={handleSubmit} noValidate>
                <div className="auth-field">
                  <label className="auth-field__label" htmlFor="email">Email</label>
                  <input id="email" name="email" type="email"
                    className="auth-field__input" placeholder="you@example.com"
                    value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                    autoFocus />
                </div>

                <button type="submit" className="auth-page__submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>

              <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13.5 }}>
                <Link to="/login" className="auth-page__link">← Back to login</Link>
              </p>
            </>
          )}

        </div>
      </div>

    </div>
  );
};

export default ForgotPasswordPage;
