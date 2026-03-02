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
  ChevronLeft,
  Eye,
  Check,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─── 타입 ───────────────────────────────────
type TabId = 'admission' | 'visit' | 'treatment' | 'discharge' | 'outpatient' | 'breastmilk' | 'video' | 'qna';

interface CategoryTab {
  id: TabId;
  label: string;
  icon: ElementType;
}

// ─── 카테고리 탭 정의 ───────────────────────
const categoryTabs: CategoryTab[] = [
  { id: 'admission', label: '입원', icon: Hospital },
  { id: 'visit', label: '면회', icon: Users },
  { id: 'treatment', label: '치료', icon: HeartPulse },
  { id: 'discharge', label: '퇴원', icon: Home },
  { id: 'outpatient', label: '외래·검사', icon: ClipboardList },
  { id: 'breastmilk', label: '모유', icon: Droplets },
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
  title: '입원 안내',
  description: '입원 수속 관련 안내입니다.',
  tip: '',
  cards: [
    { title: '입원 수속 장소 안내', desc: '▸ 평일 08:30~17:30 (점심시간 12:30~13:30 포함)\n어린이병원 4층 입·퇴원 창구\nTel. 02-2228-5946\n\n▸ 토요일 13:30~17:30 / 공휴일 08:30~17:30\n본관 3층 입원 원무팀 1, 2번 창구\nTel. 02-2228-7000\n\n※ 본관 3층 가는 길: 어린이병원 1층에서 외부로 나가 본관 3층으로, 또는 어린이병원 4층 연결통로 → 본관 5층 → 3층 로비로 이동', icon: Hospital },
    { title: '입원 시 준비물', desc: '▸ 갑티슈 1개\n▸ 물티슈 1개', icon: ShieldCheck },
    { title: '입원 절차', desc: '① 회의실에서 동영상 시청 및 서류 작성\n   • 입원 안내 동영상 시청\n   • 동의서 설명 동영상 시청\n   • 간호정보조사지 작성 (Inborn / Outborn)\n\n② 간호사에게 입원동의서 설명 청취\n   • 아기 발찌 2개 수령 (엄마·아빠 각 1개)\n   ⚠ 발찌를 가져오지 않으면 입장 불가\n\n③ 의사에게 나머지 동의서 수령\n\n④ 아기 정리 후 면회\n   아기가 정리되면 약 10분 내로 면회를 진행합니다.\n   (정규 면회 시간 외에도 진행됩니다)', icon: ClipboardList },
  ],
};

const visitContent = {
  title: '면회 안내',
  description: 'NICU는 감염 예방을 위해 면회가 제한됩니다. 아래 안내 사항을 꼭 확인해 주세요.',
  tip: '',
  cards: [
    { title: '면회 시간 안내', desc: '매일 3회, 각 30분\n\n▸ 오전 11:30 ~ 12:00\n▸ 오후 6:00 ~ 6:30\n▸ 오후 7:30 ~ 8:00\n\n⚠ 보호자 2인만 면회 가능합니다.\n형제자매·조부모는 면회가 불가합니다.', icon: Clock },
    { title: '면회 시 준비사항', desc: '▸ 손 소독 필수\n▸ 면회복(가운) 착용 — NICU 입구에서 제공\n▸ 휴대폰 사용 자제\n▸ 향수·화장품 등 강한 향 자제', icon: ShieldCheck },
    { title: '감염 관리 수칙', desc: '아래 증상이 있으면 면회가 제한됩니다.\n\n▸ 발열 (37.5°C 이상)\n▸ 기침, 콧물, 인후통\n▸ 설사, 구토\n\n유행성 감염 시기에는 면회 제한이 더 강화될 수 있습니다.', icon: Thermometer },
    { title: '입장 벨 사용 안내', desc: '면담·퇴원·수술 안내 등 용무가 있어 오신 경우, 아래 방법으로 입장하세요.\n\n① 아기가 속한 구역(A 또는 B)의 벨을 누릅니다.\n② 인터폰에 대고 방문 목적을 말씀해 주세요.\n   예) "OOO 환자 면담 왔습니다."\n       "OOO 환자 퇴원 왔습니다."\n       "OOO 환자 수술 안내 왔습니다."\n③ 직원이 문을 열어드릴 때까지 잠시 기다려 주세요.\n\n※ 인터폰 소리가 잘 들리지 않을 수 있어 직원이 한 번 더 여쭤볼 수 있습니다. 당황하지 마시고 다시 한번 말씀해 주세요.', icon: Phone },
  ],
};

const treatmentContent = { title: '', description: '', tip: '', cards: [] as { title: string; desc: string; icon: ElementType }[] };

const dischargeContent = {
  title: '퇴원 교육 안내',
  description: '퇴원 시 담당 의료진이 설명한 가정 내 처치·관리 방법입니다. 각 항목을 눌러 자세히 확인하세요.',
  tip: '교육 내용 중 궁금한 점은 담당 간호사·의사에게 언제든 질문하세요.',
  cards: [
    {
      title: '퇴원 절차 안내',
      icon: Home,
      desc: `■ 퇴원 당일 순서\n주치의 치료 및 경과관찰 → 퇴원처리\n\n■ 전산처리 및 퇴원수속 절차\n① 전산처리 및 퇴원수속: 원무팀 약제, 의무기록발급실 등\n② 퇴원수납 (인터넷/앱): 어린이병원 4층\n   - 퇴원 계산 발행 및 수납\n   - 증명서류 발급\n\n■ 당일 긴급 연락\n퇴원 후 발생 의문점은 병동으로 연락하십시오.\n• NICU A: 02-2228-6541\n• NICU B: 02-2228-6551`,
    },
    {
      title: '증명서 발급 서비스 (모바일)',
      icon: FileText,
      desc: `■ 발급 방법\nmy세브란스 앱 → 주요 메뉴 → 증명서 발급\n\n⚠ 신생아 증명서 발급 시 주의사항\n출생신고 완료 및 아이핀(i-PIN) 인증이 필요합니다.\n환자 본인 명의로만 발급 가능합니다.\n\n■ 발급 가능 서류 13종\n① 환불 확인서\n② 의무확인서\n③ 진료비 영수증/납입확인서\n④ 진료비 납부 확인서\n⑤ 진료비계산내역서\n⑥ 처방전\n⑦ 약처방내용증명서 (국문/영문)\n⑧ 진료확인서\n⑨ 소견서 (재발급)\n⑩ 단산증명서\n⑪ 수술확인서\n⑫ 퇴원증명서 (진단서 포함-재발급)\n⑬ 의사면허증명서\n\n■ 증명서 발급 비용\n• 진단서: 20,000원/장\n• 의무기록사본: 1,000원/장 (1~5페이지), 100원/장 (6페이지~)\n• CD 영상복사: 10,000원/건 (CT, MRI 등)`,
    },
    {
      title: '소아 수면마취 안내',
      icon: Brain,
      desc: `CT·MRI 촬영 시 만 7세 이하 소아이거나 의사의 판단에 따라 수면마취를 시행합니다.\n\n■ 수면마취 전반적 과정\n① 혈관주사 확보 → ② 수면마취약 주입 → ③ 검사 시행 → ④ 회복실\n\n■ 도착시간\n• CT 검사: 검사 30분 전\n• MRI 검사: 검사 40분 전\n\n■ 수면마취 비용\nCT·MRI 검사 비용과 별도로 청구됩니다.\n\n■ 검사 당일 금식 가이드라인\n• 물, 맑고 투명한 주스, 이온음료: 검사 시작 2시간 전까지 가능\n• 모유: 검사 4시간 전까지 가능\n• 분유, 우유: 검사 6시간 전까지 가능\n• 간단한 식사 (토스트와 물, 죽·미음): 검사 8시간 전까지 가능\n• 육류·기름진 음식 포함 정규식사: 검사 8시간 전까지 가능\n• 과자, 사탕, 껌: 8시간 전까지 가능\n\n☎ 문의: 소아수면마취실 02-2228-6371`,
    },
    {
      title: '안과 검진 및 미숙아 망막증 진료 안내',
      icon: Eye,
      desc: `미숙아 망막증은 망막 혈관이 아직 충분히 성장하지 않아 발생할 수 있습니다. 약 3~7일 간격으로 3~4번 점검합니다.\n\n■ 진료 안내\n• 진료 시 아기의 눈을 강제로 벌려서 진료하기 때문에 약간의 충혈이 생길 수 있습니다.\n• 약 3~7일 정도면 자연스럽게 충혈이 회복됩니다.\n• 산동제(눈동자를 키우는 안약)를 사용하므로 검사 도중 빛에 예민할 수 있습니다.\n\n■ 검사 전 주의사항\n• 검사 전 3시간 금식\n• 산동 점안 후 대기시간: 1시간 30분 ~ 2시간\n\n⭐ 검사 후 약 3~7일 뒤 예약 시 충혈이 회복되어 다음 진료가 가능합니다.`,
    },
    {
      title: '네블라이저 흡입요법',
      icon: Wind,
      desc: `호흡기 치료에 필요한 약물을 미세한 입자로 분무시켜 기관지·폐에 직접 전달하는 치료법입니다.\n\n■ 주요 처방 약물\n• Salbutamol Sulfate (벤토린®): 기관지 확장제\n• Budesonide (풀미코트®): 염증 조절제, 스테로이드\n• Ipratropium Bromide Hydrate (아트로벤트®): 기관지 확장제\n\n■ 사용 방법\n① 손을 씻습니다.\n② 기계와 처방받은 용량의 약물을 준비합니다.\n③ 기계에 약물을 넣어 준비합니다.\n④ 기계의 전원을 켜고 약이 분무되는 것을 확인합니다.\n⑤ 마스크를 얼굴에 맞닿게 하여 흡입요법을 시작합니다.\n⑥ 약 15분 정도 소요 후 전원을 끕니다.\n⑦ 입안을 닦고 마무리합니다.\n\n■ 시행 시기\n구토·흡인성 폐렴 예방을 위해 식전 또는 식후 최소 1시간 뒤 시행\n\n■ 사용 시 주의사항\n아기가 울면 약물이 폐로 고르게 전달되지 않으므로 안정된 상태에서 시행합니다.\n\n■ 약물별 부작용 및 대처\n• 벤토린: 심장 박동 상승, 심하게 보채거나 손·발 포함 전신 떨림 발생 시 사용 중단 후 진료\n• 풀미코트: 아구창(칸디다증) 생길 수 있으므로 사용 후 입안을 깨끗이 닦기\n• 아트로벤트: 눈에 들어갈 경우 안압 상승·안구 통증 유발 가능, 눈에 들어가지 않도록 주의`,
    },
    {
      title: '흉부 물리요법',
      icon: ActivitySquare,
      desc: `가슴과 등을 두드려 폐에 고여 있는 분비물이 가래로 쉽게 나오도록 도와주는 치료입니다.\n\n■ 시행 방법\n손을 컵 모양으로 만들거나 고무컵으로 촉촉 스냅을 이용하여 부드럽게 두드립니다.\n\n■ 시행 시기\n• 구토 예방을 위해 식전 또는 식후 1시간 뒤에 시행합니다.\n• 네블라이저 흡입요법 후 시행하면 더 효과적입니다.\n\n■ 시행 자세\n• 눕혀서 시행하는 방법\n• 앉아서 시행하는 방법`,
    },
    {
      title: '위관 영양',
      icon: Baby,
      desc: `입안 구조나 기능, 호흡, 신경계 문제 등으로 전량 입으로 먹기 어려운 경우 원활한 성장과 탈수 예방을 위해 시행합니다.\n\n■ 준비물\n• 수유 튜브 (6Fr, 8Fr 등 적절한 크기)\n• 줄자, 멸균 장갑\n• 멸균 생리식염수 또는 끓였다 식힌 물\n• 고정 테이프 (하이파픽스), 헤파린 캡\n• 10cc 주사기, 청진기, 손 소독제, 가위\n\n■ 위관 삽입 길이 측정\n코 끝 → 귓볼 → (귓볼 + 배꼽 중간 지점)까지의 합산 길이\n\n■ 위관 삽입 방법\n① 손을 씻습니다.\n② 적합한 삽입 길이를 측정합니다.\n③ 아기가 위관을 잡지 않도록 싸개로 감쌉니다.\n④ 멸균 장갑을 착용합니다.\n⑤ 위관 끝에 멸균 생리식염수를 묻힌 후 코로 천천히 삽입합니다.\n⑥ 측정한 길이만큼 삽입 후 고정 테이프로 볼에 위관을 고정합니다.\n\n■ 위관 위치 확인 방법\n1. 주사기 사용: 위관 뚜껑 아래를 꺾어 주사기 연결 → 위 내용물(잔유) 확인\n2. 청진기 사용: 10cc 주사기에 2cc 공기 채워 연결 → 배꼽과 명치 중간에 청진기 대고 공기 주입 시 소리 확인\n3. X-ray 확인: 저항이 느껴지거나 위치 불확실 시\n\n■ 위관 영양 방법\n① 위관 위치 확인 후 잔유를 확인합니다.\n② 구강 수유 가능하면 먼저 구강 수유를 합니다.\n③ 위관 수유 전 머리를 약간 올려 오른쪽으로 눕힙니다.\n④ 50cc 주사기를 연결하고 아기 머리에서 20cm 위에 두어 20~30분 동안 중력으로 천천히 들어가도록 합니다.\n\n■ 위관 영양 주의사항\n• 위관은 하루 간격으로 교환하며 교환 시 코구멍 위치를 바꿉니다.\n• 식사 20~30분 전에 물을 먼저 넣어 확인합니다.\n• 잔유의 양상이 변하거나 색이 변하면 병원에 문의하세요.\n• 위관 수유 중에는 절대로 아기를 혼자 두지 않습니다.`,
    },
    {
      title: '소아 기관절개관 관리',
      icon: Wind,
      desc: `■ 소독 준비물\n• 멸균 장갑\n• 작은 Y거즈 (α 베타폼 T 또는 튜브가드)\n• 포비돈 스왑 1세트 (또는 생리식염수)\n\n■ 소독 방법\n① 손을 씻고 마스크를 착용합니다.\n② 포비돈 스왑과 Y거즈를 개봉하여 준비합니다.\n③ 이전에 적용했던 Y거즈를 제거합니다.\n④ 기관절개관 부위의 발적이나 부종이 있는지 확인합니다.\n⑤ 멸균 장갑을 착용합니다. (장갑 표면이 손에 닿지 않도록 주의)\n⑥ 포비돈 스왑으로 기관절개관 삽입 부위를 원 그리듯 소독합니다. (2회 반복)\n⑦ Y거즈를 Y자가 되도록 아래에서 위로 끼웁니다.\n⑧ 고정 끈의 상태 및 피부손상 여부를 확인합니다. 새끼손가락 한 개 정도의 여유만 두고 타이트하게 묶습니다.\n\n■ 일반적 사항\n• 1일 1회 이상 소독 (젖은 경우 더 자주)\n• 기관절개관 교체: 1회/1일\n• 방 안 온도·습도를 적절하게 조절합니다.\n• 커프 압력: 20~25mmHg 유지\n• 비상용으로 같은 크기의 기관절개관을 구비해 둡니다.\n\n■ 기관절개관 이탈 예방\n• 목 끈은 새끼손가락 한 개만 들어갈 정도로 유지합니다.\n• 이동 시에는 기관절개관을 항상 주의깊게 확인합니다.\n• Y자 거즈 부위가 들뜨지 않는지 자주 확인합니다.\n\n■ 이탈 시 대처법\n① 기존 튜브로 즉시 재삽입 후 앰부백으로 산소 공급\n② 재삽입 실패 시: 구멍을 멸균 거즈로 막고 산소마스크+앰부백으로 입으로 산소 공급\n③ 119 신고 후 병원 이송\n\n■ 병원에 연락해야 하는 경우\n• 숨소리가 거칠어지거나 호흡 곤란을 보일 때\n• 내쉬는 공기가 약하게 느껴지며 청색증이 나타날 때\n• 출혈이 지속되거나 다량 출혈인 경우\n• 기관절개관 튜브가 빠진 경우\n• 석션 카테터가 들어가지 않는 경우\n• 해열제로 해결되지 않는 38도 이상의 발열`,
    },
    {
      title: '브로비악 카테터 관리 (헤파린 용액 주입·교체)',
      icon: Syringe,
      desc: `■ 준비물\n• 헤파린 캡, 주사기, 알콜솜, 장갑, 생리식염수\n\n■ 헤파린 용액 주입 방법\n① 손을 씻고 마스크와 일회용 장갑을 착용합니다.\n② 10cc 생리식염수와 세정용 알콜솜을 준비합니다.\n③ 카테터 끝에 알콜솜으로 소독하고 주사기를 연결합니다.\n④ 생리식염수를 주입한 후 주사기를 분리하고 헤파린 캡으로 막습니다.\n⑤ 이는 혈액이 역류하지 않도록 하여 카테터가 막히는 것을 방지합니다.\n⑥ 헤파린 캡을 단단히 잠그고 주사기를 분리합니다.\n⑦ 사용한 주사기는 폐기합니다.\n\n■ 카테터 종류별 약물 준비 양\n• 브로비악: 생리식염수 3cc 1개, 헤파린 2.5cc 1개\n• 히크만: 생리식염수 3cc 2개, 헤파린 3.5cc 2개`,
    },
    {
      title: 'Valcyte 약 조제법',
      icon: Syringe,
      desc: `Valcyte는 바이러스 감염 치료에 쓰이는 항바이러스제입니다.\n⚠ 최기형성 유발약으로 조제·투약 시 반드시 비닐 장갑을 착용하세요.\n\n■ 정제(알약) 조제법\n• 보관: 냉장보관, 조제일로부터 7일\n① 설탕 15g이 든 포도당 50% 병에 물을 넣어 30ml가 되도록 합니다.\n② Valcyte 정제 2알을 병에 넣고 흔들어 줍니다.\n③ 약 3~4시간 소요됩니다. (최종 30mg/ml)\n④ 완료된 약은 냉장 보관합니다.\n\n■ 시럽 조제법\n• 보관: 냉장보관 (처방일 기준 49일)\n• Valcyte 시럽 1cc = 50mg\n① 처방용량을 확인합니다.\n② 비닐 장갑을 착용합니다.\n③ 경구용 주사기로 처방 용량을 정확히 재어 투약합니다.\n\n■ Powder 조제법 (Valcyte powder for oral solution)\n• 재료: Valcyte powder, 물약병 1개, 물 91cc\n• 보관: 냉장보관 (처방일 기준 49일), 1cc = 50mg\n① 눈금이 있는 용기에 물을 91cc로 맞춰 준비합니다.\n② 어린이 안전 용기 뚜껑을 제거하고 충분히 흔들어 줍니다.\n③ 남아있는 물을 넣고 잘 흔들어 섞습니다.\n④ 어린이 안전 용기 뚜껑에 분배기를 끼웁니다.\n⑤ 조제 후 냉장 보관합니다.\n⑥ 경구용 주사기로 투약, 사용 후 주사기는 폐기합니다.`,
    },
    {
      title: '피에르-로뱅 속발증 / 혀-입술 접합술',
      icon: HandHeart,
      desc: `■ 피에르-로뱅 속발증(Pierre-Robin sequence)이란?\n아래턱이 작고, 혀가 목구멍으로 말리는 상태로 기도 폐쇄를 일으킬 수 있는 증후군입니다.\n\n■ 혀-입술 접합술(tongue-lip adhesion)이란?\n혀가 목구멍으로 말리는 것을 방지하기 위해 혀와 입술을 봉합하여 기도를 확보하고 안전하게 숨을 쉴 수 있도록 하는 수술입니다. 전신마취 하에 진행됩니다.\n\n■ 수술 후 관찰·관리\n• 수술 후 신생아중환자실에서 면밀히 관찰합니다.\n• 부착된 단추가 스스로 탈부착될 수 있으며, 초기에는 자연 경과를 관찰합니다.\n• 혀-입술 접합술은 장기적인 발음, 치아 발달에 영향을 미치지 않습니다.\n• 수술 후에도 호흡이 힘들다면 추가 수술(기관절개술)이 필요할 수 있습니다.\n\n■ 퇴원 후 주의사항\n• 고형 음식은 피하고 액체류만 사용합니다.\n• 이상 증상이 나타나면 지체없이 병원 응급실에 내원하십시오.`,
    },
    {
      title: '영아 심폐소생술 (CPR)',
      icon: HeartPulse,
      desc: `심정지 발생 후 4~5분이 경과하면 뇌의 비가역적 손상이 일어납니다. 심박동이 회복될 때까지 인공호흡과 인공 순환으로 뇌와 심장에 산소를 공급합니다.\n\n■ 심폐소생술 순서\n의식 확인 → 119 신고 → 가슴 압박 → 기도 유지 → 인공호흡\n\n■ STEP 1: 의식 확인 및 호흡 확인\n• 아기 발바닥에 자극을 주어 울거나 반응하는지 확인합니다.\n• 반응이 없고 숨을 쉬지 않거나 헐떡거리는 호흡을 보일 경우, 119에 신고하고 즉시 시작합니다.\n\n■ STEP 2: 가슴 압박 30회\n• 위치: 양쪽 유두 연결선과 흉골이 만나는 지점 바로 아래에 두 손가락을 위치합니다.\n• 깊이: 가슴 전후 두께의 최소 1/3\n• 속도: 분당 100~120회\n• 매 압박 후 가슴이 완전히 이완되도록 합니다.\n\n■ STEP 3: 인공호흡 2회\n• 머리를 살짝 뒤로 젖히고 턱을 들어 기도를 유지합니다.\n• 아기의 입과 코를 구조자의 입으로 완전히 덮고 한 숨 당 1초간 불어 2회 실시합니다.\n• 아기의 가슴이 올라오는지 확인합니다.\n\n■ STEP 4: 아기 의식 확인\n• 30:2의 비율로 5회 반복 후 호흡을 확인합니다.\n• 반응을 보이거나 울면 심폐소생술을 중지합니다.\n\n⚠ 반응이 없다면 119 구조대 도착 시까지 계속 심폐소생술을 지속합니다.`,
    },
    {
      title: '영아 질식 사고 예방 및 대처법',
      icon: AlertTriangle,
      desc: `질식은 기도가 막히거나 산소가 부족하여 숨을 쉴 수 없는 상태로, 뇌 손상과 사망에 이를 수 있습니다. 영아는 구강기에 손에 잡히는 물건을 삼키려는 경우가 흔합니다.\n\n■ STEP 1: 의식 확인\n• 아기가 기침하거나 우는 경우, 공기를 충분히 들이 마신다면 방해하지 않습니다.\n• 기침이 없거나 울지 못하는 경우 → 119 신고 후 아래 조치를 취합니다.\n• 의식이 없는 경우 → 즉시 심폐소생술 실시\n\n■ STEP 2: 등 두드리기 5회\n• 아기 얼굴이 아래를 향하도록 팔 위에 올려놓습니다.\n• 다른 손으로 턱을 받쳐주고 아기를 고정합니다.\n• 손바닥으로 양쪽 견갑골(어깨뼈) 사이의 등을 5회 연속 두드립니다.\n\n■ STEP 3: 흉부 압박 5회\n• 등을 두드리던 손으로 아기 머리 뒤를 받치고 얼굴이 위로 향하도록 돌립니다.\n• 양쪽 유두 연결선 중앙 바로 아래의 흉골을 두 손가락으로 5회 압박합니다.\n\n⚠ 이물질이 제거될 때까지 STEP 2~3을 반복합니다.\n아기가 의식을 잃으면 즉시 심폐소생술을 실시합니다.`,
    },
  ],
};
// ─── 퇴원 준비물 체크리스트 데이터 ──────────
const STORAGE_KEY = 'nicu-discharge-checklist-v1';

interface ChecklistItem { id: string; label: string }
interface ChecklistCategory { id: string; title: string; icon: ElementType; items: ChecklistItem[] }

const dischargeChecklist: ChecklistCategory[] = [
  {
    id: 'nebulizer',
    title: '네블라이저 흡입요법',
    icon: Wind,
    items: [
      { id: 'neb-1', label: '네블라이저 기계' },
      { id: 'neb-2', label: '처방 약물' },
    ],
  },
  {
    id: 'tube-feeding',
    title: '위관 영양',
    icon: Baby,
    items: [
      { id: 'tf-1', label: '수유 튜브 (6Fr, 8Fr 등)' },
      { id: 'tf-2', label: '줄자' },
      { id: 'tf-3', label: '멸균 장갑' },
      { id: 'tf-4', label: '생리식염수' },
      { id: 'tf-5', label: '하이파픽스 (고정 테이프)' },
      { id: 'tf-6', label: '헤파린 캡' },
      { id: 'tf-7', label: '10cc 주사기' },
      { id: 'tf-8', label: '50cc 주사기' },
      { id: 'tf-9', label: '청진기' },
      { id: 'tf-10', label: '손 소독제' },
      { id: 'tf-11', label: '가위' },
    ],
  },
  {
    id: 'trach',
    title: '기관절개관 관리',
    icon: Wind,
    items: [
      { id: 'tr-1', label: '멸균 장갑' },
      { id: 'tr-2', label: 'Y거즈' },
      { id: 'tr-3', label: '포비돈 스왑' },
      { id: 'tr-4', label: '비상용 기관절개관 (동일 사이즈)' },
    ],
  },
  {
    id: 'broviac',
    title: '브로비악 카테터 관리',
    icon: Syringe,
    items: [
      { id: 'br-1', label: '헤파린 캡' },
      { id: 'br-2', label: '주사기' },
      { id: 'br-3', label: '알콜솜' },
      { id: 'br-4', label: '일회용 장갑' },
      { id: 'br-5', label: '생리식염수' },
    ],
  },
];

// ─── 퇴원 카테고리 데이터 ────────────────────
type CategoryColor = 'blue' | 'purple' | 'teal' | 'red';

interface DischargeCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: ElementType;
  color: CategoryColor;
  isEmergency?: boolean;
  cards: { title: string; desc: string; icon: ElementType }[];
}

const colorConfig: Record<CategoryColor, {
  bg: string; text: string; border: string; badgeBg: string; badgeText: string; iconBg: string; iconText: string;
}> = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-100',   badgeBg: 'bg-blue-100',   badgeText: 'text-blue-700',   iconBg: 'bg-blue-100',   iconText: 'text-blue-600'   },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', badgeBg: 'bg-purple-100', badgeText: 'text-purple-700', iconBg: 'bg-purple-100', iconText: 'text-purple-600' },
  teal:   { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-100',   badgeBg: 'bg-teal-100',   badgeText: 'text-teal-700',   iconBg: 'bg-teal-100',   iconText: 'text-teal-600'   },
  red:    { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    badgeBg: 'bg-red-100',    badgeText: 'text-red-700',    iconBg: 'bg-red-100',    iconText: 'text-red-600'    },
};

const dischargeCategories: DischargeCategory[] = [
  {
    id: 'procedure',
    title: '퇴원 절차 & 서류',
    subtitle: '수속 안내 및 증명서 발급',
    icon: ClipboardList,
    color: 'blue',
    cards: dischargeContent.cards.slice(0, 2),
  },
  {
    id: 'checkup',
    title: '검사 · 외래 안내',
    subtitle: '퇴원 후 외래 및 검사 관련',
    icon: Microscope,
    color: 'purple',
    cards: dischargeContent.cards.slice(2, 4),
  },
  {
    id: 'homecare',
    title: '가정 내 처치 · 관리',
    subtitle: '집에서 직접 해야 하는 처치',
    icon: HandHeart,
    color: 'teal',
    cards: dischargeContent.cards.slice(4, 11),
  },
  {
    id: 'emergency',
    title: '응급 대처법',
    subtitle: '위급 상황 시 즉시 확인',
    icon: AlertTriangle,
    color: 'red',
    isEmergency: true,
    cards: dischargeContent.cards.slice(11, 13),
  },
];

const outpatientContent = {
  title: '외래 진료 및 검사 안내',
  description: '퇴원 후 외래 진료와 관련된 중요한 안내 사항입니다.',
  tip: '',
  cards: [
    {
      title: '조산아·저체중 출생아 외래진료비 경감신청',
      desc: '■ 적용 대상\n재태기간 37주 미만 또는 2,500g 이하의 저체중 출생아\n(출생신고 전에는 신청 불가, 건강보험 자격이 있어야 등록 가능)\n\n■ 경감 내용\n외래진료·약국·처방 의약품 본인부담률 5%\n(종전 10%에서 경감)\n\n■ 적용기간\n출생일(주민등록상)로부터 5년\n※ 신청일로부터 경감 적용되므로 빠른 신청이 중요합니다\n\n■ 신청서류\n① 외래진료비 본인부담 경감 신청서\n② 요양기관에서 발급한 출생증명서\n③ 주민등록 등본 (건강보험 자격 확인 시 생략 가능)\n\n■ 제출방법\n방문, 우편, 팩스\n▸ 제출처: 가까운 국민건강보험공단 지사\n▸ 고객센터: 1577-1000\n▸ 온라인: www.nhis.or.kr → 민원신청 → 서식자료실 → 보험급여 → 경감제도 신청서 출력\n\n■ 퇴원 후 등록절차\n① 출생 신고 후 건강보험에 등재\n② 외래 원무과(1층)에서 아기 이름으로 변경\n   (입원 중에는 입원 원무과 4층, 가족관계증명서 등 필요)\n③ 신생아과 첫 외래 방문 시 신청서 작성 후 서류 지참하여 원무과에서 등록',
      icon: FileText,
    },
  ],
};

// ─── 모유 관리 데이터 ────────────────────────
const breastmilkGuide = {
  title: '모유 관리 안내',
  desc: '▸ 모유 전용팩 사용, 팩에 아기 이름·유축 날짜·양 기재\n▸ 병동에서 이름 라벨을 받아 팩에 부착\n▸ 한 팩에 약 50cc 이하 (초유는 10~20cc씩)\n▸ 다른 시간에 유축한 모유를 한 팩에 같이 담지 마세요\n▸ 너무 많은 모유를 가져오지 마세요 (냉동고 공간 한정)\n▸ 냉동 모유는 녹지 않게 아이스박스에 담아 가져오세요\n▸ 유선염·유두상처 시 모유 색이 변하면 산부인과 문의\n▸ 투약 중 약물이 있으면 반드시 알려주세요\n▸ 한약·보약은 전문한의사에게 모유수유 여부 확인 후 처방\n▸ 이른둥이는 모유강화제를 첨가할 수 있습니다\n\n⭐ 출생주수 35주 미만\n산모의 생후 4주 이내 모유는 영양성분과 열량이 높아 아기에게 매우 중요합니다.\n▸ 병동에서 제공하는 별도 스티커를 받아 해당 기간 모유팩에 부착해 주세요\n▸ 유축 날짜를 정확히 구분하여 가져다 주세요',
};

const safeMedications = [
  '타이레놀(아세트아미노펜)', '부루펜(이부프로펜)', '쎄레콕시브(셀레브렉스)',
  '케토롤락', '펜타닐', '몰핀', '날부핀',
  '아목시실린', '세팔로스포린', '아지스로마이신',
  '메트로니다졸', '독시사이클린', '플루코나졸',
  '이트라코나졸', '아사이클로버', '타미플루(오셀타미비르)',
  '프레드니솔론(≤40mg)', '덱사메타손', '인슐린',
  '레보티록신(씬지로이드)', 'PTU(프로필치오우라실)',
  '헤파린', '와파린(쿠마딘)', '니페디핀',
  '베라파밀', '라베탈롤', '메틸도파',
  '에날라프릴', '오메프라졸(PPIs)', '메토클로프라마이드',
  '비사코딜', '슈도에페드린', '세티리진·로라타딘',
  '알부테롤(흡입)', '플루티카손(흡입)', '몬테루카스트',
  '수마트립탄', '라모트리진', '졸피뎀',
  '리도카인(국소)', '미다졸람',
];

const conditionalMedications = [
  { name: '코데인(코푸정, 코대원 등)', note: '중단 후 24시간 뒤 수유' },
  { name: '트라마돌(트리돌, 마트리돌 등)', note: '중단 후 12시간 뒤 수유' },
  { name: '에르고타민(카펠고트 등)', note: '중단 후 24시간 뒤 수유' },
  { name: '트립탄(졸미트립탄, 리자트립탄)', note: '중단 후 24시간 뒤 수유' },
  { name: '메치에르고노빈(메텔진)', note: '중단 후 12시간 뒤 수유' },
  { name: '플루코나졸(고용량)', note: '고용량 시 의사 상담' },
  { name: '메토트렉세이트', note: '중단 후 24시간 뒤 수유' },
  { name: '방사성 요오드', note: '검사별 기간 다름, 핵의학과 확인' },
];

const prohibitedMedications = [
  { name: '가스파민정(시메티콘+트리메부틴)', note: '트리메부틴 성분 수유 금기' },
  { name: '산디문뉴오랄연질캅셀(사이클로스포린)', note: '면역억제제, 수유 금기' },
  { name: '후라질(니트로푸란토인)', note: '용혈성 빈혈 위험, 수유 금기' },
];

const qrContents = [] as { title: string; desc: string; url: string }[];
const qnaContents = [] as { question: string; answer: string }[];

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
      visit: 'visit',
      treatment: 'treatment',
      discharge: 'discharge',
      outpatient: 'outpatient',
      breastmilk: 'breastmilk',
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
        {activeTab === 'visit' && <ContentTab data={visitContent} />}
        {activeTab === 'treatment' && <ContentTab data={treatmentContent} />}
        {activeTab === 'discharge' && <DischargeTab />}
        {activeTab === 'outpatient' && <ContentTab data={outpatientContent} />}
        {activeTab === 'breastmilk' && <BreastmilkTab />}
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
        <div className="grid grid-cols-8 border-t border-slate-200 bg-white/95 backdrop-blur-md px-1 pb-5 pt-1.5">
          {[
            { id: 'admission', label: '입원', icon: Hospital },
            { id: 'visit', label: '면회', icon: Users },
            { id: 'treatment', label: '치료', icon: HeartPulse },
            { id: 'discharge', label: '퇴원', icon: Home },
            { id: 'outpatient', label: '외래', icon: ClipboardList },
            { id: 'breastmilk', label: '모유', icon: Droplets },
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

// ─── 퇴원 준비물 체크리스트 컴포넌트 ─────────
function DischargeChecklist() {
  const [isOpen, setIsOpen] = useState(true);
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const totalItems = dischargeChecklist.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progress = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
  const allDone = checkedCount === totalItems;

  const toggleItem = (id: string) => {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const toggleCategory = (catId: string) =>
    setOpenCategories(prev => ({ ...prev, [catId]: !prev[catId] }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-200 overflow-hidden">
      {/* 헤더 — 클릭 시 전체 접기/펼치기 */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full bg-amber-50 px-4 py-3 border-b border-amber-100 text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="size-4 text-amber-600" />
            <span className="text-sm font-bold text-amber-800">퇴원 준비물 체크리스트</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-700 font-semibold">{checkedCount}/{totalItems}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${allDone ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {progress}%
            </span>
            <ChevronDown className={`size-3.5 text-amber-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
        <div className="mt-2 h-1.5 bg-amber-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${allDone ? 'bg-green-500' : 'bg-amber-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </button>

      {/* 카테고리 아코디언 — 전체 접기/펼치기 */}
      <div className={`grid transition-all duration-200 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="divide-y divide-amber-50">
            {dischargeChecklist.map(cat => {
              const isCatOpen = openCategories[cat.id] ?? false;
              const catCheckedCount = cat.items.filter(item => checked[item.id]).length;
              return (
                <div key={cat.id}>
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-amber-50/50 transition-colors"
                  >
                    <div className="size-7 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <cat.icon className="size-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 flex-1">{cat.title}</span>
                    <span className="text-[11px] text-amber-600 font-medium mr-1">{catCheckedCount}/{cat.items.length}</span>
                    <ChevronDown className={`size-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${isCatOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`grid transition-all duration-200 ease-in-out ${isCatOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                      <div className="px-4 pb-3 space-y-2 ml-10">
                        {cat.items.map(item => {
                          const isChecked = checked[item.id] ?? false;
                          return (
                            <button
                              key={item.id}
                              onClick={() => toggleItem(item.id)}
                              className="flex items-center gap-2.5 w-full text-left"
                            >
                              <div className={`size-5 rounded flex items-center justify-center shrink-0 border transition-colors ${isChecked ? 'bg-amber-500 border-amber-500' : 'bg-white border-amber-200'}`}>
                                {isChecked && <Check className="size-3 text-white stroke-[3]" />}
                              </div>
                              <span className={`text-xs leading-snug ${isChecked ? 'line-through text-slate-400' : 'text-slate-600'}`}>
                                {item.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 퇴원 탭: 2×2 그리드 ────────────────────
function DischargeTab() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const selectedCategory = dischargeCategories.find(c => c.id === selectedCategoryId) ?? null;

  if (selectedCategory) {
    return <DischargeDrillDown category={selectedCategory} onBack={() => setSelectedCategoryId(null)} />;
  }

  return (
    <>
      <DischargeChecklist />

      <div className="bg-white rounded-xl p-4 shadow-sm border border-primary/5">
        <h3 className="text-base font-bold text-primary mb-1">퇴원 교육 안내</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          카테고리를 선택하여 원하는 정보를 확인하세요.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {dischargeCategories.map((category) => {
          const cfg = colorConfig[category.color];
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategoryId(category.id)}
              className={`bg-white rounded-xl p-3 shadow-sm border ${cfg.border} text-left transition-all hover:shadow-md active:scale-[0.97] ${category.isEmergency ? 'ring-1 ring-red-200' : ''}`}
            >
              <div className={`size-8 rounded-lg ${cfg.iconBg} ${cfg.iconText} flex items-center justify-center mb-2`}>
                <category.icon className="size-4" />
              </div>
              <p className={`text-xs font-bold ${cfg.text} leading-tight`}>{category.title}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{category.subtitle}</p>
              <div className={`mt-2 inline-flex items-center ${cfg.badgeBg} ${cfg.badgeText} text-[10px] font-semibold px-1.5 py-0.5 rounded-full`}>
                {category.cards.length}개 항목
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-primary/5 rounded-xl p-4 flex items-start gap-3 border border-primary/10">
        <Phone className="size-5 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-xs text-slate-500">퇴원 후 문의 사항이 있으신가요?</p>
          <p className="text-sm font-bold text-primary">NICU A: 02-2228-6541</p>
          <p className="text-sm font-bold text-primary">NICU B: 02-2228-6551</p>
          <p className="text-xs text-slate-400 mt-1">24시간 응급 연락 가능</p>
        </div>
      </div>
    </>
  );
}

// ─── 퇴원 탭: 드릴다운 ──────────────────────
function DischargeDrillDown({
  category,
  onBack,
}: {
  category: DischargeCategory;
  onBack: () => void;
}) {
  const [openCards, setOpenCards] = useState<Record<number, boolean>>({});
  const toggle = (i: number) => setOpenCards(prev => ({ ...prev, [i]: !prev[i] }));
  const cfg = colorConfig[category.color];

  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-semibold text-primary"
      >
        <ChevronLeft className="size-4" />
        뒤로
      </button>

      <div className={`${cfg.bg} rounded-xl p-4 border ${cfg.border}`}>
        <div className="flex items-center gap-3">
          <div className={`size-10 rounded-lg ${cfg.iconBg} ${cfg.iconText} flex items-center justify-center shrink-0`}>
            <category.icon className="size-5" />
          </div>
          <div>
            <h3 className={`text-base font-bold ${cfg.text}`}>{category.title}</h3>
            <p className="text-xs text-slate-500">{category.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {category.cards.map((card, i) => {
          const isOpen = openCards[i] ?? false;
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
    </>
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

// ─── 모유 탭 ────────────────────────────────
function BreastmilkTab() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    guide: true, safe: false, conditional: false, prohibited: false,
  });
  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <>
      {/* 헤더 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-primary/5">
        <h3 className="text-base font-bold text-primary mb-1">모유 수유 안내</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          모유는 아기에게 최고의 영양입니다. 올바른 유축·보관 방법과 약물 안전 정보를 확인해 주세요.
        </p>
      </div>

      {/* 약물 상담 연락처 */}
      <div className="bg-primary/5 rounded-xl p-4 flex items-start gap-3 border border-primary/10">
        <Phone className="size-5 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-xs text-slate-500 mb-1">수유 중 약물 복용이 걱정되시나요?</p>
          <p className="text-sm font-bold text-primary">마더세이프: 1588-7309</p>
          <p className="text-xs text-slate-400 mt-0.5">평일 09:00~17:00 (점심 12:30~13:30 제외)</p>
          <a
            href="https://mothertobaby.co.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-1.5 text-xs font-semibold text-primary underline underline-offset-2"
          >
            마더투베이비 웹사이트 →
          </a>
        </div>
      </div>

      {/* 모유 관리 안내 */}
      <div className="bg-white rounded-xl shadow-sm border border-primary/5 overflow-hidden">
        <button onClick={() => toggleSection('guide')} className="w-full flex items-center gap-3 p-4 text-left">
          <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Droplets className="size-5" />
          </div>
          <p className="text-sm font-bold text-slate-800 flex-1">모유 관리 안내</p>
          <ChevronDown className={`size-4 text-slate-400 shrink-0 transition-transform duration-200 ${openSections.guide ? 'rotate-180' : ''}`} />
        </button>
        <div className={`grid transition-all duration-200 ease-in-out ${openSections.guide ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden">
            <div className="px-4 pb-4 ml-[52px]">
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{breastmilkGuide.desc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 수유 가능 약물 */}
      <div className="bg-white rounded-xl shadow-sm border border-primary/5 overflow-hidden">
        <button onClick={() => toggleSection('safe')} className="w-full flex items-center gap-3 p-4 text-left">
          <div className="size-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800">수유 가능 약물</p>
            <p className="text-[11px] text-green-600 font-medium">안전하게 복용 가능</p>
          </div>
          <ChevronDown className={`size-4 text-slate-400 shrink-0 transition-transform duration-200 ${openSections.safe ? 'rotate-180' : ''}`} />
        </button>
        <div className={`grid transition-all duration-200 ease-in-out ${openSections.safe ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden">
            <div className="px-4 pb-4">
              <div className="flex flex-wrap gap-1.5">
                {safeMedications.map((med) => (
                  <span key={med} className="inline-block bg-green-50 text-green-700 text-[11px] font-medium px-2 py-1 rounded-md border border-green-100">
                    {med}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-3">※ 일반적인 용량 기준입니다. 고용량 투여 시 의료진과 상담하세요.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 조건부 가능 약물 */}
      <div className="bg-white rounded-xl shadow-sm border border-primary/5 overflow-hidden">
        <button onClick={() => toggleSection('conditional')} className="w-full flex items-center gap-3 p-4 text-left">
          <div className="size-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800">조건부 가능 약물</p>
            <p className="text-[11px] text-amber-600 font-medium">중단 후 일정 시간 경과 뒤 수유</p>
          </div>
          <ChevronDown className={`size-4 text-slate-400 shrink-0 transition-transform duration-200 ${openSections.conditional ? 'rotate-180' : ''}`} />
        </button>
        <div className={`grid transition-all duration-200 ease-in-out ${openSections.conditional ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden">
            <div className="px-4 pb-4 space-y-2">
              {conditionalMedications.map((med) => (
                <div key={med.name} className="flex items-start gap-2 bg-amber-50/50 rounded-lg p-2.5 border border-amber-100/60">
                  <Clock className="size-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{med.name}</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">{med.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 수유 금기 약물 */}
      <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
        <button onClick={() => toggleSection('prohibited')} className="w-full flex items-center gap-3 p-4 text-left">
          <div className="size-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800">수유 금기 약물</p>
            <p className="text-[11px] text-red-600 font-medium">복용 시 수유 중단 필요</p>
          </div>
          <ChevronDown className={`size-4 text-slate-400 shrink-0 transition-transform duration-200 ${openSections.prohibited ? 'rotate-180' : ''}`} />
        </button>
        <div className={`grid transition-all duration-200 ease-in-out ${openSections.prohibited ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden">
            <div className="px-4 pb-4 space-y-2">
              {prohibitedMedications.map((med) => (
                <div key={med.name} className="flex items-start gap-2 bg-red-50/50 rounded-lg p-2.5 border border-red-100/60">
                  <AlertTriangle className="size-3.5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-red-700">{med.name}</p>
                    <p className="text-[11px] text-red-600 mt-0.5">{med.note}</p>
                  </div>
                </div>
              ))}
              <div className="bg-red-50 rounded-lg p-2.5 border border-red-200/60 mt-2">
                <p className="text-[11px] text-red-700 font-medium leading-relaxed">
                  ⚠ 위 약물을 복용 중이라면 즉시 의료진에게 알려주시고, 수유를 중단해 주세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
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
