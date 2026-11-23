/**
 * Kenzae Boutique Service Worker (PWA)
 * - Cache-first for fonts and static styles
 * - Stale-while-revalidate for high-resolution drape photography
 * - Network-first for dynamic API routes (/api/*)
 */

const CACHE_NAME_SHELL = 'kenzae-app-shell-v2';
const CACHE_NAME_IMAGES = 'kenzae-images-cache-v1';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/data/products.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME_SHELL).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME_SHELL && key !== CACHE_NAME_IMAGES) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // In development, do not cache Vite dev modules or HMR requests
  if (url.pathname.startsWith('/@') || url.pathname.startsWith('/src/')) {
    return;
  }

  // 1. API routes: Network-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // 2. Navigation requests (HTML / App Shell): Network-first with cache fallback
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME_SHELL).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  // 3. High-res images: Stale-While-Revalidate
  const isImage =
    request.destination === 'image' ||
    url.pathname.match(/\.(webp|jpg|jpeg|png|svg|gif|avif)$/i) ||
    url.hostname.includes('unsplash.com') ||
    url.hostname.includes('supabase.co');

  if (isImage) {
    event.respondWith(
      caches.open(CACHE_NAME_IMAGES).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResp) => {
            if (networkResp.ok) {
              cache.put(request, networkResp.clone());
            }
            return networkResp;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 4. Static Assets: Cache-First with Network Fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        // Cache successful local assets
        if (response.ok && url.origin === location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME_SHELL).then((cache) => {
            cache.put(request, clone);
          });
        }
        return response;
      });
    })
  );
});
