/* Easy Recipes service worker: makes the app work offline.
   Bump VERSION whenever you change the app files, so phones get the update. */
const VERSION = 'er-v6';
const SHELL = [
  './', 'index.html', 'css/styles.css', 'js/app.js', 'manifest.webmanifest',
  'icons/chick-hello.webp', 'icons/chick-happy.webp', 'icons/chick-cheer.webp', 'icons/chick-spoon.webp',
  'icons/logo-badge.webp', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/favicon-64.png',
  'fonts/fredoka-latin-500-normal.woff2', 'fonts/fredoka-latin-600-normal.woff2',
  'fonts/nunito-latin-400-normal.woff2', 'fonts/nunito-latin-700-normal.woff2', 'fonts/nunito-latin-800-normal.woff2',
];
const API_CACHE = 'er-api', IMG_CACHE = 'er-img', IMG_MAX = 300;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith('er-v') && k !== VERSION).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});

async function trim(cacheName, max) {
  const c = await caches.open(cacheName), keys = await c.keys();
  for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]);
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Recipe data: try the network first, fall back to what we saw before
  if (url.hostname === 'www.themealdb.com' && url.pathname.startsWith('/api/')) {
    if (url.pathname.endsWith('random.php')) return; // never cache "random"
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(API_CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || Response.error())));
    return;
  }
  // Wikibooks Cookbook pages: network first, saved copy when offline
  if (url.hostname === 'en.wikibooks.org' && url.pathname.startsWith('/w/api.php')) {
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(API_CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || Response.error())));
    return;
  }
  // House recipes: always look for new ones first
  if (url.origin === self.location.origin && url.pathname.includes('/my-recipes/')) {
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || Response.error())));
    return;
  }
  // Photos: cache first (they never change)
  if (url.hostname === 'www.themealdb.com' && url.pathname.startsWith('/images/')) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(IMG_CACHE).then(c => c.put(req, copy)).then(() => trim(IMG_CACHE, IMG_MAX));
      return res;
    })));
    return;
  }
  // The app itself: cache first, update in the background
  if (url.origin === self.location.origin) {
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => {
      const net = fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => hit);
      return hit || net;
    }));
  }
});
