# Railwayへのクイックデプロイ

## ステップ1: Railwayアカウント作成

1. https://railway.app にアクセス
2. "Login" をクリック
3. GitHubアカウントでログイン（推奨）

## ステップ2: デプロイ実行

### 方法A: 自動スクリプト（推奨）

```bash
cd /Users/aoi/membership-site
./railway-deploy.sh
```

### 方法B: 手動デプロイ

#### バックエンド

```bash
cd /Users/aoi/membership-site/server

# Railway CLIでログイン
railway login

# プロジェクトを初期化
railway init

# 環境変数を設定
railway variables set PORT=5001
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=$(openssl rand -hex 32)

# デプロイ
railway up
```

#### フロントエンド

```bash
cd /Users/aoi/membership-site/client

# プロジェクトを初期化
railway init

# バックエンドのURLを確認（別ターミナルで）
# railway --service server domain

# 環境変数を設定（バックエンドURLを設定）
railway variables set REACT_APP_API_URL=https://your-backend.railway.app/api

# デプロイ
railway up
```

## ステップ3: ドメイン設定（オプション）

Railwayダッシュボードで：
1. プロジェクトを選択
2. Settings → Generate Domain をクリック
3. カスタムドメインを設定（オプション）

## トラブルシューティング

- デプロイが失敗する場合: Railwayダッシュボードのログを確認
- 環境変数が反映されない場合: 再デプロイが必要な場合があります
- ポートエラー: Railwayは自動でPORT環境変数を設定します

