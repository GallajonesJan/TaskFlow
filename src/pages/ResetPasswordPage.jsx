import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AuthPage.scss';

const EyeIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

const ResetPasswordPage = () => {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!password)              return setError('Password is required.');
    if (password.length < 6)   return setError('Password must be at least 6 characters.');
    if (password !== confirm)   return setError('Passwords do not match.');

    setLoading(true);
    try {
      await updatePassword(password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
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
          <h2 className="auth-page__left-title">{'Set a new\npassword.'}</h2>
        </div>
      </div>

      <div className="auth-page__right">
        <div className="auth-page__form-wrap">
          <h1 className="auth-page__title">Reset your password</h1>
          <p className="auth-page__subtitle">Choose a new password for your account.</p>

          {error && <div className="auth-page__error">⚠️ {error}</div>}

          <form className="auth-page__form" onSubmit={handleSubmit} noValidate>

            <div className="auth-field">
              <label className="auth-field__label" htmlFor="password">New Password</label>
              <div className="auth-field__password-wrap">
                <input id="password" type={showPass ? 'text' : 'password'}
                  className="auth-field__input" placeholder="Minimum 6 characters"
                  value={password} onChange={e => setPassword(e.target.value)} autoFocus />
                <button type="button" className="auth-field__eye" onClick={() => setShowPass(s => !s)}>
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-field__label" htmlFor="confirm">Confirm Password</label>
              <input id="confirm" type="password"
                className="auth-field__input" placeholder="Repeat your password"
                value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>

            <button type="submit" className="auth-page__submit" disabled={loading}>
              {loading ? 'Saving...' : 'Set new password'}
            </button>
          </form>

        </div>
      </div>

    </div>
  );
};

export default ResetPasswordPage;
