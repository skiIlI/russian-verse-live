export type TranscriptSegment = {
  index: number;
  lineNumber: number;
  timestamp: string | null;
  startSeconds: number | null;
  text: string;
  raw: string;
  isMusic: boolean;
  isPrayer: boolean;
};

const CLOCK_PREFIX = /^(\d{1,2}(?::\d{2}){1,2})/;
const SPOKEN_DURATION = /^(?:(?:\d+\s+hours?)(?:,\s*)?)?(?:(?:\d+\s+minutes?)(?:,\s*)?)?(?:\d+\s+seconds?)?/i;
const MUSIC_MARKERS = /\[(?:music|singing|song|музыка|пение|песня)\]/i;
const PRAYER_START = /давайте.*(?:помол|молит)|сейчас.{0,28}(?:будем\s+)?молит|(?:встан|стан)\p{L}*.{0,45}(?:помол|просить\s+благослов)|ми\s+будемо\s+молитися|склон\p{L}*.{0,25}колен|отче\s+наш|our\s+father|let\s+us\s+pray|bow.{0,24}(?:head|knee)/iu;
const PRAYER_END = /(?:(?:^|\s)(?:аминь|amen)[.!?]*(?:\s+(?:не|ne)[.!?]*)?$)|(?:(?:^|\s)аминь[.!?]?.*(?:садит|присяд|sit\s+down))/iu;

function soundsLikePrayer(text: string): boolean {
  const invocations = text.match(/(?:^|[^\p{L}])(?:господ\p{L}*|боже|бог\p{L}*|lord|god)(?=$|[^\p{L}])/giu)?.length ?? 0;
  return invocations >= 2 && /просим|молим|благодарим|благослови|слава\s+тебе|we\s+(?:ask|pray|thank)|please\s+bless/iu.test(text);
}

export function clockToSeconds(clock: string): number | null {
  const parts = clock.split(":").map(Number);
  if (parts.some((part) => !Number.isFinite(part))) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

export function formatClock(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return "--:--";
  const whole = Math.max(0, Math.round(seconds));
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const remainder = whole % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
    : `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function removeTranscriptPrefix(raw: string): { timestamp: string | null; startSeconds: number | null; text: string } {
  const clock = raw.match(CLOCK_PREFIX)?.[1] ?? null;
  if (!clock) return { timestamp: null, startSeconds: null, text: raw.trim() };
  let remainder = raw.slice(clock.length);
  const duration = remainder.match(SPOKEN_DURATION)?.[0] ?? "";
  if (/\d+\s+(?:hours?|minutes?|seconds?)/i.test(duration)) remainder = remainder.slice(duration.length);
  return { timestamp: clock, startSeconds: clockToSeconds(clock), text: remainder.trim() };
}

export function parseTranscript(input: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  let prayerMode = false;
  for (const [lineIndex, rawLine] of input.replace(/^\uFEFF/, "").split(/\r?\n/).entries()) {
    const raw = rawLine.trim();
    if (!raw || /^https?:\/\//i.test(raw)) continue;
    const parsed = removeTranscriptPrefix(raw);
    if (!parsed.text) continue;
    if (PRAYER_START.test(parsed.text) || soundsLikePrayer(parsed.text)) prayerMode = true;
    const isPrayer = prayerMode;
    segments.push({
      index: segments.length,
      lineNumber: lineIndex + 1,
      timestamp: parsed.timestamp,
      startSeconds: parsed.startSeconds,
      text: parsed.text,
      raw,
      isMusic: MUSIC_MARKERS.test(parsed.text),
      isPrayer,
    });
    if (prayerMode && PRAYER_END.test(parsed.text)) prayerMode = false;
  }
  return segments;
}
