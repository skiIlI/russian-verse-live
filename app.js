import { BibleVerseReferenceDetector } from "./parser.js?v=26";
import { RollingAudioBuffer } from "./audio-ring-buffer.js?v=26";
import { configureFeedbackUI } from "./feedback-ui.js?v=26";
import { configureMicTest } from "./mic-test.js?v=26";
import { configureMoreMenu } from "./more-menu.js?v=26";
import { populateBibleVersions, restoreWhisperPace } from "./listener-preferences.js?v=26";
import { LiveQuoteDetector } from "./live-quote-detector.js?v=26";
import { configureTranscriptProgress } from "./transcript-progress.js?v=26";
import { configureServiceTranscriber } from "./service-transcriber.js?v=26";
import { configureSelectControls } from "./select-control.js?v=26";
import { captureTranscriptSnapshot, mergeTranscriptHistory, reportTranscriptWindow, TRANSCRIPT_DISPLAY_LIMIT } from "./transcript-history.js?v=26";
import { configureUIShell } from "./ui-shell.js?v=26";
import { getWhisperRuntimeProfile, normalizeRecognitionModel, WhisperSession, RECOGNITION_MODELS } from "./whisper-session.js?v=26";

const APP_VERSION = "3.0.0";
const LANGUAGE = {
  ru: { label: "Русский", ready: "Waiting for a Russian Bible reference." },
  en: { label: "English", ready: "Waiting for an English Bible reference." },
};
const ids = [
  "app", "phase", "statusText", "listenBtn", "heroMic", "reference", "sourceText",
  "recognitionModel", "recognitionPace", "bibleVersion", "bibleVersionNote", "transcriptList", "transcriptViewport",
  "transcriptState", "transcriptLoading", "transcriptLoadingProgress", "reportTranscriptButton", "toggleTranscriptPlayback",
  "reportFeedbackButton", "feedbackDeliveryStatus", "feedbackLayer", "feedbackBackdrop", "closeFeedbackButton",
  "feedbackForm", "feedbackFormSurface", "feedbackSheetHost", "feedbackOverlayHost", "feedbackKind", "feedbackTiming",
  "feedbackTimingBlock", "feedbackDuration", "feedbackNote", "feedbackStatus", "sendFeedbackButton", "feedbackMini",
  "feedbackMiniTitle", "feedbackTranscriptPreview", "feedbackAudioPreview", "feedbackAudioEmpty",
  "recentTranscriptBtn", "recentAudioBtn", "overlayRecentTranscript", "overlayRecentAudio",
  "nativeInstallButton", "downloadSourceButton", "installInstructions", "sourceDownloadStatus", "sourceProgressBox",
  "sourceProgressText", "sourceProgressFill",
];
const elements = Object.fromEntries(ids.map((id) => [id, document.querySelector(`#${id}`)]));
elements.languageButtons = [...document.querySelectorAll(".language")];
elements.themeButtons = [...document.querySelectorAll(".theme-choice")];

let language = localStorage.getItem("verse-language") === "en" ? "en" : "ru";
const detector = new BibleVerseReferenceDetector(language);
const rollingAudio = new RollingAudioBuffer(60);
const whisperProfile = getWhisperRuntimeProfile();
const transcriptProgress = configureTranscriptProgress(elements.transcriptLoading, elements.transcriptLoadingProgress);
const transcriptAnnotations = new Map();
let transcriptHistory = [];
let transcriptFrozen = false;
let latestDetected = null;
let whisperSession = null;
let whisperCleanupPending = false;
let whisperSessionGeneration = 0;
let listeningTransition = 0;
let wantsListening = false;
let wakeLock = null;
let micTest = null;
let feedbackUI = null;

const savedRecognitionModel = localStorage.getItem("verse-recognition-model");
elements.recognitionModel.value = normalizeRecognitionModel(savedRecognitionModel ?? whisperProfile.recommendedModel);
localStorage.setItem("verse-recognition-model", elements.recognitionModel.value);
if (whisperProfile.isAppleMobile) {
  elements.recognitionModel.querySelector('[value="base"]').textContent = "Whisper Base · Lighter on iPhone";
  elements.recognitionModel.querySelector('[value="small"]').textContent = "Whisper Small · Recommended";
  elements.recognitionModel.querySelector('[value="medium"]').textContent = "Whisper Medium · Very heavy on iPhone";
  elements.recognitionModel.querySelector('[value="largeTurbo"]').textContent = "Whisper Large Turbo · Desktop only";
}
restoreWhisperPace(elements.recognitionPace, localStorage);
populateBibleVersions(elements.bibleVersion, elements.bibleVersionNote, language, localStorage);
const selectControls = configureSelectControls();

function preference(type) {
  if (type === "language") return { value: language, label: LANGUAGE[language].label };
  if (type === "model") return { value: elements.recognitionModel.value, label: RECOGNITION_MODELS[elements.recognitionModel.value].label };
  if (type === "pace") return { value: elements.recognitionPace.value, label: `${Number(elements.recognitionPace.value) / 1000} sec` };
  const selected = elements.bibleVersion.selectedOptions[0];
  return { value: elements.bibleVersion.value, label: (selected?.textContent ?? "Bible").replace("Russian ", "").replace(" · Default", "") };
}

function preferenceOptions(type) {
  if (type === "language") return Object.entries(LANGUAGE).map(([value, item]) => ({ value, label: item.label }));
  const select = type === "model" ? elements.recognitionModel : type === "pace" ? elements.recognitionPace : elements.bibleVersion;
  return [...select.options].map((option) => ({
    value: option.value,
    label: type === "model" ? RECOGNITION_MODELS[option.value].label : type === "pace" ? `${Number(option.value) / 1000} sec` : option.textContent.replace("Russian ", "").replace(" · Default", ""),
  }));
}

const shell = configureUIShell({
  getPreference: preference,
  getPreferenceOptions: preferenceOptions,
  onPreference(type, value) {
    if (type === "language") setLanguage(value);
    else {
      const select = type === "model" ? elements.recognitionModel : type === "pace" ? elements.recognitionPace : elements.bibleVersion;
      select.value = value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
  },
  onSheetOpen(name) { if (name === "transcript") renderTranscripts(); },
  onSheetClose(name) {
    if (name === "mic") void micTest?.stopInput();
    if (name === "feedback") feedbackUI?.close();
  },
});

function setPhase(label, tone = "idle") {
  elements.statusText.textContent = label;
  elements.app.classList.toggle("listening", tone === "active");
  elements.app.classList.toggle("model-loading", tone === "loading");
  elements.app.classList.toggle("error", tone === "error");
}

function renderListenButton() {
  elements.listenBtn.innerHTML = wantsListening ? '<span class="stop-square"></span>Stop listening' : "Start listening";
  elements.heroMic.setAttribute("aria-label", wantsListening ? "Stop listening" : "Start listening");
}

function updateControls() {
  const busy = whisperCleanupPending;
  elements.listenBtn.disabled = busy;
  elements.heroMic.disabled = busy;
  for (const button of elements.languageButtons) button.disabled = wantsListening || busy;
  for (const select of [elements.recognitionModel, elements.recognitionPace, elements.bibleVersion]) select.disabled = wantsListening || busy;
  for (const pill of document.querySelectorAll("[data-pref]")) pill.disabled = wantsListening || busy;
  selectControls.refreshAll();
  renderListenButton();
}

function renderReference(reference) {
  const match = reference.display.match(/^(.*)\s(\d+(?::\d+(?:[–-]\d+)?)?)$/u);
  elements.reference.replaceChildren();
  if (!match) {
    elements.reference.textContent = reference.display;
    return;
  }
  elements.reference.append(document.createTextNode(`${match[1]} `));
  const location = document.createElement("span");
  location.textContent = match[2];
  elements.reference.append(location);
}

function detectedEntry(reference) {
  const source = reference.sourceText?.toLocaleLowerCase(language) ?? "";
  return transcriptHistory.find((entry) => {
    const text = entry.text.toLocaleLowerCase(language);
    return source.includes(text) || text.includes(source);
  }) ?? transcriptHistory[0] ?? null;
}

function reportContext(reference = latestDetected) {
  return captureTranscriptSnapshot(transcriptHistory, "", detector.readContext(), reference);
}

function transcriptRow(entry, animateText) {
  const annotation = transcriptAnnotations.get(entry.text);
  const row = document.createElement("div");
  row.className = `transcript-row${annotation ? " detected" : ""}${entry.text === animateText ? " enter" : ""}`;
  row.lang = language;
  const main = document.createElement("div");
  main.className = "transcript-row-main";
  const text = document.createElement("span");
  text.textContent = entry.text;
  main.append(text);
  if (annotation) {
    const small = document.createElement("small");
    small.textContent = annotation.display;
    main.append(small);
    const meta = document.createElement("div");
    meta.className = "transcript-detection-meta";
    const confidence = document.createElement("span");
    confidence.className = "confidence-pill";
    confidence.textContent = `${Math.round((annotation.score ?? .95) * 100)}%`;
    const flag = document.createElement("button");
    flag.type = "button";
    flag.className = "transcript-flag";
    flag.setAttribute("aria-label", `Report ${annotation.display}`);
    flag.innerHTML = '<svg class="ico"><use href="#flag"/></svg>';
    flag.addEventListener("click", () => feedbackUI.open({
      caught: annotation.canonical ?? annotation.display,
      latestReference: annotation,
      reportContext: reportContext(annotation),
    }, { overlay: true }));
    meta.append(confidence, flag);
    row.append(main, meta);
  } else row.append(main);
  return row;
}

function renderTranscripts(animateText = "") {
  elements.transcriptState.textContent = transcriptFrozen ? "Paused" : wantsListening ? "Running" : "Waiting";
  if (transcriptFrozen) return;
  const entries = transcriptHistory.slice(0, TRANSCRIPT_DISPLAY_LIMIT).reverse();
  elements.transcriptList.replaceChildren(...(entries.length ? entries.map((entry) => transcriptRow(entry, animateText)) : [Object.assign(document.createElement("div"), { className: "empty-state", textContent: "No transcript yet." })]));
  requestAnimationFrame(() => { elements.transcriptViewport.scrollTop = elements.transcriptViewport.scrollHeight; });
}

function resetSessionView() {
  detector.reset();
  liveQuoteDetector.reset();
  transcriptHistory = [];
  transcriptAnnotations.clear();
  latestDetected = null;
  transcriptProgress.update();
  elements.reference.innerHTML = "Ready <span>to listen</span>";
  elements.sourceText.textContent = LANGUAGE[language].ready;
  renderTranscripts();
}

function announceReference(reference) {
  latestDetected = reference;
  const entry = detectedEntry(reference);
  if (entry) transcriptAnnotations.set(entry.text, reference);
  renderReference(reference);
  elements.sourceText.textContent = reference.sourceText ? `“${reference.sourceText}”` : "Verse detected.";
  renderTranscripts(entry?.text ?? "");
  shell.pulseDetected();
  shell.showToast(`${reference.display} detected`);
  if (typeof navigator.vibrate === "function") navigator.vibrate([90, 45, 90]);
}

const liveQuoteDetector = new LiveQuoteDetector({ onReference: announceReference });

export function splitTranscriptSections(text, maximumWords = 18) {
  const words = text.trim().split(/\s+/u).filter(Boolean);
  const sections = [];
  for (let index = 0; index < words.length; index += maximumWords) sections.push(words.slice(index, index + maximumWords).join(" "));
  return sections;
}

function consumeTranscript(text, { reset = false } = {}) {
  const clean = text.trim();
  if (!clean) return [];
  if (reset) detector.reset();
  const sections = splitTranscriptSections(clean);
  transcriptHistory = mergeTranscriptHistory(transcriptHistory, sections);
  renderTranscripts(sections.at(-1));
  const references = detector.consume(clean);
  liveQuoteDetector.markSeen(references);
  liveQuoteDetector.scan(transcriptHistory, language);
  if (references[0]) announceReference(references[0]);
  return references;
}

async function requestWakeLock() {
  if (!("wakeLock" in navigator) || document.visibilityState !== "visible") return;
  try {
    wakeLock = await navigator.wakeLock.request("screen");
    wakeLock.addEventListener("release", () => { wakeLock = null; });
  } catch { wakeLock = null; }
}

function clearModelProgress() {
  elements.app.style.setProperty("--load-progress", "0deg");
}

function renderModelLoading(message, detail = {}) {
  const determinate = Number.isFinite(detail.progress) && !detail.indeterminate;
  const progress = Math.max(0, Math.min(1, detail.progress ?? 0));
  if (determinate) {
    elements.app.style.setProperty("--load-progress", `${progress * 360}deg`);
  } else elements.app.style.setProperty("--load-progress", "0deg");
  setPhase("Loading model", "loading");
  elements.sourceText.textContent = message || "Preparing local transcription…";
}

function stopWhisper() {
  whisperSessionGeneration += 1;
  whisperSession?.stop();
  whisperSession = null;
}

function startWhisper({ model, intervalMs, sessionLanguage }) {
  stopWhisper();
  const generation = whisperSessionGeneration;
  let session = null;
  session = new WhisperSession({
    buffer: rollingAudio,
    model,
    language: sessionLanguage,
    intervalMs,
    onText: consumeTranscript,
    onStatus: (message, tone, detail = {}) => {
      if (generation !== whisperSessionGeneration || session !== whisperSession || !wantsListening) return;
      if (detail.phase === "transcribing") {
        transcriptProgress.update(detail);
        setPhase("Listening", "active");
        return;
      }
      transcriptProgress.update();
      if (tone === "ready") {
        clearModelProgress();
        setPhase("Listening", "active");
        if (!latestDetected) elements.sourceText.textContent = `Listening locally with ${RECOGNITION_MODELS[model].label}…`;
      } else if (tone === "error") {
        clearModelProgress();
        wantsListening = false;
        whisperCleanupPending = true;
        stopWhisper();
        void rollingAudio.stop({ keepAudio: true }).finally(() => { whisperCleanupPending = false; updateControls(); });
        if (wakeLock) { void wakeLock.release().catch(() => {}); wakeLock = null; }
        setPhase("Needs attention", "error");
        elements.sourceText.textContent = `${message} Tap Start listening to retry.`;
        updateControls();
      } else {
        renderModelLoading(message, detail);
      }
    },
  });
  whisperSession = session;
  session.start();
}

async function startListening() {
  if (wantsListening || whisperCleanupPending) return;
  const transition = ++listeningTransition;
  const config = {
    model: elements.recognitionModel.value,
    intervalMs: Number(elements.recognitionPace.value),
    sessionLanguage: language,
  };
  resetSessionView();
  wantsListening = true;
  setPhase("Starting", "active");
  elements.sourceText.textContent = "Opening the microphone…";
  updateControls();
  await micTest?.stopInput();
  if (transition !== listeningTransition || !wantsListening) return;
  try { await rollingAudio.start(); }
  catch {
    if (transition !== listeningTransition || !wantsListening) return;
    wantsListening = false;
    setPhase("Needs attention", "error");
    elements.sourceText.textContent = "The microphone could not be opened. Check browser permission and try again.";
    updateControls();
    return;
  }
  if (transition !== listeningTransition || !wantsListening) { await rollingAudio.stop({ keepAudio: false }); return; }
  await requestWakeLock();
  if (transition !== listeningTransition || !wantsListening) return;
  startWhisper(config);
}

async function stopListening() {
  const transition = ++listeningTransition;
  wantsListening = false;
  whisperCleanupPending = true;
  stopWhisper();
  updateControls();
  await rollingAudio.stop({ keepAudio: true });
  if (transition !== listeningTransition) return;
  whisperCleanupPending = false;
  setPhase("Ready to listen");
  if (!latestDetected) elements.sourceText.textContent = "Listening stopped. Recent audio remains available for feedback.";
  clearModelProgress();
  transcriptProgress.update();
  renderTranscripts();
  updateControls();
  if (wakeLock) { await wakeLock.release().catch(() => {}); wakeLock = null; }
}

function toggleListening() {
  if (wantsListening) void stopListening();
  else void startListening();
}

function setLanguage(next) {
  if (!LANGUAGE[next] || next === language || wantsListening) return;
  language = next;
  localStorage.setItem("verse-language", language);
  detector.setLanguage(language);
  resetSessionView();
  for (const button of elements.languageButtons) {
    const active = button.dataset.language === language;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  }
  populateBibleVersions(elements.bibleVersion, elements.bibleVersionNote, language, localStorage);
  selectControls.refresh("bibleVersion");
  serviceTranscriber.setLanguage(language);
  shell.updatePills();
}

async function createFeedbackReport({ kind, timing, note, requestedAudioSeconds, reportContext: context }) {
  const actualAudioSeconds = Math.min(requestedAudioSeconds, rollingAudio.availableSeconds);
  const id = crypto.randomUUID ? crypto.randomUUID() : `report-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const versionOption = elements.bibleVersion.selectedOptions[0];
  const caught = kind === "missed"
    ? ""
    : context?.latestReference?.canonical ?? context?.latestReference?.display ?? latestDetected?.canonical ?? "";
  return {
    id,
    schemaVersion: 2,
    appVersion: APP_VERSION,
    createdAt: new Date().toISOString(),
    pageUrl: location.href,
    language,
    kind,
    timing,
    expected: "",
    caught,
    note,
    requestedAudioSeconds,
    actualAudioSeconds,
    context: {
      ...(context?.context ?? detector.readContext()),
      feedbackTiming: timing,
      bibleVersion: versionOption?.value ?? "",
      bibleVersionLabel: versionOption?.textContent ?? "",
    },
    latestReference: kind === "missed" ? null : context?.latestReference ?? latestDetected,
    transcripts: reportTranscriptWindow(transcriptHistory, "", context, requestedAudioSeconds),
    browser: navigator.userAgent,
    audioBlob: rollingAudio.createWav(requestedAudioSeconds),
  };
}

function configureTheme() {
  function apply(next) {
    document.documentElement.dataset.theme = next;
    localStorage.setItem("verse-theme", next);
    for (const button of elements.themeButtons) button.classList.toggle("active", button.dataset.themeChoice === next);
    document.querySelector('meta[name="theme-color"]').content = next === "dark" ? "#0d1421" : "#eef3f8";
  }
  for (const button of elements.themeButtons) button.addEventListener("click", () => apply(button.dataset.themeChoice));
  apply(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
}

feedbackUI = configureFeedbackUI({
  elements,
  createReport: createFeedbackReport,
  shell,
  readPreview: () => ({
    caught: latestDetected?.canonical ?? "",
    transcript: transcriptHistory.slice().reverse().map((entry) => entry.text).join("\n\n"),
    audioSeconds: rollingAudio.availableSeconds,
    reportContext: reportContext(),
  }),
  readAudio: (seconds) => rollingAudio.createWav(seconds),
});
micTest = configureMicTest({ beforeStart: async () => { if (wantsListening) await stopListening(); } });
const serviceTranscriber = configureServiceTranscriber({ initialLanguage: language, onReport: (report) => feedbackUI.open(report, { overlay: true }) });
configureMoreMenu(elements, { notify: shell.showToast });
configureTheme();

for (const button of elements.languageButtons) button.addEventListener("click", () => setLanguage(button.dataset.language));
for (const button of elements.languageButtons) {
  const active = button.dataset.language === language;
  button.classList.toggle("active", active);
  button.setAttribute("aria-pressed", String(active));
}
elements.listenBtn.addEventListener("click", toggleListening);
elements.heroMic.addEventListener("click", toggleListening);
elements.reportTranscriptButton.addEventListener("click", () => feedbackUI.open({
  kind: "missed",
  reportContext: reportContext(null),
}, { overlay: true }));
elements.toggleTranscriptPlayback.addEventListener("click", () => {
  transcriptFrozen = !transcriptFrozen;
  elements.toggleTranscriptPlayback.classList.toggle("active", transcriptFrozen);
  elements.toggleTranscriptPlayback.setAttribute("aria-label", transcriptFrozen ? "Resume transcript" : "Pause transcript");
  elements.toggleTranscriptPlayback.querySelector("use").setAttribute("href", transcriptFrozen ? "#play" : "#pause");
  if (!transcriptFrozen) renderTranscripts();
  else elements.transcriptState.textContent = "Paused";
  shell.showToast(transcriptFrozen ? "Transcript paused" : "Transcript resumed");
});
elements.recognitionModel.addEventListener("change", () => {
  localStorage.setItem("verse-recognition-model", elements.recognitionModel.value);
  clearModelProgress();
  shell.updatePills();
});
elements.recognitionPace.addEventListener("change", () => {
  localStorage.setItem("verse-whisper-interval-ms-v2", elements.recognitionPace.value);
  shell.updatePills();
});
elements.bibleVersion.addEventListener("change", () => {
  localStorage.setItem(`verse-bible-version-${language}`, elements.bibleVersion.value);
  shell.updatePills();
});
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && wantsListening) void requestWakeLock(); });
window.addEventListener("pagehide", () => {
  stopWhisper();
  liveQuoteDetector.destroy();
  void rollingAudio.stop({ keepAudio: false });
  void micTest?.destroy();
});

resetSessionView();
selectControls.refreshAll();
shell.updatePills();
updateControls();
void feedbackUI.flush();
if ("serviceWorker" in navigator && window.isSecureContext) window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js?v=26").catch(() => {}));
