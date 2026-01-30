# Render Disk追加の簡単手順

## 3ステップで完了

### ステップ1: Renderダッシュボードを開く
https://dashboard.render.com にアクセス

### ステップ2: バックエンドサービスを開く
1. `membership-site` サービスをクリック
2. 「Settings」タブをクリック
3. 下にスクロールして「Disk」セクションを見つける

### ステップ3: Diskを追加
1. 「Add disk」ボタンをクリック
2. **Mount Path**: `/opt/render/project/src/server/data` と入力
3. **Size**: `1` と入力（GB）
4. 「Add disk」をクリック

**完了！** 自動的に再デプロイが開始されます。

## これで解決すること
- ✅ デプロイしてもデータが消えない
- ✅ ユーザー情報が永続化される
- ✅ ログイン情報が保持される
