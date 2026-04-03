# Phase 2: 진료과 선택 랜딩페이지

## 목표
랜딩페이지를 진료과 선택 → 로그인 2단계 플로우로 변경. 4개 진료과 카드 그리드 + 테마 컬러 시스템.

## 요구사항
R2.1, R2.2, R2.3, R2.4, R2.5

---

## Prompt 1: LandingPage.tsx 리디자인 — 진료과 선택 화면

### 파일: `src/pages/LandingPage.tsx`

현재 구조: 바로 로그인 모달 → 대시보드
새 구조: 진료과 선택 → 선택 후 로그인 모달 → `/dept/:slug/dashboard`

**전체 리디자인 — LandingPage.tsx 완전 재작성**

핵심 변경사항:

1. **진료과 목록 로드**: `useEffect`로 `GET /api/departments` 호출, 4개 진료과 정보 로드
2. **2단계 플로우 상태 관리**:
   ```typescript
   const [selectedDept, setSelectedDept] = useState<Department | null>(null);
   const [showAuthModal, setShowAuthModal] = useState(false);
   ```
3. **진료과 선택 카드 그리드**:
   - 모바일: 세로 1열 카드 리스트 (gap-3, px-4)
   - 데스크탑: 2x2 그리드 (grid-cols-2, max-w-2xl)
   - 각 카드: 아이콘(getIcon으로 동적) + 진료과 이름 + 설명
   - 카드 클릭 → `setSelectedDept(dept)` → `setShowAuthModal(true)`
   - 카드 테두리/배경에 진료과별 theme_color 적용

4. **카드 디자인**:
   ```tsx
   {departments.map(dept => (
     <motion.button
       key={dept.id}
       whileHover={{ scale: 1.03 }}
       whileTap={{ scale: 0.97 }}
       onClick={() => { setSelectedDept(dept); setShowAuthModal(true); }}
       className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/10 backdrop-blur-sm
                  border border-white/20 hover:bg-white/20 transition-all text-white text-center"
       style={{ borderColor: `${dept.theme_color}40` }}
     >
       <div className="p-3 rounded-full" style={{ backgroundColor: `${dept.theme_color}20` }}>
         {React.createElement(getIcon(dept.icon_name), { className: 'size-8', style: { color: dept.theme_color } })}
       </div>
       <h3 className="text-lg font-bold">{dept.name}</h3>
       <p className="text-sm text-white/70">{dept.description}</p>
     </motion.button>
   ))}
   ```

5. **헤더 변경**:
   - 기존: "세브란스 NICU" 고정
   - 변경: "세브란스 병원" (진료과 선택 전) / 선택 후 모달 헤더에 진료과 이름 표시

6. **히어로 영역 변경**:
   - 기존: Baby 아이콘 + "세브란스 NICU" 타이틀
   - 변경: Hospital 아이콘 + "세브란스 보호자 포털" + "진료과를 선택해 주세요" 서브텍스트
   - 아래에 진료과 카드 그리드

7. **로그인 모달 변경**:
   - 모달 헤더에 선택된 진료과 이름 표시 (예: "NICU 로그인")
   - 모달 헤더 배경색을 `selectedDept.theme_color`로 변경
   - 로그인 성공 시 `navigate(`/dept/${selectedDept.slug}/dashboard`)` 로 이동

8. **관리자 버튼**: 우상단 유지, 클릭 시 `/login?role=staff` 유지

9. **footer**: "Made by SMART NICU TEAM" → "Made by SMART HOSPITAL TEAM"

### 검증
- 4개 진료과 카드가 정상 표시
- 모바일에서 1열, 데스크탑에서 2x2
- 카드 클릭 → 로그인 모달에 해당 진료과 이름/색상 표시
- 로그인 성공 → `/dept/:slug/dashboard`로 이동
- 관리자 버튼 정상 동작

---

## Prompt 2: App.tsx 라우팅 구조 변경

### 파일: `src/App.tsx`

**변경 — 진료과별 라우팅 추가**

기존 라우트 유지(하위호환) + 새 진료과별 라우트 추가:

```tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

export default function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <CaptureNoticeModal />
      <ScreenCaptureWarning />
      <Watermark />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* 진료과별 라우트 */}
          <Route path="/dept/:deptSlug/dashboard" element={
            <ProtectedRoute role="parent">
              <ParentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dept/:deptSlug/manual" element={
            <ProtectedRoute role="parent">
              <DischargeManual />
            </ProtectedRoute>
          } />

          {/* 하위호환 리다이렉트 */}
          <Route path="/dashboard" element={<Navigate to="/dept/nicu/dashboard" replace />} />
          <Route path="/manual" element={<Navigate to="/dept/nicu/manual" replace />} />

          {/* 관리자 라우트 (변경 없음) */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminEditor />
            </ProtectedRoute>
          } />
          <Route path="/admin/notifications" element={
            <ProtectedRoute role="admin">
              <NotificationCenter />
            </ProtectedRoute>
          } />
          <Route path="/admin/confirmations" element={
            <ProtectedRoute role="admin">
              <AdmissionConfirmations />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
    </ErrorBoundary>
  );
}
```

### 검증
- `/dept/nicu/dashboard` → ParentDashboard 렌더링
- `/dept/ccu/dashboard` → ParentDashboard 렌더링
- `/dashboard` → `/dept/nicu/dashboard`로 리다이렉트
- `/manual` → `/dept/nicu/manual`로 리다이렉트
- 관리자 라우트 변경 없음

---

## Prompt 3: AuthContext에 department 상태 추가

### 파일: `src/context/AuthContext.tsx`

**변경 1 — Department 관련 상태 추가**

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  patient: PatientInfo | null;
  currentDepartment: string | null;           // 추가: 현재 진료과 slug
  setCurrentDepartment: (slug: string) => void; // 추가
  login: (email: string, password: string) => Promise<User>;
  registerParent: (chartNumber: string, name: string) => Promise<User>;
  loginParent: (chartNumber: string) => Promise<User>;
  setNickname: (nickname: string) => Promise<void>;
  logout: () => void;
}
```

**변경 2 — department 상태 관리**

```typescript
const [currentDepartment, setCurrentDepartmentState] = useState<string | null>(
  () => localStorage.getItem('currentDepartment')
);

function setCurrentDepartment(slug: string) {
  setCurrentDepartmentState(slug);
  localStorage.setItem('currentDepartment', slug);
}
```

**변경 3 — logout에서 department 클리어**

```typescript
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('currentDepartment');
  setToken(null);
  setUser(null);
  setPatient(null);
  setCurrentDepartmentState(null);
}
```

**변경 4 — Provider value에 추가**

```typescript
<AuthContext.Provider value={{
  user, token, loading, patient,
  currentDepartment, setCurrentDepartment,
  login, registerParent, loginParent, setNickname, logout
}}>
```

### 검증
- `useAuth().currentDepartment` 접근 가능
- `setCurrentDepartment('nicu')` 호출 시 localStorage + 상태 업데이트
- logout 시 currentDepartment 초기화
- 페이지 새로고침 시 localStorage에서 복원

---

## 완료 기준 (UAT)

1. ✅ 랜딩페이지에 4개 진료과 선택 카드 표시 (API에서 로드)
2. ✅ 모바일 1열 / 데스크탑 2x2 그리드 반응형
3. ✅ 각 카드에 진료과별 테마 컬러 적용
4. ✅ 카드 클릭 → 해당 진료과 이름/색상의 로그인 모달
5. ✅ 로그인 성공 → `/dept/:slug/dashboard`로 이동
6. ✅ `/dashboard`, `/manual` → `/dept/nicu/...` 하위호환 리다이렉트
7. ✅ AuthContext에 currentDepartment 상태 존재
8. ✅ 앱 빌드 성공 및 기존 기능 정상 동작
