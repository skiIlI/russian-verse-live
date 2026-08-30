import { formatConsoleEvent, interpretTranscript } from "./interpreter.js?v=12";
import { buildCompleteReviewPackage } from "./transcript-review.js?v=12";
import { configureYouTubeReview, parseYouTubeVideoId, SERVICE_VIDEO_URL } from "./youtube-review.js?v=12";
import { renderTranscriptTimeline } from "./transcript-timeline.js?v=12";
import { clockTime, configureYouTubeAudioTranscriber } from "./youtube-audio-transcriber.js?v=12";
import { configureTranscriptionBenchmark } from "./transcription-benchmark.js?v=12";

const SERVICE_TRANSCRIPT = "./transcripts/0000 secondsлет назад. Это было вче.txt";
function byId(id) {
  return document.querySelector(`#${id}`);
}

function textOutput(analysis) {
  return [
    `${analysis.stats.readings} readings · ${analysis.stats.references} references · ${analysis.stats.navigation} moves · ${analysis.stats.uniqueVerses} unique verses`,
    `Matching corpus: ${analysis.translation}`,
    "",
    "ACTION TIMELINE",
    ...analysis.events.map(formatConsoleEvent),
  ].join("\n");
}

export function configureTranscriptLab({ initialLanguage = "ru", onReport = null } = {}) {
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
    copyAll: byId("copyCompleteAnalysis"),
    readingCount: byId("analysisReadingCount"),
    referenceCount: byId("analysisReferenceCount"),
    navigationCount: byId("analysisNavigationCount"),
    uniqueCount: byId("analysisUniqueCount"),
    video: byId("serviceVideoReview"),
    videoFrame: byId("serviceVideoFrame"),
    videoLink: byId("serviceVideoLink"),
    videoStatus: byId("serviceVideoStatus"),
    youtubeUrl: byId("analysisYoutubeUrl"),
    youtubeImport: byId("importYoutubeTranscript"),
    youtubeStart: byId("startYoutubeTranscription"),
    youtubeStop: byId("stopYoutubeTranscription"),
    youtubeAudio: byId("youtubeTranscriberAudio"),
    recognitionModel: byId("recognitionModel"),
  };
  const languageButtons = [...document.querySelectorAll(".analysis-language")];
  let language = initialLanguage;
  let analysis = null;
  let analyzedSource = "";
  let analysisTimer = null;
  const reviews = new Map();
  const review = configureYouTubeReview({
    container: elements.video,
    content: elements.content,
    frame: elements.videoFrame,
    link: elements.videoLink,
    status: elements.videoStatus,
  });
  const youtubeTranscriber = configureYouTubeAudioTranscriber({
    audio: elements.youtubeAudio,
    startButton: elements.youtubeStart,
    stopButton: elements.youtubeStop,
    onText: (text, seconds) => {
      const clean = text.trim();
      if (!clean) return;
      elements.input.value += `${elements.input.value.trim() ? "\n" : ""}${clockTime(seconds)} ${clean}`;
      window.clearTimeout(analysisTimer);
      analysisTimer = window.setTimeout(() => void runAnalysis(), 1_500);
    },
    onStatus: setStatus,
    onActiveChange: (active) => { elements.recognitionModel.disabled = active; },
  });
  configureTranscriptionBenchmark({
    youtubeUrl: elements.youtubeUrl,
    language: () => language,
    review,
    onReport,
    setStatus,
  });

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
    const onReview = (eventId, value) => {
      if (reviews.get(eventId) === value) reviews.delete(eventId);
      else reviews.set(eventId, value);
      render();
    };
    renderTranscriptTimeline(elements.output, analysis, review.seek, onReport, reviews, onReview);
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
      const sourceKey = `${language}\u0000${input}`;
      analysis = await interpretTranscript(input, language, {
        ignoreMusic: elements.focus.checked,
        ignorePrayer: elements.focus.checked,
      });
      if (sourceKey !== analyzedSource) reviews.clear();
      analyzedSource = sourceKey;
      elements.copyAll.disabled = false;
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
    review.setExpanded(open);
  });
  for (const button of languageButtons) button.addEventListener("click", () => setLanguage(button.dataset.analysisLanguage));
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
      elements.youtubeUrl.value = SERVICE_VIDEO_URL;
      setLanguage("ru");
      review.show(SERVICE_VIDEO_URL);
      review.setExpanded(true);
      setStatus("Service transcript loaded. Select Detect verses.", "ready");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load the service transcript.", "error");
    } finally {
      elements.load.disabled = false;
    }
  });
  elements.youtubeImport.addEventListener("click", async () => {
    const videoId = parseYouTubeVideoId(elements.youtubeUrl.value);
    if (!videoId) {
      setStatus("Enter a valid YouTube video link.", "error");
      elements.youtubeUrl.focus();
      return;
    }
    elements.youtubeImport.disabled = true;
    setStatus("Importing the available YouTube caption track…", "working");
    try {
      const response = await fetch(`/api/youtube-transcript?videoId=${encodeURIComponent(videoId)}&language=${language}`);
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || `Caption import returned ${response.status}.`);
      elements.input.value = result.transcript;
      review.show(videoId);
      review.setExpanded(true);
      setStatus(`Imported ${result.name || result.language} captions. Detecting verses…`, "ready");
      await runAnalysis();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Caption import failed.";
      setStatus(`${message} Automatic import requires the local Verse Detector server and an accessible caption track.`, "error");
    } finally {
      elements.youtubeImport.disabled = false;
    }
  });
  elements.youtubeStart.addEventListener("click", async () => {
    const videoId = parseYouTubeVideoId(elements.youtubeUrl.value);
    if (!videoId) {
      setStatus("Enter a valid YouTube video link.", "error");
      elements.youtubeUrl.focus();
      return;
    }
    elements.input.value = "";
    reviews.clear();
    analysis = null;
    elements.result.hidden = true;
    review.show(videoId);
    review.setExpanded(true);
    try {
      await youtubeTranscriber.start({ videoId, model: elements.recognitionModel.value, language });
    } catch (error) {
      await youtubeTranscriber.stop();
      setStatus(`${error instanceof Error ? error.message : "YouTube transcription failed."} Use the local Verse Detector server.`, "error");
    }
  });
  elements.analyze.addEventListener("click", runAnalysis);
  elements.copy.addEventListener("click", async () => {
    if (!analysis) return;
    try {
      await navigator.clipboard.writeText(textOutput(analysis));
      setStatus("Current output copied.", "ready");
    } catch {
      setStatus("Copy was blocked by the browser.", "error");
    }
  });
  elements.copyAll.addEventListener("click", async () => {
    if (!analysis) return;
    try {
      await navigator.clipboard.writeText(buildCompleteReviewPackage({
        analysis,
        transcript: elements.input.value,
        reviews,
        videoUrl: elements.videoLink.href,
      }));
      setStatus("Complete transcript, report, timestamps, and review status copied.", "ready");
    } catch {
      setStatus("Copy was blocked by the browser.", "error");
    }
  });

  setLanguage(initialLanguage);
  return { setLanguage };
}
