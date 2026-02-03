import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [forceRedirect, setForceRedirect] = React.useState(false);

  React.useEffect(() => {
    console.log('[ProtectedRoute] Loading state:', loading, 'User:', !!user);
    
    // ローディングが3秒以上続く場合は強制的にリダイレクト
    if (loading) {
      console.log('[ProtectedRoute] Setting timeout for loading state');
      const timeoutId = setTimeout(() => {
        console.warn('[ProtectedRoute] Loading timeout reached - forcing redirect to login');
        setForceRedirect(true);
      }, 3000); // 3秒でタイムアウト

      return () => clearTimeout(timeoutId);
    } else {
      console.log('[ProtectedRoute] Loading completed, user:', !!user);
      setForceRedirect(false);
    }
  }, [loading, user]);

  // 強制リダイレクトまたはユーザーがいない場合はログインページにリダイレクト
  if (forceRedirect || (!loading && !user)) {
    console.log('[ProtectedRoute] Redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // ローディング中は短いローディング画面を表示
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        width: '100%',
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

  // ユーザーがいる場合は子要素を表示
  if (user) {
    return children;
  }

  // 念のため、ログインページにリダイレクト
  return <Navigate to="/login" replace />;
}

export default ProtectedRoute;
