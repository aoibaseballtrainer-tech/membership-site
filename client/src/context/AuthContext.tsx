import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 本番環境ではバックエンドのURLを使用
const getApiUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // 本番環境の場合はバックエンドのURLを推測
  try {
    if (typeof window !== 'undefined' && window.location && window.location.hostname.includes('onrender.com')) {
      return 'https://membership-site-sc6b.onrender.com/api';
    }
  } catch (e) {
    console.warn('window.location access failed:', e);
  }
  // ローカル開発環境
  return 'http://localhost:5001/api';
};

const API_URL = getApiUrl();

// 本番環境でAPI_URLが設定されていない場合の警告
if (process.env.NODE_ENV === 'production' && !process.env.REACT_APP_API_URL) {
  console.warn('REACT_APP_API_URL環境変数が設定されていません。デフォルトURLを使用します:', API_URL);
}

// axiosのデフォルトタイムアウトを設定（短くする）
axios.defaults.timeout = 3000; // 3秒

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[AuthProvider] Initializing...');
    console.log('[AuthProvider] API_URL:', API_URL);
    
    // ローカルストレージからトークンを取得
    const savedToken = localStorage.getItem('token');
    console.log('[AuthProvider] Saved token exists:', !!savedToken);
    
    // 強制的にローディングを解除するタイムアウト（最大5秒）
    const forceLoadingTimeout = setTimeout(() => {
      console.warn('[AuthProvider] Force loading timeout - setting loading to false');
      setLoading(false);
    }, 5000);
    
    if (savedToken) {
      setToken(savedToken);
      console.log('[AuthProvider] Verifying token...');
      verifyToken(savedToken).finally(() => {
        clearTimeout(forceLoadingTimeout);
      });
    } else {
      // トークンがない場合は即座にローディングを解除
      console.log('[AuthProvider] No token found, setting loading to false');
      clearTimeout(forceLoadingTimeout);
      setLoading(false);
    }
    
    return () => {
      clearTimeout(forceLoadingTimeout);
    };
  }, []);

  const verifyToken = async (tokenToVerify: string): Promise<void> => {
    console.log('[AuthProvider] verifyToken called, API_URL:', API_URL);
    
    // タイムアウトを短く設定（2秒でタイムアウト）
    const timeoutId = setTimeout(() => {
      console.warn('[AuthProvider] Token verification timeout - clearing token');
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setLoading(false);
    }, 2000); // 2秒でタイムアウト

    try {
      console.log('[AuthProvider] Making API request to:', `${API_URL}/auth/verify`);
      const response = await axios.get(`${API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${tokenToVerify}` },
        timeout: 2000, // 2秒でタイムアウト
      });
      clearTimeout(timeoutId);
      console.log('[AuthProvider] Token verification successful:', response.data);
      setUser(response.data.user);
      setLoading(false);
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('[AuthProvider] Token verification failed:', error?.message || error);
      console.error('[AuthProvider] Error details:', {
        message: error?.message,
        code: error?.code,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      // エラーが発生した場合、トークンを削除して即座にローディングを解除
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password }, {
        timeout: 5000, // 5秒でタイムアウト
      });
      const { token: newToken, user: newUser } = response.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
    } catch (error: any) {
      console.error('Login failed:', error?.message || error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        name,
      }, {
        timeout: 5000, // 5秒でタイムアウト
      });
      const { token: newToken, user: newUser } = response.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
    } catch (error: any) {
      console.error('Registration failed:', error?.message || error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
