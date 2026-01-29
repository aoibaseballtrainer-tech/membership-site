# Renderへのデプロイ手順（簡単）

## ステップ1: Renderアカウント作成

1. https://render.com にアクセス
2. "Get Started for Free" をクリック
3. GitHubアカウントでログイン（またはメールで登録）

## ステップ2: バックエンドをデプロイ

1. Dashboard → "New +" → "Web Service"
2. "Connect a repository" を選択
   - GitHubリポジトリがない場合は、後で手動でアップロード
3. 設定:
   - **Name**: `membership-site-backend`
   - **Region**: 最寄りのリージョン（Tokyo推奨）
   - **Branch**: `main` または `master`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/index.js`
4. "Advanced" で環境変数を追加:
   ```
   PORT = 5001
   NODE_ENV = production
   JWT_SECRET = （ランダム文字列）
   ```
   JWT_SECRETは以下で生成:
   ```bash
   openssl rand -hex 32
   ```
5. "Create Web Service" をクリック
6. デプロイ完了後、Settings → "Custom Domain" でURLを確認

## ステップ3: フロントエンドをデプロイ

1. Dashboard → "New +" → "Static Site"
2. "Connect a repository" を選択
3. 設定:
   - **Name**: `membership-site-frontend`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `client/build`
4. "Advanced" で環境変数を追加:
   ```
   REACT_APP_API_URL = https://your-backend.onrender.com/api
   ```
   （your-backend.onrender.com はステップ2で取得したURL）
5. "Create Static Site" をクリック

## 注意事項

- Renderの無料プランは15分間の非アクティブ後にスリープします
- 初回アクセス時に起動するまで数秒かかります
- データベース（SQLite）は永続化されないため、本番環境ではPostgreSQLの使用を推奨

