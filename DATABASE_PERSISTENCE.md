# データベース永続化の設定方法

## 問題
Renderの無料プランでは、ファイルシステムが永続化されないため、デプロイ時にデータベースファイルがリセットされる可能性があります。

## 解決方法

### 方法1: Render Diskを使用（推奨）

1. Renderダッシュボードでバックエンドサービスを開く
2. 「Settings」タブを開く
3. 「Disk」セクションで「Add disk」をクリック
4. 設定:
   - **Mount Path**: `/opt/render/project/src/server/data`
   - **Size**: 1GB（最小）
5. 環境変数を追加:
   ```
   DATABASE_DIR = /opt/render/project/src/server/data
   ```
6. サービスを再デプロイ

### 方法2: 環境変数で設定

Renderダッシュボードで環境変数を追加:
```
DATABASE_DIR = /opt/render/project/src/server/data
```

**注意**: Render Diskを追加しないと、このパスは永続化されません。

### 方法3: データベースのバックアップ機能を追加（将来実装）

定期的にデータベースをバックアップし、外部ストレージ（S3など）に保存する機能を追加できます。

## 現在の設定

- データベースファイル: `members.db`
- デフォルトの保存場所: `server/data/members.db`（ローカル開発時）
- Render環境: 環境変数`DATABASE_DIR`で指定されたパス、または`/opt/render/project/src/server/data`

## 確認方法

サーバーのログで以下が表示されます:
```
データベースパス: /opt/render/project/src/server/data/members.db
データベースに接続しました
```
