import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRoutes } from './routes/auth';
import { memberRoutes } from './routes/members';
import { businessRoutes } from './routes/business';
import { adminRoutes } from './routes/admin';
import { youtubeRoutes } from './routes/youtube';
import { initDatabase, dbGet, dbRun } from './database';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ミドルウェア
app.use(cors());
app.use(express.json());

// データベース初期化
initDatabase();

// 管理者アカウントの自動作成
async function ensureAdminUser() {
  try {
    const email = 'aoi.baseball.trainer@gmail.com';
    const password = 'aoi';
    const name = '管理者';

    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUser) {
      // 既存ユーザーの場合、管理者権限と承認ステータスを確保
      const hashedPassword = await bcrypt.hash(password, 10);
      await dbRun('UPDATE users SET password = ?, name = ?, status = ? WHERE email = ?', [
        hashedPassword,
        name,
        'approved',
        email
      ]);

      const existingProfile = await dbGet('SELECT * FROM member_profiles WHERE userId = ?', [existingUser.id]);
      if (existingProfile) {
        await dbRun(
          'UPDATE member_profiles SET membershipType = ?, status = ? WHERE userId = ?',
          ['admin', 'active', existingUser.id]
        );
      } else {
        await dbRun(
          'INSERT INTO member_profiles (userId, membershipType, status) VALUES (?, ?, ?)',
          [existingUser.id, 'admin', 'active']
        );
      }
      console.log('✅ 管理者アカウントを確認・更新しました');
    } else {
      // 新規作成
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await dbRun(
        'INSERT INTO users (email, password, name, status) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, name, 'approved']
      );

      await dbRun(
        'INSERT INTO member_profiles (userId, membershipType, status) VALUES (?, ?, ?)',
        [result.lastID, 'admin', 'active']
      );
      console.log('✅ 管理者アカウントを作成しました');
    }
  } catch (error) {
    console.error('管理者アカウント作成エラー:', error);
  }
}

// サーバー起動時に管理者アカウントを確認
ensureAdminUser();

// ルート
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/youtube', youtubeRoutes);

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました`);
});
