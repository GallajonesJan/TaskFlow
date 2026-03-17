import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import './Settings.scss';

// ── Icons ─────────────────────────────────────────────────────────────────────
const ProfileIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const AppearanceIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/></svg>;
const BellIcon       = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const DatabaseIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>;
const CheckIcon      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const SunIcon        = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const MoonIcon       = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const SystemIcon     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>;

const Toggle = ({ checked, onChange }) => (
  <button
    className={`settings-toggle ${checked ? 'settings-toggle--on' : ''}`}
    onClick={() => onChange(!checked)}
    role="switch"
    aria-checked={checked}
    type="button"
  >
    <span className="settings-toggle__thumb" />
  </button>
);

const Section = ({ icon, title, subtitle, iconColor = '#6366f1', iconBg = '#eef2ff', children }) => (
  <div className="settings-section">
    <div className="settings-section__header">
      <div className="settings-section__icon" style={{ background: iconBg, '--icon-stroke': iconColor }}>
        {icon}
      </div>
      <div>
        <p className="settings-section__title">{title}</p>
        <p className="settings-section__subtitle">{subtitle}</p>
      </div>
    </div>
    <div className="settings-section__body">{children}</div>
  </div>
);

const Settings = ({ themeMode = 'system', darkMode = false, onThemeChange }) => {
  const { user } = useAuth();

  const [name,       setName]       = useState(user?.user_metadata?.name ?? user?.user_metadata?.full_name ?? '');
  const [email,      setEmail]      = useState(user?.email ?? '');
  const [saving,     setSaving]     = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [saveError,  setSaveError]  = useState('');

  const [pushNotifs,  setPushNotifs]  = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [soundFx,     setSoundFx]     = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('push_notifications, email_notifications, sound_effects')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setPushNotifs(data.push_notifications ?? true);
        setEmailNotifs(data.email_notifications ?? false);
        setSoundFx(data.sound_effects ?? true);
      }
    };

    loadSettings();
  }, [user?.id]);

  const handleSaveNotificationSettings = async (nextValues = {}) => {
    if (!user?.id) return;

    const updates = {
      push_notifications: nextValues.push_notifications ?? pushNotifs,
      email_notifications: nextValues.email_notifications ?? emailNotifs,
      sound_effects: nextValues.sound_effects ?? soundFx,
    };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      console.error('Failed to save notification settings:', error.message);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setSaveStatus('idle');
    setSaveError('');

    try {
      const { error } = await supabase.auth.updateUser({
        email: email !== user?.email ? email : undefined,
        data: { name: name.trim() },
      });

      if (error) throw error;

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('error');
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const THEME_OPTIONS = [
    { id: 'light',  label: 'Light',  Icon: SunIcon },
    { id: 'dark',   label: 'Dark',   Icon: MoonIcon },
    { id: 'system', label: 'System', Icon: SystemIcon },
  ];

  const themeHint = themeMode === 'system'
    ? `Following system preference — currently ${darkMode ? 'dark' : 'light'} mode`
    : `${themeMode.charAt(0).toUpperCase() + themeMode.slice(1)} mode active`;

  return (
    <div className="settings">
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Settings</h1>
          <p className="page-header__subtitle">Manage your preferences and account settings</p>
        </div>
      </div>

      <Section icon={<ProfileIcon />} title="Profile" subtitle="Update your personal information">
        <div className="settings-field">
          <label className="settings-field__label">Name</label>
          <input
            className="settings-field__input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div className="settings-field">
          <label className="settings-field__label">Email</label>
          <input
            className="settings-field__input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
          {email !== user?.email && (
            <p className="settings-field__hint">⚠️ Changing your email will require re-verification.</p>
          )}
        </div>

        {saveStatus === 'error' && (
          <p style={{ color: '#ef4444', fontSize: 13 }}>⚠️ {saveError}</p>
        )}

        <button
          className="btn-primary settings__save-btn"
          onClick={handleSaveProfile}
          disabled={saving || !name.trim()}
          type="button"
        >
          <CheckIcon />
          {saving ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : 'Save Changes'}
        </button>
      </Section>

      <Section
        icon={<AppearanceIcon />}
        title="Appearance"
        subtitle="Customize the look and feel"
        iconColor="#f97316"
        iconBg="#fff7ed"
      >
        <p className="settings-field__label">Theme Mode</p>
        <div className="settings-theme-grid">
          {THEME_OPTIONS.map(({ id, label, Icon }) => {
            const active = themeMode === id;
            return (
              <button
                key={id}
                className={`settings-theme-btn ${active ? 'settings-theme-btn--active' : ''}`}
                onClick={() => onThemeChange?.(id)}
                type="button"
              >
                <Icon />
                <span>{label}</span>
                {active && <span className="settings-theme-btn__check"><CheckIcon /></span>}
              </button>
            );
          })}
        </div>
        <p className="settings__theme-hint">{themeHint}</p>
      </Section>

      <Section
        icon={<BellIcon />}
        title="Notifications"
        subtitle="Manage how you receive notifications"
        iconColor="#22c55e"
        iconBg="#f0fdf4"
      >
        {[
          {
            label: 'Push Notifications',
            sub: 'Receive notifications in your browser',
            val: pushNotifs,
            onToggle: async (next) => {
              setPushNotifs(next);
              await handleSaveNotificationSettings({ push_notifications: next });
            },
          },
          {
            label: 'Email Notifications',
            sub: 'Receive task reminders via email',
            val: emailNotifs,
            onToggle: async (next) => {
              setEmailNotifs(next);
              await handleSaveNotificationSettings({ email_notifications: next });
            },
          },
          {
            label: 'Sound Effects',
            sub: 'Play sounds for notifications',
            val: soundFx,
            onToggle: async (next) => {
              setSoundFx(next);
              await handleSaveNotificationSettings({ sound_effects: next });
            },
          },
        ].map(({ label, sub, val, onToggle }) => (
          <div className="settings-row" key={label}>
            <div>
              <p className="settings-row__label">{label}</p>
              <p className="settings-row__sub">{sub}</p>
            </div>
            <Toggle checked={val} onChange={onToggle} />
          </div>
        ))}
      </Section>

      <Section icon={<DatabaseIcon />} title="Data Management" subtitle="Export, import or clear your data">
        <div className="settings-data-btns">
          <button
            className="settings-data-btn"
            type="button"
            onClick={() => {
              const blob = new Blob(
                [JSON.stringify({ exportedAt: new Date().toISOString() }, null, 2)],
                { type: 'application/json' }
              );
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'taskflow-export.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export Data
          </button>

          <button className="settings-data-btn" type="button">
            Import Data
          </button>

          <button
            className="settings-data-btn settings-data-btn--danger"
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure? This cannot be undone.')) {
                // hook up to API
              }
            }}
          >
            Clear All Data
          </button>
        </div>
      </Section>

      <p className="settings__footer">TaskFlow v1.0.0</p>
    </div>
  );
};

export default Settings;