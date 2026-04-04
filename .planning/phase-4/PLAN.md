# Phase 4: 대시보드 진료과 분기

## 목표
ParentDashboard와 DischargeManual이 URL의 진료과 슬러그에 따라 해당 진료과 콘텐츠만 표시. AI 챗봇도 진료과별 프롬프트 사용.

## 요구사항
R3.1, R3.2, R3.3, R3.4

---

## Prompt 1: useContentData 훅에 department 파라미터 추가

### 파일: `src/hooks/useContentData.ts`

**변경 1 — useContentCategories에 department 파라미터 추가**

```typescript
export function useContentCategories(department?: string) {
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = department ? `?department=${department}` : '';
    fetch(`/api/content/categories${params}`)
      .then(r => r.json())
      .then(data => {
        setCategories(
          data.map((c: any) => ({
            ...c,
            icon: getIcon(c.icon_name),
          }))
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [department]);

  // ... journeySteps 로직 유지
  return { categories, journeySteps, loading };
}
```

**변경 2 — useContentModules에 department 파라미터 추가**

```typescript
export function useContentModules(categorySlug: string | null, department?: string) {
  // ...
  const fetchModules = useCallback(async () => {
    if (!categorySlug) { setModules([]); return; }
    setLoading(true);
    try {
      let url = `/api/content/modules?category=${categorySlug}&status=published`;
      if (department) url += `&department=${department}`;
      const r = await fetch(url);
      // ... 나머지 동일
    }
  }, [categorySlug, department]);
  // ...
}
```

### 검증
- useContentCategories('nicu') → NICU 카테고리만 반환
- useContentCategories() → 전체 반환 (하위호환)

---

## Prompt 2: ParentDashboard에서 URL의 deptSlug 사용

### 파일: `src/pages/ParentDashboard.tsx`

**변경 1 — useParams로 deptSlug 추출**

import 추가:
```typescript
import { useNavigate, useParams } from 'react-router-dom';
```

컴포넌트 상단:
```typescript
const { deptSlug } = useParams<{ deptSlug: string }>();
```

**변경 2 — useContentCategories/useContentModules에 deptSlug 전달**

기존:
```typescript
const { categories, journeySteps, loading: catsLoading } = useContentCategories();
```
변경:
```typescript
const { categories, journeySteps, loading: catsLoading } = useContentCategories(deptSlug);
```

useContentModules 호출도 동일하게 deptSlug 전달.

**변경 3 — 대시보드 헤더에 진료과 이름 표시**

StoragePrefixContext의 기본값을 deptSlug 기반으로 변경:
```typescript
const storagePrefix = `${deptSlug || 'nicu'}-`;
```

대시보드 헤더의 "세브란스 NICU" 텍스트를 동적으로 변경 — departments API에서 현재 진료과 정보 로드하거나, AuthContext의 currentDepartment 활용.

**변경 4 — 퇴원 매뉴얼 링크 URL 업데이트**

대시보드 내 퇴원 매뉴얼로 이동하는 navigate 호출을:
```typescript
navigate(`/dept/${deptSlug}/manual`)
```
로 변경.

**변경 5 — 로그아웃 후 랜딩페이지로 이동**

```typescript
navigate('/')  // 진료과 선택 화면으로
```

### 검증
- /dept/nicu/dashboard → NICU 콘텐츠만 표시
- /dept/ccu/dashboard → CCU 콘텐츠만 표시 (시드 데이터 없으면 빈 화면)
- 헤더에 진료과 이름 표시

---

## Prompt 3: DischargeManual에서 URL의 deptSlug 사용

### 파일: `src/pages/DischargeManual.tsx`

**변경 1 — useParams 추가, 뒤로가기 URL 수정**

```typescript
import { useNavigate, useParams } from 'react-router-dom';

const { deptSlug } = useParams<{ deptSlug: string }>();
```

뒤로가기 버튼:
```typescript
onClick={() => navigate(`/dept/${deptSlug}/dashboard`)}
```

**변경 2 — getDischargeCategories에 department 전달**

```typescript
const { data: categories, loading } = useApi(
  () => getDischargeCategories(deptSlug), [deptSlug]
);
```

**변경 3 — "NICU 가이드" 텍스트 동적화**

히어로 섹션의 하드코딩된 "NICU 가이드" → 진료과에 따라 동적 텍스트.
"신생아 중환자실 퇴원 후" → 진료과별 적절한 텍스트.

### 검증
- /dept/nicu/manual → NICU 퇴원매뉴얼
- /dept/ccu/manual → CCU 퇴원매뉴얼
- 뒤로가기 → /dept/:slug/dashboard로 정상 이동

---

## Prompt 4: AI 챗봇 진료과별 시스템 프롬프트

### 파일: `server/services/geminiService.ts`

**변경 — 시스템 프롬프트를 진료과별로 분기**

```typescript
const DEPARTMENT_PROMPTS: Record<string, string> = {
  nicu: `당신은 세브란스 병원 신생아 중환자실(NICU)의 보호자 지원 AI 상담사입니다.
역할: 신생아 케어, 발달, 수유, 위생 등에 대한 일반적인 정보를 제공합니다...`,
  'ortho-ward': `당신은 세브란스 병원 정형외과 병동의 보호자 지원 AI 상담사입니다.
역할: 정형외과 수술 후 재활, 통증 관리, 보조기 사용, 낙상 예방 등에 대한 일반적인 정보를 제공합니다...`,
  ccu: `당신은 세브란스 병원 심혈관 중환자실(CCU)의 보호자 지원 AI 상담사입니다.
역할: 심혈관 질환 관리, 투약, 생활습관 교정, 응급 증상 인지 등에 대한 일반적인 정보를 제공합니다...`,
  'ped-er': `당신은 세브란스 병원 소아응급실의 보호자 지원 AI 상담사입니다.
역할: 소아 응급 증상 관찰, 귀가 후 주의사항, 재방문 기준 등에 대한 일반적인 정보를 제공합니다...`,
};

function getSystemPrompt(department?: string): string {
  return DEPARTMENT_PROMPTS[department || 'nicu'] || DEPARTMENT_PROMPTS.nicu;
}
```

공통 규칙(의학적 진단 금지, 응급 키워드, 면책 고지)은 모든 진료과 프롬프트에 동일하게 포함.

**변경 — generateResponse에 department 파라미터 추가**

```typescript
export async function generateResponse(
  userMessage: string,
  conversationHistory: { role: string; content: string }[],
  department?: string
): Promise<string> {
  // ... getSystemPrompt(department) 사용
}
```

### 파일: `server/routes/ai.ts`

**변경 — POST /api/ai/chat에서 department 수신**

```typescript
const { sessionId, message, department } = req.body;
// ...
const response = await generateResponse(message, history, department);
```

### 파일: `src/api/endpoints.ts`

**변경 — sendChatMessage에 department 파라미터 추가**

```typescript
export const sendChatMessage = (sessionId: number, message: string, department?: string) =>
  api.post<any>('/ai/chat', { sessionId, message, department });
```

### 검증
- NICU 대시보드에서 AI 챗봇 → NICU 프롬프트 사용
- CCU 대시보드에서 AI 챗봇 → CCU 프롬프트 사용

---

## 완료 기준 (UAT)

1. ✅ /dept/nicu/dashboard → NICU 카테고리/카드만 표시
2. ✅ /dept/ccu/dashboard → CCU 카테고리/카드만 표시
3. ✅ 대시보드 헤더에 현재 진료과 이름 표시
4. ✅ 퇴원매뉴얼 진료과별 콘텐츠 필터링
5. ✅ AI 챗봇 진료과별 시스템 프롬프트 분기
6. ✅ 네비게이션 URL이 진료과 슬러그 포함
7. ✅ 앱 빌드 성공
