import type { TranscriptSegment } from "./transcriptInput";
import { matchingTokens, type IndexedVerse, type VerseCorpusIndex } from "./verseCorpus";
import { scoreQuote } from "./quoteScoring";

export type SegmentContext = {
  bookId: string | null;
  chapter: number | null;
  verseStart?: number;
  verseEnd?: number;
};
export type VerseQuoteMatch = {
  verse: IndexedVerse;
  segmentIndex: number;
  endSegmentIndex: number;
  score: number;
  coverage: number;
  anticipated: boolean;
  sourceText: string;
};

type VerseCandidate = { anchors: number; contextual: boolean; anticipated: boolean };

function immediatelyAfterContext(verse: IndexedVerse, context: SegmentContext | undefined): boolean {
  if (!context?.bookId || !context.chapter || !context.verseStart) return false;
  return verse.bookId === context.bookId
    && verse.chapter === context.chapter
    && verse.verse === (context.verseEnd ?? context.verseStart) + 1;
}

function candidateIndices(
  windowTokens: string[],
  corpus: VerseCorpusIndex,
  context: SegmentContext | undefined,
): Map<number, VerseCandidate> {
  const candidates = new Map<number, VerseCandidate>();
  for (const token of new Set(windowTokens)) {
    for (const index of corpus.postings.get(token) ?? []) {
      const current = candidates.get(index) ?? { anchors: 0, contextual: false, anticipated: false };
      current.anchors += 1;
      candidates.set(index, current);
    }
  }
  for (const verse of corpus.chapter(context?.bookId ?? null, context?.chapter ?? null)) {
    const contextual = !context?.verseStart
      || (verse.verse >= context.verseStart && verse.verse <= (context.verseEnd ?? context.verseStart));
    const anticipated = immediatelyAfterContext(verse, context);
    if (!contextual && !anticipated) continue;
    const current = candidates.get(verse.index) ?? { anchors: 0, contextual: false, anticipated: false };
    current.contextual ||= contextual;
    current.anticipated ||= anticipated;
    candidates.set(verse.index, current);
  }
  return candidates;
}

function hasQuoteCue(text: string, language: VerseCorpusIndex["language"]): boolean {
  const normalized = text.toLocaleLowerCase();
  return language === "ru"
    ? /писан|библи|слово.{0,30}говор|чита(?:ем|ю|ть)|прочита|зачита|стих|текст|(?:бог|господ[ья])\s+(?:сказал|говорил|говорит)|(?:сказал|говорит)\s+(?:бог|господ[ья])/u.test(normalized)
    : /scripture|bible|(?:the\s+)?word.{0,24}says?|(?:we\s+)?read|written|verse|(?:the\s+)?psalmist\s+says?|(?:god|(?:the\s+)?lord)\s+(?:said|says|spoke|speaks)/.test(normalized);
}

function hasSignatureCue(text: string, language: VerseCorpusIndex["language"]): boolean {
  if (language !== "en") return false;
  return /(?:the\s+)?psalmist\s+says?/i.test(text);
}

function alignedWithContext(match: VerseQuoteMatch, context: SegmentContext | undefined): boolean {
  if (!context?.bookId || !context.chapter) return false;
  if (match.verse.bookId !== context.bookId || match.verse.chapter !== context.chapter) return false;
  if (!context.verseStart) return true;
  return match.verse.verse >= context.verseStart && match.verse.verse <= (context.verseEnd ?? context.verseStart);
}

function supportedByContext(match: VerseQuoteMatch, context: SegmentContext | undefined): boolean {
  return alignedWithContext(match, context) || (match.anticipated && immediatelyAfterContext(match.verse, context));
}

function preferContext(matches: VerseQuoteMatch[], contexts: SegmentContext[]): VerseQuoteMatch[] {
  return matches.filter((match) => {
    const context = contexts[match.segmentIndex];
    if (!context?.bookId) return true;
    if (supportedByContext(match, context)) {
      const strongerAlternative = matches.find((candidate) => (
        candidate.segmentIndex === match.segmentIndex
        && !supportedByContext(candidate, context)
        && candidate.score > match.score + 0.04
      ));
      return !strongerAlternative;
    }
    const contextualWinner = matches.find((candidate) => (
      candidate.segmentIndex === match.segmentIndex
      && supportedByContext(candidate, context)
      && candidate.score >= match.score - 0.03
    ));
    if (contextualWinner) return false;
    const strongerAlternative = matches.find((candidate) => (
      candidate.segmentIndex === match.segmentIndex
      && candidate.score > match.score + 0.04
    ));
    return !strongerAlternative;
  });
}

function bestSourceSegment(
  segments: TranscriptSegment[],
  start: number,
  end: number,
  verse: IndexedVerse,
  language: VerseCorpusIndex["language"],
): number {
  const verseTokens = new Set(verse.meaningful);
  let bestIndex = start;
  let bestHits = -1;
  for (let index = start; index <= end; index += 1) {
    const hits = matchingTokens(segments[index].text, language, true).filter((token) => verseTokens.has(token)).length;
    if (hits > bestHits) {
      bestHits = hits;
      bestIndex = index;
    }
  }
  return bestIndex;
}

function collapseOverlapping(matches: VerseQuoteMatch[]): VerseQuoteMatch[] {
  const byVerse = new Map<string, VerseQuoteMatch[]>();
  for (const match of matches) {
    const entries = byVerse.get(match.verse.key) ?? [];
    entries.push(match);
    byVerse.set(match.verse.key, entries);
  }
  const collapsed: VerseQuoteMatch[] = [];
  for (const entries of byVerse.values()) {
    entries.sort((left, right) => left.segmentIndex - right.segmentIndex || right.score - left.score);
    let cluster: VerseQuoteMatch[] = [];
    const flush = () => {
      if (!cluster.length) return;
      collapsed.push(cluster.sort((left, right) => right.score - left.score || left.segmentIndex - right.segmentIndex)[0]);
      cluster = [];
    };
    for (const entry of entries) {
      const lastEnd = cluster.reduce((maximum, item) => Math.max(maximum, item.endSegmentIndex), -1);
      if (cluster.length && entry.segmentIndex > lastEnd + 1) flush();
      cluster.push(entry);
    }
    flush();
  }
  return collapsed.sort((left, right) => left.segmentIndex - right.segmentIndex || left.verse.index - right.verse.index);
}

export function matchQuotedVerses(
  segments: TranscriptSegment[],
  corpus: VerseCorpusIndex,
  contexts: SegmentContext[],
  { ignoreMusic = true, ignorePrayer = true, maxWindow = 4 } = {},
): VerseQuoteMatch[] {
  const matches: VerseQuoteMatch[] = [];
  for (let start = 0; start < segments.length; start += 1) {
    if (ignoreMusic && segments[start].isMusic) continue;
    if (ignorePrayer && segments[start].isPrayer) continue;
    for (let end = start; end < Math.min(segments.length, start + maxWindow); end += 1) {
      if (ignoreMusic && segments[end].isMusic) break;
      if (ignorePrayer && segments[end].isPrayer) break;
      const sourceText = segments.slice(start, end + 1).map((segment) => segment.text).join(" ");
      const windowTokens = matchingTokens(sourceText, corpus.language, true);
      if (windowTokens.length < 3 || windowTokens.length > 95) continue;
      for (const [verseIndex, candidate] of candidateIndices(windowTokens, corpus, contexts[start])) {
        const verse = corpus.verses[verseIndex];
        const activeContext = contexts[start];
        if (
          activeContext?.verseStart
          && activeContext.verseEnd !== undefined
          && verse.bookId === activeContext.bookId
          && verse.chapter === activeContext.chapter
          && (verse.verse < activeContext.verseStart || verse.verse > (activeContext.verseEnd ?? activeContext.verseStart))
          && !candidate.anticipated
        ) continue;
        const signatureCued = hasSignatureCue(sourceText, corpus.language);
        const minimumAnchors = signatureCued ? 1 : verse.meaningful.length <= 6 ? 2 : 3;
        if (candidate.anticipated && candidate.anchors < Math.max(3, minimumAnchors)) continue;
        if (!candidate.contextual && !candidate.anticipated && candidate.anchors < minimumAnchors) continue;
        const segmentIndex = bestSourceSegment(segments, start, end, verse, corpus.language);
        const cued = hasQuoteCue(segments[segmentIndex].text, corpus.language) || signatureCued;
        if (!candidate.contextual && !candidate.anticipated && !cued && verse.meaningful.length < 6) continue;
        const scored = scoreQuote(verse.meaningful, windowTokens, {
          contextual: candidate.contextual,
          cued,
          anticipated: candidate.anticipated,
          signatureCued,
        });
        if (!scored) continue;
        matches.push({
          verse,
          segmentIndex,
          endSegmentIndex: end,
          score: scored.score,
          coverage: scored.coverage,
          anticipated: candidate.anticipated,
          sourceText,
        });
      }
    }
  }
  return preferContext(collapseOverlapping(matches), contexts);
}
