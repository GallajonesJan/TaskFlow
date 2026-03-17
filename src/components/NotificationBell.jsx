import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotifications,
} from '../services/notificationService';
import './NotificationBell.scss';

const BellIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const timeAgo = (value) => {
  if (!value) return '';

  let iso = String(value).trim().replace(' ', 'T');
  iso = iso.replace(/\+00$/, '+00:00');

  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();

  if (Number.isNaN(diffMs)) return 'Invalid time';

  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;

  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const NotificationBell = ({ onOpenTask }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      setLoading(true);
      try {
        const rows = await getNotifications(user.id);
        setItems(rows ?? []);
      } catch (err) {
        console.error('Failed to load notifications:', err.message);
      } finally {
        setLoading(false);
      }
    };

    load();

    const channel = subscribeToNotifications(user.id, (payload) => {
      setItems((prev) => [payload.new, ...prev]);
    });

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [user?.id]);

  const unreadCount = useMemo(() => {
    return items.filter((n) => !n.read).length;
  }, [items]);

  const handleNotificationClick = async (notification) => {
    try {
      await markNotificationAsRead(notification.id);

      setItems((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, read: true } : n
        )
      );

      console.log('Clicked notification:', notification);

      if (notification?.task_id && onOpenTask) {
        onOpenTask(notification.task_id, notification);
        setOpen(false);
      } else {
        console.warn('Notification missing task_id or onOpenTask:', notification);
      }
    } catch (err) {
      console.error('Failed to open notification:', err.message);
    }
  };

  const handleMarkAll = async () => {
    if (!user?.id) return;

    try {
      await markAllNotificationsAsRead(user.id);
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err.message);
    }
  };

  return (
    <div className="notif-bell">
      <button
        className="notif-bell__trigger"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="notif-bell__badge">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-bell__panel">
          <div className="notif-bell__header">
            <h4>Notifications</h4>
            {items.length > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="notif-bell__mark-all"
              >
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <p className="notif-bell__empty">Loading...</p>
          ) : items.length === 0 ? (
            <p className="notif-bell__empty">No notifications yet.</p>
          ) : (
            <div className="notif-bell__list">
              {items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`notif-bell__item ${n.read ? '' : 'notif-bell__item--unread'}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="notif-bell__item-top">
                    <span className="notif-bell__title">{n.title}</span>
                    <span className="notif-bell__time">{timeAgo(n.created_at)}</span>
                  </div>
                  <p className="notif-bell__message">{n.message}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;