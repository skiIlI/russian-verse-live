export function parseClock(value) {
  const parts = String(value ?? "").trim().split(":").map(Number);
  if (!parts.length || parts.length > 3 || parts.some((part) => !Number.isFinite(part) || part < 0)) return null;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

export function formatClock(value) {
  const seconds = Math.max(0, Math.floor(value));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
    : `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export function captionCues(transcript) {
  return String(transcript ?? "").split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^(\d{1,2}(?::\d{2}){1,2})\s+(.+)$/);
    const seconds = match ? parseClock(match[1]) : null;
    return seconds === null ? [] : [{ seconds, timestamp: match[1], text: match[2].trim() }];
  });
}

export function sliceCaptionTranscript(transcript, start, duration) {
  const end = start + duration;
  return captionCues(transcript)
    .filter((cue) => cue.seconds >= start && cue.seconds < end)
    .map((cue) => `${cue.timestamp} ${cue.text}`)
    .join("\n");
}

export function chooseSermonStart(transcript, duration, random = Math.random) {
  const cues = captionCues(transcript);
  if (!cues.length) return 0;
  const last = cues.at(-1).seconds;
  const candidates = [];
  for (let start = 0; start + duration <= last; start += 60) {
    const window = cues.filter((cue) => cue.seconds >= start && cue.seconds < start + duration);
    const words = window.reduce((total, cue) => total + cue.text.split(/\s+/).length, 0);
    const interruptions = window.filter((cue) => /\[(?:музыка|пение|music|singing)\]|аллилуйя|молим|молиться/iu.test(cue.text)).length;
    candidates.push({ start, score: words - interruptions * 18 });
  }
  const top = candidates.sort((left, right) => right.score - left.score).slice(0, 5);
  return top[Math.min(top.length - 1, Math.floor(random() * top.length))]?.start ?? 0;
}

function words(text) {
  return String(text ?? "").toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

export function wordErrorRate(reference, hypothesis) {
  const expected = words(reference);
  const actual = words(hypothesis);
  if (!expected.length) return actual.length ? 1 : 0;
  let previous = Array.from({ length: actual.length + 1 }, (_, index) => index);
  for (let row = 1; row <= expected.length; row += 1) {
    const current = [row];
    for (let column = 1; column <= actual.length; column += 1) {
      current[column] = Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + Number(expected[row - 1] !== actual[column - 1]),
      );
    }
    previous = current;
  }
  return previous[actual.length] / expected.length;
}

function eventKey(event) {
  const reference = event?.reference?.canonical ?? event?.reference ?? "";
  const family = event?.type === "read" || event?.type === "advance" ? "read" : "reference";
  return reference ? `${family}:${reference}` : "";
}

export function detectorAgreement(expectedEvents, actualEvents) {
  const expected = new Set((expectedEvents ?? []).map(eventKey).filter(Boolean));
  const actual = new Set((actualEvents ?? []).map(eventKey).filter(Boolean));
  if (!expected.size) return actual.size ? 0 : 1;
  const matched = [...actual].filter((key) => expected.has(key)).length;
  const precision = actual.size ? matched / actual.size : 0;
  const recall = matched / expected.size;
  return precision + recall ? 2 * precision * recall / (precision + recall) : 0;
}

export function recommendModel(results) {
  const complete = results.filter((result) => Number.isFinite(result.wer) && !result.error);
  if (!complete.length) return "No model completed successfully.";
  const withDetectorScore = complete.filter((result) => Number.isFinite(result.detectorF1));
  const pool = withDetectorScore.length ? withDetectorScore : complete;
  const bestDetector = withDetectorScore.length ? Math.max(...pool.map((result) => result.detectorF1)) : null;
  const detectorAccurate = bestDetector === null ? pool : pool.filter((result) => result.detectorF1 >= bestDetector - 0.03);
  const bestWer = Math.min(...detectorAccurate.map((result) => result.wer));
  const accurate = detectorAccurate.filter((result) => result.wer <= bestWer + 0.1);
  const winner = [...accurate].sort((left, right) => left.runtimeSeconds - right.runtimeSeconds)[0];
  return `${winner.label} is the best accuracy/speed balance for this selection.`;
}
