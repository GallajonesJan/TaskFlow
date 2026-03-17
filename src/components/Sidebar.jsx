import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LogoutModal from './LogoutModal';
import './Sidebar.scss';

const DashboardIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const TasksIcon      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const CalendarIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const CategoriesIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>;
const SettingsIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;

const NAV_LINKS = [
  { id: 'dashboard',  label: 'Dashboard',  Icon: DashboardIcon },
  { id: 'tasks',      label: 'My Tasks',   Icon: TasksIcon },
  { id: 'calendar',   label: 'Calendar',   Icon: CalendarIcon },
  { id: 'categories', label: 'Categories', Icon: CategoriesIcon },
  { id: 'settings',   label: 'Settings',   Icon: SettingsIcon },
];

const Sidebar = ({ activePage, onNavigate, onSignOut }) => {
  const { user } = useAuth();
  const [showLogout, setShowLogout] = useState(false);

  // Real name + email from Supabase auth
  const name     = user?.user_metadata?.name
                ?? user?.user_metadata?.full_name
                ?? 'User';
  const email    = user?.email ?? '';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleConfirmLogout = () => {
    setShowLogout(false);
    onSignOut();
  };

  return (
    <>
      <aside className="sidebar">

        {/* Logo */}
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" stroke="#fff"/>
              <polyline points="12 6 12 12 16 14" stroke="#fff"/>
            </svg>
          </div>
          <span className="sidebar__logo-text">TaskFlow</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav">
          {NAV_LINKS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`sidebar__nav-item ${activePage === id ? 'sidebar__nav-item--active' : ''}`}
              onClick={() => onNavigate(id)}
            >
              <Icon /><span>{label}</span>
            </button>
          ))}
        </nav>

        {/* User card — click anywhere on it to open logout modal */}
        <div
          className="sidebar__user sidebar__user--clickable"
          onClick={() => setShowLogout(true)}
          title="Click to sign out"
        >
          <div className="sidebar__user-avatar">{initials}</div>
          <div className="sidebar__user-info">
            <p className="sidebar__user-name">{name}</p>
            <p className="sidebar__user-email">{email}</p>
          </div>
          <div className="sidebar__user-arrow">›</div>
        </div>

      </aside>

      {/* Logout confirmation modal */}
      <LogoutModal
        isOpen={showLogout}
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogout(false)}
      />
    </>
  );
};

export default Sidebar;