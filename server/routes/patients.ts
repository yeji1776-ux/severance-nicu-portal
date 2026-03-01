import { Router } from 'express';
import db from '../config/database.js';

const router = Router();

// GET /api/patients/:id
router.get('/:id', (req, res) => {
  const patient = db.prepare(
    'SELECT * FROM patients WHERE id = ?'
  ).get(req.params.id);

  if (!patient) {
    return res.status(404).json({ error: '환자를 찾을 수 없습니다.' });
  }
  res.json(patient);
});

// GET /api/patients/:id/journey
router.get('/:id/journey', (req, res) => {
  const journey = db.prepare(`
    SELECT t.id as template_id, t.step_order, t.label, t.sub_label, t.icon_name,
           COALESCE(pcj.status, 'pending') as status
    FROM care_journey_templates t
    LEFT JOIN patient_care_journey pcj ON pcj.template_id = t.id AND pcj.patient_id = ?
    ORDER BY t.step_order
  `).all(req.params.id);

  res.json(journey);
});

// GET /api/patients/:id/examinations
router.get('/:id/examinations', (req, res) => {
  const exams = db.prepare(`
    SELECT e.id, e.name, e.description, pe.scheduled_date, pe.status
    FROM patient_examinations pe
    JOIN examinations e ON pe.examination_id = e.id
    WHERE pe.patient_id = ?
    ORDER BY pe.scheduled_date
  `).all(req.params.id);

  res.json(exams);
});

// GET /api/patients/:id/vitals/latest
router.get('/:id/vitals/latest', (req, res) => {
  const vital = db.prepare(`
    SELECT * FROM vital_signs
    WHERE patient_id = ?
    ORDER BY recorded_at DESC
    LIMIT 1
  `).get(req.params.id);

  if (!vital) {
    return res.status(404).json({ error: '생체신호 데이터가 없습니다.' });
  }
  res.json(vital);
});

// GET /api/patients/:id/vitals/history?hours=24
router.get('/:id/vitals/history', (req, res) => {
  const hours = parseInt(req.query.hours as string) || 24;

  const vitals = db.prepare(`
    SELECT * FROM vital_signs
    WHERE patient_id = ? AND recorded_at >= datetime('now', ?)
    ORDER BY recorded_at ASC
  `).all(req.params.id, `-${hours} hours`);

  res.json(vitals);
});

// POST /api/patients/:id/vitals (for medical staff)
router.post('/:id/vitals', (req, res) => {
  const { heart_rate, respiratory_rate, oxygen_saturation, temperature } = req.body;
  const patientId = req.params.id;

  const result = db.prepare(`
    INSERT INTO vital_signs (patient_id, heart_rate, respiratory_rate, oxygen_saturation, temperature)
    VALUES (?, ?, ?, ?, ?)
  `).run(patientId, heart_rate, respiratory_rate, oxygen_saturation, temperature);

  res.status(201).json({ id: result.lastInsertRowid });
});

export default router;
