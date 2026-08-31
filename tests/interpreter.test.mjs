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
const cleanJohnVerse = new VerseCorpusIndex(englishDocument).byKey.get("john:7:37");
assert.ok(!cleanJohnVerse?.meaningful.includes("strong"), "Strong's markup must not enter the English quote index");

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

const godSaidQuote = await interpretTranscript(
  "Take a look at what God said. My presence will go with you and I will give you rest.",
  "en",
  { corpus: new VerseCorpusIndex(englishDocument) },
);

const spokenPsalmRange = await interpretTranscript(
  "Psalm 46, two and three.",
  "en",
  { corpus: new VerseCorpusIndex(englishDocument) },
);

const russianReportedRange = await interpretTranscript([
  "Давайте мы откроем Левит.",
  "23 глава, 15-16 стих, хочу зачитать.",
  "Отсчитайте себе от первого дня после праздника, от того дня, в который приносите сноп потрясания, семь полных недель.",
  "До первого дня после седьмой недели отсчитайте пятьдесят дней, и тогда принесите новое хлебное приношение Господу.",
].join("\n"), "ru", { corpus: new VerseCorpusIndex(russianDocument) });

const sequentialPsalmReading = await interpretTranscript([
  "Psalm 102. I'm letting the Psalm teach us, so let's read what it says.",
  "Of old, you laid the foundation of the earth, and the heavens are the work of your hands.",
  "But you will endure. Yes, they will all grow old like a garment; like a cloak, you will change them, and they will be changed.",
  "But you are the same, and your years will have no end.",
  "The children of your servants will continue, and their descendants will be established before you.",
].join("\n"), "en", { corpus: new VerseCorpusIndex(englishDocument) });
assert.deepEqual(
  sequentialPsalmReading.events.filter((event) => event.type === "read").map((event) => event.reference.canonical),
  ["Psalms 102:25", "Psalms 102:26", "Psalms 102:27", "Psalms 102:28"],
  "a chapter-context reading must surface every consecutive verse, including short middle verses",
);
assert.equal(
  spokenPsalmRange.events.find((event) => event.basis === "explicit-reference")?.reference?.canonical,
  "Psalms 46:2–3",
  "a spoken verse range should resolve before the reading begins",
);
assert.equal(
  russianReportedRange.events.find((event) => event.basis === "explicit-reference")?.reference?.canonical,
  "Leviticus 23:15–16",
  "the reported Russian numeric range should open at verse 15",
);
assert.deepEqual(
  russianReportedRange.events.filter((event) => event.type === "read").map((event) => event.reference.canonical),
  ["Leviticus 23:15", "Leviticus 23:16"],
  "a Russian range should actively follow both consecutive verses",
);
assert.equal(
  godSaidQuote.events.find((event) => event.type === "read")?.reference?.canonical,
  "Exodus 33:14",
  "an explicit God-said introduction should authorize a strong short Scripture quote",
);

const signaturePsalmOpening = await interpretTranscript([
  "verses 10 and 11. Notice what",
  "the psalmist says, Be still at",
  "know that I am God.",
].join("\n"), "en", { corpus: new VerseCorpusIndex(englishDocument) });
assert.equal(
  signaturePsalmOpening.events.find((event) => event.type === "read")?.reference?.canonical,
  "Psalms 46:10",
  "a cued three-anchor signature opening should identify a prominent verse immediately",
);

const possessiveJohnReading = await interpretTranscript([
  "of water springing up into everlasting life and again in John's",
  "7 on the last day that great",
  "day of the feast, Jesus stood and cried out saying,",
  "If any man thirsts, let him come to me and drink.",
  "He who believes in me as the scripture has said out of his heart will flow rivers of living water.",
].join("\n"), "en", { corpus: new VerseCorpusIndex(englishDocument) });
assert.equal(possessiveJohnReading.events.find((event) => event.type === "context")?.reference?.canonical, "John 7");
assert.ok(
  possessiveJohnReading.events.some((event) => event.type === "read" && event.reference?.canonical === "John 7:37"),
  "John's 7 plus the quoted text must identify John 7:37",
);

const consecutiveVerse = await interpretTranscript([
  "Open 2 Kings 18:6.",
  englishDocument.verses.find(([book, chapter, verse]) => book === "2-kings" && chapter === 18 && verse === 6)[3],
  "And the LORD was with him; wherever he went he prospered.",
].join("\n"), "en", { corpus: new VerseCorpusIndex(englishDocument) });
assert.ok(
  consecutiveVerse.events.some((event) => event.type === "read" && event.reference?.canonical === "2 Kings 18:7"),
  "a strong opening of the immediate next verse should advance before most of that verse is read",
);
assert.ok(
  consecutiveVerse.events.some((event) => event.type === "advance" && event.reference?.canonical === "2 Kings 18:7"),
  "an inferred consecutive reading should surface a next-verse boundary",
);

const weakConsecutiveCue = await interpretTranscript([
  "Open 2 Kings 18:6.",
  englishDocument.verses.find(([book, chapter, verse]) => book === "2-kings" && chapter === 18 && verse === 6)[3],
  "And the LORD was with him.",
].join("\n"), "en", { corpus: new VerseCorpusIndex(englishDocument) });
assert.ok(
  !weakConsecutiveCue.events.some((event) => event.type === "read" && event.reference?.canonical === "2 Kings 18:7"),
  "a generic one-word overlap must not advance to the next verse",
);

const anticipatedEnglishRange = await interpretTranscript([
  "Open Matthew 7:7-9.",
  "Knock, and it will be opened for you.",
  "For everyone who asks receives. He who seeks finds. To him who knocks it will be opened.",
].join("\n"), "en", { corpus: new VerseCorpusIndex(englishDocument) });
assert.deepEqual(
  anticipatedEnglishRange.events.filter((event) => event.type === "advance").map((event) => event.reference?.canonical),
  ["Matthew 7:8", "Matthew 7:9"],
  "an explicit range should advance from each strong ending before the following verse begins",
);

const anticipatedRussianRange = await interpretTranscript([
  "Евангелие от Матфея, глава 7, стихи 7 по 9.",
  "стучите, и отворят вам.",
  "ибо всякий просящий получает, и ищущий находит, и стучащему отворят.",
].join("\n"), "ru", { corpus: new VerseCorpusIndex(russianDocument) });
assert.deepEqual(
  anticipatedRussianRange.events.filter((event) => event.type === "advance").map((event) => event.reference?.canonical),
  ["Matthew 7:8", "Matthew 7:9"],
  "Russian readings need the same proactive range progression as English",
);

const anticipatedOpenEnded = await interpretTranscript([
  "Open Matthew 22:11.",
  "He saw there a man who didn't have on wedding clothing.",
].join("\n"), "en", { corpus: new VerseCorpusIndex(englishDocument) });
assert.ok(
  anticipatedOpenEnded.events.some((event) => event.type === "advance" && event.reference?.canonical === "Matthew 22:12"),
  "a strong ending should prepare the next verse even when no range was announced",
);

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
