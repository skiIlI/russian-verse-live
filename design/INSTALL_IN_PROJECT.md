# Install Into the Verse Detector Repo

Recommended structure:

```text
russian-verse-live/
  AGENTS.md
  design/
    README.md
    DESIGN_SYSTEM.md
    DESIGN_SOURCE_OF_TRUTH.md
    COMPONENT_SPECS.md
    MOTION_AND_STATES.md
    CODEX_DESIGN_GUARDRAILS.md
    DESIGN_ACCEPTANCE_CHECKLIST.md
    VERSE_DETECTOR_DESIGN_FOUNDATION.md
    design-tokens.css
    design-tokens.json
    reference/
      quiet-focus-glass-approved.html
```

## Recommended AGENTS.md addition

Copy the contents of `AGENTS.design.md` into the existing project's design instructions, or add this line to the existing `AGENTS.md`:

> For every visual/UI task, read `design/AGENTS.design.md` and treat `design/reference/quiet-focus-glass-approved.html` as the canonical visual source of truth.

Then place `AGENTS.design.md` inside `design/` as well.

## Codex workflow

Before UI work, Codex should read in this order:

1. `design/DESIGN_SOURCE_OF_TRUTH.md`
2. `design/CODEX_DESIGN_GUARDRAILS.md`
3. `design/DESIGN_SYSTEM.md`
4. the owning production HTML/CSS/JS
5. `design/reference/quiet-focus-glass-approved.html` when geometry or interaction is relevant

After UI work, use `design/DESIGN_ACCEPTANCE_CHECKLIST.md` before handoff.

## Token use

`design-tokens.css` is ready to import or copy into the production token layer. It intentionally contains foundations rather than full component CSS, so production components can evolve without duplicating the prototype stylesheet.
