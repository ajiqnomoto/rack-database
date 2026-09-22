const CACHE_NAME = 'racktrack-v1.2';

// Scope-relative paths ('./') so the SW works from the /rack-database/ subpath on GitHub Pages.
const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css',
    'https://code.jquery.com/jquery-3.7.0.min.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
    'https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js',
    'https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    // Take control of open pages immediately, then delete old caches.
    event.waitUntil(
        self.clients.claim().then(() =>
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cache) => {
                        if (cache !== CACHE_NAME) {
                            return caches.delete(cache);
                        }
                    })
                );
            })
        )
    );
});

self.addEventListener('fetch', (event) => {
    // SECURITY RULE: Never cache the Google Apps Script API calls.
    // We always want to fetch live data from the cloud database.
    if (event.request.url.includes('script.google.com')) {
        return;
    }

    const url = new URL(event.request.url);

    // Network-first for navigations/HTML: always try fresh content, fall back to cache when offline.
    if (event.request.mode === 'navigate' || (event.request.method === 'GET' && (url.pathname.endsWith('/') || url.pathname.endsWith('.html')))) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response && response.ok) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                    }
                    return response;
                })
                .catch(() => caches.match(event.request, { ignoreSearch: true }).then((cached) => cached || caches.match('./index.html')))
        );
        return;
    }

    // Cache-first for static assets (CSS/JS/images/fonts), refreshing the cache in the background.
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                fetch(event.request).then((response) => {
                    if (response && response.ok) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                    }
                }).catch(() => { /* offline: keep serving cache */ });
                return cachedResponse;
            }
            return fetch(event.request).then((response) => {
                if (response && response.ok) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                }
                return response;
            });
        })
    );
});
