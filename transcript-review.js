const ICONS = { context: "◫", open: "↗", read: "●", advance: "→", next: "⇥", previous: "⇤", jump: "↪" };

export function reviewMark(value) {
  return value === "yes" ? "✅ confirmed" : value === "no" ? "❌ incorrect" : "☐ unreviewed";
}

export function buildCompleteReviewPackage({ analysis, transcript, reviews, videoUrl }) {
  const review = (event) => reviewMark(reviews.get(event.id));
  const confirmed = analysis.events.filter((event) => reviews.get(event.id) === "yes").length;
  const incorrect = analysis.events.filter((event) => reviews.get(event.id) === "no").length;
  const unreviewed = analysis.events.length - confirmed - incorrect;
  const readings = analysis.events.filter((event) => event.type === "read");
  return [
    "VERSE DETECTOR · COMPLETE REVIEW PACKAGE",
    `Video: ${videoUrl || "not supplied"}`,
    `Language / corpus: ${analysis.language} · ${analysis.translation}`,
    `Summary: ${analysis.stats.readings} readings · ${analysis.stats.references} references · ${analysis.stats.navigation} moves · ${analysis.stats.uniqueVerses} unique verses`,
    `Manual review: ${confirmed} confirmed · ${incorrect} incorrect · ${unreviewed} unreviewed`,
    "",
    "Please audit every detector event against the timestamped transcript and video. Pay special attention to items marked incorrect or unreviewed.",
    "",
    "VERSES READ",
    ...(readings.length ? readings.map((event) => (
      `${review(event)} · [${event.timestamp ?? "--:--"}] ${event.reference?.canonical ?? "unresolved"} · ${Math.round(event.confidence * 100)}% · ${event.basis}`
    )) : ["No verse readings detected."]),
    "",
    "FULL ACTION TIMELINE",
    ...(analysis.events.length ? analysis.events.map((event) => (
      `${review(event)} · [${event.timestamp ?? "--:--"}] ${ICONS[event.type] ?? "•"} ${event.action} · ${event.reference?.canonical ?? "unresolved"} · ${Math.round(event.confidence * 100)}% · ${event.basis}`
    )) : ["No events detected."]),
    "",
    "FULL TIMESTAMPED TRANSCRIPT",
    transcript.trim(),
  ].join("\n");
}
