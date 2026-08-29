import { RussianVerseReferenceDetector } from "./parser.js?v=2";

const EXCERPTS = [
  {
    id: "malachi-4-5-6",
    expectedReference: "Malachi 4:5–6",
    sourceTimestamp: "24:08",
    file: "assets/malachi-4-5-6.wav",
    transcript: "Первое место Малахии, последние два стишка Старого Завета. Написано такие слова: 5 и 6 стих.",
  },
  {
    id: "first-corinthians-16-14",
    expectedReference: "1 Corinthians 16:14",
    sourceTimestamp: "34:31",
    file: "assets/first-corinthians-16-14.wav",
    transcript: "Это первое коринфианом, 16 глава. 14 стих. Все у вас да будет с любовью.",
  },
  {
    id: "mark-10-13",
    expectedReference: "Mark 10:13",
    sourceTimestamp: "59:48",
    file: "assets/mark-10-13.wav",
    transcript: "Я читаю Евангелие от Марка с сокращением времени. Читаю Марка, 10 глава, с 13 стиха. И приносили к нему детей, чтобы он прикоснулся к ним.",
  },
  {
    id: "genesis-18-19",
    expectedReference: "Genesis 18:19",
    sourceTimestamp: "1:02:09",
    file: "assets/genesis-18-19.wav",
    transcript: "Я не буду много распространяться. Читаю БТЕ 18 глава, 19 стих. Братья, обратите внимание, ибо я избрал его.",
  },
  {
    id: "luke-12-13",
    expectedReference: "Luke 12:13",
    sourceTimestamp: "1:45:59",
    file: "assets/luke-12-13.wav",
    transcript: "Хвала и благодарность Ему. Текст Писания записан Евангелистом Лукой в 12 главе с 13 стиха.",
  },
];

const detector = new RussianVerseReferenceDetector();
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const elements = {
  listenerCard: document.querySelector("#listenerCard"),
  listenerIcon: document.querySelector("#listenerIcon"),
  message: document.querySelector("#message"),
  phase: document.querySelector("#phase"),
  phaseText: document.querySelector("#phase span"),
  startButton: document.querySelector("#startButton"),
  stopButton: document.querySelector("#stopButton"),
  contextChip: document.querySelector("#contextChip"),
  latestEmpty: document.querySelector("#latestEmpty"),
  latestResult: document.querySelector("#latestResult"),
  latestReference: document.querySelector("#latestReference"),
  latestSource: document.querySelector("#latestSource"),
  transcriptList: document.querySelector("#transcriptList"),
  excerptFolder: document.querySelector("#excerptFolder"),
  folderButton: document.querySelector("#folderButton"),
  folderContent: document.querySelector("#folderContent"),
  excerptList: document.querySelector("#excerptList"),
  modeButtons: [...document.querySelectorAll(".mode")],
  installButton: document.querySelector("#installButton"),
  installDialog: document.querySelector("#installDialog"),
  installInstructions: document.querySelector("#installInstructions"),
  nativeInstallButton: document.querySelector("#nativeInstallButton"),
  closeInstallButton: document.querySelector("#closeInstallButton"),
  themeButton: document.querySelector("#themeButton"),
};

let recognition = null;
let recognitionRunning = false;
let wantsListening = false;
let restartTimer = null;
let playbackMode = "direct";
let activeTestId = null;
let activeAudio = null;
let transcriptHistory = [];
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
  for (const button of elements.excerptList.querySelectorAll("button")) {
    button.disabled = busy;
    button.classList.toggle("active", button.dataset.id === activeTestId);
    const play = button.querySelector(".excerpt-play");
    if (play) {
      const index = EXCERPTS.findIndex((excerpt) => excerpt.id === button.dataset.id) + 1;
      play.textContent = button.dataset.id === activeTestId
        ? (playbackMode === "audible" ? "🔊" : "•••")
        : `▶${index}`;
    }
  }
}

function renderContext() {
  const context = detector.readContext();
  if (!context.book) {
    elements.contextChip.hidden = true;
    elements.contextChip.textContent = "";
    return;
  }
  elements.contextChip.textContent = `${context.book}${context.chapter ? ` ${context.chapter}` : ""}`;
  elements.contextChip.hidden = false;
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
  for (const transcript of transcriptHistory.slice(0, 8)) {
    const line = document.createElement("p");
    line.className = "transcript-line";
    line.lang = "ru";
    line.textContent = transcript;
    elements.transcriptList.append(line);
  }
}

function announceReference(reference) {
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
  transcriptHistory = [clean, ...transcriptHistory.filter((entry) => entry !== clean)].slice(0, 8);
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
  recognition.lang = "ru-RU";
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    recognitionRunning = true;
    elements.listenerIcon.textContent = "🎙️";
    setPhase("Listening", "active");
    setMessage("Listening for Russian Bible references…");
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
      setPhase("Needs attention", "error");
      setMessage(event.error === "audio-capture"
        ? "No microphone is available."
        : "Microphone permission was not granted.");
      updateControls();
      return;
    }
    setMessage(event.error === "no-speech"
      ? "Still listening…"
      : "Speech service paused. Reconnecting…");
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
    recognition.start();
  } catch (error) {
    if (error?.name !== "InvalidStateError") {
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
  detector.reset();
  transcriptHistory = [];
  renderContext();
  renderTranscripts();
  elements.latestEmpty.hidden = false;
  elements.latestResult.hidden = true;
  wantsListening = true;
  setPhase("Starting", "active");
  setMessage("Opening the microphone…");
  updateControls();
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
  elements.listenerIcon.textContent = "📖";
  setPhase("Ready");
  setMessage("Listening stopped.");
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
  activeTestId = null;
  updateControls();
}

async function runExcerpt(excerpt) {
  if (activeTestId) return;
  if (wantsListening) await stopListening();
  detector.reset();
  transcriptHistory = [];
  renderTranscripts();
  renderContext();
  activeTestId = excerpt.id;
  setPhase(playbackMode === "audible" ? "Playing excerpt" : "Testing", "active");
  setMessage(`${playbackMode === "audible" ? "Audible" : "Direct"} test · ${excerpt.expectedReference}`);
  updateControls();

  if (playbackMode === "audible") {
    activeAudio = new Audio(excerpt.file);
    activeAudio.preload = "auto";
    activeAudio.addEventListener("ended", () => {
      activeAudio = null;
      activeTestId = null;
      setPhase("Ready");
      updateControls();
    }, { once: true });
    try {
      await activeAudio.play();
    } catch {
      activeAudio = null;
      setMessage("Speaker playback was blocked; the direct detector test will continue.");
    }
  }

  window.setTimeout(() => {
    if (activeTestId !== excerpt.id) return;
    const references = consumeTranscript(excerpt.transcript, { reset: true });
    const matched = references.some((reference) => reference.canonical === excerpt.expectedReference);
    if (!matched) {
      setPhase("Needs attention", "error");
      setMessage(`Expected ${excerpt.expectedReference}, but it was not detected.`);
    } else {
      setMessage(`${playbackMode === "audible" ? "Audible" : "Direct"} test passed · ${excerpt.expectedReference}`);
    }
    if (playbackMode === "direct" || !activeAudio) {
      activeTestId = null;
      setPhase(matched ? "Ready" : "Needs attention", matched ? "idle" : "error");
      updateControls();
    }
  }, 850);
}

function renderExcerpts() {
  elements.excerptList.replaceChildren();
  EXCERPTS.forEach((excerpt, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "excerpt-row";
    button.dataset.id = excerpt.id;
    button.title = excerpt.expectedReference;
    button.innerHTML = `
      <span class="excerpt-play">▶${index + 1}</span>
      <span class="excerpt-reference">${excerpt.expectedReference}</span>
      <span class="excerpt-time">${excerpt.sourceTimestamp}</span>
    `;
    button.addEventListener("click", () => void runExcerpt(excerpt));
    elements.excerptList.append(button);
  });
}

function configureInstall() {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  if (isStandalone) elements.installButton.hidden = true;
  elements.installInstructions.textContent = isIOS
    ? "In Safari, tap Share, then Add to Home Screen. The installed app opens full screen."
    : "Install this listener for a full-screen app, or download its files below.";

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    elements.nativeInstallButton.hidden = false;
  });

  elements.installButton.addEventListener("click", () => elements.installDialog.showModal());
  elements.closeInstallButton.addEventListener("click", () => elements.installDialog.close());
  elements.nativeInstallButton.addEventListener("click", async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    installPrompt = null;
    elements.nativeInstallButton.hidden = true;
    elements.installDialog.close();
  });
}

function configureTheme() {
  const stored = localStorage.getItem("verse-theme");
  const initial = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.dataset.theme = initial;
  elements.themeButton.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("verse-theme", next);
  });
}

elements.startButton.addEventListener("click", () => void startListening());
elements.stopButton.addEventListener("click", () => void stopListening());
elements.folderButton.addEventListener("click", () => {
  const open = elements.folderContent.hidden;
  elements.folderContent.hidden = !open;
  elements.excerptFolder.classList.toggle("open", open);
  elements.folderButton.setAttribute("aria-expanded", String(open));
});

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
});

configureTheme();
configureInstall();
renderExcerpts();
updateControls();

if ("serviceWorker" in navigator && window.isSecureContext) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(() => {}));
}
