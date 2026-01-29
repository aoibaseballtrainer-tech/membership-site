#!/bin/bash

# Railwayデプロイスクリプト

set -e

echo "🚀 Railwayへのデプロイを開始します..."
echo ""

# Railway CLIがインストールされているか確認
if ! command -v railway &> /dev/null; then
  echo "❌ Railway CLIがインストールされていません"
  echo "インストール中..."
  npm install -g @railway/cli
fi

echo "📦 Railwayにログインしてください..."
railway login

echo ""
echo "🔧 バックエンドをデプロイします..."
cd server

# Railwayプロジェクトを初期化（初回のみ）
if [ ! -f ".railway/project.json" ]; then
  echo "新規プロジェクトを作成します..."
  railway init
fi

# 環境変数を設定
echo "環境変数を設定中..."
railway variables set PORT=5001
railway variables set NODE_ENV=production

# JWT_SECRETが設定されていない場合、生成して設定
if ! railway variables get JWT_SECRET &> /dev/null; then
  JWT_SECRET=$(openssl rand -hex 32)
  railway variables set JWT_SECRET="$JWT_SECRET"
  echo "✅ JWT_SECRETを生成して設定しました"
fi

# デプロイ
echo "デプロイ中..."
railway up

cd ..

echo ""
echo "✅ バックエンドのデプロイが完了しました！"
echo ""
echo "次に、フロントエンドをデプロイします..."
echo "バックエンドのURLを確認してください:"
railway --service server domain

echo ""
read -p "バックエンドのURLを入力してください（例: https://xxx.railway.app）: " BACKEND_URL

cd client

# フロントエンド用のRailwayプロジェクトを初期化
if [ ! -f ".railway/project.json" ]; then
  echo "新規プロジェクトを作成します..."
  railway init
fi

# 環境変数を設定
railway variables set REACT_APP_API_URL="${BACKEND_URL}/api"

# デプロイ
echo "デプロイ中..."
railway up

cd ..

echo ""
echo "🎉 デプロイが完了しました！"
echo ""
echo "フロントエンドのURL:"
railway --service client domain
