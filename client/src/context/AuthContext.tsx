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
  if (window.location.hostname.includes('onrender.com')) {
    return 'https://membership-site-sc6b.onrender.com/api';
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
axios.defaults.timeout = 5000; // 5秒

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ローカルストレージからトークンを取得
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      verifyToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    // タイムアウトを短く設定し、エラーが発生しても確実にloadingをfalseにする
    const timeoutId = setTimeout(() => {
      console.warn('Token verification timeout');
      setLoading(false);
    }, 6000); // 6秒でタイムアウト

    try {
      const response = await axios.get(`${API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${tokenToVerify}` },
        timeout: 5000, // 5秒でタイムアウト
      });
      clearTimeout(timeoutId);
      setUser(response.data.user);
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Token verification failed:', error?.message || error);
      // エラーが発生した場合、トークンを削除
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
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
