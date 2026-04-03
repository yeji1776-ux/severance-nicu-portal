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

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  phone TEXT,
  pin_hash TEXT,
  role TEXT NOT NULL CHECK(role IN ('parent', 'admin')),
  department_id INTEGER REFERENCES departments(id),
  created_at TEXT DEFAULT (datetime('now'))
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chart_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  gestational_weeks INTEGER,
  birth_weight INTEGER,
  birth_date TEXT,
  admission_date TEXT,
  discharge_date TEXT,
  nickname TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'discharged', 'expired')),
  department_id INTEGER REFERENCES departments(id) DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Parent-Patient relationship (many-to-many)
CREATE TABLE IF NOT EXISTS parent_patient (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  patient_id INTEGER NOT NULL REFERENCES patients(id),
  relationship TEXT DEFAULT 'parent',
  UNIQUE(user_id, patient_id)
);

-- Care journey templates (5 steps)
CREATE TABLE IF NOT EXISTS care_journey_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  step_order INTEGER NOT NULL,
  label TEXT NOT NULL,
  sub_label TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  department_id INTEGER REFERENCES departments(id) DEFAULT 1
);

-- Patient-specific care journey progress
CREATE TABLE IF NOT EXISTS patient_care_journey (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id),
  template_id INTEGER NOT NULL REFERENCES care_journey_templates(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'completed')),
  UNIQUE(patient_id, template_id)
);

-- Content categories
CREATE TABLE IF NOT EXISTS content_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'FileText',
  sort_order INTEGER DEFAULT 0,
  is_journey_step INTEGER DEFAULT 0,
  journey_step_order INTEGER DEFAULT NULL,
  department_id INTEGER REFERENCES departments(id) DEFAULT 1,
  UNIQUE(department_id, slug)
);

-- Content modules (cards)
CREATE TABLE IF NOT EXISTS content_modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES content_categories(id),
  title TEXT NOT NULL,
  icon_name TEXT DEFAULT 'FileText',
  content TEXT,
  sort_order INTEGER DEFAULT 0,
  warnings TEXT DEFAULT NULL,
  alerts TEXT DEFAULT NULL,
  links TEXT DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Discharge manual categories
CREATE TABLE IF NOT EXISTS discharge_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subtitle TEXT,
  icon_name TEXT NOT NULL,
  is_emergency INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  department_id INTEGER REFERENCES departments(id) DEFAULT 1
);

-- Discharge manual items
CREATE TABLE IF NOT EXISTS discharge_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES discharge_categories(id),
  content TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Notices
CREATE TABLE IF NOT EXISTS notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  department_id INTEGER REFERENCES departments(id) DEFAULT 1
);

-- Examinations
CREATE TABLE IF NOT EXISTS examinations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  department_id INTEGER REFERENCES departments(id) DEFAULT 1
);

-- Patient examinations schedule
CREATE TABLE IF NOT EXISTS patient_examinations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id),
  examination_id INTEGER NOT NULL REFERENCES examinations(id),
  scheduled_date TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'completed', 'cancelled'))
);

-- Vital signs
CREATE TABLE IF NOT EXISTS vital_signs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id),
  heart_rate REAL,
  respiratory_rate REAL,
  oxygen_saturation REAL,
  temperature REAL,
  recorded_at TEXT DEFAULT (datetime('now'))
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT,
  type TEXT NOT NULL DEFAULT 'info' CHECK(type IN ('info', 'warning', 'urgent')),
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- AI Chat sessions
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT DEFAULT '새 대화',
  created_at TEXT DEFAULT (datetime('now'))
);

-- AI Chat messages
CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL REFERENCES ai_chat_sessions(id),
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id INTEGER,
  details TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Invitation codes
CREATE TABLE IF NOT EXISTS invitation_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  patient_id INTEGER NOT NULL REFERENCES patients(id),
  created_by INTEGER NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  used_by INTEGER REFERENCES users(id),
  used_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_parent_patient_user ON parent_patient(user_id);
CREATE INDEX IF NOT EXISTS idx_parent_patient_patient ON parent_patient(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_care_journey_patient ON patient_care_journey(patient_id);
CREATE INDEX IF NOT EXISTS idx_content_modules_category ON content_modules(category_id);
CREATE INDEX IF NOT EXISTS idx_discharge_items_category ON discharge_items(category_id);
CREATE INDEX IF NOT EXISTS idx_patient_examinations_patient ON patient_examinations(patient_id);
CREATE INDEX IF NOT EXISTS idx_vital_signs_patient ON vital_signs(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_user ON ai_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_session ON ai_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_invitation_codes_code ON invitation_codes(code);
CREATE INDEX IF NOT EXISTS idx_invitation_codes_patient ON invitation_codes(patient_id);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_dept ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_content_categories_dept ON content_categories(department_id);
CREATE INDEX IF NOT EXISTS idx_patients_dept ON patients(department_id);
CREATE INDEX IF NOT EXISTS idx_discharge_categories_dept ON discharge_categories(department_id);
CREATE INDEX IF NOT EXISTS idx_care_journey_templates_dept ON care_journey_templates(department_id);
CREATE INDEX IF NOT EXISTS idx_notices_dept ON notices(department_id);
CREATE INDEX IF NOT EXISTS idx_examinations_dept ON examinations(department_id);

-- Content overrides (admin-editable card descriptions)
CREATE TABLE IF NOT EXISTS content_overrides (
  card_title TEXT PRIMARY KEY,
  card_desc  TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);
