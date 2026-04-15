import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const API_URL = process.env.REACT_APP_API_URL || 'https://membership-site-sc6b.onrender.com/api';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('再設定トークンが見つかりません。メールのリンクから開いてください。');
      return;
    }

    if (password !== confirmPassword) {
      setError('確認用パスワードが一致しません');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, { token, password });
      setSuccess(response.data.message || 'パスワードを再設定しました');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || '再設定に失敗しました');
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
        <div className="card" style={{ maxWidth: '420px', width: '100%' }}>
          <h1>新しいパスワードを設定</h1>
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>新しいパスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label>新しいパスワード（確認）</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              パスワードを更新
            </button>
          </form>
          <p style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link to="/login" className="link">
              ログイン画面へ戻る
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default ResetPassword;
