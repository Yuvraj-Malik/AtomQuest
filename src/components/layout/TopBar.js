"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Bell, Check, X, Clock } from "lucide-react";

export default function TopBar({ title, subtitle, primaryAction, secondaryAction }) {
  const [theme, setTheme] = useState("dark");
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    let channel;

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch existing notifications
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          if (error.code === 'PGRST116' || error.message.includes('not found')) {
            console.warn("Notifications table not found.");
          }
        } else if (data) {
          setNotifications(data);
          setUnreadCount(data.filter(n => !n.is_read).length);
        }
      } catch (err) {}

      // Clean up any existing channel with the same name to avoid "after subscribe" errors
      const channelName = `notifs-${user.id}-${Math.random().toString(36).substr(2, 9)}`;
      
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            setNotifications(prev => [payload.new, ...prev].slice(0, 10));
            setUnreadCount(prev => prev + 1);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Realtime subscribed for notifications');
          }
        });
    };

    init();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id);

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
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
                    <div key={n.id} className={cn("nd-item", !n.is_read && "unread")}>
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
