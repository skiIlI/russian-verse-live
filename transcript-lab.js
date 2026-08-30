import { formatConsoleEvent, interpretTranscript } from "./interpreter.js?v=8";

const SERVICE_TRANSCRIPT = "./transcripts/0000 secondsлет назад. Это было вче.txt";
const EVENT_ICONS = {
  context: "◫",
  open: "↗",
  read: "●",
  advance: "→",
  next: "⇥",
  previous: "⇤",
  jump: "↪",
};

function byId(id) {
  return document.querySelector(`#${id}`);
}

function eventLabel(event) {
  const labels = {
    context: "Context",
    open: "Open",
    read: "Read",
    advance: "Reading moved",
    next: "Spoken next",
    previous: "Spoken previous",
    jump: "Go to verse",
  };
  return `${labels[event.type]} · ${event.reference?.display ?? "unresolved"}`;
}

function aggregateReadings(analysis) {
  const readings = new Map();
  for (const event of analysis.events.filter((candidate) => candidate.type === "read" && candidate.reference)) {
    const key = event.reference.canonical;
    const current = readings.get(key) ?? { reference: event.reference, times: [] };
    current.times.push(event.timestamp ?? "--:--");
    readings.set(key, current);
  }
  return [...readings.values()];
}

function appendText(parent, tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

function renderReport(output, analysis) {
  const fragment = document.createDocumentFragment();
  const corpusNote = document.createElement("p");
  corpusNote.className = "analysis-corpus-note";
  corpusNote.textContent = analysis.language === "ru"
    ? "Quote matching: Russian Synodal Bible · prayer/music filtering active when selected."
    : "NASB-first English profile · public-domain WEB corpus with cross-translation matching.";
  fragment.append(corpusNote);

  const heading = appendText(fragment, "h4", "analysis-output-heading", "Verses read");
  heading.dataset.count = String(analysis.stats.readings);
  const verseList = document.createElement("div");
  verseList.className = "analysis-verse-list";
  const readings = aggregateReadings(analysis);
  if (!readings.length) appendText(verseList, "p", "analysis-empty", "No verse readings met the confidence threshold.");
  for (const reading of readings) {
    const row = document.createElement("div");
    row.className = "analysis-verse-row";
    appendText(row, "strong", "", reading.reference.display);
    appendText(row, "span", "", reading.times.join(", "));
    verseList.append(row);
  }
  fragment.append(verseList);

  appendText(fragment, "h4", "analysis-output-heading", "Action timeline");
  const timeline = document.createElement("div");
  timeline.className = "analysis-event-list";
  if (!analysis.events.length) appendText(timeline, "p", "analysis-empty", "No events detected.");
  for (const event of analysis.events) {
    const row = document.createElement("div");
    row.className = "analysis-event-row";
    row.dataset.type = event.type;
    appendText(row, "span", "analysis-event-icon", EVENT_ICONS[event.type]);
    const copy = document.createElement("span");
    copy.className = "analysis-event-copy";
    appendText(copy, "strong", "", eventLabel(event));
    appendText(copy, "small", "", `${event.timestamp ?? "--:--"} · ${Math.round(event.confidence * 100)}% · ${event.basis}`);
    row.append(copy);
    timeline.append(row);
  }
  fragment.append(timeline);
  output.replaceChildren(fragment);
}

function renderConsole(output, analysis) {
  const pre = document.createElement("pre");
  pre.className = "analysis-console";
  pre.textContent = analysis.events.map(formatConsoleEvent).join("\n") || "No events detected.";
  output.replaceChildren(pre);
}

function renderAnnotated(output, analysis, focusSermons) {
  const eventsBySegment = new Map();
  for (const event of analysis.events) {
    const entries = eventsBySegment.get(event.segmentIndex) ?? [];
    entries.push(event);
    eventsBySegment.set(event.segmentIndex, entries);
  }
  const list = document.createElement("div");
  list.className = "analysis-annotated-list";
  for (const segment of analysis.segments) {
    const events = eventsBySegment.get(segment.index) ?? [];
    const row = document.createElement("div");
    row.className = `analysis-annotation${events.length ? " detected" : ""}`;
    appendText(row, "time", "", segment.timestamp ?? String(segment.lineNumber));
    const body = document.createElement("div");
    appendText(body, "p", "", segment.text);
    const skipped = focusSermons && (segment.isPrayer || segment.isMusic);
    if (skipped) appendText(body, "span", "analysis-skip-badge", segment.isMusic ? "music ignored" : "prayer ignored");
    for (const event of events) appendText(body, "span", `analysis-event-badge ${event.type}`, eventLabel(event));
    row.append(body);
    list.append(row);
  }
  output.replaceChildren(list);
}

function textOutput(analysis, view, focusSermons) {
  if (view === "console") return analysis.events.map(formatConsoleEvent).join("\n");
  if (view === "annotated") {
    const bySegment = new Map();
    for (const event of analysis.events) {
      const entries = bySegment.get(event.segmentIndex) ?? [];
      entries.push(event);
      bySegment.set(event.segmentIndex, entries);
    }
    return analysis.segments.map((segment) => {
      const skipped = focusSermons && (segment.isPrayer || segment.isMusic) ? " [ignored]" : "";
      const events = (bySegment.get(segment.index) ?? []).map((event) => `\n  ↳ ${eventLabel(event)} (${event.action})`).join("");
      return `[${segment.timestamp ?? segment.lineNumber}]${skipped} ${segment.text}${events}`;
    }).join("\n");
  }
  const readings = aggregateReadings(analysis).map((reading) => (
    `${reading.reference.canonical} · ${reading.times.join(", ")}`
  ));
  return [
    `${analysis.stats.readings} readings · ${analysis.stats.references} references · ${analysis.stats.navigation} moves · ${analysis.stats.uniqueVerses} unique verses`,
    `Matching corpus: ${analysis.translation}`,
    "",
    "VERSES READ",
    ...readings,
    "",
    "ACTION TIMELINE",
    ...analysis.events.map(formatConsoleEvent),
  ].join("\n");
}

export function configureTranscriptLab({ initialLanguage = "ru" } = {}) {
  const elements = {
    section: byId("transcriptLabSection"),
    button: byId("transcriptLabButton"),
    content: byId("transcriptLabContent"),
    count: byId("transcriptLabCount"),
    focus: byId("analysisFocusSermons"),
    input: byId("analysisTranscript"),
    load: byId("loadServiceTranscript"),
    analyze: byId("analyzeTranscript"),
    status: byId("analysisStatus"),
    result: byId("analysisResult"),
    output: byId("analysisOutput"),
    copy: byId("copyAnalysisOutput"),
    readingCount: byId("analysisReadingCount"),
    referenceCount: byId("analysisReferenceCount"),
    navigationCount: byId("analysisNavigationCount"),
    uniqueCount: byId("analysisUniqueCount"),
  };
  const languageButtons = [...document.querySelectorAll(".analysis-language")];
  const viewButtons = [...document.querySelectorAll(".analysis-view")];
  let language = initialLanguage;
  let view = "report";
  let analysis = null;

  function setStatus(message, tone = "idle") {
    elements.status.textContent = message;
    elements.status.dataset.tone = tone;
  }

  function setLanguage(next) {
    if (!['ru', 'en'].includes(next)) return;
    language = next;
    for (const button of languageButtons) {
      const active = button.dataset.analysisLanguage === language;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    }
  }

  function render() {
    if (!analysis) return;
    elements.readingCount.textContent = String(analysis.stats.readings);
    elements.referenceCount.textContent = String(analysis.stats.references);
    elements.navigationCount.textContent = String(analysis.stats.navigation);
    elements.uniqueCount.textContent = String(analysis.stats.uniqueVerses);
    elements.count.textContent = `${analysis.stats.events} events`;
    elements.result.hidden = false;
    if (view === "console") renderConsole(elements.output, analysis);
    else if (view === "annotated") renderAnnotated(elements.output, analysis, elements.focus.checked);
    else renderReport(elements.output, analysis);
  }

  async function runAnalysis() {
    const input = elements.input.value.trim();
    if (!input) {
      setStatus("Paste a transcript or load the supplied service first.", "error");
      elements.input.focus();
      return;
    }
    elements.analyze.disabled = true;
    elements.count.textContent = "Working…";
    setStatus(language === "ru" ? "Loading Russian Synodal fingerprints and interpreting…" : "Loading the English cross-translation profile and interpreting…", "working");
    try {
      analysis = await interpretTranscript(input, language, {
        ignoreMusic: elements.focus.checked,
        ignorePrayer: elements.focus.checked,
      });
      render();
      setStatus(`Analyzed ${analysis.stats.lines} transcript lines with ${analysis.translation}.`, "ready");
    } catch (error) {
      elements.count.textContent = "Error";
      setStatus(error instanceof Error ? error.message : "Analysis failed.", "error");
    } finally {
      elements.analyze.disabled = false;
    }
  }

  elements.button.addEventListener("click", () => {
    const open = elements.content.hidden;
    elements.content.hidden = !open;
    elements.section.classList.toggle("open", open);
    elements.button.setAttribute("aria-expanded", String(open));
  });
  for (const button of languageButtons) button.addEventListener("click", () => setLanguage(button.dataset.analysisLanguage));
  for (const button of viewButtons) {
    button.addEventListener("click", () => {
      view = button.dataset.analysisView;
      for (const choice of viewButtons) {
        const active = choice === button;
        choice.classList.toggle("active", active);
        choice.setAttribute("aria-selected", String(active));
      }
      render();
    });
  }
  elements.focus.addEventListener("change", () => {
    if (analysis) void runAnalysis();
  });
  elements.load.addEventListener("click", async () => {
    elements.load.disabled = true;
    setStatus("Loading the supplied August 16 transcript…", "working");
    try {
      const response = await fetch(SERVICE_TRANSCRIPT);
      if (!response.ok) throw new Error(`Transcript returned ${response.status}`);
      elements.input.value = await response.text();
      setLanguage("ru");
      setStatus("Service transcript loaded. Select Detect verses.", "ready");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load the service transcript.", "error");
    } finally {
      elements.load.disabled = false;
    }
  });
  elements.analyze.addEventListener("click", runAnalysis);
  elements.copy.addEventListener("click", async () => {
    if (!analysis) return;
    try {
      await navigator.clipboard.writeText(textOutput(analysis, view, elements.focus.checked));
      setStatus("Current output copied.", "ready");
    } catch {
      setStatus("Copy was blocked by the browser.", "error");
    }
  });

  setLanguage(initialLanguage);
  return { setLanguage };
}
