import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/auth/register`, {
        email,
        password,
        name,
      });
      
      if (response.data.pending) {
        setSuccess('登録申請を受け付けました。管理者の承認をお待ちください。承認後、ログインできるようになります。');
        // フォームをリセット
        setName('');
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || '登録に失敗しました');
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
          <h1>新規登録</h1>
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>お名前</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>パスワード（6文字以上）</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              登録
            </button>
          </form>
          <p style={{ marginTop: '20px', textAlign: 'center' }}>
            既にアカウントをお持ちの方は{' '}
            <Link to="/login" className="link">
              こちらからログイン
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;
