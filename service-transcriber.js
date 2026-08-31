import { interpretTranscript } from "./interpreter.js?v=26";

export function configureServiceTranscriber({ initialLanguage = "ru", onReport = () => {} } = {}) {
  const input = document.querySelector("#analysisTranscript");
  const count = document.querySelector("#sourceCount");
  const analyze = document.querySelector("#analyzeTranscript");
  const status = document.querySelector("#analysisStatus");
  const report = document.querySelector("#analyzerReport");
  const results = document.querySelector("#analysisOutput");
  const found = document.querySelector("#analysisFoundCount");
  let language = initialLanguage;

  function setLanguage(next) {
    if (["ru", "en"].includes(next)) language = next;
  }

  function reportButton(event, transcript) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "report-flag";
    button.setAttribute("aria-label", `Report ${event.reference.display}`);
    button.innerHTML = '<svg class="ico"><use href="#flag"/></svg>';
    button.addEventListener("click", () => onReport({
      caught: event.reference.display,
      latestReference: event.reference,
      note: "",
      reportContext: {
        capturedAt: Date.now(),
        context: { language, source: "service-transcriber" },
        latestReference: event.reference,
        transcripts: [{ text: transcript, at: new Date().toISOString() }],
      },
    }));
    return button;
  }

  async function run() {
    const transcript = input.value.trim();
    if (!transcript) {
      status.textContent = "Paste a transcript first.";
      status.dataset.tone = "error";
      input.focus();
      return;
    }
    analyze.disabled = true;
    analyze.classList.add("running");
    analyze.textContent = "Analyzing…";
    status.textContent = language === "ru" ? "Loading Russian Synodal fingerprints…" : "Loading the English cross-translation profile…";
    report.hidden = true;
    try {
      const analysis = await interpretTranscript(transcript, language, { ignoreMusic: true, ignorePrayer: true });
      const events = analysis.events.filter((event) => event.reference);
      results.replaceChildren(...events.map((event) => {
        const row = document.createElement("div");
        row.className = "report-item";
        const dot = document.createElement("i");
        const name = document.createElement("strong");
        name.textContent = event.reference.display;
        const confidence = document.createElement("span");
        confidence.className = "report-confidence";
        confidence.textContent = `${Math.round(event.confidence * 100)}%`;
        row.append(dot, name, confidence, reportButton(event, transcript));
        return row;
      }));
      found.textContent = `${events.length} found`;
      report.hidden = false;
      status.textContent = events.length ? `Analysis complete with ${analysis.translation}.` : "Analysis complete. No verse events met the confidence threshold.";
      status.dataset.tone = "ready";
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : "Analysis failed.";
      status.dataset.tone = "error";
    } finally {
      analyze.disabled = false;
      analyze.classList.remove("running");
      analyze.textContent = "Analyze transcript & detect verses";
    }
  }

  input.addEventListener("input", () => { count.textContent = `${input.value.length.toLocaleString()} / 50,000`; });
  analyze.addEventListener("click", () => void run());
  return { setLanguage };
}
