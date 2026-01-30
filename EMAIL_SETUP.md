# メール送信機能の設定方法

## 概要
登録承認完了時に自動でメールを送信する機能を実装しました。

## 設定方法

### 1. Gmailを使用する場合（推奨）

#### ステップ1: Gmailアプリパスワードを取得
1. Googleアカウントの設定を開く: https://myaccount.google.com/
2. 「セキュリティ」をクリック
3. 「2段階認証プロセス」を有効にする（まだの場合）
4. 「アプリパスワード」をクリック
5. 「メール」と「その他（カスタム名）」を選択し、名前を入力（例: "Membership Site"）
6. 「生成」をクリックして、16文字のパスワードをコピー

#### ステップ2: Renderで環境変数を設定
Renderダッシュボードで、バックエンドサービスの「Environment」タブを開き、以下を追加：

```
EMAIL_SERVICE = gmail
EMAIL_USER = あなたのGmailアドレス@gmail.com
EMAIL_PASSWORD = 生成した16文字のアプリパスワード
FRONTEND_URL = https://membership-site-frontend.onrender.com
```

### 2. その他のメールサービスを使用する場合

#### SendGridを使用する場合
```
EMAIL_SERVICE = smtp
EMAIL_USER = apikey
EMAIL_PASSWORD = SendGridのAPIキー
EMAIL_HOST = smtp.sendgrid.net
EMAIL_PORT = 587
FRONTEND_URL = https://membership-site-frontend.onrender.com
```

#### その他のSMTPサーバーを使用する場合
`server/utils/email.ts` の `createTransporter` 関数を編集して、SMTP設定を追加してください。

## 動作確認

1. 環境変数を設定
2. バックエンドを再デプロイ
3. 管理画面でユーザーを承認
4. 承認されたユーザーのメールアドレスにメールが届くことを確認

## 注意事項

- メール設定が無い場合、メール送信はスキップされます（エラーにはなりません）
- Gmailの無料アカウントは1日あたり500通まで送信可能
- 本番環境では、SendGridやMailgunなどの専用サービスを使用することを推奨
