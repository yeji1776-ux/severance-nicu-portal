import { useState, type ElementType } from 'react';
import {
  Lightbulb,
  Hospital,
  Stethoscope,
  HeartPulse,
  Home,
  Phone,
  FileText,
  LogOut,
  QrCode,
  MessageCircleQuestion,
  ClipboardList,
  Clock,
  ShieldCheck,
  Droplets,
  Baby,
  Wind,
  Apple,
  Microscope,
  HandHeart,
  GraduationCap,
  ActivitySquare,
  Car,
  Thermometer,
  Calendar,
  Brain,
  Syringe,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─── 타입 ───────────────────────────────────
type TabId = 'admission' | 'treatment' | 'discharge' | 'outpatient' | 'video' | 'qna';

interface CategoryTab {
  id: TabId;
  label: string;
  icon: ElementType;
}

// ─── 카테고리 탭 정의 ───────────────────────
const categoryTabs: CategoryTab[] = [
  { id: 'admission', label: '입원·면회', icon: Stethoscope },
  { id: 'treatment', label: '치료', icon: HeartPulse },
  { id: 'discharge', label: '퇴원', icon: Home },
  { id: 'outpatient', label: '외래·검사', icon: ClipboardList },
  { id: 'video', label: '영상', icon: QrCode },
  { id: 'qna', label: 'Q&A', icon: MessageCircleQuestion },
];

// ─── 여정 단계 (4단계) ──────────────────────
const journeySteps = [
  { id: 1, label: '입원' },
  { id: 2, label: '치료' },
  { id: 3, label: '퇴원준비' },
  { id: 4, label: '퇴원 후' },
];

// ─── 탭별 콘텐츠 데이터 ─────────────────────
const admissionContent = {
  title: '입원 안내 및 면회 규정',
  description: 'NICU는 감염 예방을 위해 면회가 제한됩니다. 아래 안내 사항을 꼭 확인해 주세요.',
  tip: '',
  cards: [
    { title: '입원 수속 장소 안내', desc: '▸ 평일 08:30~17:30 (점심시간 포함)\n어린이병원 4층 입·퇴원 창구\nTel. 02-2228-5946\n\n▸ 토요일 13:30~17:30 / 공휴일 08:30~17:30\n본관 3층 입원 원무팀 1, 2번 창구\nTel. 02-2228-7000', icon: Hospital },
    { title: '면회 시간 안내', desc: '매일 2회, 각 30분\n\n▸ 오후 1:00 ~ 1:30\n▸ 오후 6:00 ~ 6:30\n\n보호자 2인까지 면회 가능합니다.', icon: Clock },
    { title: '면회 시 준비사항', desc: '▸ 손 소독 필수\n▸ 면회복(가운) 착용 — NICU 입구에서 제공\n▸ 휴대폰 사용 자제\n▸ 향수·화장품 등 강한 향 자제', icon: ShieldCheck },
    { title: '감염 관리 수칙', desc: '아래 증상이 있으면 면회가 제한됩니다.\n\n▸ 발열 (37.5°C 이상)\n▸ 기침, 콧물, 인후통\n▸ 설사, 구토\n\n유행성 감염 시기에는 면회 제한이 더 강화될 수 있습니다.', icon: Thermometer },
    { title: '모유 보관 안내', desc: '▸ 냉장 보관: 24시간 이내\n▸ 냉동 보관: 3개월 이내\n\n용기에 아이 이름, 유축 날짜·시간을 꼭 기재해 주세요.', icon: Droplets },
  ],
};

const treatmentContent = {
  title: 'NICU 주요 치료 및 검사',
  description: '아이의 상태에 따라 다양한 치료와 검사가 진행됩니다. 궁금한 사항은 담당 의료진에게 문의해 주세요.',
  tip: '',
  cards: [
    { title: '호흡 관리', desc: '아이의 호흡 상태에 따라 적절한 보조가 제공됩니다.\n\n▸ 인공호흡기 (Ventilator)\n▸ CPAP (지속적 양압 호흡)\n▸ 비강 캐뉼라 산소 치료', icon: Wind },
    { title: '영양 관리', desc: '▸ 초기: 정맥 영양(TPN)으로 시작\n▸ 이후: 모유 또는 분유 수유로 전환\n▸ 체중 증가를 매일 모니터링합니다\n\n모유 수유가 가장 권장됩니다.', icon: Apple },
    { title: '주요 검사', desc: '정기적으로 시행되는 검사 항목:\n\n▸ 뇌 초음파 검사\n▸ 청력 선별 검사\n▸ 미숙아 망막증 검사 (안과)\n▸ 신생아 대사이상 선별 검사', icon: Microscope },
    { title: '캥거루 케어', desc: '아이를 보호자 가슴 위에 올려 피부 접촉을 하는 방법입니다.\n\n▸ 체온·심박수 안정에 효과적\n▸ 모유 수유 촉진\n▸ 의료진과 상의 후 시행 가능', icon: HandHeart },
  ],
};

const dischargeContent = {
  title: '퇴원 준비 안내',
  description: '퇴원 전 보호자 교육을 반드시 이수해 주세요. 안전한 퇴원을 위해 아래 항목을 확인하세요.',
  tip: '',
  cards: [
    { title: '퇴원 전 교육', desc: '아래 항목의 필수 교육을 이수해야 합니다.\n\n▸ 수유 방법 (모유·분유)\n▸ 목욕 및 피부 관리\n▸ 투약 방법\n▸ 응급 상황 대처법 (CPR 포함)', icon: GraduationCap },
    { title: '퇴원 전 검사', desc: '퇴원 전 아래 검사가 완료되어야 합니다.\n\n▸ 청력 선별 검사\n▸ 안과 검사 (미숙아 망막증)\n▸ 뇌 초음파 검사\n▸ 신생아 대사이상 검사', icon: ActivitySquare },
    { title: '카시트 준비', desc: '퇴원 시 카시트 착용은 필수입니다.\n\n▸ 신생아 전용 카시트를 미리 준비\n▸ 후방 장착으로 설치\n▸ 퇴원 전 장착 연습을 권장합니다', icon: Car },
    { title: '가정 환경 준비', desc: '▸ 실내 온도: 22~24°C\n▸ 실내 습도: 50~60%\n▸ 환기를 자주 하되 직접 바람 금지\n▸ 반려동물 접촉 제한\n▸ 방문객 제한 (퇴원 초기)', icon: Home },
  ],
};

const outpatientContent = {
  title: '퇴원 후 외래 및 검사 안내',
  description: '퇴원 후에도 정기적인 외래 진료와 발달 추적 검사가 필요합니다.',
  tip: '',
  cards: [
    { title: '외래 진료 일정', desc: '▸ 퇴원 후 1~2주 내 첫 외래 방문\n▸ 이후 담당 교수님 지시에 따라 정기 방문\n\n외래 방문 시 수유량, 체중 변화, 특이 사항을 메모해 오시면 진료에 도움이 됩니다.', icon: Calendar },
    { title: '발달 추적 검사', desc: '교정 연령 기준으로 평가합니다.\n\n▸ 베일리 발달 검사\n▸ 덴버 발달 선별 검사\n▸ 미숙아는 만 3세까지 추적 관찰', icon: Brain },
    { title: '예방 접종', desc: '출생 체중과 교정 연령에 따라 일정이 달라질 수 있습니다.\n\n▸ 접종 전 담당 의료진과 반드시 상의\n▸ RSV(호흡기세포융합바이러스) 예방주사 확인', icon: Syringe },
    { title: '응급 상황 기준', desc: '아래 증상 시 즉시 응급실을 방문하세요.\n\n▸ 38°C 이상 발열\n▸ 수유 거부 또는 현저한 수유량 감소\n▸ 호흡 곤란 (빠른 호흡, 끙끙거림)\n▸ 지속적인 구토·설사', icon: AlertTriangle },
  ],
};

const qrContents = [
  { title: 'NICU 입원절차 안내 동영상', desc: '신생아집중치료실 입원 수속 및 절차 안내', url: 'https://youtu.be/jaQg__TteOI' },
  { title: '손씻기 교육 영상', desc: 'NICU 면회 전 올바른 손씻기 방법', url: 'https://www.youtube.com/watch?v=example1' },
  { title: '모유 보관법 안내', desc: '모유 유축, 보관, 해동 방법', url: 'https://www.youtube.com/watch?v=example2' },
  { title: '캥거루 케어 방법', desc: '피부 접촉의 효과와 올바른 방법', url: 'https://www.youtube.com/watch?v=example3' },
  { title: '퇴원 후 아기 돌봄', desc: '목욕, 수유, 수면 환경 안내', url: 'https://www.youtube.com/watch?v=example4' },
  { title: '신생아 심폐소생술(CPR)', desc: '응급 시 신생아 CPR 방법', url: 'https://www.youtube.com/watch?v=example5' },
];

const qnaContents = [
  { question: '면회 시간을 놓쳤는데 다른 시간에 방문할 수 있나요?', answer: '감염 관리와 아이의 안정을 위해 지정된 면회 시간 외에는 방문이 어렵습니다. 부득이한 사정이 있으시면 담당 간호사에게 미리 문의해 주세요.' },
  { question: '모유가 잘 나오지 않는데 어떻게 하나요?', answer: '출산 후 초기에는 소량이 정상입니다. 2~3시간마다 유축을 하면 분비량이 늘어납니다. 병원 내 모유 수유 상담실을 이용하실 수 있습니다.' },
  { question: '아이가 인큐베이터에 있는 이유가 무엇인가요?', answer: '인큐베이터는 아이의 체온, 습도, 산소 농도를 일정하게 유지해줍니다. 미숙아나 저체중아는 스스로 체온 조절이 어려워 인큐베이터가 필요합니다.' },
  { question: '퇴원은 언제쯤 가능한가요?', answer: '일반적으로 ① 스스로 체온 유지 ② 자발 호흡 안정 ③ 경구 수유로 충분한 체중 증가, 이 세 가지 조건이 충족되면 퇴원을 준비합니다. 개인차가 크므로 담당 의료진과 상의하세요.' },
  { question: '형제·자매나 조부모도 면회가 가능한가요?', answer: '감염 예방을 위해 부모 외 면회는 제한됩니다. 형제·자매(만 12세 미만 소아), 조부모 등은 NICU 면회가 불가합니다. 유행성 감염 시기에는 더 엄격하게 제한될 수 있습니다.' },
];

// ─── 메인 컴포넌트 ──────────────────────────
export default function ParentDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('admission');
  const [currentJourneyStep] = useState(1);

  // 하단 네비 클릭 핸들러
  const handleBottomNav = (id: string) => {
    const tabMap: Record<string, TabId> = {
      admission: 'admission',
      treatment: 'treatment',
      discharge: 'discharge',
      outpatient: 'outpatient',
      video: 'video',
      qna: 'qna',
    };
    if (tabMap[id]) {
      setActiveTab(tabMap[id]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f8] pb-20 max-w-lg mx-auto relative">
      {/* ═══ 헤더 ═══ */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-primary/10 bg-white/95 backdrop-blur-md px-4 py-3">
        <div className="flex items-center gap-2 cursor-pointer min-w-0" onClick={() => navigate('/')}>
          <div className="flex items-center justify-center size-9 rounded-lg bg-primary text-accent-yellow shrink-0">
            <Hospital className="size-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-primary text-base font-bold leading-tight tracking-tight truncate">Severance NICU</h1>
            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">보호자 포털</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); window.location.href = '/'; }}
          className="flex items-center justify-center rounded-full size-9 bg-primary/5 text-primary hover:bg-primary/10 transition-colors shrink-0"
        >
          <LogOut className="size-4" />
        </button>
      </header>

      {/* ═══ 서브헤더 ═══ */}
      <div className="bg-primary px-4 py-4">
        <h2 className="text-white text-lg font-bold">보호자 가이드</h2>
        <p className="text-white/70 text-xs mt-0.5">입원부터 퇴원까지, 우리 아이를 위한 안내</p>
      </div>

      {/* ═══ 여정 프로그레스 바 ═══ */}
      <div className="bg-white px-4 py-5 border-b border-slate-100">
        <p className="text-sm font-bold text-slate-700 mb-3">우리 아이의 여정</p>
        <div className="flex items-center justify-between relative">
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200" />
          <div
            className="absolute top-4 left-6 h-0.5 bg-primary transition-all duration-500"
            style={{ width: `${((currentJourneyStep - 1) / (journeySteps.length - 1)) * (100 - (12 / 3.5))}%` }}
          />
          {journeySteps.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-1.5 relative z-10">
              <div
                className={`size-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step.id <= currentJourneyStep
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {step.id}
              </div>
              <span
                className={`text-[11px] font-medium ${
                  step.id <= currentJourneyStep ? 'text-primary' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ 카테고리 탭 ═══ */}
      <div className="bg-white border-b border-slate-100 overflow-x-auto no-scrollbar">
        <div className="flex px-2 py-2 gap-1 min-w-max">
          {categoryTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <tab.icon className="size-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ 탭 콘텐츠 영역 ═══ */}
      <div className="px-4 py-4 space-y-4">
        {activeTab === 'admission' && <ContentTab data={admissionContent} />}
        {activeTab === 'treatment' && <ContentTab data={treatmentContent} />}
        {activeTab === 'discharge' && <ContentTab data={dischargeContent} />}
        {activeTab === 'outpatient' && <ContentTab data={outpatientContent} />}
        {activeTab === 'video' && <QrTab />}
        {activeTab === 'qna' && <QnaTab />}
      </div>

      {/* ═══ 연락처 ═══ */}
      <div id="contact-section" className="px-4 pb-6">
        <div className="bg-primary/5 rounded-xl p-4 flex items-start gap-3 border border-primary/10">
          <Phone className="size-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-slate-500">문의 사항이 있으신가요?</p>
            <p className="text-sm font-bold text-primary">신생아 중환자실: 02-2228-0000</p>
            <p className="text-xs text-slate-400 mt-1">평일 09:00~17:00 / 응급 시 24시간</p>
            <p className="text-xs text-slate-500 mt-2">퇴원 후 외래 관련 문의는 <strong className="text-primary">세브란스병원 어린이외래</strong>로 연락해 주세요.</p>
          </div>
        </div>
      </div>

      {/* ═══ 하단 네비게이션 ═══ */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto">
        <div className="grid grid-cols-6 border-t border-slate-200 bg-white/95 backdrop-blur-md px-1 pb-5 pt-1.5">
          {[
            { id: 'admission', label: '입원', icon: Stethoscope },
            { id: 'treatment', label: '치료', icon: HeartPulse },
            { id: 'discharge', label: '퇴원', icon: Home },
            { id: 'outpatient', label: '외래', icon: ClipboardList },
            { id: 'video', label: '영상', icon: QrCode },
            { id: 'qna', label: 'Q&A', icon: MessageCircleQuestion },
          ].map((item) => {
            const isActive = item.id === activeTab;
            return (
              <button
                key={item.id}
                onClick={() => handleBottomNav(item.id)}
                className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-lg transition-all ${
                  isActive ? 'text-primary' : 'text-slate-400'
                }`}
              >
                <item.icon className={`size-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// ─── 공통 탭 콘텐츠 (빈 상태 포함) ─────────
function ContentTab({ data }: { data: { title: string; description: string; tip: string; cards: { title: string; desc: string; icon: ElementType }[] } }) {
  const isEmpty = !data.title && data.cards.length === 0;
  // 모든 카드 기본 펼침
  const [openCards, setOpenCards] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(data.cards.map((_, i) => [i, true]))
  );

  const toggle = (i: number) => setOpenCards((prev) => ({ ...prev, [i]: !prev[i] }));

  if (isEmpty) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-primary/5 text-center">
        <FileText className="size-10 text-slate-200 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-400">콘텐츠 준비 중입니다</p>
        <p className="text-xs text-slate-300 mt-1">곧 업데이트될 예정입니다</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-primary/5">
        <h3 className="text-base font-bold text-primary mb-1">{data.title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{data.description}</p>
      </div>

      {data.tip && (
        <div className="bg-accent-yellow/10 rounded-xl p-3.5 flex items-start gap-2.5 border border-accent-yellow/20">
          <Lightbulb className="size-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-primary mb-0.5">보호자 TIP</p>
            <p className="text-xs text-slate-600 leading-relaxed">{data.tip}</p>
          </div>
        </div>
      )}

      {data.cards.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {data.cards.map((card, i) => {
            const isOpen = openCards[i] ?? true;
            return (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-primary/5 overflow-hidden hover:border-primary/20 transition-all"
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <card.icon className="size-5" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 flex-1">{card.title}</p>
                  <ChevronDown
                    className={`size-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-200 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 pb-4 pt-0 ml-[52px]">
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{card.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ─── QR 영상 자료 탭 ────────────────────────
function QrTab() {
  if (qrContents.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-primary/5 text-center">
        <QrCode className="size-10 text-slate-200 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-400">영상 자료 준비 중입니다</p>
        <p className="text-xs text-slate-300 mt-1">곧 업데이트될 예정입니다</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {qrContents.map((item, i) => (
        <a
          key={i}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-xl p-4 shadow-sm border border-primary/5 flex items-center gap-3 hover:border-primary/20 transition-all active:scale-[0.98]"
        >
          <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <QrCode className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-800">{item.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
          </div>
          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full shrink-0">바로가기</span>
        </a>
      ))}
    </div>
  );
}

// ─── Q&A 탭 ─────────────────────────────────
function QnaTab() {
  if (qnaContents.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-primary/5 text-center">
        <MessageCircleQuestion className="size-10 text-slate-200 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-400">Q&A 준비 중입니다</p>
        <p className="text-xs text-slate-300 mt-1">곧 업데이트될 예정입니다</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {qnaContents.map((item, i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-4 shadow-sm border border-primary/5"
        >
          <p className="text-sm font-bold text-primary flex items-start gap-2">
            <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 shrink-0">Q</span>
            {item.question}
          </p>
          <p className="text-xs text-slate-600 leading-relaxed mt-2 pl-6">{item.answer}</p>
        </div>
      ))}
    </div>
  );
}
