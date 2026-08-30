const CACHE_NAME = "verse-listener-v8";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=8",
  "./app.js?v=8",
  "./parser.js?v=8",
  "./interpreter.js?v=8",
  "./transcript-lab.js?v=8",
  "./audio-ring-buffer.js?v=8",
  "./audio-worklet.js?v=8",
  "./feedback-store.js?v=8",
  "./feedback-api.js?v=8",
  "./feedback-ui.js?v=8",
  "./source-context.js?v=8",
  "./excerpts.js?v=8",
  "./more-menu.js?v=8",
  "./mic-level-meter.js?v=8",
  "./mic-recording.js?v=8",
  "./mic-test.js?v=8",
  "./data/russyn.json",
  "./data/engwebp.json",
  "./transcripts/0000 secondsлет назад. Это было вче.txt",
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
