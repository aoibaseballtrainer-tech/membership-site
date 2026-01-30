import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

interface YouTubeLink {
  id: number;
  title: string;
  url: string;
  category: 'wall_hitting' | 'lecture' | 'other';
  description: string | null;
  createdAt: string;
}

const categoryLabels = {
  wall_hitting: '壁打ち',
  lecture: '講義',
  other: 'その他',
};

function YouTubeLinks() {
  const { token } = useAuth();
  const [links, setLinks] = useState<YouTubeLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLinks();
  }, [selectedCategory]);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const response = await axios.get(`${API_URL}/youtube/links`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setLinks(response.data.links || []);
    } catch (err: any) {
      setError(err.response?.data?.error || '動画一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    // YouTube URLから動画IDを抽出
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const filteredLinks = links.filter((link) => {
    if (selectedCategory === 'all') return true;
    return link.category === selectedCategory;
  });

  const groupedLinks = filteredLinks.reduce((acc, link) => {
    if (!acc[link.category]) {
      acc[link.category] = [];
    }
    acc[link.category].push(link);
    return acc;
  }, {} as Record<string, YouTubeLink[]>);

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
          <h1>過去の講義動画</h1>
          {error && <div className="error">{error}</div>}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ marginRight: '10px' }}>カテゴリ:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'white',
                color: '#333',
              }}
            >
              <option value="all">すべて</option>
              <option value="wall_hitting">壁打ち</option>
              <option value="lecture">講義</option>
              <option value="other">その他</option>
            </select>
          </div>

          {Object.keys(groupedLinks).length === 0 ? (
            <p style={{ color: '#666', marginTop: '20px' }}>動画がありません</p>
          ) : (
            Object.entries(groupedLinks).map(([category, categoryLinks]) => (
              <div key={category} style={{ marginBottom: '40px' }}>
                <h2 style={{ marginBottom: '20px', color: '#667eea' }}>
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h2>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px',
                  }}
                >
                  {categoryLinks.map((link) => (
                    <div
                      key={link.id}
                      style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: 'white',
                      }}
                    >
                      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                        <iframe
                          src={getYouTubeEmbedUrl(link.url)}
                          title={link.title}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 'none',
                          }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <div style={{ padding: '15px' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{link.title}</h3>
                        {link.description && (
                          <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>{link.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default YouTubeLinks;
