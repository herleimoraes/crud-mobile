const CACHE_NAME = 'crud-clientes-v1';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './script.js'
];

// Instala o Service Worker e salva os arquivos no cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(urlsToCache))
    );
});

// Intercepta as requisições para carregar mais rápido
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
});
