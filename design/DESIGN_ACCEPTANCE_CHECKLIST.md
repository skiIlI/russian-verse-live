# Design Acceptance Checklist

Use this before approving any Verse Detector UI change.

## Source truth

- [ ] I inspected the canonical approved prototype.
- [ ] I identified which geometry/components are locked.
- [ ] I changed only the user-requested design delta.

## Composition

- [ ] Main live shell remains max 468px unless explicitly changed.
- [ ] Header, mic, reference, pills, and dock hierarchy still matches Quiet Focus.
- [ ] Four circular dock tools + one long listener action remain intact unless explicitly changed.
- [ ] New complexity is progressively disclosed instead of permanently added to the main screen.

## Visual language

- [ ] Cool glass palette: indigo/lilac/cyan/slate, not green-dominant.
- [ ] Background accents are soft gradient glows, not flat circles.
- [ ] Glass surfaces have enough contrast and do not become gray slabs.
- [ ] UI is spacious and not filled with unnecessary subtext.
- [ ] No accidental inactive/disabled look on usable controls.

## Controls

- [ ] Dropdowns/popovers use the custom glass pattern.
- [ ] Outside click / Escape dismissal works where expected.
- [ ] Focus-visible state exists.
- [ ] Touch targets remain usable.

## State coverage

- [ ] Idle/ready.
- [ ] Listening/active.
- [ ] Loading/downloading/transcribing.
- [ ] Verse detection/change.
- [ ] Recording/playback if applicable.
- [ ] Success and error.
- [ ] Dark mode for every changed surface.
- [ ] Reduced-motion behavior.

## Transcript-specific

- [ ] Finalized transcript blocks slide in; no word-by-word fake typing.
- [ ] Transcript history is retained.
- [ ] Auto-scroll keeps newest chunk visible unless user scrolls back.
- [ ] One loading row remains at bottom.
- [ ] Pause/resume works without clearing transcript.
- [ ] Detection rows show confidence + report flag.

## Feedback-specific

- [ ] Issue type options remain concise.
- [ ] Timing field appears only for Detected too late.
- [ ] Recent audio options are 15/30/45/60 sec with distinct emoji.
- [ ] Only one optional notes textarea.
- [ ] Transcript/audio previews live behind header icons.
- [ ] Successful send closes feedback.

## Final visual check

- [ ] ~320px narrow viewport checked.
- [ ] ~468px canonical viewport checked.
- [ ] Light glass checked.
- [ ] Dark glass checked.
- [ ] Interaction depth checked, not static-only.
- [ ] No unrequested UI remains.
