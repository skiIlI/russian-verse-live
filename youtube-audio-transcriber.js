import { RollingAudioBuffer } from "./audio-ring-buffer.js?v=12";
import { WhisperSession, RECOGNITION_MODELS } from "./whisper-session.js?v=12";

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
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const buffer = new RollingAudioBuffer(90);
  let recognition = null;
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

  function startBrowserRecognition(track, language) {
    if (!SpeechRecognition) throw new Error("Browser speech recognition is unavailable. Choose a local Whisper model.");
    recognition = new SpeechRecognition();
    recognition.lang = language === "ru" ? "ru-RU" : "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        if (event.results[index].isFinal) onText(event.results[index][0]?.transcript ?? "", audio.currentTime);
      }
    };
    recognition.onerror = (event) => onStatus(`Browser transcription: ${event.error}.`, "error");
    recognition.onend = () => {
      if (!active || audio.ended || audio.paused) return;
      window.setTimeout(() => {
        if (!active) return;
        try { recognition.start(track); } catch {}
      }, 300);
    };
    recognition.start(track);
    onStatus("Playing through speakers and transcribing with the browser speech service.", "working");
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
    if (model === "browser") {
      startBrowserRecognition(track, language);
      return;
    }
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
    if (recognition) {
      try { recognition.abort(); } catch {}
      recognition = null;
    }
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
