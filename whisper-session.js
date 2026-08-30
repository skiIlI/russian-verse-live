export const RECOGNITION_MODELS = {
  browser: { label: "Browser speech service", local: false },
  tiny: { label: "Whisper Tiny", local: true },
  base: { label: "Whisper Base", local: true },
  small: { label: "Whisper Small", local: true },
};

export function getWhisperRuntimeProfile(runtime = {}) {
  const userAgent = runtime.userAgent ?? globalThis.navigator?.userAgent ?? "";
  const platform = runtime.platform ?? globalThis.navigator?.platform ?? "";
  const maxTouchPoints = runtime.maxTouchPoints ?? globalThis.navigator?.maxTouchPoints ?? 0;
  const hasWebGPU = runtime.hasWebGPU ?? Boolean(globalThis.navigator?.gpu);
  const isAppleMobile = /iPad|iPhone|iPod/i.test(userAgent)
    || (/Mac/i.test(platform) && maxTouchPoints > 1);
  return {
    isAppleMobile,
    recommendedModel: isAppleMobile ? "tiny" : "base",
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
  while (overlap > 0) {
    const left = earlier.slice(-overlap).map(normalize).join(" ");
    const right = next.slice(0, overlap).map(normalize).join(" ");
    if (left && left === right) break;
    overlap -= 1;
  }
  return next.slice(overlap).join(" ").trim();
}

export class WhisperSession {
  constructor({ buffer, model = "base", language = "ru", onText, onStatus, intervalMs = 8_000 }) {
    this.buffer = buffer;
    this.model = model;
    this.language = language;
    this.onText = onText;
    this.onStatus = onStatus;
    this.intervalMs = intervalMs;
    this.worker = null;
    this.timer = null;
    this.running = false;
    this.busy = false;
    this.ready = false;
    this.failed = false;
    this.previous = "";
    this.requestId = 0;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.ready = false;
    this.failed = false;
    try {
      this.worker = new Worker("./whisper-worker.js?v=13", { type: "module" });
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
    this.onStatus?.(`Loading ${RECOGNITION_MODELS[this.model].label}${deviceNote}… Keep this page open during the first download.`, "working");
    this.timer = window.setInterval(() => this.transcribe(), this.intervalMs);
  }

  transcribe() {
    if (!this.running || !this.ready || this.busy || this.buffer.availableSeconds < 3) return;
    const audio = resampleTo16Khz(this.buffer.takeLast(12), this.buffer.sampleRate);
    if (!audio.length) return;
    this.busy = true;
    this.requestId += 1;
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
      this.onStatus?.(`${RECOGNITION_MODELS[this.model].label} ready · ${message.device}.`, "ready");
      this.transcribe();
    } else if (message.type === "progress") {
      const percent = Number.isFinite(message.progress) ? ` ${Math.round(message.progress)}%` : "";
      this.onStatus?.(`${message.status}${percent}`, "working");
    } else if (message.type === "result") {
      this.busy = false;
      const text = novelTranscript(this.previous, message.text ?? "");
      this.previous = message.text ?? "";
      if (text) this.onText?.(text);
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
