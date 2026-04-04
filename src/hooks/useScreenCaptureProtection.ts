import { useEffect, useState } from 'react';

export function useScreenCaptureProtection() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');

      // PrintScreen (Windows/Linux)
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        setShowWarning(true);
        return;
      }

      // macOS 스크린샷 단축키: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5, Cmd+Shift+6
      if (isMac && e.metaKey && e.shiftKey && ['3', '4', '5', '6'].includes(e.key)) {
        e.preventDefault();
        setShowWarning(true);
        return;
      }

      // Windows Snipping Tool: Win+Shift+S (감지만 가능, 차단 불가)
      if (!isMac && e.shiftKey && e.key === 'S' && e.metaKey) {
        setShowWarning(true);
        return;
      }
    };

    // 화면 공유 / 화면 녹화 감지
    const handleVisibilityChange = () => {
      // 탭이 숨겨졌다가 돌아올 때 알림 (화면 전환 캡쳐 시도 추정)
      // 너무 민감할 수 있으므로 주석 처리
      // if (document.hidden) { ... }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const dismissWarning = () => setShowWarning(false);

  return { showWarning, dismissWarning };
}
