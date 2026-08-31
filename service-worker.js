const CACHE_NAME = "verse-listener-v26";
const APP_CACHE_PREFIX = "verse-listener-v";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=26",
  "./app.js?v=26",
  "./parser.js?v=26",
  "./interpreter.js?v=26",
  "./listener-preferences.js?v=26",
  "./select-control.js?v=26",
  "./ui-shell.js?v=26",
  "./live-quote-detector.js?v=26",
  "./transcript-history.js?v=26",
  "./transcript-progress.js?v=26",
  "./service-transcriber.js?v=26",
  "./whisper-session.js?v=26",
  "./whisper-download-progress.js?v=26",
  "./whisper-models.js?v=26",
  "./whisper-worker.js?v=26",
  "./audio-ring-buffer.js?v=26",
  "./audio-worklet.js?v=26",
  "./feedback-store.js?v=26",
  "./feedback-api.js?v=26",
  "./feedback-ui.js?v=26",
  "./source-context.js?v=26",
  "./more-menu.js?v=26",
  "./mic-level-meter.js?v=26",
  "./mic-recording.js?v=26",
  "./mic-test.js?v=26",
  "./data/russyn.json",
  "./data/engwebp.json",
  "./manifest.webmanifest",
  "./assets/icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith(APP_CACHE_PREFIX) && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.origin === self.location.origin && url.pathname.startsWith("/api/")) return;
  if (url.origin === self.location.origin && url.pathname.includes("/data/")) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
        if (response?.status === 200) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
        return response;
      })),
    );
    return;
  }
  event.respondWith(
    fetch(event.request).then((response) => {
      if (!response || response.status !== 200 || response.type === "opaque") return response;
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request)),
  );
});
