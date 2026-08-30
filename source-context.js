const REPOSITORY_RAW = "https://raw.githubusercontent.com/skiIlI/russian-verse-live/main/";
const SOURCE_FILES = [
  "AGENTS.md",
  "README.md",
  "index.html",
  "styles.css",
  "app.js",
  "audio-ring-buffer.js",
  "audio-worklet.js",
  "more-menu.js",
  "mic-level-meter.js",
  "mic-recording.js",
  "mic-test.js",
  "transcript-lab.js",
  "feedback-store.js",
  "feedback-api.js",
  "feedback-ui.js",
  "source-context.js",
  "src/bookDefinitions.ts",
  "src/numberParsing.ts",
  "src/bibleVerseParser.ts",
  "src/transcriptInput.ts",
  "src/navigationDetector.ts",
  "src/verseCorpus.ts",
  "src/quoteScoring.ts",
  "src/quoteMatcher.ts",
  "src/transcriptInterpreter.ts",
  "scripts/build-bible-corpus.mjs",
  "data/README.md",
  "supabase/config.toml",
  "supabase/schema.sql",
  "supabase/functions/verse-feedback/index.ts",
  "supabase/functions/verse-feedback/database.ts",
  "supabase/functions/verse-feedback/r2.ts",
  "supabase/functions/verse-feedback/validation.ts",
  "service-worker.js",
  "manifest.webmanifest",
  "package.json",
  "tests/parser.test.mjs",
  "tests/interpreter.test.mjs",
  "tests/fixtures/august-16-2026-ground-truth.json",
  "tests/audio-buffer.test.mjs",
  "tests/feedback.test.mjs",
  "tests/mic-test.test.mjs",
  "tests/static.test.mjs",
];

export async function downloadCurrentSourceContext(onProgress = () => {}) {
  const sections = [
    "VERSE LISTENER · CURRENT SOURCE CONTEXT",
    "Repository: https://github.com/skiIlI/russian-verse-live",
    `Downloaded: ${new Date().toISOString()}`,
    "",
    "This bundle is assembled from the current GitHub main branch. Binary sermon WAVs, generated browser bundles and Bible corpora, dependencies, and package caches are intentionally excluded.",
  ];

  for (let index = 0; index < SOURCE_FILES.length; index += 1) {
    const path = SOURCE_FILES[index];
    onProgress(index + 1, SOURCE_FILES.length, path);
    const response = await fetch(`${REPOSITORY_RAW}${path}?sourceContext=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not fetch ${path} (${response.status})`);
    sections.push("", `===== FILE: ${path} =====`, await response.text());
  }

  const file = new File([sections.join("\n")], "verse-listener-source-context.txt", { type: "text/plain" });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
