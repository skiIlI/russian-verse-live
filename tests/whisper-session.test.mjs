import assert from "node:assert/strict";
import { novelTranscript, resampleTo16Khz } from "../whisper-session.js";

const source = new Float32Array(48_000).map((_, index) => index / 48_000);
const resampled = resampleTo16Khz(source, 48_000);
assert.equal(resampled.length, 16_000);
assert.ok(resampled[8_000] > 0.49 && resampled[8_000] < 0.51);
assert.equal(novelTranscript("И он обратит сердца отцов", "сердца отцов к детям и сердца детей"), "к детям и сердца детей");
assert.equal(novelTranscript("Matthew chapter five", "Matthew chapter six"), "Matthew chapter six");

console.log("Whisper session: resampling and overlap removal passed.");
