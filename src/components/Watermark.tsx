import { useAuth } from '../context/AuthContext';

export default function Watermark() {
  const { user } = useAuth();
  if (!user) return null;

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
  const label = `${user.name} · ${today}`;

  // 격자 형태로 반복되는 워터마크 타일 생성
  const tiles = Array.from({ length: 40 });

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9990] overflow-hidden select-none"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(10, 1fr)',
        }}
      >
        {tiles.map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-center"
          >
            <span
              style={{
                transform: 'rotate(-30deg)',
                fontSize: '11px',
                fontWeight: 500,
                color: 'rgba(0,0,0,0.04)',
                whiteSpace: 'nowrap',
                letterSpacing: '0.05em',
                userSelect: 'none',
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
