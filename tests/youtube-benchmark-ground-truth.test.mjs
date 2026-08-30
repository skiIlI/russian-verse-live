import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { interpretTranscript, VerseCorpusIndex } from "../interpreter.js";

const root = new URL("../", import.meta.url);
const [truth, corpusDocument] = await Promise.all([
  readFile(new URL("tests/fixtures/youtube-benchmark-ground-truth.json", root), "utf8").then(JSON.parse),
  readFile(new URL("data/russyn.json", root), "utf8").then(JSON.parse),
]);
const corpus = new VerseCorpusIndex(corpusDocument);

for (const clip of truth.clips) {
  for (const [model, transcript] of Object.entries(clip.models)) {
    const analysis = await interpretTranscript(transcript, "ru", { corpus, ignoreMusic: true, ignorePrayer: true });
    const actions = analysis.events.map((event) => `${event.type}:${event.reference?.canonical ?? "unresolved"}`);
    assert.deepEqual(actions, clip.expected, `${clip.videoId} ${model} drifted from human-reviewed truth`);
  }
}

console.log("YouTube benchmark truth: 3 clips and 9 model transcripts matched human review");
