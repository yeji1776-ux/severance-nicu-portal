import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { HeartPulse, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isStaff = searchParams.get('role') === 'staff';
  const { user, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in — redirect
  if (user) {
    navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(email, password);
      navigate(loggedInUser.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-gradient-to-br from-primary via-primary/90 to-blue-900">
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/40 rounded-full blur-3xl"></div>

      <header className="flex items-center justify-between border-b border-white/10 px-4 md:px-6 py-3 md:py-4 relative z-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-5" />
          <span className="text-xs md:text-sm font-medium">돌아가기</span>
        </button>
        <div className="flex items-center gap-2 text-white">
          <HeartPulse className="size-5 md:size-6" />
          <span className="font-bold text-sm md:text-base">세브란스 NICU</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
                <LogIn className="size-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                {isStaff ? '교직원 로그인' : '보호자 로그인'}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {isStaff
                  ? '관리자 계정으로 로그인해 주세요.'
                  : '병원에서 발급받은 계정으로 로그인해 주세요.'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm"
                  placeholder="비밀번호 입력"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 text-sm"
              >
                {loading ? '로그인 중...' : '로그인'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 text-center">
                계정이 없으신가요? 담당 간호사에게 문의해 주세요.
              </p>
            </div>

            {/* Demo credentials hint */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs text-blue-600 font-medium mb-1">테스트 계정</p>
              <p className="text-xs text-blue-500">보호자: parent@test.com / password123</p>
              <p className="text-xs text-blue-500">관리자: admin@severance.com / password123</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
