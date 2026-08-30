import { deleteFeedbackReport, listFeedbackReports } from "./feedback-store.js?v=11";

export const FEEDBACK_ENDPOINT = "https://qufljdidcmezwqwuezkh.supabase.co/functions/v1/verse-feedback";

export function feedbackMetadata(report) {
  const { audioBlob: _audioBlob, pageUrl: _pageUrl, schemaVersion: _schemaVersion, ...metadata } = report;
  return metadata;
}

export async function submitFeedbackReport(report, request = fetch) {
  const form = new FormData();
  form.append("metadata", JSON.stringify(feedbackMetadata(report)));
  if (report.audioBlob?.size) form.append("audio", report.audioBlob, `${report.id}.wav`);
  const response = await request(FEEDBACK_ENDPOINT, { body: form, method: "POST" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Feedback delivery failed (${response.status}).`);
  return body;
}

export async function flushFeedbackQueue({
  load = listFeedbackReports,
  remove = deleteFeedbackReport,
  submit = submitFeedbackReport,
} = {}) {
  const reports = await load();
  let delivered = 0;
  for (const report of reports) {
    try {
      await submit(report);
      await remove(report.id);
      delivered += 1;
    } catch {
      // Keep the full report and audio Blob for the next online retry.
    }
  }
  return { delivered, remaining: reports.length - delivered };
}
