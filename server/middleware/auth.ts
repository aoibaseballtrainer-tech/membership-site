import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbGet } from '../database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthRequest extends Request {
  userId?: number;
  user?: any;
}

export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: '認証が必要です' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    const user = await dbGet('SELECT id, email, name FROM users WHERE id = ?', [decoded.userId]);

    if (!user) {
      return res.status(401).json({ error: 'ユーザーが見つかりません' });
    }

    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: '無効なトークンです' });
  }
}
