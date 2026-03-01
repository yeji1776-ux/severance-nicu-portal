import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { HeartPulse, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STAFF_CODE = '1885';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isStaff = searchParams.get('role') === 'staff';
  const { user, login, logout } = useAuth();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in — redirect (but not guest users trying to access staff login)
  if (user && !(user.id === 0 && isStaff)) {
    navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    return null;
  }

  // 비밀번호가 아닌 경우 보호자는 랜딩으로
  if (!isStaff) {
    navigate('/', { replace: true });
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (code !== STAFF_CODE) {
      setError('비밀번호가 올바르지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      if (user && user.id === 0) logout();
      const loggedInUser = await login('admin@severance.com', 'password123');
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
          className="w-full max-w-sm"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
                <Lock className="size-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">관리자 인증</h1>
              <p className="text-sm text-slate-500 mt-1">비밀번호를 입력해 주세요</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-center text-2xl tracking-[0.5em] font-bold"
                  placeholder="····"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length < 4}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 text-sm"
              >
                {loading ? '인증 중...' : '로그인'}
              </button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
