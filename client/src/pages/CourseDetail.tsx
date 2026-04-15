import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

interface Video {
  id: number;
  videoCode: string;
  title: string;
  description: string;
  videoUrl: string | null;
}

interface CategoryGroup {
  code: string;
  name: string;
  videos: Video[];
}

interface CourseData {
  id: number;
  slug: string;
  title: string;
  description: string;
  price: number;
  currency: string;
}

function CourseDetail() {
  const { slug, videoCode } = useParams<{ slug: string; videoCode?: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [membershipType, setMembershipType] = useState('basic');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCourseDetail();
  }, [slug, token]);

  useEffect(() => {
    // videoCodeがURLにある場合、該当動画を選択
    if (videoCode && categories.length > 0) {
      for (const cat of categories) {
        const video = cat.videos.find((v) => v.videoCode === videoCode);
        if (video) {
          setSelectedVideo(video);
          setExpandedCategories((prev) => new Set(prev).add(cat.code));
          return;
        }
      }
    }
    // videoCodeがないか見つからない場合は最初の動画を選択
    if (!videoCode && categories.length > 0 && categories[0].videos.length > 0) {
      setSelectedVideo(categories[0].videos[0]);
      setExpandedCategories(new Set([categories[0].code]));
    }
  }, [videoCode, categories]);

  const fetchCourseDetail = async () => {
    try {
      const response = await axios.get(`${API_URL}/courses/${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourse(response.data.course);
      setCategories(response.data.categories);
      setHasAccess(response.data.hasAccess);
      setMembershipType(response.data.membershipType);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('コースが見つかりません');
      } else {
        setError(err.response?.data?.error || 'コース情報の取得に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!course) return;
    setPurchaseLoading(true);
    setError('');
    try {
      await axios.post(
        `${API_URL}/courses/${slug}/purchase`,
        { paymentMethod: 'manual' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPurchaseSuccess('購入が完了しました。動画をご視聴いただけます。');
      // データを再取得
      await fetchCourseDetail();
    } catch (err: any) {
      setError(err.response?.data?.error || '購入処理に失敗しました');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleVideoSelect = (video: Video, catCode: string) => {
    setSelectedVideo(video);
    navigate(`/courses/${slug}/${video.videoCode}`, { replace: true });
  };

  const toggleCategory = (code: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="card">
            <p>読み込み中...</p>
          </div>
        </div>
      </>
    );
  }

  if (error && !course) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="card">
            <div className="error">{error}</div>
            <button
              onClick={() => navigate('/courses')}
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '10px 20px', marginTop: '15px' }}
            >
              コース一覧に戻る
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container" style={{ maxWidth: '1400px' }}>
        {error && <div className="error">{error}</div>}
        {purchaseSuccess && <div className="success">{purchaseSuccess}</div>}

        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          {/* 左サイドバー: カテゴリアコーディオン */}
          <div
            style={{
              width: '320px',
              minWidth: '320px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              padding: '20px',
              alignSelf: 'flex-start',
              position: 'sticky',
              top: '20px',
              maxHeight: 'calc(100vh - 120px)',
              overflowY: 'auto',
            }}
          >
            <h3 style={{ marginBottom: '15px', color: '#333' }}>{course?.title}</h3>
            {categories.map((cat) => (
              <div key={cat.code} style={{ marginBottom: '8px' }}>
                <button
                  onClick={() => toggleCategory(cat.code)}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    background: expandedCategories.has(cat.code) ? '#667eea' : '#f8f9fa',
                    color: expandedCategories.has(cat.code) ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>{cat.code}. {cat.name}</span>
                  <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                    {cat.videos.length}本 {expandedCategories.has(cat.code) ? '▼' : '▶'}
                  </span>
                </button>
                {expandedCategories.has(cat.code) && (
                  <div style={{ marginTop: '4px' }}>
                    {cat.videos.map((video) => (
                      <button
                        key={video.id}
                        onClick={() => handleVideoSelect(video, cat.code)}
                        style={{
                          width: '100%',
                          padding: '10px 15px 10px 25px',
                          background: selectedVideo?.id === video.id ? '#eef0ff' : 'transparent',
                          border: 'none',
                          borderLeft: selectedVideo?.id === video.id ? '3px solid #667eea' : '3px solid transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '0.85rem',
                          color: selectedVideo?.id === video.id ? '#667eea' : '#555',
                          fontWeight: selectedVideo?.id === video.id ? '600' : '400',
                          transition: 'all 0.2s',
                        }}
                      >
                        <span style={{ color: '#999', marginRight: '6px' }}>{video.videoCode}</span>
                        {video.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* メインエリア: 動画プレイヤー */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
              }}
            >
              {hasAccess ? (
                <>
                  {selectedVideo ? (
                    <>
                      {/* 動画プレイヤー */}
                      <div
                        style={{
                          position: 'relative',
                          paddingBottom: '56.25%',
                          height: 0,
                          background: '#000',
                        }}
                      >
                        <video
                          key={selectedVideo.videoUrl}
                          controls
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                          }}
                        >
                          <source src={selectedVideo.videoUrl || ''} type="video/mp4" />
                          お使いのブラウザは動画再生に対応していません。
                        </video>
                      </div>
                      {/* 動画情報 */}
                      <div style={{ padding: '25px' }}>
                        <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>
                          <span style={{ color: '#667eea', marginRight: '8px' }}>
                            {selectedVideo.videoCode}
                          </span>
                          {selectedVideo.title}
                        </h2>
                        {selectedVideo.description && (
                          <p style={{ color: '#666', lineHeight: 1.7, margin: 0 }}>
                            {selectedVideo.description}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                      <p style={{ color: '#666' }}>左のメニューから動画を選択してください</p>
                    </div>
                  )}
                </>
              ) : (
                /* 購入プロンプト */
                <div style={{ padding: '50px 30px', textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔒</div>
                  <h2 style={{ color: '#333', marginBottom: '15px' }}>
                    このコースは購入が必要です
                  </h2>
                  <p style={{ color: '#666', marginBottom: '10px', lineHeight: 1.7 }}>
                    {course?.description}
                  </p>
                  <p style={{ marginBottom: '30px' }}>
                    <span
                      style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        color: '#667eea',
                      }}
                    >
                      {course?.price.toLocaleString()}
                    </span>
                    <span style={{ color: '#666', fontSize: '1rem', marginLeft: '5px' }}>
                      円（税込）
                    </span>
                  </p>
                  <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={handlePurchase}
                      disabled={purchaseLoading}
                      className="btn btn-primary"
                      style={{ width: 'auto', padding: '15px 50px', fontSize: '1.1rem' }}
                    >
                      {purchaseLoading ? '処理中...' : '購入する'}
                    </button>
                    <button
                      onClick={() => navigate('/courses')}
                      className="btn btn-secondary"
                      style={{ width: 'auto', padding: '15px 30px' }}
                    >
                      コース一覧に戻る
                    </button>
                  </div>
                  <p style={{ color: '#999', fontSize: '0.85rem', marginTop: '20px' }}>
                    ※ VIP会員・管理者は無料で全コースにアクセスできます
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CourseDetail;
