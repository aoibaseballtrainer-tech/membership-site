# Renderデプロイ完全ガイド

## ステップ1: GitHubリポジトリを作成

### 方法A: GitHub Web UIで作成

1. https://github.com にログイン
2. 右上の "+" → "New repository" をクリック
3. 設定:
   - Repository name: `membership-site`（任意）
   - Description: `会員サイト - 事業データ管理システム`
   - Public または Private を選択
   - **Initialize this repository with a README** はチェックしない
4. "Create repository" をクリック
5. 表示されるコマンドをコピー（後で使用）

### 方法B: GitHub CLIで作成（インストール済みの場合）

```bash
gh repo create membership-site --public --source=. --remote=origin --push
```

---

## ステップ2: プロジェクトをGitHubにプッシュ

ターミナルで以下を実行：

```bash
cd /Users/aoi/membership-site

# GitHubリポジトリを追加（ステップ1で作成したリポジトリのURLを使用）
git remote add origin https://github.com/your-username/membership-site.git

# プッシュ
git branch -M main
git push -u origin main
```

---

## ステップ3: Renderでバックエンドをデプロイ

1. https://render.com にログイン
2. Dashboard → "New +" → "Web Service"
3. "Connect a repository" をクリック
4. GitHubリポジトリを選択（`membership-site`）
5. 設定を入力:
   - **Name**: `membership-site-backend`
   - **Region**: `Oregon (US West)` または `Tokyo (Asia Pacific)`
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/index.js`
6. "Advanced" をクリック
7. "Environment Variables" で以下を追加:
   ```
   PORT = 5001
   NODE_ENV = production
   JWT_SECRET = 531c99a7ba2313c3f685c7ac0fb6aeddbdcbb2d0eb3981177c414fa928677528
   ```
8. "Create Web Service" をクリック
9. デプロイ完了を待つ（数分かかります）
10. デプロイ完了後、URLをコピー（例: `https://membership-site-backend.onrender.com`）

---

## ステップ4: Renderでフロントエンドをデプロイ

1. Dashboard → "New +" → "Static Site"
2. "Connect a repository" をクリック
3. 同じGitHubリポジトリを選択
4. 設定を入力:
   - **Name**: `membership-site-frontend`
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `client/build`
5. "Advanced" をクリック
6. "Environment Variables" で以下を追加:
   ```
   REACT_APP_API_URL = https://membership-site-backend.onrender.com/api
   ```
   （ステップ3で取得したバックエンドURLを使用）
7. "Create Static Site" をクリック
8. デプロイ完了を待つ

---

## ステップ5: 動作確認

1. フロントエンドのURLにアクセス
2. ログインを試す
3. ダッシュボードでデータを確認

---

## トラブルシューティング

### デプロイが失敗する
- Renderダッシュボードの "Logs" タブでエラーを確認
- 環境変数が正しく設定されているか確認

### バックエンドに接続できない
- フロントエンドの `REACT_APP_API_URL` が正しいか確認
- バックエンドのURLが `https://` で始まっているか確認

### データベースエラー
- SQLiteファイルは永続化されません
- 本番環境ではPostgreSQLの使用を推奨（RenderでPostgreSQLサービスを作成可能）

---

## 次のステップ

- カスタムドメインの設定（Renderダッシュボードから）
- PostgreSQLデータベースの追加（本番環境推奨）
- SSL証明書の自動設定（Renderが自動で行います）
