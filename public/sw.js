// Payday Pitch service worker. Rules live in spec 0001, "Offline (service worker)".
// The version comes from the registration URL (/sw.js?v=<commit SHA>) and names every cache.
const VERSION = new URL(self.location.href).searchParams.get("v") || "dev";
const STATIC = `static-${VERSION}`; // /_next/static/*, content hashed
const SHELL = `shell-${VERSION}`; // /offline, icons, public pages
const PAGES = `pages-${VERSION}-`; // + user id: signed in pages, one user at a time
const PRECACHE = [
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
];
const NEVER_CACHE = ["/sign-in", "/sign-up", "/recover", "/auth/"];

// Set by the page (feature 5). Lost when the worker sleeps, so reads fall back
// to the one pages cache on disk; writes need it set, so unknown users cache nothing.
let user = null;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC && k !== SHELL && !k.startsWith(PAGES))
          .map((k) => caches.delete(k)),
      ),
    ),
  );
});

async function dropPageCaches(keep) {
  const keys = await caches.keys();
  await Promise.all(
    keys
      .filter((k) => k.startsWith("pages-") && k !== keep)
      .map((k) => caches.delete(k)),
  );
}

self.addEventListener("message", (event) => {
  const { type, id } = event.data ?? {};
  if (type === "skip-waiting") self.skipWaiting();
  if (type === "user") {
    user = String(id);
    event.waitUntil(dropPageCaches(PAGES + user));
  }
  if (type === "sign-out") {
    user = null;
    event.waitUntil(dropPageCaches(null));
  }
});

async function pagesCacheName() {
  if (user) return PAGES + user;
  return (await caches.keys()).find((k) => k.startsWith(PAGES)) ?? null;
}

async function navigate(request, path) {
  const isApp = path === "/app" || path.startsWith("/app/");
  const writeTo = isApp ? (user ? PAGES + user : null) : SHELL;
  try {
    const res = await fetch(request);
    // A redirect (signed out → /sign-in) must not be stored under this URL.
    if (writeTo && res.ok && !res.redirected) {
      const copy = res.clone();
      caches.open(writeTo).then((cache) => cache.put(request, copy));
    }
    return res;
  } catch {
    const readFrom = isApp ? await pagesCacheName() : SHELL;
    const cached = readFrom && (await (await caches.open(readFrom)).match(request));
    return cached || (await (await caches.open(SHELL)).match("/offline"));
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC);
  const cached = await cache.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (
    request.mode !== "navigate" ||
    url.searchParams.has("_rsc") ||
    request.headers.has("RSC") ||
    NEVER_CACHE.some((p) => url.pathname.startsWith(p))
  ) {
    return;
  }

  event.respondWith(navigate(request, url.pathname));
});
