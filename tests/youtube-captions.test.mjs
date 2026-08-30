import assert from "node:assert/strict";
import { captionEventsToTranscript, extractYouTubeTranscript, parseCaptionTracks } from "../scripts/youtube-captions.mjs";

const tracks = [{ baseUrl: "https://www.youtube.com/api/timedtext?v=test", languageCode: "ru", name: { simpleText: "Russian" } }];
assert.deepEqual(parseCaptionTracks(`<script>{"captionTracks":${JSON.stringify(tracks)},"audioTracks":[]}</script>`), tracks);
assert.equal(captionEventsToTranscript({ events: [
  { tStartMs: 3_000, segs: [{ utf8: "Милости Твоей, " }, { utf8: "Господи" }] },
  { tStartMs: 65_000, segs: [{ utf8: "полна земля" }] },
]}), "0:03 Милости Твоей, Господи\n1:05 полна земля");

const responses = [
  new Response(`<script>{"captionTracks":${JSON.stringify(tracks)}}</script>`),
  Response.json({ events: [{ tStartMs: 3_000, segs: [{ utf8: "Милости Твоей, Господи, полна земля" }] }] }),
];
const imported = await extractYouTubeTranscript("Y5bbaQmyXKI", "ru", async () => responses.shift());
assert.equal(imported.videoId, "Y5bbaQmyXKI");
assert.match(imported.transcript, /^0:03 Милости/);

console.log("YouTube captions: track discovery, caption formatting, and import passed");
