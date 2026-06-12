const CACHE = 'preop-eval-v4';
const STATIC_ASSETS = [
  './',
  './index.html',
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
  // 对于 HTML 文件，使用缓存优先，网络兜底，确保离线可用
  if (e.request.mode === 'navigate' || (e.request.url.indexOf('index.html') >= 0)) {
    e.respondWith(
      caches.match(e.request).then(function(cached) {
        // 有缓存直接用缓存，保证离线也能用
        if (cached) return cached;
        // 没有缓存再请求网络
        return fetch(e.request)["catch"](function() {
          return caches.match('./');
        });
      })
    );
    return;
  }
  // 对于静态资源，使用缓存优先
  e.respondWith(
    caches.match(e.request).then(function(r) { return r || fetch(e.request); })
  );
});