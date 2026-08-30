function label(event) {
  if (!event) return "No event detected";
  return `${event.action} · ${event.reference?.canonical ?? "unresolved"}`;
}

export function buildTranscriptReport(analysis, segmentIndex, event = null) {
  const first = Math.max(0, segmentIndex - 2);
  const last = Math.min(analysis.segments.length, segmentIndex + 3);
  const nearby = analysis.segments.slice(first, last);
  const transcript = nearby.map((segment) => {
    const marker = segment.index === segmentIndex ? "▶" : " ";
    return `${marker} ${segment.timestamp ?? `line ${segment.lineNumber}`} ${segment.text}`;
  }).join("\n");
  return {
    kind: event ? "wrong" : "missed",
    caught: event?.reference?.canonical ?? "",
    expected: "",
    note: "",
    transcript,
    audioSeconds: 0,
    reportContext: {
      context: {
        source: "transcript-interpreter",
        eventId: event?.id ?? null,
        eventType: event?.type ?? "missed",
        action: event?.action ?? null,
        basis: event?.basis ?? null,
        confidence: event?.confidence ?? null,
        focalSegmentIndex: segmentIndex,
        focalTimestamp: analysis.segments[segmentIndex]?.timestamp ?? null,
        markedContext: transcript,
      },
      latestReference: event?.reference ?? null,
      transcripts: nearby.map((segment) => ({
        text: segment.text,
        at: segment.timestamp ?? undefined,
      })),
    },
    label: label(event),
  };
}

export function attachTranscriptReport(element, payload, onReport) {
  if (!onReport) return;
  element.title = `${element.title ? `${element.title} · ` : ""}Right-click to report a misconception`;
  element.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    onReport(payload);
  });
}
