import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

interface Category {
  categoryCode: string;
  categoryName: string;
  count: number;
}

interface Course {
  id: number;
  slug: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  thumbnailUrl: string | null;
  isActive: number;
  categories: Category[];
  totalVideos: number;
}

function Courses() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [membershipType, setMembershipType] = useState<string>('basic');

  useEffect(() => {
    fetchCourses();
    fetchProfile();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/courses`);
      setCourses(response.data.courses || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'コース一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/members/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembershipType(response.data.profile?.membershipType || 'basic');
    } catch {
      // プロフィール取得失敗は無視
    }
  };

  const isVipOrAdmin = membershipType === 'vip' || membershipType === 'admin';

  const handleCourseClick = (slug: string) => {
    if (!token) {
      navigate('/login');
      return;
    }
    navigate(`/courses/${slug}`);
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

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="card">
          <h1>教材コース</h1>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            治療院・サロン経営に必要な知識を動画で学べます
          </p>
          {error && <div className="error">{error}</div>}

          {courses.length === 0 ? (
            <p style={{ color: '#666' }}>現在公開中のコースはありません</p>
          ) : (
            <div style={{ display: 'grid', gap: '30px' }}>
              {courses.map((course) => (
                <div
                  key={course.id}
                  style={{
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'white',
                  }}
                >
                  {/* コースヘッダー */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      padding: '30px',
                      color: 'white',
                    }}
                  >
                    <h2 style={{ margin: '0 0 10px 0', fontSize: '1.8rem', color: 'white' }}>
                      {course.title}
                    </h2>
                    <p style={{ margin: '0 0 15px 0', opacity: 0.9, fontSize: '1rem', lineHeight: 1.6 }}>
                      {course.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {course.price.toLocaleString()}円
                      </span>
                      <span style={{ opacity: 0.8, fontSize: '0.9rem' }}>
                        (税込) / 全{course.totalVideos}本
                      </span>
                    </div>
                  </div>

                  {/* カテゴリ内訳 */}
                  <div style={{ padding: '25px' }}>
                    <h3 style={{ marginBottom: '15px', color: '#333' }}>カリキュラム内容</h3>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: '12px',
                        marginBottom: '25px',
                      }}
                    >
                      {course.categories.map((cat) => (
                        <div
                          key={cat.categoryCode}
                          style={{
                            padding: '12px 16px',
                            background: '#f8f9fa',
                            borderRadius: '8px',
                            borderLeft: '4px solid #667eea',
                          }}
                        >
                          <div style={{ fontWeight: '600', color: '#333', fontSize: '0.95rem' }}>
                            {cat.categoryCode}. {cat.categoryName}
                          </div>
                          <div style={{ color: '#888', fontSize: '0.85rem', marginTop: '4px' }}>
                            {cat.count}本
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* アクションボタン */}
                    <button
                      onClick={() => handleCourseClick(course.slug)}
                      className="btn btn-primary"
                      style={{ width: 'auto', padding: '14px 40px', fontSize: '1.1rem' }}
                    >
                      {isVipOrAdmin ? '視聴する' : '購入する'}
                    </button>
                    {isVipOrAdmin && (
                      <span style={{ marginLeft: '15px', color: '#667eea', fontWeight: '500' }}>
                        VIP/管理者 - 無料アクセス
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Courses;
