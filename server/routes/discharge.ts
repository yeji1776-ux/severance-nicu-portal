import { Router } from 'express';
import db from '../config/database.js';

const router = Router();

// GET /api/discharge/categories — returns categories with items
router.get('/categories', (req, res) => {
  const { department } = req.query;

  let catQuery = 'SELECT id, title, subtitle, icon_name, is_emergency, sort_order FROM discharge_categories';
  const catParams: any[] = [];
  if (department) {
    catQuery += ' WHERE department_id = (SELECT id FROM departments WHERE slug = ?)';
    catParams.push(department);
  }
  catQuery += ' ORDER BY sort_order';

  const categories = db.prepare(catQuery).all(...catParams) as any[];

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
