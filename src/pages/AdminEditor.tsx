import { useState, useMemo } from 'react';
import {
  Search,
  LogOut,
  Edit3,
  Bell,
  FileText,
  History,
  Eye,
  Filter,
  Download,
  Pencil,
  Rocket,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { getContentCategories, getContentModules, getContentStats, createModule, updateModule, deleteModule, bulkPublishModules } from '../api/endpoints';

export default function AdminEditor() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const { data: categories } = useApi(() => getContentCategories(), []);
  const { data: modules, refetch: refetchModules } = useApi(
    () => getContentModules(activeCategory ? { category: activeCategory } : undefined),
    [activeCategory]
  );
  const { data: stats, refetch: refetchStats } = useApi(() => getContentStats().catch(() => null), []);

  const filteredModules = useMemo(() => {
    let result = modules || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((m: any) =>
        m.title.toLowerCase().includes(q) || m.subtitle?.toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      result = result.filter((m: any) => m.status === statusFilter);
    }
    return result;
  }, [modules, searchQuery, statusFilter]);

  const activeCategoryName = activeCategory
    ? categories?.find((c: any) => c.slug === activeCategory)?.name || activeCategory
    : '전체';

  const typeLabel = (type: string) => {
    switch(type) {
      case 'interactive': return '대화형';
      case 'video': return '동영상';
      case 'text': return '텍스트';
      default: return type;
    }
  };

  const typeColor = (type: string) => {
    switch(type) {
      case 'interactive': return 'bg-blue-100 text-blue-800';
      case 'video': return 'bg-purple-100 text-purple-800';
      case 'text': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusLabel = (status: string) => {
    switch(status) {
      case 'published': return '게시됨';
      case 'review': return '검토 중';
      case 'draft': return '초안';
      default: return status;
    }
  };

  const statusColor = (status: string) => {
    switch(status) {
      case 'published': return 'text-green-600';
      case 'review': return 'text-amber-600';
      case 'draft': return 'text-slate-500';
      default: return 'text-slate-600';
    }
  };

  async function handleDelete(id: number) {
    if (!confirm('이 모듈을 삭제하시겠습니까?')) return;
    try {
      await deleteModule(id);
      refetchModules();
      refetchStats();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleBulkPublish() {
    const reviewCount = modules?.filter((m: any) => m.status === 'review').length || 0;
    if (reviewCount === 0) {
      alert('검토 중인 모듈이 없습니다.');
      return;
    }
    if (!confirm(`${reviewCount}개의 검토 중인 모듈을 모두 게시하시겠습니까?`)) return;
    setPublishing(true);
    try {
      const result = await bulkPublishModules();
      alert(`${result.published}개 모듈이 게시되었습니다.`);
      refetchModules();
      refetchStats();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPublishing(false);
    }
  }

  function handleDownload() {
    const data = filteredModules.map((m: any) => ({
      제목: m.title,
      부제: m.subtitle,
      카테고리: m.category_name,
      형식: typeLabel(m.type),
      상태: statusLabel(m.status),
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modules_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex min-h-screen bg-[#f5f7f8]">
      {/* Bottom Nav for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-primary/10 z-50 flex justify-around items-center h-16 px-2">
        <button className="flex flex-col items-center gap-1 text-primary">
          <Edit3 className="size-5" />
          <span className="text-[10px] font-medium">콘텐츠 편집기</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500" onClick={() => navigate('/admin/notifications')}>
          <Bell className="size-5" />
          <span className="text-[10px] font-medium">알림 센터</span>
        </button>
      </nav>

      <main className="flex-1 pb-20">
        <header className="h-14 md:h-20 bg-white/80 backdrop-blur-md border-b border-primary/10 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="콘텐츠 검색..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg" onClick={() => { logout(); window.location.href = '/'; }} title="로그아웃"><LogOut className="size-5" /></button>
            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              A
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">콘텐츠 편집기</h2>
                  <p className="text-xs md:text-sm text-slate-500 mt-1 hidden sm:block">부모님을 위한 교육 콘텐츠를 관리하고 업데이트하세요.</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shrink-0"
                >
                  <Plus className="size-4" /> <span className="hidden sm:inline">새 모듈</span><span className="sm:hidden">추가</span>
                </button>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`flex-none px-6 py-2 rounded-lg text-xs font-semibold transition-all ${!activeCategory ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-primary'}`}
                >
                  전체
                </button>
                {(categories || []).map((cat: any) => (
                  <button
                    key={cat.slug}
                    onClick={() => setActiveCategory(cat.slug)}
                    className={`flex-none px-6 py-2 rounded-lg text-xs font-semibold transition-all ${activeCategory === cat.slug ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-primary'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { label: '전체 섹션', val: stats?.totalModules ? `${stats.totalModules}개 모듈` : `${modules?.length || 0}개 모듈`, icon: FileText, color: 'bg-blue-100 text-blue-600' },
              { label: '마지막 업데이트', val: stats?.lastUpdate ? new Date(stats.lastUpdate).toLocaleDateString('ko-KR') : '방금 전', icon: History, color: 'bg-amber-100 text-amber-600' },
              { label: '공개 상태', val: stats?.published ? `${stats.published}개 게시됨` : '활성', icon: Eye, color: 'bg-green-100 text-green-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-primary/5">
                <div className="flex items-center gap-3">
                  <div className={`size-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                    <p className="text-lg font-bold">{stat.val}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-primary/5 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-primary/10 flex items-center justify-between">
              <h3 className="font-bold text-sm md:text-base">
                {activeCategoryName} 모듈 콘텐츠
                {statusFilter && <span className="ml-2 text-xs font-normal text-slate-500">({statusLabel(statusFilter)})</span>}
              </h3>
              <div className="flex gap-2 relative">
                <div className="relative">
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className={`p-2 border rounded-lg hover:bg-slate-50 ${statusFilter ? 'border-primary bg-primary/5' : 'border-slate-200'}`}
                  >
                    <Filter className="size-4" />
                  </button>
                  {showFilterDropdown && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 w-36 py-1">
                      <button
                        onClick={() => { setStatusFilter(null); setShowFilterDropdown(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${!statusFilter ? 'text-primary font-bold' : ''}`}
                      >
                        전체
                      </button>
                      {['published', 'review', 'draft'].map(s => (
                        <button
                          key={s}
                          onClick={() => { setStatusFilter(s); setShowFilterDropdown(false); }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${statusFilter === s ? 'text-primary font-bold' : ''}`}
                        >
                          {statusLabel(s)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleDownload}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                  title="JSON 다운로드"
                >
                  <Download className="size-4" />
                </button>
              </div>
            </div>

            {/* Mobile: Card Layout */}
            <div className="md:hidden divide-y divide-primary/5">
              {filteredModules.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-slate-400">
                  {searchQuery || statusFilter ? '검색 결과가 없습니다.' : '모듈이 없습니다.'}
                </div>
              ) : (
                filteredModules.map((mod: any) => (
                  <div key={mod.id} className="p-4 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{mod.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">{mod.subtitle}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] text-slate-400">{mod.category_name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeColor(mod.type)}`}>
                          {typeLabel(mod.type)}
                        </span>
                        <span className={`text-[11px] font-bold ${statusColor(mod.status)}`}>
                          {statusLabel(mod.status)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setEditingModule(mod)}
                        className="text-slate-400 hover:text-primary p-1.5"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(mod.id)}
                        className="text-slate-400 hover:text-red-500 p-1.5"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop: Table Layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-primary/10">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">제목 / 주제</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">카테고리</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">형식</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">상태</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {filteredModules.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">
                        {searchQuery || statusFilter ? '검색 결과가 없습니다.' : '모듈이 없습니다.'}
                      </td>
                    </tr>
                  ) : (
                    filteredModules.map((mod: any) => (
                      <tr key={mod.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{mod.title}</span>
                            <span className="text-[10px] text-slate-500">{mod.subtitle}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-600">{mod.category_name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeColor(mod.type)}`}>
                            {typeLabel(mod.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold ${statusColor(mod.status)}`}>
                            {statusLabel(mod.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditingModule(mod)}
                              className="text-slate-400 hover:text-primary p-1"
                              title="편집"
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(mod.id)}
                              className="text-slate-400 hover:text-red-500 p-1"
                              title="삭제"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 md:p-6 border-t border-primary/10 flex items-center justify-between">
              <span className="text-xs text-slate-500">총 {filteredModules.length}개 모듈</span>
            </div>
          </div>

          <div className="mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-white p-5 md:p-8 rounded-xl shadow-sm border border-primary/5">
              <h4 className="font-bold text-sm md:text-base mb-4">모듈 상태 및 사용 현황</h4>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span>게시됨</span>
                    <span className="font-bold">
                      {modules ? `${modules.filter((m: any) => m.status === 'published').length}/${modules.length}` : '-'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: modules?.length ? `${(modules.filter((m: any) => m.status === 'published').length / modules.length) * 100}%` : '0%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span>검토 중</span>
                    <span className="font-bold">
                      {modules ? `${modules.filter((m: any) => m.status === 'review').length}/${modules.length}` : '-'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: modules?.length ? `${(modules.filter((m: any) => m.status === 'review').length / modules.length) * 100}%` : '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary text-white p-5 md:p-8 rounded-xl shadow-lg relative overflow-hidden group">
              <div className="relative z-10">
                <span className="inline-block px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-semibold mb-2 uppercase">빠른 작업</span>
                <h4 className="text-xl font-bold mb-2">업데이트 게시</h4>
                <p className="text-white/80 text-xs mb-6">
                  {modules ? `${modules.filter((m: any) => m.status === 'review').length}개의 검토 중인 모듈이 있습니다.` : '로딩 중...'}
                </p>
                <button
                  onClick={handleBulkPublish}
                  disabled={publishing}
                  className="w-full bg-white text-primary py-3 rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50"
                >
                  {publishing ? '배포 중...' : '검토 및 배포'}
                </button>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Rocket className="size-24" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Create Module Modal */}
      {showCreateModal && (
        <CreateModuleModal
          categories={categories || []}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); refetchModules(); refetchStats(); }}
        />
      )}

      {/* Edit Module Modal */}
      {editingModule && (
        <EditModuleModal
          module={editingModule}
          categories={categories || []}
          onClose={() => setEditingModule(null)}
          onSaved={() => { setEditingModule(null); refetchModules(); refetchStats(); }}
        />
      )}
    </div>
  );
}

function CreateModuleModal({ categories, onClose, onCreated }: { categories: any[]; onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 1);
  const [type, setType] = useState<'text' | 'video' | 'interactive'>('text');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createModule({ title, subtitle, category_id: categoryId, type, status: 'draft' });
      onCreated();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">새 모듈 만들기</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X className="size-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">부제</label>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">카테고리</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            >
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">형식</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            >
              <option value="text">텍스트</option>
              <option value="video">동영상</option>
              <option value="interactive">대화형</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 text-sm"
          >
            {loading ? '생성 중...' : '모듈 생성'}
          </button>
        </form>
      </div>
    </div>
  );
}

function EditModuleModal({ module: mod, categories, onClose, onSaved }: { module: any; categories: any[]; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(mod.title);
  const [subtitle, setSubtitle] = useState(mod.subtitle || '');
  const [type, setType] = useState(mod.type);
  const [status, setStatus] = useState(mod.status);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateModule(mod.id, { title, subtitle, type, status, content: mod.content });
      onSaved();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">모듈 편집</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X className="size-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">부제</label>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">형식</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            >
              <option value="text">텍스트</option>
              <option value="video">동영상</option>
              <option value="interactive">대화형</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">상태</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            >
              <option value="draft">초안</option>
              <option value="review">검토 중</option>
              <option value="published">게시됨</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 text-sm"
          >
            {loading ? '저장 중...' : '변경사항 저장'}
          </button>
        </form>
      </div>
    </div>
  );
}
