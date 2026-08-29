# Russian Verse Listener

An installable, completely free web version of Automation Core's Miscellaneous → Russian Verse Detector.

## Use it

1. Open the published HTTPS website in Chrome or Safari.
2. Tap **Start Listening** and allow microphone access.
3. Keep the page visible while the sermon is running.
4. Use the download arrow to install it on your Home Screen.

The detector remembers a spoken Bible book and chapter across later transcript segments, so a later verse number can complete the reference. Starting a new listening session clears the remembered context. Speaking a different book clears the previous chapter. Common speech-recognition spellings such as `Матвея` are understood, and corrections such as `не Марка, а Матфея` or `я имел в виду Псалмы` replace the earlier context.

## Test excerpts

The five excerpt buttons use verified transcripts from the church sermon to exercise the exact same stateful verse parser. **Direct** runs silently. **Audible** also plays the original WAV through the speaker. Browser speech recognition does not provide a reliable way to inject a WAV directly as microphone input, so these buttons validate the parser and interface; **Start Listening** validates the real microphone transcription.

## Privacy and cost

There is no paid API, account, analytics, or server owned by this project. Browser speech recognition availability and processing are controlled by the browser and may require an internet connection. The app attempts a short vibration on detection when the device supports it and never plays a notification sound.

## Development

This repository is a dependency-free static site. `src/russianVerseParser.ts` is copied from Automation Core and compiled to `parser.js` for browser use.

```powershell
npm test
```
