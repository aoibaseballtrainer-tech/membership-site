import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

// データベースディレクトリの設定
// Render Diskを使用する場合: /opt/render/project/src/server/data
// ローカル開発の場合: __dirname/data
// 環境変数で指定されていない場合は、Render環境を自動検出
const isRender = process.env.RENDER || process.env.RENDER_EXTERNAL_URL;
const defaultDbDir = isRender 
  ? '/opt/render/project/src/server/data'  // Render Diskのマウントポイント
  : path.join(__dirname, 'data');          // ローカル開発時

const dbDir = process.env.DATABASE_DIR || defaultDbDir;
const dbPath = path.join(dbDir, 'members.db');

// データベースディレクトリが存在しない場合は作成
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`データベースディレクトリを作成しました: ${dbDir}`);
}

console.log(`データベースディレクトリ: ${dbDir}`);
console.log(`データベースパス: ${dbPath}`);
console.log(`Render環境: ${isRender ? 'Yes' : 'No'}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('データベース接続エラー:', err);
  } else {
    console.log('データベースに接続しました');
    // データベースファイルの存在確認
    fs.access(dbPath, fs.constants.F_OK, (err) => {
      if (err) {
        console.log('データベースファイルは新規作成されます');
      } else {
        console.log('既存のデータベースファイルを使用します');
      }
    });
  }
});

// Promise化（型定義付き）
export function dbRun(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}

export const dbGet = promisify(db.get.bind(db)) as <T = any>(sql: string, params?: any[]) => Promise<T | undefined>;
export const dbAll = promisify(db.all.bind(db)) as <T = any>(sql: string, params?: any[]) => Promise<T[]>;

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

export function initDatabase() {
  db.serialize(() => {
    // ユーザーテーブル
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 会員情報テーブル
    db.run(`
      CREATE TABLE IF NOT EXISTS member_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        phone TEXT,
        address TEXT,
        membershipType TEXT DEFAULT 'basic',
        status TEXT DEFAULT 'active',
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // 事業データテーブル（月次データ）
    db.run(`
      CREATE TABLE IF NOT EXISTS business_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        -- 売上
        totalRevenue REAL,
        -- 商品情報
        productName TEXT,
        productPrice REAL,
        productProfit REAL,
        productSalesCount INTEGER,
        -- 集客
        totalLeads INTEGER,
        newLeads INTEGER,
        -- 広告
        adSpend REAL,
        cpa REAL,
        cpl REAL,
        roas REAL,
        -- SNS
        followerCount INTEGER,
        impressions INTEGER,
        reach INTEGER,
        postCount INTEGER,
        -- メタデータ
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        UNIQUE(userId, year, month)
      )
    `);

    // YouTubeリンクテーブル
    db.run(`
      CREATE TABLE IF NOT EXISTS youtube_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        category TEXT NOT NULL CHECK(category IN ('wall_hitting', 'lecture', 'other')),
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('データベースが初期化されました');
  });
}

export { db };
