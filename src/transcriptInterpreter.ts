import { BibleVerseReferenceDetector, type VerseReference } from "./bibleVerseParser";
import { BOOKS, type SupportedLanguage } from "./bookDefinitions";
import { detectNavigationIntent } from "./navigationDetector";
import { matchQuotedVerses, type SegmentContext, type VerseQuoteMatch } from "./quoteMatcher";
import { formatClock, parseTranscript, type TranscriptSegment } from "./transcriptInput";
import { loadVerseCorpus, type IndexedVerse, type VerseCorpusIndex } from "./verseCorpus";

export type InterpreterEventType = "context" | "open" | "read" | "advance" | "next" | "previous" | "jump";
export type InterpreterAction = "SET_CONTEXT" | "OPEN_VERSE" | "VERSE_READ" | "NEXT_VERSE" | "PREVIOUS_VERSE" | "GO_TO_VERSE";
export type EventReference = {
  bookId: string;
  book: string;
  canonicalBook: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
  display: string;
  canonical: string;
};

export type InterpreterEvent = {
  id: string;
  type: InterpreterEventType;
  action: InterpreterAction;
  segmentIndex: number;
  lineNumber: number;
  timestamp: string | null;
  seconds: number | null;
  reference: EventReference | null;
  confidence: number;
  basis: "explicit-reference" | "spoken-navigation" | "verse-text-match" | "reading-boundary" | "chapter-context";
  sourceText: string;
};

export type TranscriptAnalysis = {
  language: SupportedLanguage;
  translation: string;
  corpusId: string;
  segments: TranscriptSegment[];
  events: InterpreterEvent[];
  stats: {
    lines: number;
    events: number;
    uniqueVerses: number;
    references: number;
    readings: number;
    navigation: number;
  };
};

const EVENT_ORDER: Record<InterpreterEventType, number> = {
  context: 0, open: 1, jump: 2, next: 3, previous: 3, advance: 4, read: 5,
};

function segmentMoment(segment: TranscriptSegment): number {
  return Date.UTC(2026, 0, 1) + (segment.startSeconds ?? segment.index) * 1_000;
}

function displayReference(
  bookId: string,
  chapter: number,
  language: SupportedLanguage,
  verseStart?: number,
  verseEnd?: number,
): EventReference {
  const definition = BOOKS.find((book) => book.id === bookId);
  const book = definition?.names[language] ?? bookId;
  const canonicalBook = definition?.canonicalBook ?? bookId;
  const suffix = verseStart ? `:${verseStart}${verseEnd ? `–${verseEnd}` : ""}` : "";
  return {
    bookId,
    book,
    canonicalBook,
    chapter,
    verseStart,
    verseEnd,
    display: `${book} ${chapter}${suffix}`,
    canonical: `${canonicalBook} ${chapter}${suffix}`,
  };
}

function fromParser(reference: VerseReference, language: SupportedLanguage): EventReference {
  return displayReference(reference.bookId, reference.chapter, language, reference.verseStart, reference.verseEnd);
}

function fromVerse(verse: IndexedVerse, language: SupportedLanguage): EventReference {
  return displayReference(verse.bookId, verse.chapter, language, verse.verse);
}

function makeEvent(
  segment: TranscriptSegment,
  type: InterpreterEventType,
  action: InterpreterAction,
  reference: EventReference | null,
  confidence: number,
  basis: InterpreterEvent["basis"],
  sourceText = segment.text,
): InterpreterEvent {
  const key = reference?.canonical ?? "unresolved";
  return {
    id: `${segment.index}:${type}:${key}`,
    type,
    action,
    segmentIndex: segment.index,
    lineNumber: segment.lineNumber,
    timestamp: segment.timestamp,
    seconds: segment.startSeconds,
    reference,
    confidence: Math.round(confidence * 1000) / 1000,
    basis,
    sourceText,
  };
}

function collectExplicit(
  segments: TranscriptSegment[],
  language: SupportedLanguage,
  ignorePrayer: boolean,
): { events: InterpreterEvent[]; contexts: SegmentContext[] } {
  const detector = new BibleVerseReferenceDetector(language);
  const events: InterpreterEvent[] = [];
  const contexts: SegmentContext[] = [];
  let previousContext = "";
  let activeRange: { verseStart: number; verseEnd?: number } | null = null;

  for (const segment of segments) {
    const now = segmentMoment(segment);
    if (ignorePrayer && segment.isPrayer) {
      const context = detector.readContext(now);
      contexts[segment.index] = { bookId: context.bookId, chapter: context.chapter };
      continue;
    }
    const references = detector.consume(segment.text, now);
    const context = detector.readContext(now);
    const contextKey = `${context.bookId ?? ""}:${context.chapter ?? ""}`;
    if (contextKey !== previousContext) activeRange = null;
    if (references[0]) {
      activeRange = { verseStart: references[0].verseStart, verseEnd: references[0].verseEnd };
    }
    contexts[segment.index] = {
      bookId: context.bookId,
      chapter: context.chapter,
      verseStart: activeRange?.verseStart,
      verseEnd: activeRange?.verseEnd,
    };
    if (context.bookId && context.chapter && contextKey !== previousContext && references.length === 0) {
      events.push(makeEvent(
        segment,
        "context",
        "SET_CONTEXT",
        displayReference(context.bookId, context.chapter, language),
        0.86,
        "chapter-context",
      ));
    }
    previousContext = contextKey;

    for (const reference of references) {
      const type = reference.confidence === "context" ? "jump" : "open";
      events.push(makeEvent(
        segment,
        type,
        type === "jump" ? "GO_TO_VERSE" : "OPEN_VERSE",
        fromParser(reference, language),
        reference.confidence === "exact" ? 0.99 : 0.93,
        "explicit-reference",
      ));
    }

    const navigation = detectNavigationIntent(segment.text, language);
    if (navigation) {
      events.push(makeEvent(
        segment,
        navigation,
        navigation === "next" ? "NEXT_VERSE" : "PREVIOUS_VERSE",
        null,
        0.96,
        "spoken-navigation",
      ));
    }
  }
  return { events, contexts };
}

function quoteEvents(matches: VerseQuoteMatch[], segments: TranscriptSegment[], language: SupportedLanguage): InterpreterEvent[] {
  return matches.map((match) => makeEvent(
    segments[match.segmentIndex],
    "read",
    "VERSE_READ",
    fromVerse(match.verse, language),
    match.score,
    "verse-text-match",
    match.sourceText,
  ));
}

function resolveNavigation(events: InterpreterEvent[], corpus: VerseCorpusIndex): void {
  const readings = events.filter((event) => event.type === "read" && event.reference);
  for (const event of events.filter((candidate) => candidate.type === "next" || candidate.type === "previous")) {
    const nearby = readings.find((reading) => Math.abs(reading.segmentIndex - event.segmentIndex) <= 1);
    if (nearby?.reference) {
      event.reference = nearby.reference;
      continue;
    }
    const prior = [...events]
      .filter((candidate) => candidate.segmentIndex < event.segmentIndex && candidate.reference?.verseStart)
      .sort((left, right) => right.segmentIndex - left.segmentIndex)[0];
    if (!prior?.reference?.verseStart) continue;
    const offset = event.type === "next" ? 1 : -1;
    const targetVerse = prior.reference.verseStart + offset;
    const target = corpus.byKey.get(`${prior.reference.bookId}:${prior.reference.chapter}:${targetVerse}`);
    if (target) event.reference = displayReference(target.bookId, target.chapter, corpus.language, target.verse);
  }
}

function expandPartialRanges(events: InterpreterEvent[], language: SupportedLanguage): void {
  const rangeCue = language === "ru"
    ? /(?:^|\s)(?:по|до)(?=\s|$)/u
    : /(?:^|\s)(?:to|through|thru)(?=\s|$)/;
  const readings = events.filter((event) => event.type === "read" && event.reference?.verseStart);
  for (const event of events.filter((candidate) => (
    ["open", "jump"].includes(candidate.type)
    && candidate.reference?.verseStart
    && !candidate.reference.verseEnd
    && rangeCue.test(candidate.sourceText.toLocaleLowerCase())
  ))) {
    const reference = event.reference!;
    const observed = readings
      .filter((reading) => (
        reading.segmentIndex >= event.segmentIndex
        && reading.segmentIndex <= event.segmentIndex + 24
        && reading.reference?.bookId === reference.bookId
        && reading.reference.chapter === reference.chapter
      ))
      .map((reading) => reading.reference!.verseStart!)
      .sort((left, right) => left - right);
    let verseEnd = reference.verseStart!;
    for (const verse of new Set(observed)) {
      if (verse === verseEnd || verse === verseEnd + 1) verseEnd = Math.max(verseEnd, verse);
    }
    if (verseEnd > reference.verseStart!) {
      event.reference = displayReference(reference.bookId, reference.chapter, language, reference.verseStart, verseEnd);
    }
  }
}

function deriveReadingBoundaries(events: InterpreterEvent[], segments: TranscriptSegment[]): InterpreterEvent[] {
  const readings = events
    .filter((event) => event.type === "read" && event.reference?.verseStart)
    .sort((left, right) => left.segmentIndex - right.segmentIndex || (left.reference?.verseStart ?? 0) - (right.reference?.verseStart ?? 0));
  const boundaries: InterpreterEvent[] = [];
  for (let index = 1; index < readings.length; index += 1) {
    const previous = readings[index - 1];
    const current = readings[index];
    const previousReference = previous.reference!;
    const currentReference = current.reference!;
    if (
      previousReference.bookId !== currentReference.bookId
      || previousReference.chapter !== currentReference.chapter
      || currentReference.verseStart !== (previousReference.verseStart ?? 0) + 1
    ) continue;
    const spoken = events.some((event) => (
      ["next", "jump"].includes(event.type)
      && event.segmentIndex === current.segmentIndex
    ));
    if (spoken) continue;
    boundaries.push(makeEvent(
      segments[current.segmentIndex],
      "advance",
      "NEXT_VERSE",
      currentReference,
      Math.min(previous.confidence, current.confidence),
      "reading-boundary",
      current.sourceText,
    ));
  }
  return boundaries;
}

function uniqueEvents(events: InterpreterEvent[]): InterpreterEvent[] {
  const seen = new Set<string>();
  return events
    .sort((left, right) => left.segmentIndex - right.segmentIndex || EVENT_ORDER[left.type] - EVENT_ORDER[right.type])
    .filter((event) => {
      const key = `${event.segmentIndex}:${event.type}:${event.reference?.canonical ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export async function interpretTranscript(
  input: string,
  language: SupportedLanguage = "ru",
  {
    corpus,
    ignoreMusic = true,
    ignorePrayer = true,
  }: { corpus?: VerseCorpusIndex; ignoreMusic?: boolean; ignorePrayer?: boolean } = {},
): Promise<TranscriptAnalysis> {
  const segments = parseTranscript(input);
  const activeCorpus = corpus ?? await loadVerseCorpus(language);
  const explicit = collectExplicit(segments, language, ignorePrayer);
  const matches = matchQuotedVerses(segments, activeCorpus, explicit.contexts, { ignoreMusic, ignorePrayer });
  const events = [...explicit.events, ...quoteEvents(matches, segments, language)];
  expandPartialRanges(events, language);
  resolveNavigation(events, activeCorpus);
  events.push(...deriveReadingBoundaries(events, segments));
  const ordered = uniqueEvents(events);
  const verseKeys = new Set(ordered.flatMap((event) => {
    const reference = event.reference;
    if (!reference?.verseStart) return [];
    const end = reference.verseEnd ?? reference.verseStart;
    return Array.from({ length: end - reference.verseStart + 1 }, (_, index) => `${reference.bookId}:${reference.chapter}:${reference.verseStart! + index}`);
  }));
  return {
    language,
    translation: activeCorpus.document.translation,
    corpusId: activeCorpus.document.id,
    segments,
    events: ordered,
    stats: {
      lines: segments.length,
      events: ordered.length,
      uniqueVerses: verseKeys.size,
      references: ordered.filter((event) => event.type === "open" || event.type === "jump").length,
      readings: ordered.filter((event) => event.type === "read").length,
      navigation: ordered.filter((event) => ["advance", "next", "previous", "jump"].includes(event.type)).length,
    },
  };
}

export function formatConsoleEvent(event: InterpreterEvent): string {
  const time = event.timestamp ?? formatClock(event.seconds);
  const reference = event.reference?.canonical ?? "unresolved";
  const confidence = `${Math.round(event.confidence * 100)}%`;
  return `[${time}] ${event.action.padEnd(14)} ${reference} · ${confidence} · ${event.basis}`;
}

export { loadVerseCorpus, VerseCorpusIndex } from "./verseCorpus";
export { matchingTokens } from "./verseCorpus";
export { scoreQuote } from "./quoteScoring";
export { parseTranscript } from "./transcriptInput";
export type { SupportedLanguage } from "./bookDefinitions";
