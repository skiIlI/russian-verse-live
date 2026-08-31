const WEIGHT_FILE_PATTERN = /(?:^|\/)\w*model(?:_merged)?[^/]*\.onnx$/i;

export function formatModelBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  const gibibyte = 1024 ** 3;
  const mebibyte = 1024 ** 2;
  if (bytes >= gibibyte) return `${(bytes / gibibyte).toFixed(1)} GB`;
  return `${Math.max(1, Math.round(bytes / mebibyte))} MB`;
}

export class WhisperDownloadProgress {
  constructor(files = []) {
    this.reset(files);
  }

  reset(files = []) {
    this.files = new Map(files.map(({ file, total }) => [file, {
      file,
      total: Number.isFinite(total) && total > 0 ? total : 0,
      loaded: 0,
      complete: false,
      transferred: false,
    }]));
  }

  update(message = {}) {
    if (!message.file || !WEIGHT_FILE_PATTERN.test(message.file)) return null;
    let entry = this.files.get(message.file);
    if (!entry) {
      entry = { file: message.file, total: 0, loaded: 0, complete: false, transferred: false };
      this.files.set(message.file, entry);
    }

    if (Number.isFinite(message.total) && message.total > 0) entry.total = message.total;
    if (Number.isFinite(message.loaded) && message.loaded >= 0) {
      entry.loaded = entry.total > 0 ? Math.min(message.loaded, entry.total) : message.loaded;
      if (message.status === "progress") entry.transferred = true;
    }
    if (message.status === "done") {
      entry.complete = true;
      if (entry.total > 0) entry.loaded = entry.total;
    }

    const entries = [...this.files.values()];
    const totalBytes = entries.reduce((sum, item) => sum + item.total, 0);
    const loadedBytes = entries.reduce((sum, item) => sum + Math.min(item.loaded, item.total || item.loaded), 0);
    const complete = entries.length > 0 && entries.every((item) => item.complete);
    const downloading = entries.some((item) => item.transferred && !item.complete);
    return {
      phase: complete ? "initializing" : downloading ? "download" : "loading",
      progress: totalBytes > 0 ? Math.min(1, loadedBytes / totalBytes) : null,
      loadedBytes,
      totalBytes,
      complete,
    };
  }
}
