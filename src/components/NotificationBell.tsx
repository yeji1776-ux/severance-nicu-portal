import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [popup, setPopup] = useState<Notification | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const prevUnreadRef = useRef(0);

  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, 15000);
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
      // Show popup if new notifications arrived
      if (data.count > prevUnreadRef.current && prevUnreadRef.current >= 0) {
        const allNotifs = await getNotifications();
        const newUnread = allNotifs.filter((n: Notification) => !n.is_read);
        if (newUnread.length > 0 && !popup) {
          setPopup(newUnread[0]);
        }
        setNotifications(allNotifs);
      }
      prevUnreadRef.current = data.count;
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

  async function handlePopupConfirm() {
    if (popup) {
      await handleMarkRead(popup.id);
      setPopup(null);
    }
  }

  function handlePopupDismiss() {
    setPopup(null);
  }

  const typeStyles = {
    info: { border: 'border-l-blue-400', bg: 'bg-blue-50', icon: Info, color: 'text-blue-600', label: '알림' },
    warning: { border: 'border-l-amber-400', bg: 'bg-amber-50', icon: AlertTriangle, color: 'text-amber-600', label: '주의' },
    urgent: { border: 'border-l-red-400', bg: 'bg-red-50', icon: AlertCircle, color: 'text-red-600', label: '긴급' },
  };

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={handleOpen}
          className="flex items-center justify-center rounded-full size-10 bg-primary/5 text-primary hover:bg-primary/10 transition-colors relative"
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-primary/10 z-50 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-primary/10">
              <h4 className="font-bold text-sm">알림 {unread > 0 && <span className="text-xs text-red-500 font-normal ml-1">{unread}개 읽지 않음</span>}</h4>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="size-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-8">알림이 없습니다</p>
              ) : (
                notifications.map(n => {
                  const style = typeStyles[n.type];
                  const TypeIcon = style.icon;
                  return (
                    <div
                      key={n.id}
                      className={`p-4 border-b border-primary/5 border-l-4 ${style.border} ${!n.is_read ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        <TypeIcon className={`size-4 mt-0.5 shrink-0 ${style.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!n.is_read ? 'font-bold' : 'font-medium'}`}>{n.title}</p>
                          {n.message && <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>}
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(n.created_at).toLocaleString('ko-KR')}
                          </p>
                        </div>
                        {!n.is_read && (
                          <button
                            onClick={() => handleMarkRead(n.id)}
                            className="text-primary hover:bg-primary/10 px-2 py-1 rounded text-[10px] font-bold shrink-0"
                          >
                            확인
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══ 새 알림 팝업 ═══ */}
      <AnimatePresence>
        {popup && (() => {
          const style = typeStyles[popup.type];
          const TypeIcon = style.icon;
          return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-6" onClick={handlePopupDismiss}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                {/* Header with type color */}
                <div className={`px-5 py-4 ${style.bg} flex items-center gap-3`}>
                  <div className={`size-10 rounded-full bg-white/80 flex items-center justify-center ${style.color}`}>
                    <TypeIcon className="size-5" />
                  </div>
                  <div>
                    <p className={`text-[10px] font-bold uppercase ${style.color}`}>{style.label}</p>
                    <h3 className="font-bold text-slate-800">{popup.title}</h3>
                  </div>
                </div>

                {/* Message */}
                {popup.message && (
                  <div className="px-5 py-4">
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{popup.message}</p>
                    <p className="text-[10px] text-slate-400 mt-3">
                      {new Date(popup.created_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                )}

                {/* Buttons */}
                <div className="px-5 pb-5 flex gap-2">
                  <button
                    onClick={handlePopupDismiss}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-sm font-semibold hover:bg-slate-50"
                  >
                    닫기
                  </button>
                  <button
                    onClick={handlePopupConfirm}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white ${
                      popup.type === 'urgent' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'
                    }`}
                  >
                    확인
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </>
  );
}
