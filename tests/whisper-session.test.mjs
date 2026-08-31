import assert from "node:assert/strict";
import { getWhisperRuntimeProfile, normalizeRecognitionModel, novelTranscript, RECOGNITION_MODELS, resampleTo16Khz, WhisperSession } from "../whisper-session.js";
import { formatModelBytes, WhisperDownloadProgress } from "../whisper-download-progress.js";
import { getWhisperModelCacheStatus } from "../whisper-models.js";
import { captureTranscriptSnapshot, mergeTranscriptHistory, reportTranscriptWindow, transcriptWindow } from "../transcript-history.js";
import { extractNewQuoteReferences } from "../live-quote-detector.js";
import { configureTranscriptProgress } from "../transcript-progress.js";

const source = new Float32Array(48_000).map((_, index) => index / 48_000);
const resampled = resampleTo16Khz(source, 48_000);
assert.equal(resampled.length, 16_000);
assert.ok(resampled[8_000] > 0.49 && resampled[8_000] < 0.51);
assert.equal(novelTranscript("И он обратит сердца отцов", "сердца отцов к детям и сердца детей"), "к детям и сердца детей");
assert.equal(novelTranscript("Matthew chapter five", "Matthew chapter six"), "Matthew chapter six");
assert.equal(
  novelTranscript("Я буду прочитать от Матфея", "Я буду прочитать из Матфея тридцать пять четыре"),
  "тридцать пять четыре",
  "one revised overlap word must not duplicate the preceding transcript line",
);

const historyNow = Date.parse("2026-08-31T00:01:10.000Z");
const mergedHistory = mergeTranscriptHistory([
  { text: "old", at: "2026-08-31T00:00:00.000Z" },
  { text: "kept", at: "2026-08-31T00:00:10.000Z" },
], ["new"], new Date(historyNow).toISOString());
assert.deepEqual(mergedHistory.map(({ text }) => text), ["new", "kept"]);
assert.deepEqual(transcriptWindow(mergedHistory, 45, historyNow).map(({ text }) => text), ["new"]);
assert.equal(mergeTranscriptHistory(mergedHistory, ["new"], new Date(historyNow).toISOString()).length, 2);
const stoppedSnapshot = captureTranscriptSnapshot(mergedHistory, "live", {}, null, historyNow);
assert.deepEqual(
  reportTranscriptWindow([], "", stoppedSnapshot, 65, historyNow + 120_000).map(({ text }) => text),
  ["live", "new", "kept"],
  "opening a report must freeze the stopped transcript window until submission",
);
assert.deepEqual(
  reportTranscriptWindow([{ text: "after open", at: "2026-08-31T00:01:12.000Z" }], "still live", stoppedSnapshot, 15, historyNow + 2_000).map(({ text }) => text),
  ["still live", "after open", "live", "new", "kept"],
  "an active report must retain transcript lines finalized while its dialog is open",
);

const seenQuotes = new Set(["Joel 2:16"]);
const newQuotes = extractNewQuoteReferences({ events: [
  { basis: "explicit-reference", reference: { canonical: "Luke 1:1" } },
  { basis: "verse-text-match", reference: { canonical: "Joel 2:16", display: "Иоиль 2:16" } },
  { basis: "verse-text-match", reference: { canonical: "Amos 3:3", display: "Амос 3:3" }, sourceText: "quoted", confidence: 0.85 },
] }, seenQuotes);
assert.deepEqual(newQuotes, [{ canonical: "Amos 3:3", display: "Амос 3:3", sourceText: "quoted", confidence: 0.85 }]);
assert.deepEqual(
  extractNewQuoteReferences({ events: [{ basis: "reading-boundary", reference: { canonical: "Amos 3:4", display: "Амос 3:4" }, sourceText: "verse ending", confidence: 0.96 }] }, seenQuotes),
  [{ canonical: "Amos 3:4", display: "Амос 3:4", sourceText: "verse ending", confidence: 0.96 }],
  "proactive reading boundaries must reach the live listener",
);

const progressAttributes = new Set();
let progressStarts = 0;
const progressFill = { getBoundingClientRect: () => { progressStarts += 1; return {}; } };
const progressElement = {
  querySelector: () => progressFill,
  setAttribute: (name) => progressAttributes.add(name),
  removeAttribute: (name) => progressAttributes.delete(name),
};
const progressContainer = { hidden: true };
const transcriptProgress = configureTranscriptProgress(progressContainer, progressElement);
transcriptProgress.update({ phase: "transcribing", runId: 1 });
transcriptProgress.update({ phase: "transcribing", runId: 1 });
assert.equal(progressStarts, 1, "the same inference must not restart or duplicate its progress line");
transcriptProgress.update({ phase: "idle", runId: 1 });
assert.equal(progressContainer.hidden, true);
transcriptProgress.update({ phase: "transcribing", runId: 2 });
assert.equal(progressStarts, 2, "the next inference should reuse the single progress line for one new run");

assert.deepEqual(
  getWhisperRuntimeProfile({ userAgent: "Mozilla/5.0 (iPhone)", platform: "iPhone", maxTouchPoints: 5, hasWebGPU: false }),
  { isAppleMobile: true, recommendedModel: "small", device: "wasm" },
);
assert.deepEqual(
  getWhisperRuntimeProfile({ userAgent: "Chrome", platform: "Win32", maxTouchPoints: 0, hasWebGPU: true }),
  { isAppleMobile: false, recommendedModel: "small", device: "webgpu" },
);
assert.deepEqual(Object.keys(RECOGNITION_MODELS), ["base", "small", "medium", "largeTurbo"]);
assert.equal(normalizeRecognitionModel("largeTurbo"), "largeTurbo");
assert.equal(normalizeRecognitionModel("browser"), "small", "removed Browser Speech preferences must migrate to Small");
assert.equal(normalizeRecognitionModel("tiny"), "small", "removed Tiny preferences must migrate to Small");

const modelProgress = new WhisperDownloadProgress([
  { file: "onnx/encoder_model_fp16.onnx", total: 600 },
  { file: "onnx/decoder_model_merged_q4.onnx", total: 400 },
]);
assert.equal(modelProgress.update({ file: "tokenizer.json", status: "progress", loaded: 10, total: 10 }), null);
assert.deepEqual(
  modelProgress.update({ file: "onnx/encoder_model_fp16.onnx", status: "progress", loaded: 300, total: 600 }),
  { phase: "download", progress: 0.3, loadedBytes: 300, totalBytes: 1_000, complete: false },
  "metadata completing must not fill the model progress bar",
);
assert.equal(
  modelProgress.update({ file: "onnx/encoder_model_fp16.onnx", status: "done" }).progress,
  0.6,
  "completed model bytes must be weighted by their real sizes",
);
assert.equal(
  modelProgress.update({ file: "onnx/decoder_model_merged_q4.onnx", status: "done" }).phase,
  "initializing",
);
assert.equal(formatModelBytes(615_033_351), "587 MB");
const cacheRequests = [];
const cacheStatus = await getWhisperModelCacheStatus("medium", "webgpu", {
  match: async (url) => {
    cacheRequests.push(url);
    return url.endsWith("encoder_model_fp16.onnx") || url.endsWith("decoder_model_merged_q4.onnx") ? {} : null;
  },
});
assert.equal(cacheStatus.cached, true);
assert.equal(cacheRequests.length, 2);

const messages = [];
const statuses = [];
const finals = [];
const windows = [];
let intervalDelay = 0;
let currentTime = 0;
let availableSeconds = 0.4;
class FakeWorker {
  addEventListener() {}
  postMessage(message) { messages.push(message); }
  terminate() {}
}
globalThis.Worker = FakeWorker;
globalThis.window = {
  setInterval: (_callback, delay) => { intervalDelay = delay; return 1; },
  clearInterval: () => {},
};
const session = new WhisperSession({
  buffer: {
    get availableSeconds() { return availableSeconds; },
    sampleRate: 16_000,
    takeLast: (seconds) => { windows.push(seconds); return new Float32Array(16_000); },
  },
  model: "small",
  onStatus: (message, tone, detail) => statuses.push({ message, tone, detail }),
  onText: (text) => finals.push(text),
  now: () => currentTime,
});
session.start();
assert.equal(session.maxDutyCycle, 1, "the one-second mode must not add an artificial CPU cooldown");
session.transcribe();
assert.deepEqual(messages.map((message) => message.type), ["load"], "audio must wait for one completed model load");
session.handleMessage({ type: "ready", device: "wasm" });
assert.equal(intervalDelay, 250, "lightweight status heartbeat should not control inference cadence");
assert.equal(statuses.at(-1).detail.phase, "buffering");
availableSeconds = 4;
session.tick();
assert.deepEqual(messages.map((message) => message.type), ["load", "transcribe"]);
assert.equal(windows[0], 4.5, "one-second cadence should use the bounded low-latency context window");
assert.equal(statuses.at(-1).detail.phase, "transcribing");
currentTime = 600;
session.handleMessage({ type: "result", requestId: 1, text: "И он" });
assert.deepEqual(finals, ["И он"]);
assert.equal(statuses.at(-1).detail.phase, "idle");
assert.equal(statuses.filter(({ detail }) => detail?.phase === "transcribing").length, 1, "each inference should create one progress row state");
currentTime = 999;
session.tick();
assert.equal(messages.length, 2, "a new inference must not start before the one-second cadence");
assert.equal(statuses.filter(({ detail }) => detail?.phase === "idle").length, 1, "heartbeat ticks must not spam progress states");
currentTime = 1_000;
session.tick();
assert.deepEqual(messages.map((message) => message.type), ["load", "transcribe", "transcribe"]);
session.tick();
assert.equal(messages.length, 3, "Whisper inference must stay single-flight");
currentTime = 2_600;
session.handleMessage({ type: "result", requestId: 2, text: "Он говорил" });
assert.equal(messages.length, 4, "a slow inference must start the next run immediately without extra cooldown");
const finalsBeforeStop = [...finals];
session.stop();
session.handleMessage({ type: "result", requestId: 3, text: "stale result" });
assert.deepEqual(finals, finalsBeforeStop, "a stopped worker must not publish a late transcript");

const baseWindows = [];
const baseSession = new WhisperSession({
  buffer: {
    get availableSeconds() { return 4; },
    sampleRate: 16_000,
    takeLast: (seconds) => { baseWindows.push(seconds); return new Float32Array(16_000); },
  },
  model: "base",
  now: () => currentTime,
});
baseSession.start();
baseSession.handleMessage({ type: "ready", device: "webgpu" });
baseSession.tick();
assert.equal(baseWindows[0], 3.5, "Base should use the measured low-latency window");
baseSession.stop();

const restartedMessages = [];
class RestartWorker {
  addEventListener() {}
  postMessage(message) { restartedMessages.push(message); }
  terminate() {}
}
globalThis.Worker = RestartWorker;
const restartedFinals = [];
const restarted = new WhisperSession({
  buffer: {
    get availableSeconds() { return 4; },
    sampleRate: 16_000,
    takeLast: () => new Float32Array(16_000),
  },
  model: "medium",
  language: "en",
  intervalMs: 1_500,
  onText: (text) => restartedFinals.push(text),
  now: () => currentTime,
});
restarted.start();
restarted.handleMessage({ type: "ready", device: "webgpu" });
assert.equal(restartedMessages[0].model, "medium");
assert.equal(restartedMessages[1].language, "en");
currentTime += 200;
restarted.handleMessage({ type: "result", requestId: 1, text: "Matthew seven" });
assert.deepEqual(restartedFinals, ["Matthew seven"], "a model and refresh-rate change must produce text after restart");
currentTime += 1_299;
restarted.tick();
assert.equal(restartedMessages.length, 2, "the restarted session must honor its new refresh rate");
currentTime += 1;
restarted.tick();
assert.equal(restartedMessages.length, 3);
restarted.stop();

console.log("Whisper session: cadence, restart reconfiguration, simple phases, retained reports, and overlap removal passed.");
