import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

interface BusinessData {
  id: number;
  year: number;
  month: number;
  totalRevenue: number | null;
  productName: string | null;
  productPrice: number | null;
  productProfit: number | null;
  productSalesCount: number | null;
  totalLeads: number | null;
  newLeads: number | null;
  adSpend: number | null;
  followerCount: number | null;
  createdAt: string;
}

function Dashboard() {
  const { user, token } = useAuth();
  const [data, setData] = useState<BusinessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [period, setPeriod] = useState('3months');
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    totalRevenue: '',
    productName: '',
    productPrice: '',
    productProfit: '',
    productSalesCount: '',
    totalLeads: '',
    newLeads: '',
    adSpend: '',
    cpa: '',
    cpl: '',
    roas: '',
    followerCount: '',
    impressions: '',
    reach: '',
    postCount: '',
  });

  useEffect(() => {
    fetchData();
  }, [period, token]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/business/data`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { period },
      });
      setData(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post(
        `${API_URL}/business/data`,
        {
          ...formData,
          totalRevenue: formData.totalRevenue ? parseFloat(formData.totalRevenue) : null,
          productPrice: formData.productPrice ? parseFloat(formData.productPrice) : null,
          productProfit: formData.productProfit ? parseFloat(formData.productProfit) : null,
          productSalesCount: formData.productSalesCount ? parseInt(formData.productSalesCount) : null,
          totalLeads: formData.totalLeads ? parseInt(formData.totalLeads) : null,
          newLeads: formData.newLeads ? parseInt(formData.newLeads) : null,
          adSpend: formData.adSpend ? parseFloat(formData.adSpend) : null,
          cpa: formData.cpa ? parseFloat(formData.cpa) : null,
          cpl: formData.cpl ? parseFloat(formData.cpl) : null,
          roas: formData.roas ? parseFloat(formData.roas) : null,
          followerCount: formData.followerCount ? parseInt(formData.followerCount) : null,
          impressions: formData.impressions ? parseInt(formData.impressions) : null,
          reach: formData.reach ? parseInt(formData.reach) : null,
          postCount: formData.postCount ? parseInt(formData.postCount) : null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess('データを保存しました');
      setShowForm(false);
      fetchData();
      // フォームをリセット
      setFormData({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        totalRevenue: '',
        productName: '',
        productPrice: '',
        productProfit: '',
        productSalesCount: '',
        totalLeads: '',
        newLeads: '',
        adSpend: '',
        cpa: '',
        cpl: '',
        roas: '',
        followerCount: '',
        impressions: '',
        reach: '',
        postCount: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'データの保存に失敗しました');
    }
  };

  // グラフ用データの準備
  const chartData = data
    .map((item) => ({
      label: `${item.year}/${item.month}`,
      year: item.year,
      month: item.month,
      売上: item.totalRevenue || 0,
      新規集客: item.newLeads || 0,
      広告費: item.adSpend || 0,
      フォロワー: item.followerCount || 0,
    }))
    .reverse();

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1>ダッシュボード</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn btn-primary"
              style={{ width: 'auto', padding: '10px 20px' }}
            >
              {showForm ? 'フォームを閉じる' : 'データを入力'}
            </button>
          </div>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          {showForm && (
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h2 style={{ marginBottom: '20px' }}>月次データ入力</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div className="form-group">
                  <label>年</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    required
                    min="2020"
                    max="2100"
                  />
                </div>
                <div className="form-group">
                  <label>月</label>
                  <input
                    type="number"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                    required
                    min="1"
                    max="12"
                  />
                </div>
              </div>

              <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>売上・商品</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>総売上（円）</label>
                  <input
                    type="number"
                    value={formData.totalRevenue}
                    onChange={(e) => setFormData({ ...formData, totalRevenue: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>商品名</label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>商品単価（円）</label>
                  <input
                    type="number"
                    value={formData.productPrice}
                    onChange={(e) => setFormData({ ...formData, productPrice: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>粗利（円）</label>
                  <input
                    type="number"
                    value={formData.productProfit}
                    onChange={(e) => setFormData({ ...formData, productProfit: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>成約数</label>
                  <input
                    type="number"
                    value={formData.productSalesCount}
                    onChange={(e) => setFormData({ ...formData, productSalesCount: e.target.value })}
                  />
                </div>
              </div>

              <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>集客</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>のべ集客数</label>
                  <input
                    type="number"
                    value={formData.totalLeads}
                    onChange={(e) => setFormData({ ...formData, totalLeads: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>新規集客数</label>
                  <input
                    type="number"
                    value={formData.newLeads}
                    onChange={(e) => setFormData({ ...formData, newLeads: e.target.value })}
                  />
                </div>
              </div>

              <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>広告</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>広告費（円）</label>
                  <input
                    type="number"
                    value={formData.adSpend}
                    onChange={(e) => setFormData({ ...formData, adSpend: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>CPA</label>
                  <input
                    type="number"
                    value={formData.cpa}
                    onChange={(e) => setFormData({ ...formData, cpa: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>CPL</label>
                  <input
                    type="number"
                    value={formData.cpl}
                    onChange={(e) => setFormData({ ...formData, cpl: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>ROAS</label>
                  <input
                    type="number"
                    value={formData.roas}
                    onChange={(e) => setFormData({ ...formData, roas: e.target.value })}
                  />
                </div>
              </div>

              <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>SNS</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>フォロワー数</label>
                  <input
                    type="number"
                    value={formData.followerCount}
                    onChange={(e) => setFormData({ ...formData, followerCount: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>表示回数</label>
                  <input
                    type="number"
                    value={formData.impressions}
                    onChange={(e) => setFormData({ ...formData, impressions: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>リーチ</label>
                  <input
                    type="number"
                    value={formData.reach}
                    onChange={(e) => setFormData({ ...formData, reach: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>投稿数</label>
                  <input
                    type="number"
                    value={formData.postCount}
                    onChange={(e) => setFormData({ ...formData, postCount: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }}>
                保存
              </button>
            </form>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ marginRight: '10px' }}>表示期間:</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'white',
                color: '#333',
              }}
            >
              <option value="3months">過去3ヶ月</option>
              <option value="1year">過去1年</option>
              <option value="all">すべて</option>
            </select>
          </div>

          {chartData.length > 0 ? (
            <>
              <div style={{ marginBottom: '30px' }}>
                <h2>月別推移グラフ</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="売上" stroke="#667eea" />
                    <Line type="monotone" dataKey="新規集客" stroke="#48bb78" />
                    <Line type="monotone" dataKey="広告費" stroke="#ed8936" />
                    <Line type="monotone" dataKey="フォロワー" stroke="#9f7aea" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h2>月次データ一覧</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>年月</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>商品名</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>売上</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>商品単価</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>粗利</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>成約数</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>新規集客</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>広告費</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>フォロワー</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data
                        .sort((a, b) => {
                          if (a.year !== b.year) return b.year - a.year;
                          return b.month - a.month;
                        })
                        .map((item) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                            <td style={{ padding: '12px' }}>
                              {item.year}/{item.month}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'left' }}>
                              {item.productName || '-'}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                              {item.totalRevenue ? item.totalRevenue.toLocaleString() : '-'}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                              {item.productPrice ? item.productPrice.toLocaleString() : '-'}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                              {item.productProfit ? item.productProfit.toLocaleString() : '-'}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                              {item.productSalesCount ? item.productSalesCount.toLocaleString() : '-'}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                              {item.newLeads || '-'}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                              {item.adSpend ? item.adSpend.toLocaleString() : '-'}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                              {item.followerCount ? item.followerCount.toLocaleString() : '-'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="info-section">
              <p>データがありません。上の「データを入力」ボタンから月次データを入力してください。</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
