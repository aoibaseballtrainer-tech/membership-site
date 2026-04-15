import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const API_URL = process.env.REACT_APP_API_URL || 'https://membership-site-sc6b.onrender.com/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setSuccess(response.data.message || 'パスワード再設定メールを送信しました。');
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || '送信に失敗しました');
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
        <div className="card" style={{ maxWidth: '420px', width: '100%' }}>
          <h1>パスワード再設定</h1>
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              再設定メールを送る
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

export default ForgotPassword;
