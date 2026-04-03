import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { getIcon } from '../../lib/iconMap';
import IconPicker from './IconPicker';

interface Category {
  id?: number;
  name: string;
  slug: string;
  icon_name: string;
  is_journey_step: number;
  journey_step_order: number | null;
}

interface CategoryFormProps {
  category: Category | null; // null = new
  onSave: (data: Category) => void;
  onClose: () => void;
}

export default function CategoryForm({ category, onSave, onClose }: CategoryFormProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [iconName, setIconName] = useState('FileText');
  const [isJourneyStep, setIsJourneyStep] = useState(false);
  const [journeyOrder, setJourneyOrder] = useState<number | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setIconName(category.icon_name);
      setIsJourneyStep(!!category.is_journey_step);
      setJourneyOrder(category.journey_step_order);
    }
  }, [category]);

  function handleNameChange(val: string) {
    setName(val);
    if (!category) {
      setSlug(val.replace(/[^a-zA-Z0-9가-힣]/g, '-').toLowerCase());
    }
  }

  function handleSubmit() {
    if (!name.trim() || !slug.trim()) return;
    onSave({
      id: category?.id,
      name: name.trim(),
      slug: slug.trim(),
      icon_name: iconName,
      is_journey_step: isJourneyStep ? 1 : 0,
      journey_step_order: isJourneyStep ? journeyOrder : null,
    });
  }

  const Icon = getIcon(iconName);

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4">
        <div className="bg-white w-full md:max-w-lg md:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] rounded-t-2xl">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h3 className="font-bold text-slate-800">
              {category ? '카테고리 수정' : '새 카테고리 추가'}
            </h3>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
              <X className="size-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">카테고리 이름</label>
              <input
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="예: NICU 소개"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">슬러그 (URL용)</label>
              <input
                value={slug}
                onChange={e => setSlug(e.target.value)}
                className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                placeholder="nicu-intro"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">아이콘</label>
              <button
                onClick={() => setShowIconPicker(true)}
                className="flex items-center gap-3 border rounded-xl px-4 py-2.5 w-full hover:bg-slate-50 transition-colors"
              >
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="size-5 text-primary" />
                </div>
                <span className="text-sm text-slate-600">{iconName}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isJourneyStep}
                  onChange={e => setIsJourneyStep(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span className="text-sm text-slate-600">여정 단계에 포함</span>
              </label>
              {isJourneyStep && (
                <input
                  type="number"
                  value={journeyOrder ?? ''}
                  onChange={e => setJourneyOrder(e.target.value ? Number(e.target.value) : null)}
                  className="w-16 border rounded-lg px-2 py-1 text-sm text-center outline-none"
                  placeholder="순서"
                  min={1}
                />
              )}
            </div>
          </div>

          <div className="px-5 py-4 border-t flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50">
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={!name.trim() || !slug.trim()}
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
