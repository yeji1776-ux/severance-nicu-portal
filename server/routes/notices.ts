import { Router } from 'express';
import db from '../config/database';

const router = Router();

// GET /api/notices?limit=5
router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;

  const notices = db.prepare(
    'SELECT id, title, description, date, created_at FROM notices ORDER BY date DESC LIMIT ?'
  ).all(limit);

  res.json(notices);
});

// GET /api/notices/:id
router.get('/:id', (req, res) => {
  const notice = db.prepare(
    'SELECT * FROM notices WHERE id = ?'
  ).get(req.params.id);

  if (!notice) {
    return res.status(404).json({ error: '공지사항을 찾을 수 없습니다.' });
  }
  res.json(notice);
});

export default router;
