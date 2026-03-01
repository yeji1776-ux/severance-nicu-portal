import { Router } from 'express';
import db from '../config/database.js';

const router = Router();

// GET /api/discharge/categories — returns categories with items
router.get('/categories', (_req, res) => {
  const categories = db.prepare(
    'SELECT id, title, subtitle, icon_name, is_emergency, sort_order FROM discharge_categories ORDER BY sort_order'
  ).all() as any[];

  const items = db.prepare(
    'SELECT id, category_id, content, sort_order FROM discharge_items ORDER BY sort_order'
  ).all() as any[];

  const result = categories.map(cat => ({
    ...cat,
    is_emergency: !!cat.is_emergency,
    items: items
      .filter(item => item.category_id === cat.id)
      .map(item => item.content),
  }));

  res.json(result);
});

export default router;
