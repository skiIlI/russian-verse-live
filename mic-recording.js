const RECORDING_TYPES = [
  "audio/webm;codecs=opus",
  "audio/mp4;codecs=mp4a.40.2",
  "audio/mp4",
  "audio/ogg;codecs=opus",
  "audio/webm",
];

export function selectRecordingMimeType(MediaRecorderClass) {
  if (typeof MediaRecorderClass?.isTypeSupported !== "function") return "";
  return RECORDING_TYPES.find((type) => MediaRecorderClass.isTypeSupported(type)) ?? "";
}

export function formatRecordingDuration(milliseconds) {
  const totalSeconds = milliseconds > 0 ? Math.max(1, Math.round(milliseconds / 1_000)) : 0;
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

export function createMicRecording(options) {
  const { playback, result, metadata } = options.elements;
  const MediaRecorderClass = options.MediaRecorderClass;
  const urlApi = options.urlApi;
  const now = options.now ?? (() => Date.now());
  const setStatus = options.setStatus;
  const onStateChange = options.onStateChange ?? (() => {});
  let recorder = null;
  let chunks = [];
  let startedAt = 0;
  let recordingUrl = null;

  const isRecording = () => Boolean(recorder && recorder.state !== "inactive");
  const hasRecording = () => Boolean(recordingUrl);

  function clear() {
    playback.pause();
    playback.removeAttribute("src");
    playback.load();
    result.hidden = true;
    metadata.textContent = "";
    if (recordingUrl) urlApi.revokeObjectURL(recordingUrl);
    recordingUrl = null;
    onStateChange();
  }

  function finish(finishedRecorder) {
    const type = finishedRecorder.mimeType || chunks[0]?.type || "audio/webm";
    const blob = new Blob(chunks, { type });
    chunks = [];
    recorder = null;
    if (!blob.size) {
      setStatus("No audio was captured. Try recording again.", "error");
      onStateChange();
      return false;
    }
    clear();
    recordingUrl = urlApi.createObjectURL(blob);
    playback.src = recordingUrl;
    result.hidden = false;
    const duration = formatRecordingDuration(now() - startedAt);
    metadata.textContent = `Test recording · ${duration}`;
    setStatus(`Recording ready for playback · ${duration}`, "ready");
    onStateChange();
    return true;
  }

  async function start(stream) {
    if (typeof MediaRecorderClass !== "function") {
      setStatus("Audio recording is not supported in this browser.", "error");
      return false;
    }
    clear();
    const mimeType = selectRecordingMimeType(MediaRecorderClass);
    try {
      recorder = mimeType ? new MediaRecorderClass(stream, { mimeType }) : new MediaRecorderClass(stream);
      chunks = [];
      recorder.addEventListener("dataavailable", (event) => { if (event.data?.size) chunks.push(event.data); });
      recorder.addEventListener("error", () => setStatus("Recording stopped because the browser reported an audio error.", "error"));
      startedAt = now();
      recorder.start(1_000);
      setStatus("Recording… Tap Stop recording when you are done.", "recording");
      onStateChange();
      return true;
    } catch {
      recorder = null;
      chunks = [];
      setStatus("Recording could not start in this browser.", "error");
      onStateChange();
      return false;
    }
  }

  async function stop() {
    const activeRecorder = recorder;
    if (!activeRecorder || activeRecorder.state === "inactive") return false;
    setStatus("Finishing the recording…", "active");
    return new Promise((resolve) => {
      activeRecorder.addEventListener("stop", () => resolve(finish(activeRecorder)), { once: true });
      try { activeRecorder.stop(); } catch {
        recorder = null;
        chunks = [];
        setStatus("Recording could not be finished.", "error");
        onStateChange();
        resolve(false);
      }
    });
  }

  return {
    supported: typeof MediaRecorderClass === "function",
    start,
    stop,
    clear,
    isRecording,
    hasRecording,
  };
}
