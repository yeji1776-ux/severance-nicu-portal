import { Router, Response } from 'express';
import db from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { generateResponse } from '../services/geminiService';
import rateLimit from 'express-rate-limit';

const router = Router();
router.use(authenticateToken);

// Rate limit: 10 requests per minute per user
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req: any) => req.user?.id?.toString() || 'anonymous',
  message: { error: '요청이 너무 많습니다. 1분 후 다시 시도해 주세요.' },
  validate: false,
});

// GET /api/ai/sessions
router.get('/sessions', (req: AuthenticatedRequest, res: Response) => {
  const sessions = db.prepare(
    'SELECT * FROM ai_chat_sessions WHERE user_id = ? ORDER BY created_at DESC'
  ).all(req.user!.id);
  res.json(sessions);
});

// POST /api/ai/sessions
router.post('/sessions', (req: AuthenticatedRequest, res: Response) => {
  const result = db.prepare(
    'INSERT INTO ai_chat_sessions (user_id, title) VALUES (?, ?)'
  ).run(req.user!.id, '새 대화');
  res.status(201).json({ id: result.lastInsertRowid, title: '새 대화' });
});

// GET /api/ai/sessions/:id/messages
router.get('/sessions/:id/messages', (req: AuthenticatedRequest, res: Response) => {
  // Verify session belongs to user
  const session = db.prepare(
    'SELECT * FROM ai_chat_sessions WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.user!.id);

  if (!session) {
    return res.status(404).json({ error: '세션을 찾을 수 없습니다.' });
  }

  const messages = db.prepare(
    'SELECT * FROM ai_chat_messages WHERE session_id = ? ORDER BY created_at ASC'
  ).all(req.params.id);

  res.json(messages);
});

// POST /api/ai/chat
router.post('/chat', chatLimiter, async (req: AuthenticatedRequest, res: Response) => {
  const { sessionId, message } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: '메시지를 입력해 주세요.' });
  }

  // Verify session
  const session = db.prepare(
    'SELECT * FROM ai_chat_sessions WHERE id = ? AND user_id = ?'
  ).get(sessionId, req.user!.id);

  if (!session) {
    return res.status(404).json({ error: '세션을 찾을 수 없습니다.' });
  }

  // Check message limit per session (50)
  const msgCount = (db.prepare(
    'SELECT COUNT(*) as count FROM ai_chat_messages WHERE session_id = ?'
  ).get(sessionId) as any).count;

  if (msgCount >= 50) {
    return res.status(400).json({ error: '세션당 최대 50개 메시지까지 가능합니다. 새 대화를 시작해 주세요.' });
  }

  // Save user message
  db.prepare(
    'INSERT INTO ai_chat_messages (session_id, role, content) VALUES (?, ?, ?)'
  ).run(sessionId, 'user', message);

  // Get conversation history
  const history = db.prepare(
    'SELECT role, content FROM ai_chat_messages WHERE session_id = ? ORDER BY created_at ASC'
  ).all(sessionId) as { role: string; content: string }[];

  // Generate AI response
  const aiResponse = await generateResponse(message, history.slice(0, -1));

  // Save AI response
  db.prepare(
    'INSERT INTO ai_chat_messages (session_id, role, content) VALUES (?, ?, ?)'
  ).run(sessionId, 'assistant', aiResponse);

  // Update session title from first message
  if (msgCount === 0) {
    const title = message.length > 30 ? message.slice(0, 30) + '...' : message;
    db.prepare('UPDATE ai_chat_sessions SET title = ? WHERE id = ?').run(title, sessionId);
  }

  res.json({
    userMessage: { role: 'user', content: message },
    aiMessage: { role: 'assistant', content: aiResponse },
  });
});

export default router;
