import { formatModelBytes, WhisperDownloadProgress } from "./whisper-download-progress.js?v=26";
import { RECOGNITION_MODELS } from "./whisper-models.js?v=26";

export { RECOGNITION_MODELS };

export function normalizeRecognitionModel(model) {
  return Object.hasOwn(RECOGNITION_MODELS, model) ? model : "small";
}

export function getWhisperRuntimeProfile(runtime = {}) {
  const userAgent = runtime.userAgent ?? globalThis.navigator?.userAgent ?? "";
  const platform = runtime.platform ?? globalThis.navigator?.platform ?? "";
  const maxTouchPoints = runtime.maxTouchPoints ?? globalThis.navigator?.maxTouchPoints ?? 0;
  const hasWebGPU = runtime.hasWebGPU ?? Boolean(globalThis.navigator?.gpu);
  const isAppleMobile = /iPad|iPhone|iPod/i.test(userAgent)
    || (/Mac/i.test(platform) && maxTouchPoints > 1);
  return {
    isAppleMobile,
    recommendedModel: "small",
    device: isAppleMobile || !hasWebGPU ? "wasm" : "webgpu",
  };
}

export function resampleTo16Khz(samples, sourceRate) {
  if (!samples.length || !sourceRate) return new Float32Array();
  if (sourceRate === 16_000) return samples;
  const ratio = sourceRate / 16_000;
  const output = new Float32Array(Math.max(1, Math.floor(samples.length / ratio)));
  for (let index = 0; index < output.length; index += 1) {
    const position = index * ratio;
    const left = Math.floor(position);
    const right = Math.min(samples.length - 1, left + 1);
    const fraction = position - left;
    output[index] = samples[left] * (1 - fraction) + samples[right] * fraction;
  }
  return output;
}

export function novelTranscript(previous, current) {
  const earlier = previous.trim().split(/\s+/).filter(Boolean);
  const next = current.trim().split(/\s+/).filter(Boolean);
  let overlap = Math.min(earlier.length, next.length, 16);
  const normalize = (word) => word.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  const editDistance = (left, right) => {
    const row = Array.from({ length: right.length + 1 }, (_, index) => index);
    for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
      let diagonal = row[0];
      row[0] = leftIndex;
      for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
        const above = row[rightIndex];
        row[rightIndex] = Math.min(
          row[rightIndex] + 1,
          row[rightIndex - 1] + 1,
          diagonal + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
        );
        diagonal = above;
      }
    }
    return row[right.length];
  };
  while (overlap > 0) {
    const left = earlier.slice(-overlap).map(normalize);
    const right = next.slice(0, overlap).map(normalize);
    const exact = left.join(" ") === right.join(" ");
    const close = overlap >= 4 && editDistance(left, right) <= Math.max(1, Math.floor(overlap / 5));
    if (left.some(Boolean) && (exact || close)) break;
    overlap -= 1;
  }
  return next.slice(overlap).join(" ").trim();
}

export class WhisperSession {
  constructor({
    buffer,
    model = "small",
    language = "ru",
    onText,
    onStatus,
    loadOnly = false,
    intervalMs = 1_000,
    windowSeconds = model === "base" ? 3.5 : 4.5,
    minimumAudioSeconds = 1,
    heartbeatMs = 250,
    maxDutyCycle = 1,
    now = () => globalThis.performance?.now?.() ?? Date.now(),
  }) {
    this.buffer = buffer;
    this.model = model;
    this.language = language;
    this.onText = onText;
    this.onStatus = onStatus;
    this.loadOnly = loadOnly;
    this.intervalMs = intervalMs;
    this.windowSeconds = windowSeconds;
    this.minimumAudioSeconds = minimumAudioSeconds;
    this.heartbeatMs = heartbeatMs;
    this.maxDutyCycle = maxDutyCycle;
    this.now = now;
    this.downloadProgress = new WhisperDownloadProgress();
    this.worker = null;
    this.timer = null;
    this.running = false;
    this.busy = false;
    this.ready = false;
    this.failed = false;
    this.previous = "";
    this.requestId = 0;
    this.nextRunAt = 0;
    this.inferenceStartedAt = 0;
    this.lastInferenceMs = 0;
    this.device = "local device";
    this.statusPhase = null;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.ready = false;
    this.failed = false;
    try {
      this.worker = new Worker("./whisper-worker.js?v=26", { type: "module" });
    } catch {
      this.fail(`${RECOGNITION_MODELS[this.model].label} could not start. Reload the app, then retry.`, "worker");
      return;
    }
    this.worker.addEventListener("message", (event) => this.handleMessage(event.data));
    this.worker.addEventListener("error", () => {
      this.fail(`${RECOGNITION_MODELS[this.model].label} could not start. Check the connection, reload, and retry.`, "worker");
    });
    this.worker.postMessage({ type: "load", model: this.model });
    const profile = getWhisperRuntimeProfile();
    const deviceNote = profile.isAppleMobile ? " for iPhone" : "";
    this.onStatus?.(`Checking ${RECOGNITION_MODELS[this.model].label}${deviceNote}…`, "working", {
      phase: "checking",
      indeterminate: true,
    });
    if (!this.loadOnly) this.timer = window.setInterval(() => this.tick(), this.heartbeatMs);
  }

  tick() {
    if (!this.running || !this.ready || this.busy) return;
    const available = this.buffer.availableSeconds;
    if (available < this.minimumAudioSeconds) {
      if (this.statusPhase !== "buffering") this.onStatus?.("", "ready", { phase: "buffering" });
      this.statusPhase = "buffering";
      return;
    }
    const remainingMs = Math.max(0, this.nextRunAt - this.now());
    if (remainingMs <= 0) {
      this.transcribe();
      return;
    }
    if (this.statusPhase !== "idle") this.onStatus?.("", "ready", { phase: "idle" });
    this.statusPhase = "idle";
  }

  transcribe() {
    if (!this.running || !this.ready || this.busy || this.buffer.availableSeconds < this.minimumAudioSeconds) return;
    const audio = resampleTo16Khz(this.buffer.takeLast(this.windowSeconds), this.buffer.sampleRate);
    if (!audio.length) return;
    this.busy = true;
    this.requestId += 1;
    this.inferenceStartedAt = this.now();
    this.nextRunAt = this.inferenceStartedAt + this.intervalMs;
    this.statusPhase = "transcribing";
    this.onStatus?.("", "ready", {
      phase: "transcribing",
      runId: this.requestId,
    });
    this.worker.postMessage({
      type: "transcribe",
      requestId: this.requestId,
      model: this.model,
      language: this.language,
      audio: audio.buffer,
    }, [audio.buffer]);
  }

  handleMessage(message) {
    if (!this.running) return;
    if (message.type === "ready") {
      this.ready = true;
      this.device = message.device ?? this.device;
      if (this.loadOnly) {
        this.running = false;
        this.worker?.terminate();
        this.worker = null;
        this.onStatus?.(`${RECOGNITION_MODELS[this.model].label} is downloaded on this device.`, "downloaded", {
          phase: "downloaded",
        });
        return;
      }
      this.nextRunAt = this.now();
      this.tick();
    } else if (message.type === "load-state") {
      this.onStatus?.(`Checking ${RECOGNITION_MODELS[this.model].label}…`, "working", {
        phase: "checking",
        indeterminate: true,
      });
    } else if (message.type === "download-plan") {
      this.downloadProgress.reset(message.files);
      this.onStatus?.(`Loading ${RECOGNITION_MODELS[this.model].label}…`, "working", {
        phase: "loading",
        indeterminate: true,
      });
    } else if (message.type === "fallback") {
      this.downloadProgress.reset();
      this.onStatus?.(`Graphics startup failed. Switching ${RECOGNITION_MODELS[this.model].label} to CPU…`, "working", {
        phase: "fallback",
        indeterminate: true,
      });
    } else if (message.type === "progress") {
      const load = this.downloadProgress.update(message);
      if (!load) return;
      const label = RECOGNITION_MODELS[this.model].label;
      if (load.phase === "initializing") {
        this.onStatus?.(`Starting ${label}…`, "working", { phase: load.phase, indeterminate: true });
        return;
      }
      const byteDetail = load.totalBytes > 0
        ? ` · ${formatModelBytes(load.loadedBytes)} of ${formatModelBytes(load.totalBytes)}`
        : "";
      this.onStatus?.(`${load.phase === "download" ? "Downloading" : "Loading"} ${label}${byteDetail}`, "working", {
        phase: load.phase,
        progress: load.progress,
        indeterminate: !Number.isFinite(load.progress),
        loadedBytes: load.loadedBytes,
        totalBytes: load.totalBytes,
      });
    } else if (message.type === "result") {
      this.busy = false;
      const completedAt = this.now();
      this.lastInferenceMs = Math.max(0, completedAt - this.inferenceStartedAt);
      const cooldownMs = this.lastInferenceMs * ((1 / this.maxDutyCycle) - 1);
      this.nextRunAt = Math.max(this.nextRunAt, completedAt + cooldownMs);
      const text = novelTranscript(this.previous, message.text ?? "");
      this.previous = message.text ?? "";
      this.statusPhase = "idle";
      this.onStatus?.("", "ready", { phase: "idle", runId: message.requestId });
      if (text) this.onText?.(text);
      this.tick();
    } else if (message.type === "error") {
      this.fail(message.message, message.code ?? "startup");
    }
  }

  fail(message, code) {
    if (this.failed) return;
    this.failed = true;
    this.running = false;
    this.ready = false;
    this.busy = false;
    window.clearInterval(this.timer);
    this.timer = null;
    this.worker?.terminate();
    this.worker = null;
    this.onStatus?.(message, "error", { code });
  }

  stop() {
    this.running = false;
    this.ready = false;
    this.busy = false;
    window.clearInterval(this.timer);
    this.timer = null;
    this.worker?.terminate();
    this.worker = null;
  }
}
