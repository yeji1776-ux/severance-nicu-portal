import { useState, useEffect, useCallback } from 'react';
import { Edit3, Bell, LogOut, Plus, Trash2, Pencil, GripVertical, Settings, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getIcon } from '../lib/iconMap';
import CategoryForm from '../components/admin/CategoryForm';
import CardForm from '../components/admin/CardForm';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ─── Types ──────────────────────────────────
interface Category {
  id: number;
  name: string;
  slug: string;
  icon_name: string;
  sort_order: number;
  is_journey_step: number;
  journey_step_order: number | null;
}

interface Module {
  id: number;
  title: string;
  icon_name: string;
  content: string;
  sort_order: number;
  warnings: string | null;
  alerts: string | null;
  links: string | null;
  images: string | null;
  tag: string | null;
  status: string;
  category_slug: string;
}

// ─── Sortable Card Item ──────────────────────
function SortableCardItem({
  module,
  onEdit,
  onDelete,
}: {
  module: Module;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = getIcon(module.icon_name);

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-xl shadow-sm border border-primary/5">
      <div className="p-3 flex items-center gap-3">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-slate-300 hover:text-slate-500 touch-none">
          <GripVertical className="size-4" />
        </button>
        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="size-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-sm text-slate-800 truncate">{module.title}</p>
            {module.tag && <span className="shrink-0 px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded">{module.tag}</span>}
          </div>
          <p className="text-[11px] text-slate-400 truncate">{(module.content || '').slice(0, 60)}{(module.content || '').length > 60 ? '...' : ''}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onEdit} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="수정">
            <Pencil className="size-3.5" />
          </button>
          <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="삭제">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────
export default function AdminEditor() {
  const navigate = useNavigate();
  const { logout, token, user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);
  const [showCategorySettings, setShowCategorySettings] = useState(false);

  const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ─── Data Fetching ──────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      const r = await fetch('/api/content/categories');
      const data = await r.json();
      setCategories(data);
      if (data.length > 0) {
        setActiveTab(prev => {
          // Keep current tab if still valid, otherwise pick first
          if (prev && data.find((c: Category) => c.id === prev)) return prev;
          return data[0].id;
        });
      }
    } catch {}
  }, []);

  const fetchModules = useCallback(async () => {
    if (!activeTab) return;
    const cat = categories.find(c => c.id === activeTab);
    if (!cat) return;
    try {
      const r = await fetch(`/api/content/modules?category=${cat.slug}`);
      const data = await r.json();
      setModules(data);
    } catch {}
  }, [activeTab, categories]);

  useEffect(() => {
    fetchCategories().then(() => setLoading(false));
  }, [fetchCategories]);

  useEffect(() => {
    if (activeTab) fetchModules();
  }, [activeTab, fetchModules]);

  // ─── Category CRUD ──────────────────────────
  async function handleSaveCategory(data: any) {
    if (data.id) {
      await fetch(`/api/content/categories/${data.id}`, { method: 'PUT', headers, body: JSON.stringify(data) });
    } else {
      await fetch('/api/content/categories', { method: 'POST', headers, body: JSON.stringify(data) });
    }
    setShowCategoryForm(false);
    setEditingCategory(null);
    await fetchCategories();
  }

  async function handleDeleteCategory(id: number) {
    const cat = categories.find(c => c.id === id);
    if (!confirm(`"${cat?.name}" 카테고리를 삭제하시겠습니까?`)) return;
    const r = await fetch(`/api/content/categories/${id}`, { method: 'DELETE', headers });
    if (!r.ok) {
      const err = await r.json();
      alert(err.error);
      return;
    }
    if (activeTab === id) setActiveTab(categories.find(c => c.id !== id)?.id ?? null);
    await fetchCategories();
  }

  // ─── Card CRUD ──────────────────────────────
  async function handleSaveCard(data: any) {
    const body = {
      ...data,
      warnings: data.warnings?.length ? data.warnings : null,
      alerts: data.alerts?.length ? data.alerts : null,
      links: data.links?.length ? data.links : null,
      images: data.images?.length ? data.images : null,
      tag: data.tag || null,
    };
    if (data.id) {
      await fetch(`/api/content/modules/${data.id}`, { method: 'PUT', headers, body: JSON.stringify(body) });
    } else {
      await fetch('/api/content/modules', { method: 'POST', headers, body: JSON.stringify(body) });
    }
    setShowCardForm(false);
    setEditingCard(null);
    await fetchModules();
  }

  async function handleDeleteCard(id: number) {
    if (!confirm('이 카드를 삭제하시겠습니까?')) return;
    await fetch(`/api/content/modules/${id}`, { method: 'DELETE', headers });
    await fetchModules();
  }

  // ─── Drag & Drop ──────────────────────────
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = modules.findIndex(m => m.id === active.id);
    const newIndex = modules.findIndex(m => m.id === over.id);
    const reordered = arrayMove(modules, oldIndex, newIndex);
    setModules(reordered);

    const items = reordered.map((m, i) => ({ id: m.id, sort_order: i + 1 }));
    await fetch('/api/content/modules/reorder', { method: 'PUT', headers, body: JSON.stringify({ items }) });
  }

  function openEditCard(mod: Module) {
    setEditingCard({
      id: mod.id,
      category_id: activeTab,
      title: mod.title,
      icon_name: mod.icon_name,
      content: mod.content || '',
      warnings: mod.warnings ? JSON.parse(mod.warnings) : [],
      alerts: mod.alerts ? JSON.parse(mod.alerts) : [],
      links: mod.links ? JSON.parse(mod.links) : [],
      images: mod.images ? JSON.parse(mod.images) : [],
      tag: mod.tag || '',
    });
    setShowCardForm(true);
  }

  const currentCategory = categories.find(c => c.id === activeTab);
  const CurrentCategoryIcon = currentCategory ? getIcon(currentCategory.icon_name) : null;

  if (loading) return <div className="flex items-center justify-center min-h-screen text-slate-400">불러오는 중...</div>;

  return (
    <div className="flex min-h-screen bg-[#f5f7f8]">
      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-primary/10 z-50 flex justify-around items-center h-16 px-2">
        <button className="flex flex-col items-center gap-1 text-primary">
          <Edit3 className="size-5" />
          <span className="text-[10px] font-medium">콘텐츠 관리</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500" onClick={() => navigate('/admin/notifications')}>
          <Bell className="size-5" />
          <span className="text-[10px] font-medium">알림 센터</span>
        </button>
      </nav>

      <main className="flex-1 pb-20">
        {/* Header */}
        <header className="h-14 md:h-20 bg-white/80 backdrop-blur-md border-b border-primary/10 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">콘텐츠 관리</h2>
            <p className="text-xs text-slate-400 hidden sm:block">
              카테고리와 카드를 관리합니다
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
              onClick={() => { logout(); window.location.href = '/'; }}
              title="로그아웃"
            >
              <LogOut className="size-5" />
            </button>
            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">A</div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-4xl mx-auto">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {categories.map(cat => {
                const CatIcon = getIcon(cat.icon_name);
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      activeTab === cat.id ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-primary'
                    }`}
                  >
                    <CatIcon className="size-3.5" />
                    {cat.name}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => { setEditingCategory(null); setShowCategoryForm(true); }}
              className="shrink-0 size-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors"
              title="카테고리 추가"
            >
              <Plus className="size-4" />
            </button>
          </div>

          {/* Current Category Info */}
          {currentCategory && (
            <div className="mb-4 bg-white rounded-xl border border-primary/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    {CurrentCategoryIcon && <CurrentCategoryIcon className="size-5 text-primary" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{currentCategory.name}</h3>
                    <p className="text-xs text-slate-400">
                      {modules.length}개 카드
                      {currentCategory.is_journey_step ? ` · 여정 ${currentCategory.journey_step_order}단계` : ''}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowCategorySettings(!showCategorySettings)}
                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <Settings className="size-4" />
                    <ChevronDown className="size-3 absolute -bottom-0.5 -right-0.5" />
                  </button>
                  {showCategorySettings && (
                    <div className="absolute right-0 top-full mt-1 bg-white border rounded-xl shadow-lg py-1 z-20 min-w-[140px]">
                      <button
                        onClick={() => {
                          setEditingCategory(currentCategory);
                          setShowCategoryForm(true);
                          setShowCategorySettings(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Pencil className="size-3.5" /> 수정
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteCategory(currentCategory.id);
                          setShowCategorySettings(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="size-3.5" /> 삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Card List with DnD */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {modules.map(mod => (
                  <SortableCardItem
                    key={mod.id}
                    module={mod}
                    onEdit={() => openEditCard(mod)}
                    onDelete={() => handleDeleteCard(mod.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {modules.length === 0 && activeTab && (
            <div className="text-center py-12 text-slate-400 text-sm">
              아직 카드가 없습니다
            </div>
          )}

          {/* Add Card Button */}
          {activeTab && (
            <button
              onClick={() => { setEditingCard(null); setShowCardForm(true); }}
              className="mt-4 w-full py-3 border-2 border-dashed border-primary/20 rounded-xl text-primary text-sm font-semibold hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="size-4" /> 카드 추가
            </button>
          )}
        </div>
      </main>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <CategoryForm
          category={editingCategory}
          onSave={handleSaveCategory}
          onClose={() => { setShowCategoryForm(false); setEditingCategory(null); }}
        />
      )}

      {/* Card Form Modal */}
      {showCardForm && activeTab && (
        <CardForm
          card={editingCard}
          categoryId={activeTab}
          onSave={handleSaveCard}
          onClose={() => { setShowCardForm(false); setEditingCard(null); }}
        />
      )}
    </div>
  );
}
