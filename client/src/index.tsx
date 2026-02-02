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

console.log('[index.tsx] Starting app initialization...');
console.log('[index.tsx] React version:', React.version);
console.log('[index.tsx] NODE_ENV:', process.env.NODE_ENV);
console.log('[index.tsx] REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

// root要素を確実に取得または作成
let rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('[index.tsx] Root element not found! Creating new one...');
  rootElement = document.createElement('div');
  rootElement.id = 'root';
  rootElement.style.cssText = 'height: 100%; min-height: 100vh; width: 100%; display: block;';
  document.body.appendChild(rootElement);
}

// bodyとhtmlのスタイルを確実に設定
document.body.style.cssText = 'height: 100%; min-height: 100vh; width: 100%; display: block; margin: 0; padding: 0;';
document.documentElement.style.cssText = 'height: 100%; min-height: 100vh; width: 100%; display: block; margin: 0; padding: 0;';

console.log('[index.tsx] Root element found:', !!rootElement);
console.log('[index.tsx] Root element height:', rootElement.offsetHeight);
console.log('[index.tsx] Body height:', document.body.offsetHeight);
console.log('[index.tsx] HTML height:', document.documentElement.offsetHeight);

try {
  const root = ReactDOM.createRoot(rootElement);
  console.log('[index.tsx] Rendering app...');
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('[index.tsx] App rendered successfully');
} catch (error) {
  console.error('[index.tsx] Error rendering app:', error);
  // エラーが発生した場合でも、最低限のメッセージを表示
  rootElement.innerHTML = `
    <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; padding: 20px; text-align: center; color: white;">
      <h1>エラーが発生しました</h1>
      <p>アプリの読み込み中にエラーが発生しました。</p>
      <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background-color: white; color: #667eea; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
        ページを再読み込み
      </button>
      <details style="margin-top: 20px; text-align: left; color: white;">
        <summary>エラー詳細</summary>
        <pre style="margin-top: 10px; padding: 10px; background-color: rgba(0,0,0,0.3); border-radius: 5px; overflow: auto; color: white;">
          ${error instanceof Error ? error.toString() : String(error)}
        </pre>
      </details>
    </div>
  `;
}
