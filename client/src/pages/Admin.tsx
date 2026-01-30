import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

interface User {
  id: number;
  email: string;
  name: string;
  status: string;
  createdAt: string;
  membershipType?: string;
}

interface YouTubeLink {
  id: number;
  title: string;
  url: string;
  category: 'wall_hitting' | 'lecture' | 'other';
  description: string | null;
  createdAt: string;
}

function Admin() {
  const { token } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [youtubeLinks, setYoutubeLinks] = useState<YouTubeLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showYoutubeForm, setShowYoutubeForm] = useState(false);
  const [editingLink, setEditingLink] = useState<YouTubeLink | null>(null);
  const [youtubeFormData, setYoutubeFormData] = useState({
    title: '',
    url: '',
    category: 'wall_hitting' as 'wall_hitting' | 'lecture' | 'other',
    description: '',
  });
  const [showUserForm, setShowUserForm] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    membershipType: 'basic' as 'basic' | 'vip' | 'admin',
  });

  useEffect(() => {
    fetchUsers();
    fetchYoutubeLinks();
  }, []);

  const fetchUsers = async () => {
    try {
      const [pendingRes, allRes] = await Promise.all([
        axios.get(`${API_URL}/admin/pending-users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/admin/all-users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setPendingUsers(pendingRes.data.users || []);
      setAllUsers(allRes.data.users || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'ユーザー一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number) => {
    try {
      await axios.post(
        `${API_URL}/admin/approve-user`,
        { userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess('ユーザーを承認しました');
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || '承認に失敗しました');
    }
  };

  const handleReject = async (userId: number) => {
    if (!window.confirm('このユーザーを拒否しますか？')) {
      return;
    }
    try {
      await axios.post(
        `${API_URL}/admin/reject-user`,
        { userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess('ユーザーを拒否しました');
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || '拒否に失敗しました');
    }
  };

  const handleUpdateMembershipType = async (userId: number, membershipType: string) => {
    if (!window.confirm(`このユーザーの会員タイプを「${membershipType}」に変更しますか？`)) {
      return;
    }
    try {
      await axios.post(
        `${API_URL}/admin/update-membership-type`,
        { userId, membershipType },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess('会員タイプを更新しました');
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || '会員タイプの更新に失敗しました');
    }
  };

  const fetchYoutubeLinks = async () => {
    try {
      const response = await axios.get(`${API_URL}/youtube/links`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setYoutubeLinks(response.data.links || []);
    } catch (err: any) {
      console.error('YouTubeリンク取得エラー:', err);
    }
  };

  const handleYoutubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingLink) {
        // 更新
        await axios.put(
          `${API_URL}/youtube/links/${editingLink.id}`,
          youtubeFormData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSuccess('YouTubeリンクを更新しました');
      } else {
        // 新規作成
        await axios.post(
          `${API_URL}/youtube/links`,
          youtubeFormData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSuccess('YouTubeリンクを追加しました');
      }
      setShowYoutubeForm(false);
      setEditingLink(null);
      setYoutubeFormData({ title: '', url: '', category: 'wall_hitting', description: '' });
      fetchYoutubeLinks();
    } catch (err: any) {
      setError(err.response?.data?.error || 'YouTubeリンクの保存に失敗しました');
    }
  };

  const handleEditYoutubeLink = (link: YouTubeLink) => {
    setEditingLink(link);
    setYoutubeFormData({
      title: link.title,
      url: link.url,
      category: link.category,
      description: link.description || '',
    });
    setShowYoutubeForm(true);
  };

  const handleDeleteYoutubeLink = async (id: number) => {
    if (!window.confirm('このYouTubeリンクを削除しますか？')) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/youtube/links/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('YouTubeリンクを削除しました');
      fetchYoutubeLinks();
    } catch (err: any) {
      setError(err.response?.data?.error || 'YouTubeリンクの削除に失敗しました');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post(
        `${API_URL}/admin/create-user`,
        userFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess('ユーザーを作成しました');
      setShowUserForm(false);
      setUserFormData({ name: '', email: '', password: '', membershipType: 'basic' });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'ユーザーの作成に失敗しました');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('このユーザーを削除しますか？この操作は取り消せません。')) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/admin/delete-user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('ユーザーを削除しました');
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'ユーザーの削除に失敗しました');
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
          <h1>管理者画面</h1>
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <div style={{ marginTop: '30px' }}>
            <h2>承認待ちユーザー</h2>
            {pendingUsers.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>名前</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>メールアドレス</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>登録日</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map((user) => (
                      <tr key={user.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ padding: '12px' }}>{user.name}</td>
                        <td style={{ padding: '12px' }}>{user.email}</td>
                        <td style={{ padding: '12px' }}>
                          {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="btn btn-primary"
                            style={{ width: 'auto', padding: '6px 12px', marginRight: '8px' }}
                          >
                            承認
                          </button>
                          <button
                            onClick={() => handleReject(user.id)}
                            className="btn btn-secondary"
                            style={{ width: 'auto', padding: '6px 12px' }}
                          >
                            拒否
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#666', marginTop: '10px' }}>承認待ちのユーザーはありません</p>
            )}
          </div>

          <div style={{ marginTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>全会員一覧</h2>
              <button
                onClick={() => {
                  setShowUserForm(!showUserForm);
                  setUserFormData({ name: '', email: '', password: '', membershipType: 'basic' });
                }}
                className="btn btn-primary"
                style={{ width: 'auto', padding: '10px 20px' }}
              >
                {showUserForm ? 'フォームを閉じる' : 'ユーザーを追加'}
              </button>
            </div>

            {showUserForm && (
              <form onSubmit={handleCreateUser} style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '20px' }}>ユーザーを追加</h3>
                <div className="form-group">
                  <label>名前</label>
                  <input
                    type="text"
                    value={userFormData.name}
                    onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>メールアドレス</label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>パスワード（6文字以上）</label>
                  <input
                    type="password"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="form-group">
                  <label>会員タイプ</label>
                  <select
                    value={userFormData.membershipType}
                    onChange={(e) => setUserFormData({ ...userFormData, membershipType: e.target.value as any })}
                    required
                  >
                    <option value="basic">Basic</option>
                    <option value="vip">VIP</option>
                    <option value="admin">管理者</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginRight: '10px' }}>
                  追加
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserForm(false);
                    setUserFormData({ name: '', email: '', password: '', membershipType: 'basic' });
                  }}
                  className="btn btn-secondary"
                >
                  キャンセル
                </button>
              </form>
            )}

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>名前</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>メールアドレス</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>ステータス</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>会員タイプ</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>登録日</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '12px' }}>{user.name}</td>
                      <td style={{ padding: '12px' }}>{user.email}</td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            background:
                              user.status === 'approved'
                                ? '#d4edda'
                                : user.status === 'pending'
                                ? '#fff3cd'
                                : '#f8d7da',
                            color:
                              user.status === 'approved'
                                ? '#155724'
                                : user.status === 'pending'
                                ? '#856404'
                                : '#721c24',
                          }}
                        >
                          {user.status === 'approved'
                            ? '承認済み'
                            : user.status === 'pending'
                            ? '承認待ち'
                            : '拒否'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            background:
                              user.membershipType === 'admin'
                                ? '#d1ecf1'
                                : user.membershipType === 'vip'
                                ? '#fff3cd'
                                : '#e2e3e5',
                            color:
                              user.membershipType === 'admin'
                                ? '#0c5460'
                                : user.membershipType === 'vip'
                                ? '#856404'
                                : '#383d41',
                          }}
                        >
                          {user.membershipType === 'admin'
                            ? '管理者'
                            : user.membershipType === 'vip'
                            ? 'VIP'
                            : 'Basic'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                          {user.status === 'approved' && (
                            <select
                              value={user.membershipType || 'basic'}
                              onChange={(e) => handleUpdateMembershipType(user.id, e.target.value)}
                              style={{
                                padding: '6px 12px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '14px',
                                background: 'white',
                                cursor: 'pointer',
                              }}
                            >
                              <option value="basic">Basic</option>
                              <option value="vip">VIP</option>
                              <option value="admin">管理者</option>
                            </select>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="btn btn-secondary"
                            style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
                          >
                            削除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>YouTube動画管理</h2>
              <button
                onClick={() => {
                  setShowYoutubeForm(!showYoutubeForm);
                  setEditingLink(null);
                  setYoutubeFormData({ title: '', url: '', category: 'wall_hitting', description: '' });
                }}
                className="btn btn-primary"
                style={{ width: 'auto', padding: '10px 20px' }}
              >
                {showYoutubeForm ? 'フォームを閉じる' : '動画を追加'}
              </button>
            </div>

            {showYoutubeForm && (
              <form onSubmit={handleYoutubeSubmit} style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '20px' }}>{editingLink ? '動画を編集' : '動画を追加'}</h3>
                <div className="form-group">
                  <label>タイトル</label>
                  <input
                    type="text"
                    value={youtubeFormData.title}
                    onChange={(e) => setYoutubeFormData({ ...youtubeFormData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>YouTube URL</label>
                  <input
                    type="url"
                    value={youtubeFormData.url}
                    onChange={(e) => setYoutubeFormData({ ...youtubeFormData, url: e.target.value })}
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <div className="form-group">
                  <label>カテゴリ</label>
                  <select
                    value={youtubeFormData.category}
                    onChange={(e) => setYoutubeFormData({ ...youtubeFormData, category: e.target.value as any })}
                    required
                  >
                    <option value="wall_hitting">壁打ち</option>
                    <option value="lecture">講義</option>
                    <option value="other">その他</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>説明（任意）</label>
                  <textarea
                    value={youtubeFormData.description}
                    onChange={(e) => setYoutubeFormData({ ...youtubeFormData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginRight: '10px' }}>
                  {editingLink ? '更新' : '追加'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowYoutubeForm(false);
                    setEditingLink(null);
                    setYoutubeFormData({ title: '', url: '', category: 'wall_hitting', description: '' });
                  }}
                  className="btn btn-secondary"
                >
                  キャンセル
                </button>
              </form>
            )}

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>タイトル</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>カテゴリ</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>URL</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>追加日</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {youtubeLinks.length > 0 ? (
                    youtubeLinks.map((link) => (
                      <tr key={link.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ padding: '12px' }}>{link.title}</td>
                        <td style={{ padding: '12px' }}>
                          {link.category === 'wall_hitting' ? '壁打ち' : link.category === 'lecture' ? '講義' : 'その他'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
                            {link.url}
                          </a>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {new Date(link.createdAt).toLocaleDateString('ja-JP')}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleEditYoutubeLink(link)}
                            className="btn btn-primary"
                            style={{ width: 'auto', padding: '6px 12px', marginRight: '8px' }}
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDeleteYoutubeLink(link.id)}
                            className="btn btn-secondary"
                            style={{ width: 'auto', padding: '6px 12px' }}
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                        動画がありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Admin;
