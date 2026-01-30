import express, { Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { dbGet, dbRun, dbAll } from '../database';
import { body, validationResult } from 'express-validator';
import { sendApprovalEmail, sendRejectionEmail } from '../utils/email';
import bcrypt from 'bcryptjs';

const router = express.Router();

// 管理者権限チェック（adminのみ）
async function checkAdmin(req: AuthRequest, res: Response, next: any) {
  try {
    const userId = req.userId!;
    
    // ユーザー情報を取得
    const user = await dbGet('SELECT email FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(403).json({ error: 'ユーザーが見つかりません' });
    }

    // 小川葵のメールアドレスを確認
    const adminEmail = 'aoi.baseball.trainer@gmail.com';
    if (user.email === adminEmail) {
      // 小川葵は常に管理者権限を持つ
      next();
      return;
    }

    // その他のユーザーはadmin権限をチェック
    const profile = await dbGet(
      'SELECT membershipType FROM member_profiles WHERE userId = ?',
      [userId]
    );

    if (profile?.membershipType !== 'admin') {
      return res.status(403).json({ error: '管理者権限が必要です' });
    }

    next();
  } catch (error) {
    console.error('管理者権限チェックエラー:', error);
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

// 管理者によるユーザー追加
router.post(
  '/create-user',
  authenticateToken,
  checkAdmin,
  [
    body('email').isEmail().withMessage('有効なメールアドレスを入力してください'),
    body('password').isLength({ min: 6 }).withMessage('パスワードは6文字以上である必要があります'),
    body('name').notEmpty().withMessage('名前を入力してください'),
    body('membershipType').optional().isIn(['basic', 'vip', 'admin']).withMessage('有効な会員タイプを指定してください'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name, membershipType = 'basic' } = req.body;

      // 既存ユーザーチェック
      const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
      if (existingUser) {
        return res.status(400).json({ error: 'このメールアドレスは既に登録されています' });
      }

      // パスワードハッシュ化
      const hashedPassword = await bcrypt.hash(password, 10);

      // ユーザー作成（承認済みステータス）
      const result = await dbRun(
        'INSERT INTO users (email, password, name, status) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, name, 'approved']
      );

      // 会員プロフィール作成
      await dbRun(
        'INSERT INTO member_profiles (userId, membershipType, status) VALUES (?, ?, ?)',
        [result.lastID, membershipType, 'active']
      );

      // 承認完了メールを送信
      await sendApprovalEmail(email, name);

      const newUser = await dbGet('SELECT id, email, name, status FROM users WHERE id = ?', [result.lastID]);
      res.status(201).json({ message: 'ユーザーを作成しました', user: newUser });
    } catch (error) {
      console.error('ユーザー作成エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }
);

// ユーザー削除
router.delete('/delete-user/:userId', authenticateToken, checkAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.userId!;
    const targetUserId = parseInt(req.params.userId);

    // 現在のユーザー情報を取得
    const currentUser = await dbGet('SELECT email FROM users WHERE id = ?', [currentUserId]);
    if (!currentUser) {
      return res.status(403).json({ error: '認証エラーが発生しました' });
    }

    // 削除対象のユーザー存在確認
    const targetUser = await dbGet('SELECT * FROM users WHERE id = ?', [targetUserId]);
    if (!targetUser) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    // 小川葵のアカウントは削除不可
    const adminEmail = 'aoi.baseball.trainer@gmail.com';
    if (targetUser.email === adminEmail) {
      return res.status(403).json({ error: 'このアカウントは削除できません' });
    }

    // 自分自身を削除しようとした場合
    if (currentUserId === targetUserId) {
      return res.status(403).json({ error: '自分自身を削除することはできません' });
    }

    // 他の管理者を削除しようとした場合（小川葵以外の管理者は削除可能）
    const targetProfile = await dbGet('SELECT membershipType FROM member_profiles WHERE userId = ?', [targetUserId]);
    if (targetProfile?.membershipType === 'admin' && currentUser.email !== adminEmail) {
      return res.status(403).json({ error: '他の管理者を削除する権限がありません' });
    }

    // 会員プロフィールを削除
    await dbRun('DELETE FROM member_profiles WHERE userId = ?', [targetUserId]);
    
    // ユーザーを削除
    await dbRun('DELETE FROM users WHERE id = ?', [targetUserId]);

    res.json({ message: 'ユーザーを削除しました' });
  } catch (error) {
    console.error('ユーザー削除エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

export { router as adminRoutes };
