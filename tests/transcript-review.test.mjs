import assert from "node:assert/strict";
import { buildCompleteReviewPackage, reviewMark } from "../transcript-review.js";

const event = { id: "read-1", type: "read", timestamp: "3:00", action: "VERSE_READ", reference: { canonical: "Psalms 118:64" }, confidence: 0.94, basis: "verse-text-match" };
const output = buildCompleteReviewPackage({
  analysis: { language: "ru", translation: "Russian Synodal Bible", stats: { readings: 1, references: 0, navigation: 0, uniqueVerses: 1 }, events: [event] },
  transcript: "3:00 Милости Твоей, Господи, полна земля",
  reviews: new Map([[event.id, "no"]]),
  videoUrl: "https://www.youtube.com/watch?v=Y5bbaQmyXKI",
});
assert.equal(reviewMark("yes"), "✅ confirmed");
assert.match(output, /❌ incorrect · \[3:00\] Psalms 118:64/);
assert.match(output, /FULL TIMESTAMPED TRANSCRIPT[\s\S]*3:00 Милости/);

console.log("Transcript review: manual status and complete review package passed");
