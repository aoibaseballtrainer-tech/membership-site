# サーバーへのデプロイ方法

## クイックスタート（SSH経由）

### 1. サーバー情報を準備
- サーバーのIPアドレスまたはドメイン
- SSHユーザー名
- SSHキーまたはパスワード

### 2. デプロイスクリプトを実行

```bash
cd /Users/aoi/membership-site
./deploy.sh user@your-server.com
```

または手動で：

```bash
# 1. ビルド
cd client && npm run build && cd ..
cd server && npm run build && cd ..

# 2. サーバーにアップロード（rsync使用）
rsync -avz --exclude 'node_modules' --exclude '.git' \
  ./ user@server:~/membership-site/

# 3. サーバーにSSH接続してセットアップ
ssh user@server
cd ~/membership-site
npm run install-all
cd server && npm run build && cd ..
cd client && npm run build && cd ..
cd server && pm2 start ecosystem.config.js
```

## サーバー側の初期セットアップ

### 1. Node.jsとPM2のインストール

```bash
# Node.js 18以上をインストール
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2をインストール
sudo npm install -g pm2
```

### 2. 環境変数の設定

```bash
cd ~/membership-site/server
cp .env.example .env
nano .env
```

`.env`ファイルに以下を設定：
```
PORT=5001
JWT_SECRET=強力なランダム文字列（openssl rand -hex 32で生成可能）
NODE_ENV=production
```

### 3. Nginxの設定（オプション）

```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/membership-site
```

設定内容：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /home/user/membership-site/client/build;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/membership-site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## その他のデプロイ方法

詳細は `DEPLOY.md` を参照してください。
