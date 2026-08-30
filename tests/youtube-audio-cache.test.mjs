import assert from "node:assert/strict";
import { parseByteRange } from "../scripts/youtube-audio-cache.mjs";

assert.deepEqual(parseByteRange("bytes=0-99", 1000), { start: 0, end: 99 });
assert.deepEqual(parseByteRange("bytes=500-", 1000), { start: 500, end: 999 });
assert.deepEqual(parseByteRange("bytes=-100", 1000), { start: 900, end: 999 });
assert.equal(parseByteRange("bytes=1000-", 1000), null);

console.log("YouTube audio cache: byte ranges passed.");
