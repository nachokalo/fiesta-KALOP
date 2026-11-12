// Lets guards reopen the page without signal. Pages: network first, saved copy if offline.
// Calls to Google (the spreadsheet) are never cached.
const CACHE = "kalop-v3";
const ARCHIVOS = ["./", "index.html", "invitados.html", "personal.html", "icon-192.png", "icon-512.png", "apple-touch-icon.png",
  "manifest-invitados.webmanifest", "manifest-personal.webmanifest", "logo.png", "logo-dark.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok) { const copia = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copia)); }
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("index.html")))
  );
});
