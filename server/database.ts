import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

const dbPath = path.join(__dirname, 'members.db');
const db = new sqlite3.Database(dbPath);

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

    console.log('データベースが初期化されました');
  });
}

export { db };
