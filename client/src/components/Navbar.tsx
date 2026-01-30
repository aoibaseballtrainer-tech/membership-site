import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <h1>めんたるサロン</h1>
      <div className="navbar-nav">
        {user ? (
          <>
            <Link to="/dashboard">ダッシュボード</Link>
            <Link to="/youtube">動画一覧</Link>
            <Link to="/profile">プロフィール</Link>
            <Link to="/admin">管理者</Link>
            <span style={{ color: '#666' }}>{user.name}さん</span>
            <button
              onClick={logout}
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '8px 16px' }}
            >
              ログアウト
            </button>
          </>
        ) : (
          <>
            <Link to="/login">ログイン</Link>
            <Link to="/register">登録</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
