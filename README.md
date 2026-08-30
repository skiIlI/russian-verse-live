# Verse Listener

A free, browser-only Bible reference listener for Russian and English sermons.

[Open the live app](https://skiili.github.io/russian-verse-live/?v=13)

## Use it

1. Open the published HTTPS site in Chrome or Safari.
2. Choose **Русский** or **English**. Only the selected language is sent to browser speech recognition.
3. Tap **Start Listening** and allow microphone access.
4. Keep the page visible while the sermon is running.

## Test the microphone at church

Open **Mic & recording test** below the live transcript.

1. Tap **Start mic** and allow microphone access. The fourteen level bars respond to the detected input volume.
2. With headphones connected, tap **Monitor input** to hear the live microphone signal. Tap it again to turn monitoring off.
3. Tap **Record**, speak or play the room audio, then tap **Stop recording**.
4. Use the playback controls to hear the captured test. **Discard recording** removes it from the page.

Starting the mic test stops Verse Listener's sermon microphone first, and starting Verse Listener stops the test input. This prevents the two workflows from competing for the same microphone. Test recordings stay only in the current page and are never uploaded or saved after the page closes.

The stateful detector remembers a book and chapter across later transcript segments. A speaker can name Matthew, talk for a while, later say chapter fourteen, and later still say verse eight. A different book replaces the old context. Spoken corrections such as `не Марка, а Матфея`, `я имел в виду Псалмы`, `not Mark but Matthew`, and `sorry, I meant Psalms` replace or clear the earlier context. Common transcription misspellings, numbered books, ranges, digits, word numbers, and label-free references such as `First John three sixteen` are covered by the parser tests.

## Interpret a sermon transcript

Open **Transcript interpreter** to paste timestamped or plain transcript text. Its single chronological Action Timeline combines references, readings, next/back moves, and icon-only feedback controls. Long transcripts are split into collapsible sermon sections when there is a ten-minute gap.

**Load Aug 16 service** loads the supplied YouTube transcript. The default sermon-focused option ignores detected prayers and music; turn it off to inspect everything. Russian quote matching uses the public-domain Russian Synodal Bible. English is an NASB-first, cross-translation profile backed offline by the public-domain World English Bible because a complete NASB electronic corpus requires separate permission from The Lockman Foundation. Both corpora are cached with the PWA for offline church testing.

The human-reviewed regression sheet is `tests/fixtures/august-16-2026-ground-truth.json`. It locks the Psalm 22 sermon and the complete love sermon, including repeated quotations and inferred verse-boundary next actions.

### Compare transcription models on YouTube

The four-model benchmark accepts any YouTube video, a start time, and a 1–60 minute duration. **Shuffle sermon range** selects a speech-heavy range; **Use video position** takes the current embedded-player position. You can hear the exact selected audio, choose Whisper Tiny/Base/Small and/or the browser speech service, compare each result with YouTube captions, annotate or report a bad result, and export the complete report as TXT or JSON.

The benchmark audio helper runs only on the local development server. Install its isolated tools once, then start the app:

```powershell
npm run setup:benchmark
npm start
```

`npm run audit:services` runs the detector across the three newest configured full-service caption files and can save a machine-readable report with `--output <path>`.

## Feedback reports

The microphone keeps a rolling 60-second audio buffer in memory while listening. **Report a missed or wrong verse** saves the chosen last 15, 30, 45, or 60 seconds as WAV audio together with the language, transcript, detector context, expected verse, caught verse, and optional note.

Tap **Send feedback** once. The report goes to a private shared inbox that Codex can access from the development computer. If the device is offline or delivery fails, the complete report stays privately queued in IndexedDB and retries automatically when the page loads or reconnects. There is no account or sign-in step.

## Current source context

Open **More → Download current source context** to create one text file containing the important application source from the current GitHub `main` branch. The bundle excludes binary WAVs, generated output, dependencies, and package caches. Because it is assembled from GitHub when clicked, it follows future source updates instead of freezing like a release ZIP.

## Test excerpts

Russian mode contains five verified sermon excerpts. English mode contains five direct parser scenarios covering split context, corrections, numbered books, ranges, and long context. **Direct** runs the parser silently. **Speaker** also plays or reads the excerpt. Live microphone recognition is tested with **Start Listening**.

## Privacy and cost

There is no paid API or analytics service. Browser speech recognition availability and processing are controlled by the browser and may require an internet connection. Test recordings remain local to the current page. Rolling listener audio stays in memory until the user submits feedback. Submitted feedback uses the existing Voice Recorder App backend: metadata is private in Supabase and audio is private in Cloudflare R2. Failed deliveries stay on the current device until an automatic retry succeeds. Detection uses vibration when supported and never plays a notification sound.

The isolated feedback table and Edge Function source live under `supabase/` in this repository. They reuse the recorder project's infrastructure without reading or changing recorder accounts, recordings, messages, or sharing data.

## Development

The site has no runtime package dependencies. Rebuild the public-domain corpora when their upstream sources change, compile both browser bundles, then run the deterministic checks:

```powershell
npm run build:corpus
npm run compile:parser
npm run compile:interpreter
npm test
```
