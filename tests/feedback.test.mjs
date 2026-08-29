import assert from "node:assert/strict";
import { feedbackMetadata, flushFeedbackQueue, submitFeedbackReport } from "../feedback-api.js";

const report = {
  id: "2908c043-5454-461e-88ca-2172a481304a",
  createdAt: "2026-08-28T00:00:00.000Z",
  appVersion: "test",
  language: "en",
  kind: "missed",
  expected: "Matthew 19:20",
  caught: "Mark 19:20",
  note: "test",
  requestedAudioSeconds: 15,
  actualAudioSeconds: 1,
  context: {},
  latestReference: null,
  transcripts: [{ text: "Matthew nineteen twenty" }],
  browser: "node",
  pageUrl: "https://example.invalid",
  schemaVersion: 1,
  audioBlob: new Blob([new Uint8Array([1, 2, 3])], { type: "audio/wav" }),
};

const metadata = feedbackMetadata(report);
assert.equal(metadata.expected, "Matthew 19:20");
assert.equal("audioBlob" in metadata, false);
assert.equal("pageUrl" in metadata, false);

let submittedForm;
const response = await submitFeedbackReport(report, async (_url, init) => {
  submittedForm = init.body;
  return new Response(JSON.stringify({ ok: true, reportId: "server-id" }), {
    headers: { "Content-Type": "application/json" },
    status: 201,
  });
});
assert.equal(response.ok, true);
assert.equal(JSON.parse(submittedForm.get("metadata")).id, report.id);
assert.equal(submittedForm.get("audio").size, 3);

const removed = [];
let attempts = 0;
const firstFlush = await flushFeedbackQueue({
  load: async () => [report, { ...report, id: "422c7b80-a9b9-4c4c-bf41-031616378a80" }],
  remove: async (id) => removed.push(id),
  submit: async () => { attempts += 1; if (attempts === 2) throw new Error("offline"); },
});
assert.deepEqual(firstFlush, { delivered: 1, remaining: 1 });
assert.deepEqual(removed, [report.id]);

await assert.rejects(
  () => submitFeedbackReport(report, async () => new Response("offline", { status: 503 })),
  /Feedback delivery failed/,
);

console.log("Feedback contract: multipart delivery, local retry queue, and successful cleanup present");
