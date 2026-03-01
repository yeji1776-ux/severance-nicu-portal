import {
  Bell,
  LayoutDashboard,
  FileText,
  Heart,
  ChevronRight,
  Info,
  Lightbulb,
  Hospital,
  Stethoscope,
  Microscope,
  ActivitySquare,
  Home,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { getNotices } from '../api/endpoints';
import NotificationBell from '../components/NotificationBell';

const journeySteps = [
  { id: 1, label: '입원 안내', sub: '초기 적응 단계', icon: Stethoscope },
  { id: 2, label: '검사 프로세스', sub: '정밀 진단 및 모니터링', icon: Microscope },
  { id: 3, label: '수술 전후 주의사항', sub: '집중 케어 단계', icon: ActivitySquare },
  { id: 4, label: '퇴원 준비', sub: '교육 및 자가 간호', icon: Home },
  { id: 5, label: '퇴원 후 관리', sub: '외래 및 추적 관찰', icon: Heart },
];

const examGuides = [
  { name: '청력 선별 검사', desc: '퇴원 전 시행되는 필수 검사입니다. 수면 중 진행되며 통증이 없습니다.' },
  { name: '뇌 초음파 검사', desc: '정기적인 신경학적 발달을 확인합니다. 대천문을 통해 비침습적으로 시행됩니다.' },
  { name: '미숙아 망막증 검사', desc: '미숙아의 시력 발달을 확인하는 안과 검사입니다.' },
  { name: '신생아 대사 이상 검사', desc: '선천성 대사 이상 질환을 조기 발견하기 위한 선별 검사입니다.' },
];

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: notices } = useApi(() => getNotices(5), []);

  return (
    <div className="min-h-screen bg-[#f5f7f8] pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-primary/10 bg-white/80 backdrop-blur-md px-4 py-3 md:px-20 md:py-4 lg:px-40">
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer min-w-0" onClick={() => navigate('/')}>
          <div className="flex items-center justify-center size-9 md:size-10 rounded-lg bg-primary text-accent-yellow shrink-0">
            <Hospital className="size-5 md:size-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-primary text-base md:text-xl font-bold leading-tight tracking-tight truncate">Severance NICU</h1>
            <p className="text-slate-500 text-[10px] md:text-xs font-medium uppercase tracking-wider">보호자 포털</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <NotificationBell />
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-full border-2 border-primary/20 p-1 md:pr-4 hover:border-primary/40 transition-all"
          >
            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="text-sm font-semibold text-primary hidden md:inline">{user?.name || '보호자'}</span>
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row px-4 md:px-20 lg:px-40 py-4 md:py-8 gap-4 md:gap-8">
        {/* Sidebar — horizontal on mobile, vertical on desktop */}
        <aside className="w-full lg:w-72 flex flex-col gap-4 md:gap-6">
          <div className="bg-white rounded-xl p-3 md:p-6 shadow-sm border border-primary/5">
            <div className="flex lg:flex-col gap-2 md:gap-4">
              <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg bg-primary text-white flex-1 lg:flex-none">
                <LayoutDashboard className="size-4 md:size-5" />
                <span className="font-semibold text-sm md:text-base">대시보드</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg text-slate-600 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer flex-1 lg:flex-none" onClick={() => navigate('/manual')}>
                <BookOpen className="size-4 md:size-5" />
                <span className="font-medium text-sm md:text-base">퇴원 매뉴얼</span>
              </div>
            </div>
          </div>

          <div className="bg-primary rounded-xl p-4 md:p-6 shadow-lg relative overflow-hidden hidden md:block">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Heart className="size-24 text-white" />
            </div>
            <div className="relative z-10">
              <h3 className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">NICU CARE GUIDE</h3>
              <p className="text-white text-xl font-black mb-4">함께하는 치료 여정</p>
              <p className="text-white/90 text-sm leading-relaxed">입원부터 퇴원까지, 보호자가 알아야 할 모든 것을 안내합니다.</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col gap-4 md:gap-8">
          {/* Journey Section */}
          <section className="bg-white rounded-xl p-4 md:p-8 shadow-sm border border-primary/5">
            <div className="flex items-start md:items-center justify-between mb-4 md:mb-8 gap-3">
              <div>
                <h2 className="text-lg md:text-2xl font-black text-primary">NICU 치료 여정 안내</h2>
                <p className="text-slate-500 text-xs md:text-base">입원부터 퇴원까지 5단계 과정을 확인하세요</p>
              </div>
              <span className="px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-accent-yellow/20 text-primary text-[10px] md:text-sm font-bold border border-accent-yellow/30 shrink-0">
                전체 프로세스
              </span>
            </div>

            {/* Mobile: vertical list */}
            <div className="flex flex-col gap-3 md:hidden">
              {journeySteps.map((step) => (
                <div key={step.id} className="flex items-center gap-3">
                  <div className="size-10 rounded-full flex items-center justify-center shadow-md ring-2 ring-white bg-primary text-white shrink-0">
                    <step.icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">{step.label}</p>
                    <p className="text-[11px] text-slate-400">{step.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: horizontal timeline */}
            <div className="relative mt-12 mb-8 hidden md:block">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-primary/10 -translate-y-1/2"></div>
              <div className="flex justify-between relative z-10">
                {journeySteps.map((step) => (
                  <div key={step.id} className="flex flex-col items-center gap-3">
                    <div className="size-12 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white bg-primary text-white">
                      <step.icon className="size-6" />
                    </div>
                    <div className="text-center max-w-[100px]">
                      <p className="text-sm font-bold text-primary">{step.label}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{step.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-4 md:mt-12 pt-4 md:pt-8 border-t border-primary/5">
              <div className="bg-primary/5 p-3 md:p-4 rounded-lg flex items-start gap-3">
                <Info className="size-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-primary">입원 초기 안내</p>
                  <p className="text-xs text-slate-600">입원 초기에는 아이의 안정화가 최우선입니다. 전문 의료진이 24시간 모니터링하며 면회 시간에 맞춰 방문해 주세요.</p>
                </div>
              </div>
              <div className="bg-accent-yellow/10 p-3 md:p-4 rounded-lg flex items-start gap-3 border border-accent-yellow/20">
                <Lightbulb className="size-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-primary">보호자 TIP</p>
                  <p className="text-xs text-slate-600">캥거루 케어(피부 접촉)는 아이의 안정과 발달에 매우 효과적입니다. 면회 시 간호팀에 문의해 보세요.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 주요 검사 안내 */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-primary/5">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="font-bold text-sm md:text-base text-primary flex items-center gap-2">
                <FileText className="size-4 md:size-5" /> NICU 주요 검사 안내
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {examGuides.map((exam, i) => (
                <div key={i} className="p-3 md:p-4 border border-slate-100 rounded-lg hover:border-primary/20 transition-all">
                  <p className="text-sm font-bold text-primary mb-1">{exam.name}</p>
                  <p className="text-xs text-slate-500">{exam.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notices */}
          <section className="bg-white rounded-xl p-4 md:p-8 shadow-sm border border-primary/5">
            <h3 className="font-bold text-sm md:text-base text-primary mb-4 md:mb-6 flex items-center gap-2">
              <Bell className="size-4 md:size-5" /> 공지 및 안내 사항
            </h3>
            <div className="space-y-3 md:space-y-4">
              {(notices || []).slice(0, 5).map((notice: any) => (
                <div key={notice.id} className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-slate-50 border border-primary/5 hover:border-primary/20 cursor-pointer transition-all gap-3">
                  <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <div className="size-9 md:size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] leading-tight text-center px-1 shrink-0">
                      {new Date(notice.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{notice.title}</p>
                      <p className="text-xs text-slate-500 truncate">{notice.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="size-5 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      <footer className="mt-auto py-6 md:py-8 px-4 md:px-20 lg:px-40 border-t border-primary/5 bg-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <Hospital className="size-5 md:size-6 text-primary/40 shrink-0" />
            <p className="text-[10px] md:text-xs text-slate-500">연세대학교 의료원 - 세브란스 신생아 중환자실(NICU) 보호자 지원 시스템</p>
          </div>
          <div className="flex gap-4 md:gap-6 text-[10px] md:text-xs font-bold">
            <span className="text-slate-400">개인정보 처리방침</span>
            <span className="text-slate-400">고객 센터: 02-2228-0000</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
