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

function Admin() {
  const { token } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
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
            <h2>全会員一覧</h2>
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
                      </td>
                    </tr>
                  ))}
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
