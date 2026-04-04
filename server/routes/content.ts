import { Router } from 'express';
import db from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// ═══════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════

// GET /api/content/categories
router.get('/categories', (req, res) => {
  const { department } = req.query;
  let query = 'SELECT id, name, slug, icon_name, sort_order, is_journey_step, journey_step_order FROM content_categories';
  const params: any[] = [];

  if (department) {
    query += ' WHERE department_id = (SELECT id FROM departments WHERE slug = ?)';
    params.push(department);
  }
  query += ' ORDER BY sort_order';

  const categories = db.prepare(query).all(...params);
  res.json(categories);
});

// POST /api/content/categories — admin only
router.post('/categories', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const { name, slug, icon_name, sort_order, is_journey_step, journey_step_order, department_id } = req.body;
  if (!name || !slug) {
    return res.status(400).json({ error: '카테고리 이름과 슬러그가 필요합니다.' });
  }
  try {
    const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM content_categories').get() as any;
    const result = db.prepare(
      `INSERT INTO content_categories (name, slug, icon_name, sort_order, is_journey_step, journey_step_order, department_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      name,
      slug,
      icon_name || 'FileText',
      sort_order ?? ((maxOrder?.max ?? 0) + 1),
      is_journey_step ? 1 : 0,
      journey_step_order ?? null,
      department_id ?? 1
    );
    res.json({ id: result.lastInsertRowid, success: true });
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      return res.status(409).json({ error: '이미 존재하는 슬러그입니다.' });
    }
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/content/categories/:id — admin only
router.put('/categories/:id', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const { name, slug, icon_name, sort_order, is_journey_step, journey_step_order } = req.body;
  const { id } = req.params;
  try {
    db.prepare(
      `UPDATE content_categories SET name = ?, slug = ?, icon_name = ?, sort_order = ?, is_journey_step = ?, journey_step_order = ?
       WHERE id = ?`
    ).run(name, slug, icon_name, sort_order, is_journey_step ? 1 : 0, journey_step_order ?? null, id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/content/categories/:id — admin only
router.delete('/categories/:id', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const moduleCount = db.prepare('SELECT COUNT(*) as count FROM content_modules WHERE category_id = ?').get(Number(id)) as any;
  if (moduleCount?.count > 0) {
    return res.status(400).json({ error: `이 카테고리에 ${moduleCount.count}개의 카드가 있습니다. 먼저 카드를 삭제하거나 이동하세요.` });
  }
  db.prepare('DELETE FROM content_categories WHERE id = ?').run(Number(id));
  res.json({ success: true });
});

// PUT /api/content/categories/reorder — admin only
router.put('/categories/reorder', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const { items } = req.body; // [{id, sort_order}]
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'items 배열이 필요합니다.' });
  }
  for (const item of items) {
    db.prepare('UPDATE content_categories SET sort_order = ? WHERE id = ?').run(item.sort_order, item.id);
  }
  res.json({ success: true });
});

// ═══════════════════════════════════════════
// MODULES (CARDS)
// ═══════════════════════════════════════════

// GET /api/content/modules?category=slug&status=published
router.get('/modules', (req, res) => {
  const { category, status, department } = req.query;

  let query = `
    SELECT m.id, m.title, m.icon_name, m.content, m.sort_order,
           m.warnings, m.alerts, m.links, m.images, m.tag, m.status,
           m.created_at, m.updated_at,
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

  if (department) {
    query += ' AND c.department_id = (SELECT id FROM departments WHERE slug = ?)';
    params.push(department);
  }

  query += ' ORDER BY m.sort_order ASC';

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
  `).get(Number(req.params.id));

  if (!module) {
    return res.status(404).json({ error: '모듈을 찾을 수 없습니다.' });
  }
  res.json(module);
});

// POST /api/content/modules — admin only
router.post('/modules', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const { category_id, title, icon_name, content, sort_order, warnings, alerts, links, images, tag } = req.body;
  if (!category_id || !title) {
    return res.status(400).json({ error: '카테고리 ID와 제목이 필요합니다.' });
  }
  const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM content_modules WHERE category_id = ?').get(Number(category_id)) as any;
  const result = db.prepare(
    `INSERT INTO content_modules (category_id, title, icon_name, content, sort_order, warnings, alerts, links, images, tag, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')`
  ).run(
    Number(category_id),
    title,
    icon_name || 'FileText',
    content || '',
    sort_order ?? ((maxOrder?.max ?? 0) + 1),
    warnings ? (typeof warnings === 'string' ? warnings : JSON.stringify(warnings)) : null,
    alerts ? (typeof alerts === 'string' ? alerts : JSON.stringify(alerts)) : null,
    links ? (typeof links === 'string' ? links : JSON.stringify(links)) : null,
    images ? (typeof images === 'string' ? images : JSON.stringify(images)) : null,
    tag || null
  );
  res.json({ id: result.lastInsertRowid, success: true });
});

// PUT /api/content/modules/:id — admin only
router.put('/modules/:id', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const { title, icon_name, content, sort_order, warnings, alerts, links, images, tag, status } = req.body;
  const { id } = req.params;
  db.prepare(
    `UPDATE content_modules SET title = ?, icon_name = ?, content = ?, sort_order = ?,
     warnings = ?, alerts = ?, links = ?, images = ?, tag = ?, status = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    title,
    icon_name,
    content,
    sort_order,
    warnings ? (typeof warnings === 'string' ? warnings : JSON.stringify(warnings)) : null,
    alerts ? (typeof alerts === 'string' ? alerts : JSON.stringify(alerts)) : null,
    links ? (typeof links === 'string' ? links : JSON.stringify(links)) : null,
    images ? (typeof images === 'string' ? images : JSON.stringify(images)) : null,
    tag || null,
    status || 'published',
    Number(id)
  );
  res.json({ success: true });
});

// DELETE /api/content/modules/:id — admin only
router.delete('/modules/:id', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  db.prepare('DELETE FROM content_modules WHERE id = ?').run(Number(req.params.id));
  res.json({ success: true });
});

// PUT /api/content/modules/reorder — admin only
router.put('/modules/reorder', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const { items } = req.body; // [{id, sort_order}]
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'items 배열이 필요합니다.' });
  }
  for (const item of items) {
    db.prepare('UPDATE content_modules SET sort_order = ? WHERE id = ?').run(item.sort_order, item.id);
  }
  res.json({ success: true });
});

// ═══════════════════════════════════════════
// LEGACY: Content overrides (keep for backward compatibility)
// ═══════════════════════════════════════════

// GET /api/content/overrides — public
router.get('/overrides', (_req, res) => {
  const rows = db.prepare('SELECT card_title, card_desc FROM content_overrides').all() as { card_title: string; card_desc: string }[];
  const result: Record<string, string> = {};
  for (const row of rows) result[row.card_title] = row.card_desc;
  res.json(result);
});

// PUT /api/content/overrides — admin only
router.put('/overrides', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const { cardTitle, cardDesc } = req.body;
  if (!cardTitle || cardDesc === undefined) {
    return res.status(400).json({ error: '카드 제목과 내용이 필요합니다.' });
  }
  db.prepare(`
    INSERT INTO content_overrides (card_title, card_desc, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(card_title) DO UPDATE SET card_desc = excluded.card_desc, updated_at = excluded.updated_at
  `).run(cardTitle, cardDesc);
  res.json({ success: true });
});

// DELETE /api/content/overrides/:cardTitle — admin only
router.delete('/overrides/:cardTitle', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const cardTitle = decodeURIComponent(req.params.cardTitle);
  db.prepare('DELETE FROM content_overrides WHERE card_title = ?').run(cardTitle);
  res.json({ success: true });
});

export default router;
