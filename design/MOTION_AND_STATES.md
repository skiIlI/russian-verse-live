# Motion & State System

Motion should make state changes legible, not decorative.

## Timing scale

- Micro interaction: 140–180ms.
- Sheet entry/exit: 220ms, `cubic-bezier(.2,.8,.2,1)`.
- Transcript row arrival: 420ms, `cubic-bezier(.2,.82,.2,1)`.
- Detection highlight: ~700–1150ms total.
- Listening ring loop: ~2s.
- Model indeterminate progress: ~850ms loop.
- Recording waveform: ~900ms alternating loop.

## Idle → Listening

Change at least three visual channels at once:

1. status becomes a tinted/glowing chip,
2. microphone grows and becomes more luminous/colorful,
3. bottom primary action changes gradient and text to Stop Listening.

Do not use text-only state changes.

## Listening microphone

- Light: scale ~1.075.
- Dark: scale can be slightly smaller (~1.035) due to stronger glow.
- Two concentric pulse rings may animate outward.
- Respect reduced motion by retaining the stronger static glow/state color without looping animation.

## Verse detected / verse changed

New detections should be noticeable but not disruptive:

- reference area soft radial glow,
- mic brief lift/pulse,
- detected transcript row slide + highlight sweep,
- confidence/report controls arrive with the row,
- optional vibration in production when supported.

Do not use full-screen flashes, notification sounds, confetti, or persistent glowing cards.

## Transcript stream

- Each finalized ASR chunk creates exactly one row.
- Row enters from `translateY(18px)` + opacity 0 to resting position.
- The newest content remains pinned in view during auto-scroll.
- The viewport keeps all rows in DOM/history; old rows simply clip above the visible area.
- Manual user scroll upward suspends forced auto-scroll until they return to the bottom or resume behavior.
- Pause/resume freezes incoming rows; it does not clear history.

## Loading row

One loading row remains at the bottom while active. Animated vertical bars can vary height from ~4px to ~17px. Do not create a new loading element per inference.

## Model download

Numeric progress: animate width changes over ~180ms.  
Unknown progress: one 34–38% segment travels across the rail in ~850ms.

When loading completes, remove the progress surface cleanly rather than leaving a “ready” card.

## Recording

- Enter recording state with rose dot + label + timer.
- Waveform alternates height continuously.
- Stop recording transitions into playback, not back to empty state.
- Discard removes playback and returns to mic-ready state.

## Sheets and popovers

### Bottom sheet

Enter from ~22px below with opacity 0 → 1. Backdrop fades in.  
Exit reverses.  
Close by explicit close button and Escape.

### Preference popover

Enter from 10px down and 0.98 scale to full scale. ~170ms.
Close on:

- selection,
- outside click,
- Escape.

### Custom dropdown

Enter from -4px / 0.985 scale with opacity transition ~140ms. Selected state should not animate excessively.

## Feedback send

Use concise status progression:

`Saving privately…` → `Sending feedback…` → success toast → close overlay.

Do not leave a success modal behind after send.

## Dark mode transitions

Theme changes may use standard 180ms color/background transitions where safe. Do not crossfade the entire application or blur text during the transition.

## Reduced motion

Under `prefers-reduced-motion: reduce`:

- eliminate continuous rings/waves/progress travel,
- keep static visual state differences,
- reduce transitions to effectively instant,
- never remove the semantic state cue itself.
