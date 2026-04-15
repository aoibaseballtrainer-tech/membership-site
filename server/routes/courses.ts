import express, { Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { dbGet, dbRun, dbAll } from '../database';

const router = express.Router();

// コースへのアクセス権チェック
async function checkCourseAccess(userId: number, courseId: number): Promise<boolean> {
  // VIP/adminユーザーは無料アクセス
  const profile = await dbGet<{ membershipType: string }>(
    'SELECT membershipType FROM member_profiles WHERE userId = ?',
    [userId]
  );

  if (profile && (profile.membershipType === 'vip' || profile.membershipType === 'admin')) {
    return true;
  }

  // 購入済みかチェック
  const purchase = await dbGet(
    'SELECT id FROM user_purchases WHERE userId = ? AND courseId = ?',
    [userId, courseId]
  );

  return !!purchase;
}

// コース一覧取得（公開）
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const courses = await dbAll(
      'SELECT * FROM courses WHERE isActive = 1 ORDER BY createdAt DESC'
    );

    // 各コースの動画数とカテゴリ情報を取得
    const coursesWithMeta = await Promise.all(
      courses.map(async (course: any) => {
        const videos = await dbAll(
          'SELECT categoryCode, categoryName, COUNT(*) as count FROM course_videos WHERE courseId = ? GROUP BY categoryCode, categoryName ORDER BY categoryCode',
          [course.id]
        );
        const totalVideos = await dbGet<{ count: number }>(
          'SELECT COUNT(*) as count FROM course_videos WHERE courseId = ?',
          [course.id]
        );
        return {
          ...course,
          categories: videos,
          totalVideos: totalVideos?.count || 0,
        };
      })
    );

    res.json({ courses: coursesWithMeta });
  } catch (error) {
    console.error('コース一覧取得エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// コース詳細取得（認証必須、アクセス権チェック）
router.get('/:slug', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;
    const userId = req.userId!;

    const course = await dbGet<any>(
      'SELECT * FROM courses WHERE slug = ? AND isActive = 1',
      [slug]
    );

    if (!course) {
      return res.status(404).json({ error: 'コースが見つかりません' });
    }

    const hasAccess = await checkCourseAccess(userId, course.id);

    // 動画一覧を取得
    const videos = await dbAll(
      'SELECT * FROM course_videos WHERE courseId = ? ORDER BY sortOrder ASC',
      [course.id]
    );

    // カテゴリ別にグループ化
    const categories: Record<string, any> = {};
    videos.forEach((video: any) => {
      if (!categories[video.categoryCode]) {
        categories[video.categoryCode] = {
          code: video.categoryCode,
          name: video.categoryName,
          videos: [],
        };
      }
      categories[video.categoryCode].videos.push({
        id: video.id,
        videoCode: video.videoCode,
        title: video.title,
        description: video.description,
        videoUrl: hasAccess ? video.videoUrl : null,
      });
    });

    // プロフィール情報も返す
    const profile = await dbGet<{ membershipType: string }>(
      'SELECT membershipType FROM member_profiles WHERE userId = ?',
      [userId]
    );

    res.json({
      course,
      categories: Object.values(categories),
      hasAccess,
      membershipType: profile?.membershipType || 'basic',
    });
  } catch (error) {
    console.error('コース詳細取得エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// コース購入（認証必須）
router.post('/:slug/purchase', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;
    const userId = req.userId!;

    const course = await dbGet<any>(
      'SELECT * FROM courses WHERE slug = ? AND isActive = 1',
      [slug]
    );

    if (!course) {
      return res.status(404).json({ error: 'コースが見つかりません' });
    }

    // 既に購入済みかチェック
    const existingPurchase = await dbGet(
      'SELECT id FROM user_purchases WHERE userId = ? AND courseId = ?',
      [userId, course.id]
    );

    if (existingPurchase) {
      return res.status(400).json({ error: '既に購入済みです' });
    }

    // VIP/adminは無料アクセスのため購入不要
    const profile = await dbGet<{ membershipType: string }>(
      'SELECT membershipType FROM member_profiles WHERE userId = ?',
      [userId]
    );

    if (profile && (profile.membershipType === 'vip' || profile.membershipType === 'admin')) {
      return res.status(400).json({ error: 'VIP/管理者は購入不要です。既にアクセス権があります。' });
    }

    const { paymentMethod } = req.body;

    // 購入記録を作成（Stripe未連携のため、記録のみ）
    await dbRun(
      'INSERT INTO user_purchases (userId, courseId, paymentMethod, amount) VALUES (?, ?, ?, ?)',
      [userId, course.id, paymentMethod || 'manual', course.price]
    );

    res.status(201).json({
      message: '購入が完了しました',
      course: { id: course.id, title: course.title, price: course.price },
    });
  } catch (error) {
    console.error('コース購入エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

export { router as courseRoutes };
