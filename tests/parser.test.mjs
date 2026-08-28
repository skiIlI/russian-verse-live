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

console.log("Parser: 10 stateful Russian reference scenarios passed");
