import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Progressive Web App (PWA) Offline Shell Registration
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.debug('[PWA] ServiceWorker registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.debug('[PWA] ServiceWorker registration skipped:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
