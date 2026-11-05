import React, { useState, useEffect } from 'react';
import { Bell, Heart, MessageCircle, UserPlus, Sparkles, CheckCheck } from 'lucide-react';
import api from '../../services/api';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotifs = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/all/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Ignore
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'LIKE':
        return <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />;
      case 'COMMENT':
        return <MessageCircle className="w-4 h-4 text-sky-400" />;
      case 'FOLLOW':
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8 space-y-6 select-none">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-400" />
          Notifications
        </h1>
        {notifications.length > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-xs text-amber-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-xs text-stone-500">
            You're all caught up! No new notifications.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all flex items-center gap-3.5 ${
                notif.isRead
                  ? 'bg-white/[0.02] border-white/5 text-stone-400'
                  : 'bg-amber-500/[0.06] border-amber-500/20 text-stone-200'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white/5 shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 text-xs">
                <span className="font-bold text-white">
                  {notif.actor?.fullName || notif.actor?.username || 'VYRO AI'}
                </span>{' '}
                <span>{notif.message}</span>
                <span className="block text-[10px] text-stone-500 mt-0.5">
                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

