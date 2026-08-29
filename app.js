import { BibleVerseReferenceDetector } from "./parser.js?v=3";
import { RollingAudioBuffer } from "./audio-ring-buffer.js?v=3";
import { configureFeedbackUI } from "./feedback-ui.js?v=3";
import { downloadCurrentSourceContext } from "./source-context.js?v=3";
import { EXCERPTS } from "./excerpts.js?v=3";

const APP_VERSION = "2.0.0";
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const LANGUAGE = {
  ru: { recognition: "ru-RU", name: "Russian", ready: "Ready to listen for Russian Bible references." },
  en: { recognition: "en-US", name: "English", ready: "Ready to listen for English Bible references." },
};

const elements = Object.fromEntries([
  "listenerCard", "listenerIcon", "message", "phase", "startButton", "stopButton", "contextChip",
  "latestEmpty", "latestResult", "latestReference", "latestSource", "transcriptList", "excerptFolder",
  "folderButton", "folderContent", "excerptList", "testNote", "reportsFolder", "reportsFolderButton",
  "reportsFolderContent", "reportsList", "reportsCount", "reportFeedbackButton", "feedbackDialog",
  "closeFeedbackButton", "feedbackForm", "feedbackKind", "feedbackExpected", "feedbackCaught",
  "feedbackDuration", "feedbackNote", "feedbackTranscriptPreview", "feedbackStatus", "moreButton",
  "moreDialog", "closeMoreButton", "installInstructions", "nativeInstallButton", "downloadSourceButton",
  "sourceDownloadStatus", "themeButton",
].map((id) => [id, document.querySelector(`#${id}`)]));
elements.phaseText = document.querySelector("#phase span");
elements.modeButtons = [...document.querySelectorAll(".mode")];
elements.languageButtons = [...document.querySelectorAll(".language")];

let language = localStorage.getItem("verse-language") === "en" ? "en" : "ru";
const detector = new BibleVerseReferenceDetector(language);
const rollingAudio = new RollingAudioBuffer(60);
let recognition = null;
let recognitionRunning = false;
let wantsListening = false;
let restartTimer = null;
let playbackMode = "direct";
let activeTestId = null;
let activeAudio = null;
let activeSpeech = null;
let transcriptHistory = [];
let latestDetected = null;
let wakeLock = null;
let installPrompt = null;

function setPhase(label, tone = "idle") {
  elements.phaseText.textContent = label;
  elements.phase.classList.toggle("active", tone === "active");
  elements.phase.classList.toggle("error", tone === "error");
}

function setMessage(message) {
  elements.message.textContent = message;
}

function updateControls() {
  const busy = Boolean(activeTestId);
  elements.startButton.disabled = wantsListening || busy;
  elements.stopButton.disabled = !wantsListening && !busy;
  for (const button of elements.languageButtons) button.disabled = wantsListening || busy;
  const excerpts = EXCERPTS[language];
  for (const button of elements.excerptList.querySelectorAll("button")) {
    button.disabled = busy;
    button.classList.toggle("active", button.dataset.id === activeTestId);
    const play = button.querySelector(".excerpt-play");
    const index = excerpts.findIndex((excerpt) => excerpt.id === button.dataset.id) + 1;
    if (play) play.textContent = button.dataset.id === activeTestId
      ? (playbackMode === "audible" ? "🔊" : "•••")
      : `▶${index}`;
  }
}

function renderContext() {
  const context = detector.readContext();
  elements.contextChip.hidden = !context.book;
  elements.contextChip.textContent = context.book ? `${context.book}${context.chapter ? ` ${context.chapter}` : ""}` : "";
}

function renderTranscripts() {
  elements.transcriptList.replaceChildren();
  if (transcriptHistory.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-line";
    empty.textContent = "No transcript yet.";
    elements.transcriptList.append(empty);
    return;
  }
  for (const entry of transcriptHistory.slice(0, 8)) {
    const line = document.createElement("p");
    line.className = "transcript-line";
    line.lang = language;
    line.textContent = entry.text;
    elements.transcriptList.append(line);
  }
}

function resetSessionView() {
  detector.reset();
  transcriptHistory = [];
  latestDetected = null;
  renderContext();
  renderTranscripts();
  elements.latestEmpty.hidden = false;
  elements.latestResult.hidden = true;
}

function announceReference(reference) {
  latestDetected = reference;
  elements.latestEmpty.hidden = true;
  elements.latestResult.hidden = false;
  elements.latestReference.textContent = reference.display;
  elements.latestSource.textContent = `“${reference.sourceText}”`;
  setMessage(`Detected ${reference.display}`);
  elements.listenerCard.classList.remove("detected");
  requestAnimationFrame(() => elements.listenerCard.classList.add("detected"));
  window.setTimeout(() => elements.listenerCard.classList.remove("detected"), 950);
  if (typeof navigator.vibrate === "function") navigator.vibrate([90, 45, 90]);
}

function consumeTranscript(text, { reset = false } = {}) {
  const clean = text.trim();
  if (!clean) return [];
  if (reset) detector.reset();
  transcriptHistory = [
    { text: clean, at: new Date().toISOString() },
    ...transcriptHistory.filter((entry) => entry.text !== clean),
  ].slice(0, 8);
  const references = detector.consume(clean);
  renderContext();
  renderTranscripts();
  if (references[0]) announceReference(references[0]);
  return references;
}

async function requestWakeLock() {
  if (!("wakeLock" in navigator) || document.visibilityState !== "visible") return;
  try {
    wakeLock = await navigator.wakeLock.request("screen");
    wakeLock.addEventListener("release", () => { wakeLock = null; });
  } catch {
    wakeLock = null;
  }
}

function configureRecognition() {
  if (!SpeechRecognition || recognition) return;
  recognition = new SpeechRecognition();
  recognition.lang = LANGUAGE[language].recognition;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    recognitionRunning = true;
    elements.listenerIcon.textContent = "🎙️";
    setPhase("Listening", "active");
    setMessage(`Listening for ${LANGUAGE[language].name} Bible references…`);
    updateControls();
  };

  recognition.onresult = (event) => {
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      if (result.isFinal) consumeTranscript(result[0]?.transcript ?? "");
    }
  };

  recognition.onerror = (event) => {
    if (event.error === "aborted" && !wantsListening) return;
    if (["not-allowed", "service-not-allowed", "audio-capture"].includes(event.error)) {
      wantsListening = false;
      recognitionRunning = false;
      void rollingAudio.stop({ keepAudio: true });
      setPhase("Needs attention", "error");
      setMessage(event.error === "audio-capture" ? "No microphone is available." : "Microphone permission was not granted.");
      updateControls();
      return;
    }
    setMessage(event.error === "no-speech" ? "Still listening…" : "Speech service paused. Reconnecting…");
  };

  recognition.onend = () => {
    recognitionRunning = false;
    if (!wantsListening) {
      elements.listenerIcon.textContent = "📖";
      setPhase("Ready");
      updateControls();
      return;
    }
    if (document.visibilityState !== "visible") {
      setPhase("Paused");
      setMessage("Return to this page to resume listening.");
      return;
    }
    clearTimeout(restartTimer);
    restartTimer = window.setTimeout(startRecognition, 350);
  };
}

function startRecognition() {
  if (!wantsListening || recognitionRunning || document.visibilityState !== "visible") return;
  configureRecognition();
  try {
    const track = rollingAudio.audioTrack;
    if (track) recognition.start(track);
    else recognition.start();
  } catch (error) {
    if (rollingAudio.audioTrack && error?.name === "TypeError") {
      try { recognition.start(); } catch {}
    } else if (error?.name !== "InvalidStateError") {
      setPhase("Needs attention", "error");
      setMessage("Could not start speech recognition. Try again.");
    }
  }
}

async function startListening() {
  if (!SpeechRecognition) {
    setPhase("Unsupported", "error");
    setMessage("This browser does not provide live speech recognition. Try Chrome or Safari.");
    return;
  }
  stopActiveTest();
  resetSessionView();
  wantsListening = true;
  setPhase("Starting", "active");
  setMessage("Opening the microphone…");
  updateControls();
  try {
    await rollingAudio.start();
  } catch {
    wantsListening = false;
    setPhase("Needs attention", "error");
    setMessage("The microphone could not be opened. Check browser permission and try again.");
    updateControls();
    return;
  }
  await requestWakeLock();
  startRecognition();
}

async function stopListening() {
  wantsListening = false;
  clearTimeout(restartTimer);
  restartTimer = null;
  stopActiveTest();
  if (recognitionRunning) {
    try { recognition.stop(); } catch { recognition.abort(); }
  }
  recognitionRunning = false;
  await rollingAudio.stop({ keepAudio: true });
  elements.listenerIcon.textContent = "📖";
  setPhase("Ready");
  setMessage("Listening stopped. Recent audio remains available for feedback.");
  updateControls();
  if (wakeLock) {
    await wakeLock.release().catch(() => {});
    wakeLock = null;
  }
}

function stopActiveTest() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }
  if (activeSpeech) {
    speechSynthesis.cancel();
    activeSpeech = null;
  }
  activeTestId = null;
  updateControls();
}

async function runExcerpt(excerpt) {
  if (activeTestId) return;
  if (wantsListening) await stopListening();
  resetSessionView();
  activeTestId = excerpt.id;
  setPhase(playbackMode === "audible" ? "Playing excerpt" : "Testing", "active");
  setMessage(`${playbackMode === "audible" ? "Speaker" : "Direct"} test · ${excerpt.expectedReference}`);
  updateControls();

  if (playbackMode === "audible" && excerpt.file) {
    activeAudio = new Audio(excerpt.file);
    activeAudio.addEventListener("ended", finishAudibleTest, { once: true });
    await activeAudio.play().catch(() => { activeAudio = null; });
  } else if (playbackMode === "audible" && "speechSynthesis" in window) {
    activeSpeech = new SpeechSynthesisUtterance(excerpt.transcript);
    activeSpeech.lang = LANGUAGE[language].recognition;
    activeSpeech.addEventListener("end", finishAudibleTest, { once: true });
    speechSynthesis.speak(activeSpeech);
  }

  window.setTimeout(() => {
    if (activeTestId !== excerpt.id) return;
    const references = consumeTranscript(excerpt.transcript, { reset: true });
    const matched = references.some((reference) => reference.canonical === excerpt.expectedReference);
    setMessage(matched
      ? `${playbackMode === "audible" ? "Speaker" : "Direct"} test passed · ${excerpt.expectedReference}`
      : `Expected ${excerpt.expectedReference}, but it was not detected.`);
    if (playbackMode === "direct" || (!activeAudio && !activeSpeech)) {
      activeTestId = null;
      setPhase(matched ? "Ready" : "Needs attention", matched ? "idle" : "error");
      updateControls();
    }
  }, 850);
}

function finishAudibleTest() {
  activeAudio = null;
  activeSpeech = null;
  activeTestId = null;
  setPhase("Ready");
  updateControls();
}

function renderExcerpts() {
  elements.excerptList.replaceChildren();
  EXCERPTS[language].forEach((excerpt, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "excerpt-row";
    button.dataset.id = excerpt.id;
    button.innerHTML = `
      <span class="excerpt-play">▶${index + 1}</span>
      <span class="excerpt-reference">${excerpt.expectedReference}</span>
      <span class="excerpt-time">${excerpt.sourceTimestamp}</span>
    `;
    button.addEventListener("click", () => void runExcerpt(excerpt));
    elements.excerptList.append(button);
  });
  elements.testNote.textContent = language === "ru"
    ? "Direct runs the parser. Speaker also plays the original sermon excerpt."
    : "Direct runs five English parser cases. Speaker reads each case aloud.";
  updateControls();
}

function setLanguage(next) {
  if (next === language || wantsListening || activeTestId) return;
  language = next;
  localStorage.setItem("verse-language", language);
  detector.setLanguage(language);
  recognition = null;
  resetSessionView();
  for (const button of elements.languageButtons) {
    const active = button.dataset.language === language;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  }
  setMessage(LANGUAGE[language].ready);
  renderExcerpts();
}

function toggleFolder(section, content, button) {
  const open = content.hidden;
  content.hidden = !open;
  section.classList.toggle("open", open);
  button.setAttribute("aria-expanded", String(open));
}

async function createFeedbackReport({ kind, expected, caught, note, requestedAudioSeconds }) {
  const actualAudioSeconds = Math.min(requestedAudioSeconds, rollingAudio.availableSeconds);
  const id = crypto.randomUUID ? crypto.randomUUID() : `report-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return {
    id,
    schemaVersion: 1,
    appVersion: APP_VERSION,
    createdAt: new Date().toISOString(),
    pageUrl: location.href,
    language,
    kind,
    expected,
    caught,
    note,
    requestedAudioSeconds,
    actualAudioSeconds,
    context: detector.readContext(),
    latestReference: latestDetected,
    transcripts: transcriptHistory,
    browser: navigator.userAgent,
    audioBlob: rollingAudio.createWav(requestedAudioSeconds),
  };
}

function configureMoreMenu() {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  elements.installInstructions.textContent = isIOS
    ? "In Safari, tap Share, then Add to Home Screen. The installed app follows website updates."
    : "Install this listener as a full-screen browser app. It follows website updates.";
  if (isStandalone) elements.nativeInstallButton.hidden = true;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    elements.nativeInstallButton.hidden = false;
  });
  elements.nativeInstallButton.addEventListener("click", async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    installPrompt = null;
    elements.nativeInstallButton.hidden = true;
  });
  elements.downloadSourceButton.addEventListener("click", async () => {
    elements.downloadSourceButton.disabled = true;
    try {
      await downloadCurrentSourceContext((index, total, path) => {
        elements.sourceDownloadStatus.textContent = `Fetching ${index}/${total} · ${path}`;
      });
      elements.sourceDownloadStatus.textContent = "Current GitHub source context downloaded.";
    } catch {
      elements.sourceDownloadStatus.textContent = "Could not reach GitHub. Check the connection and try again.";
    } finally {
      elements.downloadSourceButton.disabled = false;
    }
  });
}

function configureTheme() {
  const stored = localStorage.getItem("verse-theme");
  document.documentElement.dataset.theme = stored || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  elements.themeButton.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("verse-theme", next);
  });
}

const feedbackUI = configureFeedbackUI({
  elements,
  createReport: createFeedbackReport,
  readPreview: () => ({
    caught: latestDetected?.canonical ?? "",
    transcript: transcriptHistory.map((entry) => entry.text).join("\n"),
    audioSeconds: rollingAudio.availableSeconds,
  }),
});

elements.startButton.addEventListener("click", () => void startListening());
elements.stopButton.addEventListener("click", () => void stopListening());
elements.folderButton.addEventListener("click", () => toggleFolder(elements.excerptFolder, elements.folderContent, elements.folderButton));
elements.reportsFolderButton.addEventListener("click", () => toggleFolder(elements.reportsFolder, elements.reportsFolderContent, elements.reportsFolderButton));
elements.moreButton.addEventListener("click", () => elements.moreDialog.showModal());
elements.closeMoreButton.addEventListener("click", () => elements.moreDialog.close());
for (const button of elements.languageButtons) button.addEventListener("click", () => setLanguage(button.dataset.language));
for (const button of elements.modeButtons) {
  button.addEventListener("click", () => {
    playbackMode = button.dataset.mode;
    for (const choice of elements.modeButtons) {
      const active = choice === button;
      choice.classList.toggle("active", active);
      choice.setAttribute("aria-pressed", String(active));
    }
    updateControls();
  });
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && wantsListening) {
    void requestWakeLock();
    startRecognition();
  }
});
window.addEventListener("pagehide", () => {
  clearTimeout(restartTimer);
  if (recognitionRunning) recognition.abort();
  void rollingAudio.stop({ keepAudio: false });
});

configureTheme();
configureMoreMenu();
for (const button of elements.languageButtons) {
  const active = button.dataset.language === language;
  button.classList.toggle("active", active);
  button.setAttribute("aria-pressed", String(active));
}
setMessage(LANGUAGE[language].ready);
renderExcerpts();
void feedbackUI.refresh();

if ("serviceWorker" in navigator && window.isSecureContext) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js?v=3").catch(() => {}));
}
