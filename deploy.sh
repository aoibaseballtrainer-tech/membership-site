#!/bin/bash

# デプロイスクリプト
# 使用方法: ./deploy.sh user@server.com /path/to/deploy

set -e

SERVER=$1
DEPLOY_PATH=${2:-~/membership-site}

if [ -z "$SERVER" ]; then
  echo "使用方法: ./deploy.sh user@server.com [デプロイパス]"
  exit 1
fi

echo "🚀 デプロイを開始します..."
echo "サーバー: $SERVER"
echo "デプロイパス: $DEPLOY_PATH"

# ローカルでビルド
echo "📦 ローカルでビルド中..."
cd client
npm run build
cd ../server
npm run build
cd ..

# ファイルをアップロード（node_modulesと.gitを除外）
echo "📤 ファイルをアップロード中..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '*.db' \
  --exclude '*.db-journal' \
  --exclude 'client/build' \
  --exclude 'server/dist' \
  --exclude '.env' \
  ./ $SERVER:$DEPLOY_PATH/

# サーバー上でセットアップ
echo "🔧 サーバー上でセットアップ中..."
ssh $SERVER << EOF
  cd $DEPLOY_PATH
  
  # 依存関係のインストール
  echo "📦 依存関係をインストール中..."
  npm run install-all
  
  # サーバーをビルド
  echo "🔨 サーバーをビルド中..."
  cd server
  npm run build
  cd ..
  
  # クライアントをビルド
  echo "🔨 クライアントをビルド中..."
  cd client
  npm run build
  cd ..
  
  # PM2で再起動
  echo "🔄 PM2で再起動中..."
  cd server
  pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
  pm2 save
  
  echo "✅ デプロイ完了！"
EOF

echo "🎉 デプロイが完了しました！"
