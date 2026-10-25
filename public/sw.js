const CACHE_NAME = "my-workout-app-v2";
const CORE_ASSETS = ["/", "/offline.html", "/manifest.webmanifest", "/pwa-192.png", "/pwa-512.png", "/pwa-maskable-512.png"];

async function cacheResponse(request, response) {
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response);
  if (new URL(request.url).pathname === "/api/exercises") {
    const exerciseRequests = (await cache.keys()).filter((item) => new URL(item.url).pathname === "/api/exercises");
    await Promise.all(exerciseRequests.slice(0, Math.max(0, exerciseRequests.length - 24)).map((item) => cache.delete(item)));
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("my-workout-app-") && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) await cacheResponse(request, response.clone());
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match("/")) || (await caches.match("/offline.html"))
      )
    );
    return;
  }

  if (url.pathname === "/api/exercises") {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) await cacheResponse(request, response.clone());
          return response;
        })
        .catch(async () => (await caches.match(request)) || Response.json({ error: "Estás sin conexión. Los ejercicios guardados siguen disponibles en el registro." }, { status: 503 }))
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || CORE_ASSETS.includes(url.pathname) || url.pathname === "/icon.svg" || url.pathname === "/favicon.ico") {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then(async (response) => {
        if (response.ok) await cacheResponse(request, response.clone());
        return response;
      }))
    );
  }
});
