import { createReadStream } from "node:fs";
import { mkdir, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const clipScript = fileURLToPath(new URL("./extract-audio-clip.py", import.meta.url));

export function parseByteRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(String(header ?? ""));
  if (!match || (!match[1] && !match[2])) return null;
  let start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  let end = match[2] && match[1] ? Number(match[2]) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= size || end < start) return null;
  end = Math.min(end, size - 1);
  return { start, end };
}

function runDownloader(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true, stdio: ["ignore", "ignore", "pipe"] });
    let errorText = "";
    child.stderr.on("data", (chunk) => { if (errorText.length < 4_000) errorText += chunk; });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(errorText.trim() || `yt-dlp exited with ${code}.`)));
  });
}

async function downloadAudio(videoId, path) {
  const localAppData = process.env.LOCALAPPDATA;
  const candidates = [
    process.env.VERSE_LISTENER_YTDLP,
    localAppData ? join(localAppData, "VerseListener", "benchmark-tools", "Scripts", "yt-dlp.exe") : null,
    localAppData ? join(localAppData, "Temp", "verse-listener-benchmark-env", "Scripts", "yt-dlp.exe") : null,
    "yt-dlp",
  ].filter(Boolean);
  const args = ["--no-playlist", "--no-part", "-f", "bestaudio[ext=webm]/bestaudio", "-o", path, `https://www.youtube.com/watch?v=${videoId}`];
  let lastError = null;
  for (const command of candidates) {
    try {
      await runDownloader(command, args);
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`A current yt-dlp helper is required for YouTube audio. ${lastError?.message ?? ""}`.trim());
}

async function extractClip(source, destination, start, duration) {
  const localAppData = process.env.LOCALAPPDATA;
  const candidates = [
    process.env.VERSE_LISTENER_PYTHON,
    localAppData ? join(localAppData, "VerseListener", "benchmark-tools", "Scripts", "python.exe") : null,
    localAppData ? join(localAppData, "Temp", "verse-listener-benchmark-env", "Scripts", "python.exe") : null,
    "python",
  ].filter(Boolean);
  let lastError = null;
  for (const command of candidates) {
    try {
      await runDownloader(command, [clipScript, source, destination, String(start), String(duration)]);
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`Python with PyAV is required to prepare a benchmark clip. ${lastError?.message ?? ""}`.trim());
}

export function createYouTubeAudioCache(directory) {
  const pending = new Map();
  const metadata = new Map();
  const clipPending = new Map();
  const clips = new Map();

  async function prepare(videoId) {
    if (metadata.has(videoId)) return metadata.get(videoId);
    if (pending.has(videoId)) return pending.get(videoId);
    const task = (async () => {
      await mkdir(directory, { recursive: true });
      const path = join(directory, `${videoId}.media`);
      await downloadAudio(videoId, path);
      const info = { path, size: (await stat(path)).size, mimeType: "audio/webm; codecs=opus" };
      metadata.set(videoId, info);
      return info;
    })().finally(() => pending.delete(videoId));
    pending.set(videoId, task);
    return task;
  }

  async function serve(videoId, requestMessage, responseMessage) {
    const file = await prepare(videoId);
    const range = requestMessage.headers.range ? parseByteRange(requestMessage.headers.range, file.size) : null;
    if (requestMessage.headers.range && !range) {
      responseMessage.writeHead(416, { "Content-Range": `bytes */${file.size}` }).end();
      return;
    }
    const start = range?.start ?? 0;
    const end = range?.end ?? file.size - 1;
    const headers = {
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-store",
      "Content-Length": end - start + 1,
      "Content-Type": file.mimeType,
    };
    if (range) headers["Content-Range"] = `bytes ${start}-${end}/${file.size}`;
    responseMessage.writeHead(range ? 206 : 200, headers);
    if (requestMessage.method === "HEAD") responseMessage.end();
    else createReadStream(file.path, { start, end }).pipe(responseMessage);
  }

  async function prepareClip(videoId, start, duration) {
    const key = `${videoId}-${start}-${duration}`;
    if (clips.has(key)) return clips.get(key);
    if (clipPending.has(key)) return clipPending.get(key);
    const task = (async () => {
      const source = await prepare(videoId);
      const path = join(directory, `${key}.wav`);
      await extractClip(source.path, path, start, duration);
      const info = { path, size: (await stat(path)).size, mimeType: "audio/wav" };
      clips.set(key, info);
      return info;
    })().finally(() => clipPending.delete(key));
    clipPending.set(key, task);
    return task;
  }

  async function serveClip(videoId, start, duration, requestMessage, responseMessage) {
    const file = await prepareClip(videoId, start, duration);
    const range = requestMessage.headers.range ? parseByteRange(requestMessage.headers.range, file.size) : null;
    if (requestMessage.headers.range && !range) {
      responseMessage.writeHead(416, { "Content-Range": `bytes */${file.size}` }).end();
      return;
    }
    const first = range?.start ?? 0;
    const last = range?.end ?? file.size - 1;
    const headers = {
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-store",
      "Content-Length": last - first + 1,
      "Content-Type": file.mimeType,
    };
    if (range) headers["Content-Range"] = `bytes ${first}-${last}/${file.size}`;
    responseMessage.writeHead(range ? 206 : 200, headers);
    if (requestMessage.method === "HEAD") responseMessage.end();
    else createReadStream(file.path, { start: first, end: last }).pipe(responseMessage);
  }

  return {
    serve,
    serveClip,
    cleanup: () => rm(directory, { recursive: true, force: true }),
  };
}
