// Service Worker for Mombasa Shisha Bongs PWA
const CACHE_NAME = 'mombasa-shisha-bongs-v1'
const OFFLINE_PAGE = '/offline'

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/products',
  '/icon.png',
  '/logo.png',
  '/uploads/hookah.svg',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets')
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.error('[Service Worker] Failed to cache some assets:', err)
        // Don't fail installation if some assets fail to cache
        return Promise.resolve()
      })
    })
  )
  self.skipWaiting() // Activate immediately
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )
    })
  )
  return self.clients.claim() // Take control of all pages immediately
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip non-HTTP(S) protocols (including browser extensions)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return
  }

  // Skip admin routes
  if (url.pathname.startsWith('/admin')) {
    return
  }

  // Skip API routes (except for critical ones)
  if (url.pathname.startsWith('/api')) {
    // Only cache specific API endpoints
    const cacheableAPIs = ['/api/products', '/api/categories']
    if (!cacheableAPIs.some((api) => url.pathname.startsWith(api))) {
      return
    }
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone the response
        const responseToCache = response.clone()

        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            // Only cache GET requests and valid protocols
            const requestUrl = new URL(request.url)
            if (
              request.method === 'GET' && 
              (requestUrl.protocol === 'http:' || requestUrl.protocol === 'https:')
            ) {
              cache.put(request, responseToCache).catch((err) => {
                console.log('[Service Worker] Failed to cache:', request.url, err)
              })
            }
          })
        }

        return response
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }

          // If it's a navigation request and we have no cache, show offline page
          if (request.mode === 'navigate') {
            return caches.match(OFFLINE_PAGE).then((offlinePage) => {
              return offlinePage || new Response('Offline', { status: 503 })
            })
          }

          // For other requests, return a basic offline response
          return new Response('Offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          })
        })
      })
  )
})

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received')
  // Future implementation for order updates, promotions, etc.
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked')
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  )
})

