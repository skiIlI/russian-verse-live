export type RussianVerseConfidence = "exact" | "context";

export type RussianVerseReference = {
  id: string;
  bookId: string;
  book: string;
  canonicalBook: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  display: string;
  canonical: string;
  confidence: RussianVerseConfidence;
  sourceText: string;
  detectedAt: string;
};

export type RussianVerseContext = {
  bookId: string | null;
  book: string | null;
  canonicalBook: string | null;
  chapter: number | null;
  updatedAt: string | null;
};

type BookDefinition = {
  id: string;
  book: string;
  canonicalBook: string;
  aliases: string[];
  verseOnlyChapter?: number;
};

type BookMatch = BookDefinition & { index: number; length: number };

const CONTEXT_TTL_MS = 6 * 60 * 60 * 1000;
const DUPLICATE_TTL_MS = 20 * 1000;

const BOOKS: BookDefinition[] = [
  { id: "genesis", book: "Бытие", canonicalBook: "Genesis", aliases: ["бытие", "бытия", "бте"] },
  { id: "exodus", book: "Исход", canonicalBook: "Exodus", aliases: ["исход"] },
  { id: "leviticus", book: "Левит", canonicalBook: "Leviticus", aliases: ["левит", "левита"] },
  { id: "numbers", book: "Числа", canonicalBook: "Numbers", aliases: ["числа", "чисел"] },
  { id: "deuteronomy", book: "Второзаконие", canonicalBook: "Deuteronomy", aliases: ["второзаконие", "второзакония"] },
  { id: "joshua", book: "Иисус Навин", canonicalBook: "Joshua", aliases: ["иисуса навина", "иисус навин", "навина"] },
  { id: "judges", book: "Судьи", canonicalBook: "Judges", aliases: ["книга судей", "судей", "судьи"] },
  { id: "ruth", book: "Руфь", canonicalBook: "Ruth", aliases: ["руфь", "руфи"] },
  { id: "1-samuel", book: "1 Царств", canonicalBook: "1 Samuel", aliases: ["первая царств", "первое царств", "1 царств"] },
  { id: "2-samuel", book: "2 Царств", canonicalBook: "2 Samuel", aliases: ["вторая царств", "второе царств", "2 царств"] },
  { id: "1-kings", book: "3 Царств", canonicalBook: "1 Kings", aliases: ["третья царств", "третье царств", "3 царств"] },
  { id: "2-kings", book: "4 Царств", canonicalBook: "2 Kings", aliases: ["четвертая царств", "четвертое царств", "4 царств"] },
  { id: "job", book: "Иов", canonicalBook: "Job", aliases: ["иова", "иов"] },
  { id: "psalms", book: "Псалом", canonicalBook: "Psalms", aliases: ["псалтирь", "псалтырь", "псалом", "псалма", "псалме"] },
  { id: "proverbs", book: "Притчи", canonicalBook: "Proverbs", aliases: ["притчи", "притчей"] },
  { id: "ecclesiastes", book: "Екклесиаст", canonicalBook: "Ecclesiastes", aliases: ["екклесиаста", "екклесиаст", "экклезиаст"] },
  { id: "song", book: "Песнь Песней", canonicalBook: "Song of Solomon", aliases: ["песнь песней", "песни песней"] },
  { id: "isaiah", book: "Исаия", canonicalBook: "Isaiah", aliases: ["исаии", "исайя", "исаия"] },
  { id: "jeremiah", book: "Иеремия", canonicalBook: "Jeremiah", aliases: ["иеремии", "иеремия"] },
  { id: "lamentations", book: "Плач Иеремии", canonicalBook: "Lamentations", aliases: ["плач иеремии"] },
  { id: "ezekiel", book: "Иезекииль", canonicalBook: "Ezekiel", aliases: ["иезекииля", "иезекииль"] },
  { id: "daniel", book: "Даниил", canonicalBook: "Daniel", aliases: ["даниила", "даниил"] },
  { id: "hosea", book: "Осия", canonicalBook: "Hosea", aliases: ["осии", "осия"] },
  { id: "joel", book: "Иоиль", canonicalBook: "Joel", aliases: ["иоиля", "иоиль"] },
  { id: "amos", book: "Амос", canonicalBook: "Amos", aliases: ["амоса", "амос"] },
  { id: "jonah", book: "Иона", canonicalBook: "Jonah", aliases: ["ионы", "иона"] },
  { id: "micah", book: "Михей", canonicalBook: "Micah", aliases: ["михея", "михей"] },
  { id: "habakkuk", book: "Аввакум", canonicalBook: "Habakkuk", aliases: ["аввакума", "аввакум"] },
  { id: "zechariah", book: "Захария", canonicalBook: "Zechariah", aliases: ["захарии", "захария"] },
  { id: "malachi", book: "Малахия", canonicalBook: "Malachi", aliases: ["малахии", "малахия"], verseOnlyChapter: 4 },
  { id: "matthew", book: "От Матфея", canonicalBook: "Matthew", aliases: ["евангелие от матфея", "от матфея", "матфея", "матфей"] },
  { id: "mark", book: "От Марка", canonicalBook: "Mark", aliases: ["евангелие от марка", "от марка", "марка", "марк"] },
  { id: "luke", book: "От Луки", canonicalBook: "Luke", aliases: ["евангелие от луки", "от луки", "лукой", "луки", "лука"] },
  { id: "john", book: "От Иоанна", canonicalBook: "John", aliases: ["евангелие от иоанна", "от иоанна", "иоанна", "иоанн"] },
  { id: "acts", book: "Деяния", canonicalBook: "Acts", aliases: ["деяния апостолов", "деяний", "деяния"] },
  { id: "romans", book: "К Римлянам", canonicalBook: "Romans", aliases: ["послание к римлянам", "к римлянам", "римлянам"] },
  { id: "1-corinthians", book: "1 Коринфянам", canonicalBook: "1 Corinthians", aliases: ["первое послание к коринфянам", "первое коринфянам", "первая коринфянам", "первые коринфянам", "первое коринфианом", "первое коринфианам", "1 коринфянам"] },
  { id: "2-corinthians", book: "2 Коринфянам", canonicalBook: "2 Corinthians", aliases: ["второе послание к коринфянам", "второе коринфянам", "вторая коринфянам", "2 коринфянам"] },
  { id: "galatians", book: "К Галатам", canonicalBook: "Galatians", aliases: ["послание к галатам", "к галатам", "галатам"] },
  { id: "ephesians", book: "К Ефесянам", canonicalBook: "Ephesians", aliases: ["послание к ефесянам", "к ефесянам", "ефесянам"] },
  { id: "philippians", book: "К Филиппийцам", canonicalBook: "Philippians", aliases: ["послание к филиппийцам", "к филиппийцам", "филиппийцам"] },
  { id: "colossians", book: "К Колоссянам", canonicalBook: "Colossians", aliases: ["послание к колоссянам", "к колоссянам", "колоссянам"] },
  { id: "1-thessalonians", book: "1 Фессалоникийцам", canonicalBook: "1 Thessalonians", aliases: ["первое фессалоникийцам", "1 фессалоникийцам"] },
  { id: "2-thessalonians", book: "2 Фессалоникийцам", canonicalBook: "2 Thessalonians", aliases: ["второе фессалоникийцам", "2 фессалоникийцам"] },
  { id: "1-timothy", book: "1 Тимофею", canonicalBook: "1 Timothy", aliases: ["первое тимофею", "1 тимофею"] },
  { id: "2-timothy", book: "2 Тимофею", canonicalBook: "2 Timothy", aliases: ["второе тимофею", "2 тимофею"] },
  { id: "titus", book: "К Титу", canonicalBook: "Titus", aliases: ["послание к титу", "к титу", "титу"] },
  { id: "philemon", book: "К Филимону", canonicalBook: "Philemon", aliases: ["послание к филимону", "к филимону", "филимону"] },
  { id: "hebrews", book: "К Евреям", canonicalBook: "Hebrews", aliases: ["послание к евреям", "к евреям", "евреям"] },
  { id: "james", book: "Иакова", canonicalBook: "James", aliases: ["послание иакова", "иакова", "иаков"] },
  { id: "1-peter", book: "1 Петра", canonicalBook: "1 Peter", aliases: ["первое послание петра", "первое петра", "1 петра"] },
  { id: "2-peter", book: "2 Петра", canonicalBook: "2 Peter", aliases: ["второе послание петра", "второе петра", "2 петра"] },
  { id: "1-john", book: "1 Иоанна", canonicalBook: "1 John", aliases: ["первое послание иоанна", "первое иоанна", "1 иоанна"] },
  { id: "2-john", book: "2 Иоанна", canonicalBook: "2 John", aliases: ["второе послание иоанна", "второе иоанна", "2 иоанна"] },
  { id: "3-john", book: "3 Иоанна", canonicalBook: "3 John", aliases: ["третье послание иоанна", "третье иоанна", "3 иоанна"] },
  { id: "jude", book: "Иуды", canonicalBook: "Jude", aliases: ["послание иуды", "иуды", "иуда"] },
  { id: "revelation", book: "Откровение", canonicalBook: "Revelation", aliases: ["откровение иоанна", "апокалипсис", "откровения", "откровение"] },
];

const NUMBER_WORDS: Record<string, number> = {};

function addNumber(value: number, words: string[]): void {
  for (const word of words) NUMBER_WORDS[word] = value;
}

addNumber(1, ["один", "одна", "одно", "первый", "первая", "первое", "первую", "первого", "первой", "первом", "первым"]);
addNumber(2, ["два", "две", "второй", "вторая", "второе", "вторую", "второго", "втором", "вторым"]);
addNumber(3, ["три", "третий", "третья", "третье", "третью", "третьего", "третьем", "третьим"]);
addNumber(4, ["четыре", "четвертый", "четвертая", "четвертое", "четвертую", "четвертого", "четвертой", "четвертом"]);
addNumber(5, ["пять", "пятый", "пятая", "пятое", "пятого", "пятой", "пятом"]);
addNumber(6, ["шесть", "шестой", "шестая", "шестое", "шестого", "шестой", "шестом"]);
addNumber(7, ["семь", "седьмой", "седьмая", "седьмое", "седьмого", "седьмой", "седьмом"]);
addNumber(8, ["восемь", "восьмой", "восьмая", "восьмое", "восьмого", "восьмом"]);
addNumber(9, ["девять", "девятый", "девятая", "девятое", "девятого", "девятой", "девятом"]);
addNumber(10, ["десять", "десятый", "десятая", "десятое", "десятого", "десятой", "десятом"]);
addNumber(11, ["одиннадцать", "одиннадцатый", "одиннадцатая", "одиннадцатого", "одиннадцатой", "одиннадцатом"]);
addNumber(12, ["двенадцать", "двенадцатый", "двенадцатая", "двенадцатого", "двенадцатой", "двенадцатом"]);
addNumber(13, ["тринадцать", "тринадцатый", "тринадцатая", "тринадцатого", "тринадцатой", "тринадцатом"]);
addNumber(14, ["четырнадцать", "четырнадцатый", "четырнадцатая", "четырнадцатого", "четырнадцатой", "четырнадцатом"]);
addNumber(15, ["пятнадцать", "пятнадцатый", "пятнадцатая", "пятнадцатого", "пятнадцатой", "пятнадцатом"]);
addNumber(16, ["шестнадцать", "шестнадцатый", "шестнадцатая", "шестнадцатого", "шестнадцатой", "шестнадцатом"]);
addNumber(17, ["семнадцать", "семнадцатый", "семнадцатая", "семнадцатого", "семнадцатой", "семнадцатом"]);
addNumber(18, ["восемнадцать", "восемнадцатый", "восемнадцатая", "восемнадцатого", "восемнадцатой", "восемнадцатом"]);
addNumber(19, ["девятнадцать", "девятнадцатый", "девятнадцатая", "девятнадцатого", "девятнадцатой", "девятнадцатом"]);
addNumber(20, ["двадцать", "двадцатый", "двадцатая", "двадцатого", "двадцатой", "двадцатом"]);
addNumber(30, ["тридцать", "тридцатый", "тридцатая", "тридцатого", "тридцатой", "тридцатом"]);
addNumber(40, ["сорок", "сороковой", "сороковая", "сорокового", "сороковой", "сороковом"]);
addNumber(50, ["пятьдесят", "пятидесятый", "пятидесятая", "пятидесятого", "пятидесятом"]);
addNumber(60, ["шестьдесят", "шестидесятый", "шестидесятая", "шестидесятого", "шестидесятом"]);
addNumber(70, ["семьдесят", "семидесятый", "семидесятая", "семидесятого", "семидесятом"]);
addNumber(80, ["восемьдесят", "восьмидесятый", "восьмидесятая", "восьмидесятого", "восьмидесятом"]);
addNumber(90, ["девяносто", "девяностый", "девяностая", "девяностого", "девяностом"]);
addNumber(100, ["сто", "сотый", "сотая", "сотого", "сотом"]);

function normalize(text: string): string {
  return text.toLocaleLowerCase("ru-RU").replaceAll("ё", "е").replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
}

function tokens(text: string): string[] {
  return normalize(text).match(/[а-яa-z0-9]+/g) ?? [];
}

function tokenNumber(word: string): number | null {
  if (/^\d{1,3}$/.test(word)) return Number(word);
  return NUMBER_WORDS[word] ?? null;
}

function sumNumberValues(values: number[]): number | null {
  if (values.length === 0) return null;
  const total = values.reduce((sum, value) => sum + value, 0);
  return total > 0 && total <= 176 ? total : null;
}

function parseTrailingNumber(words: string[]): number | null {
  const values: number[] = [];
  for (let index = words.length - 1; index >= Math.max(0, words.length - 5); index -= 1) {
    const value = tokenNumber(words[index]);
    if (value === null) {
      if (values.length > 0) break;
      continue;
    }
    values.unshift(value);
  }
  return sumNumberValues(values);
}

function parseLeadingNumber(words: string[]): number | null {
  const values: number[] = [];
  const fillers = new Set(["номер", "это", "с", "со"]);
  for (const word of words.slice(0, 5)) {
    const value = tokenNumber(word);
    if (value === null) {
      if (values.length > 0) break;
      if (fillers.has(word)) continue;
      break;
    }
    values.push(value);
  }
  return sumNumberValues(values);
}

function numberNearLabel(text: string, label: RegExp): number | null {
  const match = label.exec(text);
  if (!match || match.index === undefined) return null;
  const before = tokens(text.slice(Math.max(0, match.index - 55), match.index));
  const after = tokens(text.slice(match.index + match[0].length, match.index + match[0].length + 55));
  const beforeValue = parseTrailingNumber(before);
  if (beforeValue) return beforeValue;
  return parseLeadingNumber(after);
}

function verseRangeNearLabel(text: string): { verseStart: number; verseEnd?: number } | null {
  const label = /стих(?:а|е|и|ов|ом)?/.exec(text);
  if (!label || label.index === undefined) return null;
  const before = tokens(text.slice(Math.max(0, label.index - 70), label.index));
  const connectors = new Set(["и", "до", "по"]);
  for (let index = before.length - 2; index >= Math.max(0, before.length - 8); index -= 1) {
    if (!connectors.has(before[index])) continue;
    const verseStart = parseTrailingNumber(before.slice(0, index));
    const verseEnd = parseLeadingNumber(before.slice(index + 1));
    if (verseStart && verseEnd && verseEnd >= verseStart) return { verseStart, verseEnd };
  }
  const verseStart = parseTrailingNumber(before) ?? numberNearLabel(text, /стих(?:а|е|и|ов|ом)?/);
  return verseStart ? { verseStart } : null;
}

function findBook(text: string): BookMatch | null {
  let best: BookMatch | null = null;
  for (const book of BOOKS) {
    for (const alias of book.aliases) {
      const index = text.lastIndexOf(alias);
      if (index < 0) continue;
      if (!best || alias.length > best.length || index > best.index) {
        best = { ...book, index, length: alias.length };
      }
    }
  }
  return best;
}

function explicitReference(text: string, book: BookMatch | null): { chapter: number; verseStart: number; verseEnd?: number } | null {
  const searchText = book ? text.slice(book.index + book.length, book.index + book.length + 90) : text;
  const match = searchText.match(/(?:глава\s*)?(\d{1,3})\s*[:.]\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?/);
  if (!match) return null;
  const chapter = Number(match[1]);
  const verseStart = Number(match[2]);
  const verseEnd = match[3] ? Number(match[3]) : undefined;
  if (chapter < 1 || chapter > 150 || verseStart < 1 || verseStart > 176) return null;
  return { chapter, verseStart, verseEnd };
}

function referenceKey(bookId: string, chapter: number, verseStart: number, verseEnd?: number): string {
  return `${bookId}:${chapter}:${verseStart}:${verseEnd ?? ""}`;
}

export class RussianVerseReferenceDetector {
  private contextBook: BookDefinition | null = null;
  private contextChapter: number | null = null;
  private contextUpdatedAt = 0;
  private readonly recent = new Map<string, number>();

  reset(): void {
    this.contextBook = null;
    this.contextChapter = null;
    this.contextUpdatedAt = 0;
    this.recent.clear();
  }

  readContext(now = Date.now()): RussianVerseContext {
    if (this.contextUpdatedAt && now - this.contextUpdatedAt > CONTEXT_TTL_MS) {
      this.contextBook = null;
      this.contextChapter = null;
      this.contextUpdatedAt = 0;
    }
    return {
      bookId: this.contextBook?.id ?? null,
      book: this.contextBook?.book ?? null,
      canonicalBook: this.contextBook?.canonicalBook ?? null,
      chapter: this.contextChapter,
      updatedAt: this.contextUpdatedAt ? new Date(this.contextUpdatedAt).toISOString() : null,
    };
  }

  consume(sourceText: string, now = Date.now()): RussianVerseReference[] {
    const text = normalize(sourceText);
    if (!text) return [];
    this.readContext(now);

    const bookMatch = findBook(text);
    const previousBook = this.contextBook;
    if (bookMatch) {
      this.contextBook = bookMatch;
      if (previousBook?.id !== bookMatch.id) this.contextChapter = null;
      this.contextUpdatedAt = now;
    }

    const exact = explicitReference(text, bookMatch);
    const spokenVerses = exact ? null : verseRangeNearLabel(text);
    const verseStart = exact?.verseStart ?? spokenVerses?.verseStart ?? null;
    const verseEnd = exact?.verseEnd ?? spokenVerses?.verseEnd;
    const chapter = exact?.chapter
      ?? numberNearLabel(text, /глав(?:а|ы|е|у|ой|ою)/)
      ?? (verseStart ? this.contextBook?.verseOnlyChapter ?? null : null);

    if (chapter && chapter <= 150) {
      this.contextChapter = chapter;
      this.contextUpdatedAt = now;
    }

    if (!verseStart || !this.contextBook || !this.contextChapter) return [];
    const key = referenceKey(this.contextBook.id, this.contextChapter, verseStart, verseEnd);
    const lastSeen = this.recent.get(key) ?? 0;
    if (now - lastSeen < DUPLICATE_TTL_MS) return [];
    this.recent.set(key, now);
    for (const [recentKey, timestamp] of this.recent) {
      if (now - timestamp > CONTEXT_TTL_MS) this.recent.delete(recentKey);
    }

    const suffix = verseEnd ? `${verseStart}–${verseEnd}` : String(verseStart);
    const confidence: RussianVerseConfidence = bookMatch && chapter ? "exact" : "context";
    return [{
      id: `${key}:${now}`,
      bookId: this.contextBook.id,
      book: this.contextBook.book,
      canonicalBook: this.contextBook.canonicalBook,
      chapter: this.contextChapter,
      verseStart,
      verseEnd,
      display: `${this.contextBook.book} ${this.contextChapter}:${suffix}`,
      canonical: `${this.contextBook.canonicalBook} ${this.contextChapter}:${suffix}`,
      confidence,
      sourceText: sourceText.trim(),
      detectedAt: new Date(now).toISOString(),
    }];
  }
}
