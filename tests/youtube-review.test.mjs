import assert from "node:assert/strict";
import { parseTimestamp, parseYouTubeVideoId, SERVICE_VIDEO_ID, SERVICE_VIDEO_URL } from "../youtube-review.js";

assert.equal(parseTimestamp("1:43"), 103);
assert.equal(parseTimestamp("42:40"), 2_560);
assert.equal(parseTimestamp("1:38:25"), 5_905);
assert.equal(parseTimestamp("0:00"), 0);
assert.equal(parseTimestamp("1:60"), null);
assert.equal(parseTimestamp("not a timestamp"), null);
assert.equal(SERVICE_VIDEO_ID, "Y5bbaQmyXKI");
assert.match(SERVICE_VIDEO_URL, /youtube\.com\/watch\?v=Y5bbaQmyXKI/);
assert.equal(parseYouTubeVideoId("https://youtu.be/Y5bbaQmyXKI?t=180"), SERVICE_VIDEO_ID);
assert.equal(parseYouTubeVideoId("https://www.youtube.com/watch?v=Y5bbaQmyXKI"), SERVICE_VIDEO_ID);
assert.equal(parseYouTubeVideoId("https://www.youtube.com/shorts/Y5bbaQmyXKI"), SERVICE_VIDEO_ID);
assert.equal(parseYouTubeVideoId("https://example.com/watch?v=Y5bbaQmyXKI"), null);

console.log("YouTube review: timestamp parsing and service-video identity passed");
