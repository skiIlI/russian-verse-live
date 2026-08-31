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
