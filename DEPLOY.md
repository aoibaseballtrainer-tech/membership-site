# デプロイ手順

## 1. VPS/サーバーへのデプロイ（SSH経由）

### 前提条件
- SSHアクセス可能なサーバー
- Node.js 18以上がインストールされている
- PM2がインストールされている（`npm install -g pm2`）

### 手順

#### 1. サーバー上でプロジェクトをクローン/アップロード

```bash
# サーバーにSSH接続
ssh user@your-server.com

# プロジェクトディレクトリを作成
mkdir -p ~/membership-site
cd ~/membership-site

# ファイルをアップロード（rsync、scp、またはgit clone）
# 例: rsync
rsync -avz --exclude 'node_modules' --exclude '.git' /local/path/membership-site/ user@server:~/membership-site/
```

#### 2. サーバー上でセットアップ

```bash
cd ~/membership-site

# 依存関係のインストール
npm run install-all

# 環境変数の設定
cd server
cp .env.example .env
nano .env  # 編集: PORT=5001, JWT_SECRET=強力なランダム文字列

# ビルド
cd server
npm run build

cd ../client
npm run build
```

#### 3. PM2でバックエンドを起動

```bash
cd ~/membership-site/server
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # システム起動時に自動起動
```

#### 4. Nginxでリバースプロキシ設定

```nginx
# /etc/nginx/sites-available/membership-site
server {
    listen 80;
    server_name your-domain.com;

    # フロントエンド
    location / {
        root /home/user/membership-site/client/build;
        try_files $uri $uri/ /index.html;
    }

    # バックエンドAPI
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/membership-site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. SSL証明書の設定（Let's Encrypt）

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 2. Railway へのデプロイ

### 手順

```bash
# Railway CLIのインストール
npm i -g @railway/cli

# ログイン
railway login

# プロジェクトの初期化
cd /Users/aoi/membership-site
railway init

# バックエンドをデプロイ
cd server
railway up

# 環境変数を設定
railway variables set PORT=5001
railway variables set JWT_SECRET=your-secret-key

# フロントエンドを別プロジェクトとしてデプロイ
cd ../client
railway init
railway up
railway variables set REACT_APP_API_URL=https://your-backend.railway.app/api
```

---

## 3. Render へのデプロイ

### バックエンド

1. Renderダッシュボードで「New Web Service」を選択
2. GitHubリポジトリを接続
3. 設定:
   - Build Command: `cd server && npm install && npm run build`
   - Start Command: `cd server && node dist/index.js`
   - Environment Variables:
     - `PORT=5001`
     - `JWT_SECRET=your-secret-key`

### フロントエンド

1. 「New Static Site」を選択
2. 設定:
   - Build Command: `cd client && npm install && npm run build`
   - Publish Directory: `client/build`
   - Environment Variables:
     - `REACT_APP_API_URL=https://your-backend.onrender.com/api`

---

## 4. Heroku へのデプロイ

### バックエンド

```bash
cd server
heroku create your-app-name-backend
heroku config:set JWT_SECRET=your-secret-key
git subtree push --prefix server heroku main
```

### フロントエンド

```bash
cd client
heroku create your-app-name-frontend
heroku buildpacks:set mars/create-react-app
heroku config:set REACT_APP_API_URL=https://your-backend.herokuapp.com/api
git subtree push --prefix client heroku main
```

---

## 5. Vercel + Railway の組み合わせ

### バックエンド（Railway）

```bash
cd server
railway init
railway up
```

### フロントエンド（Vercel）

```bash
cd client
vercel
# 環境変数: REACT_APP_API_URL=https://your-backend.railway.app/api
```

---

## 環境変数の設定

### バックエンド（server/.env）
```
PORT=5001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
```

### フロントエンド（client/.env.production）
```
REACT_APP_API_URL=https://your-backend-domain.com/api
```

---

## データベースの移行

SQLiteファイル（`server/members.db`）をサーバーにコピーするか、本番環境ではPostgreSQLなどの使用を推奨します。

PostgreSQLに移行する場合:
1. `server/database.ts`をPostgreSQL用に変更
2. 接続文字列を環境変数で設定
