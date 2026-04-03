# Phase 1: 멀티 디파트먼트 데이터 모델

## 목표
`departments` 테이블 신설, 기존 테이블에 `department_id` FK 추가, NICU 데이터 마이그레이션, 4개 진료과 시드 데이터 생성

## 요구사항
R1.1, R1.2, R1.3, R1.4, R1.5

---

## Prompt 1: departments 테이블 및 FK 추가 (schema.sql)

### 파일: `server/db/schema.sql`

**변경 1 — departments 테이블 추가** (파일 상단, users 테이블 앞에 삽입)

```sql
-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'Building2',
  description TEXT,
  theme_color TEXT NOT NULL DEFAULT '#1e40af',
  sort_order INTEGER DEFAULT 0
);
```

**변경 2 — patients 테이블에 department_id FK 추가**

`patients` 테이블의 `status` 컬럼 뒤에 추가:
```sql
  department_id INTEGER REFERENCES departments(id) DEFAULT 1,
```

**변경 3 — content_categories 테이블에 department_id FK 추가**

`journey_step_order` 뒤에 추가:
```sql
  department_id INTEGER REFERENCES departments(id) DEFAULT 1,
```
기존 UNIQUE 제약 주의: `slug`가 글로벌 유니크이므로, `slug`를 `department_id + slug` 복합 유니크로 변경:
- `slug TEXT UNIQUE NOT NULL` → `slug TEXT NOT NULL`
- 테이블 끝에 `UNIQUE(department_id, slug)` 추가

**변경 4 — discharge_categories 테이블에 department_id FK 추가**

`sort_order` 뒤에 추가:
```sql
  department_id INTEGER REFERENCES departments(id) DEFAULT 1,
```

**변경 5 — care_journey_templates 테이블에 department_id FK 추가**

`icon_name` 뒤에 추가:
```sql
  department_id INTEGER REFERENCES departments(id) DEFAULT 1,
```

**변경 6 — notices 테이블에 department_id FK 추가**

`created_at` 뒤에 추가:
```sql
  department_id INTEGER REFERENCES departments(id) DEFAULT 1,
```

**변경 7 — examinations 테이블에 department_id FK 추가**

`description` 뒤에 추가:
```sql
  department_id INTEGER REFERENCES departments(id) DEFAULT 1,
```

**변경 8 — 인덱스 추가** (기존 인덱스 블록 끝에)

```sql
CREATE INDEX IF NOT EXISTS idx_content_categories_dept ON content_categories(department_id);
CREATE INDEX IF NOT EXISTS idx_patients_dept ON patients(department_id);
CREATE INDEX IF NOT EXISTS idx_discharge_categories_dept ON discharge_categories(department_id);
CREATE INDEX IF NOT EXISTS idx_care_journey_templates_dept ON care_journey_templates(department_id);
CREATE INDEX IF NOT EXISTS idx_notices_dept ON notices(department_id);
CREATE INDEX IF NOT EXISTS idx_examinations_dept ON examinations(department_id);
```

### 검증
- `schema.sql`을 sql.js로 로드했을 때 에러 없이 모든 테이블 생성
- departments 테이블에 slug, name, icon_name, description, theme_color, sort_order 컬럼 존재
- 6개 기존 테이블에 department_id 컬럼 존재 (DEFAULT 1)

---

## Prompt 2: 4개 진료과 시드 데이터 (seed.sql)

### 파일: `server/db/seed.sql`

**변경 — 파일 최상단에 departments 시드 추가** (users INSERT 앞에)

```sql
-- Departments
INSERT INTO departments (slug, name, icon_name, description, theme_color, sort_order) VALUES
  ('nicu', '신생아집중치료실 (NICU)', 'Baby', '미숙아 및 고위험 신생아를 위한 집중치료실', '#1e40af', 1),
  ('ortho-ward', '정형외과 병동', 'Bone', '관절·척추 수술 환자를 위한 입원 병동', '#16a34a', 2),
  ('ccu', '심혈관 중환자실 (CCU)', 'HeartPulse', '급성 심혈관 질환 환자를 위한 중환자실', '#dc2626', 3),
  ('ped-er', '소아응급실', 'Siren', '소아 응급 환자를 위한 응급진료실', '#ea580c', 4);
```

**변경 — 기존 patients INSERT에 department_id 추가**

```sql
INSERT INTO patients (chart_number, name, gestational_weeks, birth_weight, birth_date, admission_date, department_id) VALUES
  ('0561528', '이하은', 32, 1850, '2024-10-15', '2024-10-15', 1);
```

### 검증
- departments 테이블에 4개 행 존재
- 각 진료과의 slug, name, theme_color 확인
- 기존 환자(0561528)의 department_id가 1(nicu)

---

## Prompt 3: API 엔드포인트에 department 필터 추가

### 파일: `server/routes/content.ts`

**변경 1 — GET /api/content/categories에 department 필터 추가**

```typescript
// GET /api/content/categories?department=nicu
router.get('/categories', (req, res) => {
  const { department } = req.query;
  let query = 'SELECT id, name, slug, icon_name, sort_order, is_journey_step, journey_step_order FROM content_categories';
  const params: any[] = [];

  if (department) {
    query += ' WHERE department_id = (SELECT id FROM departments WHERE slug = ?)';
    params.push(department);
  }
  query += ' ORDER BY sort_order';

  const categories = db.prepare(query).all(...params);
  res.json(categories);
});
```

**변경 2 — GET /api/content/modules에 department 필터 추가**

쿼리의 WHERE 절에 department 파라미터 처리 추가:
```typescript
const { category, status, department } = req.query;
// ... 기존 로직 유지 ...
if (department) {
  query += ' AND c.department_id = (SELECT id FROM departments WHERE slug = ?)';
  params.push(department);
}
```

**변경 3 — POST /api/content/categories에 department_id 처리 추가**

```typescript
const { name, slug, icon_name, sort_order, is_journey_step, journey_step_order, department_id } = req.body;
// INSERT에 department_id 컬럼 추가
```

### 파일: `server/routes/discharge.ts`

**변경 — GET /api/discharge/categories에 department 필터 추가**

```typescript
const { department } = req.query;
let query = 'SELECT ... FROM discharge_categories';
if (department) {
  query += ' WHERE department_id = (SELECT id FROM departments WHERE slug = ?)';
}
```

### 파일: `server/routes/patients.ts`

**변경 — patients 관련 쿼리에 department_id 반영**

환자 생성 시 department_id 수신 및 저장.

### 새 파일: `server/routes/departments.ts`

**신규 — departments CRUD 라우터**

```typescript
import { Router } from 'express';
import db from '../config/database.js';

const router = Router();

// GET /api/departments — 전체 진료과 목록 (공개)
router.get('/', (_req, res) => {
  const departments = db.prepare(
    'SELECT id, slug, name, icon_name, description, theme_color, sort_order FROM departments ORDER BY sort_order'
  ).all();
  res.json(departments);
});

// GET /api/departments/:slug — 단일 진료과 조회
router.get('/:slug', (req, res) => {
  const dept = db.prepare(
    'SELECT id, slug, name, icon_name, description, theme_color FROM departments WHERE slug = ?'
  ).get(req.params.slug);
  if (!dept) return res.status(404).json({ error: '진료과를 찾을 수 없습니다.' });
  res.json(dept);
});

export default router;
```

### 파일: `server/index.ts`

**변경 — departments 라우터 등록**

```typescript
import departmentsRouter from './routes/departments.js';
// ...
app.use('/api/departments', departmentsRouter);
```

### 검증
- `GET /api/departments` → 4개 진료과 반환
- `GET /api/content/categories?department=nicu` → NICU 카테고리만 반환
- `GET /api/content/categories` (필터 없음) → 전체 반환 (하위호환)
- `GET /api/content/modules?department=nicu` → NICU 모듈만 반환

---

## Prompt 4: 프론트엔드 API 클라이언트 & 타입 업데이트

### 파일: `src/types.ts`

**추가 — Department 타입**

```typescript
export interface Department {
  id: number;
  slug: string;
  name: string;
  icon_name: string;
  description: string;
  theme_color: string;
  sort_order: number;
}
```

### 파일: `src/api/endpoints.ts`

**추가 — departments API 함수**

```typescript
export async function getDepartments(): Promise<Department[]> {
  return api.get('/departments');
}

export async function getDepartment(slug: string): Promise<Department> {
  return api.get(`/departments/${slug}`);
}
```

**변경 — 기존 content API에 department 파라미터 옵션 추가**

```typescript
export async function getContentCategories(department?: string) {
  const params = department ? `?department=${department}` : '';
  return api.get(`/content/categories${params}`);
}
```

### 검증
- TypeScript 컴파일 에러 없음
- 기존 호출부(department 미전달) 하위호환 유지

---

## 완료 기준 (UAT)

1. ✅ `departments` 테이블 생성, 4개 진료과 시드 데이터 존재
2. ✅ 6개 기존 테이블에 `department_id` FK 추가 (DEFAULT 1)
3. ✅ 기존 NICU 데이터가 `department_id=1`로 자동 귀속
4. ✅ `GET /api/departments` 엔드포인트 동작
5. ✅ 콘텐츠/퇴원매뉴얼 API에 `?department=slug` 필터 동작
6. ✅ 기존 API 호출(department 미지정) 하위호환 유지
7. ✅ `Department` TypeScript 타입 및 프론트엔드 API 함수 추가
8. ✅ 앱 정상 빌드 및 기존 기능 정상 동작
