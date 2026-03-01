import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { getNotifications, getUnreadCount, markNotificationRead } from '../api/endpoints';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'urgent';
  is_read: number;
  created_at: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function loadUnread() {
    try {
      const data = await getUnreadCount();
      setUnread(data.count);
    } catch {}
  }

  async function handleOpen() {
    setOpen(!open);
    if (!open) {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch {}
    }
  }

  async function handleMarkRead(id: number) {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch {}
  }

  const typeStyles = {
    info: 'border-l-blue-400',
    warning: 'border-l-amber-400',
    urgent: 'border-l-red-400',
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="flex items-center justify-center rounded-full size-10 bg-primary/5 text-primary hover:bg-primary/10 transition-colors relative"
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-primary/10 z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-primary/10">
            <h4 className="font-bold text-sm">알림</h4>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="size-4" />
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-8">알림이 없습니다</p>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-4 border-b border-primary/5 border-l-4 ${typeStyles[n.type]} ${!n.is_read ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className={`text-sm ${!n.is_read ? 'font-bold' : 'font-medium'}`}>{n.title}</p>
                      {n.message && <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>}
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(n.created_at).toLocaleString('ko-KR')}
                      </p>
                    </div>
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="text-primary hover:bg-primary/10 p-1 rounded shrink-0"
                      >
                        <Check className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
