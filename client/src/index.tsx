import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// グローバルエラーハンドラー
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // エラーが発生した場合、ユーザーに通知
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; padding: 20px; text-align: center;">
        <h1>エラーが発生しました</h1>
        <p>ページの読み込み中にエラーが発生しました。</p>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background-color: #6366f1; color: white; border: none; border-radius: 5px; cursor: pointer;">
          ページを再読み込み
        </button>
        <details style="margin-top: 20px; text-align: left;">
          <summary>エラー詳細</summary>
          <pre style="margin-top: 10px; padding: 10px; background-color: #f3f4f6; border-radius: 5px; overflow: auto;">
            ${event.error?.toString() || 'Unknown error'}
          </pre>
        </details>
      </div>
    `;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  // root要素が見つからない場合、bodyに直接追加
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  document.body.appendChild(newRoot);
  const root = ReactDOM.createRoot(newRoot);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
