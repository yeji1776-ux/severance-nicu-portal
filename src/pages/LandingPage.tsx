import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ShieldCheck, Baby, HeartPulse, AlertTriangle, X, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DISMISS_KEY = 'disclaimer_dismissed_date';

function isDismissedToday(): boolean {
  const saved = localStorage.getItem(DISMISS_KEY);
  if (!saved) return false;
  return saved === new Date().toISOString().slice(0, 10);
}

function dismissForToday() {
  localStorage.setItem(DISMISS_KEY, new Date().toISOString().slice(0, 10));
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, guestEnter, logout } = useAuth();
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const handleEnter = () => {
    if (user && user.role === 'parent') {
      navigate('/dashboard');
      return;
    }
    // 오늘 하루 안보기 체크된 경우 바로 입장
    if (isDismissedToday()) {
      if (user) logout();
      guestEnter();
      navigate('/dashboard');
      return;
    }
    setShowDisclaimer(true);
  };

  const handleAccept = () => {
    if (user) logout();
    guestEnter();
    navigate('/dashboard');
  };

  const handleDismissToday = () => {
    dismissForToday();
    handleAccept();
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-blue-900">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBHjvzsSLOANx7ZMIpEEHoVKCdhH7wVyo-7WlR7E43wKaGU2fBd2Rswc1VHcAcbPDGYHtkHjTpBMIqjmxLPghNiHCKRxzav-Q5ZAkBVWqnwcJkV4MJYGQNaot47vys6U8tJzL23joIgfg2tjUu_UZXhxksLftzXzDJehJfrNCSvKCUhfbl1FNxbjorg-6nByTnydlBQPOVzmMenUp5X-uxilu1LL3Uxx18RW83cY67WoZJg-kBmEf-fyidO-Ybpgi_W11ARBN5mVrB8')",
          backgroundSize: 'cover'
        }}
      />

      <header className="flex items-center justify-between border-b border-white/10 px-4 md:px-6 py-3 md:py-4 relative z-10">
        <div className="flex items-center gap-2 md:gap-3 text-white">
          <HeartPulse className="size-6 md:size-8 text-white fill-white" />
          <h2 className="text-white text-base md:text-lg font-bold leading-tight tracking-tight">세브란스 NICU</h2>
        </div>
        <button
          onClick={() => navigate('/login?role=staff')}
          className="flex cursor-pointer items-center gap-1.5 overflow-hidden rounded-full h-9 md:h-10 px-3 md:px-5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs md:text-sm font-semibold transition-all"
        >
          <Settings className="size-3.5 md:size-4" />
          <span>관리자</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-[800px] w-full flex flex-col items-center text-center"
        >
          <div className="mb-6 md:mb-8 p-4 md:p-6 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
            <Baby className="size-10 md:size-16 text-white" strokeWidth={1} />
          </div>

          <h1 className="text-white tracking-tight text-4xl md:text-7xl font-bold leading-tight pb-3 md:pb-4">
            세브란스 NICU
          </h1>
          <p className="text-blue-100/80 text-sm md:text-xl font-medium max-w-lg leading-relaxed mb-8 md:mb-12 px-2">
            세상의 모든 아기들을 위한 정성 어린 보살핌. 신생아의 건강과 미래를 위해 헌신합니다.
          </p>

          <div className="flex flex-col items-center gap-4 md:gap-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEnter}
              className="group relative flex min-w-[200px] md:min-w-[240px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 md:h-16 px-6 md:px-8 bg-white text-primary text-base md:text-lg font-bold shadow-2xl shadow-primary/20 transition-transform duration-300"
            >
              <span className="truncate">입장하기</span>
              <ArrowRight className="ml-2 size-5 md:size-6 transition-transform group-hover:translate-x-1" />
            </motion.button>
            <div className="flex items-center gap-2 text-white/60 text-xs md:text-sm">
              <ShieldCheck className="size-3.5 md:size-4" />
              <span>안전한 의료 포털 접속</span>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="p-6 md:p-10 flex justify-center items-center relative z-10">
        <div className="flex gap-6 md:gap-8">
          <div className="w-10 md:w-16 h-1 bg-white/20 rounded-full"></div>
          <div className="w-10 md:w-16 h-1 bg-white/40 rounded-full"></div>
          <div className="w-10 md:w-16 h-1 bg-white/20 rounded-full"></div>
        </div>
      </footer>

      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/40 rounded-full blur-3xl"></div>

      {/* ═══ 경고 모달 ═══ */}
      <AnimatePresence>
        {showDisclaimer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
            onClick={() => setShowDisclaimer(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 모달 헤더 */}
              <div className="bg-red-50 px-5 py-4 flex items-start gap-3 border-b border-red-100">
                <div className="size-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="size-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-900">이용 안내 및 주의사항</h3>
                  <p className="text-xs text-red-600 font-medium mt-0.5">입장 전 반드시 확인해 주세요</p>
                </div>
                <button
                  onClick={() => setShowDisclaimer(false)}
                  className="size-8 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors shrink-0"
                >
                  <X className="size-4 text-slate-400" />
                </button>
              </div>

              {/* 모달 본문 */}
              <div className="px-5 py-4 space-y-3">
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100">
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    본 서비스는 <span className="text-primary font-bold">세브란스 NICU 입원 환아의 보호자</span>를 위한 전용 교육 자료입니다.
                  </p>
                </div>

                <ul className="space-y-2.5 px-1">
                  <li className="flex gap-2.5 text-sm text-slate-600">
                    <span className="text-red-500 font-bold mt-0.5">1.</span>
                    <span>본 콘텐츠의 <strong className="text-slate-800">무단 복제, 배포, 공유를 금지</strong>합니다.</span>
                  </li>
                  <li className="flex gap-2.5 text-sm text-slate-600">
                    <span className="text-red-500 font-bold mt-0.5">2.</span>
                    <span>SNS, 블로그, 커뮤니티 등 외부 <strong className="text-slate-800">유출을 엄격히 금지</strong>합니다.</span>
                  </li>
                  <li className="flex gap-2.5 text-sm text-slate-600">
                    <span className="text-red-500 font-bold mt-0.5">3.</span>
                    <span>의료 정보는 참고용이며, <strong className="text-slate-800">의료진의 직접 상담을 우선</strong>해 주세요.</span>
                  </li>
                </ul>

                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200/60 flex items-start gap-2">
                  <ShieldCheck className="size-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    위반 시 법적 책임이 발생할 수 있으며, 서비스 이용이 제한될 수 있습니다.
                  </p>
                </div>
              </div>

              {/* 모달 하단 버튼 */}
              <div className="px-5 pb-4 pt-1 flex flex-col gap-2">
                <button
                  onClick={handleAccept}
                  className="w-full h-11 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  동의하고 입장
                </button>
                <button
                  onClick={handleDismissToday}
                  className="w-full h-9 rounded-lg text-slate-400 text-xs font-medium hover:text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  오늘 하루 안보기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
