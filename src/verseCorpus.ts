import type { SupportedLanguage } from "./bookDefinitions";

export type CorpusTuple = [bookId: string, chapter: number, verse: number, text: string];
export type CorpusDocument = {
  schemaVersion: number;
  id: string;
  language: SupportedLanguage;
  translation: string;
  license: string;
  source: string;
  verses: CorpusTuple[];
};

export type IndexedVerse = {
  index: number;
  key: string;
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
  tokens: string[];
  meaningful: string[];
};

const STOP_WORDS: Record<SupportedLanguage, Set<string>> = {
  ru: new Set(["а", "без", "бы", "в", "во", "вот", "все", "для", "до", "его", "ее", "же", "за", "и", "из", "или", "их", "к", "как", "ко", "мне", "мы", "на", "не", "но", "о", "об", "он", "она", "они", "от", "по", "при", "с", "со", "так", "то", "у", "что", "это", "я"]),
  en: new Set(["a", "all", "and", "are", "as", "at", "be", "but", "by", "for", "from", "had", "has", "have", "he", "her", "him", "his", "i", "in", "is", "it", "me", "my", "not", "of", "on", "or", "our", "she", "so", "that", "the", "their", "them", "they", "this", "to", "was", "we", "were", "will", "with", "you", "your"]),
};

const RU_SUFFIXES = ["иями", "ями", "ами", "ого", "ему", "ому", "ими", "ыми", "его", "ую", "юю", "ая", "яя", "ые", "ие", "ый", "ий", "ой", "ам", "ям", "ах", "ях", "ов", "ев", "ом", "ем", "им", "ым", "их", "ых", "ию", "ью", "ия", "ей", "ою", "ею", "ы", "и", "а", "я", "у", "ю", "е", "о"];
const EN_SUFFIXES = ["ingly", "edly", "ing", "ies", "ied", "ed", "es", "s"];
const EN_EQUIVALENTS: Record<string, string> = {
  tongu: "speech",
  languag: "speech",
  resound: "sound",
  sound: "sound",
  bras: "gong",
  gong: "gong",
  fathom: "understand",
  know: "understand",
  remov: "move",
  remove: "move",
  move: "move",
};

export function normalizeForMatching(text: string): string {
  return text
    .normalize("NFKD")
    .toLocaleLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("ё", "е")
    .replaceAll("і", "и")
    .replaceAll("ї", "и")
    .replaceAll("є", "е")
    .replaceAll("ґ", "г")
    .replace(/[’']/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stem(token: string, language: SupportedLanguage): string {
  const suffixes = language === "ru" ? RU_SUFFIXES : EN_SUFFIXES;
  for (const suffix of suffixes) {
    if (token.endsWith(suffix) && token.length - suffix.length >= 4) {
      const stemmed = token.slice(0, -suffix.length);
      return language === "en" ? EN_EQUIVALENTS[stemmed] ?? stemmed : stemmed;
    }
  }
  return language === "en" ? EN_EQUIVALENTS[token] ?? token : token;
}

export function matchingTokens(text: string, language: SupportedLanguage, meaningfulOnly = false): string[] {
  const raw = normalizeForMatching(text).match(/[\p{L}\p{N}]+/gu) ?? [];
  return raw
    .filter((token) => !meaningfulOnly || (token.length >= 3 && !STOP_WORDS[language].has(token)))
    .map((token) => stem(token, language));
}

export class VerseCorpusIndex {
  readonly language: SupportedLanguage;
  readonly document: CorpusDocument;
  readonly verses: IndexedVerse[];
  readonly postings = new Map<string, number[]>();
  readonly byChapter = new Map<string, number[]>();
  readonly byKey = new Map<string, IndexedVerse>();

  constructor(document: CorpusDocument) {
    this.document = document;
    this.language = document.language;
    this.verses = document.verses.map(([bookId, chapter, verse, text], index) => ({
      index,
      key: `${bookId}:${chapter}:${verse}`,
      bookId,
      chapter,
      verse,
      text,
      tokens: matchingTokens(text, document.language),
      meaningful: matchingTokens(text, document.language, true),
    }));

    const frequency = new Map<string, number>();
    for (const verse of this.verses) {
      this.byKey.set(verse.key, verse);
      const chapterKey = `${verse.bookId}:${verse.chapter}`;
      const chapter = this.byChapter.get(chapterKey) ?? [];
      chapter.push(verse.index);
      this.byChapter.set(chapterKey, chapter);
      for (const token of new Set(verse.meaningful)) frequency.set(token, (frequency.get(token) ?? 0) + 1);
    }
    for (const verse of this.verses) {
      for (const token of new Set(verse.meaningful)) {
        if ((frequency.get(token) ?? 0) > 1_200) continue;
        const entries = this.postings.get(token) ?? [];
        entries.push(verse.index);
        this.postings.set(token, entries);
      }
    }
  }

  chapter(bookId: string | null, chapter: number | null): IndexedVerse[] {
    if (!bookId || !chapter) return [];
    return (this.byChapter.get(`${bookId}:${chapter}`) ?? []).map((index) => this.verses[index]);
  }
}

const CORPUS_PATHS: Record<SupportedLanguage, string> = {
  ru: "./data/russyn.json",
  en: "./data/engwebp.json",
};

const cache = new Map<SupportedLanguage, Promise<VerseCorpusIndex>>();

export function loadVerseCorpus(language: SupportedLanguage, fetcher: typeof fetch = fetch): Promise<VerseCorpusIndex> {
  const existing = cache.get(language);
  if (existing) return existing;
  const pending = fetcher(CORPUS_PATHS[language])
    .then((response) => {
      if (!response.ok) throw new Error(`Bible corpus returned ${response.status}`);
      return response.json() as Promise<CorpusDocument>;
    })
    .then((document) => new VerseCorpusIndex(document));
  cache.set(language, pending);
  pending.catch(() => cache.delete(language));
  return pending;
}
