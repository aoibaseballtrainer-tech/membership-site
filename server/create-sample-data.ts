import { dbGet, dbRun, initDatabase } from './database';

async function createSampleData() {
  try {
    initDatabase();

    // aoi.baseball.trainer@gmail.comのユーザーIDを取得
    const user = await dbGet('SELECT id FROM users WHERE email = ?', ['aoi.baseball.trainer@gmail.com']);
    
    if (!user) {
      console.log('❌ ユーザーが見つかりません');
      process.exit(1);
    }

    const userId = user.id;
    const now = new Date();
    
    // 過去3ヶ月分のデータを作成
    for (let i = 0; i < 3; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      // 既存データチェック
      const existing = await dbGet(
        'SELECT id FROM business_data WHERE userId = ? AND year = ? AND month = ?',
        [userId, year, month]
      );

      if (existing) {
        console.log(`⚠️  ${year}/${month}のデータは既に存在します。スキップします。`);
        continue;
      }

      // サンプルデータ生成（ランダムな値）
      const baseRevenue = 500000 + Math.random() * 200000;
      const baseLeads = 50 + Math.floor(Math.random() * 50);
      const baseAdSpend = 100000 + Math.random() * 50000;
      const baseFollowers = 1000 + Math.floor(Math.random() * 500);

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
          Math.round(baseRevenue),
          'メイン商品',
          Math.round(50000 + Math.random() * 20000),
          Math.round(baseRevenue * 0.3),
          Math.floor(baseLeads * 0.2),
          Math.round(baseLeads * 1.5),
          Math.round(baseLeads),
          Math.round(baseAdSpend),
          Math.round(baseAdSpend / baseLeads),
          Math.round(baseAdSpend / baseLeads),
          Math.round((baseRevenue / baseAdSpend) * 100) / 100,
          Math.round(baseFollowers),
          Math.round(baseFollowers * 10),
          Math.round(baseFollowers * 8),
          Math.floor(10 + Math.random() * 10),
        ]
      );

      console.log(`✅ ${year}/${month}のデータを作成しました`);
    }

    console.log('\n✅ サンプルデータの作成が完了しました！');
    process.exit(0);
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

createSampleData();
