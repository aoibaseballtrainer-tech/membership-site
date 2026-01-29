# Railwayへのデプロイ手順（詳細版）

## 方法1: Web UIでデプロイ（最も簡単）

### ステップ1: Railwayアカウント作成

1. https://railway.app にアクセス
2. "Start a New Project" をクリック
3. GitHubアカウントでログイン

### ステップ2: バックエンドをデプロイ

1. "New Project" → "Deploy from GitHub repo" を選択
2. リポジトリを選択（または新規作成）
3. "Add Service" → "Empty Service" を選択
4. Settings → "Root Directory" を `server` に設定
5. Variables タブで以下を設定:
   - `PORT` = `5001`
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = （ランダム文字列、`openssl rand -hex 32`で生成）
6. "Deploy" をクリック
7. Settings → "Generate Domain" でURLを取得

### ステップ3: フロントエンドをデプロイ

1. 同じプロジェクトで "Add Service" → "Empty Service"
2. Settings → "Root Directory" を `client` に設定
3. Variables タブで以下を設定:
   - `REACT_APP_API_URL` = `https://your-backend.railway.app/api`
4. "Deploy" をクリック
5. Settings → "Generate Domain" でURLを取得

---

## 方法2: CLIでデプロイ（npx使用）

### バックエンド

```bash
cd /Users/aoi/membership-site/server

# ログイン
npx @railway/cli login

# プロジェクト初期化
npx @railway/cli init

# 環境変数設定
npx @railway/cli variables set PORT=5001
npx @railway/cli variables set NODE_ENV=production
npx @railway/cli variables set JWT_SECRET=$(openssl rand -hex 32)

# デプロイ
npx @railway/cli up

# URL確認
npx @railway/cli domain
```

### フロントエンド

```bash
cd /Users/aoi/membership-site/client

# プロジェクト初期化（同じプロジェクト内）
npx @railway/cli init

# 環境変数設定（バックエンドURLを設定）
npx @railway/cli variables set REACT_APP_API_URL=https://your-backend.railway.app/api

# デプロイ
npx @railway/cli up

# URL確認
npx @railway/cli domain
```

---

## 方法3: 自動スクリプト

```bash
cd /Users/aoi/membership-site
./deploy-railway-simple.sh
```

---

## 注意事項

1. **無料プランの制限**: Railwayの無料プランは月$5分のクレジットが付与されます
2. **データベース**: SQLiteファイルは永続化されないため、本番環境ではPostgreSQLの使用を推奨
3. **環境変数**: デプロイ後、環境変数が反映されない場合は再デプロイが必要な場合があります

---

## トラブルシューティング

### デプロイが失敗する
- Railwayダッシュボードの "Logs" タブでエラーを確認
- `railway.json` の設定を確認

### 環境変数が反映されない
- Variables タブで正しく設定されているか確認
- 再デプロイを実行

### ポートエラー
- Railwayは自動で `PORT` 環境変数を設定します
- コード内で `process.env.PORT` を使用しているか確認
