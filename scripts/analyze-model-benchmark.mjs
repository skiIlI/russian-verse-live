import { readFile, writeFile } from "node:fs/promises";
import { interpretTranscript } from "../interpreter.js";
import { captionCues, detectorAgreement, recommendModel, sliceCaptionTranscript, wordErrorRate } from "../transcription-benchmark-core.js";

const nativeFetch = globalThis.fetch;
globalThis.fetch = (input, init) => nativeFetch(
  typeof input === "string" && input.startsWith("./") ? `http://127.0.0.1:4173/${input.slice(2)}` : input,
  init,
);

const [reportPath, videoId = "Y5bbaQmyXKI"] = process.argv.slice(2);
if (!reportPath) throw new Error("Usage: node scripts/analyze-model-benchmark.mjs <report.json> [videoId]");
const report = JSON.parse(await readFile(reportPath, "utf8"));

function normalizeOversizedMinuteClocks(transcript) {
  return String(transcript ?? "").split(/\r?\n/).map((line) => line.replace(/^(\d{3,}):(\d{2})(?=\s)/, (_, minutesText, seconds) => {
    const minutes = Number(minutesText);
    return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}:${seconds}`;
  })).join("\n");
}
const response = await fetch(`http://127.0.0.1:4173/api/youtube-transcript?videoId=${encodeURIComponent(videoId)}&language=ru`);
if (!response.ok) throw new Error(`Caption import returned ${response.status}.`);
const captions = await response.json();
report.schemaVersion = 1;
report.videoId = videoId;
report.baseline = sliceCaptionTranscript(captions.transcript, report.start, report.duration);
const baselinePlain = captionCues(report.baseline).map((cue) => cue.text).join(" ");
const baselineAnalysis = await interpretTranscript(report.baseline, "ru", { ignoreMusic: true, ignorePrayer: true });
report.baselineDetectorEvents = baselineAnalysis.events;
for (const result of report.results) {
  result.timestamped = normalizeOversizedMinuteClocks(result.timestamped);
  const analysis = await interpretTranscript(result.timestamped, "ru", { ignoreMusic: true, ignorePrayer: true });
  result.label = `Whisper ${result.model[0].toUpperCase()}${result.model.slice(1)}`;
  result.wer = wordErrorRate(baselinePlain, result.text);
  result.realtimeFactor = result.runtimeSeconds / report.duration;
  result.detectorEvents = analysis.events;
  result.detectorF1 = detectorAgreement(report.baselineDetectorEvents, analysis.events);
  result.events = analysis.events.length;
}
report.recommendation = recommendModel(report.results);
await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify({
  recommendation: report.recommendation,
  baselineEvents: report.baselineDetectorEvents.map((event) => `${event.type}:${event.reference?.canonical}`),
  results: report.results.map((result) => ({ model: result.model, runtimeSeconds: result.runtimeSeconds, wer: result.wer, detectorF1: result.detectorF1, events: result.detectorEvents.map((event) => `${event.type}:${event.reference?.canonical}`) })),
}, null, 2));
