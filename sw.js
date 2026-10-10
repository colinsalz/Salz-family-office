// Minimal offline support for the hosted build: network first (so updates show up immediately),
// falling back to the last cached copy of the app when offline. Supabase / price API calls are never cached.
// 20261010151555812 is replaced at build time (vite.config.ts) so every deploy ships a byte-different sw.js: the browser then installs it
// right away, it skipWaiting()s + claims open pages, and the page reloads itself onto the new build (see index.html).
const BUILD_ID = '20261010151555812'
const CACHE = 'salz-fo-' + BUILD_ID
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png']
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => undefined)); self.skipWaiting() })
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())) })
self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return
  e.respondWith(fetch(req, { cache: 'no-cache' }).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)) }
    return res
  }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('./index.html'))))
})
