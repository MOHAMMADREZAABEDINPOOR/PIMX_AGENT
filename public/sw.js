const CACHE = 'pimx-shell-v5';
const SHELL = ['/offline.html', '/icons/icon-192.png', '/icons/icon-512.png'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('pimx-shell-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/') || url.pathname.startsWith('/share/') || request.headers.has('rsc') || url.searchParams.has('_rsc')) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => {
      const cached = await caches.match('/offline.html');
      if (!cached) return new Response('Offline. Reconnect and try again.', {status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
      // Pages redirects HTML assets to clean URLs. Navigation requests cannot
      // consume a redirected response from CacheStorage; clear that metadata.
      const headers = new Headers(cached.headers); headers.delete('content-encoding'); headers.delete('content-length');
      return new Response(cached.body, {status:cached.status,statusText:cached.statusText,headers});
    }));
    return;
  }
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/') || url.pathname.startsWith('/fonts/') || url.pathname === '/brand-logo.webp') {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => { if (response.ok) { const clone = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(request, clone))); } return response; })));
  }
});
