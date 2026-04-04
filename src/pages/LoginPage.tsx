import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { HeartPulse, ArrowLeft, Lock, Mail, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isStaff = searchParams.get('role') === 'staff';
  const { user, login, logout } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user && user.role === 'admin') {
    navigate('/admin', { replace: true });
    return null;
  }

  if (!isStaff) {
    navigate('/', { replace: true });
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 입력해 주세요.');
      return;
    }

    setLoading(true);
    try {
      if (user) logout();
      const loggedInUser = await login(email.trim(), password);
      navigate(loggedInUser.role === 'admin' ? '/admin' : '/', { replace: true });
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
          <span className="font-bold text-sm md:text-base">세브란스 병원</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
                <Lock className="size-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">관리자 로그인</h1>
              <p className="text-sm text-slate-500 mt-1">부서 관리자 계정으로 로그인하세요</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">이메일</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 text-sm"
                    placeholder="admin-nicu@severance.com"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">비밀번호</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 text-sm"
                    placeholder="비밀번호"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim() || !password.trim()}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 text-sm"
              >
                {loading ? '로그인 중...' : '로그인'}
              </button>
            </form>

            <div className="mt-5 p-3 bg-slate-50 rounded-lg">
              <p className="text-[10px] text-slate-400 font-semibold mb-1.5">테스트 계정</p>
              <div className="space-y-1 text-[11px] text-slate-500">
                <p>NICU: <span className="font-mono text-slate-600">admin-nicu@severance.com</span></p>
                <p>정형외과: <span className="font-mono text-slate-600">admin-ortho@severance.com</span></p>
                <p>CCU: <span className="font-mono text-slate-600">admin-ccu@severance.com</span></p>
                <p>소아응급: <span className="font-mono text-slate-600">admin-er@severance.com</span></p>
                <p className="text-slate-400 mt-1">비밀번호: password123</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
