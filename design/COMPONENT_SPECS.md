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
