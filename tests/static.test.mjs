import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const [html, app, styles, manifestText, worker, audio, feedback, feedbackUi, sourceContext, excerpts] = await Promise.all([
  read("index.html"),
  read("app.js"),
  read("styles.css"),
  read("manifest.webmanifest"),
  read("service-worker.js"),
  read("audio-ring-buffer.js"),
  read("feedback-store.js"),
  read("feedback-ui.js"),
  read("source-context.js"),
  read("excerpts.js"),
]);

assert.match(html, /Start Listening/);
assert.match(html, /Русский/);
assert.match(html, /English/);
assert.match(html, /Report a missed or wrong verse/);
assert.match(html, /Last 15 seconds/);
assert.match(html, /Last 60 seconds/);
assert.match(html, /Download current source context/);
assert.doesNotMatch(html, /Download app files|russian-verse-live\.zip|Automation Core/);
assert.match(html, /app\.js\?v=4/);
assert.match(html, /aria-label="Live speech transcript"/);
assert.match(app, /parser\.js\?v=4/);
assert.match(app, /ru-RU/);
assert.match(app, /en-US/);
assert.match(app, /recognition\.continuous = true/);
assert.match(app, /interimTranscript = liveLines/);
assert.match(app, /navigator\.vibrate/);
assert.match(app, /request\("screen"\)/);
assert.match(app, /configureFeedbackUI/);
assert.match(audio, /getUserMedia/);
assert.match(audio, /createWav/);
assert.match(audio, /maxSeconds = 60/);
assert.match(feedback, /indexedDB\.open/);
assert.match(feedback, /base64DataUrl/);
assert.match(feedback, /issues\/new/);
assert.match(feedbackUi, /configureFeedbackUI/);
assert.match(feedbackUi, /githubIssueUrl/);
assert.match(sourceContext, /raw\.githubusercontent\.com/);
assert.match(sourceContext, /verse-listener-source-context\.txt/);
assert.match(sourceContext, /tests\/audio-buffer\.test\.mjs/);
assert.match(excerpts, /english-second-timothy-range/);
assert.match(styles, /--blue: #3b82f6/);
assert.match(styles, /--rose: #e11d48/);

const manifest = JSON.parse(manifestText);
assert.equal(manifest.display, "standalone");
assert.equal(manifest.start_url, "./?v=4");
assert.match(worker, /verse-listener-v4/);
assert.match(worker, /audio-worklet\.js\?v=4/);
assert.match(worker, /feedback-ui\.js\?v=4/);
assert.match(worker, /fetch\(event\.request\)/);

const audioFiles = [
  "malachi-4-5-6.wav",
  "first-corinthians-16-14.wav",
  "mark-10-13.wav",
  "genesis-18-19.wav",
  "luke-12-13.wav",
];
const assetsPath = fileURLToPath(new URL("assets/", root));
await Promise.all(audioFiles.map((file) => access(join(assetsPath, file))));

console.log("Web contract: bilingual PWA, rolling feedback, GitHub inbox, and current source export present");
