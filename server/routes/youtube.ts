import express, { Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { dbGet, dbRun, dbAll } from '../database';
import { body, validationResult } from 'express-validator';

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

// YouTubeリンク一覧取得（全ユーザーがアクセス可能）
router.get('/links', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM youtube_links';
    const params: any[] = [];

    if (category && ['wall_hitting', 'lecture', 'other'].includes(category as string)) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY createdAt DESC';

    const links = await dbAll(query, params);
    res.json({ links });
  } catch (error) {
    console.error('YouTubeリンク取得エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// YouTubeリンク作成（管理者のみ）
router.post(
  '/links',
  authenticateToken,
  checkAdmin,
  [
    body('title').notEmpty().withMessage('タイトルが必要です'),
    body('url').isURL().withMessage('有効なURLを入力してください'),
    body('category').isIn(['wall_hitting', 'lecture', 'other']).withMessage('有効なカテゴリを指定してください'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, url, category, description } = req.body;

      const result = await dbRun(
        'INSERT INTO youtube_links (title, url, category, description) VALUES (?, ?, ?, ?)',
        [title, url, category, description || null]
      );

      const newLink = await dbGet('SELECT * FROM youtube_links WHERE id = ?', [result.lastID]);
      res.status(201).json({ message: 'YouTubeリンクを追加しました', link: newLink });
    } catch (error) {
      console.error('YouTubeリンク作成エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }
);

// YouTubeリンク更新（管理者のみ）
router.put(
  '/links/:id',
  authenticateToken,
  checkAdmin,
  [
    body('title').notEmpty().withMessage('タイトルが必要です'),
    body('url').isURL().withMessage('有効なURLを入力してください'),
    body('category').isIn(['wall_hitting', 'lecture', 'other']).withMessage('有効なカテゴリを指定してください'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const id = parseInt(req.params.id);
      const { title, url, category, description } = req.body;

      // リンク存在確認
      const existingLink = await dbGet('SELECT * FROM youtube_links WHERE id = ?', [id]);
      if (!existingLink) {
        return res.status(404).json({ error: 'リンクが見つかりません' });
      }

      await dbRun(
        'UPDATE youtube_links SET title = ?, url = ?, category = ?, description = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [title, url, category, description || null, id]
      );

      const updatedLink = await dbGet('SELECT * FROM youtube_links WHERE id = ?', [id]);
      res.json({ message: 'YouTubeリンクを更新しました', link: updatedLink });
    } catch (error) {
      console.error('YouTubeリンク更新エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }
);

// YouTubeリンク削除（管理者のみ）
router.delete('/links/:id', authenticateToken, checkAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    // リンク存在確認
    const existingLink = await dbGet('SELECT * FROM youtube_links WHERE id = ?', [id]);
    if (!existingLink) {
      return res.status(404).json({ error: 'リンクが見つかりません' });
    }

    await dbRun('DELETE FROM youtube_links WHERE id = ?', [id]);
    res.json({ message: 'YouTubeリンクを削除しました' });
  } catch (error) {
    console.error('YouTubeリンク削除エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

export { router as youtubeRoutes };
