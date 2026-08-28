import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const [html, app, styles, manifest, worker] = await Promise.all([
  read("index.html"),
  read("app.js"),
  read("styles.css"),
  read("manifest.webmanifest"),
  read("service-worker.js"),
]);

assert.match(html, /Start Listening/);
assert.match(html, /Test excerpts/);
assert.match(html, /Download app files/);
assert.match(app, /recognition\.lang = "ru-RU"/);
assert.match(app, /recognition\.continuous = true/);
assert.match(app, /navigator\.vibrate/);
assert.match(app, /request\("screen"\)/);
assert.match(styles, /--blue: #3b82f6/);
assert.match(styles, /--rose: #e11d48/);
assert.equal(JSON.parse(manifest).display, "standalone");
assert.match(worker, /assets\/luke-12-13\.wav/);

const audioFiles = [
  "malachi-4-5-6.wav",
  "first-corinthians-16-14.wav",
  "mark-10-13.wav",
  "genesis-18-19.wav",
  "luke-12-13.wav",
];
const assetsPath = fileURLToPath(new URL("assets/", root));
await Promise.all(audioFiles.map((file) => access(join(assetsPath, file))));

console.log("Web contract: installable shell, microphone, haptic, and five excerpts present");
