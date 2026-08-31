import type { TranscriptSegment } from "./transcriptInput";
import { matchingTokens, type IndexedVerse, type VerseCorpusIndex } from "./verseCorpus";

type PassageReference = {
  bookId: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
};

type PassageEvent = {
  type: string;
  segmentIndex: number;
  reference: PassageReference | null;
};

export type AnticipatedBoundary = {
  segmentIndex: number;
  verse: IndexedVerse;
  sourceText: string;
  confidence: number;
};

function closeToken(left: string, right: string): boolean {
  if (left === right) return true;
  if (Math.min(left.length, right.length) < 4 || Math.abs(left.length - right.length) > 1) return false;
  let differences = 0;
  let leftIndex = 0;
  let rightIndex = 0;
  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] === right[rightIndex]) {
      leftIndex += 1;
      rightIndex += 1;
      continue;
    }
    differences += 1;
    if (differences > 1) return false;
    if (left.length > right.length) leftIndex += 1;
    else if (right.length > left.length) rightIndex += 1;
    else {
      leftIndex += 1;
      rightIndex += 1;
    }
  }
  return differences + Number(leftIndex < left.length || rightIndex < right.length) <= 1;
}

function containsSequence(tokens: string[], signature: string[]): boolean {
  return tokens.some((_, start) => signature.every((token, offset) => tokens[start + offset] === token));
}

function endingSignature(verse: IndexedVerse, corpus: VerseCorpusIndex): string[] {
  for (let length = 3; length <= Math.min(6, verse.tokens.length); length += 1) {
    const signature = verse.tokens.slice(-length);
    const collisions = corpus.chapter(verse.bookId, verse.chapter)
      .filter((candidate) => candidate.key !== verse.key && containsSequence(candidate.tokens, signature));
    if (collisions.length === 0) return signature;
  }
  return verse.tokens.slice(-Math.min(6, verse.tokens.length));
}

function endingConfidence(signature: string[], observed: string[]): number | null {
  if (signature.length < 3 || observed.length < 3) return null;
  for (let start = 0; start <= observed.length - signature.length; start += 1) {
    let matched = 0;
    for (let offset = 0; offset < signature.length; offset += 1) {
      if (closeToken(signature[offset], observed[start + offset])) matched += 1;
    }
    const required = signature.length <= 3 ? signature.length : signature.length - 1;
    if (matched >= required) return Math.min(0.99, 0.82 + (matched / signature.length) * 0.16);
  }
  return null;
}

export function anticipateReadingBoundaries(
  events: PassageEvent[],
  segments: TranscriptSegment[],
  corpus: VerseCorpusIndex,
): AnticipatedBoundary[] {
  const bySegment = new Map<number, PassageEvent[]>();
  for (const event of events) {
    const entries = bySegment.get(event.segmentIndex) ?? [];
    entries.push(event);
    bySegment.set(event.segmentIndex, entries);
  }

  const boundaries: AnticipatedBoundary[] = [];
  let bookId: string | null = null;
  let chapter: number | null = null;
  let currentVerse: number | null = null;
  let rangeEnd: number | null = null;
  let anchorSegment = -1;
  let passageAnchored = false;

  for (const segment of segments) {
    const segmentEvents = bySegment.get(segment.index) ?? [];
    for (const event of segmentEvents.filter((entry) => ["context", "open", "jump"].includes(entry.type))) {
      if (!event.reference) continue;
      bookId = event.reference.bookId;
      chapter = event.reference.chapter;
      currentVerse = event.reference.verseStart ?? null;
      rangeEnd = event.reference.verseEnd ?? null;
      anchorSegment = segment.index;
      passageAnchored = true;
    }
    for (const event of segmentEvents.filter((entry) => entry.type === "read")) {
      const reference = event.reference;
      if (!reference?.verseStart) continue;
      if (!passageAnchored) continue;
      if (reference.bookId !== bookId || reference.chapter !== chapter || currentVerse === null) {
        bookId = reference.bookId;
        chapter = reference.chapter;
        rangeEnd = null;
      }
      currentVerse = Math.max(currentVerse ?? reference.verseStart, reference.verseStart);
      anchorSegment = Math.min(anchorSegment < 0 ? segment.index : anchorSegment, segment.index);
    }
    if (!passageAnchored || !bookId || !chapter || !currentVerse || segment.index <= anchorSegment) continue;
    if (rangeEnd !== null && currentVerse >= rangeEnd) continue;

    const current = corpus.byKey.get(`${bookId}:${chapter}:${currentVerse}`);
    const next = corpus.byKey.get(`${bookId}:${chapter}:${currentVerse + 1}`);
    if (!current || !next) continue;
    const windowStart = Math.max(0, segment.index - 1);
    const sourceText = segments.slice(windowStart, segment.index + 1).map((entry) => entry.text).join(" ");
    const observed = matchingTokens(sourceText, corpus.language);
    const confidence = endingConfidence(endingSignature(current, corpus), observed);
    if (confidence === null) continue;

    boundaries.push({ segmentIndex: segment.index, verse: next, sourceText, confidence });
    currentVerse = next.verse;
  }
  return boundaries;
}
