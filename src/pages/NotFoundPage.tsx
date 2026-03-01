import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f5f7f8] p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-primary/20 mb-4">404</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">페이지를 찾을 수 없습니다</h1>
        <p className="text-sm text-slate-500 mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 border border-primary/20 text-primary rounded-xl text-sm font-semibold hover:bg-primary/5 transition-all"
          >
            <ArrowLeft className="size-4" /> 뒤로 가기
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            <Home className="size-4" /> 홈으로
          </button>
        </div>
      </div>
    </div>
  );
}
