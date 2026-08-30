const CACHE_NAME = "verse-listener-v12";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=12",
  "./app.js?v=12",
  "./parser.js?v=12",
  "./interpreter.js?v=12",
  "./transcript-lab.js?v=12",
  "./transcript-feedback.js?v=12",
  "./transcript-review.js?v=12",
  "./youtube-review.js?v=12",
  "./youtube-audio-transcriber.js?v=12",
  "./transcript-timeline.js?v=12",
  "./transcription-benchmark.js?v=12",
  "./transcription-benchmark-core.js?v=12",
  "./whisper-session.js?v=12",
  "./whisper-worker.js?v=12",
  "./audio-ring-buffer.js?v=12",
  "./audio-worklet.js?v=12",
  "./feedback-store.js?v=12",
  "./feedback-api.js?v=12",
  "./feedback-ui.js?v=12",
  "./source-context.js?v=12",
  "./excerpts.js?v=12",
  "./more-menu.js?v=12",
  "./mic-level-meter.js?v=12",
  "./mic-recording.js?v=12",
  "./mic-test.js?v=12",
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
  const url = new URL(event.request.url);
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
