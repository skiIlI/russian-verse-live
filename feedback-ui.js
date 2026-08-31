import { flushFeedbackQueue } from "./feedback-api.js?v=26";
import { saveFeedbackReport } from "./feedback-store.js?v=26";

export function configureFeedbackUI({
  elements,
  createReport,
  readPreview,
  readAudio,
  shell,
}) {
  let activeFlush = null;
  let reportContext = null;
  let audioUrl = null;
  let overlayOpen = false;

  function clearAudioPreview() {
    elements.feedbackAudioPreview.pause();
    elements.feedbackAudioPreview.removeAttribute("src");
    elements.feedbackAudioPreview.load();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    audioUrl = null;
  }

  function hideMini() {
    clearAudioPreview();
    elements.feedbackMini.hidden = true;
  }

  function showTranscript() {
    clearAudioPreview();
    const preview = readPreview();
    elements.feedbackMiniTitle.textContent = "Recent transcript";
    elements.feedbackTranscriptPreview.textContent = preview.transcript || "No transcript captured yet.";
    elements.feedbackTranscriptPreview.hidden = false;
    elements.feedbackAudioPreview.hidden = true;
    elements.feedbackAudioEmpty.hidden = true;
    elements.feedbackMini.hidden = false;
  }

  function showAudio() {
    clearAudioPreview();
    const seconds = Number(elements.feedbackDuration.value);
    const audio = readAudio?.(seconds);
    elements.feedbackMiniTitle.textContent = "Recent audio";
    elements.feedbackTranscriptPreview.hidden = true;
    elements.feedbackAudioEmpty.hidden = Boolean(audio);
    elements.feedbackAudioPreview.hidden = !audio;
    if (audio) {
      audioUrl = URL.createObjectURL(audio);
      elements.feedbackAudioPreview.src = audioUrl;
    }
    elements.feedbackMini.hidden = false;
  }

  function announce(message) {
    elements.feedbackDeliveryStatus.textContent = message;
    elements.feedbackDeliveryStatus.hidden = !message;
    shell.showToast(message);
  }

  async function flush({ announceProgress = false } = {}) {
    if (activeFlush) return activeFlush;
    activeFlush = (async () => {
      if (announceProgress) announce("Sending feedback…");
      try {
        const result = await flushFeedbackQueue();
        if (result.remaining) announce("Saved privately — will retry when connected.");
        else if (result.delivered) announce("Feedback sent. Thank you.");
        return result;
      } catch {
        announce("Saved privately — will retry when connected.");
        return { delivered: 0, remaining: 1 };
      } finally {
        activeFlush = null;
      }
    })();
    return activeFlush;
  }

  function updateTimingVisibility() {
    elements.feedbackTimingBlock.hidden = elements.feedbackKind.value !== "late";
  }

  function close() {
    hideMini();
    elements.feedbackLayer.classList.remove("open");
    elements.feedbackLayer.setAttribute("aria-hidden", "true");
    if (!overlayOpen && shell.activeSheet === "feedback") shell.closeSheet();
    overlayOpen = false;
    elements.feedbackSheetHost.append(elements.feedbackFormSurface);
    reportContext = null;
  }

  function open(overrides = {}, { overlay = Boolean(overrides.reportContext) } = {}) {
    const preview = { ...readPreview(), ...overrides };
    reportContext = overrides.reportContext ?? preview.reportContext ?? null;
    elements.feedbackKind.value = preview.kind ?? (reportContext ? "wrong" : "missed");
    elements.feedbackTiming.value = preview.timing ?? "1-2";
    elements.feedbackNote.value = preview.note ?? "";
    elements.feedbackKind.dispatchEvent(new Event("change", { bubbles: true }));
    elements.feedbackTiming.dispatchEvent(new Event("change", { bubbles: true }));
    elements.feedbackDuration.dispatchEvent(new Event("change", { bubbles: true }));
    elements.feedbackStatus.textContent = preview.audioSeconds
      ? `Up to ${Math.min(Number(elements.feedbackDuration.value), preview.audioSeconds).toFixed(1)} seconds of recent audio is ready.`
      : "No microphone audio yet. The recent transcript can still be sent.";
    updateTimingVisibility();
    hideMini();
    overlayOpen = overlay;
    if (overlay) {
      elements.feedbackOverlayHost.append(elements.feedbackFormSurface);
      elements.feedbackLayer.classList.add("open");
      elements.feedbackLayer.setAttribute("aria-hidden", "false");
    } else {
      elements.feedbackSheetHost.append(elements.feedbackFormSurface);
      shell.openSheet("feedback");
    }
    if (reportContext) elements.feedbackNote.focus();
  }

  async function submit(event) {
    event.preventDefault();
    elements.sendFeedbackButton.disabled = true;
    elements.feedbackStatus.textContent = "Saving privately…";
    try {
      const report = await createReport({
        kind: elements.feedbackKind.value,
        timing: elements.feedbackKind.value === "late" ? elements.feedbackTiming.value : "",
        note: elements.feedbackNote.value.trim(),
        requestedAudioSeconds: Number(elements.feedbackDuration.value),
        reportContext,
      });
      await saveFeedbackReport(report);
      elements.feedbackForm.reset();
      close();
      announce("Sending feedback…");
      await flush();
    } catch {
      elements.feedbackStatus.textContent = "Feedback could not be saved. Please try again.";
    } finally {
      elements.sendFeedbackButton.disabled = false;
    }
  }

  elements.feedbackSheetHost.append(elements.feedbackFormSurface);
  elements.reportFeedbackButton.addEventListener("click", () => open({}, { overlay: false }));
  elements.closeFeedbackButton.addEventListener("click", close);
  elements.feedbackBackdrop.addEventListener("click", close);
  elements.feedbackKind.addEventListener("change", updateTimingVisibility);
  elements.feedbackDuration.addEventListener("change", hideMini);
  elements.feedbackForm.addEventListener("submit", (event) => void submit(event));
  for (const button of [elements.recentTranscriptBtn, elements.overlayRecentTranscript]) button.addEventListener("click", showTranscript);
  for (const button of [elements.recentAudioBtn, elements.overlayRecentAudio]) button.addEventListener("click", showAudio);
  window.addEventListener("online", () => void flush({ announceProgress: true }));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && overlayOpen) close(); });
  updateTimingVisibility();
  return { close, flush, open };
}
