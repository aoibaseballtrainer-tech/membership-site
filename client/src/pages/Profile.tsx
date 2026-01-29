import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

interface ProfileData {
  user: {
    id: number;
    email: string;
    name: string;
    createdAt: string;
  };
  profile: {
    phone?: string;
    address?: string;
    membershipType: string;
    status: string;
  };
}

function Profile() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    membershipType: 'basic',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/members/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data);
      setFormData({
        name: response.data.user.name,
        phone: response.data.profile?.phone || '',
        address: response.data.profile?.address || '',
        membershipType: response.data.profile?.membershipType || 'basic',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'プロフィールの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.put(
        `${API_URL}/members/profile`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProfile(response.data);
      setSuccess('プロフィールが更新されました');
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || '更新に失敗しました');
    }
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
          <h1>プロフィール</h1>
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          {profile && (
            <>
              {!editing ? (
                <>
                  <div className="info-section">
                    <h3>基本情報</h3>
                    <p><strong>名前:</strong> {profile.user.name}</p>
                    <p><strong>メールアドレス:</strong> {profile.user.email}</p>
                    <p><strong>電話番号:</strong> {profile.profile?.phone || '未設定'}</p>
                    <p><strong>住所:</strong> {profile.profile?.address || '未設定'}</p>
                    <p><strong>会員タイプ:</strong> {profile.profile?.membershipType || 'basic'}</p>
                    <p><strong>ステータス:</strong> {profile.profile?.status || 'active'}</p>
                    <p><strong>登録日:</strong> {new Date(profile.user.createdAt).toLocaleDateString('ja-JP')}</p>
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="btn btn-primary"
                    style={{ marginTop: '20px' }}
                  >
                    編集
                  </button>
                </>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>名前</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>電話番号</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>住所</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>会員タイプ</label>
                    <select
                      value={formData.membershipType}
                      onChange={(e) => setFormData({ ...formData, membershipType: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '16px',
                      }}
                    >
                      <option value="basic">基本</option>
                      <option value="premium">プレミアム</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-primary">
                      保存
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        fetchProfile();
                      }}
                      className="btn btn-secondary"
                    >
                      キャンセル
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Profile;
