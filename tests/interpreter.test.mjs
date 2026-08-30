import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import {
  VerseCorpusIndex,
  interpretTranscript,
  parseTranscript,
} from "../interpreter.js";

const root = new URL("../", import.meta.url);
const [transcriptName] = await readdir(new URL("transcripts/", root));
const [transcript, truth, russianDocument, englishDocument] = await Promise.all([
  readFile(new URL(`transcripts/${transcriptName}`, root), "utf8"),
  readFile(new URL("tests/fixtures/august-16-2026-ground-truth.json", root), "utf8").then(JSON.parse),
  readFile(new URL("data/russyn.json", root), "utf8").then(JSON.parse),
  readFile(new URL("data/engwebp.json", root), "utf8").then(JSON.parse),
]);

assert.equal(russianDocument.license, "Public Domain");
assert.equal(englishDocument.license, "Public Domain");
assert.ok(russianDocument.verses.length > 31_000);
assert.ok(englishDocument.verses.length > 31_000);

const segments = parseTranscript(transcript);
assert.equal(segments.length, 832);
assert.equal(segments.find((segment) => segment.timestamp === "1:43")?.text, "Я хочу зачитать всеми нам известный псалом. Это псалом номер 22.");
assert.ok(segments.find((segment) => segment.timestamp === "11:10")?.isPrayer);
assert.ok(segments.find((segment) => segment.timestamp === "39:10")?.isMusic);

const russian = await interpretTranscript(transcript, "ru", { corpus: new VerseCorpusIndex(russianDocument) });
for (const section of truth.sections) {
  const inSection = (event) => event.seconds >= section.startSeconds && event.seconds <= section.endSeconds;
  const readings = russian.events
    .filter((event) => event.type === "read" && inSection(event))
    .map((event) => `${event.timestamp}|${event.reference.canonical}`);
  assert.deepEqual(readings, section.readings, `${section.id} reading audit drifted`);

  const references = russian.events
    .filter((event) => ["context", "open", "jump", "next", "previous"].includes(event.type) && event.basis !== "reading-boundary" && inSection(event))
    .map((event) => `${event.timestamp}|${event.action}|${event.reference?.canonical ?? "unresolved"}`);
  assert.deepEqual(references, section.references, `${section.id} reference/navigation audit drifted`);
}

const englishSample = [
  "If I speak with the languages of people and angels but have no love, I become sounding brass or a clanging cymbal.",
  "With prophecy, all mysteries, all knowledge, and faith to move mountains, without love I am nothing.",
].join("\n");
const english = await interpretTranscript(englishSample, "en", { corpus: new VerseCorpusIndex(englishDocument) });
assert.deepEqual(
  english.events.filter((event) => event.type === "read").map((event) => event.reference.canonical),
  ["1 Corinthians 13:1", "1 Corinthians 13:2"],
);
assert.equal(english.events.find((event) => event.type === "advance")?.reference?.canonical, "1 Corinthians 13:2");

const navigation = await interpretTranscript([
  "Open Matthew 12:24.",
  "Move to the next verse.",
  "Go back to verse seven.",
  "Now the previous verse.",
].join("\n"), "en", { corpus: new VerseCorpusIndex(englishDocument) });
assert.equal(navigation.events.find((event) => event.type === "open")?.reference?.canonical, "Matthew 12:24");
assert.equal(navigation.events.find((event) => event.type === "next")?.reference?.canonical, "Matthew 12:25");
assert.equal(navigation.events.find((event) => event.type === "jump")?.reference?.canonical, "Matthew 12:7");
assert.equal(navigation.events.find((event) => event.type === "previous")?.reference?.canonical, "Matthew 12:6");

const psalmPartialQuote = await interpretTranscript(
  "3:00 Я хотел бы начать с места писания, псалом 118, где написано: Милости твоей, Господи, полна земля. Слава Богу.",
  "ru",
  { corpus: new VerseCorpusIndex(russianDocument) },
);
assert.equal(
  psalmPartialQuote.events.find((event) => event.type === "read")?.reference?.canonical,
  "Psalms 118:64",
  "A strong partial quote inside explicit chapter context should resolve to Psalm 118:64",
);

const splitCompoundChapter = await interpretTranscript([
  "29:21 книгой Евангелия Матфея, двадцать",
  "29:24 четвертая глава.",
].join("\n"), "ru", { corpus: new VerseCorpusIndex(russianDocument) });
assert.equal(
  splitCompoundChapter.events.find((event) => event.type === "context")?.reference?.canonical,
  "Matthew 24",
  "A compound chapter number split by caption boundaries should remain intact",
);

const ordinaryScriptureProse = await interpretTranscript(
  "20:00 Христос говорил притчи с народом и часто брал стихи из Писания.\n20:06 Новый Завет еще не был написан.",
  "ru",
  { corpus: new VerseCorpusIndex(russianDocument) },
);
assert.equal(ordinaryScriptureProse.events.length, 0, "ordinary sermon prose must not hallucinate a verse");

const splitDamagedBook = await interpretTranscript(
  "22:20 Кримлянам, а,\n22:23 двенадцатая глава, со второго стиха",
  "ru",
  { corpus: new VerseCorpusIndex(russianDocument) },
);
assert.equal(
  splitDamagedBook.events.find((event) => ["open", "jump"].includes(event.type))?.reference?.canonical,
  "Romans 12:2",
);

const unresolvedRelatedBook = await interpretTranscript(
  "29:07 книга Откровения связана с книгой, ба ла ма,\n29:13 уже со второй главы",
  "ru",
  { corpus: new VerseCorpusIndex(russianDocument) },
);
assert.equal(unresolvedRelatedBook.events.length, 0, "an unresolved second book must not inherit the first book's chapter");

const damagedRelatedBook = await interpretTranscript(
  "29:07 книга Откровения связана с книгой, да не ила,\n29:13 уже со второй главы",
  "ru",
  { corpus: new VerseCorpusIndex(russianDocument) },
);
assert.equal(damagedRelatedBook.events.find((event) => event.type === "context")?.reference?.canonical, "Daniel 2");

const ecclesiastesAsr = await interpretTranscript(
  "1:58:45 Есть вариант! Отпускай хлеб твоим поводам!\n1:58:49 Потому что попрышествием многих дней!\n1:58:52 Он опять возвратится к твоему дому.",
  "ru",
  { corpus: new VerseCorpusIndex(russianDocument) },
);
assert.equal(ecclesiastesAsr.events.find((event) => event.type === "read")?.reference?.canonical, "Ecclesiastes 11:1");

console.log("Interpreter: exact Russian sermon audit, cross-translation English matching, and navigation passed");
