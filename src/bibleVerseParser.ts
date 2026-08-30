import { BOOKS, type BookDefinition, type SupportedLanguage } from "./bookDefinitions";
import {
  isNumberToken,
  normalizeText,
  parseLeadingNumber,
  parseNumberTokens,
  parseTrailingNumber,
  parseTwoNumbers,
  tokenize,
} from "./numberParsing";

export type VerseConfidence = "exact" | "context";

export type VerseReference = {
  id: string;
  bookId: string;
  book: string;
  canonicalBook: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  display: string;
  canonical: string;
  confidence: VerseConfidence;
  sourceText: string;
  detectedAt: string;
};

export type VerseContext = {
  bookId: string | null;
  book: string | null;
  canonicalBook: string | null;
  chapter: number | null;
  updatedAt: string | null;
};

type BookMatch = BookDefinition & {
  index: number;
  end: number;
  length: number;
  matchKind: "exact" | "fuzzy";
  distance: number;
  quality: number;
};

type VerseRange = { verseStart: number; verseEnd?: number };

const CONTEXT_TTL_MS = 6 * 60 * 60 * 1000;
const FUZZY_BOOK_ONLY_TTL_MS = 30 * 1000;
const DUPLICATE_TTL_MS = 20 * 1000;
const CHAPTER_LABELS: Record<SupportedLanguage, RegExp> = {
  ru: /глав(?:а|ы|е|у|ой|ою)|розд(?:іл|ілу|ілі|ілом)/g,
  en: /chapters?/g,
};
const VERSE_LABELS: Record<SupportedLanguage, RegExp> = {
  ru: /стих(?:а|е|и|ов|ом)?|текст(?:у|і|ом)?/g,
  en: /verses?/g,
};
const RANGE_CONNECTORS: Record<SupportedLanguage, Set<string>> = {
  ru: new Set(["и", "до", "по"]),
  en: new Set(["and", "to", "through", "thru"]),
};
const AMBIGUOUS_BARE_BOOKS: Record<SupportedLanguage, Set<string>> = {
  ru: new Set(["proverbs"]),
  en: new Set(["acts", "job", "judges", "mark", "numbers", "proverbs", "ruth"]),
};

function isWordCharacter(character: string | undefined): boolean {
  return Boolean(character && /[\p{L}\p{N}]/u.test(character));
}

function hasTokenBoundaries(text: string, index: number, length: number): boolean {
  return !isWordCharacter(text[index - 1]) && !isWordCharacter(text[index + length]);
}

function editDistance(left: string, right: string): number {
  let previousPrevious: number[] | null = null;
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitution = previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1);
      current[rightIndex] = Math.min(current[rightIndex - 1] + 1, previous[rightIndex] + 1, substitution);
      if (
        previousPrevious
        && leftIndex > 1
        && rightIndex > 1
        && left[leftIndex - 1] === right[rightIndex - 2]
        && left[leftIndex - 2] === right[rightIndex - 1]
      ) {
        current[rightIndex] = Math.min(current[rightIndex], previousPrevious[rightIndex - 2] + 1);
      }
    }
    previousPrevious = previous;
    previous = current;
  }
  return previous[right.length];
}

function commonPrefixLength(left: string, right: string): number {
  const limit = Math.min(left.length, right.length);
  let length = 0;
  while (length < limit && left[length] === right[length]) length += 1;
  return length;
}

function tokenSpans(text: string): Array<{ value: string; index: number; end: number }> {
  return [...text.matchAll(/[\p{L}\p{N}]+/gu)].map((match) => ({
    value: match[0],
    index: match.index ?? 0,
    end: (match.index ?? 0) + match[0].length,
  }));
}

function allowsFuzzyBookMatch(text: string, language: SupportedLanguage): boolean {
  const sharedCue = /\d{1,3}\s*[:.]\s*\d{1,3}/.test(text);
  if (language === "ru") {
    return sharedCue || /глав(?:а|ы|е|у|ой|ою)|стих(?:а|е|и|ов|ом)?|имел[аи]?\s+в\s+виду|имею\s+в\s+виду|поправлюсь|точнее|вернее/.test(text);
  }
  return sharedCue || /chapters?|verses?|i\s+(?:mean|meant)|sorry|correction|rather/.test(text);
}

function fuzzyDistanceLimit(
  alias: string,
  observed: string,
  language: SupportedLanguage,
  text: string,
): number {
  const length = Math.max(alias.length, observed.length);
  const numericReference = /\d{1,3}\s*[:.]\s*\d{1,3}/.test(text);
  if (length <= 4) return numericReference ? 1 : 0;
  if (length <= 6) return 1;
  if (length <= 9) return 2;
  if (length <= 14) return 3;
  const generalLimit = Math.min(5, Math.max(3, Math.floor(length * 0.22)));
  if (language !== "ru") return generalLimit;
  const sharedStem = commonPrefixLength(alias, observed);
  return sharedStem >= Math.max(4, Math.min(alias.length, observed.length) - 3)
    ? Math.max(generalLimit, 3)
    : generalLimit;
}

function fuzzyQuality(alias: string, observed: string, distance: number, tokenDelta: number): number {
  const length = Math.max(alias.length, observed.length);
  return distance / length + Math.abs(alias.length - observed.length) / length * 0.08 + tokenDelta * 0.025;
}

function isGenericScriptureWord(observed: string, language: SupportedLanguage): boolean {
  return language === "ru"
    ? /писан|библи/u.test(observed)
    : /scriptur|bible/.test(observed);
}

function hasBookCue(text: string, match: BookMatch, language: SupportedLanguage): boolean {
  const before = text.slice(Math.max(0, match.index - 26), match.index);
  return language === "ru"
    ? /(?:книг(?:а|и|е|у|ой|ою)|евангели(?:е|я|и)|послани(?:е|я|и))\s*$/u.test(before)
    : /(?:book\s+of|gospel(?:\s+according\s+to|\s+of)?|letter\s+to(?:\s+the)?)\s*$/.test(before);
}

function isWeakBookContext(text: string, match: BookMatch, language: SupportedLanguage): boolean {
  return match.matchKind === "fuzzy"
    || (AMBIGUOUS_BARE_BOOKS[language].has(match.id) && !hasBookCue(text, match, language));
}

function hasUnnumberedVolumeFamily(text: string, language: SupportedLanguage): boolean {
  const numbered = language === "ru"
    ? /(?:^|\s)(?:1|2|3|перв\p{L}*|втор\p{L}*|трет\p{L}*)(?=\s|$)/u.test(text)
    : /(?:^|\s)(?:1|2|3|first|second|third|1st|2nd|3rd)(?=\s|$)/.test(text);
  if (numbered) return false;
  return language === "ru"
    ? /коринф|фессалоник|тимофе/u.test(text)
    : /\b(?:corinthians|thessalonians|timothy|samuel|kings|chronicles)\b/.test(text);
}

function findBook(text: string, language: SupportedLanguage): BookMatch | null {
  const candidates: BookMatch[] = [];
  for (const definition of BOOKS) {
    for (const rawAlias of definition.aliases[language]) {
      const alias = normalizeText(rawAlias);
      let index = text.indexOf(alias);
      while (index >= 0) {
        if (hasTokenBoundaries(text, index, alias.length)) {
          candidates.push({
            ...definition,
            index,
            end: index + alias.length,
            length: alias.length,
            matchKind: "exact",
            distance: 0,
            quality: 0,
          });
        }
        index = text.indexOf(alias, index + 1);
      }
    }
  }

  if (allowsFuzzyBookMatch(text, language)) {
    const spans = tokenSpans(text);
    for (const definition of BOOKS) {
      for (const rawAlias of definition.aliases[language]) {
        const aliasWords = tokenize(rawAlias);
        const compactAlias = aliasWords.join("");
        const windowLengths = new Set([
          Math.max(1, aliasWords.length - 1),
          aliasWords.length,
          aliasWords.length + 1,
        ]);
        for (const windowLength of windowLengths) {
          for (let index = 0; index <= spans.length - windowLength; index += 1) {
            const window = spans.slice(index, index + windowLength);
            const observed = window.map((span) => span.value).join("");
            if (isGenericScriptureWord(observed, language)) continue;
            const distance = editDistance(observed, compactAlias);
            const maximumDistance = fuzzyDistanceLimit(compactAlias, observed, language, text);
            if (distance < 1 || distance > maximumDistance) continue;
            candidates.push({
              ...definition,
              index: window[0].index,
              end: window.at(-1)!.end,
              length: window.at(-1)!.end - window[0].index,
              matchKind: "fuzzy",
              distance,
              quality: fuzzyQuality(compactAlias, observed, distance, windowLength - aliasWords.length),
            });
          }
        }
      }
    }
  }

  const exact = candidates
    .filter((candidate) => candidate.matchKind === "exact")
    .sort((left, right) => right.end - left.end || right.length - left.length)[0];
  const cued = candidates
    .filter((candidate) => hasBookCue(text, candidate, language))
    .sort((left, right) => right.end - left.end || left.quality - right.quality)[0];
  if (cued && (!exact || cued.end > exact.end)) return cued;
  if (exact) return exact;

  const bestByBook = new Map<string, BookMatch>();
  for (const candidate of candidates) {
    const current = bestByBook.get(candidate.id);
    if (!current || candidate.quality < current.quality || (
      candidate.quality === current.quality && candidate.end > current.end
    )) bestByBook.set(candidate.id, candidate);
  }
  const ranked = [...bestByBook.values()].sort((left, right) => (
    left.quality - right.quality
    || left.distance - right.distance
    || right.end - left.end
    || right.length - left.length
  ));
  if (ranked.length > 1 && ranked[1].quality - ranked[0].quality < 0.035) return null;
  return ranked[0] ?? null;
}

function isNegatedBook(text: string, match: BookMatch, language: SupportedLanguage): boolean {
  const before = text.slice(Math.max(0, match.index - 18), match.index);
  return language === "ru"
    ? /(?:^|\s)не\s*$/.test(before)
    : /(?:^|\s)not\s*$/.test(before);
}

function firstLabel(text: string, pattern: RegExp): RegExpExecArray | null {
  pattern.lastIndex = 0;
  return pattern.exec(text);
}

function numberNearLabel(text: string, labelPattern: RegExp, language: SupportedLanguage, max: number): number | null {
  const label = firstLabel(text, labelPattern);
  if (!label || label.index === undefined) return null;
  const before = tokenize(text.slice(Math.max(0, label.index - 70), label.index));
  const afterStart = label.index + label[0].length;
  const after = tokenize(text.slice(afterStart, afterStart + 70));
  const beforeValue = parseTrailingNumber(before, language, max);
  const afterValue = parseLeadingNumber(after, language, max);
  return beforeValue ?? afterValue;
}

function rangeFromTokens(words: string[], language: SupportedLanguage, preferLeading: boolean): VerseRange | null {
  const connectors = RANGE_CONNECTORS[language];
  for (let index = 1; index < words.length - 1; index += 1) {
    if (!connectors.has(words[index])) continue;
    const verseStart = parseTrailingNumber(words.slice(0, index), language);
    const verseEnd = parseLeadingNumber(words.slice(index + 1), language);
    if (verseStart && verseEnd && verseEnd >= verseStart) return { verseStart, verseEnd };
    if (verseStart && !verseEnd) return { verseStart };
  }
  const verseStart = preferLeading
    ? parseLeadingNumber(words, language) ?? parseTrailingNumber(words, language)
    : parseTrailingNumber(words, language) ?? parseLeadingNumber(words, language);
  return verseStart ? { verseStart } : null;
}

function verseRangeNearLabel(text: string, language: SupportedLanguage): VerseRange | null {
  const label = firstLabel(text, VERSE_LABELS[language]);
  if (!label || label.index === undefined) return null;
  const before = tokenize(text.slice(Math.max(0, label.index - 85), label.index));
  const afterStart = label.index + label[0].length;
  const after = tokenize(text.slice(afterStart, afterStart + 85));
  return rangeFromTokens(after, language, true) ?? rangeFromTokens(before, language, false);
}

function explicitColonReference(text: string, match: BookMatch | null): { chapter: number; verseStart: number; verseEnd?: number } | null {
  const searchText = match ? text.slice(match.end, match.end + 100) : text;
  const found = searchText.match(/(?:chapter\s*)?(\d{1,3})\s*[:.]\s*(\d{1,3})(?:\s*-\s*(\d{1,3}))?/);
  if (!found) return null;
  const chapter = Number(found[1]);
  const verseStart = Number(found[2]);
  const verseEnd = found[3] ? Number(found[3]) : undefined;
  if (chapter < 1 || verseStart < 1 || (verseEnd !== undefined && verseEnd < 1)) return null;
  return { chapter, verseStart, verseEnd };
}

function unlabelledBookPair(text: string, match: BookMatch, language: SupportedLanguage): [number, number] | null {
  const after = text.slice(match.end, match.end + 80);
  if (firstLabel(after, CHAPTER_LABELS[language]) || firstLabel(after, VERSE_LABELS[language])) return null;
  const words: string[] = [];
  for (const word of tokenize(after).slice(0, 10)) {
    if (isNumberToken(word, language) || RANGE_CONNECTORS[language].has(word)) words.push(word);
    else if (words.length > 0) break;
    else if (!["at", "in", "в"].includes(word)) break;
  }
  if (words.length < 2) return null;
  return parseTwoNumbers(words, language);
}

function chapterBesideBook(text: string, match: BookMatch, language: SupportedLanguage): number | null {
  const verseLabel = firstLabel(text.slice(match.end), VERSE_LABELS[language]);
  if (match.id === "psalms") {
    const before = tokenize(text.slice(Math.max(0, match.index - 45), match.index));
    const between = verseLabel?.index === undefined
      ? tokenize(text.slice(match.end, match.end + 45))
      : tokenize(text.slice(match.end, match.end + verseLabel.index));
    const psalmNumber = parseTrailingNumber(before, language, match.chapters)
      ?? parseLeadingNumber(between, language, match.chapters)
      ?? parseTrailingNumber(between, language, match.chapters);
    if (psalmNumber) return psalmNumber;
  }
  if (verseLabel?.index !== undefined) {
    const between = tokenize(text.slice(match.end, match.end + verseLabel.index));
    const value = parseLeadingNumber(between, language, match.chapters) ?? parseTrailingNumber(between, language, match.chapters);
    if (value) return value;
  }
  return null;
}

function referenceKey(bookId: string, chapter: number, verseStart: number, verseEnd?: number): string {
  return `${bookId}:${chapter}:${verseStart}:${verseEnd ?? ""}`;
}

export class BibleVerseReferenceDetector {
  private language: SupportedLanguage;
  private contextBook: BookDefinition | null = null;
  private contextChapter: number | null = null;
  private contextUpdatedAt = 0;
  private contextBookIsWeak = false;
  private readonly recent = new Map<string, number>();
  private pendingNumberPrefix: string | null = null;

  constructor(language: SupportedLanguage = "ru") {
    this.language = language;
  }

  setLanguage(language: SupportedLanguage): void {
    if (this.language === language) return;
    this.language = language;
    this.reset();
  }

  getLanguage(): SupportedLanguage {
    return this.language;
  }

  reset(): void {
    this.contextBook = null;
    this.contextChapter = null;
    this.contextUpdatedAt = 0;
    this.contextBookIsWeak = false;
    this.pendingNumberPrefix = null;
    this.recent.clear();
  }

  readContext(now = Date.now()): VerseContext {
    const ttl = !this.contextChapter && this.contextBookIsWeak
      ? FUZZY_BOOK_ONLY_TTL_MS
      : CONTEXT_TTL_MS;
    if (this.contextUpdatedAt && now - this.contextUpdatedAt > ttl) this.reset();
    return {
      bookId: this.contextBook?.id ?? null,
      book: this.contextBook?.names[this.language] ?? null,
      canonicalBook: this.contextBook?.canonicalBook ?? null,
      chapter: this.contextChapter,
      updatedAt: this.contextUpdatedAt ? new Date(this.contextUpdatedAt).toISOString() : null,
    };
  }

  consume(sourceText: string, now = Date.now()): VerseReference[] {
    const normalized = normalizeText(sourceText);
    if (!normalized) return [];
    this.readContext(now);
    let text = normalized;
    const firstToken = tokenize(normalized)[0];
    const firstValue = firstToken ? parseNumberTokens([firstToken], this.language, 9) : null;
    let splitChapter: number | null = null;
    let splitVerse: number | null = null;
    if (this.pendingNumberPrefix && firstToken && firstValue) {
      const prefixValue = parseNumberTokens([this.pendingNumberPrefix], this.language, 99);
      const completedChapter = parseNumberTokens(
        [this.pendingNumberPrefix, firstToken],
        this.language,
        this.contextBook?.chapters ?? 150,
      );
      const completedVerse = parseNumberTokens([this.pendingNumberPrefix, firstToken], this.language, 176);
      if (completedChapter && firstLabel(normalized, CHAPTER_LABELS[this.language])) {
        text = `${this.pendingNumberPrefix} ${normalized}`;
      } else if (completedChapter && prefixValue === this.contextChapter && firstLabel(normalized, VERSE_LABELS[this.language])) {
        splitChapter = completedChapter;
        text = normalizeText(normalized.slice(firstToken.length));
      } else if (completedVerse && firstLabel(normalized, VERSE_LABELS[this.language])) {
        splitVerse = completedVerse;
        text = normalizeText(normalized.slice(firstToken.length));
      }
    }
    this.pendingNumberPrefix = null;

    if (hasUnnumberedVolumeFamily(text, this.language)) {
      this.contextBook = null;
      this.contextChapter = null;
      this.contextUpdatedAt = 0;
      this.contextBookIsWeak = false;
    }

    let bookMatch = findBook(text, this.language);
    const previousBook = this.contextBook;
    if (bookMatch && isNegatedBook(text, bookMatch, this.language)) {
      this.contextBook = null;
      this.contextChapter = null;
      this.contextUpdatedAt = 0;
      this.contextBookIsWeak = false;
      bookMatch = null;
    } else if (bookMatch) {
      this.contextBook = bookMatch;
      this.contextBookIsWeak = isWeakBookContext(text, bookMatch, this.language);
      if (previousBook?.id !== bookMatch.id) this.contextChapter = null;
      this.contextUpdatedAt = now;
    }

    const colonReference = explicitColonReference(text, bookMatch);
    const pair = !colonReference && bookMatch ? unlabelledBookPair(text, bookMatch, this.language) : null;
    const spokenVerses = colonReference || pair ? null : verseRangeNearLabel(text, this.language);
    const verseStart = colonReference?.verseStart ?? pair?.[1] ?? splitVerse ?? spokenVerses?.verseStart ?? null;
    const verseEnd = colonReference?.verseEnd ?? spokenVerses?.verseEnd;
    const chapter = colonReference?.chapter
      ?? pair?.[0]
      ?? numberNearLabel(text, CHAPTER_LABELS[this.language], this.language, this.contextBook?.chapters ?? 150)
      ?? (bookMatch ? chapterBesideBook(text, bookMatch, this.language) : null)
      ?? splitChapter
      ?? (verseStart ? this.contextBook?.fallbackChapterOnVerse ?? null : null);

    if (chapter && this.contextBook && chapter <= this.contextBook.chapters) {
      this.contextChapter = chapter;
      this.contextUpdatedAt = now;
    }

    const trailingToken = tokenize(normalized).at(-1);
    const trailingValue = trailingToken ? parseNumberTokens([trailingToken], this.language, 99) : null;
    if (this.contextBook && trailingToken && trailingValue && trailingValue >= 20 && trailingValue < 100 && trailingValue % 10 === 0) {
      this.pendingNumberPrefix = trailingToken;
    }

    if (!verseStart || verseStart > 176 || !this.contextBook || !this.contextChapter) return [];
    if (verseEnd && (verseEnd < verseStart || verseEnd > 176)) return [];

    const key = referenceKey(this.contextBook.id, this.contextChapter, verseStart, verseEnd);
    const lastSeen = this.recent.get(key) ?? 0;
    if (now - lastSeen < DUPLICATE_TTL_MS) return [];
    this.recent.set(key, now);
    for (const [recentKey, timestamp] of this.recent) {
      if (now - timestamp > CONTEXT_TTL_MS) this.recent.delete(recentKey);
    }

    const suffix = verseEnd ? `${verseStart}–${verseEnd}` : String(verseStart);
    const confidence: VerseConfidence = bookMatch && chapter ? "exact" : "context";
    return [{
      id: `${key}:${now}`,
      bookId: this.contextBook.id,
      book: this.contextBook.names[this.language],
      canonicalBook: this.contextBook.canonicalBook,
      chapter: this.contextChapter,
      verseStart,
      verseEnd,
      display: `${this.contextBook.names[this.language]} ${this.contextChapter}:${suffix}`,
      canonical: `${this.contextBook.canonicalBook} ${this.contextChapter}:${suffix}`,
      confidence,
      sourceText: sourceText.trim(),
      detectedAt: new Date(now).toISOString(),
    }];
  }
}

export type { SupportedLanguage } from "./bookDefinitions";
export { BOOKS } from "./bookDefinitions";
