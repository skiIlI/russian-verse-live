import { writeFile } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import { extractYouTubeTranscript } from "./youtube-captions.mjs";
import { interpretTranscript, parseTranscript, VerseCorpusIndex } from "../interpreter.js";

const argumentsList = process.argv.slice(2);
const outputIndex = argumentsList.indexOf("--output");
const outputPath = outputIndex >= 0 ? argumentsList.splice(outputIndex, 2)[1] : null;
const includePrayerIndex = argumentsList.indexOf("--include-prayer");
const includePrayer = includePrayerIndex >= 0;
if (includePrayer) argumentsList.splice(includePrayerIndex, 1);
const videoIds = argumentsList.length
  ? argumentsList
  : ["Y5bbaQmyXKI", "8h2Pggc2BQ8", "8CPFj6QO_n8"];

const corpusDocument = JSON.parse(await readFile(new URL("../data/russyn.json", import.meta.url), "utf8"));
const corpus = new VerseCorpusIndex(corpusDocument);

function canonical(event) {
  return event.reference?.canonical ?? "unresolved";
}

function secondsToClock(seconds) {
  const hours = Math.floor(seconds / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  const remainder = Math.floor(seconds % 60);
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function summarize(videoId, transcript, analysis) {
  const segments = parseTranscript(transcript);
  const durationSeconds = segments.at(-1)?.startSeconds ?? 0;
  const counts = analysis.events.reduce((result, event) => {
    result[event.type] = (result[event.type] ?? 0) + 1;
    return result;
  }, {});
  const lowConfidence = analysis.events.filter((event) => event.confidence < 0.7);
  const duplicateReads = analysis.events.filter((event, index, events) => (
    event.type === "read"
    && events.some((candidate, candidateIndex) => (
      candidateIndex < index
      && candidate.type === "read"
      && canonical(candidate) === canonical(event)
      && Math.abs(candidate.seconds - event.seconds) <= 20
    ))
  ));
  return {
    videoId,
    durationSeconds,
    duration: secondsToClock(durationSeconds),
    transcriptSegments: segments.length,
    transcript,
    counts,
    uniqueReferences: new Set(analysis.events.map(canonical).filter((value) => value !== "unresolved")).size,
    lowConfidence: lowConfidence.map((event) => ({
      timestamp: event.timestamp,
      type: event.type,
      reference: canonical(event),
      confidence: event.confidence,
      sourceText: event.sourceText,
    })),
    nearbyDuplicateReads: duplicateReads.map((event) => ({ timestamp: event.timestamp, reference: canonical(event) })),
    events: analysis.events.map((event) => ({
      timestamp: event.timestamp,
      type: event.type,
      reference: canonical(event),
      confidence: event.confidence,
      basis: event.basis,
      sourceText: event.sourceText,
    })),
  };
}

const services = [];
for (const videoId of videoIds) {
  const captions = await extractYouTubeTranscript(videoId, "ru");
  const analysis = await interpretTranscript(captions.transcript, "ru", {
    corpus,
    ignoreMusic: true,
    ignorePrayer: !includePrayer,
  });
  services.push(summarize(videoId, captions.transcript, analysis));
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  includePrayer,
  language: "ru",
  translation: corpusDocument.translation,
  totalDurationSeconds: services.reduce((sum, service) => sum + service.durationSeconds, 0),
  totalSegments: services.reduce((sum, service) => sum + service.transcriptSegments, 0),
  services,
};
const serialized = `${JSON.stringify(report, null, 2)}\n`;
if (outputPath) await writeFile(outputPath, serialized, "utf8");
console.log(outputPath
  ? JSON.stringify({
      outputPath,
      totalDurationSeconds: report.totalDurationSeconds,
      totalSegments: report.totalSegments,
      services: services.map(({ videoId, duration, transcriptSegments, counts, uniqueReferences, lowConfidence }) => ({
        videoId,
        duration,
        transcriptSegments,
        counts,
        uniqueReferences,
        lowConfidence: lowConfidence.length,
      })),
    }, null, 2)
  : serialized);
