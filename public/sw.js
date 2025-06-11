const CACHE_NAME = 'blackbox-cache-v1'
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/public/icon.svg',
  '/public/icon-144x144.png',
  '/public/icon-192x192.png',
  '/public/screenshot1.png',
  '/public/screenshot2.png',
  '/public/screenshot-mobile1.png',
  '/public/screenshot-mobile2.png',
]

self.addEventListener('install', (evt) => {
  evt.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', (evt) => {
  evt.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    caches.match(evt.request).then((cached) => cached || fetch(evt.request)),
  )
})
