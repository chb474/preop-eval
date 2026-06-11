const CACHE = 'preop-eval-v2';
const STATIC_ASSETS = [
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // 对于 HTML 文件（index.html），总是从网络获取，确保是最新版本
  if (e.request.mode === 'navigate' || (e.request.url.indexOf('index.html') >= 0)) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  // 对于静态资源，使用缓存优先
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});