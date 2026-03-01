import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Baby, HeartPulse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

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
          className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-9 md:h-10 px-4 md:px-6 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs md:text-sm font-semibold transition-all"
        >
          <span>교직원 로그인</span>
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
              onClick={() => {
                if (user) {
                  navigate(user.role === 'admin' ? '/admin' : '/dashboard');
                } else {
                  navigate('/login');
                }
              }}
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
    </div>
  );
}
