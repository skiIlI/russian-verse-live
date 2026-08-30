import { createReadStream, statSync } from "node:fs";
import { createServer, get } from "node:http";
import { dirname, extname, join, resolve, sep } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { createYouTubeAudioCache } from "./youtube-audio-cache.mjs";
import { extractYouTubeTranscript } from "./youtube-captions.mjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const host = "127.0.0.1";
const port = Number.parseInt(process.env.VERSE_DETECTOR_PORT ?? "4173", 10);
const localUrl = `http://${host}:${port}/`;
const youtubeAudioCache = createYouTubeAudioCache(join(tmpdir(), `verse-listener-youtube-${process.pid}`));
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".wav": "audio/wav",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

function resolveRequestPath(requestUrl = "/") {
  const pathname = decodeURIComponent(new URL(requestUrl, localUrl).pathname);
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const candidate = resolve(projectRoot, relativePath);
  if (candidate !== projectRoot && !candidate.startsWith(`${projectRoot}${sep}`)) return null;
  try {
    return statSync(candidate).isDirectory() ? resolve(candidate, "index.html") : candidate;
  } catch {
    return candidate;
  }
}

async function serveYouTubeTranscript(request, response) {
  const url = new URL(request.url, localUrl);
  try {
    const result = await extractYouTubeTranscript(url.searchParams.get("videoId") ?? "", url.searchParams.get("language") ?? "ru");
    const body = JSON.stringify(result);
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Length": Buffer.byteLength(body),
      "Content-Type": "application/json; charset=utf-8",
    }).end(body);
  } catch (error) {
    const body = JSON.stringify({ error: error instanceof Error ? error.message : "Transcript import failed." });
    response.writeHead(422, {
      "Cache-Control": "no-store",
      "Content-Length": Buffer.byteLength(body),
      "Content-Type": "application/json; charset=utf-8",
    }).end(body);
  }
}

async function serveYouTubeAudio(request, response) {
  const url = new URL(request.url, localUrl);
  try {
    await youtubeAudioCache.serve(url.searchParams.get("videoId") ?? "", request, response);
  } catch (error) {
    const body = error instanceof Error ? error.message : "YouTube audio failed.";
    response.writeHead(422, {
      "Cache-Control": "no-store",
      "Content-Length": Buffer.byteLength(body),
      "Content-Type": "text/plain; charset=utf-8",
    }).end(body);
  }
}

async function serveYouTubeClip(request, response) {
  const url = new URL(request.url, localUrl);
  const start = Math.max(0, Number(url.searchParams.get("start") ?? 0));
  const duration = Math.min(60 * 60, Math.max(10, Number(url.searchParams.get("duration") ?? 600)));
  try {
    await youtubeAudioCache.serveClip(url.searchParams.get("videoId") ?? "", start, duration, request, response);
  } catch (error) {
    const body = error instanceof Error ? error.message : "YouTube clip failed.";
    response.writeHead(422, {
      "Cache-Control": "no-store",
      "Content-Length": Buffer.byteLength(body),
      "Content-Type": "text/plain; charset=utf-8",
    }).end(body);
  }
}

const server = createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  if (request.url?.startsWith("/api/youtube-transcript")) {
    void serveYouTubeTranscript(request, response);
    return;
  }
  if (request.url?.startsWith("/api/youtube-audio")) {
    void serveYouTubeAudio(request, response);
    return;
  }
  if (request.url?.startsWith("/api/youtube-clip")) {
    void serveYouTubeClip(request, response);
    return;
  }

  let filePath;
  try {
    filePath = resolveRequestPath(request.url);
  } catch {
    response.writeHead(400).end("Bad request");
    return;
  }
  if (!filePath) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  let stats;
  try {
    stats = statSync(filePath);
  } catch {
    response.writeHead(404).end("Not found");
    return;
  }
  if (!stats.isFile()) {
    response.writeHead(404).end("Not found");
    return;
  }

  response.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Length": stats.size,
    "Content-Type": mimeTypes[extname(filePath).toLowerCase()] ?? "application/octet-stream",
  });
  if (request.method === "HEAD") response.end();
  else createReadStream(filePath).pipe(response);
});

function verifyExistingServer() {
  const request = get(localUrl, (response) => {
    let body = "";
    response.setEncoding("utf8");
    response.on("data", (chunk) => {
      if (body.length < 65_536) body += chunk;
    });
    response.on("end", () => {
      if (response.statusCode === 200 && /<title>Verse Listener<\/title>/.test(body)) {
        console.log(`Verse Detector is already running at ${localUrl}`);
        process.exit(0);
      }
      console.error(`Port ${port} is in use by another service.`);
      process.exit(1);
    });
  });
  request.setTimeout(1_500, () => request.destroy(new Error("Existing server did not respond.")));
  request.on("error", (error) => {
    console.error(error.message);
    process.exit(1);
  });
}

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") verifyExistingServer();
  else {
    console.error(error);
    process.exit(1);
  }
});

server.listen(port, host, () => {
  console.log(`Verse Detector server ready at ${localUrl}`);
  console.log("Keep this terminal open. Press Ctrl+C to stop the server.");
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => void youtubeAudioCache.cleanup().finally(() => process.exit(0))));
}
