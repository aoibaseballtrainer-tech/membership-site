import { dbRun, dbGet, dbAll, initDatabase } from './database';

interface VideoData {
  categoryCode: string;
  categoryName: string;
  videoCode: string;
  title: string;
  description: string;
}

const COURSE_DATA = {
  slug: 'kyozai-video',
  title: '教材動画コース',
  description: '治療院・サロンオーナー向けの実践的な集客・経営ノウハウを30本の動画で学べるコースです。MEO対策、SNS運用、口コミ管理、AI活用まで、すぐに実践できる内容を網羅しています。',
  price: 9800,
  currency: 'JPY',
};

const VIDEOS: VideoData[] = [
  // A_集客の基本 (A1-A6)
  { categoryCode: 'A', categoryName: '集客の基本', videoCode: 'A1', title: '新規患者が来ない本当の理由', description: '集客に悩む治療院・サロンが見落としがちな根本原因を解説します。' },
  { categoryCode: 'A', categoryName: '集客の基本', videoCode: 'A2', title: '集客チャネル完全マップ', description: 'オンライン・オフライン含む全集客チャネルを体系的に整理します。' },
  { categoryCode: 'A', categoryName: '集客の基本', videoCode: 'A3', title: 'ターゲット設定', description: '理想の患者像を明確にし、効果的なアプローチ方法を学びます。' },
  { categoryCode: 'A', categoryName: '集客の基本', videoCode: 'A4', title: '競合に勝つポジショニング', description: '地域の競合と差別化するためのポジショニング戦略を解説します。' },
  { categoryCode: 'A', categoryName: '集客の基本', videoCode: 'A5', title: '集客導線の設計', description: '認知から来店までの導線を設計し、取りこぼしをなくす方法を学びます。' },
  { categoryCode: 'A', categoryName: '集客の基本', videoCode: 'A6', title: '広告費0円の集客術', description: '費用をかけずに新規集客する具体的な方法を紹介します。' },

  // B_MEO対策 (B1-B5)
  { categoryCode: 'B', categoryName: 'MEO対策', videoCode: 'B1', title: 'MEO対策入門', description: 'MEO対策の基礎知識と、なぜ治療院・サロンに必須なのかを解説します。' },
  { categoryCode: 'B', categoryName: 'MEO対策', videoCode: 'B2', title: 'Googleビジネスプロフィール最適化', description: 'GBPの全項目を最適化し、検索順位を上げる方法を学びます。' },
  { categoryCode: 'B', categoryName: 'MEO対策', videoCode: 'B3', title: '口コミを増やす仕組み', description: '自然に口コミが集まる仕組みづくりのノウハウを公開します。' },
  { categoryCode: 'B', categoryName: 'MEO対策', videoCode: 'B4', title: 'MEOで上位表示させる方法', description: 'Googleマップで上位表示を獲得するための実践テクニックを解説します。' },
  { categoryCode: 'B', categoryName: 'MEO対策', videoCode: 'B5', title: 'MEO分析と改善', description: 'データを使ってMEO施策を改善し続ける方法を学びます。' },

  // C_SNS運用 (C1-C5)
  { categoryCode: 'C', categoryName: 'SNS運用', videoCode: 'C1', title: 'SNS6媒体同時更新術', description: '複数SNSを効率的に運用し、最大限の露出を得る方法を解説します。' },
  { categoryCode: 'C', categoryName: 'SNS運用', videoCode: 'C2', title: 'Instagram攻略', description: 'Instagram集客で成果を出すための投稿・運用ノウハウを学びます。' },
  { categoryCode: 'C', categoryName: 'SNS運用', videoCode: 'C3', title: 'Threads活用術', description: 'Threadsを集客に活用する最新戦略を紹介します。' },
  { categoryCode: 'C', categoryName: 'SNS運用', videoCode: 'C4', title: 'LINE公式アカウント運用', description: 'LINE公式アカウントでリピーターを増やす仕組みを構築します。' },
  { categoryCode: 'C', categoryName: 'SNS運用', videoCode: 'C5', title: 'SNSコンテンツ企画', description: '反応が取れるSNSコンテンツの企画方法を具体例付きで解説します。' },

  // D_口コミ管理 (D1-D3)
  { categoryCode: 'D', categoryName: '口コミ管理', videoCode: 'D1', title: '口コミの重要性', description: '口コミが集客に与える影響と、戦略的な口コミ獲得の考え方を学びます。' },
  { categoryCode: 'D', categoryName: '口コミ管理', videoCode: 'D2', title: '悪い口コミの対処法', description: 'ネガティブな口コミへの適切な対応方法と、評価を改善する戦略を解説します。' },
  { categoryCode: 'D', categoryName: '口コミ管理', videoCode: 'D3', title: '口コミ返信テンプレート', description: 'すぐに使える口コミ返信テンプレートを場面別に紹介します。' },

  // E_経営売上アップ (E1-E5)
  { categoryCode: 'E', categoryName: '経営売上アップ', videoCode: 'E1', title: 'ホットペッパー依存から脱却する方法', description: 'ポータルサイトに依存しない自立した集客体制の作り方を解説します。' },
  { categoryCode: 'E', categoryName: '経営売上アップ', videoCode: 'E2', title: 'リピート率を上げる', description: '患者のリピート率を向上させる具体的な施策を紹介します。' },
  { categoryCode: 'E', categoryName: '経営売上アップ', videoCode: 'E3', title: '客単価アップ戦略', description: '無理なく客単価を上げるメニュー設計と提案方法を学びます。' },
  { categoryCode: 'E', categoryName: '経営売上アップ', videoCode: 'E4', title: '予約管理の最適化', description: '予約の取りこぼしをなくし、稼働率を最大化する方法を解説します。' },
  { categoryCode: 'E', categoryName: '経営売上アップ', videoCode: 'E5', title: 'スタッフ教育', description: 'スタッフの接客・施術品質を向上させる教育システムを構築します。' },

  // F_AI・DX活用 (F1-F3)
  { categoryCode: 'F', categoryName: 'AI・DX活用', videoCode: 'F1', title: 'AI導入入門', description: '治療院・サロンでAIを活用するための基礎知識と導入ステップを解説します。' },
  { categoryCode: 'F', categoryName: 'AI・DX活用', videoCode: 'F2', title: '音声入力で業務効率を10倍にする方法', description: '音声入力ツールを使って日常業務を大幅に効率化する方法を紹介します。' },
  { categoryCode: 'F', categoryName: 'AI・DX活用', videoCode: 'F3', title: '自動化で時間を生む', description: '予約確認、SNS更新などを自動化し、施術に集中できる環境を作ります。' },

  // G_実践テクニック (G1-G3)
  { categoryCode: 'G', categoryName: '実践テクニック', videoCode: 'G1', title: '写真撮影テクニック', description: 'スマホで集客に使える写真を撮影するテクニックを学びます。' },
  { categoryCode: 'G', categoryName: '実践テクニック', videoCode: 'G2', title: 'キャッチコピーの作り方', description: '患者の心に刺さるキャッチコピーの作り方をフレームワーク付きで解説します。' },
  { categoryCode: 'G', categoryName: '実践テクニック', videoCode: 'G3', title: 'チラシ・POP制作', description: '来店を促すチラシ・POPの制作ノウハウを実例付きで紹介します。' },
];

async function seedCourse() {
  console.log('コースデータのシード開始...');

  try {
    // 既存コースを確認
    const existing = await dbGet('SELECT id FROM courses WHERE slug = ?', [COURSE_DATA.slug]);

    if (existing) {
      console.log('コースは既に存在します。スキップします。');
      return;
    }

    // コースを挿入
    const result = await dbRun(
      'INSERT INTO courses (slug, title, description, price, currency) VALUES (?, ?, ?, ?, ?)',
      [COURSE_DATA.slug, COURSE_DATA.title, COURSE_DATA.description, COURSE_DATA.price, COURSE_DATA.currency]
    );

    const courseId = result.lastID;
    console.log(`コース作成完了: ID=${courseId}`);

    // 動画を挿入
    for (let i = 0; i < VIDEOS.length; i++) {
      const video = VIDEOS[i];
      await dbRun(
        'INSERT INTO course_videos (courseId, categoryCode, categoryName, videoCode, title, description, videoUrl, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          courseId,
          video.categoryCode,
          video.categoryName,
          video.videoCode,
          video.title,
          video.description,
          `/videos/kyozai/${video.videoCode}.mp4`,
          i + 1,
        ]
      );
    }

    console.log(`動画 ${VIDEOS.length} 本を登録しました`);
    console.log('シード完了');
  } catch (error) {
    console.error('シードエラー:', error);
  }
}

// データベース初期化後にシードを実行
// initDatabaseはserializeで実行されるため、少し待ってからシードを実行
initDatabase();
setTimeout(() => {
  seedCourse().then(() => {
    console.log('シードスクリプト終了');
    process.exit(0);
  });
}, 2000);
