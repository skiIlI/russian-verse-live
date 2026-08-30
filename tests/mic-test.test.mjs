import assert from "node:assert/strict";
import { inputLevelFromSamples } from "../mic-level-meter.js";
import { formatRecordingDuration, selectRecordingMimeType } from "../mic-recording.js";
import { configureMicTest, microphoneErrorMessage } from "../mic-test.js";

const ELEMENT_IDS = [
  "micTestSection", "micTestFolderButton", "micTestContent", "micTestSummary", "micTestStatus",
  "startMicButton", "stopMicButton", "monitorMicButton", "recordMicButton", "stopRecordingButton",
  "micRecordingResult", "micRecordingMeta", "micRecordingPlayback", "discardRecordingButton",
  "micLevelMeter", "micLevelText", "liveMonitorAudio",
];

class FakeClassList {
  values = new Set();
  toggle(name, force) {
    const active = force ?? !this.values.has(name);
    if (active) this.values.add(name);
    else this.values.delete(name);
    return active;
  }
  contains(name) { return this.values.has(name); }
}

class FakeElement extends EventTarget {
  constructor() {
    super();
    this.attributes = new Map();
    this.classList = new FakeClassList();
    this.dataset = {};
    this.children = [];
    this.disabled = false;
    this.hidden = false;
    this.textContent = "";
    this.title = "";
    this.src = "";
    this.srcObject = null;
    this.muted = false;
    this.volume = 1;
    this.playCount = 0;
    this.pauseCount = 0;
    this.loadCount = 0;
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  removeAttribute(name) {
    this.attributes.delete(name);
    if (name === "src") this.src = "";
  }
  async play() { this.playCount += 1; }
  pause() { this.pauseCount += 1; }
  load() { this.loadCount += 1; }
}

class FakeTrack extends EventTarget {
  constructor() {
    super();
    this.contentHint = "";
    this.stopped = false;
  }
  stop() { this.stopped = true; }
}

class FakeMediaRecorder extends EventTarget {
  static instances = [];
  static isTypeSupported(type) { return type === "audio/webm;codecs=opus"; }
  constructor(stream, options = {}) {
    super();
    this.stream = stream;
    this.mimeType = options.mimeType ?? "audio/webm";
    this.state = "inactive";
    FakeMediaRecorder.instances.push(this);
  }
  start(timeslice) {
    this.timeslice = timeslice;
    this.state = "recording";
  }
  stop() {
    const dataEvent = new Event("dataavailable");
    Object.defineProperty(dataEvent, "data", { value: new Blob([new Uint8Array([1, 2, 3])], { type: this.mimeType }) });
    this.dispatchEvent(dataEvent);
    this.state = "inactive";
    this.dispatchEvent(new Event("stop"));
  }
}

function createElements() {
  const elements = Object.fromEntries(ELEMENT_IDS.map((id) => [id, new FakeElement()]));
  elements.micTestContent.hidden = true;
  elements.micRecordingResult.hidden = true;
  return elements;
}

assert.equal(inputLevelFromSamples(new Float32Array(16)), 0);
assert.equal(inputLevelFromSamples(new Float32Array(16).fill(1)), 1);
assert.ok(inputLevelFromSamples(new Float32Array(16).fill(0.01)) > 0);
assert.equal(selectRecordingMimeType(FakeMediaRecorder), "audio/webm;codecs=opus");
assert.equal(formatRecordingDuration(0), "0:00");
assert.equal(formatRecordingDuration(2_500), "0:03");
assert.equal(formatRecordingDuration(62_000), "1:02");
assert.equal(microphoneErrorMessage({ name: "NotAllowedError" }), "Microphone permission was not granted.");
assert.equal(microphoneErrorMessage({ name: "NotFoundError" }), "No microphone was found on this device.");

const elements = createElements();
const streams = [];
const requestedConstraints = [];
const mediaDevices = {
  async getUserMedia(constraints) {
    requestedConstraints.push(constraints);
    const track = new FakeTrack();
    const stream = { track, getAudioTracks: () => [track], getTracks: () => [track] };
    streams.push(stream);
    return stream;
  },
};
const meter = {
  starts: 0,
  stops: 0,
  async start(stream) { this.starts += 1; this.stream = stream; return true; },
  async stop() { this.stops += 1; },
};
const createdUrls = [];
const revokedUrls = [];
const urlApi = {
  createObjectURL(blob) { createdUrls.push(blob); return `blob:test-${createdUrls.length}`; },
  revokeObjectURL(url) { revokedUrls.push(url); },
};
let clock = 1_000;
let beforeStartCount = 0;
const root = { querySelector: (selector) => elements[selector.slice(1)] ?? null };
const micTest = configureMicTest({
  root,
  mediaDevices,
  MediaRecorderClass: FakeMediaRecorder,
  urlApi,
  now: () => clock,
  isSecureContext: true,
  createMeter: () => meter,
  beforeStart: async () => { beforeStartCount += 1; },
});

assert.deepEqual(micTest.getState(), { active: false, monitoring: false, recording: false, hasRecording: false });
elements.micTestFolderButton.dispatchEvent(new Event("click"));
assert.equal(elements.micTestContent.hidden, false);
assert.equal(elements.micTestFolderButton.getAttribute("aria-expanded"), "true");

assert.equal(await micTest.startInput(), true);
assert.equal(beforeStartCount, 1);
assert.equal(meter.starts, 1);
assert.equal(streams[0].track.contentHint, "speech");
assert.equal(requestedConstraints[0].video, false);
assert.equal(requestedConstraints[0].audio.echoCancellation, true);
assert.equal(elements.micTestSummary.textContent, "Mic on");

assert.equal(await micTest.toggleMonitor(), true);
assert.equal(elements.liveMonitorAudio.srcObject, streams[0]);
assert.equal(elements.monitorMicButton.getAttribute("aria-pressed"), "true");
assert.equal(elements.micTestSummary.textContent, "Monitoring");

assert.equal(await micTest.startRecording(), true);
assert.equal(FakeMediaRecorder.instances.at(-1).timeslice, 1_000);
assert.equal(elements.stopMicButton.disabled, true);
assert.equal(elements.stopRecordingButton.disabled, false);
assert.equal(elements.micTestSummary.textContent, "Recording");

clock = 3_500;
assert.equal(await micTest.stopRecording(), true);
assert.equal(createdUrls.length, 1);
assert.equal(elements.micRecordingResult.hidden, false);
assert.equal(elements.micRecordingPlayback.src, "blob:test-1");
assert.equal(elements.micRecordingMeta.textContent, "Test recording · 0:03");
assert.deepEqual(micTest.getState(), { active: true, monitoring: true, recording: false, hasRecording: true });

await micTest.stopInput();
assert.equal(streams[0].track.stopped, true);
assert.equal(elements.liveMonitorAudio.srcObject, null);
assert.equal(meter.stops, 1);
assert.deepEqual(micTest.getState(), { active: false, monitoring: false, recording: false, hasRecording: true });

micTest.clearRecording();
assert.deepEqual(revokedUrls, ["blob:test-1"]);
assert.equal(elements.micRecordingResult.hidden, true);
assert.equal(micTest.getState().hasRecording, false);

assert.equal(await micTest.startRecording(), true);
assert.equal(beforeStartCount, 2);
assert.equal(micTest.getState().recording, true);
streams[1].track.dispatchEvent(new Event("ended"));
await new Promise((resolve) => setTimeout(resolve, 0));
assert.equal(micTest.getState().active, false);
assert.equal(micTest.getState().recording, false);
assert.equal(micTest.getState().hasRecording, true);
assert.match(elements.micTestStatus.textContent, /microphone disconnected/i);

await micTest.destroy();
const startsBeforeClick = beforeStartCount;
elements.startMicButton.dispatchEvent(new Event("click"));
await new Promise((resolve) => setTimeout(resolve, 0));
assert.equal(beforeStartCount, startsBeforeClick);
assert.equal(revokedUrls.length, 2);

const pendingElements = createElements();
const pendingTrack = new FakeTrack();
const pendingStream = { getAudioTracks: () => [pendingTrack], getTracks: () => [pendingTrack] };
let resolvePendingPermission;
const pendingPermission = new Promise((resolve) => { resolvePendingPermission = resolve; });
const pendingMicTest = configureMicTest({
  root: { querySelector: (selector) => pendingElements[selector.slice(1)] ?? null },
  mediaDevices: { getUserMedia: () => pendingPermission },
  MediaRecorderClass: FakeMediaRecorder,
  urlApi,
  isSecureContext: true,
  createMeter: () => ({ start: async () => true, stop: async () => {} }),
});
const pendingStart = pendingMicTest.startInput();
await Promise.resolve();
await pendingMicTest.stopInput();
resolvePendingPermission(pendingStream);
assert.equal(await pendingStart, false);
assert.equal(pendingTrack.stopped, true);
assert.equal(pendingMicTest.getState().active, false);
await pendingMicTest.destroy();

console.log("Mic test: permission, meter ownership, monitoring, recording, playback, and cleanup passed");
