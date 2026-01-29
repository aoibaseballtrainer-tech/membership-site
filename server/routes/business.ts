import express, { Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { dbGet, dbRun, dbAll } from '../database';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// 事業データ入力・更新
router.post(
  '/data',
  authenticateToken,
  [
    body('year').isInt({ min: 2020, max: 2100 }).withMessage('有効な年を入力してください'),
    body('month').isInt({ min: 1, max: 12 }).withMessage('有効な月を入力してください'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.userId!;
      const {
        year,
        month,
        totalRevenue,
        productName,
        productPrice,
        productProfit,
        productSalesCount,
        totalLeads,
        newLeads,
        adSpend,
        cpa,
        cpl,
        roas,
        followerCount,
        impressions,
        reach,
        postCount,
      } = req.body;

      // 既存データチェック
      const existing = await dbGet(
        'SELECT id FROM business_data WHERE userId = ? AND year = ? AND month = ?',
        [userId, year, month]
      );

      if (existing) {
        // 更新
        await dbRun(
          `UPDATE business_data SET
            totalRevenue = ?,
            productName = ?,
            productPrice = ?,
            productProfit = ?,
            productSalesCount = ?,
            totalLeads = ?,
            newLeads = ?,
            adSpend = ?,
            cpa = ?,
            cpl = ?,
            roas = ?,
            followerCount = ?,
            impressions = ?,
            reach = ?,
            postCount = ?,
            updatedAt = CURRENT_TIMESTAMP
          WHERE id = ?`,
          [
            totalRevenue || null,
            productName || null,
            productPrice || null,
            productProfit || null,
            productSalesCount || null,
            totalLeads || null,
            newLeads || null,
            adSpend || null,
            cpa || null,
            cpl || null,
            roas || null,
            followerCount || null,
            impressions || null,
            reach || null,
            postCount || null,
            existing.id,
          ]
        );
      } else {
        // 新規作成
        await dbRun(
          `INSERT INTO business_data (
            userId, year, month,
            totalRevenue, productName, productPrice, productProfit, productSalesCount,
            totalLeads, newLeads,
            adSpend, cpa, cpl, roas,
            followerCount, impressions, reach, postCount
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            year,
            month,
            totalRevenue || null,
            productName || null,
            productPrice || null,
            productProfit || null,
            productSalesCount || null,
            totalLeads || null,
            newLeads || null,
            adSpend || null,
            cpa || null,
            cpl || null,
            roas || null,
            followerCount || null,
            impressions || null,
            reach || null,
            postCount || null,
          ]
        );
      }

      res.json({ message: 'データを保存しました' });
    } catch (error) {
      console.error('データ保存エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }
);

// 事業データ取得（自分のデータ）
router.get('/data', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { year, month, period } = req.query;

    let query = 'SELECT * FROM business_data WHERE userId = ?';
    const params: any[] = [userId];

    if (year && month) {
      query += ' AND year = ? AND month = ?';
      params.push(parseInt(year as string), parseInt(month as string));
    } else if (period === '3months') {
      // 過去3ヶ月
      const now = new Date();
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      query += ' AND (year * 100 + month) >= ?';
      params.push(threeMonthsAgo.getFullYear() * 100 + threeMonthsAgo.getMonth() + 1);
    } else if (period === '1year') {
      // 過去1年
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      query += ' AND (year * 100 + month) >= ?';
      params.push(oneYearAgo.getFullYear() * 100 + oneYearAgo.getMonth() + 1);
    }

    query += ' ORDER BY year DESC, month DESC';

    const data = await dbAll(query, params);
    res.json({ data });
  } catch (error) {
    console.error('データ取得エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 特定月のデータ取得
router.get('/data/:year/:month', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    const data = await dbGet(
      'SELECT * FROM business_data WHERE userId = ? AND year = ? AND month = ?',
      [userId, year, month]
    );

    res.json({ data: data || null });
  } catch (error) {
    console.error('データ取得エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

export { router as businessRoutes };
