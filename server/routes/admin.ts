import { Router, Response } from 'express';
import crypto from 'crypto';
import db from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { AuthenticatedRequest, DbInvitationCode } from '../types/index.js';

const router = Router();

function generateInvitationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 0/O, 1/I 제외
  let code = '';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

// All admin routes require authentication and admin role
router.use(authenticateToken, requireRole('admin'));

// GET /api/admin/content/stats
router.get('/content/stats', (_req, res) => {
  const totalModules = (db.prepare('SELECT COUNT(*) as count FROM content_modules').get() as any).count;
  const published = (db.prepare("SELECT COUNT(*) as count FROM content_modules WHERE status = 'published'").get() as any).count;
  const review = (db.prepare("SELECT COUNT(*) as count FROM content_modules WHERE status = 'review'").get() as any).count;
  const draft = (db.prepare("SELECT COUNT(*) as count FROM content_modules WHERE status = 'draft'").get() as any).count;
  const lastUpdate = db.prepare('SELECT updated_at FROM content_modules ORDER BY updated_at DESC LIMIT 1').get() as any;

  res.json({
    totalModules,
    published,
    review,
    draft,
    lastUpdate: lastUpdate?.updated_at || null,
  });
});

// PUT /api/admin/content/modules/bulk-publish (must be before :id route)
router.put('/content/modules/bulk-publish', (req: AuthenticatedRequest, res: Response) => {
  const reviewModules = db.prepare("SELECT id, title FROM content_modules WHERE status = 'review'").all() as any[];

  if (reviewModules.length === 0) {
    return res.json({ published: 0 });
  }

  const stmt = db.prepare("UPDATE content_modules SET status = 'published', updated_at = datetime('now') WHERE id = ?");
  const logStmt = db.prepare('INSERT INTO audit_logs (user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)');

  const bulkPublish = db.transaction(() => {
    for (const mod of reviewModules) {
      stmt.run(mod.id);
      logStmt.run(req.user!.id, 'publish', 'content_module', mod.id, `Published module: ${mod.title}`);
    }
  });

  bulkPublish();
  res.json({ published: reviewModules.length });
});

// POST /api/admin/content/modules
router.post('/content/modules', (req: AuthenticatedRequest, res: Response) => {
  const { title, subtitle, category_id, type, status, content } = req.body;

  const result = db.prepare(`
    INSERT INTO content_modules (category_id, title, subtitle, type, status, content)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(category_id, title, subtitle || null, type, status || 'draft', content || null);

  db.prepare('INSERT INTO audit_logs (user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)')
    .run(req.user!.id, 'create', 'content_module', result.lastInsertRowid, `Created module: ${title}`);

  res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /api/admin/content/modules/:id
router.put('/content/modules/:id', (req: AuthenticatedRequest, res: Response) => {
  const { title, subtitle, type, status, content } = req.body;
  const id = req.params.id;

  const existing = db.prepare('SELECT * FROM content_modules WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: '모듈을 찾을 수 없습니다.' });
  }

  db.prepare(`
    UPDATE content_modules SET title = ?, subtitle = ?, type = ?, status = ?, content = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(title, subtitle, type, status, content, id);

  db.prepare('INSERT INTO audit_logs (user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)')
    .run(req.user!.id, 'update', 'content_module', id, `Updated module: ${title}`);

  res.json({ success: true });
});

// DELETE /api/admin/content/modules/:id
router.delete('/content/modules/:id', (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;

  const existing = db.prepare('SELECT * FROM content_modules WHERE id = ?').get(id) as any;
  if (!existing) {
    return res.status(404).json({ error: '모듈을 찾을 수 없습니다.' });
  }

  db.prepare('DELETE FROM content_modules WHERE id = ?').run(id);

  db.prepare('INSERT INTO audit_logs (user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)')
    .run(req.user!.id, 'delete', 'content_module', id, `Deleted module: ${existing.title}`);

  res.json({ success: true });
});

// Notices CRUD
router.post('/notices', (req: AuthenticatedRequest, res: Response) => {
  const { title, description, date } = req.body;
  const result = db.prepare('INSERT INTO notices (title, description, date) VALUES (?, ?, ?)').run(title, description, date || new Date().toISOString().slice(0, 10));
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/notices/:id', (req: AuthenticatedRequest, res: Response) => {
  const { title, description, date } = req.body;
  db.prepare('UPDATE notices SET title = ?, description = ?, date = ? WHERE id = ?').run(title, description, date, req.params.id);
  res.json({ success: true });
});

router.delete('/notices/:id', (_req, res) => {
  db.prepare('DELETE FROM notices WHERE id = ?').run(_req.params.id);
  res.json({ success: true });
});

// Patient management
router.get('/patients', (_req, res) => {
  const patients = db.prepare(`
    SELECT p.*,
      u.name as guardian_name,
      u.phone as guardian_phone,
      u.id as guardian_user_id,
      ic.code as pending_invitation_code,
      ic.expires_at as invitation_expires_at
    FROM patients p
    LEFT JOIN parent_patient pp ON pp.patient_id = p.id
    LEFT JOIN users u ON u.id = pp.user_id
    LEFT JOIN invitation_codes ic ON ic.patient_id = p.id AND ic.used_by IS NULL AND ic.expires_at > datetime('now')
    ORDER BY p.created_at DESC
  `).all();
  res.json(patients);
});

router.post('/patients', (req: AuthenticatedRequest, res: Response) => {
  const { chart_number, name, gestational_weeks, birth_weight, birth_date, admission_date, department_id } = req.body;
  const deptId = department_id || (req as any).user?.department_id || 1;
  const result = db.prepare(`
    INSERT INTO patients (chart_number, name, gestational_weeks, birth_weight, birth_date, admission_date, department_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(chart_number, name, gestational_weeks, birth_weight, birth_date, admission_date, deptId);

  // Initialize care journey for new patient
  const templates = db.prepare('SELECT id FROM care_journey_templates WHERE department_id = ? ORDER BY step_order').all(deptId) as any[];
  for (const tmpl of templates) {
    db.prepare('INSERT INTO patient_care_journey (patient_id, template_id, status) VALUES (?, ?, ?)').run(result.lastInsertRowid, tmpl.id, 'pending');
  }

  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/patients/:id', (req: AuthenticatedRequest, res: Response) => {
  const { name, gestational_weeks, birth_weight, birth_date, admission_date, discharge_date } = req.body;
  const status = discharge_date ? 'discharged' : 'active';
  db.prepare(`
    UPDATE patients SET name = ?, gestational_weeks = ?, birth_weight = ?, birth_date = ?, admission_date = ?, discharge_date = ?, status = ?
    WHERE id = ?
  `).run(name, gestational_weeks, birth_weight, birth_date, admission_date, discharge_date || null, status, req.params.id);
  res.json({ success: true });
});

// Journey step update
router.put('/patients/:id/journey/:stepId', (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body;
  const { id, stepId } = req.params;

  db.prepare('UPDATE patient_care_journey SET status = ? WHERE patient_id = ? AND template_id = ?').run(status, id, stepId);

  db.prepare('INSERT INTO audit_logs (user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)')
    .run(req.user!.id, 'update_journey', 'patient', id, `Step ${stepId} -> ${status}`);

  res.json({ success: true });
});

// Invitation code generation
router.post('/patients/:id/invitation-code', (req: AuthenticatedRequest, res: Response) => {
  const patientId = req.params.id;

  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);
  if (!patient) {
    return res.status(404).json({ error: '환자를 찾을 수 없습니다.' });
  }

  // Invalidate any existing unused codes for this patient (optional: keep them)
  let code = generateInvitationCode();
  // Ensure uniqueness
  let attempts = 0;
  while (db.prepare('SELECT 1 FROM invitation_codes WHERE code = ?').get(code) && attempts < 10) {
    code = generateInvitationCode();
    attempts++;
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO invitation_codes (code, patient_id, created_by, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(code, patientId, req.user!.id, expiresAt);

  db.prepare('INSERT INTO audit_logs (user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)')
    .run(req.user!.id, 'create_invitation', 'patient', patientId, `Code: ${code}`);

  res.status(201).json({ code, expires_at: expiresAt });
});

router.get('/patients/:id/invitation-code', (_req, res) => {
  const patientId = _req.params.id;

  const code = db.prepare(`
    SELECT * FROM invitation_codes
    WHERE patient_id = ? AND used_by IS NULL AND expires_at > datetime('now')
    ORDER BY created_at DESC LIMIT 1
  `).get(patientId) as DbInvitationCode | undefined;

  const guardian = db.prepare(`
    SELECT u.name, u.phone FROM users u
    JOIN parent_patient pp ON pp.user_id = u.id
    WHERE pp.patient_id = ?
  `).get(patientId) as { name: string; phone: string } | undefined;

  res.json({ invitation: code || null, guardian: guardian || null });
});

// Notification history
router.get('/notifications/history', (_req, res) => {
  const logs = db.prepare(
    "SELECT * FROM audit_logs WHERE action LIKE '%notification%' ORDER BY created_at DESC LIMIT 50"
  ).all();
  res.json(logs);
});

// Broadcast notification
router.post('/notifications/broadcast', (req: AuthenticatedRequest, res: Response) => {
  const { title, message, type } = req.body;

  const users = db.prepare('SELECT id FROM users').all() as any[];
  const stmt = db.prepare('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)');

  const insertMany = db.transaction((users: any[]) => {
    for (const user of users) {
      stmt.run(user.id, title, message, type || 'info');
    }
  });

  insertMany(users);
  res.status(201).json({ sent: users.length });
});

export default router;
