// Keeps Math Bridge Academy working offline. A new build changes VERSION, which refreshes the cache.
const VERSION = 'mba-0ea4fe8635';
const CORE = ["./", "./index.html", "./app.js?v=0ea4fe8635", "./lessons.js?v=0ea4fe8635", "./games.js?v=0ea4fe8635", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const keep = (req, res) => { if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return res; };
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate') {  // the page itself: newest when online, saved copy when offline
    e.respondWith(fetch(req).then(res => keep('./index.html', res)).catch(() => caches.match('./index.html')));
    return;
  }
  if (url.origin === location.origin || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => keep(req, res))));
  }
});
