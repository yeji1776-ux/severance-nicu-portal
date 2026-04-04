import { useState, useEffect } from 'react';

const STORAGE_KEY = 'captureNotice';

function shouldShow(): boolean {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return true;

  const data = JSON.parse(raw);
  if (data.neverShow) return false;
  if (data.hideUntil && Date.now() < data.hideUntil) return false;
  return true;
}

export default function CaptureNoticeModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (shouldShow()) setVisible(true);
  }, []);

  if (!visible) return null;

  const handleToday = () => {
    const tomorrow = new Date();
    tomorrow.setHours(23, 59, 59, 999);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ hideUntil: tomorrow.getTime() }));
    setVisible(false);
  };

  const handleNever = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ neverShow: true }));
    setVisible(false);
  };

  const handleClose = () => setVisible(false);

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="bg-[#004085] px-6 pt-6 pb-5 text-white text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold">개인정보 보호 안내</h2>
          <p className="mt-1 text-sm text-blue-100">본 앱 이용 전 꼭 확인해 주세요</p>
        </div>

        {/* 본문 */}
        <div className="px-6 py-5">
          <p className="mb-4 text-sm text-gray-600 text-center leading-relaxed">
            이 앱은 <span className="font-semibold text-gray-900">병원 내부 정보</span>를 포함하고 있습니다.<br />
            아래 행위는 엄격히 금지되어 있습니다.
          </p>

          <ul className="space-y-2.5 mb-5">
            {[
              { icon: '📵', text: '화면 캡처 및 스크린샷' },
              { icon: '🔗', text: '링크 또는 내용 외부 공유' },
              { icon: '📋', text: '내용 복사 및 무단 전재' },
              { icon: '🎥', text: '화면 녹화 및 촬영' },
            ].map(({ icon, text }) => (
              <li key={text} className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-2.5">
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-medium text-red-800">{text}</span>
              </li>
            ))}
          </ul>

          {/* 추적 안내 */}
          <div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex gap-2.5 items-start">
            <span className="text-base mt-0.5">🔍</span>
            <p className="text-xs text-amber-800 leading-relaxed">
              <span className="font-semibold">모든 화면에는 접속자 정보가 워터마크로 표시됩니다.</span><br />
              캡처된 이미지로도 누가 찍었는지 추적이 가능하며, 위반 시 개인정보보호법에 따라 법적 책임이 따를 수 있습니다.
            </p>
          </div>

          {/* 버튼 */}
          <div className="space-y-2">
            <button
              onClick={handleClose}
              className="w-full rounded-xl bg-[#004085] px-4 py-3 text-sm font-semibold text-white hover:bg-[#003070] transition-colors"
            >
              확인했습니다
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleToday}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                오늘 하루 안보기
              </button>
              <button
                onClick={handleNever}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                다시 보지 않기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
