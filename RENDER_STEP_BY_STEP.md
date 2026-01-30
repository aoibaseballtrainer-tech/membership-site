# Renderデプロイ - ステップバイステップ詳細ガイド

## ステップ3: Renderでバックエンドをデプロイ

### 3-1. Renderにログイン

1. ブラウザで https://render.com を開く
2. 右上の "Get Started for Free" または "Sign In" をクリック
3. GitHubアカウントでログイン（推奨）またはメールで登録

### 3-2. バックエンドサービスを作成

1. ログイン後、Dashboard（ダッシュボード）が表示されます
2. 左上または中央の **"New +"** ボタンをクリック
3. メニューから **"Web Service"** を選択

### 3-3. GitHubリポジトリを接続

1. "Connect a repository" セクションで
2. GitHubアカウントを選択（初回は認証が必要）
3. リポジトリ一覧から **"membership-site"** を選択
4. "Connect" をクリック

### 3-4. バックエンドの設定を入力

以下の項目を入力してください：

- **Name**: `membership-site-backend`
  （任意の名前、後で変更可能）

- **Region**: 
  - `Oregon (US West)` または
  - `Tokyo (Asia Pacific)` を選択
  （日本からアクセスする場合はTokyo推奨）

- **Branch**: `main`
  （デフォルトのままでOK）

- **Root Directory**: `server`
  （重要！バックエンドのコードがあるディレクトリ）

- **Runtime**: `Node`
  （自動で選択されるはず）

- **Build Command**: `npm install && npm run build`
  （コピー&ペーストしてください）

- **Start Command**: `node dist/index.js`
  （コピー&ペーストしてください）

### 3-5. 環境変数を設定

1. 設定画面の下の方にある **"Advanced"** をクリック
2. **"Environment Variables"** セクションで、以下の3つを追加：

   **変数1:**
   - Key: `PORT`
   - Value: `5001`
   - "Add" をクリック

   **変数2:**
   - Key: `NODE_ENV`
   - Value: `production`
   - "Add" をクリック

   **変数3:**
   - Key: `JWT_SECRET`
   - Value: `531c99a7ba2313c3f685c7ac0fb6aeddbdcbb2d0eb3981177c414fa928677528`
   - "Add" をクリック

### 3-6. デプロイを開始

1. すべての設定が完了したら
2. 画面下部の **"Create Web Service"** ボタンをクリック
3. デプロイが開始されます（数分かかります）
4. ログが表示されるので、エラーがないか確認

### 3-7. バックエンドのURLを確認

1. デプロイが完了すると、画面にURLが表示されます
2. 例: `https://membership-site-backend.onrender.com`
3. このURLをコピーしてメモしておいてください
4. または、Settings → "Custom Domain" で確認できます

---

## ステップ4: Renderでフロントエンドをデプロイ

### 4-1. フロントエンドサービスを作成

1. Dashboardに戻る（左上の "Dashboard" をクリック）
2. 再度 **"New +"** ボタンをクリック
3. 今度は **"Static Site"** を選択
   （Web Serviceではなく、Static Siteです）

### 4-2. GitHubリポジトリを接続

1. 同じGitHubリポジトリ（membership-site）を選択
2. "Connect" をクリック

### 4-3. フロントエンドの設定を入力

- **Name**: `membership-site-frontend`

- **Branch**: `main`

- **Root Directory**: `client`
  （重要！フロントエンドのコードがあるディレクトリ）

- **Build Command**: `npm install && npm run build`
  （コピー&ペースト）

- **Publish Directory**: `client/build`
  （コピー&ペースト）

### 4-4. 環境変数を設定

1. "Advanced" をクリック
2. "Environment Variables" で以下を追加：

   **変数:**
   - Key: `REACT_APP_API_URL`
   - Value: `https://membership-site-backend.onrender.com/api`
     （ステップ3-7で取得したバックエンドURL + `/api`）
   - "Add" をクリック

### 4-5. デプロイを開始

1. **"Create Static Site"** ボタンをクリック
2. デプロイが開始されます
3. 完了するとURLが表示されます

---

## 完了！

フロントエンドのURLにアクセスして、サイトが動作するか確認してください。

### 確認事項

1. ログインページが表示される
2. 登録ができる
3. ログインができる
4. ダッシュボードでデータが表示される

---

## トラブルシューティング

### デプロイが失敗する

- Renderダッシュボードの "Logs" タブでエラーを確認
- 環境変数が正しく設定されているか確認
- Root Directoryが正しいか確認（`server` と `client`）

### バックエンドに接続できない

- フロントエンドの `REACT_APP_API_URL` が正しいか確認
- バックエンドのURLが `https://` で始まっているか確認
- バックエンドがデプロイ完了しているか確認
