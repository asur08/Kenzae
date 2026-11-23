import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Progressive Web App (PWA) Offline Shell Registration
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
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
  } else {
    // In development mode, automatically unregister any stale service workers and clear caches
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => caches.delete(key));
      });
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
