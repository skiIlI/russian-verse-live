import { createReadStream, existsSync, statSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { spawn, spawnSync } from "node:child_process";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const argumentsList = process.argv.slice(2);

function option(name, fallback = "") {
  const index = argumentsList.indexOf(name);
  return index >= 0 ? argumentsList[index + 1] : fallback;
}

const audioPath = resolve(option("--audio"));
const truthPath = resolve(option("--truth"));
const outputPath = resolve(option("--output"));
const port = Number(option("--port", "4187"));
const model = option("--model", "base");
const windowSeconds = Number(option("--window-seconds", "4.5"));
const onlyWindow = option("--only-window");
const visible = argumentsList.includes("--visible");
const auditRoot = resolve(option("--work-dir", join(process.env.LOCALAPPDATA ?? projectRoot, "VerseListener", "production-replay")));
const clipRoot = join(auditRoot, "clips");
const profileRoot = join(auditRoot, "chrome-profile");
const pythonPath = resolve(option("--python", join(process.env.LOCALAPPDATA ?? "", "VerseListener", "benchmark-tools", "Scripts", "python.exe")));
const chromePath = resolve(option("--chrome", "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"));
const extractScript = join(projectRoot, "scripts", "extract-audio-clip.py");
const modelLabels = { base: "Whisper Base", small: "Whisper Small", medium: "Whisper Medium", largeTurbo: "Whisper Large Turbo" };

for (const [name, path] of [["audio", audioPath], ["truth", truthPath], ["Python", pythonPath], ["Chrome", chromePath]]) {
  if (!path || !existsSync(path)) throw new Error(`Missing ${name} path: ${path || "not supplied"}`);
}
if (!outputPath) throw new Error("Pass --output <report.json>.");
if (!Number.isFinite(windowSeconds) || windowSeconds < 1) {
  throw new Error("--window-seconds must be a number of at least 1.");
}

const truth = JSON.parse(await readFile(truthPath, "utf8"));
const selectedWindows = onlyWindow
  ? truth.windows.filter((window) => window.id === onlyWindow)
  : truth.windows;
if (!selectedWindows.length) throw new Error(`Unknown audit window: ${onlyWindow}`);
await mkdir(clipRoot, { recursive: true });
await mkdir(profileRoot, { recursive: true });
await mkdir(dirname(outputPath), { recursive: true });

function clipName(id) {
  return `${String(id).replace(/[^a-z0-9-]/giu, "-")}.wav`;
}

for (const window of selectedWindows) {
  const destination = join(clipRoot, clipName(window.id));
  if (existsSync(destination) && statSync(destination).size > 32_000) continue;
  const duration = Math.max(1, Number(window.end) - Number(window.start));
  console.log(`Extracting ${window.id} (${duration}s)…`);
  const result = spawnSync(pythonPath, [extractScript, audioPath, destination, String(window.start), String(duration)], {
    cwd: projectRoot,
    encoding: "utf8",
  });
  if (result.status !== 0) throw new Error(result.stderr || `Audio extraction failed for ${window.id}.`);
}

const config = {
  ...truth,
  model,
  modelLabel: modelLabels[model] ?? model,
  windowSeconds,
  windows: selectedWindows.map((window) => ({
    ...window,
    audioUrl: `/audit-audio/${encodeURIComponent(clipName(window.id))}`,
  })),
};
const host = "127.0.0.1";
const localUrl = `http://${host}:${port}/`;
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".wav": "audio/wav",
};
const page = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Automated Verse Listener Replay</title><style>body{margin:0;background:#eef3f8;color:#172033;font:16px system-ui;min-height:100vh;display:grid;place-items:center}.card{width:min(560px,calc(100% - 40px));padding:28px;border-radius:24px;background:#ffffffcc;box-shadow:0 18px 60px #33415522}.tag{color:#5b5bd6;font-weight:700}h1{font-size:24px}progress{width:100%;height:12px}</style><main class="card"><div class="tag">AUTOMATED TESTING — DO NOT TOUCH</div><h1>Production-cadence sermon replay</h1><p id="status">Preparing the local model…</p><progress id="progress" value="0" max="1"></progress><p id="detail">Loading audit configuration.</p></main><script type="module" src="/scripts/production-replay-client.js"></script></html>`;

function readJson(request, limit = 50 * 1024 * 1024) {
  return new Promise((resolvePromise, reject) => {
    let size = 0;
    const chunks = [];
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("Audit payload exceeded its limit."));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      try { resolvePromise(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
      catch (error) { reject(error); }
    });
    request.on("error", reject);
  });
}

function staticPath(pathname) {
  const candidate = resolve(projectRoot, pathname.replace(/^\/+/, ""));
  return candidate.startsWith(`${projectRoot}${sep}`) ? candidate : null;
}

let chrome = null;
let finished = false;
const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", localUrl);
  try {
    if (request.method === "GET" && url.pathname === "/") {
      response.writeHead(200, { "Cache-Control": "no-store", "Content-Type": "text/html; charset=utf-8" }).end(page);
      return;
    }
    if (request.method === "GET" && url.pathname === "/audit-config.json") {
      response.writeHead(200, { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" }).end(JSON.stringify(config));
      return;
    }
    if (request.method === "POST" && url.pathname === "/audit-status") {
      const status = await readJson(request, 128_000);
      console.log(`Replay ${status.processedPulls}/${status.totalPulls} · ${status.windowId} · ${Math.floor(status.audioSeconds)}s · ${status.device}`);
      response.writeHead(204).end();
      return;
    }
    if (request.method === "POST" && url.pathname === "/audit-result") {
      const result = await readJson(request);
      await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
      finished = true;
      response.writeHead(204).end();
      console.log(result.ok ? `Replay complete: ${outputPath}` : `Replay failed: ${result.error}`);
      setTimeout(() => server.close(), 250);
      return;
    }
    let filePath = null;
    if (request.method === "GET" && url.pathname.startsWith("/audit-audio/")) {
      filePath = resolve(clipRoot, decodeURIComponent(url.pathname.slice("/audit-audio/".length)));
      if (!filePath.startsWith(`${clipRoot}${sep}`)) filePath = null;
    } else if (request.method === "GET") filePath = staticPath(url.pathname);
    if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
      response.writeHead(404).end("Not found");
      return;
    }
    const stats = statSync(filePath);
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Length": stats.size,
      "Content-Type": mimeTypes[extname(filePath).toLowerCase()] ?? "application/octet-stream",
    });
    createReadStream(filePath).pipe(response);
  } catch (error) {
    response.writeHead(500).end("Audit server error");
    console.error(error);
  }
});

server.listen(port, host, () => {
  console.log(`Production replay ready at ${localUrl}`);
  const flags = [
    `--user-data-dir=${profileRoot}`,
    "--autoplay-policy=no-user-gesture-required",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--enable-unsafe-webgpu",
    "--mute-audio",
    ...(visible ? [] : ["--headless=new"]),
    localUrl,
  ];
  chrome = spawn(chromePath, flags, { stdio: "ignore", windowsHide: !visible });
});

server.on("close", () => {
  if (!chrome?.killed) chrome?.kill();
  process.exit(finished ? 0 : 1);
});
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close());
}
