import { interpretTranscript } from "./interpreter.js?v=11";
import { parseYouTubeVideoId } from "./youtube-review.js?v=11";
import { captionCues, chooseSermonStart, detectorAgreement, formatClock, parseClock, recommendModel, sliceCaptionTranscript, wordErrorRate } from "./transcription-benchmark-core.js?v=11";

const MODELS = [
  { id: "tiny", label: "Whisper Tiny" },
  { id: "base", label: "Whisper Base" },
  { id: "small", label: "Whisper Small" },
  { id: "browser", label: "Browser speech service" },
];

function byId(id) { return document.querySelector(`#${id}`); }

function download(name, contents, type) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function runWorker(model, audio, language, onProgress, registerCancel) {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./whisper-worker.js?v=11", { type: "module" });
    registerCancel(() => { worker.terminate(); reject(new Error("Benchmark stopped.")); });
    const started = performance.now();
    worker.addEventListener("message", (event) => {
      const message = event.data ?? {};
      if (message.type === "progress") onProgress(message.status);
      if (message.type === "ready") {
        const copy = audio.slice();
        worker.postMessage({ type: "transcribe", requestId: 1, model, language, audio: copy.buffer }, [copy.buffer]);
      } else if (message.type === "result") {
        worker.terminate(); registerCancel(null);
        resolve({ text: message.text, runtimeSeconds: (performance.now() - started) / 1_000 });
      } else if (message.type === "error") {
        worker.terminate(); registerCancel(null);
        reject(new Error(message.message));
      }
    });
    worker.addEventListener("error", () => { registerCancel(null); reject(new Error(`${model} worker failed.`)); });
    worker.postMessage({ type: "load", model });
  });
}

export function configureTranscriptionBenchmark({ youtubeUrl, language: readLanguage, review, onReport, setStatus }) {
  const elements = {
    start: byId("benchmarkStart"), duration: byId("benchmarkDuration"), random: byId("benchmarkRandom"),
    usePosition: byId("benchmarkUsePosition"), run: byId("benchmarkRun"), stop: byId("benchmarkStop"),
    play: byId("benchmarkPlay"), audio: byId("benchmarkAudio"), status: byId("benchmarkStatus"),
    results: byId("benchmarkResults"), recommendation: byId("benchmarkRecommendation"),
    exportText: byId("benchmarkExportText"), exportJson: byId("benchmarkExportJson"),
    models: byId("benchmarkModels"),
  };
  let captions = "";
  let report = null;
  let cancelled = false;
  let activeRecognition = null;
  let cancelActiveRun = null;

  function registerCancel(cancel) { cancelActiveRun = cancel; }

  function selectedModels() {
    const selected = new Set([...elements.models.querySelectorAll("input:checked")].map((input) => input.value));
    return MODELS.filter((model) => selected.has(model.id));
  }

  function selection() {
    const videoId = parseYouTubeVideoId(youtubeUrl.value);
    const start = parseClock(elements.start.value);
    const duration = Math.round(Number(elements.duration.value) * 60);
    if (!videoId || start === null || !Number.isFinite(duration) || duration < 60 || duration > 3600) return null;
    return { videoId, start, duration, end: start + duration };
  }

  function clipUrl(current) {
    return `/api/youtube-clip?videoId=${encodeURIComponent(current.videoId)}&start=${current.start}&duration=${current.duration}`;
  }

  async function loadCaptions(current) {
    const response = await fetch(`/api/youtube-transcript?videoId=${encodeURIComponent(current.videoId)}&language=${readLanguage()}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "YouTube captions were unavailable.");
    captions = data.transcript;
    return data;
  }

  async function loadAudio(current) {
    const response = await fetch(clipUrl(current));
    if (!response.ok) throw new Error(await response.text());
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContextClass();
    const buffer = await context.decodeAudioData(await response.arrayBuffer());
    const samples = new Float32Array(buffer.length);
    buffer.copyFromChannel(samples, 0);
    await context.close();
    return samples;
  }

  function render() {
    elements.results.replaceChildren();
    if (!report) return;
    const baseline = document.createElement("article");
    baseline.className = "benchmark-result baseline";
    baseline.innerHTML = `<header><strong>YouTube captions</strong><span>baseline</span></header><p>${report.baseline || "No captions in this range."}</p>`;
    elements.results.append(baseline);
    for (const result of report.results) {
      const card = document.createElement("article");
      card.className = "benchmark-result";
      card.dataset.model = result.model;
      const metrics = result.error ? result.error : `${Math.round(result.wer * 100)}% WER · ${Math.round(result.detectorF1 * 100)}% detector agreement · ${result.runtimeSeconds.toFixed(1)}s`;
      card.innerHTML = `<header><strong>${result.label}</strong><span>${metrics}</span></header><p>${result.text || "No transcript returned."}</p><textarea aria-label="Annotate ${result.label}" placeholder="Add an annotation…">${result.annotation ?? ""}</textarea><div class="benchmark-result-actions"><button type="button" data-mark="yes" aria-pressed="${result.mark === "yes"}">✓</button><button type="button" data-mark="no" aria-pressed="${result.mark === "no"}">×</button><button type="button" data-report>⚑</button></div>`;
      card.querySelector("textarea").addEventListener("input", (event) => { result.annotation = event.target.value; });
      for (const button of card.querySelectorAll("[data-mark]")) button.addEventListener("click", () => { result.mark = button.dataset.mark; render(); });
      card.querySelector("[data-report]").addEventListener("click", () => onReport?.({
        kind: "wrong", expected: report.baseline, caught: result.text, note: result.annotation || `${result.label} benchmark issue`, transcript: `${report.rangeLabel}\n${result.text}`,
        reportContext: { context: { source: "transcription-benchmark", videoId: report.videoId, start: report.start, duration: report.duration, model: result.model, metrics }, transcripts: [{ text: result.text }] },
      }));
      elements.results.append(card);
    }
    elements.recommendation.textContent = recommendModel(report.results);
    elements.exportText.disabled = false;
    elements.exportJson.disabled = false;
  }

  async function runBrowser(current) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) throw new Error("Browser speech recognition is unavailable.");
    elements.audio.src = clipUrl(current);
    elements.audio.hidden = false;
    await elements.audio.play();
    const stream = elements.audio.captureStream?.() ?? elements.audio.mozCaptureStream?.();
    const track = stream?.getAudioTracks()[0];
    if (!track) {
      elements.audio.pause();
      throw new Error("This browser cannot capture media playback.");
    }
    const recognition = new SpeechRecognition();
    activeRecognition = recognition;
    recognition.lang = readLanguage() === "ru" ? "ru-RU" : "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    let text = "";
    const started = performance.now();
    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (callback, value) => {
        if (settled) return;
        settled = true;
        registerCancel(null);
        activeRecognition = null;
        try { recognition.abort(); } catch {}
        callback(value);
      };
      registerCancel(() => finish(reject, new Error("Benchmark stopped.")));
      recognition.onresult = (event) => {
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          if (event.results[index].isFinal) text += ` ${event.results[index][0]?.transcript ?? ""}`;
        }
      };
      recognition.onerror = (event) => finish(reject, new Error(`Browser recognition: ${event.error}.`));
      recognition.onend = () => {
        if (!cancelled && !elements.audio.ended && !elements.audio.paused) {
          try { recognition.start(track); } catch {}
        }
      };
      elements.audio.addEventListener("ended", () => {
        try { recognition.stop(); } catch {}
        finish(resolve, { text: text.trim(), runtimeSeconds: (performance.now() - started) / 1_000 });
      }, { once: true });
      recognition.start(track);
    });
  }

  async function run() {
    const current = selection();
    if (!current) { setStatus("Enter a valid YouTube link, start time, and 1–60 minute duration.", "error"); return; }
    const models = selectedModels();
    if (!models.length) { setStatus("Select at least one transcription model.", "error"); return; }
    cancelled = false;
    elements.run.disabled = true;
    elements.stop.hidden = false;
    elements.status.textContent = "Loading YouTube captions and preparing the selected audio…";
    try {
      await loadCaptions(current);
      const baseline = sliceCaptionTranscript(captions, current.start, current.duration);
      const baselinePlain = captionCues(baseline).map((cue) => cue.text).join(" ");
      const audio = await loadAudio(current);
      report = { schemaVersion: 1, videoId: current.videoId, start: current.start, duration: current.duration, rangeLabel: `${formatClock(current.start)}–${formatClock(current.end)}`, baseline, results: [] };
      const baselineAnalysis = await interpretTranscript(baseline, readLanguage(), { ignoreMusic: true, ignorePrayer: true });
      report.baselineEvents = baselineAnalysis.events;
      render();
      for (const model of models) {
        if (cancelled) break;
        elements.status.textContent = model.id === "browser" ? `Running ${model.label} in real time; the selected audio is playing…` : `Running ${model.label} locally…`;
        try {
          const output = model.id === "browser"
            ? await runBrowser(current)
            : await runWorker(model.id, audio, readLanguage(), (status) => { elements.status.textContent = `${model.label} · ${status}`; }, registerCancel);
          const analysis = await interpretTranscript(output.text, readLanguage(), { ignoreMusic: true, ignorePrayer: true });
          report.results.push({ model: model.id, label: model.label, ...output, wer: wordErrorRate(baselinePlain, output.text), detectorF1: detectorAgreement(report.baselineEvents, analysis.events), events: analysis.events.length, detectorEvents: analysis.events });
        } catch (error) {
          report.results.push({ model: model.id, label: model.label, text: "", runtimeSeconds: 0, wer: null, events: 0, error: error instanceof Error ? error.message : "Model failed." });
        }
        render();
      }
      elements.status.textContent = cancelled ? "Benchmark stopped; completed results are preserved." : "Benchmark complete. Review, annotate, report, or export the results.";
    } catch (error) {
      elements.status.textContent = error instanceof Error ? error.message : "Benchmark failed.";
    } finally {
      registerCancel(null);
      elements.run.disabled = false;
      elements.stop.hidden = true;
    }
  }

  elements.random.addEventListener("click", async () => {
    const current = selection() ?? { videoId: parseYouTubeVideoId(youtubeUrl.value), duration: Math.round(Number(elements.duration.value) * 60) };
    if (!current.videoId) return setStatus("Enter a valid YouTube link first.", "error");
    try { await loadCaptions(current); elements.start.value = formatClock(chooseSermonStart(captions, current.duration)); }
    catch (error) { setStatus(error.message, "error"); }
  });
  elements.usePosition.addEventListener("click", () => { elements.start.value = formatClock(review.getCurrentTime()); });
  elements.play.addEventListener("click", () => { const current = selection(); if (current) { elements.audio.src = clipUrl(current); elements.audio.hidden = false; void elements.audio.play(); } });
  elements.run.addEventListener("click", () => void run());
  elements.stop.addEventListener("click", () => { cancelled = true; elements.audio.pause(); cancelActiveRun?.(); try { activeRecognition?.abort(); } catch {} });
  elements.exportJson.addEventListener("click", () => report && download(`verse-benchmark-${report.videoId}-${report.start}.json`, JSON.stringify(report, null, 2), "application/json"));
  elements.exportText.addEventListener("click", () => report && download(`verse-benchmark-${report.videoId}-${report.start}.txt`, [report.rangeLabel, "", "YOUTUBE CAPTIONS", report.baseline, ...report.results.flatMap((result) => ["", result.label.toUpperCase(), `${Number.isFinite(result.wer) ? `${Math.round(result.wer * 100)}% WER` : result.error}`, result.text, result.annotation ? `Annotation: ${result.annotation}` : ""])].join("\n"), "text/plain"));
  return { stop: () => { cancelled = true; elements.audio.pause(); cancelActiveRun?.(); } };
}
