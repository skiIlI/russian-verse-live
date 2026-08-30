import assert from "node:assert/strict";
import { captionCues, chooseSermonStart, detectorAgreement, formatClock, parseClock, recommendModel, sliceCaptionTranscript, wordErrorRate } from "../transcription-benchmark-core.js";

const transcript = [
  "0:00 [music]",
  "1:00 Аллилуйя молимся Господу",
  "10:00 Откроем Евангелие от Матфея двадцать четвертая глава",
  "10:30 Иисус говорил ученикам о будущем",
  "11:00 Слово Божье живо и действенно",
].join("\n");
assert.equal(parseClock("1:02:03"), 3723);
assert.equal(formatClock(3723), "1:02:03");
assert.equal(captionCues(transcript).length, 5);
assert.match(sliceCaptionTranscript(transcript, 600, 90), /Матфея[\s\S]*Иисус/);
assert.equal(chooseSermonStart(transcript, 60, () => 0), 600);
assert.equal(wordErrorRate("книга пророка малахии", "книга малахией"), 2 / 3);
assert.equal(detectorAgreement([{ type: "read", reference: { canonical: "John 3:16" } }], [{ type: "read", reference: { canonical: "John 3:16" } }]), 1);
assert.match(recommendModel([
  { label: "Base", wer: 0.19, detectorF1: 0.8, runtimeSeconds: 42 },
  { label: "Small", wer: 0.12, detectorF1: 0.8, runtimeSeconds: 94 },
]), /^Base /);

console.log("Transcription benchmark: ranges, sermon selection, and WER passed.");
