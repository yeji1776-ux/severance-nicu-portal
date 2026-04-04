import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { getIcon } from '../../lib/iconMap';
import IconPicker from './IconPicker';

interface CardData {
  id?: number;
  category_id: number;
  title: string;
  icon_name: string;
  content: string;
  warnings: string[];
  alerts: string[];
  links: { label: string; url: string }[];
}

interface CardFormProps {
  card: CardData | null;
  categoryId: number;
  onSave: (data: CardData) => void;
  onClose: () => void;
}

export default function CardForm({ card, categoryId, onSave, onClose }: CardFormProps) {
  const [title, setTitle] = useState('');
  const [iconName, setIconName] = useState('FileText');
  const [content, setContent] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [links, setLinks] = useState<{ label: string; url: string }[]>([]);
  const [showIconPicker, setShowIconPicker] = useState(false);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setIconName(card.icon_name);
      setContent(card.content);
      setWarnings(card.warnings || []);
      setAlerts(card.alerts || []);
      setLinks(card.links || []);
    }
  }, [card]);

  function handleSubmit() {
    if (!title.trim()) return;
    onSave({
      id: card?.id,
      category_id: categoryId,
      title: title.trim(),
      icon_name: iconName,
      content,
      warnings: warnings.filter(w => w.trim()),
      alerts: alerts.filter(a => a.trim()),
      links: links.filter(l => l.label.trim() && l.url.trim()),
    });
  }

  const Icon = getIcon(iconName);

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4">
        <div className="bg-white w-full md:max-w-5xl md:rounded-2xl shadow-2xl flex flex-col max-h-[95vh] rounded-t-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h3 className="font-bold text-slate-800">
              {card ? '카드 수정' : '새 카드 추가'}
            </h3>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
              <X className="size-5" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            {/* Left: Form */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 md:border-r border-slate-100">
              {/* Title & Icon */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowIconPicker(true)}
                  className="shrink-0 size-12 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                  title="아이콘 변경"
                >
                  <Icon className="size-6 text-primary" />
                </button>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="flex-1 border rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="카드 제목"
                />
              </div>

              {/* Content */}
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">내용</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full h-48 border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed"
                  placeholder="카드 내용을 입력하세요..."
                />
              </div>

              {/* Warnings */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-500">경고 메시지</label>
                  <button onClick={() => setWarnings([...warnings, ''])} className="text-xs text-primary flex items-center gap-1">
                    <Plus className="size-3" /> 추가
                  </button>
                </div>
                {warnings.map((w, i) => (
                  <div key={i} className="flex gap-2 mb-1.5">
                    <input
                      value={w}
                      onChange={e => { const next = [...warnings]; next[i] = e.target.value; setWarnings(next); }}
                      className="flex-1 border rounded-lg px-3 py-1.5 text-xs outline-none"
                      placeholder="경고 내용..."
                    />
                    <button onClick={() => setWarnings(warnings.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Alerts */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-500">알림 메시지</label>
                  <button onClick={() => setAlerts([...alerts, ''])} className="text-xs text-primary flex items-center gap-1">
                    <Plus className="size-3" /> 추가
                  </button>
                </div>
                {alerts.map((a, i) => (
                  <div key={i} className="flex gap-2 mb-1.5">
                    <input
                      value={a}
                      onChange={e => { const next = [...alerts]; next[i] = e.target.value; setAlerts(next); }}
                      className="flex-1 border rounded-lg px-3 py-1.5 text-xs outline-none"
                      placeholder="알림 내용..."
                    />
                    <button onClick={() => setAlerts(alerts.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Links */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-500">외부 링크</label>
                  <button onClick={() => setLinks([...links, { label: '', url: '' }])} className="text-xs text-primary flex items-center gap-1">
                    <Plus className="size-3" /> 추가
                  </button>
                </div>
                {links.map((l, i) => (
                  <div key={i} className="flex gap-2 mb-1.5">
                    <input
                      value={l.label}
                      onChange={e => { const next = [...links]; next[i] = { ...next[i], label: e.target.value }; setLinks(next); }}
                      className="flex-1 border rounded-lg px-3 py-1.5 text-xs outline-none"
                      placeholder="링크 제목"
                    />
                    <input
                      value={l.url}
                      onChange={e => { const next = [...links]; next[i] = { ...next[i], url: e.target.value }; setLinks(next); }}
                      className="flex-1 border rounded-lg px-3 py-1.5 text-xs outline-none"
                      placeholder="URL"
                    />
                    <button onClick={() => setLinks(links.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Live Preview */}
            <div className="hidden md:flex md:w-[380px] flex-col bg-slate-50 overflow-y-auto">
              <div className="px-4 py-3 border-b bg-white">
                <p className="text-xs font-bold text-slate-500">보호자 화면 미리보기</p>
              </div>
              <div className="p-4">
                {/* Card preview matching ParentDashboard style */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                  {/* Card header */}
                  <div className="p-4 flex items-center gap-3 border-b border-slate-50">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">{title || '카드 제목'}</h4>
                  </div>
                  {/* Card content */}
                  <div className="p-4">
                    <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                      {content || '내용을 입력하면 여기에 표시됩니다...'}
                    </p>
                  </div>
                  {/* Warnings */}
                  {warnings.filter(w => w.trim()).length > 0 && (
                    <div className="mx-4 mb-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs font-bold text-amber-700 mb-1">⚠ 주의사항</p>
                      {warnings.filter(w => w.trim()).map((w, i) => (
                        <p key={i} className="text-xs text-amber-600">{w}</p>
                      ))}
                    </div>
                  )}
                  {/* Alerts */}
                  {alerts.filter(a => a.trim()).length > 0 && (
                    <div className="mx-4 mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs font-bold text-blue-700 mb-1">ℹ 알림</p>
                      {alerts.filter(a => a.trim()).map((a, i) => (
                        <p key={i} className="text-xs text-blue-600">{a}</p>
                      ))}
                    </div>
                  )}
                  {/* Links */}
                  {links.filter(l => l.label.trim()).length > 0 && (
                    <div className="mx-4 mb-4 space-y-1.5">
                      {links.filter(l => l.label.trim()).map((l, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-primary font-medium">
                          <span>🔗</span>
                          <span className="underline">{l.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Mobile indicator */}
                <p className="text-[10px] text-slate-400 text-center mt-3">보호자에게 이렇게 보입니다</p>
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="px-5 py-4 border-t flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50">
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="size-4" />
              저장
            </button>
          </div>
        </div>
      </div>

      {showIconPicker && (
        <IconPicker
          value={iconName}
          onChange={setIconName}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </>
  );
}
