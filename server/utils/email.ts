import nodemailer from 'nodemailer';

// メール送信設定
const createTransporter = () => {
  // 環境変数から設定を取得
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  // メール設定が無い場合はnullを返す（メール送信をスキップ）
  if (!emailUser || !emailPassword) {
    console.warn('メール設定がありません。メール送信機能は無効です。');
    return null;
  }

  return nodemailer.createTransport({
    service: emailService,
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });
};

// 承認完了メール送信
export async function sendApprovalEmail(userEmail: string, userName: string) {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log('メール送信をスキップしました（設定なし）');
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: '【会員登録】承認完了のお知らせ',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">会員登録が承認されました</h2>
          <p>${userName} 様</p>
          <p>この度は、会員登録のご申請をいただき、ありがとうございました。</p>
          <p>審査の結果、ご登録を承認いたしました。</p>
          <p>以下のURLからログインして、サービスをご利用いただけます。</p>
          <p style="margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://membership-site-frontend.onrender.com'}/login" 
               style="display: inline-block; padding: 12px 24px; background-color: #667eea; color: white; text-decoration: none; border-radius: 4px;">
              ログインページへ
            </a>
          </p>
          <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            このメールは自動送信されています。返信はできません。
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`承認完了メールを送信しました: ${userEmail}`);
  } catch (error) {
    console.error('メール送信エラー:', error);
    // メール送信エラーでも処理は続行（エラーを投げない）
  }
}

// 拒否通知メール送信
export async function sendRejectionEmail(userEmail: string, userName: string) {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log('メール送信をスキップしました（設定なし）');
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: '【会員登録】審査結果のお知らせ',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">会員登録の審査結果について</h2>
          <p>${userName} 様</p>
          <p>この度は、会員登録のご申請をいただき、ありがとうございました。</p>
          <p>誠に恐れ入りますが、審査の結果、今回はご登録をお受けできませんでした。</p>
          <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            このメールは自動送信されています。返信はできません。
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`拒否通知メールを送信しました: ${userEmail}`);
  } catch (error) {
    console.error('メール送信エラー:', error);
    // メール送信エラーでも処理は続行（エラーを投げない）
  }
}
