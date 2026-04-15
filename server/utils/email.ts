import nodemailer from 'nodemailer';
import { getFrontendUrl } from './app-url';

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
            <a href="${getFrontendUrl('/login')}" 
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

export async function sendRegistrationEmail(userEmail: string, userName: string, password: string) {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log('メール送信をスキップしました（設定なし）');
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: '【会員登録】登録受付のお知らせ',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">会員登録を受け付けました</h2>
          <p>${userName} 様</p>
          <p>会員登録ありがとうございます。登録内容を受け付けました。</p>
          <p>現在は管理者承認待ちです。承認後にログインしてご利用いただけます。</p>
          <div style="background: #f7f7f7; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 8px;"><strong>ログイン情報</strong></p>
            <p style="margin: 0 0 6px;">メールアドレス: ${userEmail}</p>
            <p style="margin: 0;">パスワード: ${password}</p>
          </div>
          <p>パスワードは大切に保管してください。忘れた場合はログイン画面から再設定できます。</p>
          <p style="margin: 20px 0;">
            <a href="${getFrontendUrl('/login')}"
               style="display: inline-block; padding: 12px 24px; background-color: #667eea; color: white; text-decoration: none; border-radius: 4px;">
              ログインページへ
            </a>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`登録受付メールを送信しました: ${userEmail}`);
  } catch (error) {
    console.error('メール送信エラー:', error);
  }
}

export async function sendWelcomeCredentialsEmail(
  userEmail: string,
  userName: string,
  password: string
) {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log('メール送信をスキップしました（設定なし）');
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: '【会員サイト】アカウント情報のお知らせ',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">アカウント情報をお送りします</h2>
          <p>${userName} 様</p>
          <p>会員サイトのアカウントを作成しました。以下の情報でログインしてください。</p>
          <div style="background: #f7f7f7; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 6px;">メールアドレス: ${userEmail}</p>
            <p style="margin: 0;">パスワード: ${password}</p>
          </div>
          <p style="margin: 20px 0;">
            <a href="${getFrontendUrl('/login')}"
               style="display: inline-block; padding: 12px 24px; background-color: #667eea; color: white; text-decoration: none; border-radius: 4px;">
              ログインページへ
            </a>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`初回認証情報メールを送信しました: ${userEmail}`);
  } catch (error) {
    console.error('メール送信エラー:', error);
  }
}

export async function sendPasswordResetEmail(userEmail: string, userName: string, token: string) {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log('メール送信をスキップしました（設定なし）');
      return false;
    }

    const resetUrl = getFrontendUrl(`/reset-password?token=${encodeURIComponent(token)}`);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: '【会員サイト】パスワード再設定のご案内',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">パスワード再設定のご案内</h2>
          <p>${userName} 様</p>
          <p>パスワード再設定のご依頼を受け付けました。</p>
          <p>以下のボタンから新しいパスワードを設定してください。リンクの有効期限は1時間です。</p>
          <p style="margin: 20px 0;">
            <a href="${resetUrl}"
               style="display: inline-block; padding: 12px 24px; background-color: #667eea; color: white; text-decoration: none; border-radius: 4px;">
              パスワードを再設定する
            </a>
          </p>
          <p style="word-break: break-all; color: #666; font-size: 12px;">${resetUrl}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`パスワード再設定メールを送信しました: ${userEmail}`);
    return true;
  } catch (error) {
    console.error('メール送信エラー:', error);
    return false;
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
