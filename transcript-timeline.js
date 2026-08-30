import { attachTranscriptReport, buildTranscriptReport } from "./transcript-feedback.js?v=13";

const EVENT_ICONS = {
  context: "◫",
  open: "↗",
  read: "●",
  advance: "→",
  next: "⇥",
  previous: "⇤",
  jump: "↪",
};

const EVENT_LABELS = {
  context: "Context",
  open: "Open",
  read: "Read",
  advance: "Reading moved",
  next: "Spoken next",
  previous: "Spoken previous",
  jump: "Go to verse",
};

function appendText(parent, tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

function eventLabel(event) {
  return `${EVENT_LABELS[event.type]} · ${event.reference?.display ?? "unresolved"}`;
}

function appendTimestamp(parent, timestamp, onSeek) {
  if (!timestamp) return appendText(parent, "span", "analysis-timestamp-missing", "--:--");
  const button = appendText(parent, "button", "analysis-timestamp-button", timestamp);
  button.type = "button";
  button.setAttribute("aria-label", `Play service video at ${timestamp}`);
  button.addEventListener("click", () => onSeek(timestamp));
  return button;
}

function appendEventActions(parent, event, report, reviews, onReview, onReport) {
  const group = document.createElement("span");
  group.className = "analysis-event-actions";
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", `Review ${event.reference?.display ?? event.action}`);
  const actions = [
    { className: "report", icon: "⚑", label: "Report this event" },
    { className: "yes", icon: "✓", label: "Mark correct", review: "yes" },
    { className: "no", icon: "×", label: "Mark incorrect", review: "no" },
  ];
  for (const action of actions) {
    const button = appendText(group, "button", action.className, action.icon);
    button.type = "button";
    button.title = action.label;
    button.setAttribute("aria-label", action.label);
    if (action.review) {
      button.dataset.review = action.review;
      button.setAttribute("aria-pressed", String(reviews.get(event.id) === action.review));
      button.addEventListener("click", () => onReview(event.id, action.review));
    } else {
      button.addEventListener("click", () => onReport?.(report));
    }
  }
  parent.append(group);
}

function renderEvent(event, analysis, onSeek, onReport, reviews, onReview) {
  const row = document.createElement("div");
  row.className = "analysis-event-row";
  row.dataset.type = event.type;
  appendTimestamp(row, event.timestamp, onSeek);
  appendText(row, "span", "analysis-event-icon", EVENT_ICONS[event.type]);
  const copy = document.createElement("span");
  copy.className = "analysis-event-copy";
  appendText(copy, "strong", "", eventLabel(event));
  appendText(copy, "small", "", `${Math.round(event.confidence * 100)}% confidence · ${event.basis}`);
  row.append(copy);
  const report = buildTranscriptReport(analysis, event.segmentIndex, event);
  attachTranscriptReport(row, report, onReport);
  appendEventActions(row, event, report, reviews, onReview, onReport);
  return row;
}

export function groupSermonSections(analysis, gapSeconds = 10 * 60) {
  const timed = analysis.segments.filter((segment) => segment.startSeconds !== null);
  if (!timed.length) return [{ events: analysis.events, start: null, end: null }];
  const ranges = [];
  let start = timed[0];
  let previous = timed[0];
  for (const segment of timed.slice(1)) {
    if (segment.startSeconds - previous.startSeconds >= gapSeconds) {
      ranges.push({ start, end: previous });
      start = segment;
    }
    previous = segment;
  }
  ranges.push({ start, end: previous });
  return ranges.map((range) => ({
    start: range.start.timestamp,
    end: range.end.timestamp,
    events: analysis.events.filter((event) => (
      event.segmentIndex >= range.start.index && event.segmentIndex <= range.end.index
    )),
  })).filter((section) => section.events.length);
}

function appendEvents(parent, events, analysis, onSeek, onReport, reviews, onReview) {
  const list = document.createElement("div");
  list.className = "analysis-event-list";
  for (const event of events) list.append(renderEvent(event, analysis, onSeek, onReport, reviews, onReview));
  parent.append(list);
}

export function renderTranscriptTimeline(output, analysis, onSeek, onReport, reviews, onReview) {
  const fragment = document.createDocumentFragment();
  const corpusNote = appendText(fragment, "p", "analysis-corpus-note", analysis.language === "ru"
    ? "Russian Synodal matching · prayers and music are ignored when Focus is selected."
    : "English cross-translation matching · prayers and music are ignored when Focus is selected.");
  corpusNote.dataset.corpus = analysis.corpusId;
  appendText(fragment, "h4", "analysis-output-heading", "Action timeline");
  if (!analysis.events.length) {
    appendText(fragment, "p", "analysis-empty", "No verse events met the confidence threshold.");
    output.replaceChildren(fragment);
    return;
  }
  const sections = groupSermonSections(analysis);
  if (sections.length <= 1) {
    appendEvents(fragment, analysis.events, analysis, onSeek, onReport, reviews, onReview);
  } else {
    const sectionList = document.createElement("div");
    sectionList.className = "analysis-sermon-sections";
    sections.forEach((section, index) => {
      const details = document.createElement("details");
      details.className = "analysis-sermon-section";
      details.open = index === 0;
      const range = section.start === section.end ? section.start : `${section.start}–${section.end}`;
      appendText(details, "summary", "", `Sermon ${index + 1} · ${range} · ${section.events.length} events`);
      appendEvents(details, section.events, analysis, onSeek, onReport, reviews, onReview);
      sectionList.append(details);
    });
    fragment.append(sectionList);
  }
  output.replaceChildren(fragment);
}
