import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@3.8.1";

const MODELS = {
  tiny: "Xenova/whisper-tiny",
  base: "Xenova/whisper-base",
  small: "Xenova/whisper-small",
};

let transcriber = null;
let loadedModel = null;

function progress(update) {
  if (!update?.status) return;
  self.postMessage({ type: "progress", status: update.status, progress: update.progress ?? null });
}

async function load(model) {
  if (!MODELS[model]) throw new Error("Unknown Whisper model.");
  if (transcriber && loadedModel === model) return;
  transcriber = null;
  loadedModel = null;
  const modelId = MODELS[model];
  const options = { progress_callback: progress };
  if (self.navigator?.gpu) options.device = "webgpu";
  try {
    transcriber = await pipeline("automatic-speech-recognition", modelId, options);
  } catch (error) {
    if (!options.device) throw error;
    self.postMessage({ type: "progress", status: "WebGPU unavailable; using CPU" });
    transcriber = await pipeline("automatic-speech-recognition", modelId, { progress_callback: progress });
  }
  loadedModel = model;
  self.postMessage({ type: "ready", model, device: options.device ?? "wasm" });
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
    self.postMessage({
      type: "error",
      requestId: message.requestId ?? null,
      message: error instanceof Error ? error.message : "Local transcription failed.",
    });
  }
});
