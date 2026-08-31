export const WHISPER_MODELS = {
  base: {
    id: "Xenova/whisper-base",
    label: "Whisper Base",
    webgpu: {
      dtype: null,
      files: ["onnx/encoder_model.onnx", "onnx/decoder_model_merged.onnx"],
    },
  },
  small: {
    id: "Xenova/whisper-small",
    label: "Whisper Small",
    webgpu: {
      dtype: null,
      files: ["onnx/encoder_model.onnx", "onnx/decoder_model_merged.onnx"],
    },
  },
  medium: {
    id: "Xenova/whisper-medium",
    label: "Whisper Medium",
    webgpu: {
      dtype: { encoder_model: "fp16", decoder_model_merged: "q4" },
      files: ["onnx/encoder_model_fp16.onnx", "onnx/decoder_model_merged_q4.onnx"],
    },
  },
  largeTurbo: {
    id: "onnx-community/whisper-large-v3-turbo",
    label: "Whisper Large Turbo",
    webgpu: {
      dtype: { encoder_model: "q4", decoder_model_merged: "q4" },
      files: ["onnx/encoder_model_q4.onnx", "onnx/decoder_model_merged_q4.onnx"],
    },
  },
};

const WASM_RUNTIME = {
  dtype: "q8",
  files: ["onnx/encoder_model_quantized.onnx", "onnx/decoder_model_merged_quantized.onnx"],
};

export const RECOGNITION_MODELS = Object.fromEntries(Object.entries(WHISPER_MODELS)
  .map(([key, model]) => [key, { label: model.label, local: true }]));

export function getWhisperModelRuntime(model, device) {
  const config = WHISPER_MODELS[model];
  if (!config) throw new Error("Unknown Whisper model.");
  return device === "wasm" ? WASM_RUNTIME : config.webgpu;
}

export async function getWhisperModelCacheStatus(model, device, cacheStorage = globalThis.caches) {
  const config = WHISPER_MODELS[model];
  if (!config || !cacheStorage?.match) return { checked: false, cached: false, completedFiles: 0, totalFiles: 0 };
  const runtime = getWhisperModelRuntime(model, device);
  const matches = await Promise.all(runtime.files.map((file) => cacheStorage.match(
    `https://huggingface.co/${config.id}/resolve/main/${file}`,
  ).catch(() => null)));
  const completedFiles = matches.filter(Boolean).length;
  return {
    checked: true,
    cached: completedFiles === runtime.files.length,
    completedFiles,
    totalFiles: runtime.files.length,
  };
}
