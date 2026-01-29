# 会員サイト

React + TypeScript と Node.js + Express + TypeScript で構築された会員サイトです。

## 機能

- ユーザー登録・ログイン
- JWT認証
- 会員プロフィール管理
- 会員タイプ別コンテンツ（基本・プレミアム・VIP）
- レスポンシブデザイン

## 技術スタック

### フロントエンド
- React 18
- TypeScript
- React Router
- Axios

### バックエンド
- Node.js
- Express
- TypeScript
- SQLite
- JWT認証
- bcryptjs（パスワードハッシュ化）

## セットアップ

### 1. 依存関係のインストール

```bash
npm run install-all
```

### 2. 環境変数の設定

`server/.env` ファイルを作成し、以下の内容を設定してください：

```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. 開発サーバーの起動

フロントエンドとバックエンドを同時に起動：

```bash
npm run dev
```

または、個別に起動：

```bash
# バックエンドのみ
npm run server

# フロントエンドのみ（別ターミナル）
npm run client
```

### 4. アクセス

- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:5000

## 使用方法

1. **新規登録**: `/register` でアカウントを作成
2. **ログイン**: `/login` でログイン
3. **ダッシュボード**: ログイン後、会員タイプに応じたコンテンツを確認
4. **プロフィール**: プロフィール情報の閲覧・編集

## API エンドポイント

### 認証
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ログイン
- `GET /api/auth/verify` - トークン検証

### 会員（認証必須）
- `GET /api/members/profile` - プロフィール取得
- `PUT /api/members/profile` - プロフィール更新
- `GET /api/members/content` - 会員専用コンテンツ取得

## データベース

SQLiteデータベースが自動的に作成されます（`server/members.db`）。

### テーブル構造

- `users`: ユーザー情報
- `member_profiles`: 会員プロフィール情報

## 本番環境へのデプロイ

1. 環境変数を適切に設定
2. `JWT_SECRET` を強力なランダム文字列に変更
3. データベースを本番用（PostgreSQL等）に変更
4. HTTPSを有効化
5. セキュリティヘッダーを設定

## ライセンス

MIT
