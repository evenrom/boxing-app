// Each release installs a complete local shell. A new worker waits until existing
// sessions close; never reload or replace the code in the middle of a workout.
const CACHE_NAME = 'boxing-pro-v6';
const ASSETS = ['./', './index.html', './style.css', './script.js', './routines.js', './timer.js', './manifest.json', './assets/icon.png', './assets/bell.mp3', './assets/minute.mp3'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))));
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const name of await caches.keys()) if (name.startsWith('boxing-pro-') && name !== CACHE_NAME) await caches.delete(name);
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request, { ignoreSearch: true });
    if (cached) return cached;
    try { return await fetch(event.request); }
    catch (error) { if (event.request.mode === 'navigate') return await cache.match('./index.html'); throw error; }
  })());
});
