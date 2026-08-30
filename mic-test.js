import { createMicLevelMeter } from "./mic-level-meter.js?v=11";
import { createMicRecording } from "./mic-recording.js?v=11";

const ELEMENT_IDS = [
  "micTestSection", "micTestFolderButton", "micTestContent", "micTestSummary", "micTestStatus",
  "startMicButton", "stopMicButton", "monitorMicButton", "recordMicButton", "stopRecordingButton",
  "micRecordingResult", "micRecordingMeta", "micRecordingPlayback", "discardRecordingButton",
  "micLevelMeter", "micLevelText", "liveMonitorAudio",
];

export function microphoneErrorMessage(error) {
  if (["NotAllowedError", "SecurityError"].includes(error?.name)) return "Microphone permission was not granted.";
  if (error?.name === "NotFoundError") return "No microphone was found on this device.";
  if (["NotReadableError", "AbortError"].includes(error?.name)) return "The microphone is busy or unavailable.";
  return "The microphone could not be opened. Check browser permission and try again.";
}

function readElements(root) {
  return Object.fromEntries(ELEMENT_IDS.map((id) => {
    const element = root.querySelector(`#${id}`);
    if (!element) throw new Error(`Missing microphone test element: ${id}`);
    return [id, element];
  }));
}

export function configureMicTest(options = {}) {
  const scope = globalThis.window ?? globalThis;
  const root = options.root ?? scope.document;
  const elements = readElements(root);
  const mediaDevices = options.mediaDevices ?? scope.navigator?.mediaDevices;
  const MediaRecorderClass = options.MediaRecorderClass ?? scope.MediaRecorder;
  const urlApi = options.urlApi ?? scope.URL;
  const now = options.now ?? (() => Date.now());
  const beforeStart = options.beforeStart ?? (async () => {});
  const secure = options.isSecureContext ?? scope.isSecureContext;
  const meter = (options.createMeter ?? createMicLevelMeter)({
    meterElement: elements.micLevelMeter,
    labelElement: elements.micLevelText,
    ...(options.meterOptions ?? {}),
  });
  const listeners = [];
  let stream = null;
  let track = null;
  let trackEndedHandler = null;
  let monitoring = false;
  let starting = false;
  let destroyed = false;
  let inputAttempt = 0;

  const supportsMic = Boolean(mediaDevices?.getUserMedia);

  function listen(element, event, handler) {
    element.addEventListener(event, handler);
    listeners.push(() => element.removeEventListener(event, handler));
  }

  function setStatus(message, tone = "idle") {
    elements.micTestStatus.textContent = message;
    elements.micTestStatus.dataset.tone = tone;
  }

  const recording = createMicRecording({
    elements: {
      playback: elements.micRecordingPlayback,
      result: elements.micRecordingResult,
      metadata: elements.micRecordingMeta,
    },
    MediaRecorderClass,
    urlApi,
    now,
    setStatus,
    onStateChange: renderControls,
  });

  function renderControls() {
    const active = Boolean(stream);
    const isRecording = recording.isRecording();
    elements.startMicButton.disabled = starting || active || !supportsMic;
    elements.stopMicButton.disabled = starting || !active || isRecording;
    elements.monitorMicButton.disabled = !active;
    elements.recordMicButton.disabled = starting || isRecording || !supportsMic || !recording.supported;
    elements.stopRecordingButton.disabled = !isRecording;
    elements.monitorMicButton.classList.toggle("active", monitoring);
    elements.monitorMicButton.setAttribute("aria-pressed", String(monitoring));
    elements.monitorMicButton.textContent = monitoring ? "Monitor on" : "Monitor input";
    elements.micTestSummary.textContent = isRecording ? "Recording" : monitoring ? "Monitoring" : active ? "Mic on" : recording.hasRecording() ? "Ready" : "Off";
    elements.micTestSection.dataset.state = isRecording ? "recording" : active ? "active" : "idle";
  }

  function stopMonitor() {
    elements.liveMonitorAudio.pause();
    elements.liveMonitorAudio.srcObject = null;
    monitoring = false;
    renderControls();
  }

  function clearRecording({ announce = true } = {}) {
    recording.clear();
    if (announce) setStatus(stream ? "Recording discarded. Mic is still ready." : "Recording discarded. Start the mic to test again.");
    renderControls();
  }

  async function startInput() {
    if (stream) return true;
    if (!secure) {
      setStatus("Microphone access requires HTTPS or localhost.", "error");
      return false;
    }
    if (!supportsMic) {
      setStatus("This browser does not provide microphone access.", "error");
      return false;
    }
    const attempt = ++inputAttempt;
    starting = true;
    setStatus("Opening the microphone…", "active");
    renderControls();
    let nextStream = null;
    try {
      await beforeStart();
      if (destroyed || attempt !== inputAttempt) return false;
      nextStream = await mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: false,
      });
      if (destroyed || attempt !== inputAttempt) {
        for (const ownedTrack of nextStream.getTracks?.() ?? []) ownedTrack.stop();
        return false;
      }
      stream = nextStream;
      nextStream = null;
      track = stream.getAudioTracks()[0];
      if (!track) throw Object.assign(new Error("No audio track"), { name: "NotFoundError" });
      if ("contentHint" in track) track.contentHint = "speech";
      trackEndedHandler = () => { if (stream) void stopInput({ reason: "ended" }); };
      track.addEventListener?.("ended", trackEndedHandler, { once: true });
      const hasMeter = await meter.start(stream);
      setStatus(hasMeter ? "Mic ready. Speak to check the input level." : "Mic ready. This browser cannot show input levels.", hasMeter ? "active" : "error");
      return true;
    } catch (error) {
      await meter.stop();
      for (const ownedTrack of nextStream?.getTracks?.() ?? []) ownedTrack.stop();
      for (const ownedTrack of stream?.getTracks?.() ?? []) ownedTrack.stop();
      stream = null;
      track = null;
      if (attempt === inputAttempt) setStatus(microphoneErrorMessage(error), "error");
      return false;
    } finally {
      if (attempt === inputAttempt) {
        starting = false;
        renderControls();
      }
    }
  }

  async function toggleMonitor() {
    if (!stream && !(await startInput())) return false;
    if (monitoring) {
      stopMonitor();
      setStatus("Live monitor off. Mic input is still active.");
      return false;
    }
    elements.liveMonitorAudio.srcObject = stream;
    elements.liveMonitorAudio.muted = false;
    elements.liveMonitorAudio.volume = 1;
    try {
      await elements.liveMonitorAudio.play();
      monitoring = true;
      setStatus("Live monitor on. Use headphones to prevent feedback.", "active");
      renderControls();
      return true;
    } catch {
      stopMonitor();
      setStatus("Playback was blocked. Tap Monitor input again.", "error");
      return false;
    }
  }

  async function startRecording() {
    if (!recording.supported) return recording.start(stream);
    if (!stream && !(await startInput())) return false;
    return recording.start(stream);
  }

  const stopRecording = () => recording.stop();

  async function stopInput({ reason = "user" } = {}) {
    inputAttempt += 1;
    starting = false;
    if (!stream && !recording.isRecording()) {
      renderControls();
      return;
    }
    if (recording.isRecording()) await stopRecording();
    stopMonitor();
    const ownedStream = stream;
    stream = null;
    if (track && trackEndedHandler) track.removeEventListener?.("ended", trackEndedHandler);
    track = null;
    trackEndedHandler = null;
    await meter.stop();
    for (const ownedTrack of ownedStream?.getTracks?.() ?? []) ownedTrack.stop();
    if (reason === "ended") setStatus("The microphone disconnected. Reconnect it and start again.", "error");
    else setStatus(recording.hasRecording() ? "Mic off. Your test recording is ready below." : "Mic off. Start it again whenever you are ready.");
    renderControls();
  }

  async function destroy() {
    destroyed = true;
    listeners.splice(0).forEach((remove) => remove());
    await stopInput();
    clearRecording({ announce: false });
  }

  listen(elements.micTestFolderButton, "click", () => {
    const open = elements.micTestContent.hidden;
    elements.micTestContent.hidden = !open;
    elements.micTestSection.classList.toggle("open", open);
    elements.micTestFolderButton.setAttribute("aria-expanded", String(open));
  });
  listen(elements.startMicButton, "click", () => void startInput());
  listen(elements.stopMicButton, "click", () => void stopInput());
  listen(elements.monitorMicButton, "click", () => void toggleMonitor());
  listen(elements.recordMicButton, "click", () => void startRecording());
  listen(elements.stopRecordingButton, "click", () => void stopRecording());
  listen(elements.discardRecordingButton, "click", () => clearRecording());

  if (!secure) setStatus("Open this page over HTTPS to use the microphone.", "error");
  else if (!supportsMic) setStatus("This browser does not provide microphone access.", "error");
  else setStatus("Start the mic to check levels, monitor input, or make a test recording.");
  elements.recordMicButton.title = recording.supported ? "" : "Recording is not supported in this browser";
  renderControls();

  return {
    startInput, stopInput, toggleMonitor, stopMonitor, startRecording, stopRecording, clearRecording, destroy,
    getState: () => ({ active: Boolean(stream), monitoring, recording: recording.isRecording(), hasRecording: recording.hasRecording() }),
  };
}
