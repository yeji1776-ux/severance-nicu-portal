import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#f5f7f8] p-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="size-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="size-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">오류가 발생했습니다</h2>
            <p className="text-sm text-slate-500 mb-6">
              페이지를 불러오는 중 문제가 발생했습니다. 새로고침을 시도해 주세요.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold text-sm mx-auto hover:bg-primary/90 transition-all"
            >
              <RefreshCw className="size-4" /> 새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
