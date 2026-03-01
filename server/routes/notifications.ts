import { Router, Response } from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

router.use(authenticateToken);

// GET /api/notifications
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const notifications = db.prepare(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
  ).all(req.user!.id);

  res.json(notifications);
});

// GET /api/notifications/unread-count
router.get('/unread-count', (req: AuthenticatedRequest, res: Response) => {
  const result = db.prepare(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0'
  ).get(req.user!.id) as any;

  res.json({ count: result.count });
});

// PUT /api/notifications/:id/read
router.put('/:id/read', (req: AuthenticatedRequest, res: Response) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user!.id);
  res.json({ success: true });
});

export default router;
