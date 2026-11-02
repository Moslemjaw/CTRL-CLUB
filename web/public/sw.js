// Caches build assets and the offline page only. Pages are never cached, and
// Supabase requests are off-site so they never pass through here: signed-in
// data and auth stay out of the cache entirely.
const VERSION = new URL(self.location.href).searchParams.get("v") || "0";
const CACHE = `ctrl-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png"];

const isStaticAsset = ({ pathname }) =>
  pathname.startsWith("/_next/static/") ||
  pathname.startsWith("/icons/") ||
  pathname.startsWith("/images/") ||
  pathname === "/icon.png";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((name) => name.startsWith("ctrl-") && name !== CACHE).map((name) => caches.delete(name)));
      await self.registration.navigationPreload?.enable();
      await self.clients.claim();
    })()
  );
});

async function navigate(event) {
  try {
    return (await event.preloadResponse) || (await fetch(event.request));
  } catch {
    return (await caches.match(OFFLINE_URL)) || Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok && response.type === "basic") await cache.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") event.respondWith(navigate(event));
  else if (isStaticAsset(url)) event.respondWith(cacheFirst(request));
});
