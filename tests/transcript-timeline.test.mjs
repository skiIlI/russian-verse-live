import assert from "node:assert/strict";
import { groupSermonSections } from "../transcript-timeline.js";

const analysis = {
  segments: [
    { index: 0, startSeconds: 0, timestamp: "0:00" },
    { index: 1, startSeconds: 20, timestamp: "0:20" },
    { index: 2, startSeconds: 700, timestamp: "11:40" },
  ],
  events: [
    { id: "a", segmentIndex: 0 },
    { id: "b", segmentIndex: 1 },
    { id: "c", segmentIndex: 2 },
  ],
};
assert.deepEqual(groupSermonSections(analysis).map((section) => section.events.map((event) => event.id)), [["a", "b"], ["c"]]);
assert.equal(groupSermonSections({ segments: [], events: [{ id: "x" }] })[0].events[0].id, "x");

console.log("Transcript timeline: sermon gap grouping passed.");
