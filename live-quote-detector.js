import { interpretTranscript } from "./interpreter.js?v=26";

export function extractNewQuoteReferences(analysis, seen) {
  const references = [];
  for (const event of analysis.events ?? []) {
    if (!["verse-text-match", "reading-boundary"].includes(event.basis) || !event.reference?.canonical) continue;
    if (seen.has(event.reference.canonical)) continue;
    seen.add(event.reference.canonical);
    references.push({ ...event.reference, sourceText: event.sourceText, confidence: event.confidence });
  }
  return references;
}

export class LiveQuoteDetector {
  constructor({
    onReference,
    minimumIntervalMs = 1_200,
    followIntervalMs = 750,
    followWindowMs = 12_000,
    interpret = interpretTranscript,
  } = {}) {
    this.onReference = onReference;
    this.minimumIntervalMs = minimumIntervalMs;
    this.followIntervalMs = followIntervalMs;
    this.followWindowMs = followWindowMs;
    this.interpret = interpret;
    this.seen = new Set();
    this.timer = null;
    this.pending = null;
    this.busy = false;
    this.nextRunAt = 0;
    this.fastUntil = 0;
    this.revision = 0;
  }

  reset() {
    this.revision += 1;
    this.seen.clear();
    this.fastUntil = 0;
    this.pending = null;
    window.clearTimeout(this.timer);
    this.timer = null;
  }

  markSeen(references) {
    let marked = false;
    for (const reference of references) {
      if (!reference?.canonical) continue;
      this.seen.add(reference.canonical);
      marked = true;
    }
    if (marked) this.enterFollowMode();
  }

  enterFollowMode() {
    const now = Date.now();
    this.fastUntil = now + this.followWindowMs;
    this.nextRunAt = Math.min(this.nextRunAt || now + this.followIntervalMs, now + this.followIntervalMs);
    if (!this.timer) return;
    window.clearTimeout(this.timer);
    this.timer = null;
    this.schedule();
  }

  currentInterval() {
    return Date.now() < this.fastUntil ? this.followIntervalMs : this.minimumIntervalMs;
  }

  scan(entries, language) {
    const text = [...entries].reverse().map((entry) => entry.text).filter(Boolean).join("\n");
    if (!text) return;
    this.pending = { text, language, revision: this.revision };
    this.schedule();
  }

  schedule() {
    if (this.busy || this.timer || !this.pending) return;
    const wait = Math.max(0, this.nextRunAt - Date.now());
    this.timer = window.setTimeout(() => void this.run(), wait);
  }

  async run() {
    this.timer = null;
    const job = this.pending;
    this.pending = null;
    if (!job) return;
    this.busy = true;
    try {
      const analysis = await this.interpret(job.text, job.language);
      if (job.revision !== this.revision) return;
      const references = extractNewQuoteReferences(analysis, this.seen);
      if (references.length) this.enterFollowMode();
      for (const reference of references) this.onReference?.(reference);
    } catch {
      // Spoken-reference parsing remains available if quote matching cannot load.
    } finally {
      this.busy = false;
      this.nextRunAt = Date.now() + this.currentInterval();
      this.schedule();
    }
  }

  destroy() {
    this.reset();
    this.onReference = null;
  }
}
