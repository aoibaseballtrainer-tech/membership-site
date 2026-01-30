# 環境変数の設定場所

## Renderで環境変数を設定する方法

### 方法1: Advancedセクション内

1. 画面下部の **"Advanced"** ボタンをクリック
2. 開いたセクションの中に **"Environment Variables"** という項目があります
3. そこに環境変数を追加できます

### 方法2: 設定画面の下の方

- スクロールして下に進むと
- "Environment Variables" というセクションがあります
- または "Add Environment Variable" というボタンがあります

### 環境変数の追加方法

1. "Environment Variables" セクションを見つける
2. "Add Environment Variable" または "+" ボタンをクリック
3. 2つの入力欄が表示されます：
   - **Key**（左側）: 変数名を入力
   - **Value**（右側）: 値を入力
4. 入力後、"Add" または "Save" をクリック

### 追加する3つの環境変数

**1つ目:**
- Key: `PORT`
- Value: `5001`

**2つ目:**
- Key: `NODE_ENV`
- Value: `production`

**3つ目:**
- Key: `JWT_SECRET`
- Value: `531c99a7ba2313c3f685c7ac0fb6aeddbdcbb2d0eb3981177c414fa928677528`

### 見つからない場合

- 画面を下にスクロール
- "Advanced" セクションを開く
- または、デプロイ後に Settings タブから追加することもできます
