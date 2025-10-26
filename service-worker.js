// service-worker.js - Offline Mode Support for CarTrace Pro

const CACHE_VERSION = 'cartrace-v1.0.0';
const CACHE_NAME = `cartrace-pro-${CACHE_VERSION}`;

// Files to cache for offline use
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/cartrace_homepage_enhanced.html',
    '/emergency_report.html',
    '/dashboard.html',
    '/auth.html',
    '/analytics_dashboard.html',
    '/about.html',
    '/firebase_config.js',
    '/database_helper.js',
    '/image_compression.js',
    '/api_integration.js'
];

// API endpoints to cache
const API_CACHE_NAME = `${CACHE_NAME}-api`;
const API_URLS = [
    '/api/alerts/active',
    '/api/statistics',
    '/api/community'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Installation complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] Installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => {
                            return name.startsWith('cartrace-') && name !== CACHE_NAME && name !== API_CACHE_NAME;
                        })
                        .map((name) => {
                            console.log('[Service Worker] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activation complete');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle different types of requests
    if (request.method !== 'GET') {
        // For non-GET requests (POST, PUT, DELETE), try network first
        event.respondWith(networkFirst(request));
    } else if (url.pathname.startsWith('/api/')) {
        // API requests - network first, cache fallback
        event.respondWith(apiNetworkFirst(request));
    } else if (isStaticAsset(url.pathname)) {
        // Static assets - cache first, network fallback
        event.respondWith(cacheFirst(request));
    } else {
        // Everything else - network first, cache fallback
        event.respondWith(networkFirst(request));
    }
});

// Cache-first strategy (for static assets)
async function cacheFirst(request) {
    try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            console.log('[Service Worker] Serving from cache:', request.url);
            // Update cache in background
            fetch(request).then(response => {
                if (response && response.status === 200) {
                    cache.put(request, response.clone());
                }
            });
            return cachedResponse;
        }
        
        // Not in cache, fetch from network
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
        
    } catch (error) {
        console.error('[Service Worker] Cache-first fetch failed:', error);
        return new Response('Offline - Resource not cached', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Network-first strategy (for dynamic content)
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.log('[Service Worker] Network failed, trying cache:', request.url);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page for HTML requests
        if (request.headers.get('Accept').includes('text/html')) {
            const offlineCache = await caches.open(CACHE_NAME);
            return offlineCache.match('/offline.html') || new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable'
            });
        }
        
        return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// API-specific network-first strategy
async function apiNetworkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(API_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.log('[Service Worker] API network failed, trying cache:', request.url);
        
        const apiCache = await caches.open(API_CACHE_NAME);
        const cachedResponse = await apiCache.match(request);
        
        if (cachedResponse) {
            // Add offline indicator header
            const headers = new Headers(cachedResponse.headers);
            headers.set('X-Offline-Response', 'true');
            
            return new Response(cachedResponse.body, {
                status: cachedResponse.status,
                statusText: cachedResponse.statusText,
                headers: headers
            });
        }
        
        return new Response(JSON.stringify({
            error: 'Offline',
            message: 'Unable to fetch data while offline',
            cached: false
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Helper function to check if URL is a static asset
function isStaticAsset(pathname) {
    return pathname.endsWith('.html') ||
           pathname.endsWith('.js') ||
           pathname.endsWith('.css') ||
           pathname.endsWith('.png') ||
           pathname.endsWith('.jpg') ||
           pathname.endsWith('.svg') ||
           pathname.endsWith('.ico');
}

// Handle messages from clients
self.addEventListener('message', (event) => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data.type === 'CACHE_URLS') {
        // Cache additional URLs on demand
        caches.open(CACHE_NAME).then((cache) => {
            cache.addAll(event.data.urls);
        });
    }
    
    if (event.data.type === 'CLEAR_CACHE') {
        // Clear specific cache
        caches.delete(event.data.cacheName || CACHE_NAME);
    }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-alerts') {
        event.waitUntil(syncAlerts());
    }
    
    if (event.tag === 'sync-sightings') {
        event.waitUntil(syncSightings());
    }
});

// Sync stolen vehicle alerts when back online
async function syncAlerts() {
    try {
        const cache = await caches.open('offline-actions');
        const requests = await cache.keys();
        
        for (const request of requests) {
            if (request.url.includes('/alerts')) {
                try {
                    const response = await cache.match(request);
                    const data = await response.json();
                    
                    // Re-submit the alert
                    await fetch('/api/alerts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    
                    // Remove from offline cache
                    await cache.delete(request);
                    
                } catch (error) {
                    console.error('[Service Worker] Failed to sync alert:', error);
                }
            }
        }
    } catch (error) {
        console.error('[Service Worker] Sync alerts failed:', error);
    }
}

// Sync vehicle sightings when back online
async function syncSightings() {
    try {
        const cache = await caches.open('offline-actions');
        const requests = await cache.keys();
        
        for (const request of requests) {
            if (request.url.includes('/sightings')) {
                try {
                    const response = await cache.match(request);
                    const data = await response.json();
                    
                    // Re-submit the sighting
                    await fetch(request.url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    
                    // Remove from offline cache
                    await cache.delete(request);
                    
                } catch (error) {
                    console.error('[Service Worker] Failed to sync sighting:', error);
                }
            }
        }
    } catch (error) {
        console.error('[Service Worker] Sync sightings failed:', error);
    }
}

// Push notification handler
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    
    const title = data.title || 'CarTrace Pro';
    const options = {
        body: data.body || 'New stolen vehicle alert',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [200, 100, 200],
        tag: data.tag || 'general',
        data: data.data || {},
        actions: [
            { action: 'view', title: 'View Alert' },
            { action: 'close', title: 'Dismiss' }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'view') {
        const urlToOpen = event.notification.data.url || '/dashboard.html';
        
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then((clientList) => {
                    // Check if there's already a window open
                    for (const client of clientList) {
                        if (client.url === urlToOpen && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    // Open new window if none exists
                    if (clients.openWindow) {
                        return clients.openWindow(urlToOpen);
                    }
                })
        );
    }
});

console.log('[Service Worker] Loaded');
