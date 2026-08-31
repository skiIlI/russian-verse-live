export const TRANSCRIPT_RETENTION_SECONDS = 65;
export const TRANSCRIPT_DISPLAY_LIMIT = 8;

function timestampMs(value) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mergeTranscriptHistory(history, texts, at = new Date().toISOString()) {
  const unique = [...new Set(texts.map((text) => text.trim()).filter(Boolean))];
  const cutoff = timestampMs(at) - (TRANSCRIPT_RETENTION_SECONDS * 1_000);
  return [
    ...unique.map((text) => ({ text, at })),
    ...history.filter((entry) => !unique.includes(entry.text) && timestampMs(entry.at) >= cutoff),
  ];
}

export function transcriptWindow(history, seconds, now = Date.now()) {
  const cutoff = now - (Math.max(0, seconds) * 1_000);
  return history.filter((entry) => timestampMs(entry.at) >= cutoff);
}

export function captureTranscriptSnapshot(history, interim, context, latestReference, capturedAt = Date.now()) {
  return {
    capturedAt,
    context,
    latestReference,
    transcripts: [
      ...(interim ? [{ text: interim, at: new Date(capturedAt).toISOString(), interim: true }] : []),
      ...history.map((entry) => ({ ...entry })),
    ],
  };
}

export function reportTranscriptWindow(history, interim, reportContext, seconds, now = Date.now()) {
  if (Number.isFinite(reportContext?.capturedAt)) {
    const combined = [
      ...(interim ? [{ text: interim, at: new Date(now).toISOString(), interim: true }] : []),
      ...history,
      ...(reportContext.transcripts ?? []),
    ];
    const seen = new Set();
    return combined.filter((entry) => {
      if (!entry.text || seen.has(entry.text)) return false;
      seen.add(entry.text);
      return true;
    });
  }
  if (reportContext?.transcripts) return reportContext.transcripts;
  const transcripts = transcriptWindow(history, seconds, now);
  if (interim) transcripts.unshift({ text: interim, at: new Date(now).toISOString(), interim: true });
  return transcripts;
}
