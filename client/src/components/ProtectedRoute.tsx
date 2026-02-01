import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // ローディング中のタイムアウト（5秒でタイムアウト）
  const [timeoutReached, setTimeoutReached] = React.useState(false);

  React.useEffect(() => {
    console.log('[ProtectedRoute] Loading state:', loading, 'User:', !!user);
    
    if (loading) {
      console.log('[ProtectedRoute] Setting timeout for loading state');
      const timeoutId = setTimeout(() => {
        console.warn('[ProtectedRoute] Loading timeout reached - redirecting to login');
        setTimeoutReached(true);
      }, 5000); // 5秒でタイムアウト

      return () => clearTimeout(timeoutId);
    } else {
      console.log('[ProtectedRoute] Loading completed, user:', !!user);
      setTimeoutReached(false);
    }
  }, [loading, user]);

  // ローディング中は短いローディング画面を表示
  if (loading && !timeoutReached) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ 
          fontSize: '18px', 
          marginBottom: '10px',
          color: 'white',
          fontWeight: '500'
        }}>
          読み込み中...
        </div>
        <div style={{ 
          fontSize: '14px', 
          color: 'rgba(255, 255, 255, 0.8)' 
        }}>
          しばらくお待ちください
        </div>
      </div>
    );
  }

  // タイムアウトまたはユーザーがいない場合はログインページにリダイレクト
  if (timeoutReached || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
