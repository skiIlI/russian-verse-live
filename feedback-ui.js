import { flushFeedbackQueue } from "./feedback-api.js?v=5";
import { saveFeedbackReport } from "./feedback-store.js?v=5";

export function configureFeedbackUI({ elements, createReport, readPreview }) {
  let activeFlush = null;
  let statusTimer = null;

  function showDeliveryStatus(message, tone = "info", hideAfter = 0) {
    window.clearTimeout(statusTimer);
    elements.feedbackDeliveryStatus.textContent = message;
    elements.feedbackDeliveryStatus.dataset.tone = tone;
    elements.feedbackDeliveryStatus.hidden = !message;
    if (hideAfter) statusTimer = window.setTimeout(() => { elements.feedbackDeliveryStatus.hidden = true; }, hideAfter);
  }

  async function flush({ announce = false } = {}) {
    if (activeFlush) return activeFlush;
    activeFlush = (async () => {
      if (announce) showDeliveryStatus("Sending feedback…");
      try {
        const result = await flushFeedbackQueue();
        if (result.remaining) showDeliveryStatus("Saved — will retry when connected.", "queued");
        else if (result.delivered) showDeliveryStatus("Feedback sent. Thank you.", "sent", 4_000);
        return result;
      } catch {
        showDeliveryStatus("Saved — will retry when connected.", "queued");
        return { delivered: 0, remaining: 1 };
      } finally {
        activeFlush = null;
      }
    })();
    return activeFlush;
  }

  function open() {
    const preview = readPreview();
    elements.feedbackCaught.value = preview.caught ?? "";
    elements.feedbackTranscriptPreview.textContent = preview.transcript || "No transcript captured yet.";
    elements.feedbackStatus.textContent = preview.audioSeconds
      ? `${Math.min(15, preview.audioSeconds).toFixed(1)} seconds of recent audio will be included.`
      : "No microphone audio yet. You can still send the transcript and correction.";
    elements.feedbackDialog.showModal();
  }

  async function submit(event) {
    event.preventDefault();
    elements.sendFeedbackButton.disabled = true;
    elements.feedbackStatus.textContent = "Saving feedback…";
    try {
      const report = await createReport({
        kind: elements.feedbackKind.value,
        expected: elements.feedbackExpected.value.trim(),
        caught: elements.feedbackCaught.value.trim(),
        note: elements.feedbackNote.value.trim(),
        requestedAudioSeconds: Number(elements.feedbackDuration.value),
      });
      await saveFeedbackReport(report);
      elements.feedbackDialog.close();
      elements.feedbackForm.reset();
      showDeliveryStatus("Sending feedback…");
      await flush();
    } catch {
      elements.feedbackStatus.textContent = "Feedback could not be saved. Please try again.";
    } finally {
      elements.sendFeedbackButton.disabled = false;
    }
  }

  elements.reportFeedbackButton.addEventListener("click", open);
  elements.closeFeedbackButton.addEventListener("click", () => elements.feedbackDialog.close());
  elements.feedbackForm.addEventListener("submit", (event) => void submit(event));
  window.addEventListener("online", () => void flush({ announce: true }));
  return { flush, open };
}
