import assert from "node:assert/strict";
import { BibleVerseReferenceDetector, BOOKS } from "../parser.js";

function detect(language, parts) {
  const detector = new BibleVerseReferenceDetector(language);
  const start = Date.now();
  return parts.flatMap((part, index) => detector.consume(part, start + index * 1_000));
}

const russianCases = [
  { expected: "Mark 10:13", parts: ["Евангелие от Марка.", "Читаю Марка, 10 глава, с 13 стиха."] },
  { expected: "Mark 4:3", parts: ["Давайте откроем Евангелие от Марка.", "Это четвертая глава.", "А теперь третий стих."] },
  { expected: "Matthew 24:23", parts: ["Матфея 24:23"] },
  { expected: "1 Corinthians 16:14", parts: ["Первое Коринфянам, шестнадцатая глава, четырнадцатый стих."] },
  { expected: "1 Corinthians 16:14", parts: ["Это первое коринфианом, 16 глава. 14 стих."] },
  { expected: "Genesis 18:19", parts: ["Читаю БТЕ 18 глава, 19 стих."] },
  { expected: "Malachi 4:5–6", parts: ["Малахии, последние два стишка Старого Завета: 5 и 6 стих."] },
  { expected: "Luke 12:13", parts: ["Записан Евангелистом Лукой в 12 главе с 13 стиха."] },
  { expected: "Ezra 7:10", parts: ["Откроем книгу Ездры, седьмая глава, десятый стих."] },
  { expected: "1 Chronicles 4:9", parts: ["Первое Паралипоменон, четвертая глава, девятый стих."] },
];

for (const testCase of russianCases) {
  assert.equal(detect("ru", testCase.parts)[0]?.canonical, testCase.expected);
}

const startedAt = Date.now();
const longRussianContext = new BibleVerseReferenceDetector("ru");
assert.deepEqual(longRussianContext.consume("Откроем Евангелие от Матфея.", startedAt), []);
assert.deepEqual(longRussianContext.consume("Начнем с четырнадцатой главы.", startedAt + 12 * 60_000), []);
assert.equal(longRussianContext.consume("Теперь восьмой стих.", startedAt + 27 * 60_000)[0]?.canonical, "Matthew 14:8");

const switchedBook = new BibleVerseReferenceDetector("ru");
assert.deepEqual(switchedBook.consume("Марка, четвертая глава.", startedAt), []);
assert.deepEqual(switchedBook.consume("Теперь откроем Матфея.", startedAt + 1_000), []);
assert.deepEqual(switchedBook.consume("Восьмой стих.", startedAt + 2_000), []);
assert.deepEqual(switchedBook.consume("Четырнадцатая глава.", startedAt + 3_000), []);
assert.equal(switchedBook.consume("Восьмой стих.", startedAt + 4_000)[0]?.canonical, "Matthew 14:8");

const asrBookSwitch = new BibleVerseReferenceDetector("ru");
assert.equal(asrBookSwitch.consume("Марка 10:13", startedAt)[0]?.canonical, "Mark 10:13");
assert.equal(asrBookSwitch.consume("Матвея 19:20", startedAt + 1_000)[0]?.canonical, "Matthew 19:20");

const spokenCorrection = new BibleVerseReferenceDetector("ru");
assert.equal(spokenCorrection.consume("Марка 10:13", startedAt)[0]?.canonical, "Mark 10:13");
assert.deepEqual(spokenCorrection.consume("Ой, братья, я имел в виду Псалмы.", startedAt + 1_000), []);
assert.equal(spokenCorrection.readContext(startedAt + 1_000).canonicalBook, "Psalms");
assert.equal(spokenCorrection.consume("Девятнадцатый псалом, шестой стих.", startedAt + 2_000)[0]?.canonical, "Psalms 19:6");

const explicitCorrection = new BibleVerseReferenceDetector("ru");
assert.equal(explicitCorrection.consume("Марка 10:13", startedAt)[0]?.canonical, "Mark 10:13");
assert.equal(explicitCorrection.consume("Нет, не Марка, а Матвея 19:20.", startedAt + 1_000)[0]?.canonical, "Matthew 19:20");

const fuzzyRussian = new BibleVerseReferenceDetector("ru");
assert.equal(fuzzyRussian.consume("Марка 10:13", startedAt)[0]?.canonical, "Mark 10:13");
assert.equal(fuzzyRussian.consume("Матфеья 19:20", startedAt + 1_000)[0]?.canonical, "Matthew 19:20");

const asrInflection = new BibleVerseReferenceDetector("ru");
assert.equal(
  asrInflection.consume("Давайте прочитаем малахией последние два стишка: пятый и шестой стих.", startedAt)[0]?.canonical,
  "Malachi 4:5–6",
);

const russianNumericRange = new BibleVerseReferenceDetector("ru");
russianNumericRange.consume("Давайте мы откроем Левит.", startedAt);
russianNumericRange.consume("23 глава 15", startedAt + 1_000);
assert.equal(
  russianNumericRange.consume("23 глава, 15-16 стих, я хочу зачитать.", startedAt + 2_000)[0]?.canonical,
  "Leviticus 23:15–16",
  "a hyphenated Russian range must open at its first verse and retain the next verse",
);

const splitOrdinal = new BibleVerseReferenceDetector("ru");
splitOrdinal.consume("Откроем Евангелие от Матфея, двадцать", startedAt);
assert.equal(splitOrdinal.consume("четвертая глава, третий стих", startedAt + 1_000)[0]?.canonical, "Matthew 24:3");

const splitEnglishOrdinal = new BibleVerseReferenceDetector("en");
splitEnglishOrdinal.consume("Open the Gospel of Matthew chapter twenty", startedAt);
assert.equal(splitEnglishOrdinal.consume("four verse three", startedAt + 1_000)[0]?.canonical, "Matthew 24:3");

const splitVerseOrdinal = new BibleVerseReferenceDetector("ru");
splitVerseOrdinal.consume("Первое послание Петра, третья глава, двадцать", startedAt);
assert.equal(splitVerseOrdinal.consume("первый стих", startedAt + 1_000)[0]?.canonical, "1 Peter 3:21");

const scriptureProse = new BibleVerseReferenceDetector("ru");
scriptureProse.consume("прочитываем главу Священного Писания", startedAt);
scriptureProse.consume("пятнадцатая глава", startedAt + 40_000);
assert.equal(scriptureProse.readContext(startedAt + 40_000).bookId, null);

const numberedFamily = new BibleVerseReferenceDetector("ru");
numberedFamily.consume("Псалом двадцать второй", startedAt);
numberedFamily.consume("Апостол Павел к Коринфянам в четвертой главе", startedAt + 1_000);
assert.equal(numberedFamily.readContext(startedAt + 1_000).bookId, null);

const damagedVerseLabel = new BibleVerseReferenceDetector("ru");
assert.equal(damagedVerseLabel.consume("кримля нам, двенадцатая глава, со второго с тихана", startedAt)[0]?.canonical, "Romans 12:2");

function singleAsrMutation(alias, language) {
  const ignored = new Set(language === "ru"
    ? ["книга", "к", "от", "послание", "евангелие"]
    : ["book", "of", "the", "letter", "gospel", "according", "to"]);
  const words = alias.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  const target = words
    .filter((word) => !ignored.has(word) && /\p{L}/u.test(word))
    .sort((left, right) => right.length - left.length)[0];
  if (!target) return alias;
  const index = Math.max(0, Math.floor(target.length / 2));
  const replacement = target[index] === "а" ? "о" : target[index] === "a" ? "e" : "а";
  return alias.replace(target, `${target.slice(0, index)}${replacement}${target.slice(index + 1)}`);
}

for (const language of ["ru", "en"]) {
  for (const book of BOOKS) {
    const mutated = singleAsrMutation(book.names[language], language);
    const detector = new BibleVerseReferenceDetector(language);
    assert.equal(
      detector.consume(`${mutated} 1:1`, startedAt)[0]?.bookId,
      book.id,
      `${language} ASR-tolerant matching should cover ${book.canonicalBook}: ${mutated}`,
    );
  }
}

const droppedConnector = new BibleVerseReferenceDetector("en");
assert.equal(droppedConnector.consume("Song Solomon 2:1", startedAt)[0]?.canonical, "Song of Solomon 2:1");

const ambiguousNoise = new BibleVerseReferenceDetector("ru");
assert.deepEqual(ambiguousNoise.consume("Это стих пять о малом совете.", startedAt), []);

const contextualRussianDigits = new BibleVerseReferenceDetector("ru");
assert.equal(contextualRussianDigits.consume("Марка 10:13", startedAt)[0]?.canonical, "Mark 10:13");
assert.equal(contextualRussianDigits.consume("Теперь 12:20.", startedAt + 1_000)[0]?.canonical, "Mark 12:20");

const cancelledRussianBook = new BibleVerseReferenceDetector("ru");
assert.equal(cancelledRussianBook.consume("Марка 10:13", startedAt)[0]?.canonical, "Mark 10:13");
assert.deepEqual(cancelledRussianBook.consume("Нет, братья, не Марка.", startedAt + 1_000), []);
assert.equal(cancelledRussianBook.readContext(startedAt + 1_000).canonicalBook, null);

for (const phrase of [
  "В Евангелии от Яна первая голова, первый стих.",
  "Ивангелия Тиана. Первая глава, первый стих.",
  "Ангелия Тиана, первая голова, первый стих.",
]) {
  const detector = new BibleVerseReferenceDetector("ru");
  assert.equal(detector.consume(phrase, startedAt)[0]?.canonical, "John 1:1", `John Gospel ASR repair failed: ${phrase}`);
}

const numericRussianOrdinals = new BibleVerseReferenceDetector("ru");
assert.deepEqual(numericRussianOrdinals.consume("Евангелия от Марка.", startedAt), []);
assert.equal(
  numericRussianOrdinals.consume("Я буду читать 16-го главы с 15-го стиха.", startedAt + 1_000)[0]?.canonical,
  "Mark 16:15",
  "numeric Russian ordinal suffixes must not turn the verse into the chapter",
);

const inflectedSecondPeter = new BibleVerseReferenceDetector("ru");
assert.deepEqual(inflectedSecondPeter.consume("Во втором послании Петра с первой главы, с", startedAt), []);
assert.equal(inflectedSecondPeter.consume("десятого стиха", startedAt + 1_000)[0]?.canonical, "2 Peter 1:10");

const trailingOrdinalEpistle = new BibleVerseReferenceDetector("ru");
assert.deepEqual(trailingOrdinalEpistle.consume("Послание к Коринфянам второе говорит", startedAt), []);
assert.equal(trailingOrdinalEpistle.readContext(startedAt).canonicalBook, "2 Corinthians");

const nearestBookChapter = new BibleVerseReferenceDetector("ru");
assert.deepEqual(nearestBookChapter.consume("первая глава. Евреям тринадцатая глава.", startedAt), []);
assert.equal(nearestBookChapter.consume("Пятый стих.", startedAt + 1_000)[0]?.canonical, "Hebrews 13:5");

const contextualClockTime = new BibleVerseReferenceDetector("ru");
assert.deepEqual(contextualClockTime.consume("Псалом пятнадцатый", startedAt), []);
assert.deepEqual(contextualClockTime.consume("Я посплю до без 15:10, а там поеду", startedAt + 1_000), []);

const ordinaryDanielCount = new BibleVerseReferenceDetector("ru");
assert.deepEqual(ordinaryDanielCount.consume("Это желание Даниила три раза молиться", startedAt), []);
assert.equal(ordinaryDanielCount.readContext(startedAt).chapter, null);

const englishCases = [
  { expected: "Matthew 19:20", parts: ["Matthew 19:20"] },
  { expected: "Matthew 19:20", parts: ["Let's open our Bibles to Matthew.", "We are starting from chapter nineteen.", "Now this is verse twenty."] },
  { expected: "Matthew 19:20", parts: ["Matthew nineteen twenty"] },
  { expected: "Matthew 24:23", parts: ["Matthew 24 23"] },
  { expected: "1 John 3:16", parts: ["First John three sixteen"] },
  { expected: "1 Corinthians 13:4", parts: ["First Corinthians chapter thirteen verse four"] },
  { expected: "Psalms 23:4", parts: ["Psalm 23 verse 4"] },
  { expected: "Psalms 119:105", parts: ["Psalm one hundred nineteen, verse one hundred five"] },
  { expected: "2 Timothy 3:16–17", parts: ["Second Timothy chapter three, verses sixteen through seventeen"] },
  { expected: "Jude 1:3", parts: ["Jude verse three"] },
  { expected: "Matthew 14:8", parts: ["Mattew chapter fourteen verse eight"] },
];

for (const testCase of englishCases) {
  assert.equal(detect("en", testCase.parts)[0]?.canonical, testCase.expected);
}

const compactEnglishReference = new BibleVerseReferenceDetector("en");
assert.equal(compactEnglishReference.consume("Deuteronomy 3327", startedAt)[0]?.canonical, "Deuteronomy 33:27");

const compactExodusReference = new BibleVerseReferenceDetector("en");
assert.equal(compactExodusReference.consume("Exodus 3314", startedAt)[0]?.canonical, "Exodus 33:14");

const spokenEnglishRange = new BibleVerseReferenceDetector("en");
assert.equal(spokenEnglishRange.consume("Psalm 46, two and three.", startedAt)[0]?.canonical, "Psalms 46:2–3");

const hyphenatedEnglishRange = new BibleVerseReferenceDetector("en");
assert.equal(
  hyphenatedEnglishRange.consume("Second Timothy chapter 3, verses 16-17", startedAt)[0]?.canonical,
  "2 Timothy 3:16–17",
);

const splitEnglishRange = new BibleVerseReferenceDetector("en");
assert.deepEqual(splitEnglishRange.consume("Psalm 46", startedAt), []);
assert.equal(splitEnglishRange.consume("4 through 7. Here", startedAt + 2_500)[0]?.canonical, "Psalms 46:4–7");

const possessiveSplitChapter = new BibleVerseReferenceDetector("en");
assert.deepEqual(possessiveSplitChapter.consume("and again in John's", startedAt), []);
assert.deepEqual(possessiveSplitChapter.consume("7 on the last day of the feast", startedAt + 2_000), []);
assert.equal(possessiveSplitChapter.readContext(startedAt + 2_000).chapter, 7, "John's followed by 7 must establish John 7 context");

const patientVerseLabel = new BibleVerseReferenceDetector("en");
assert.deepEqual(patientVerseLabel.consume("to the New Testament, John 4 verses", startedAt), []);
assert.equal(patientVerseLabel.readContext(startedAt).chapter, 4, "an unfinished plural verse label must retain chapter context only");
assert.equal(patientVerseLabel.consume("13 and 14 says Jesus answered", startedAt + 2_000)[0]?.canonical, "John 4:13–14");

const possessiveSameLine = new BibleVerseReferenceDetector("en");
assert.deepEqual(possessiveSameLine.consume("Look again in John's 7", startedAt), []);
assert.equal(possessiveSameLine.readContext(startedAt).chapter, 7);

const staleBareRange = new BibleVerseReferenceDetector("en");
assert.deepEqual(staleBareRange.consume("Psalm 46", startedAt), []);
assert.deepEqual(staleBareRange.consume("4 through 7 people", startedAt + 20_000), []);

const repeatedPsalmBook = new BibleVerseReferenceDetector("en");
assert.deepEqual(repeatedPsalmBook.consume("Psalm 102. I'm letting the Psalm teach us.", startedAt), []);
assert.equal(repeatedPsalmBook.readContext(startedAt).chapter, 102);

const ambiguousCompactReference = new BibleVerseReferenceDetector("en");
assert.deepEqual(ambiguousCompactReference.consume("Matthew 123", startedAt), []);

const englishCorrection = new BibleVerseReferenceDetector("en");
assert.equal(englishCorrection.consume("Mark 10:13", startedAt)[0]?.canonical, "Mark 10:13");
assert.deepEqual(englishCorrection.consume("Oops brothers, sorry, I meant Psalms.", startedAt + 1_000), []);
assert.equal(englishCorrection.readContext(startedAt + 1_000).canonicalBook, "Psalms");
assert.equal(englishCorrection.consume("Psalm twenty-three, verse four.", startedAt + 2_000)[0]?.canonical, "Psalms 23:4");

const explicitEnglishCorrection = new BibleVerseReferenceDetector("en");
assert.equal(explicitEnglishCorrection.consume("Mark 10:13", startedAt)[0]?.canonical, "Mark 10:13");
assert.equal(explicitEnglishCorrection.consume("No, not Mark but Matthew 19:20.", startedAt + 1_000)[0]?.canonical, "Matthew 19:20");

const longEnglishContext = new BibleVerseReferenceDetector("en");
assert.deepEqual(longEnglishContext.consume("We will read from Matthew.", startedAt), []);
assert.deepEqual(longEnglishContext.consume("Starting in chapter fourteen.", startedAt + 31 * 60_000), []);
assert.equal(longEnglishContext.consume("Now verse eight.", startedAt + 95 * 60_000)[0]?.canonical, "Matthew 14:8");

const contextualEnglishDigits = new BibleVerseReferenceDetector("en");
assert.equal(contextualEnglishDigits.consume("Mark 10:13", startedAt)[0]?.canonical, "Mark 10:13");
assert.equal(contextualEnglishDigits.consume("Now 12:7", startedAt + 1_000)[0]?.canonical, "Mark 12:7");

const cancelledEnglishBook = new BibleVerseReferenceDetector("en");
assert.equal(cancelledEnglishBook.consume("Mark 10:13", startedAt)[0]?.canonical, "Mark 10:13");
assert.deepEqual(cancelledEnglishBook.consume("No, not Mark.", startedAt + 1_000), []);
assert.equal(cancelledEnglishBook.readContext(startedAt + 1_000).canonicalBook, null);

const languageSwitch = new BibleVerseReferenceDetector("ru");
assert.equal(languageSwitch.consume("Матфея 19:20", startedAt)[0]?.canonical, "Matthew 19:20");
languageSwitch.setLanguage("en");
assert.equal(languageSwitch.readContext().canonicalBook, null);
assert.equal(languageSwitch.consume("First John 3:16", startedAt + 1_000)[0]?.canonical, "1 John 3:16");

console.log("Parser: 35 stateful Russian and English reference scenarios passed");
