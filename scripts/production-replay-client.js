import { BibleVerseReferenceDetector } from "../parser.js?v=26";
import { interpretTranscript } from "../interpreter.js?v=26";
import { extractNewQuoteReferences } from "../live-quote-detector.js?v=26";
import { mergeTranscriptHistory } from "../transcript-history.js?v=26";
import { novelTranscript } from "../whisper-session.js?v=26";

const statusElement = document.querySelector("#status");
const progressElement = document.querySelector("#progress");
const detailElement = document.querySelector("#detail");
const SIMULATION_EPOCH = Date.parse("2026-08-31T00:00:00.000Z");

function splitTranscriptSections(text, maximumWords = 18) {
  const words = text.trim().split(/\s+/u).filter(Boolean);
  const sections = [];
  for (let index = 0; index < words.length; index += maximumWords) {
    sections.push(words.slice(index, index + maximumWords).join(" "));
  }
  return sections;
}

function historyText(history) {
  return [...history].reverse().map((entry) => entry.text).filter(Boolean).join("\n");
}

function createWorkerClient(model) {
  const worker = new Worker("../whisper-worker.js?v=26", { type: "module" });
  const pending = new Map();
  let readyResolve;
  let readyReject;
  const ready = new Promise((resolve, reject) => {
    readyResolve = resolve;
    readyReject = reject;
  });
  let device = "unknown";

  worker.addEventListener("message", (event) => {
    const message = event.data ?? {};
    if (message.type === "ready") {
      device = message.device ?? device;
      readyResolve({ device });
      return;
    }
    if (message.type === "result") {
      const job = pending.get(message.requestId);
      if (!job) return;
      pending.delete(message.requestId);
      job.resolve(message.text ?? "");
      return;
    }
    if (message.type === "error") {
      const error = new Error(message.message || "Whisper replay failed.");
      const job = pending.get(message.requestId);
      if (job) {
        pending.delete(message.requestId);
        job.reject(error);
      } else readyReject(error);
    }
  });
  worker.addEventListener("error", () => readyReject(new Error("Whisper replay worker failed.")));
  worker.postMessage({ type: "load", model });

  let requestId = 0;
  return {
    get device() { return device; },
    ready,
    transcribe(audio, language = "ru") {
      requestId += 1;
      const currentId = requestId;
      const result = new Promise((resolve, reject) => pending.set(currentId, { reject, resolve }));
      worker.postMessage({
        type: "transcribe",
        requestId: currentId,
        model,
        language,
        audio: audio.buffer,
      }, [audio.buffer]);
      return result;
    },
    stop() { worker.terminate(); },
  };
}

async function post(path, body) {
  await fetch(path, {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
}

function referenceRow(reference, method, windowId, audioSeconds, availableAt, sourceText) {
  return {
    audioSeconds: Math.round(audioSeconds * 1000) / 1000,
    availableAtAudioSeconds: Math.round(availableAt * 1000) / 1000,
    canonical: reference.canonical,
    confidence: reference.confidence,
    method,
    sourceText: sourceText || reference.sourceText || "",
    windowId,
  };
}

async function run() {
  const config = await fetch("/audit-config.json").then((response) => response.json());
  const worker = createWorkerClient(config.model);
  statusElement.textContent = `Loading ${config.modelLabel}…`;
  const ready = await worker.ready;
  statusElement.textContent = `Replaying with ${config.modelLabel} on ${ready.device}.`;

  const audioContext = new AudioContext({ sampleRate: 16_000 });
  const totalPulls = config.windows.reduce((sum, item) => sum + Math.floor(item.end - item.start), 0);
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    videoId: config.videoId,
    model: config.model,
    modelLabel: config.modelLabel,
    device: ready.device,
    cadenceSeconds: 1,
    windowSeconds: config.windowSeconds,
    productionSingleFlight: true,
    truthMethod: config.method,
    windows: [],
  };
  let processedPulls = 0;
  let lastStatusAt = 0;

  for (const item of config.windows) {
    const encoded = await fetch(item.audioUrl).then((response) => {
      if (!response.ok) throw new Error(`Audio clip ${item.id} returned ${response.status}.`);
      return response.arrayBuffer();
    });
    const decoded = await audioContext.decodeAudioData(encoded);
    const samples = new Float32Array(decoded.getChannelData(0));
    const sampleRate = decoded.sampleRate;
    const detector = new BibleVerseReferenceDetector("ru");
    const quoteSeen = new Set();
    let history = [];
    let previousRaw = "";
    let cursorSeconds = 1;
    const windowReport = {
      id: item.id,
      start: item.start,
      end: item.end,
      expected: item.expected,
      chunks: [],
      detections: [],
    };
    report.windows.push(windowReport);

    while (cursorSeconds <= decoded.duration + 0.001) {
      const endSample = Math.min(samples.length, Math.floor(cursorSeconds * sampleRate));
      const startSample = Math.max(0, endSample - Math.floor(config.windowSeconds * sampleRate));
      const audio = samples.slice(startSample, endSample);
      if (audio.length < sampleRate) {
        cursorSeconds += 1;
        continue;
      }

      const inferenceStartedAt = performance.now();
      const rawText = (await worker.transcribe(audio, "ru")).trim();
      const inferenceSeconds = (performance.now() - inferenceStartedAt) / 1000;
      const novelText = novelTranscript(previousRaw, rawText);
      previousRaw = rawText;
      const audioSeconds = item.start + cursorSeconds;
      const availableAt = audioSeconds + inferenceSeconds;
      const chunk = {
        audioSeconds: Math.round(audioSeconds * 1000) / 1000,
        inferenceSeconds: Math.round(inferenceSeconds * 1000) / 1000,
        novelText,
        rawText,
      };
      windowReport.chunks.push(chunk);

      if (novelText) {
        const at = new Date(SIMULATION_EPOCH + (audioSeconds * 1000)).toISOString();
        history = mergeTranscriptHistory(history, splitTranscriptSections(novelText), at);
        const spoken = detector.consume(novelText, SIMULATION_EPOCH + (audioSeconds * 1000));
        for (const reference of spoken) quoteSeen.add(reference.canonical);
        windowReport.detections.push(...spoken.map((reference) => (
          referenceRow(reference, "spoken-reference", item.id, audioSeconds, availableAt, novelText)
        )));

        const quoteStartedAt = performance.now();
        const analysis = await interpretTranscript(historyText(history), "ru");
        const quoteSeconds = (performance.now() - quoteStartedAt) / 1000;
        const quoted = extractNewQuoteReferences(analysis, quoteSeen);
        windowReport.detections.push(...quoted.map((reference) => (
          referenceRow(reference, "verse-text-match", item.id, audioSeconds, availableAt + quoteSeconds, reference.sourceText)
        )));
      }

      processedPulls += 1;
      progressElement.value = processedPulls;
      progressElement.max = totalPulls;
      detailElement.textContent = `${item.id} · ${processedPulls.toLocaleString()} / ${totalPulls.toLocaleString()} pulls`;
      if (performance.now() - lastStatusAt > 5_000) {
        lastStatusAt = performance.now();
        await post("/audit-status", {
          device: worker.device,
          totalPulls,
          processedPulls,
          windowId: item.id,
          audioSeconds,
        });
      }

      cursorSeconds += Math.max(1, inferenceSeconds);
    }
  }

  worker.stop();
  await audioContext.close();
  await post("/audit-result", { ok: true, report });
  statusElement.textContent = "Automated replay complete.";
}

run().catch(async (error) => {
  statusElement.textContent = error instanceof Error ? error.message : "Automated replay failed.";
  await post("/audit-result", {
    ok: false,
    error: error instanceof Error ? error.stack || error.message : String(error),
  }).catch(() => {});
});
