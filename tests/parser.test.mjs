import assert from "node:assert/strict";
import { RussianVerseReferenceDetector } from "../parser.js";

function detect(parts) {
  const detector = new RussianVerseReferenceDetector();
  const start = Date.now();
  return parts.flatMap((part, index) => detector.consume(part, start + index * 1_000));
}

const cases = [
  {
    expected: "Mark 10:13",
    parts: ["Евангелие от Марка.", "Читаю Марка, 10 глава, с 13 стиха."],
  },
  {
    expected: "Mark 4:3",
    parts: ["Давайте откроем Евангелие от Марка.", "Это четвертая глава.", "А теперь третий стих."],
  },
  { expected: "Matthew 24:23", parts: ["Матфея 24:23"] },
  { expected: "1 Corinthians 16:14", parts: ["Первое Коринфянам, шестнадцатая глава, четырнадцатый стих."] },
  { expected: "1 Corinthians 16:14", parts: ["Это первое коринфианом, 16 глава. 14 стих."] },
  { expected: "Genesis 18:19", parts: ["Читаю БТЕ 18 глава, 19 стих."] },
  { expected: "Malachi 4:5–6", parts: ["Малахии, последние два стишка Старого Завета: 5 и 6 стих."] },
  { expected: "Luke 12:13", parts: ["Записан Евангелистом Лукой в 12 главе с 13 стиха."] },
];

for (const testCase of cases) {
  assert.equal(detect(testCase.parts)[0]?.canonical, testCase.expected);
}

const longContext = new RussianVerseReferenceDetector();
const startedAt = Date.now();
assert.deepEqual(longContext.consume("Откроем Евангелие от Матфея.", startedAt), []);
assert.deepEqual(longContext.consume("Начнем с четырнадцатой главы.", startedAt + 12 * 60_000), []);
assert.equal(
  longContext.consume("Теперь восьмой стих.", startedAt + 27 * 60_000)[0]?.canonical,
  "Matthew 14:8",
);

const switchedBook = new RussianVerseReferenceDetector();
assert.deepEqual(switchedBook.consume("Марка, четвертая глава.", startedAt), []);
assert.deepEqual(switchedBook.consume("Теперь откроем Матфея.", startedAt + 1_000), []);
assert.deepEqual(switchedBook.consume("Восьмой стих.", startedAt + 2_000), []);
assert.deepEqual(switchedBook.consume("Четырнадцатая глава.", startedAt + 3_000), []);
assert.equal(switchedBook.consume("Восьмой стих.", startedAt + 4_000)[0]?.canonical, "Matthew 14:8");

const asrBookSwitch = new RussianVerseReferenceDetector();
assert.equal(asrBookSwitch.consume("Марка 10:13", startedAt)[0]?.canonical, "Mark 10:13");
assert.equal(asrBookSwitch.consume("Матвея 19:20", startedAt + 1_000)[0]?.canonical, "Matthew 19:20");

const spokenCorrection = new RussianVerseReferenceDetector();
assert.equal(spokenCorrection.consume("Марка 10:13", startedAt)[0]?.canonical, "Mark 10:13");
assert.deepEqual(spokenCorrection.consume("Ой, братья, я имел в виду Псалмы.", startedAt + 1_000), []);
assert.equal(spokenCorrection.readContext(startedAt + 1_000).canonicalBook, "Psalms");
assert.equal(spokenCorrection.readContext(startedAt + 1_000).chapter, null);
assert.equal(
  spokenCorrection.consume("Девятнадцатый псалом, шестой стих.", startedAt + 2_000)[0]?.canonical,
  "Psalms 19:6",
);

const explicitCorrection = new RussianVerseReferenceDetector();
assert.equal(explicitCorrection.consume("Марка 10:13", startedAt)[0]?.canonical, "Mark 10:13");
assert.equal(
  explicitCorrection.consume("Нет, не Марка, а Матвея 19:20.", startedAt + 1_000)[0]?.canonical,
  "Matthew 19:20",
);

const fuzzyAsrSwitch = new RussianVerseReferenceDetector();
assert.equal(fuzzyAsrSwitch.consume("Марка 10:13", startedAt)[0]?.canonical, "Mark 10:13");
assert.equal(fuzzyAsrSwitch.consume("Матфеья 19:20", startedAt + 1_000)[0]?.canonical, "Matthew 19:20");

const contextualDigits = new RussianVerseReferenceDetector();
assert.equal(contextualDigits.consume("Марка 10:13", startedAt)[0]?.canonical, "Mark 10:13");
assert.equal(contextualDigits.consume("Теперь 19:20.", startedAt + 1_000)[0]?.canonical, "Mark 19:20");

const cancelledBook = new RussianVerseReferenceDetector();
assert.equal(cancelledBook.consume("Марка 10:13", startedAt)[0]?.canonical, "Mark 10:13");
assert.deepEqual(cancelledBook.consume("Нет, братья, не Марка.", startedAt + 1_000), []);
assert.equal(cancelledBook.readContext(startedAt + 1_000).canonicalBook, null);
assert.deepEqual(cancelledBook.consume("19:20", startedAt + 2_000), []);

console.log("Parser: 16 stateful Russian reference scenarios passed");
