# Renderデプロイ - 完全ガイド（最初から最後まで）

## バックエンドのデプロイ（現在の画面から）

### ステップ1: 基本設定（現在の画面）

1. **Language（言語）**
   - ドロップダウンをクリック
   - `Docker` → `Node` に変更
   - ⚠️ 重要：必ず `Node` を選択してください

2. **Root Directory（ルートディレクトリ）**
   - 空欄に `server` と入力
   - ⚠️ 重要：これがないとデプロイが失敗します

3. **Name（名前）**
   - 現在: `membership-site`
   - 推奨: `membership-site-backend` に変更（後で識別しやすく）

4. **Branch（ブランチ）**
   - `main` のままでOK

5. **Region（リージョン）**
   - `Oregon (US West)` または `Tokyo (Asia Pacific)` を選択
   - 日本からアクセスする場合は `Tokyo` 推奨

6. **Dockerfile Path**
   - Nodeを選択すると表示されなくなるか、無視してOK

### ステップ2: Advanced設定を開く

1. 画面下部の **"Advanced"** ボタンをクリック
2. または、設定項目の下に "Advanced" セクションがある場合はそこを開く

### ステップ3: Build & Deploy設定

Advancedを開くと、以下の設定項目が表示されます：

1. **Build Command（ビルドコマンド）**
   - 入力: `npm install && npm run build`
   - コピー&ペーストしてください

2. **Start Command（起動コマンド）**
   - 入力: `node dist/index.js`
   - コピー&ペーストしてください

### ステップ4: Environment Variables（環境変数）を設定

"Environment Variables" セクションで、以下の3つを追加：

**変数1: PORT**
- Key: `PORT`
- Value: `5001`
- "Add" または "+" ボタンをクリック

**変数2: NODE_ENV**
- Key: `NODE_ENV`
- Value: `production`
- "Add" ボタンをクリック

**変数3: JWT_SECRET**
- Key: `JWT_SECRET`
- Value: `531c99a7ba2313c3f685c7ac0fb6aeddbdcbb2d0eb3981177c414fa928677528`
- "Add" ボタンをクリック

### ステップ5: デプロイを開始

1. すべての設定が完了したら
2. 画面下部の **"Create Web Service"** ボタンをクリック
3. デプロイが開始されます
4. ログ画面が表示されるので、エラーがないか確認

### ステップ6: デプロイ完了を待つ

1. デプロイには3-5分かかります
2. ログで以下が表示されれば成功：
   - "Build successful"
   - "Your service is live"
3. 画面にURLが表示されます
   - 例: `https://membership-site-backend.onrender.com`
4. **このURLをコピーしてメモしてください**（後で使います）

---

## フロントエンドのデプロイ

### ステップ1: ダッシュボードに戻る

1. 左上の **"Dashboard"** をクリック
2. または、左上のロゴをクリック

### ステップ2: 新しいサービスを作成

1. ダッシュボードで **"New +"** ボタンをクリック
2. 今度は **"Static Site"** を選択
   - ⚠️ 注意：Web Serviceではなく、Static Siteです

### ステップ3: リポジトリを選択

1. "Connect a repository" で
2. 同じGitHubリポジトリ `membership-site` を選択
3. "Connect" をクリック

### ステップ4: フロントエンドの基本設定

1. **Name（名前）**
   - 入力: `membership-site-frontend`

2. **Branch（ブランチ）**
   - `main` のままでOK

3. **Root Directory（ルートディレクトリ）**
   - 入力: `client`
   - ⚠️ 重要：バックエンドは `server`、フロントエンドは `client`

4. **Region（リージョン）**
   - バックエンドと同じリージョンを選択

### ステップ5: Build設定

1. **Build Command（ビルドコマンド）**
   - 入力: `npm install && npm run build`

2. **Publish Directory（公開ディレクトリ）**
   - 入力: `client/build`
   - ⚠️ 重要：これがないとデプロイが失敗します

### ステップ6: Environment Variables（環境変数）

"Advanced" を開いて、以下を追加：

**変数: REACT_APP_API_URL**
- Key: `REACT_APP_API_URL`
- Value: `https://membership-site-backend.onrender.com/api`
  - ⚠️ 重要：`membership-site-backend` の部分は、ステップ6で取得した実際のURLに置き換えてください
  - 例：バックエンドURLが `https://xxx.onrender.com` なら、`https://xxx.onrender.com/api`

### ステップ7: フロントエンドのデプロイを開始

1. **"Create Static Site"** ボタンをクリック
2. デプロイが開始されます
3. 完了するとURLが表示されます

---

## 完了後の確認

### 1. 動作確認

1. フロントエンドのURLにアクセス
2. ログインページが表示されるか確認
3. 新規登録を試す
4. ログインを試す
5. ダッシュボードでデータを確認

### 2. 管理者アカウントでログイン

- メール: `aoi.baseball.trainer@gmail.com`
- パスワード: `aoi`

### 3. 管理者画面にアクセス

- URL: `https://your-frontend-url.onrender.com/admin`
- 承認待ちユーザーを確認・承認できるか確認

---

## トラブルシューティング

### デプロイが失敗する

1. Renderダッシュボードの "Logs" タブを確認
2. エラーメッセージを確認
3. よくある原因：
   - Root Directoryが間違っている（`server` と `client`）
   - Build Commandが間違っている
   - 環境変数が設定されていない

### バックエンドに接続できない

1. フロントエンドの `REACT_APP_API_URL` が正しいか確認
2. バックエンドのURLが `https://` で始まっているか確認
3. バックエンドがデプロイ完了しているか確認

### ログインできない

1. データベースが初期化されていない可能性
2. バックエンドのログを確認
3. 環境変数 `JWT_SECRET` が設定されているか確認

---

## まとめチェックリスト

### バックエンド
- [ ] Language: `Node` を選択
- [ ] Root Directory: `server` を入力
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `node dist/index.js`
- [ ] PORT: `5001`
- [ ] NODE_ENV: `production`
- [ ] JWT_SECRET: 設定済み
- [ ] デプロイ完了
- [ ] URLをメモ

### フロントエンド
- [ ] Static Siteを選択（Web Serviceではない）
- [ ] Root Directory: `client` を入力
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `client/build` を入力
- [ ] REACT_APP_API_URL: バックエンドURL + `/api`
- [ ] デプロイ完了
- [ ] 動作確認
