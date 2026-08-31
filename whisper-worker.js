import { env, pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";
import { getWhisperModelRuntime, WHISPER_MODELS } from "./whisper-models.js?v=26";

let transcriber = null;
let loadedModel = null;
let loadingModel = null;
let loadPromise = null;
const progressSentAt = new Map();

const isAppleMobile = /iPad|iPhone|iPod/i.test(self.navigator?.userAgent ?? "")
  || (/Mac/i.test(self.navigator?.platform ?? "") && (self.navigator?.maxTouchPoints ?? 0) > 1);

env.useBrowserCache = true;
env.useWasmCache = true;
if (isAppleMobile) env.backends.onnx.wasm.numThreads = 1;

function progress(update) {
  if (!update?.status) return;
  if (update.status === "progress") {
    const now = performance.now();
    const key = update.file ?? "model";
    const previous = progressSentAt.get(key) ?? 0;
    if (now - previous < 100 && update.progress !== 100) return;
    progressSentAt.set(key, now);
  }
  self.postMessage({
    type: "progress",
    status: update.status,
    progress: update.progress ?? null,
    file: update.file ?? null,
    name: update.name ?? null,
    loaded: Number.isFinite(update.loaded) ? update.loaded : null,
    total: Number.isFinite(update.total) ? update.total : null,
  });
}

async function inspectDownloadPlan(model, modelId, device, files) {
  self.postMessage({ type: "load-state", phase: "checking", model, device });
  const plannedFiles = await Promise.all(files.map(async (file) => {
    try {
      const response = await fetch(`https://huggingface.co/${modelId}/resolve/main/${file}`, {
        method: "HEAD",
        cache: "no-store",
      });
      const total = Number(response.headers.get("content-length"));
      return { file, total: response.ok && Number.isFinite(total) && total > 0 ? total : null };
    } catch {
      return { file, total: null };
    }
  }));
  self.postMessage({ type: "download-plan", model, device, files: plannedFiles });
  return plannedFiles;
}

async function createPipeline(model, modelId, device) {
  const runtime = getWhisperModelRuntime(model, device);
  await inspectDownloadPlan(model, modelId, device, runtime.files);
  return pipeline("automatic-speech-recognition", modelId, {
    progress_callback: progress,
    device,
    ...(runtime.dtype ? { dtype: runtime.dtype } : {}),
  });
}

function friendlyError(error, model) {
  const label = WHISPER_MODELS[model]?.label ?? "Whisper model";
  const detail = error instanceof Error ? error.message : String(error ?? "");
  if (/fetch|network|download|404|load failed/i.test(detail)) {
    return { code: "download", message: `${label} could not download. Check the connection and free storage, then retry.` };
  }
  if (/memory|allocation|out of bounds|abort/i.test(detail)) {
    return { code: "memory", message: `${label} ran out of device memory. Choose a smaller Whisper model and close other tabs, then retry.` };
  }
  return { code: "startup", message: `${label} could not start on this device. Reload the app and retry.` };
}

async function createTranscriber(model) {
  if (!WHISPER_MODELS[model]) throw new Error("Unknown Whisper model.");
  transcriber = null;
  loadedModel = null;
  const modelId = WHISPER_MODELS[model].id;
  const canUseWebGpu = Boolean(self.navigator?.gpu) && !isAppleMobile;
  let device = canUseWebGpu ? "webgpu" : "wasm";
  try {
    transcriber = await createPipeline(model, modelId, device);
  } catch (error) {
    if (!canUseWebGpu) throw error;
    self.postMessage({ type: "fallback", model, from: "webgpu", to: "wasm" });
    device = "wasm";
    transcriber = await createPipeline(model, modelId, device);
  }
  loadedModel = model;
  self.postMessage({ type: "ready", model, device });
  return transcriber;
}

function load(model) {
  if (transcriber && loadedModel === model) return Promise.resolve(transcriber);
  if (loadPromise && loadingModel === model) return loadPromise;
  loadingModel = model;
  loadPromise = createTranscriber(model).finally(() => {
    loadingModel = null;
    loadPromise = null;
  });
  return loadPromise;
}

self.addEventListener("message", async (event) => {
  const message = event.data ?? {};
  try {
    if (message.type === "load") {
      await load(message.model);
      return;
    }
    if (message.type === "transcribe") {
      await load(message.model);
      const audio = new Float32Array(message.audio);
      const result = await transcriber(audio, {
        language: message.language === "ru" ? "russian" : "english",
        task: "transcribe",
        chunk_length_s: 20,
        stride_length_s: 2,
        max_new_tokens: 64,
        no_repeat_ngram_size: 3,
        return_timestamps: false,
      });
      self.postMessage({ type: "result", requestId: message.requestId, text: result?.text?.trim() ?? "" });
    }
  } catch (error) {
    const friendly = friendlyError(error, message.model ?? loadedModel ?? "small");
    self.postMessage({
      type: "error",
      requestId: message.requestId ?? null,
      code: friendly.code,
      message: friendly.message,
    });
  }
});
