import { RollingAudioBuffer } from "./audio-ring-buffer.js?v=13";
import { WhisperSession, RECOGNITION_MODELS } from "./whisper-session.js?v=22";

export function clockTime(seconds) {
  const total = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainder = total % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
    : `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export function configureYouTubeAudioTranscriber({ audio, startButton, stopButton, onText, onStatus, onActiveChange }) {
  const buffer = new RollingAudioBuffer(90);
  let whisper = null;
  let captureStream = null;
  let active = false;
  let current = null;

  function setActive(value) {
    active = value;
    startButton.disabled = value;
    stopButton.disabled = !value;
    stopButton.hidden = !value;
    audio.hidden = !value && !audio.src;
    onActiveChange?.(value);
  }

  async function start({ videoId, model, language }) {
    await stop();
    current = { videoId, model, language };
    audio.src = `/api/youtube-audio?videoId=${encodeURIComponent(videoId)}`;
    audio.hidden = false;
    audio.load();
    await audio.play();
    const capture = audio.captureStream?.() ?? audio.mozCaptureStream?.();
    const track = capture?.getAudioTracks()[0];
    if (!track) throw new Error("This browser cannot route media audio into the transcriber.");
    captureStream = capture;
    setActive(true);
    await buffer.startFromTrack(track);
    whisper = new WhisperSession({
      buffer,
      model,
      language,
      onText: (text) => onText(text, audio.currentTime),
      onStatus: (message, tone) => onStatus(`${message} Audio is playing through the speakers.`, tone),
    });
    whisper.start();
  }

  async function stop() {
    active = false;
    whisper?.stop();
    whisper = null;
    await buffer.stop({ keepAudio: false });
    for (const track of captureStream?.getTracks() ?? []) track.stop();
    captureStream = null;
    if (!audio.paused) audio.pause();
    setActive(false);
  }

  audio.addEventListener("ended", () => {
    if (!active) return;
    void stop().then(() => onStatus(`${RECOGNITION_MODELS[current.model].label} finished the YouTube audio.`, "ready"));
  });
  stopButton.addEventListener("click", () => void stop().then(() => onStatus("YouTube transcription stopped.", "ready")));
  setActive(false);
  return { start, stop, destroy: stop };
}
