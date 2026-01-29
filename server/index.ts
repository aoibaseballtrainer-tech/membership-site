import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRoutes } from './routes/auth';
import { memberRoutes } from './routes/members';
import { businessRoutes } from './routes/business';
import { adminRoutes } from './routes/admin';
import { initDatabase } from './database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ミドルウェア
app.use(cors());
app.use(express.json());

// データベース初期化
initDatabase();

// ルート
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/admin', adminRoutes);

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました`);
});
