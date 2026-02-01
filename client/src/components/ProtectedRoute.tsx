import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // ローディング中のタイムアウト（10秒でタイムアウト）
  const [timeoutReached, setTimeoutReached] = React.useState(false);

  React.useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        console.warn('Loading timeout reached');
        setTimeoutReached(true);
      }, 10000); // 10秒でタイムアウト

      return () => clearTimeout(timeoutId);
    } else {
      setTimeoutReached(false);
    }
  }, [loading]);

  if (loading && !timeoutReached) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>読み込み中...</div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>しばらくお待ちください</div>
      </div>
    );
  }

  if (timeoutReached || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
