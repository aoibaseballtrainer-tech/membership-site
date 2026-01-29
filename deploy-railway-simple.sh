#!/bin/bash

# Railwayへの簡単デプロイ（npx使用）

echo "🚀 Railwayへのデプロイを開始します..."
echo ""
echo "まず、Railwayアカウントを作成してください:"
echo "1. https://railway.app にアクセス"
echo "2. GitHubアカウントでログイン"
echo ""
read -p "アカウント作成が完了したら Enter キーを押してください..."

echo ""
echo "📦 バックエンドをデプロイします..."
cd server

# Railway CLIでログイン
npx @railway/cli login

# プロジェクトを初期化
npx @railway/cli init

# 環境変数を設定
echo "環境変数を設定中..."
npx @railway/cli variables set PORT=5001
npx @railway/cli variables set NODE_ENV=production

# JWT_SECRETを生成して設定
JWT_SECRET=$(openssl rand -hex 32)
npx @railway/cli variables set JWT_SECRET="$JWT_SECRET"
echo "✅ JWT_SECRETを生成して設定しました"

# デプロイ
echo "デプロイ中..."
npx @railway/cli up

# バックエンドのURLを取得
echo ""
echo "バックエンドのURLを確認中..."
BACKEND_URL=$(npx @railway/cli domain 2>/dev/null | grep -o 'https://[^ ]*' | head -1)
echo "バックエンドURL: $BACKEND_URL"

cd ..

echo ""
echo "📦 フロントエンドをデプロイします..."
cd client

# プロジェクトを初期化
npx @railway/cli init

# 環境変数を設定
if [ ! -z "$BACKEND_URL" ]; then
  npx @railway/cli variables set REACT_APP_API_URL="${BACKEND_URL}/api"
  echo "✅ REACT_APP_API_URLを設定しました: ${BACKEND_URL}/api"
else
  echo "⚠️  バックエンドURLが取得できませんでした。手動で設定してください:"
  echo "   railway variables set REACT_APP_API_URL=https://your-backend.railway.app/api"
fi

# デプロイ
echo "デプロイ中..."
npx @railway/cli up

cd ..

echo ""
echo "🎉 デプロイが完了しました！"
echo ""
echo "フロントエンドのURLを確認してください:"
cd client
npx @railway/cli domain
cd ..

