import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import { dbGet, dbRun } from '../database';
import { sendPasswordResetEmail, sendRegistrationEmail } from '../utils/email';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const PASSWORD_RESET_EXPIRY_HOURS = 1;

// ユーザー登録
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('有効なメールアドレスを入力してください'),
    body('password').isLength({ min: 6 }).withMessage('パスワードは6文字以上である必要があります'),
    body('name').notEmpty().withMessage('名前を入力してください'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name } = req.body;

      // 既存ユーザーチェック
      const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
      if (existingUser) {
        return res.status(400).json({ error: 'このメールアドレスは既に登録されています' });
      }

      // パスワードハッシュ化
      const hashedPassword = await bcrypt.hash(password, 10);

      // ユーザー作成（承認待ちステータス）
      const result = await dbRun(
        'INSERT INTO users (email, password, name, status) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, name, 'pending']
      );

      // 会員プロフィールは承認後に作成されるため、ここでは作成しない
      await sendRegistrationEmail(email, name, password);

      res.status(201).json({
        message: '登録申請を受け付けました。管理者の承認をお待ちください。登録内容はメールでもご案内しています。',
        pending: true,
      });
    } catch (error) {
      console.error('登録エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }
);

router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('有効なメールアドレスを入力してください')],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      const user = await dbGet<{ id: number; email: string; name: string; status: string }>(
        'SELECT id, email, name, status FROM users WHERE email = ?',
        [email]
      );

      if (!user || user.status === 'rejected') {
        return res.json({
          message: '該当アカウントが存在する場合は、パスワード再設定メールを送信しました。',
          emailSent: false,
        });
      }

      await dbRun('DELETE FROM password_reset_tokens WHERE userId = ? OR expiresAt < CURRENT_TIMESTAMP', [user.id]);

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

      await dbRun(
        'INSERT INTO password_reset_tokens (userId, token, expiresAt) VALUES (?, ?, ?)',
        [user.id, token, expiresAt]
      );

      const emailSent = await sendPasswordResetEmail(user.email, user.name, token);

      return res.json({
        message: '該当アカウントが存在する場合は、パスワード再設定メールを送信しました。',
        emailSent,
      });
    } catch (error) {
      console.error('パスワード再設定メール送信エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('再設定トークンが必要です'),
    body('password').isLength({ min: 6 }).withMessage('パスワードは6文字以上である必要があります'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token, password } = req.body;
      const resetRow = await dbGet<{ id: number; userId: number; expiresAt: string; usedAt: string | null }>(
        `SELECT id, userId, expiresAt, usedAt
         FROM password_reset_tokens
         WHERE token = ?`,
        [token]
      );

      if (!resetRow || resetRow.usedAt || new Date(resetRow.expiresAt).getTime() < Date.now()) {
        return res.status(400).json({ error: '再設定リンクが無効または期限切れです' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await dbRun('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, resetRow.userId]);
      await dbRun('UPDATE password_reset_tokens SET usedAt = CURRENT_TIMESTAMP WHERE id = ?', [resetRow.id]);
      await dbRun('DELETE FROM password_reset_tokens WHERE userId = ? AND id != ?', [resetRow.userId, resetRow.id]);

      res.json({ message: 'パスワードを再設定しました' });
    } catch (error) {
      console.error('パスワード再設定エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }
);

// ログイン
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('有効なメールアドレスを入力してください'),
    body('password').notEmpty().withMessage('パスワードを入力してください'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // ユーザー検索
      const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
      if (!user) {
        return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
      }

      // 承認ステータスチェック
      if (user.status === 'pending') {
        return res.status(403).json({ error: 'アカウントが承認待ちです。管理者の承認をお待ちください。' });
      }

      if (user.status === 'rejected') {
        return res.status(403).json({ error: 'アカウントが承認されていません。管理者にお問い合わせください。' });
      }

      // パスワード検証
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log(`ログイン失敗: ${email} - パスワード不一致`);
        return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
      }
      
      console.log(`ログイン成功: ${email} - ${user.name}`);

      // JWTトークン生成
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: '7d',
      });

      res.json({
        message: 'ログインに成功しました',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      console.error('ログインエラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }
);

// トークン検証
router.get('/verify', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'トークンが提供されていません' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    const user = await dbGet('SELECT id, email, name FROM users WHERE id = ?', [decoded.userId]);

    if (!user) {
      return res.status(401).json({ error: 'ユーザーが見つかりません' });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: '無効なトークンです' });
  }
});

export { router as authRoutes };
