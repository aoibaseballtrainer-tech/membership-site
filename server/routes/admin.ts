import express, { Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { dbGet, dbRun, dbAll } from '../database';
import { body, validationResult } from 'express-validator';
import { sendApprovalEmail, sendRejectionEmail } from '../utils/email';

const router = express.Router();

// 管理者権限チェック
async function checkAdmin(req: AuthRequest, res: Response, next: any) {
  try {
    const userId = req.userId!;
    const profile = await dbGet(
      'SELECT membershipType FROM member_profiles WHERE userId = ?',
      [userId]
    );

    if (profile?.membershipType !== 'vip' && profile?.membershipType !== 'admin') {
      return res.status(403).json({ error: '管理者権限が必要です' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
}

// 承認待ちユーザー一覧
router.get('/pending-users', authenticateToken, checkAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const users = await dbAll(
      'SELECT id, email, name, status, createdAt FROM users WHERE status = ? ORDER BY createdAt DESC',
      ['pending']
    );
    res.json({ users });
  } catch (error) {
    console.error('ユーザー一覧取得エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// ユーザー承認
router.post(
  '/approve-user',
  authenticateToken,
  checkAdmin,
  [body('userId').isInt().withMessage('ユーザーIDが必要です')],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId } = req.body;

      // ユーザー存在確認
      const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
      if (!user) {
        return res.status(404).json({ error: 'ユーザーが見つかりません' });
      }

      // ステータスを承認済みに更新
      await dbRun('UPDATE users SET status = ? WHERE id = ?', ['approved', userId]);

      // 会員プロフィールがなければ作成
      const profile = await dbGet('SELECT * FROM member_profiles WHERE userId = ?', [userId]);
      if (!profile) {
        await dbRun(
          'INSERT INTO member_profiles (userId, membershipType, status) VALUES (?, ?, ?)',
          [userId, 'basic', 'active']
        );
      }

      // 承認完了メールを送信
      await sendApprovalEmail(user.email, user.name);

      res.json({ message: 'ユーザーを承認しました' });
    } catch (error) {
      console.error('承認エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }
);

// ユーザー拒否
router.post(
  '/reject-user',
  authenticateToken,
  checkAdmin,
  [body('userId').isInt().withMessage('ユーザーIDが必要です')],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId } = req.body;

      // ユーザー情報を取得（メール送信用）
      const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
      if (!user) {
        return res.status(404).json({ error: 'ユーザーが見つかりません' });
      }

      await dbRun('UPDATE users SET status = ? WHERE id = ?', ['rejected', userId]);

      // 拒否通知メールを送信
      await sendRejectionEmail(user.email, user.name);

      res.json({ message: 'ユーザーを拒否しました' });
    } catch (error) {
      console.error('拒否エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }
);

// 全会員一覧
router.get('/all-users', authenticateToken, checkAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const users = await dbAll(
      `SELECT u.id, u.email, u.name, u.status, u.createdAt, mp.membershipType 
       FROM users u 
       LEFT JOIN member_profiles mp ON u.id = mp.userId 
       ORDER BY u.createdAt DESC`
    );
    res.json({ users });
  } catch (error) {
    console.error('ユーザー一覧取得エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 会員タイプ変更
router.post(
  '/update-membership-type',
  authenticateToken,
  checkAdmin,
  [
    body('userId').isInt().withMessage('ユーザーIDが必要です'),
    body('membershipType').isIn(['basic', 'vip', 'admin']).withMessage('有効な会員タイプを指定してください'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId, membershipType } = req.body;

      // ユーザー存在確認
      const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
      if (!user) {
        return res.status(404).json({ error: 'ユーザーが見つかりません' });
      }

      // 会員プロフィールを確認・更新
      const profile = await dbGet('SELECT * FROM member_profiles WHERE userId = ?', [userId]);
      if (profile) {
        await dbRun(
          'UPDATE member_profiles SET membershipType = ?, updatedAt = CURRENT_TIMESTAMP WHERE userId = ?',
          [membershipType, userId]
        );
      } else {
        await dbRun(
          'INSERT INTO member_profiles (userId, membershipType, status) VALUES (?, ?, ?)',
          [userId, membershipType, 'active']
        );
      }

      res.json({ message: '会員タイプを更新しました' });
    } catch (error) {
      console.error('会員タイプ更新エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }
);

export { router as adminRoutes };
