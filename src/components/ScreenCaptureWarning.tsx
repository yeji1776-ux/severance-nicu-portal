import { useEffect } from 'react';
import { useScreenCaptureProtection } from '../hooks/useScreenCaptureProtection';

export default function ScreenCaptureWarning() {
  const { showWarning, dismissWarning } = useScreenCaptureProtection();

  // 3초 후 자동 닫기
  useEffect(() => {
    if (showWarning) {
      const timer = setTimeout(dismissWarning, 4000);
      return () => clearTimeout(timer);
    }
  }, [showWarning, dismissWarning]);

  if (!showWarning) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={dismissWarning}
    >
      <div
        className="mx-4 max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 경고 아이콘 */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <h2 className="mb-2 text-lg font-bold text-gray-900">📵 캡쳐 금지</h2>
        <p className="mb-1 text-sm text-gray-700 font-medium">
          이 화면은 병원 내부 정보를 포함하고 있습니다.
        </p>
        <p className="mb-4 text-sm text-gray-500">
          스크린샷 및 화면 캡쳐는 금지되어 있습니다.
          <br />
          무단 캡쳐 및 배포 시 법적 책임이 따를 수 있습니다.
        </p>

        <button
          onClick={dismissWarning}
          className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
        >
          확인했습니다
        </button>
      </div>
    </div>
  );
}
