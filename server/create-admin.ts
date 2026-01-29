import bcrypt from 'bcryptjs';
import { dbRun, dbGet, initDatabase } from './database';

async function createAdminUser() {
  try {
    // データベース初期化
    initDatabase();

    const email = 'aoi.baseball.trainer@gmail.com';
    const password = 'aoi';
    const name = '管理者';

    // 既存ユーザーチェック
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUser) {
      console.log('ユーザーは既に存在します。更新します...');
      
      // パスワードハッシュ化
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // ユーザー情報更新
      await dbRun('UPDATE users SET password = ?, name = ? WHERE email = ?', [
        hashedPassword,
        name,
        email
      ]);

      // プロフィールをVIPに更新
      await dbRun(
        `UPDATE member_profiles 
         SET membershipType = 'vip', 
             status = 'active',
             updatedAt = CURRENT_TIMESTAMP
         WHERE userId = ?`,
        [existingUser.id]
      );

      console.log('✅ ユーザー情報を更新しました！');
      console.log(`   メールアドレス: ${email}`);
      console.log(`   パスワード: ${password}`);
      console.log(`   会員タイプ: VIP`);
    } else {
      // パスワードハッシュ化
      const hashedPassword = await bcrypt.hash(password, 10);

      // ユーザー作成
      const result = await dbRun(
        'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
        [email, hashedPassword, name]
      );

      // VIP会員プロフィール作成
      await dbRun(
        'INSERT INTO member_profiles (userId, membershipType, status) VALUES (?, ?, ?)',
        [result.lastID, 'vip', 'active']
      );

      console.log('✅ 管理者ユーザーを作成しました！');
      console.log(`   メールアドレス: ${email}`);
      console.log(`   パスワード: ${password}`);
      console.log(`   会員タイプ: VIP`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

createAdminUser();
