import { Router } from 'express';
import db from '../config/database';

const router = Router();

// GET /api/content/categories
router.get('/categories', (_req, res) => {
  const categories = db.prepare(
    'SELECT id, name, slug, sort_order FROM content_categories ORDER BY sort_order'
  ).all();
  res.json(categories);
});

// GET /api/content/modules?category=slug&status=published
router.get('/modules', (req, res) => {
  const { category, status } = req.query;

  let query = `
    SELECT m.id, m.title, m.subtitle, m.type, m.status, m.created_at, m.updated_at,
           c.name as category_name, c.slug as category_slug
    FROM content_modules m
    JOIN content_categories c ON m.category_id = c.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (category) {
    query += ' AND c.slug = ?';
    params.push(category);
  }
  if (status) {
    query += ' AND m.status = ?';
    params.push(status);
  }

  query += ' ORDER BY m.created_at DESC';

  const modules = db.prepare(query).all(...params);
  res.json(modules);
});

// GET /api/content/modules/:id
router.get('/modules/:id', (req, res) => {
  const module = db.prepare(`
    SELECT m.*, c.name as category_name, c.slug as category_slug
    FROM content_modules m
    JOIN content_categories c ON m.category_id = c.id
    WHERE m.id = ?
  `).get(req.params.id);

  if (!module) {
    return res.status(404).json({ error: '모듈을 찾을 수 없습니다.' });
  }
  res.json(module);
});

export default router;
