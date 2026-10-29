/* Pip v3 – service worker: keeps the app shell available offline.
   Bump VERSION whenever one of the files below changes. */
const VERSION = 'pip-site-v1';
const SHELL = ['./', 'app.webmanifest', 'pip-tinte-icon-192.png', 'pip-tinte-icon-512.png', 'pip-tinte-icon-maskable-512.png', 'pip-tinte-icon-180.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  // only the app's own files; AI and speech requests always go to the network
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // the page: network first so updates arrive, cache when offline
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; }).catch(() => caches.match(req).then((r) => r || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(req).then((r) => r || fetch(req)));
});
