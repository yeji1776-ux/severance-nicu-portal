import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthenticatedRequest, DbUser } from '../types/index.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// POST /api/auth/login (admin email/password)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: '이메일과 비밀번호를 입력해 주세요.' });
  }

  const bcrypt = await import('bcryptjs');
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as DbUser | undefined;

  if (!user) {
    return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)').run(user.id, 'login', `Admin ${user.email} logged in`);

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

// POST /api/auth/register-parent
// 등록번호(chart_number) + 이름으로 가입
router.post('/register-parent', (req, res) => {
  const { chartNumber, name } = req.body;

  if (!chartNumber || !name) {
    return res.status(400).json({ error: '등록번호와 이름을 모두 입력해 주세요.' });
  }

  const trimmedName = name.trim();
  const trimmedChart = chartNumber.trim();

  // Find patient by chart_number
  const patient = db.prepare('SELECT * FROM patients WHERE chart_number = ?').get(trimmedChart) as any;
  if (!patient) {
    return res.status(400).json({ error: '등록번호를 찾을 수 없습니다. 번호를 다시 확인해 주세요.' });
  }

  if (patient.status === 'expired') {
    return res.status(403).json({ error: '접근 기간이 만료되었습니다. 병원에 문의해 주세요.' });
  }

  // Check if this chart_number already has a parent registered
  const existingLink = db.prepare(`
    SELECT u.* FROM users u
    JOIN parent_patient pp ON pp.user_id = u.id
    WHERE pp.patient_id = ? AND u.role = 'parent'
  `).get(patient.id) as DbUser | undefined;

  if (existingLink) {
    return res.status(400).json({ error: '이미 등록된 환자입니다. 등록번호로 로그인해 주세요.' });
  }

  // Create parent user (no password, no PIN, no phone needed)
  const result = db.prepare(`
    INSERT INTO users (name, role) VALUES (?, 'parent')
  `).run(trimmedName);

  const userId = result.lastInsertRowid as number;

  // Link parent to patient
  db.prepare('INSERT INTO parent_patient (user_id, patient_id, relationship) VALUES (?, ?, ?)').run(userId, patient.id, 'parent');

  // Audit log
  db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)').run(userId, 'register_parent', `Parent ${trimmedName} registered with chart ${trimmedChart}`);

  const token = jwt.sign(
    { id: userId, email: null, name: trimmedName, role: 'parent' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.status(201).json({
    token,
    user: { id: userId, name: trimmedName, role: 'parent' },
    patient: { id: patient.id, name: patient.name, status: patient.status },
  });
});

// POST /api/auth/login-parent
// 등록번호(chart_number)만으로 로그인
router.post('/login-parent', (req, res) => {
  const { chartNumber } = req.body;

  if (!chartNumber) {
    return res.status(400).json({ error: '등록번호를 입력해 주세요.' });
  }

  const trimmedChart = chartNumber.trim();

  // Find patient
  const patient = db.prepare('SELECT * FROM patients WHERE chart_number = ?').get(trimmedChart) as any;
  if (!patient) {
    return res.status(401).json({ error: '등록번호를 찾을 수 없습니다.' });
  }

  if (patient.status === 'expired') {
    return res.status(403).json({ error: '접근 기간이 만료되었습니다. 병원에 문의해 주세요.' });
  }

  // Find linked parent
  const user = db.prepare(`
    SELECT u.* FROM users u
    JOIN parent_patient pp ON pp.user_id = u.id
    WHERE pp.patient_id = ? AND u.role = 'parent'
  `).get(patient.id) as DbUser | undefined;

  if (!user) {
    return res.status(401).json({ error: '등록되지 않은 번호입니다. 먼저 회원가입을 해 주세요.' });
  }

  const token = jwt.sign(
    { id: user.id, email: null, name: user.name, role: 'parent' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)').run(user.id, 'login_parent', `Parent ${user.name} logged in via chart ${trimmedChart}`);

  res.json({
    token,
    user: { id: user.id, name: user.name, role: 'parent' },
    patient: { id: patient.id, name: patient.name, status: patient.status },
  });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  let patients: any[] = [];
  if (user.role === 'parent') {
    patients = db.prepare(`
      SELECT p.* FROM patients p
      JOIN parent_patient pp ON pp.patient_id = p.id
      WHERE pp.user_id = ?
    `).all(user.id);

    // Auto-expire: discharged > 30 days ago
    for (const p of patients) {
      if (p.status === 'discharged' && p.discharge_date) {
        const discharged = new Date(p.discharge_date);
        const daysSince = (Date.now() - discharged.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince > 30) {
          db.prepare("UPDATE patients SET status = 'expired' WHERE id = ?").run(p.id);
          p.status = 'expired';
        }
      }
    }
  } else {
    patients = db.prepare('SELECT * FROM patients').all();
  }

  res.json({ ...user, patients });
});

export default router;
