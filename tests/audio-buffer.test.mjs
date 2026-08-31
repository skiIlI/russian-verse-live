import assert from "node:assert/strict";
import { RollingAudioBuffer } from "../audio-ring-buffer.js";

const rolling = new RollingAudioBuffer(60);
rolling.sampleRate = 8;
rolling.push(new Float32Array([-.5, -.25, 0, .25, .5, .75, 1, -.75]));
rolling.push(new Float32Array([.1, .2, .3, .4, .5, .6, .7, .8]));

assert.equal(rolling.availableSeconds, 2);
assert.deepEqual([...rolling.takeLast(1)].map((value) => Number(value.toFixed(2))), [.1, .2, .3, .4, .5, .6, .7, .8]);

const wav = rolling.createWav(1);
assert.ok(wav);
assert.equal(wav.type, "audio/wav");
const bytes = new Uint8Array(await wav.arrayBuffer());
assert.equal(new TextDecoder().decode(bytes.slice(0, 4)), "RIFF");
assert.equal(new TextDecoder().decode(bytes.slice(8, 12)), "WAVE");
assert.equal(bytes.length, 44 + 8 * 2);

const capped = new RollingAudioBuffer(1);
capped.sampleRate = 4;
capped.push(new Float32Array([1, 2, 3, 4, 5, 6]));
assert.equal(capped.totalSamples, 4);
assert.deepEqual([...capped.takeLast(1)], [3, 4, 5, 6]);

let resolvePermission;
const pendingPermission = new Promise((resolve) => { resolvePermission = resolve; });
const originalNavigator = globalThis.navigator;
Object.defineProperty(globalThis, "navigator", {
  configurable: true,
  value: { mediaDevices: { getUserMedia: () => pendingPermission } },
});
const superseded = new RollingAudioBuffer();
const staleStart = superseded.start();
await Promise.resolve();
await Promise.resolve();
await superseded.stop({ keepAudio: false });
let staleTrackStopped = false;
resolvePermission({
  getAudioTracks: () => [{ kind: "audio" }],
  getTracks: () => [{ stop: () => { staleTrackStopped = true; } }],
});
await assert.rejects(staleStart, (error) => error?.name === "AbortError");
assert.equal(staleTrackStopped, true, "a late permission result must not revive a stopped capture");
Object.defineProperty(globalThis, "navigator", { configurable: true, value: originalNavigator });

console.log("Audio buffer: rolling trim, WAV export, and stale-start cancellation passed");
