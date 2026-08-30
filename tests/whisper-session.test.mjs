import assert from "node:assert/strict";
import { getWhisperRuntimeProfile, novelTranscript, resampleTo16Khz, WhisperSession } from "../whisper-session.js";

const source = new Float32Array(48_000).map((_, index) => index / 48_000);
const resampled = resampleTo16Khz(source, 48_000);
assert.equal(resampled.length, 16_000);
assert.ok(resampled[8_000] > 0.49 && resampled[8_000] < 0.51);
assert.equal(novelTranscript("И он обратит сердца отцов", "сердца отцов к детям и сердца детей"), "к детям и сердца детей");
assert.equal(novelTranscript("Matthew chapter five", "Matthew chapter six"), "Matthew chapter six");

assert.deepEqual(
  getWhisperRuntimeProfile({ userAgent: "Mozilla/5.0 (iPhone)", platform: "iPhone", maxTouchPoints: 5, hasWebGPU: false }),
  { isAppleMobile: true, recommendedModel: "tiny", device: "wasm" },
);
assert.deepEqual(
  getWhisperRuntimeProfile({ userAgent: "Chrome", platform: "Win32", maxTouchPoints: 0, hasWebGPU: true }),
  { isAppleMobile: false, recommendedModel: "base", device: "webgpu" },
);

const messages = [];
class FakeWorker {
  addEventListener() {}
  postMessage(message) { messages.push(message); }
  terminate() {}
}
globalThis.Worker = FakeWorker;
globalThis.window = { setInterval: () => 1, clearInterval: () => {} };
const session = new WhisperSession({
  buffer: { availableSeconds: 12, sampleRate: 16_000, takeLast: () => new Float32Array(16_000) },
  model: "tiny",
});
session.start();
session.transcribe();
assert.deepEqual(messages.map((message) => message.type), ["load"], "audio must wait for one completed model load");
session.handleMessage({ type: "ready", device: "wasm" });
assert.deepEqual(messages.map((message) => message.type), ["load", "transcribe"]);
session.stop();

console.log("Whisper session: mobile profile, single-flight startup, resampling, and overlap removal passed.");
