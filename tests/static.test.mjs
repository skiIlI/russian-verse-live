import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const [html, app, styles, manifestText, worker, audio, feedback, feedbackApi, feedbackUi, sourceContext, excerpts, moreMenu, micTest, micMeter, micRecording, transcriptLab, youtubeReview, localServer, packageText, interpreter] = await Promise.all([
  read("index.html"),
  read("app.js"),
  read("styles.css"),
  read("manifest.webmanifest"),
  read("service-worker.js"),
  read("audio-ring-buffer.js"),
  read("feedback-store.js"),
  read("feedback-api.js"),
  read("feedback-ui.js"),
  read("source-context.js"),
  read("excerpts.js"),
  read("more-menu.js"),
  read("mic-test.js"),
  read("mic-level-meter.js"),
  read("mic-recording.js"),
  read("transcript-lab.js"),
  read("youtube-review.js"),
  read("scripts/start-local-server.mjs"),
  read("package.json"),
  read("interpreter.js"),
]);
const [timeline, youtubeAudioTranscriber, whisperSession, whisperWorker, youtubeAudioServer] = await Promise.all([
  read("transcript-timeline.js"),
  read("youtube-audio-transcriber.js"),
  read("whisper-session.js"),
  read("whisper-worker.js"),
  read("scripts/youtube-audio.mjs"),
]);
const [benchmark, benchmarkCore, audioCache] = await Promise.all([
  read("transcription-benchmark.js"),
  read("transcription-benchmark-core.js"),
  read("scripts/youtube-audio-cache.mjs"),
]);

assert.match(html, /Start Listening/);
assert.match(html, /Русский/);
assert.match(html, /English/);
assert.match(html, /Report a missed or wrong verse/);
assert.match(html, /Last 15 seconds/);
assert.match(html, /Last 60 seconds/);
assert.match(html, /Download current source context/);
assert.match(html, /Mic &amp; recording test/);
assert.match(html, /role="meter"/);
assert.match(html, /Monitor input/);
assert.match(html, /Stop recording/);
assert.match(html, /Recorded microphone test playback/);
assert.match(html, /Transcript interpreter/);
assert.match(html, /English · NASB profile/);
assert.match(html, /Load Aug 16 service/);
assert.doesNotMatch(html, /data-analysis-view|Console|Annotated/);
assert.match(html, /id="serviceVideoFrame"/);
assert.match(html, /Y5bbaQmyXKI/);
assert.match(html, /id="importYoutubeTranscript"/);
assert.match(html, /id="startYoutubeTranscription"/);
assert.match(html, /Whisper Base · Recommended/);
assert.match(html, /Four-model transcription benchmark/);
assert.match(html, /id="benchmarkExportJson"/);
assert.match(html, /id="benchmarkModels"/);
assert.match(html, /id="copyCompleteAnalysis"/);
assert.match(html, /What was wrong\?/);
assert.doesNotMatch(html, /Download app files|russian-verse-live\.zip|Automation Core/);
assert.match(html, /app\.js\?v=11/);
assert.match(html, /aria-label="Live speech transcript"/);
assert.match(app, /parser\.js\?v=11/);
assert.match(app, /configureTranscriptLab/);
assert.match(app, /new WhisperSession/);
assert.match(app, /ru-RU/);
assert.match(app, /en-US/);
assert.match(app, /recognition\.continuous = true/);
assert.match(app, /interimTranscript = liveLines/);
assert.match(app, /navigator\.vibrate/);
assert.match(app, /request\("screen"\)/);
assert.match(app, /configureFeedbackUI/);
assert.match(app, /configureMicTest/);
assert.match(app, /configureMoreMenu\(elements\)/);
assert.match(app, /await micTest\?\.stopInput/);
assert.match(app, /if \(!wantsListening\)[\s\S]*rollingAudio\.stop/);
assert.match(audio, /getUserMedia/);
assert.match(audio, /createWav/);
assert.match(audio, /maxSeconds = 60/);
assert.match(audio, /startFromTrack/);
assert.match(feedback, /indexedDB\.open/);
assert.doesNotMatch(feedback, /base64DataUrl|issues\/new/);
assert.match(feedbackApi, /functions\/v1\/verse-feedback/);
assert.match(feedbackApi, /flushFeedbackQueue/);
assert.match(feedbackUi, /configureFeedbackUI/);
assert.match(feedbackUi, /Saved — will retry when connected/);
assert.match(moreMenu, /downloadCurrentSourceContext/);
assert.match(micTest, /getUserMedia/);
assert.match(micTest, /Live monitor on/);
assert.match(micTest, /beforeStart/);
assert.match(micMeter, /getFloatTimeDomainData/);
assert.match(micMeter, /visibilitychange/);
assert.match(micRecording, /MediaRecorderClass/);
assert.match(micRecording, /createObjectURL/);
assert.doesNotMatch(html, /Saved feedback|Send to Codex|Save on this device/);
assert.match(sourceContext, /raw\.githubusercontent\.com/);
assert.match(sourceContext, /verse-listener-source-context\.txt/);
assert.match(sourceContext, /tests\/audio-buffer\.test\.mjs/);
assert.match(sourceContext, /tests\/mic-test\.test\.mjs/);
assert.match(sourceContext, /tests\/interpreter\.test\.mjs/);
assert.match(sourceContext, /src\/transcriptInterpreter\.ts/);
assert.match(sourceContext, /youtube-review\.js/);
assert.match(sourceContext, /transcript-feedback\.js/);
assert.match(sourceContext, /transcript-review\.js/);
assert.match(sourceContext, /scripts\/start-local-server\.mjs/);
assert.match(sourceContext, /scripts\/youtube-captions\.mjs/);
assert.match(sourceContext, /scripts\/youtube-audio\.mjs/);
assert.match(sourceContext, /whisper-worker\.js/);
assert.match(sourceContext, /AGENTS\.md/);
assert.match(excerpts, /english-second-timothy-range/);
assert.match(styles, /--blue: #3b82f6/);
assert.match(styles, /--rose: #e11d48/);
assert.match(styles, /--purple: #7c3aed/);
assert.match(transcriptLab, /interpretTranscript/);
assert.match(transcriptLab, /formatConsoleEvent/);
assert.match(transcriptLab, /SERVICE_TRANSCRIPT/);
assert.match(transcriptLab, /configureYouTubeReview/);
assert.match(transcriptLab, /buildCompleteReviewPackage/);
assert.match(transcriptLab, /api\/youtube-transcript/);
assert.match(transcriptLab, /configureYouTubeAudioTranscriber/);
assert.match(timeline, /analysis-timestamp-button/);
assert.match(timeline, /analysis-event-actions/);
assert.match(timeline, /groupSermonSections/);
assert.match(youtubeAudioTranscriber, /captureStream/);
assert.match(youtubeAudioTranscriber, /startFromTrack/);
assert.match(whisperSession, /resampleTo16Khz/);
assert.match(whisperWorker, /automatic-speech-recognition/);
assert.match(whisperWorker, /Xenova\/whisper-base/);
assert.match(youtubeAudioServer, /adaptiveFormats/);
assert.match(benchmark, /selectedModels|runWorker/);
assert.match(benchmark, /benchmarkExportJson/);
assert.match(benchmarkCore, /wordErrorRate/);
assert.match(audioCache, /yt-dlp/);
assert.match(audioCache, /serveClip/);
assert.match(youtubeReview, /seekTo/);
assert.match(youtubeReview, /playVideo/);
assert.match(youtubeReview, /youtube-nocookie\.com/);
assert.match(localServer, /127\.0\.0\.1/);
assert.match(localServer, /4173/);
assert.match(localServer, /api\/youtube-audio/);
assert.equal(JSON.parse(packageText).scripts.start, "node scripts/start-local-server.mjs");
assert.match(interpreter, /NEXT_VERSE/);
assert.match(interpreter, /verse-text-match/);

const manifest = JSON.parse(manifestText);
assert.equal(manifest.display, "standalone");
assert.equal(manifest.start_url, "./?v=11");
assert.match(worker, /verse-listener-v11/);
assert.match(worker, /audio-worklet\.js\?v=11/);
assert.match(worker, /feedback-api\.js\?v=11/);
assert.match(worker, /feedback-ui\.js\?v=11/);
assert.match(worker, /more-menu\.js\?v=11/);
assert.match(worker, /mic-level-meter\.js\?v=11/);
assert.match(worker, /mic-recording\.js\?v=11/);
assert.match(worker, /mic-test\.js\?v=11/);
assert.match(worker, /interpreter\.js\?v=11/);
assert.match(worker, /transcript-lab\.js\?v=11/);
assert.match(worker, /youtube-review\.js\?v=11/);
assert.match(worker, /transcript-feedback\.js\?v=11/);
assert.match(worker, /transcript-review\.js\?v=11/);
assert.match(worker, /transcript-timeline\.js\?v=11/);
assert.match(worker, /transcription-benchmark\.js\?v=11/);
assert.match(worker, /youtube-audio-transcriber\.js\?v=11/);
assert.match(worker, /whisper-session\.js\?v=11/);
assert.match(worker, /whisper-worker\.js\?v=11/);
assert.match(worker, /data\/russyn\.json/);
assert.match(worker, /data\/engwebp\.json/);
assert.match(worker, /fetch\(event\.request\)/);
assert.match(worker, /url\.pathname\.includes\("\/data\/"\)/);

const audioFiles = [
  "malachi-4-5-6.wav",
  "first-corinthians-16-14.wav",
  "mark-10-13.wav",
  "genesis-18-19.wav",
  "luke-12-13.wav",
];
const assetsPath = fileURLToPath(new URL("assets/", root));
await Promise.all(audioFiles.map((file) => access(join(assetsPath, file))));
await Promise.all(["russyn.json", "engwebp.json"].map((file) => access(join(fileURLToPath(new URL("data/", root)), file))));

console.log("Web contract: bilingual PWA, transcript interpreter, mic testing, rolling feedback, shared inbox, and current source export present");
