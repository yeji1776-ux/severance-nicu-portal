import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import { AuthenticatedRequest } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: '인증이 필요합니다.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: number; email: string | null; name: string; role: string };
    req.user = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role as 'parent' | 'admin',
    };
    next();
  } catch {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }
    next();
  };
}

export function requirePatientAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: '인증이 필요합니다.' });
  }

  // Admins can access all patients
  if (req.user.role === 'admin') {
    return next();
  }

  const patientId = req.params.id;
  const access = db.prepare(
    'SELECT 1 FROM parent_patient WHERE user_id = ? AND patient_id = ?'
  ).get(req.user.id, patientId);

  if (!access) {
    return res.status(403).json({ error: '해당 환자에 대한 접근 권한이 없습니다.' });
  }

  next();
}
