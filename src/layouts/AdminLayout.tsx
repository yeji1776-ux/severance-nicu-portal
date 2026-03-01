import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Edit3, Bell, Search, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/admin', icon: Edit3, label: '콘텐츠 편집기' },
  { path: '/admin/notifications', icon: Bell, label: '알림 센터' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-[#f5f7f8]">
      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-primary/10 z-50 flex justify-around items-center h-16 px-2">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 ${active ? 'text-primary' : 'text-slate-500'}`}
            >
              <item.icon className="size-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <main className="flex-1 pb-20">
        <header className="h-14 md:h-20 bg-white/80 backdrop-blur-md border-b border-primary/10 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="검색..."
                type="text"
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
        {children}
      </main>
    </div>
  );
}
