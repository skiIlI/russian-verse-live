import { inflateRawSync } from "node:zlib";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIR = resolve(ROOT, "data");

const SOURCES = [
  {
    language: "ru",
    id: "russyn",
    translation: "Russian Synodal Bible",
    url: "https://ebible.org/Scriptures/russyn_usfm.zip",
  },
  {
    language: "en",
    id: "engwebp",
    translation: "World English Bible",
    url: "https://ebible.org/Scriptures/engwebp_usfm.zip",
  },
];

const BOOK_IDS = {
  GEN: "genesis", EXO: "exodus", LEV: "leviticus", NUM: "numbers", DEU: "deuteronomy",
  JOS: "joshua", JDG: "judges", RUT: "ruth", "1SA": "1-samuel", "2SA": "2-samuel",
  "1KI": "1-kings", "2KI": "2-kings", "1CH": "1-chronicles", "2CH": "2-chronicles",
  EZR: "ezra", NEH: "nehemiah", EST: "esther", JOB: "job", PSA: "psalms",
  PRO: "proverbs", ECC: "ecclesiastes", SNG: "song", ISA: "isaiah", JER: "jeremiah",
  LAM: "lamentations", EZK: "ezekiel", DAN: "daniel", HOS: "hosea", JOL: "joel",
  AMO: "amos", OBA: "obadiah", JON: "jonah", MIC: "micah", NAM: "nahum",
  HAB: "habakkuk", ZEP: "zephaniah", HAG: "haggai", ZEC: "zechariah", MAL: "malachi",
  MAT: "matthew", MRK: "mark", LUK: "luke", JHN: "john", ACT: "acts", ROM: "romans",
  "1CO": "1-corinthians", "2CO": "2-corinthians", GAL: "galatians", EPH: "ephesians",
  PHP: "philippians", COL: "colossians", "1TH": "1-thessalonians", "2TH": "2-thessalonians",
  "1TI": "1-timothy", "2TI": "2-timothy", TIT: "titus", PHM: "philemon", HEB: "hebrews",
  JAS: "james", "1PE": "1-peter", "2PE": "2-peter", "1JN": "1-john", "2JN": "2-john",
  "3JN": "3-john", JUD: "jude", REV: "revelation",
};

function findEndOfCentralDirectory(buffer) {
  const minimum = Math.max(0, buffer.length - 65_557);
  for (let offset = buffer.length - 22; offset >= minimum; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) return offset;
  }
  throw new Error("ZIP end-of-central-directory record was not found");
}

function unzip(buffer) {
  const end = findEndOfCentralDirectory(buffer);
  const entryCount = buffer.readUInt16LE(end + 10);
  let centralOffset = buffer.readUInt32LE(end + 16);
  const files = [];

  for (let index = 0; index < entryCount; index += 1) {
    if (buffer.readUInt32LE(centralOffset) !== 0x02014b50) throw new Error("Invalid ZIP central directory");
    const method = buffer.readUInt16LE(centralOffset + 10);
    const compressedSize = buffer.readUInt32LE(centralOffset + 20);
    const nameLength = buffer.readUInt16LE(centralOffset + 28);
    const extraLength = buffer.readUInt16LE(centralOffset + 30);
    const commentLength = buffer.readUInt16LE(centralOffset + 32);
    const localOffset = buffer.readUInt32LE(centralOffset + 42);
    const name = buffer.subarray(centralOffset + 46, centralOffset + 46 + nameLength).toString("utf8");
    centralOffset += 46 + nameLength + extraLength + commentLength;
    if (name.endsWith("/")) continue;

    if (buffer.readUInt32LE(localOffset) !== 0x04034b50) throw new Error(`Invalid local header for ${name}`);
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = buffer.subarray(dataOffset, dataOffset + compressedSize);
    const contents = method === 0 ? compressed : method === 8 ? inflateRawSync(compressed) : null;
    if (!contents) throw new Error(`Unsupported ZIP compression method ${method} for ${name}`);
    files.push({ name, contents });
  }
  return files;
}

function cleanUsfm(text) {
  return text
    .replace(/\\f\s[\s\S]*?\\f\*/g, " ")
    .replace(/\\x\s[\s\S]*?\\x\*/g, " ")
    .replace(/\\w\s+([^|\\]+)(?:\|[^\\]+)?\\w\*/g, "$1")
    .replace(/\\zaln-[se][^\\]*?\\\*/g, " ")
    .replace(/\\[a-z0-9]+\*?/gi, " ")
    .replace(/[\u00a0\s]+/g, " ")
    .trim();
}

function parseUsfm(contents, fileName) {
  const text = contents.toString("utf8").replace(/^\uFEFF/, "");
  const usfmId = text.match(/^\\id\s+([A-Z0-9]{3})/m)?.[1];
  const bookId = usfmId ? BOOK_IDS[usfmId] : null;
  if (!bookId) return [];

  let chapter = 0;
  const verses = [];
  let currentVerse = null;
  for (const line of text.split(/\r?\n/)) {
    const chapterMatch = line.match(/^\\c\s+(\d+)/);
    if (chapterMatch) {
      chapter = Number(chapterMatch[1]);
      currentVerse = null;
      continue;
    }
    const verseMatch = line.match(/^\\v\s+(\d+)(?:[-–]\d+)?[a-z]?\s+(.+)/i);
    if (verseMatch && chapter) {
      const verse = Number(verseMatch[1]);
      const verseText = cleanUsfm(verseMatch[2]);
      currentVerse = verseText ? [bookId, chapter, verse, verseText] : null;
      if (currentVerse) verses.push(currentVerse);
      continue;
    }
    const continuation = line.match(/^\\(?:m|q\d*|qm\d*|pi\d*|li\d*|p)\s+(.+)/i)?.[1];
    if (currentVerse && continuation) {
      const continuationText = cleanUsfm(continuation);
      if (continuationText) currentVerse[3] = `${currentVerse[3]} ${continuationText}`;
    }
  }
  if (!verses.length) throw new Error(`No canonical verses found in ${fileName}`);
  return verses;
}

async function build(source) {
  process.stdout.write(`Downloading ${source.translation}...\n`);
  const response = await fetch(source.url);
  if (!response.ok) throw new Error(`${source.url} returned ${response.status}`);
  const archive = Buffer.from(await response.arrayBuffer());
  const verses = unzip(archive)
    .filter((file) => /\.usfm$/i.test(file.name))
    .flatMap((file) => parseUsfm(file.contents, file.name));

  const uniqueKeys = new Set(verses.map(([bookId, chapter, verse]) => `${bookId}:${chapter}:${verse}`));
  if (verses.length < 30_000 || uniqueKeys.size !== verses.length) {
    throw new Error(`${source.id} failed integrity checks (${verses.length} verses, ${uniqueKeys.size} unique)`);
  }

  const output = {
    schemaVersion: 1,
    id: source.id,
    language: source.language,
    translation: source.translation,
    license: "Public Domain",
    source: source.url,
    verses,
  };
  const path = resolve(OUTPUT_DIR, `${source.id}.json`);
  await writeFile(path, JSON.stringify(output));
  process.stdout.write(`Wrote ${verses.length} verses to ${path}\n`);
}

await mkdir(OUTPUT_DIR, { recursive: true });
for (const source of SOURCES) await build(source);
