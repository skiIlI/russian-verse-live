const CACHE_NAME = "verse-listener-v5";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=5",
  "./app.js?v=5",
  "./parser.js?v=5",
  "./audio-ring-buffer.js?v=5",
  "./audio-worklet.js?v=5",
  "./feedback-store.js?v=5",
  "./feedback-api.js?v=5",
  "./feedback-ui.js?v=5",
  "./source-context.js?v=5",
  "./excerpts.js?v=5",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./assets/malachi-4-5-6.wav",
  "./assets/first-corinthians-16-14.wav",
  "./assets/mark-10-13.wav",
  "./assets/genesis-18-19.wav",
  "./assets/luke-12-13.wav"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).then((response) => {
      if (!response || response.status !== 200 || response.type === "opaque") return response;
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request)),
  );
});
