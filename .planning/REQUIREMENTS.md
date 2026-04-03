# REQUIREMENTS.md — v2 다중 진료과 확장

## 개요
NICU 전용 보호자 교육 앱을 4개 진료과(NICU + 정형외과 병동 + CCU + 소아응급) 지원 플랫폼으로 확장

---

## R1. 멀티 디파트먼트 데이터 모델
- **R1.1**: `departments` 테이블 신설 (id, slug, name, icon_name, description, theme_color, sort_order)
- **R1.2**: 기존 콘텐츠 테이블(`content_categories`, `content_modules`, `discharge_categories`, `care_journey_templates`, `notices`, `examinations`)에 `department_id` FK 추가
- **R1.3**: `patients` 테이블에 `department_id` FK 추가 — 환자는 특정 진료과에 소속
- **R1.4**: 기존 NICU 데이터를 department_id=1 (slug='nicu')로 마이그레이션
- **R1.5**: 4개 진료과 시드 데이터: nicu, ortho-ward, ccu, ped-er

## R2. 진료과 선택 UI (랜딩페이지)
- **R2.1**: 랜딩페이지에 진료과 선택 화면 추가 — 4개 카드 그리드 (아이콘 + 이름 + 설명)
- **R2.2**: 진료과 선택 → 해당 진료과 전용 로그인/등록 플로우 진입
- **R2.3**: 선택된 진료과는 URL 경로에 반영 (예: `/dept/nicu/dashboard`)
- **R2.4**: 모바일에서 세로 스크롤 카드 레이아웃, 데스크탑에서 2x2 그리드
- **R2.5**: 각 진료과별 테마 컬러 적용 (NICU=현재 파랑, 정형외과=초록, CCU=빨강, 소아응급=주황)

## R3. 진료과별 대시보드 분기
- **R3.1**: `ParentDashboard`가 현재 진료과(department)에 따라 콘텐츠 필터링
- **R3.2**: 대시보드 헤더에 현재 진료과 표시 + 진료과 전환 드롭다운
- **R3.3**: 케어저니 스텝이 진료과별로 다르게 표시
- **R3.4**: AI 챗봇 시스템 프롬프트가 진료과별로 전환 (NICU는 신생아, CCU는 심장 등)

## R4. 진료과별 콘텐츠 세트
- **R4.1**: 정형외과 병동 — 카테고리: 입원안내, 수술안내, 재활치료, 퇴원안내, 통증관리
- **R4.2**: CCU — 카테고리: 입실안내, 치료과정, 투약관리, 생활습관, 퇴실안내
- **R4.3**: 소아응급 — 카테고리: 응급실안내, 검사안내, 처치안내, 귀가안내, 재방문기준
- **R4.4**: 각 진료과별 퇴원(귀가) 매뉴얼 콘텐츠
- **R4.5**: 각 진료과별 시드 콘텐츠 최소 3개 카테고리, 카테고리당 2-3개 카드

## R5. 관리자 다중 진료과 관리
- **R5.1**: 관리자 에디터에 진료과 필터/선택 드롭다운
- **R5.2**: 진료과별 독립적 카테고리/카드 CRUD
- **R5.3**: 관리자 환자 관리에서 진료과별 환자 필터링
- **R5.4**: 알림 발송 시 진료과별 대상 선택 가능

## R6. 라우팅 구조 변경
- **R6.1**: URL 구조: `/dept/:deptSlug/dashboard`, `/dept/:deptSlug/manual` 등
- **R6.2**: 기존 `/dashboard` → `/dept/nicu/dashboard` 리다이렉트 (하위호환)
- **R6.3**: API 엔드포인트에 department 필터 파라미터 추가
- **R6.4**: `AuthContext`에 currentDepartment 상태 추가

## 비기능 요구사항
- **NF1**: 진료과 추가 시 DB 시드 + 콘텐츠만 추가하면 되는 구조 (코드 변경 최소화)
- **NF2**: 기존 NICU 사용자 경험 변화 없음 (진료과 선택 단계만 추가)
- **NF3**: 번들 사이즈 증가 최소화 — 콘텐츠는 DB에서 로드, 코드 분기 최소화
