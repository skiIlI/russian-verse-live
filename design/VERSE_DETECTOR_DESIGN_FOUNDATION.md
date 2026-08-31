# VERSE DETECTOR · COMPLETE DESIGN FOUNDATION

This file combines the canonical project design guidance for convenient AI/Codex context. The reference HTML remains the highest-fidelity source of truth.

# Verse Detector Design System

## 1. Design direction

**Name:** Quiet Focus · Glass  
**Product:** Verse Detector / Verse Listener  
**Design intent:** A modern, minimalist, calm operator companion that makes live listening and verse detection unmistakable while keeping every secondary workflow behind progressive disclosure.

This is not a dashboard, admin panel, bento grid, broadcast console, or full-width website. It is a narrow companion experience that can sit beside verse/presentation software while still scaling responsively.

### Core principles

1. **One dominant task at a time.** The live listener is the hero. Secondary tools never compete with it.
2. **Space is functional.** Empty space is part of the design; do not fill it with explanatory copy, cards, badges, or decorative UI.
3. **Progressive disclosure.** Preferences use small pills + popovers. Larger tools use bottom sheets. Feedback transcript/audio use small icon-triggered popovers.
4. **Glass, not gray panels.** Surfaces are translucent, layered, blurred, and softly separated. Background accents are gradient glow fields, never flat solid circles.
5. **State must be visually obvious.** Listening, downloading, transcribing, recording, detecting, success, and error each need distinct motion and visual treatment.
6. **Minimal copy.** Use short labels and direct status text. Avoid repeated explanations and unnecessary subtext.
7. **Every nested surface belongs to the same system.** Dropdowns, sheets, feedback, transcriber, mic test, settings, progress, and dark mode must feel designed together.
8. **No silent redesigns.** Locked geometry and hierarchy remain exact unless the user explicitly changes them.

---

## 2. Canonical geometry

The approved prototype is the exact source of truth for geometry.

### Application shell

- Maximum width: **468px**.
- Mobile width: **100%**.
- Minimum height: **100dvh**.
- Desktop shell radius: **26px**.
- Main shell padding: **16px 18px 90px**.
- The bottom 90px is reserved for the persistent tool dock.
- Desktop page padding around shell: **22px vertical**.
- Do not widen the shell to make room for new features. Put secondary content in overlays/sheets instead.

### Main composition

Top to bottom:

1. Header: product name left; two 34px circular actions right.
2. Centered status chip.
3. 142px microphone orb with 168px outer ring.
4. Detected reference in large serif type.
5. One concise source/verse line.
6. `Peek at live transcript` affordance.
7. Three compact preference pills.
8. Persistent bottom dock.

### Bottom dock

- Four circular utility controls: **42px columns**, **44px minimum height**.
- Gap: **6px**.
- Fifth control is a flexible long pill.
- The primary listener action must remain the most prominent item in the dock.
- Do not add labels to the four circular utility buttons unless explicitly requested.

---

## 3. Spacing system

Use the existing prototype values before inventing new spacing.

| Token | Value | Typical use |
|---|---:|---|
| `space-1` | 3px | tiny icon/internal gaps |
| `space-2` | 5px | compact list gaps |
| `space-3` | 6px | dock/control gaps |
| `space-4` | 7px | compact component gaps |
| `space-5` | 8px | row padding / micro spacing |
| `space-6` | 10px | compact control padding |
| `space-7` | 11px | row horizontal padding |
| `space-8` | 12px | normal component gap |
| `space-9` | 13px | compact card padding |
| `space-10` | 14px | sheet/header spacing |
| `space-11` | 16px | shell/header padding |
| `space-12` | 18px | shell horizontal padding |
| `space-13` | 22px | major vertical separation |
| `space-14` | 24px | large section separation |
| `space-15` | 34px | reference-to-mic separation |

Rule: when a design feels crowded, **remove content first**, then increase spacing. Do not solve crowding by shrinking everything.

---

## 4. Radius system

| Token | Value | Usage |
|---|---:|---|
| `radius-xs` | 7–9px | tiny action/timestamp controls |
| `radius-sm` | 10–11px | list rows / option items |
| `radius-md` | 12–14px | fields / cards / selects |
| `radius-lg` | 15–18px | popovers / compact overlays |
| `radius-xl` | 22px | feedback overlay |
| `radius-sheet` | 26px 26px 0 0 | bottom sheets |
| `radius-shell` | 26px | desktop app shell |
| `radius-pill` | 999px | pills, statuses, long listener button |
| `radius-round` | 50% | circular icon actions / microphone |

Avoid arbitrary 4px, 16px, 20px, or 32px radii unless required by a specific approved component.

---

## 5. Color system

### Primary palette

The product is **cool glass**, not green.

- Ink: `#16202a`
- Muted: `#72808d`
- Faint: `#9aa5af`
- Primary indigo: `#6675f5`
- Secondary lilac: `#a175f4`
- Cyan success/accent: `#4bb8cf`
- Warm warning: `#d09a56`
- Rose error/recording: `#d8657d`

### Primary gradient

Use blue → violet as the primary actionable gradient:

`linear-gradient(135deg, #6675f5, #8f70ed)`

Active listening may extend toward rose for a visibly different state:

`linear-gradient(135deg, #706bf2 0%, #9a63e8 55%, #dc6b9a 118%)`

### Canvas

Light canvas must use layered gradient glows:

- cyan/blue glow at top-left,
- lilac glow at top-right,
- pale blue/lilac base gradient.

Background decorative forms must have feathered radial gradients and transparency. **Never render them as flat opaque circles.**

### Glass surfaces

Core light glass values:

- Glass: `rgba(255,255,255,.55)`
- Strong glass: `rgba(255,255,255,.72)`
- Border: roughly `rgba(50,66,84,.11)` or translucent white depending on surface.
- Blur: `blur(24px) saturate(1.15)`.

Glass must retain contrast. Never rely on blur alone for separation.

### Semantic colors

- Listening / selection / primary: indigo–lilac.
- Live transcript / positive signal: cyan–blue.
- Recording / destructive / error: rose.
- Warning / timing issue: warm amber.
- Success confirmation: cyan/teal, not bright green.

---

## 6. Typography

### UI font

Use the system/Inter stack:

`Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

### Reference/Scripture font

Use **Georgia, serif** for the detected reference and verse/source content. This is a deliberate editorial contrast.

### Canonical sizes

- Header product name: **11px**, slightly tracked.
- Status: **9px**, 800 weight, uppercase, `.08em` tracking.
- Main detected reference: **37px**, Georgia, 500, line-height 1, `-.045em` tracking.
- Main verse/source copy: **13px**, Georgia, line-height 1.65.
- Peek affordance: **9px**, 800.
- Preference pills: **8px**, 750.
- Bottom primary action: **9px**, 850.
- Sheet title: **15px**.
- Sheet labels: **8px**, 800, uppercase, `.09em` tracking.
- Standard sheet controls: **9–10px**.
- Feedback notes text: **12px**, line-height 1.55.

Do not globally scale typography downward to fit more content.

---

## 7. Elevation and glass layering

Use subtle depth. Avoid thick borders, hard shadows, and stacked cards.

- Shell shadow: `0 22px 60px rgba(45,64,84,.12)` light.
- Dark shell shadow: `0 24px 70px rgba(0,0,0,.42)`.
- Popovers: ~`0 18px 44px rgba(48,64,90,.17)`.
- Sheets: upward shadow, ~`0 -24px 64px rgba(44,61,78,.18)`.
- Active listening glow may be stronger around the mic and primary button.

Rule: only **interactive focus or state change** should noticeably increase elevation.

---

## 8. Component hierarchy

### Level 0 — Canvas

Soft gradient background. No content.

### Level 1 — Shell

One frosted application container. No card grid inside it.

### Level 2 — Primary task

Status, microphone, verse, peek transcript, preference pills.

### Level 3 — Persistent tools

Bottom dock only.

### Level 4 — Contextual disclosure

- Preference popovers.
- Dropdown menus.
- Bottom sheets.
- Feedback overlay.
- Transcript/audio mini popovers.

Do not show Level 4 content by default.

---

## 9. Responsive behavior

### 320–468px

- Shell fills width.
- Preserve internal geometry; do not turn the UI into a horizontal dashboard.
- Sheets use full shell width.
- Long fields wrap or scroll internally rather than widening the app.

### 469px+

- Shell remains capped at 468px and gains 26px rounded corners.
- Center on the page.
- Outside-prototype test controls may sit below the shell in Design Lab only; they are not product UI.

### Wide nested review workflows

If a future workflow truly requires more horizontal room, use a dedicated expanded state or secondary page only after explicit approval. Do not silently widen the canonical live listener.

---

## 10. Light and dark glass

Dark mode is a first-class theme, not an inverted afterthought.

### Dark canvas

- Base: deep navy → violet (`#0d1421`, `#14192a`, `#171326`).
- Blue and violet glow fields remain visible but restrained.

### Dark shell

Use translucent navy layers, not black or gray slabs.

### Dark mic orb

Must remain colorful:

- cyan highlight,
- blue core,
- violet depth,
- visible glow when listening.

Never use a silver/gray orb in dark mode.

### Dark controls

- Glass surfaces: roughly 5–10% white.
- Borders: roughly 9–14% white.
- Text: `#d4dbea` to `#f5f7ff` depending hierarchy.
- Selected dropdown option: indigo/violet tinted, clearly readable.

Every component added in light mode must receive a purposeful dark-mode treatment in the same change.

---

## 11. Product-specific state language

The interface must visually distinguish:

- Idle / Ready
- Opening microphone
- Model downloading
- Buffering
- Listening
- Transcribing
- Verse detected
- Verse changed / next verse
- Paused transcript simulation / paused stream
- Recording
- Playback
- Sending feedback
- Feedback sent
- Error / permission denied

See `MOTION_AND_STATES.md` for exact interaction behavior.

---

## 12. Content rules

### Keep

- Short labels.
- Direct status text.
- One optional notes field where needed.
- Compact metrics only when they affect operator decisions.

### Remove by default

- Explanatory paragraphs.
- Duplicate status rows.
- “Ready” rows that repeat visible state.
- Technical implementation details in the product UI.
- Large transcript/audio preview sections when an icon popover works.
- Decorative subtitles under obvious buttons.
- Model benchmark analytics that are not used operationally.

### Service Transcriber

Approved direction is intentionally simple:

1. One source/transcript text area.
2. One primary Analyze/Detect action.
3. One simple report focused on verses detected.
4. Each detected verse may show confidence + report flag.

No YouTube import UI, playback section, benchmark grid, or unrelated summary stats unless explicitly reintroduced.

---

## 13. Accessibility

- Every icon-only control needs `aria-label` and tooltip/title where useful.
- Maintain a minimum **42–44px touch target** for primary/utility controls where geometry allows.
- Visible keyboard focus is required.
- State toggles use `aria-pressed` when applicable.
- Dialog/sheet dismissal must work by close button and Escape; preference/dropdown popovers also close on outside click.
- Do not communicate detected/error/recording state using color alone.
- Respect `prefers-reduced-motion`.

---

## 14. Design anti-patterns

Never introduce these without explicit approval:

- full-width admin/dashboard layout,
- bento/card grids on the live screen,
- side navigation,
- extra bottom navigation items,
- flat colored background circles,
- dominant green palette,
- gray/silver dark-mode microphone,
- thick borders or fake 3D bevels,
- multiple paragraphs of helper text,
- repeated “ready/status” cards,
- default browser-looking selects,
- disabled-looking controls that are actually usable,
- icon substitutions with random emojis in core navigation,
- new component geometry that “improves” a locked component,
- image-based UI mockups in Design Lab instead of HTML/React prototypes.

---

## 15. Definition of done for new UI

A UI change is not complete until all are true:

1. It visually belongs to Quiet Focus · Glass.
2. Locked shell geometry is unchanged unless specifically requested.
3. Light and dark modes are both designed.
4. Hover, active, focus, disabled, loading, success, and error states are handled when applicable.
5. Dropdowns/popovers close correctly on outside click and Escape when appropriate.
6. Motion is purposeful and reduced-motion safe.
7. No unnecessary subtext/card/row was added.
8. Narrow mobile width was checked.
9. Nested workflow was checked at interaction depth, not only static appearance.
10. The result was compared against the canonical reference prototype before handoff.


# Component Specifications

These are implementation contracts, not loose inspiration. If a component already exists in the approved prototype, preserve its geometry and interaction unless explicitly changed.

## 1. Header

**Anatomy:** product name + two circular icon actions.  
**Size:** 34px action buttons.  
**Visual:** translucent glass gradient, subtle border, no disabled/inactive appearance.  
**Behavior:** hover increases brightness/contrast; active scales to ~.94.

Do not add breadcrumbs, page titles, account avatars, navigation labels, or a third persistent header action without explicit approval.

## 2. Listening status chip

**Idle:** quiet text + small indigo/cyan dot.  
**Listening:** gains tinted glass background, subtle outline/glow, animated status dot.  
**Purpose:** listening state must be immediately distinguishable without reading the text.

## 3. Microphone orb

**Locked geometry:** 142px circle + 168px outer ring.  
**Idle light:** translucent white/blue glass.  
**Listening light:** scale ~1.075, brighter blue/lilac/cyan glow, animated rings.  
**Dark:** colorful cyan → blue → violet orb; never silver/gray.  
**Detection:** brief lift/pulse + reference glow.

The mic is a focal state surface, not a generic button.

## 4. Reference block

- Reference uses 37px Georgia.
- Verse numbers use primary accent.
- Supporting source/verse text uses 13px Georgia.
- On new detection or verse change, use a noticeable but brief glow/pulse.
- Never wrap this in a heavy card.

## 5. Preference pills

Three canonical live-screen pills:

- Listening language
- Transcription model
- Bible version

Pills are compact, glass, 8px type, and open a contextual popover. They are not selects shown inline on the main screen.

### Popover behavior

- Centered above the bottom dock.
- ~330px max width.
- Selected option gets a subtle blue/lilac treatment + checkmark.
- Clicking outside closes it.
- Escape closes it.
- Selecting an option closes it.
- If model selection requires download, transition into settings/download flow without changing main layout.

## 6. Bottom dock

Four circular tools + one long listener action.

The approved utility categories are:

1. Live transcript
2. Service Transcriber
3. Mic & recording test
4. Feedback
5. Start/Stop Listening primary action

Do not add text labels beneath the four icon buttons.

### Listener primary button states

- Idle: indigo/violet gradient, `Start Listening`.
- Listening: visibly different violet/rose gradient, stop-square icon, `Stop Listening`.
- Model loading: indigo/violet gradient with subdued/working treatment.
- Error: retain geometry; use clear error feedback elsewhere rather than turning the primary button into an unrelated layout.

## 7. Bottom sheet

Used for transcript, transcriber, mic test, feedback/settings, and More.

- Full shell width.
- Radius: 26px 26px 0 0.
- Glass background with ~30px blur.
- Drag handle centered at top.
- Sheet title: 15px.
- Close/action buttons: 32px circles.
- Default maximum height: 86%.
- Live transcript sheet is intentionally shorter, roughly 60% max, with transcript viewport around half-screen.
- Sheet body scrolls internally; do not expose an ugly outer browser scrollbar.

## 8. Live transcript

### Row model

Speech arrives in **finalized blocks/chunks**, roughly once per second. Do not simulate word-by-word typewriter text.

Each new finalized block:

- appears as a new row,
- slides upward/in from below,
- takes ~420ms,
- stays in history,
- causes auto-scroll to the newest row unless the user has manually scrolled upward.

### Loading row

One permanent bottom row indicates the next chunk is being processed. It may use a small waveform/animated bars. Do not create multiple loading rows.

### Controls

Top-right play/pause control pauses/resumes incoming transcript capture/simulation. It is not “run more.”

### Detected verse row

Right side of a detected row includes:

1. confidence percentage/pill,
2. flag/report button at the far right.

The flag opens Feedback above the transcript sheet and passes the row context.

Detected rows receive a noticeable entry/flash treatment so verse changes are visually apparent.

## 9. Custom select/dropdown

Never use raw browser-looking `<select>` styling for designed surfaces.

**Trigger:** 43px minimum height, 13px radius, glass gradient, custom chevron.  
**Menu:** 14px radius, 6px padding, 3px gap, blurred floating glass.  
**Option:** 36px minimum height, 10px radius.  
**Selected:** subtle indigo/lilac/cyan tint + checkmark.  
**Dark mode:** selected option must retain strong readable contrast and should not look like a gray disabled row.

Click outside closes all custom selects.

## 10. Feedback overlay

Feedback is intentionally compact.

### Header

- Title left.
- Top-right: recent transcript icon, recent audio icon, close icon.
- Transcript/audio previews open small contextual popovers rather than full sections.

### Fields

1. **Issue type**
   - `📭 Verse missed`
   - `⏱️ Detected too late`
   - `🗣️ Misinterpreted speech`
   - `📖 Wrong verse`
   - `📝 Other`
2. **How late?** — only visible when issue type is `⏱️ Detected too late`
   - `🐢 1–2 seconds late`
   - `⌛ 3–5 seconds late`
   - `🚨 5+ seconds late`
3. **Include recent audio**
   - `🎧 Last 15 seconds`
   - `🔉 Last 30 seconds`
   - `🎙️ Last 45 seconds`
   - `⏺️ Last 60 seconds`
4. **Notes** — single optional textarea, 12px text.

There is no separate expected/caught correction section in the approved design.

After successful send, close the feedback overlay automatically.

## 11. Model download

When selecting an unloaded Whisper model:

- keep the main layout intact,
- surface download inside settings/model flow,
- show model name + percentage,
- use a 5px progress rail,
- progress gradient: cyan → indigo → lilac,
- show working/indeterminate animation when numeric progress is unavailable.

Avoid redundant “Whisper Base ready” rows after success.

## 12. Mic & recording test

### Input meter

14 rounded bars. Blue/cyan normal range, warm amber high range, rose/violet peak.

### Controls

- Start mic / Stop mic
- Monitor input toggle
- Record / Stop recording

Controls must clearly reflect availability and active state without looking accidentally disabled.

### Recording

Use a visible rose recording pill/dot, timer, and animated waveform. On completion, replace it with compact playback + discard controls.

## 13. Service Transcriber

The approved version is deliberately simplified.

### Structure

1. One large source text textarea.
2. One primary `Analyze transcript & detect verses` action.
3. Working animation while analysis runs.
4. Simple report focused on detected verses.

### Report rows

Each row should show:

- detected reference,
- confidence percentage,
- report flag.

Keep rows vertically comfortable and higher contrast than the background.

Do not show:

- YouTube service import,
- playback block,
- four-model benchmark,
- coverage metric,
- potential issues metric,
- readings/references/moves/unique summary grid.

## 14. More / Settings

Settings can include:

- Language
- Transcription model
- Whisper refresh rate
- Bible version
- Appearance

More can include:

- Install app
- Download current source context
- Open GitHub repository

Do not add duplicate model-ready status rows.

## 15. Prototype-only controls

Design Lab may show controls **outside** the app shell for:

- Light glass
- Dark glass
- Run transcript
- Detect verse

These are testing controls only. They never ship inside production app UI.


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


# Codex Design Guardrails — Verse Detector

These rules are intentionally strict. They exist to prevent design drift.

## Absolute rules

1. **Canonical reference first.** Before any UI edit, inspect `design/reference/quiet-focus-glass-approved.html` and the existing production surface.
2. **Locked means copy, not reinterpret.** If the user says original, locked, preserve, same design, or names an approved numbered direction, do not alter its size, geometry, spacing, hierarchy, navigation, control placement, or adjacent UI unless the user explicitly requests that exact change.
3. **Do not “improve” locked UI on your own.** No added cards, subtitles, banners, status rows, boxes, menus, or controls.
4. **Modern minimalist.** Prefer removal and whitespace over adding explanation.
5. **Design Lab output is HTML/React only.** Never generate images unless explicitly requested. Screenshots may be used privately for visual verification only.
6. **Do not turn Quiet Focus into a dashboard.** No sidebars, bento grids, dense horizontal toolbars, or full-width desktop redesigns.
7. **The main listener stays 468px max-width.** Secondary complexity belongs in sheets/popovers.
8. **Glass palette stays cool.** Indigo, lilac, cyan, slate, white. Never drift back to a green-dominant theme.
9. **Dark mode is designed in the same task.** Never ship a light-only component.
10. **No raw/default-looking dropdowns.** Use the custom select pattern.
11. **Usable controls must look usable.** Do not style active controls like disabled gray placeholders.
12. **Nested workflows must be fully designed.** Sheets, selects, loading, empty, success, error, recording, playback, and feedback states all inherit the system.

## Before editing

- Read the explicit user delta.
- Identify which existing geometry is protected.
- Inspect only the owning component(s) and canonical reference.
- Write down the smallest design delta in one sentence.
- If a requested change can be achieved without moving existing locked controls, do not move them.

## While designing

- Reuse tokens from `design-tokens.css`.
- Reuse an existing component before inventing a new one.
- Use one visual hierarchy per sheet.
- Keep subtext to one short line only when the workflow genuinely needs it.
- Avoid card-within-card nesting.
- Prefer icon popovers for small contextual previews.
- Use state changes to communicate operation, not extra labels.

## Mandatory state coverage

For any applicable control/workflow, design:

- idle,
- hover,
- pressed,
- focus-visible,
- disabled (only if genuinely unavailable),
- loading/working,
- active,
- success,
- error,
- dark mode.

For audio additionally consider permission/opening, recording, playback, stop, disconnected.

## Mandatory visual verification

For material UI changes:

1. Render the actual prototype/page.
2. Check light mode at ~468px.
3. Check dark mode at ~468px.
4. Trigger the changed interaction.
5. Verify nested state at interaction depth.
6. Compare against the canonical approved prototype.
7. Remove anything that was not explicitly required.

## Automatic rejection conditions

A design should be considered wrong and revised if it:

- makes the shell wider/heavier without request,
- adds substantial explanatory text,
- adds new permanent navigation,
- uses flat decorative circles instead of gradient glow fields,
- makes dark mode gray/silver or low contrast,
- loses the four-circle + one-long-button dock,
- changes the 142px microphone geometry without request,
- uses green as the dominant brand/action color,
- shows raw browser selects,
- uses a full separate card for every tiny status,
- generates a static image instead of the requested interactive prototype,
- only looks correct in one theme.

## Final design handoff language

State what changed, not how hard it was. Do not call a redesign “same” if geometry changed. If a locked component was touched, explicitly verify that its geometry remained unchanged.


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
