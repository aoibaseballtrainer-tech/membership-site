import express, { Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { dbGet, dbRun, dbAll } from '../database';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// 会員情報取得（認証必須）
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // ユーザー情報とプロフィール情報を取得
    const user = await dbGet('SELECT id, email, name, createdAt FROM users WHERE id = ?', [userId]);
    const profile = await dbGet(
      'SELECT * FROM member_profiles WHERE userId = ?',
      [userId]
    );

    res.json({
      user,
      profile: profile || {
        membershipType: 'basic',
        status: 'active',
      },
    });
  } catch (error) {
    console.error('プロフィール取得エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 会員情報更新（認証必須）
router.put(
  '/profile',
  authenticateToken,
  [
    body('name').optional().notEmpty().withMessage('名前を入力してください'),
    body('phone').optional().isString(),
    body('address').optional().isString(),
    body('membershipType').optional().isIn(['basic', 'premium', 'vip']),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.userId!;
      const { name, phone, address, membershipType } = req.body;

      // ユーザー情報更新
      if (name) {
        await dbRun('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
      }

      // プロフィール更新または作成
      const existingProfile = await dbGet(
        'SELECT * FROM member_profiles WHERE userId = ?',
        [userId]
      );

      if (existingProfile) {
        await dbRun(
          `UPDATE member_profiles 
           SET phone = COALESCE(?, phone), 
               address = COALESCE(?, address),
               membershipType = COALESCE(?, membershipType),
               updatedAt = CURRENT_TIMESTAMP
           WHERE userId = ?`,
          [phone || null, address || null, membershipType || null, userId]
        );
      } else {
        await dbRun(
          'INSERT INTO member_profiles (userId, phone, address, membershipType) VALUES (?, ?, ?, ?)',
          [userId, phone || null, address || null, membershipType || 'basic']
        );
      }

      // 更新後の情報を取得
      const user = await dbGet('SELECT id, email, name, createdAt FROM users WHERE id = ?', [userId]);
      const profile = await dbGet('SELECT * FROM member_profiles WHERE userId = ?', [userId]);

      res.json({
        message: 'プロフィールが更新されました',
        user,
        profile,
      });
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }
);

// 会員専用コンテンツ（認証必須）
router.get('/content', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const user = req.user!;

    // 会員タイプに応じたコンテンツを返す
    const profile = await dbGet(
      'SELECT membershipType FROM member_profiles WHERE userId = ?',
      [userId]
    );

    const membershipType = profile?.membershipType || 'basic';

    const content = {
      basic: {
        message: '基本会員のコンテンツです',
        features: ['ニュースレター', '基本的なサポート'],
      },
      premium: {
        message: 'プレミアム会員のコンテンツです',
        features: ['ニュースレター', '優先サポート', '特別コンテンツ'],
      },
      vip: {
        message: 'VIP会員のコンテンツです',
        features: ['ニュースレター', '24/7サポート', '特別コンテンツ', '専用イベント'],
      },
    };

    res.json({
      membershipType,
      content: content[membershipType as keyof typeof content] || content.basic,
      welcomeMessage: `${user.name}さん、ようこそ！`,
    });
  } catch (error) {
    console.error('コンテンツ取得エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

export { router as memberRoutes };
