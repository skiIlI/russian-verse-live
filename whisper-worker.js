import { env, pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";

const MODELS = {
  tiny: "Xenova/whisper-tiny",
  base: "Xenova/whisper-base",
  small: "Xenova/whisper-small",
};

let transcriber = null;
let loadedModel = null;
let loadingModel = null;
let loadPromise = null;

const isAppleMobile = /iPad|iPhone|iPod/i.test(self.navigator?.userAgent ?? "")
  || (/Mac/i.test(self.navigator?.platform ?? "") && (self.navigator?.maxTouchPoints ?? 0) > 1);

env.useBrowserCache = true;
env.useWasmCache = true;
if (isAppleMobile) env.backends.onnx.wasm.numThreads = 1;

function progress(update) {
  if (!update?.status) return;
  self.postMessage({ type: "progress", status: update.status, progress: update.progress ?? null });
}

function friendlyError(error, model) {
  const label = `Whisper ${model[0].toUpperCase()}${model.slice(1)}`;
  const detail = error instanceof Error ? error.message : String(error ?? "");
  if (/fetch|network|download|404|load failed/i.test(detail)) {
    return { code: "download", message: `${label} could not download. Check the connection and free storage, then retry.` };
  }
  if (/memory|allocation|out of bounds|abort/i.test(detail)) {
    return { code: "memory", message: `${label} ran out of device memory. Use Whisper Tiny and close other tabs, then retry.` };
  }
  return { code: "startup", message: `${label} could not start on this device. Reload the app and retry.` };
}

async function createTranscriber(model) {
  if (!MODELS[model]) throw new Error("Unknown Whisper model.");
  transcriber = null;
  loadedModel = null;
  const modelId = MODELS[model];
  const canUseWebGpu = Boolean(self.navigator?.gpu) && !isAppleMobile;
  const options = canUseWebGpu
    ? { progress_callback: progress, device: "webgpu" }
    : { progress_callback: progress, device: "wasm", dtype: "q8" };
  let device = options.device;
  try {
    transcriber = await pipeline("automatic-speech-recognition", modelId, options);
  } catch (error) {
    if (!canUseWebGpu) throw error;
    self.postMessage({ type: "progress", status: "WebGPU unavailable; using CPU" });
    device = "wasm";
    transcriber = await pipeline("automatic-speech-recognition", modelId, {
      progress_callback: progress,
      device,
      dtype: "q8",
    });
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
        return_timestamps: false,
      });
      self.postMessage({ type: "result", requestId: message.requestId, text: result?.text?.trim() ?? "" });
    }
  } catch (error) {
    const friendly = friendlyError(error, message.model ?? loadedModel ?? "tiny");
    self.postMessage({
      type: "error",
      requestId: message.requestId ?? null,
      code: friendly.code,
      message: friendly.message,
    });
  }
});
