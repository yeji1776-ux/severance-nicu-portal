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
