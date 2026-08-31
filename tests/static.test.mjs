import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const [
  html, app, styles, manifestText, worker, sourceContext, server, packageText,
  feedbackUi, feedbackApi, micTest, micMeter, micRecording, serviceTranscriber,
  selectControl, uiShell, listenerPreferences, transcriptProgress, whisperSession, whisperWorker,
  whisperModels, schema, validation, database, feedbackFunction,
] = await Promise.all([
  "index.html", "app.js", "styles.css", "manifest.webmanifest", "service-worker.js",
  "source-context.js", "scripts/start-local-server.mjs", "package.json", "feedback-ui.js",
  "feedback-api.js", "mic-test.js", "mic-level-meter.js", "mic-recording.js",
  "service-transcriber.js", "select-control.js", "ui-shell.js", "listener-preferences.js", "transcript-progress.js",
  "whisper-session.js", "whisper-worker.js", "whisper-models.js", "supabase/schema.sql",
  "supabase/functions/verse-feedback/validation.ts", "supabase/functions/verse-feedback/database.ts",
  "supabase/functions/verse-feedback/index.ts",
].map(read));

assert.match(html, /class="app" id="app"/);
assert.match(html, /id="heroMic"/);
assert.match(html, /Start listening/);
assert.match(html, /Peek at live transcript/);
assert.match(html, /data-sheet="transcript"/);
assert.match(html, /id="reportTranscriptButton"/);
assert.match(app, /reportTranscriptButton\.addEventListener/);
assert.match(html, /data-sheet="transcriber"/);
assert.match(html, /data-sheet="mic"/);
assert.match(html, /Report feedback/);
assert.match(html, /Русский/);
assert.match(html, /English/);
assert.match(html, /Whisper Base/);
assert.match(html, /Whisper Small/);
assert.match(html, /Whisper Medium/);
assert.match(html, /Whisper Large Turbo/);
assert.doesNotMatch(html, /Browser speech service|Whisper Tiny/);
assert.match(html, /Live · Every 1 second/);
assert.match(html, /data-pref="pace"/);
assert.doesNotMatch(html, /Download model|Downloaded on this device|Not downloaded yet/);
assert.match(html, /id="bibleVersion"/);
assert.match(listenerPreferences, /NASB · Default/);
assert.match(listenerPreferences, /NKJV/);
assert.match(listenerPreferences, /ESV/);
assert.match(listenerPreferences, /NIV/);
assert.match(html, /📭 Verse missed/);
assert.match(html, /⏱️ Detected too late/);
assert.match(html, /🗣️ Misinterpreted speech/);
assert.match(html, /📖 Wrong verse/);
assert.match(html, /Last 15 seconds/);
assert.match(html, /Last 60 seconds/);
assert.doesNotMatch(html, /Last 5 seconds/);
assert.doesNotMatch(html, /YouTube|Four-model|benchmark|Load Aug 16|Choose from our channel/iu);
assert.doesNotMatch(html, /What was said|What did the app catch|Add a correction/);
assert.match(html, /Recent transcript/);
assert.match(html, /Recent audio/);
assert.match(html, /Recorded microphone test playback/);
assert.match(html, /Download current source context/);
assert.match(html, /app\.js\?v=26/);

assert.match(app, /parser\.js\?v=26/);
assert.match(app, /configureServiceTranscriber/);
assert.doesNotMatch(app, /configureTranscriptLab|youtube|benchmark/iu);
assert.match(app, /new WhisperSession/);
assert.match(app, /intervalMs: Number\(elements\.recognitionPace\.value\)/);
assert.match(app, /whisperSessionGeneration/);
assert.match(app, /detail\.phase === "transcribing"/);
assert.match(app, /configureFeedbackUI/);
assert.match(app, /configureMicTest/);
assert.match(app, /schemaVersion: 2/);
assert.match(app, /timing/);
assert.match(app, /request\("screen"\)/);
assert.match(app, /navigator\.vibrate/);

assert.match(serviceTranscriber, /interpretTranscript/);
assert.match(serviceTranscriber, /initialLanguage/);
assert.match(serviceTranscriber, /onReport/);
assert.doesNotMatch(serviceTranscriber, /YouTube|benchmark/iu);
assert.match(selectControl, /data-select-for/);
assert.match(selectControl, /aria-selected/);
assert.match(uiShell, /openPopover/);
assert.match(uiShell, /openSheet/);
assert.match(transcriptProgress, /activeRunId === detail\.runId/);

assert.match(styles, /width:min\(100%,468px\)/);
assert.match(styles, /@keyframes quietRing/);
assert.match(styles, /@keyframes verseDetectedIn/);
assert.match(styles, /@keyframes transcriptSlideIn/);
assert.match(styles, /\.app\.model-loading \.mic/);
assert.match(styles, /html\[data-theme="dark"\] \.select-trigger/);
assert.match(styles, /\.loading-wave i/);
assert.match(styles, /background:rgba\(86,119,200,\.19\)/);

assert.match(feedbackUi, /Saved privately — will retry when connected/);
assert.match(feedbackUi, /elements\.feedbackTiming\.value/);
assert.match(feedbackUi, /elements\.feedbackSheetHost\.append/);
assert.match(feedbackApi, /functions\/v1\/verse-feedback/);
assert.match(micTest, /getUserMedia/);
assert.match(micTest, /beforeStart/);
assert.match(micMeter, /getFloatTimeDomainData/);
assert.match(micMeter, /visibilitychange/);
assert.match(micRecording, /MediaRecorderClass/);
assert.match(micRecording, /createObjectURL/);

assert.match(whisperSession, /whisper-worker\.js\?v=26/);
assert.match(whisperWorker, /@huggingface\/transformers@3\.8\.1/);
assert.match(whisperWorker, /max_new_tokens:\s*64/);
assert.match(whisperWorker, /no_repeat_ngram_size:\s*3/);
assert.doesNotMatch(whisperWorker, /WhisperTextStreamer|type: "partial"/);
assert.match(whisperModels, /Xenova\/whisper-base/);
assert.match(whisperModels, /Xenova\/whisper-small/);
assert.match(whisperModels, /Xenova\/whisper-medium/);
assert.match(whisperModels, /onnx-community\/whisper-large-v3-turbo/);
assert.doesNotMatch(whisperModels, /whisper-tiny/);

assert.doesNotMatch(sourceContext, /youtube|benchmark|transcript-lab/iu);
assert.match(sourceContext, /service-transcriber\.js/);
assert.match(sourceContext, /ui-shell\.js/);
assert.match(sourceContext, /select-control\.js/);
assert.match(sourceContext, /design\/reference\/quiet-focus-glass-approved\.html/);
assert.match(sourceContext, /design\/reference\/quiet-focus-glass-approved\.html/);
assert.doesNotMatch(worker, /youtube|benchmark|transcript-lab/iu);
assert.match(worker, /verse-listener-v26/);
assert.match(worker, /service-transcriber\.js\?v=26/);
assert.match(worker, /styles\.css\?v=26/);
assert.match(worker, /key\.startsWith\(APP_CACHE_PREFIX\)/);
assert.match(worker, /url\.origin !== self\.location\.origin/);
assert.doesNotMatch(server, /youtube|\/api\//iu);

assert.match(schema, /'late'/);
assert.match(schema, /'misinterpreted'/);
assert.match(schema, /timing text not null/);
assert.match(validation, /value\.slice\(0, 120\)/);
assert.match(validation, /'5-plus'/);
assert.match(database, /timing: string/);
assert.match(feedbackFunction, /timing: metadata\.timing/);

const manifest = JSON.parse(manifestText);
assert.equal(manifest.display, "standalone");
assert.equal(manifest.start_url, "./?v=26");
const packageJson = JSON.parse(packageText);
assert.equal(packageJson.version, "3.0.0");
assert.doesNotMatch(packageJson.scripts.test, /youtube|benchmark|transcript-review|transcript-timeline/iu);
assert.equal(packageJson.scripts.start, "node scripts/start-local-server.mjs");

await Promise.all(["russyn.json", "engwebp.json"].map((file) => access(fileURLToPath(new URL(`data/${file}`, root)))));
console.log("Web contract: approved glass UI, bilingual detection, local Whisper, private feedback, mic testing, and PWA delivery present");
