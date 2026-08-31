# Verse Detector — Design Addendum for AGENTS.md

Read this file before any visual/UI task.

## Canonical design

- Design system: `design/DESIGN_SYSTEM.md`
- Component specs: `design/COMPONENT_SPECS.md`
- Motion/state system: `design/MOTION_AND_STATES.md`
- Tokens: `design/design-tokens.css`
- Canonical prototype: `design/reference/quiet-focus-glass-approved.html`

## Required behavior

- Treat the canonical Quiet Focus · Glass prototype as visual source truth.
- When the user says original/locked/preserve/same/numbered approved direction, copy that geometry exactly and change only the requested delta.
- Never add adjacent UI, explanatory copy, cards, navigation, or controls without a user request.
- Favor modern minimalist spacing and progressive disclosure.
- Keep the live shell max-width 468px and preserve the centered microphone/reference composition.
- Keep the bottom dock at four circular utility controls + one long listener action unless explicitly changed.
- Use cool glass colors: blue/indigo/lilac/cyan. Do not create a green-dominant UI.
- Every new component must be designed for both light and dark glass.
- Use custom designed dropdowns/popovers; avoid default browser-looking controls.
- Design all relevant states end-to-end: idle, active, loading, success, error, disabled, focus, dark.
- For Design Lab, create HTML/React prototypes only. Do not generate images unless explicitly asked. Screenshots may be used only for verification.

## Visual acceptance

Before handoff of a material UI change, render it at narrow width, test the changed interaction in both light and dark modes, compare against the canonical prototype, and remove any unrequested additions.
