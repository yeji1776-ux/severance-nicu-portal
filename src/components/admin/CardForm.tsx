import { useState, useEffect, useRef } from 'react';
import { X, Save, Plus, Trash2, Upload, Pencil } from 'lucide-react';
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
  images: { url: string; position: 'top' | 'bottom' | 'inline'; size: 'small' | 'medium' | 'large' | 'full'; caption: string }[];
  tag: string;
}

interface CardFormProps {
  card: CardData | null;
  categoryId: number;
  existingTags: string[];
  onSave: (data: CardData) => void;
  onClose: () => void;
}

export default function CardForm({ card, categoryId, existingTags, onSave, onClose }: CardFormProps) {
  const [title, setTitle] = useState('');
  const [iconName, setIconName] = useState('FileText');
  const [content, setContent] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [links, setLinks] = useState<{ label: string; url: string }[]>([]);
  const [images, setImages] = useState<{ url: string; position: 'top' | 'bottom' | 'inline'; size: 'small' | 'medium' | 'large' | 'full'; caption: string }[]>([]);
  const [tag, setTag] = useState('');
  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [localTags, setLocalTags] = useState<string[]>([]);
  const allTags = [...new Set([...existingTags, ...localTags])];
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  async function handleFileUpload(index: number, file: File) {
    setUploading(index);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) { const err = await res.json(); alert(err.error || '업로드 실패'); return; }
      const { url } = await res.json();
      const next = [...images];
      next[index] = { ...next[index], url };
      setImages(next);
    } catch { alert('업로드 중 오류가 발생했습니다.'); }
    finally { setUploading(null); }
  }

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setIconName(card.icon_name);
      setContent(card.content);
      setWarnings(card.warnings || []);
      setAlerts(card.alerts || []);
      setLinks(card.links || []);
      setImages(card.images || []);
      setTag(card.tag || '');
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
      images: images.filter(img => img.url.trim()),
      tag: tag.trim(),
    });
  }

  function insertBold() {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.substring(start, end);
    const before = content.substring(0, start);
    const after = content.substring(end);

    if (selected) {
      // Toggle: if already bold, remove **
      if (selected.startsWith('**') && selected.endsWith('**')) {
        const unwrapped = selected.slice(2, -2);
        setContent(before + unwrapped + after);
        setTimeout(() => { ta.focus(); ta.setSelectionRange(start, start + unwrapped.length); }, 0);
      } else if (before.endsWith('**') && after.startsWith('**')) {
        // Selection is inside ** markers
        setContent(before.slice(0, -2) + selected + after.slice(2));
        setTimeout(() => { ta.focus(); ta.setSelectionRange(start - 2, end - 2); }, 0);
      } else {
        setContent(before + '**' + selected + '**' + after);
        setTimeout(() => { ta.focus(); ta.setSelectionRange(start, end + 4); }, 0);
      }
    } else {
      setContent(before + '**굵은 텍스트**' + after);
      setTimeout(() => { ta.focus(); ta.setSelectionRange(start + 2, start + 9); }, 0);
    }
  }

  function renderContent(text: string) {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-800">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  }

  function imgSizeClass(size: string) {
    switch (size) {
      case 'small': return 'w-1/4';
      case 'medium': return 'w-1/2';
      case 'large': return 'w-3/4';
      default: return 'w-full';
    }
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

              {/* Tag */}
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">그룹 분류</label>
                {showNewTag ? (
                  <div className="flex gap-2">
                    <input
                      value={newTagInput}
                      onChange={e => setNewTagInput(e.target.value)}
                      className="flex-1 border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="새 그룹 이름 입력"
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newTagInput.trim()) {
                          const t = newTagInput.trim();
                          setLocalTags(prev => prev.includes(t) ? prev : [...prev, t]);
                          setTag(t);
                          setShowNewTag(false);
                          setNewTagInput('');
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newTagInput.trim()) {
                          const t = newTagInput.trim();
                          setLocalTags(prev => prev.includes(t) ? prev : [...prev, t]);
                          setTag(t);
                        }
                        setShowNewTag(false);
                        setNewTagInput('');
                      }}
                      className="px-3 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90"
                    >
                      추가
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowNewTag(false); setNewTagInput(''); }}
                      className="px-3 py-2 border text-slate-500 text-xs rounded-xl hover:bg-slate-50"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={tag}
                      onChange={e => setTag(e.target.value)}
                      className="flex-1 border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                    >
                      <option value="">그룹 없음</option>
                      {allTags.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewTag(true)}
                      className="shrink-0 px-3 py-2 bg-primary/10 text-primary text-xs font-bold rounded-xl hover:bg-primary/20"
                    >
                      + 새 그룹
                    </button>
                    {tag && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            const newName = prompt('그룹 이름 수정', tag);
                            if (newName && newName.trim() && newName.trim() !== tag) {
                              const trimmed = newName.trim();
                              setLocalTags(prev => prev.map(t => t === tag ? trimmed : t));
                              setTag(trimmed);
                            }
                          }}
                          className="shrink-0 px-2 py-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                          title="그룹 이름 수정"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`"${tag}" 그룹을 삭제하시겠습니까?\n이 카드의 그룹이 해제됩니다.`)) {
                              setLocalTags(prev => prev.filter(t => t !== tag));
                              setTag('');
                            }
                          }}
                          className="shrink-0 px-2 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          title="그룹 삭제"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                )}
                <p className="text-[10px] text-slate-400 mt-1">같은 그룹의 카드끼리 묶어서 표시됩니다</p>
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-500">내용</label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={insertBold}
                      className="px-2 py-0.5 text-xs font-bold border rounded hover:bg-slate-100 transition-colors"
                      title="굵게 (선택 후 클릭)"
                    >
                      B
                    </button>
                  </div>
                </div>
                <textarea
                  ref={contentRef}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full h-48 border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed font-mono"
                  placeholder="카드 내용을 입력하세요... (**굵게** 가능)"
                />
                <p className="text-[10px] text-slate-400 mt-1">**텍스트** 형식으로 굵게 표시됩니다</p>
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

              {/* Images */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-500">이미지</label>
                  <button onClick={() => setImages([...images, { url: '', position: 'top', size: 'full', caption: '' }])} className="text-xs text-primary flex items-center gap-1">
                    <Plus className="size-3" /> 추가
                  </button>
                </div>
                {images.map((img, i) => (
                  <div key={i} className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex gap-2">
                      <input
                        value={img.url}
                        onChange={e => { const next = [...images]; next[i] = { ...next[i], url: e.target.value }; setImages(next); }}
                        className="flex-1 border rounded-lg px-3 py-1.5 text-xs outline-none"
                        placeholder="이미지 URL 또는 파일 업로드 →"
                      />
                      <label className={`shrink-0 px-2 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${uploading === i ? 'bg-slate-100 text-slate-400' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
                        {uploading === i ? '...' : <Upload className="size-3.5" />}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          className="hidden"
                          disabled={uploading === i}
                          onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(i, f); e.target.value = ''; }}
                        />
                      </label>
                      <button onClick={() => setImages(images.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 shrink-0">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <input
                      value={img.caption}
                      onChange={e => { const next = [...images]; next[i] = { ...next[i], caption: e.target.value }; setImages(next); }}
                      className="w-full border rounded-lg px-3 py-1.5 text-xs outline-none"
                      placeholder="이미지 설명 (선택)"
                    />
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-400 block mb-0.5">위치</label>
                        <select
                          value={img.position}
                          onChange={e => { const next = [...images]; next[i] = { ...next[i], position: e.target.value as any }; setImages(next); }}
                          className="w-full border rounded-lg px-2 py-1.5 text-xs outline-none bg-white"
                        >
                          <option value="top">상단</option>
                          <option value="inline">본문 중간</option>
                          <option value="bottom">하단</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-400 block mb-0.5">크기</label>
                        <select
                          value={img.size}
                          onChange={e => { const next = [...images]; next[i] = { ...next[i], size: e.target.value as any }; setImages(next); }}
                          className="w-full border rounded-lg px-2 py-1.5 text-xs outline-none bg-white"
                        >
                          <option value="small">작게 (25%)</option>
                          <option value="medium">중간 (50%)</option>
                          <option value="large">크게 (75%)</option>
                          <option value="full">전체</option>
                        </select>
                      </div>
                    </div>
                    {img.url && (
                      <img src={img.url} alt={img.caption} className="rounded-lg border max-h-24 object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                    )}
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
                    {/* Top images */}
                    {images.filter(img => img.url.trim() && img.position === 'top').map((img, i) => (
                      <div key={`top-${i}`} className={`${imgSizeClass(img.size)} mb-3 mx-auto`}>
                        <img src={img.url} alt={img.caption} className="rounded-lg w-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                        {img.caption && <p className="text-[10px] text-slate-400 text-center mt-1">{img.caption}</p>}
                      </div>
                    ))}
                    <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                      {renderContent(content) || '내용을 입력하면 여기에 표시됩니다...'}
                    </p>
                    {/* Inline images */}
                    {images.filter(img => img.url.trim() && img.position === 'inline').map((img, i) => (
                      <div key={`inline-${i}`} className={`${imgSizeClass(img.size)} my-3 mx-auto`}>
                        <img src={img.url} alt={img.caption} className="rounded-lg w-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                        {img.caption && <p className="text-[10px] text-slate-400 text-center mt-1">{img.caption}</p>}
                      </div>
                    ))}
                    {/* Bottom images */}
                    {images.filter(img => img.url.trim() && img.position === 'bottom').map((img, i) => (
                      <div key={`bottom-${i}`} className={`${imgSizeClass(img.size)} mt-3 mx-auto`}>
                        <img src={img.url} alt={img.caption} className="rounded-lg w-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                        {img.caption && <p className="text-[10px] text-slate-400 text-center mt-1">{img.caption}</p>}
                      </div>
                    ))}
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
