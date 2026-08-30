import assert from "node:assert/strict";
import { chooseAudioFormat, resolveYouTubeAudio } from "../scripts/youtube-audio.mjs";

assert.equal(chooseAudioFormat([
  { url: "aac", mimeType: "audio/mp4; codecs=\"mp4a.40.2\"", bitrate: 128000 },
  { url: "opus", mimeType: "audio/webm; codecs=\"opus\"", bitrate: 96000 },
]).url, "aac");

const calls = [];
const result = await resolveYouTubeAudio("Y5bbaQmyXKI", async (url, options = {}) => {
  calls.push({ url: String(url), options });
  if (calls.length === 1) return { ok: true, text: async () => '"INNERTUBE_API_KEY":"test-key"' };
  return {
    ok: true,
    json: async () => ({
      playabilityStatus: { status: "OK" },
      videoDetails: { title: "Service" },
      streamingData: { adaptiveFormats: [{ url: "https://audio.example/test", mimeType: "audio/webm; codecs=\"opus\"", bitrate: 96000 }] },
    }),
  };
});
assert.equal(result.url, "https://audio.example/test");
assert.match(result.mimeType, /^audio\/webm/);
assert.equal(result.title, "Service");
assert.match(calls[1].options.body, /"clientName":"ANDROID"/);
await assert.rejects(() => resolveYouTubeAudio("bad"), /valid YouTube/);

console.log("YouTube audio resolver tests passed.");
