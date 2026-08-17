const CACHE_NAME = 'racktrack-v1.1';

// Static assets to cache for instant loading
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
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
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    // Delete old caches when a new version of the service worker is activated
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    // SECURITY RULE: Never cache the Google Apps Script API calls.
    // We always want to fetch live data from the cloud database.
    if (event.request.url.includes('script.google.com')) {
        return;
    }
    
    // For all other files (HTML, CSS, JS libraries), check cache first, then network
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});
