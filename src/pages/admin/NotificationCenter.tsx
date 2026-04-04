import { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Bell, AlertTriangle, Info, X } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { useApi } from '../../hooks/useApi';
import { broadcastNotification } from '../../api/endpoints';
import { api } from '../../api/client';

export default function NotificationCenter() {
  const [showSendForm, setShowSendForm] = useState(false);

  // Get audit logs for notification history
  const { data: logs } = useApi(
    () => api.get<any[]>('/admin/notifications/history').catch(() => []),
    []
  );

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6 md:mb-8">
          <div className="min-w-0">
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">알림 센터</h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1">보호자에게 알림을 발송하고 관리합니다.</p>
          </div>
          <button
            onClick={() => setShowSendForm(true)}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shrink-0"
          >
            <Send className="size-4" /> <span className="hidden sm:inline">알림 발송</span><span className="sm:hidden">발송</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <QuickAction
            icon={Info}
            label="일반 알림"
            desc="일반 정보 전달"
            color="bg-blue-50 text-blue-600"
            onClick={() => setShowSendForm(true)}
          />
          <QuickAction
            icon={Bell}
            label="일정 알림"
            desc="검진/면회 일정 안내"
            color="bg-amber-50 text-amber-600"
            onClick={() => setShowSendForm(true)}
          />
          <QuickAction
            icon={AlertTriangle}
            label="긴급 알림"
            desc="긴급 공지사항"
            color="bg-red-50 text-red-600"
            onClick={() => setShowSendForm(true)}
          />
        </div>

        {/* Recent Notifications Info */}
        <div className="bg-white rounded-xl border border-primary/5 shadow-sm p-4 md:p-6">
          <h3 className="font-bold text-sm md:text-base mb-4">최근 발송 내역</h3>
          <div className="text-sm text-slate-500 text-center py-8">
            알림 발송 기록이 여기에 표시됩니다.
          </div>
        </div>

        {/* Send Modal */}
        {showSendForm && (
          <SendNotificationModal onClose={() => setShowSendForm(false)} />
        )}
      </div>
    </AdminLayout>
  );
}

function QuickAction({ icon: Icon, label, desc, color, onClick }: {
  icon: any; label: string; desc: string; color: string; onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="bg-white rounded-xl p-3 md:p-5 shadow-sm border border-primary/5 text-left hover:border-primary/20 transition-all"
    >
      <div className={`size-8 md:size-10 rounded-lg ${color} flex items-center justify-center mb-2 md:mb-3`}>
        <Icon className="size-4 md:size-5" />
      </div>
      <h4 className="font-bold text-xs md:text-sm">{label}</h4>
      <p className="text-[10px] md:text-xs text-slate-500 hidden sm:block">{desc}</p>
    </motion.button>
  );
}

function SendNotificationModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'urgent'>('info');
  const [sendMode, setSendMode] = useState<'now' | 'scheduled'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // Default scheduled date/time to now + 1 hour
  useState(() => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    setScheduledDate(d.toISOString().slice(0, 10));
    setScheduledTime(d.toTimeString().slice(0, 5));
  });

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const scheduled_at = sendMode === 'scheduled' && scheduledDate && scheduledTime
        ? `${scheduledDate}T${scheduledTime}:00`
        : undefined;
      await broadcastNotification({ title, message, type, scheduled_at });
      setSent(true);
      setTimeout(onClose, 1500);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  const typeColors = {
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', label: '일반' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: '주의' },
    urgent: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: '긴급' },
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold">알림 발송</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X className="size-5" /></button>
        </div>

        {sent ? (
          <div className="text-center py-8">
            <div className="size-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
              <Send className="size-8" />
            </div>
            <p className="font-bold text-green-700">
              {sendMode === 'scheduled' ? '알림이 예약되었습니다!' : '알림이 발송되었습니다!'}
            </p>
            {sendMode === 'scheduled' && (
              <p className="text-sm text-slate-500 mt-1">{scheduledDate} {scheduledTime}</p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">유형</label>
              <div className="grid grid-cols-3 gap-2">
                {(['info', 'warning', 'urgent'] as const).map(t => {
                  const c = typeColors[t];
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                        type === t
                          ? `${c.bg} ${c.border} ${c.text}`
                          : 'border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {t === 'info' ? '📋 일반' : t === 'warning' ? '⚠️ 주의' : '🚨 긴급'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">제목</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                placeholder="알림 제목"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">내용</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
                rows={3}
                placeholder="알림 내용을 입력하세요"
                required
              />
            </div>

            {/* Send mode toggle */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">발송 시간</label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setSendMode('now')}
                  className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                    sendMode === 'now'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-slate-200 text-slate-400'
                  }`}
                >
                  즉시 발송
                </button>
                <button
                  type="button"
                  onClick={() => setSendMode('scheduled')}
                  className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                    sendMode === 'scheduled'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-slate-200 text-slate-400'
                  }`}
                >
                  예약 발송
                </button>
              </div>
              {sendMode === 'scheduled' && (
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    required
                  />
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={e => setScheduledTime(e.target.value)}
                    className="w-28 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    required
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 font-bold rounded-xl transition-all disabled:opacity-50 text-sm ${
                type === 'urgent'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              {loading
                ? '처리 중...'
                : sendMode === 'scheduled'
                  ? `${scheduledDate} ${scheduledTime} 예약 발송`
                  : '전체 보호자에게 즉시 발송'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
