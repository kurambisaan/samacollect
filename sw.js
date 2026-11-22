// SamaCollect — service worker (fonctionnement hors ligne)
const CACHE = "samacollect-v5";
// Fichiers chargés par index.html, avec exactement les mêmes adresses (?v inclus)
const PRECACHE = [
  "./", "./index.html", "./config.js", "./app.js?v6", "./import.js?v1", "./extras.js?v3",
  "./styles.css?v4", "./manifest.webmanifest", "./icon.svg", "./icon-192.png", "./icon-512.png"
];
const CDN = ["cdn.jsdelivr.net", "unpkg.com", "esm.sh", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(PRECACHE.map(u => c.add(u).catch(() => null))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname.endsWith("supabase.co") || url.hostname.endsWith("supabase.in")) return;
  if (CDN.includes(url.hostname)) {
    // Bibliothèques externes : cache d'abord
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    })));
    return;
  }
  if (url.origin === location.origin) {
    // Fichiers du site : réseau d'abord, cache si hors ligne
    e.respondWith(fetch(req, { cache: "no-cache" }).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(hit => hit || caches.match("./index.html"))));
  }
});
