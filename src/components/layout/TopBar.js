"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Bell, Check, X, Clock } from "lucide-react";
import { useTheme } from 'next-themes';

export default function TopBar({ title, subtitle, primaryAction, secondaryAction }) {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchLocalNotifications = async () => {
    try {
      const storedEmail = typeof window !== 'undefined' ? sessionStorage.getItem('aq_user_email') : null;
      if (!storedEmail) return;

      const res = await fetch(`/api/notifications?email=${encodeURIComponent(storedEmail)}`);
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map(n => ({
          id: n.id,
          title: n.subject || 'Notification',
          message: n.body || '',
          is_read: n.is_read,
          created_at: n.created_at || new Date().toISOString()
        }));
        setNotifications(formatted);
        setUnreadCount(formatted.filter(n => !n.is_read).length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchLocalNotifications();

    // Poll for new notifications every 4 seconds so simulated events pop up immediately!
    const interval = setInterval(fetchLocalNotifications, 4000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const markAllAsRead = async () => {
    try {
      const storedEmail = typeof window !== 'undefined' ? sessionStorage.getItem('aq_user_email') : null;
      if (!storedEmail) return;

      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true, email: storedEmail })
      });

      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Mark all as read error:', err);
    }
  };

  const handleItemClick = async (notif) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notif.id })
      });
      // Refresh
      fetchLocalNotifications();
    } catch (err) {
      console.error('Error marking single notification read:', err);
    }
  };

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{title}</div>
        <div className="topbar-sub">{subtitle}</div>
      </div>
      
      <div className="topbar-right">
        {secondaryAction && (
          <button 
            className="tb-btn tb-btn-ghost"
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </button>
        )}

        {primaryAction && (
          <button 
            className="tb-btn tb-btn-primary"
            onClick={primaryAction.onClick}
          >
            {primaryAction.label}
          </button>
        )}

        <button className="theme-toggle" onClick={toggleTheme} style={{ marginLeft: '4px' }}>
          {theme === 'dark' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
          )}
        </button>

        <div className="notif" onClick={() => setIsNotifOpen(!isNotifOpen)} style={{ position: 'relative' }}>
          <Bell size={15} />
          {unreadCount > 0 && <div className="notif-dot"></div>}

          {isNotifOpen && (
            <div className="notif-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="nd-header">
                <span className="nd-title">Notifications</span>
                {unreadCount > 0 && (
                  <span className="nd-clear" onClick={markAllAsRead}>Mark all as read</span>
                )}
              </div>
              <div className="nd-content">
                {notifications.length === 0 ? (
                  <div className="nd-empty">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={cn("nd-item", !n.is_read && "unread")}
                      onClick={() => handleItemClick(n)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="nd-item-title">{n.title}</div>
                      <div className="nd-item-msg">{n.message}</div>
                      <div className="nd-item-time">
                        <Clock size={10} style={{ display: 'inline', marginRight: '4px' }} />
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
