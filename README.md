# Verse Listener

A free, browser-only Bible reference listener for Russian and English sermons.

[Open the live app](https://skiili.github.io/russian-verse-live/?v=3)

## Use it

1. Open the published HTTPS site in Chrome or Safari.
2. Choose **Русский** or **English**. Only the selected language is sent to browser speech recognition.
3. Tap **Start Listening** and allow microphone access.
4. Keep the page visible while the sermon is running.

The stateful detector remembers a book and chapter across later transcript segments. A speaker can name Matthew, talk for a while, later say chapter fourteen, and later still say verse eight. A different book replaces the old context. Spoken corrections such as `не Марка, а Матфея`, `я имел в виду Псалмы`, `not Mark but Matthew`, and `sorry, I meant Psalms` replace or clear the earlier context. Common transcription misspellings, numbered books, ranges, digits, word numbers, and label-free references such as `First John three sixteen` are covered by the parser tests.

## Feedback reports

The microphone keeps a rolling 60-second audio buffer in memory while listening. **Report a missed or wrong verse** saves the chosen last 15, 30, 45, or 60 seconds as WAV audio together with the language, transcript, detector context, expected verse, caught verse, and optional note.

Reports are saved in IndexedDB on the current device. **Send to Codex** downloads one self-contained JSON report and opens a prefilled GitHub issue. Attach the downloaded JSON before submitting the issue when audio is available. The GitHub issue is the free cross-device inbox that Codex can read from the development computer; the publishable website contains no GitHub write token.

## Current source context

Open **More → Download current source context** to create one text file containing the important application source from the current GitHub `main` branch. The bundle excludes binary WAVs, generated output, dependencies, and package caches. Because it is assembled from GitHub when clicked, it follows future source updates instead of freezing like a release ZIP.

## Test excerpts

Russian mode contains five verified sermon excerpts. English mode contains five direct parser scenarios covering split context, corrections, numbered books, ranges, and long context. **Direct** runs the parser silently. **Speaker** also plays or reads the excerpt. Live microphone recognition is tested with **Start Listening**.

## Privacy and cost

There is no paid API, analytics service, or private backend. Browser speech recognition availability and processing are controlled by the browser and may require an internet connection. Audio stays in memory until a report is saved, stays on the current device until exported, and reaches GitHub only when the user attaches the report and submits the issue. Detection uses vibration when supported and never plays a notification sound.

## Development

The site has no runtime package dependencies. Compile the TypeScript parser, then run the deterministic parser and static contract checks:

```powershell
npm run compile:parser
npm test
```
