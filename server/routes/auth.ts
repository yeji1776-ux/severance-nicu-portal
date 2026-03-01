import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthenticatedRequest, DbUser } from '../types/index.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: '이메일과 비밀번호를 입력해 주세요.' });
  }

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

  // Log login action
  db.prepare(
    'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)'
  ).run(user.id, 'login', `User ${user.email} logged in`);

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  // Get connected patients for parent users
  let patients: any[] = [];
  if (user.role === 'parent') {
    patients = db.prepare(`
      SELECT p.* FROM patients p
      JOIN parent_patient pp ON pp.patient_id = p.id
      WHERE pp.user_id = ?
    `).all(user.id);
  } else {
    patients = db.prepare('SELECT * FROM patients').all();
  }

  res.json({ ...user, patients });
});

export default router;
