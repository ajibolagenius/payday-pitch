// Payday Pitch service worker. Rules live in spec 0001, "Offline (service worker)".
// The version comes from the registration URL (/sw.js?v=<GIT SHA>) and names every cache.
const VERSION = new URL(self.location.href).searchParams.get("v") || "dev"
const STATIC = `static-${VERSION}` // /_next/static/*, content hashed
const SHELL = `shell-${VERSION}` // /offline, icons, public pages
const PRECACHE = [
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
]
const NEVER_CACHE = ["/sign-in", "/sign-up", "/recover", "/auth/"]

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(PRECACHE)))
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC && k !== SHELL)
            .map((k) => caches.delete(k)),
        ),
      ),
  )
})

self.addEventListener("message", (event) => {
  if (event.data?.type === "skip-waiting") self.skipWaiting()
})

function isAppPath(path) {
  return path === "/app" || path.startsWith("/app/")
}

async function navigate(request, path) {
  // Signed-in pages are never stored: Cache Storage is shared by the whole
  // origin, so a cached /app would leak one user's money to the next person
  // on the device. Offline /app falls back to the offline page instead.
  const cacheable = !isAppPath(path)
  try {
    const res = await fetch(request)
    // A redirect (signed out → /sign-in) must not be stored under this URL.
    if (cacheable && res.ok && !res.redirected) {
      const copy = res.clone()
      caches.open(SHELL).then((cache) => cache.put(request, copy))
    }
    return res
  } catch {
    const shell = await caches.open(SHELL)
    const cached = cacheable && (await shell.match(request))
    return cached || (await shell.match("/offline"))
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC)
  const cached = await cache.match(request)
  if (cached) return cached
  const res = await fetch(request)
  if (res.ok) cache.put(request, res.clone())
  return res
}

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (request.method !== "GET" || url.origin !== self.location.origin) return

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request))
    return
  }

  if (
    request.mode !== "navigate" ||
    url.searchParams.has("_rsc") ||
    request.headers.has("RSC") ||
    NEVER_CACHE.some((p) => url.pathname.startsWith(p))
  ) {
    return
  }

  event.respondWith(navigate(request, url.pathname))
})
