const CACHE = "fos-v1"
const STATIC = `${CACHE}-static`
const API = `${CACHE}-api`

self.addEventListener("install", (e) => {
  self.skipWaiting()
  e.waitUntil(
    caches.open(STATIC).then((c) => c.addAll(["/", "/login", "/dashboard"]))
  )
})

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== STATIC && k !== API).map((k) => caches.delete(k))))
  )
})

self.addEventListener("fetch", (e) => {
  const { request } = e
  const url = new URL(request.url)

  if (url.pathname.startsWith("/api/")) {
    e.respondWith(networkFirst(request, API))
  } else if (url.pathname.match(/\.(js|css|woff2?|png|jpg|svg|ico)$/) && url.origin === self.location.origin) {
    e.respondWith(cacheFirst(request, STATIC))
  } else if (url.pathname === "/" || url.pathname.startsWith("/_next/")) {
    e.respondWith(cacheFirst(request, STATIC))
  } else {
    e.respondWith(networkFirst(request, STATIC))
  }
})

async function networkFirst(request: Request, cacheName: string) {
  try {
    const res = await fetch(request)
    if (res.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, res.clone())
    }
    return res
  } catch {
    const cached = await caches.match(request)
    return cached || new Response("Offline", { status: 503 })
  }
}

async function cacheFirst(request: Request, cacheName: string) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const res = await fetch(request)
    if (res.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, res.clone())
    }
    return res
  } catch {
    return new Response("Offline", { status: 503 })
  }
}
