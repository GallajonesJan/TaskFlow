import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AuthPage.scss';

const EyeIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

/**
 * AuthPage
 * mode: 'login' | 'signup'
 */
const AuthPage = ({ mode = 'login' }) => {
  const isSignup = mode === 'signup';
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const [form,     setForm]     = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error,    setError]    = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isSignup && !form.name.trim()) return setError('Name is required.');
    if (!form.email.trim())            return setError('Email is required.');
    if (!form.password)                return setError('Password is required.');
    if (isSignup && form.password.length < 6) return setError('Password must be at least 6 characters.');

    setLoading(true);
    try {
      if (isSignup) {
        await signUp({ email: form.email, password: form.password, name: form.name });
      } else {
        await signIn({ email: form.email, password: form.password });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      // Page will redirect to Google — no navigate() needed here
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* Left branding panel */}
      <div className="auth-page__left">
        <div className="auth-page__left-inner">
          <div className="auth-page__logo" onClick={() => navigate('/')}>
            <div className="auth-page__logo-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" stroke="#fff"/>
                <polyline points="12 6 12 12 16 14" stroke="#fff"/>
              </svg>
            </div>
            <span>TaskFlow</span>
          </div>
          <h2 className="auth-page__left-title">
            {isSignup ? 'Start organizing\nyour life today.' : 'Welcome back.\nLet\'s get things done.'}
          </h2>
          <ul className="auth-page__left-perks">
            {['Track tasks by priority & due date', 'Organize with categories', 'Beautiful dashboard & calendar', 'Light & dark mode'].map(p => (
              <li key={p}><span className="auth-page__perk-dot" />{p}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-page__right">
        <div className="auth-page__form-wrap">

          <h1 className="auth-page__title">
            {isSignup ? 'Create your account' : 'Sign in to TaskFlow'}
          </h1>
          <p className="auth-page__subtitle">
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <Link to={isSignup ? '/login' : '/signup'} className="auth-page__link">
              {isSignup ? 'Log in' : 'Sign up for free'}
            </Link>
          </p>

          {error && <div className="auth-page__error">⚠️ {error}</div>}

          {/* Google button */}
          <button
            className="auth-page__google-btn"
            onClick={handleGoogle}
            disabled={googleLoading}
            type="button"
          >
            <GoogleIcon />
            {googleLoading ? 'Redirecting...' : `Continue with Google`}
          </button>

          {/* Divider */}
          <div className="auth-page__divider">
            <span>or continue with email</span>
          </div>

          {/* Email + password form */}
          <form className="auth-page__form" onSubmit={handleSubmit} noValidate>

            {isSignup && (
              <div className="auth-field">
                <label className="auth-field__label" htmlFor="name">Full Name</label>
                <input id="name" name="name" type="text"
                  className="auth-field__input" placeholder="Alex Kim"
                  value={form.name} onChange={handleChange} autoFocus />
              </div>
            )}

            <div className="auth-field">
              <label className="auth-field__label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email"
                className="auth-field__input" placeholder="you@example.com"
                value={form.email} onChange={handleChange}
                autoFocus={!isSignup} />
            </div>

            <div className="auth-field">
              <div className="auth-field__label-row">
                <label className="auth-field__label" htmlFor="password">Password</label>
                {/* Forgot password — only on login */}
                {!isSignup && (
                  <Link to="/forgot-password" className="auth-page__link auth-page__link--sm">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="auth-field__password-wrap">
                <input id="password" name="password"
                  type={showPass ? 'text' : 'password'}
                  className="auth-field__input"
                  placeholder={isSignup ? 'Minimum 6 characters' : '••••••••'}
                  value={form.password} onChange={handleChange} />
                <button type="button" className="auth-field__eye"
                  onClick={() => setShowPass(s => !s)}>
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-page__submit" disabled={loading}>
              {loading ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}
            </button>

          </form>
        </div>
      </div>

    </div>
  );
};

export default AuthPage;
