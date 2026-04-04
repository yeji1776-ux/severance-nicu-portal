import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HeartPulse, X, Settings, UserPlus, LogIn, Hash, User, Hospital } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDepartments } from '../api/endpoints';
import { getIcon } from '../lib/iconMap';
import type { Department } from '../types';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, registerParent, loginParent, setCurrentDepartment } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [chartNumber, setChartNumber] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  useEffect(() => {
    getDepartments().then(setDepartments).catch(console.error);
  }, []);

  const handleLogin = async () => {
    setError('');
    if (!chartNumber.trim()) {
      setError('등록번호를 입력해 주세요.');
      return;
    }
    setLoading(true);
    try {
      await loginParent(chartNumber.trim());
      setShowAuthModal(false);
      if (selectedDept) {
        setCurrentDepartment(selectedDept.slug);
      }
      navigate(selectedDept ? `/dept/${selectedDept.slug}/dashboard` : '/dashboard');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    if (!chartNumber.trim() || !name.trim()) {
      setError('등록번호와 이름을 모두 입력해 주세요.');
      return;
    }
    setLoading(true);
    try {
      await registerParent(chartNumber.trim(), name.trim());
      setShowAuthModal(false);
      if (selectedDept) {
        setCurrentDepartment(selectedDept.slug);
      }
      navigate(selectedDept ? `/dept/${selectedDept.slug}/dashboard` : '/dashboard');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (authMode === 'login') handleLogin();
    else handleRegister();
  };

  const switchMode = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setError('');
    setChartNumber('');
    setName('');
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
          <h2 className="text-white text-base md:text-lg font-bold leading-tight tracking-tight">세브란스 병원</h2>
        </div>
        <button
          onClick={() => navigate('/login?role=staff')}
          className="flex cursor-pointer items-center gap-1.5 overflow-hidden rounded-full h-9 md:h-10 px-3 md:px-5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs md:text-sm font-semibold transition-all"
        >
          <Settings className="size-3.5 md:size-4" />
          <span>관리자</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-[800px] w-full flex flex-col items-center text-center py-6"
        >
          <div className="mb-6 md:mb-8 p-4 md:p-6 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
            <Hospital className="size-10 md:size-16 text-white" strokeWidth={1} />
          </div>

          <h1 className="text-white tracking-tight text-4xl md:text-7xl font-bold leading-tight pb-3 md:pb-4">
            세브란스 보호자 포털
          </h1>
          <p className="text-blue-100/80 text-sm md:text-xl font-medium max-w-lg leading-relaxed mb-8 md:mb-12 px-2">
            진료과를 선택해 주세요
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full max-w-2xl px-4">
            {departments.map(dept => {
              const IconComponent = getIcon(dept.icon_name);
              return (
                <motion.button
                  key={dept.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (user && user.role === 'parent') {
                      setCurrentDepartment(dept.slug);
                      navigate(`/dept/${dept.slug}/dashboard`);
                      return;
                    }
                    setSelectedDept(dept);
                    setShowAuthModal(true);
                  }}
                  className="flex flex-col items-center gap-3 p-5 md:p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all text-white text-center cursor-pointer"
                  style={{ borderColor: `${dept.theme_color}40` }}
                >
                  <div className="p-3 rounded-full" style={{ backgroundColor: `${dept.theme_color}20` }}>
                    <IconComponent className="size-7 md:size-8" style={{ color: dept.theme_color }} />
                  </div>
                  <h3 className="text-base md:text-lg font-bold">{dept.name}</h3>
                  <p className="text-xs md:text-sm text-white/70 leading-relaxed">{dept.description}</p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </main>

      <footer className="p-6 md:p-10 flex flex-col items-center gap-3 relative z-10">
        <div className="flex gap-6 md:gap-8">
          <div className="w-10 md:w-16 h-1 bg-white/20 rounded-full"></div>
          <div className="w-10 md:w-16 h-1 bg-white/40 rounded-full"></div>
          <div className="w-10 md:w-16 h-1 bg-white/20 rounded-full"></div>
        </div>
        <p className="text-white/40 text-[11px] font-medium tracking-widest uppercase">Made by SMART HOSPITAL TEAM</p>
      </footer>

      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/40 rounded-full blur-3xl"></div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
            onClick={() => setShowAuthModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-5 py-4 flex items-center justify-between" style={{ backgroundColor: selectedDept?.theme_color || '#004085' }}>
                <h3 className="text-base font-bold text-white">
                  {selectedDept?.name} {authMode === 'login' ? '로그인' : '회원가입'}
                </h3>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="size-8 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <X className="size-4 text-white" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-100">
                <button
                  onClick={() => switchMode('login')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-colors ${authMode === 'login' ? 'text-primary border-b-2 border-primary' : 'text-slate-400'}`}
                >
                  <LogIn className="size-4" /> 로그인
                </button>
                <button
                  onClick={() => switchMode('register')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-colors ${authMode === 'register' ? 'text-primary border-b-2 border-primary' : 'text-slate-400'}`}
                >
                  <UserPlus className="size-4" /> 회원가입
                </button>
              </div>

              {/* Form */}
              <div className="px-5 py-4 space-y-3">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* 등록번호 입력 (로그인 & 회원가입 공통) */}
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-1">등록번호</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      type="text"
                      value={chartNumber}
                      onChange={e => setChartNumber(e.target.value)}
                      placeholder={selectedDept?.slug === 'nicu' ? '아기 등록번호를 입력해 주세요' : '환자 등록번호를 입력해 주세요'}
                      autoFocus
                      className="w-full border border-slate-200 rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 placeholder:text-slate-300 bg-white"
                      onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    간호사에게 안내받은 등록번호를 입력하세요.
                    <br />
                    <span className="text-slate-300">테스트용 번호: 0561528</span>
                  </p>
                </div>

                {/* 이름 입력 (회원가입만) */}
                {authMode === 'register' && (
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-1">이름</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="이름을 입력해 주세요"
                        className="w-full border border-slate-200 rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 placeholder:text-slate-300 bg-white"
                        onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      출생신고를 완료한 경우 <strong className="text-slate-500">아기 이름</strong>으로,{'\n'}
                      아직 출생신고 전이라면 <strong className="text-slate-500">산모 이름</strong>으로 등록해 주세요.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="px-5 pb-5 pt-1">
                <button
                  onClick={handleSubmit}
                  disabled={
                    authMode === 'login'
                      ? !chartNumber.trim() || loading
                      : !chartNumber.trim() || !name.trim() || loading
                  }
                  className="w-full h-11 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? '처리 중...' : authMode === 'login' ? '로그인' : '회원가입 후 입장'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
