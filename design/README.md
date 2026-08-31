# Verse Detector Design System Pack

Status: **Canonical design foundation**

This package turns the approved **Quiet Focus · Glass** prototype into a reusable design system for Verse Detector. The goal is to prevent future UI work from drifting into generic, crowded, or visually inconsistent designs.

## Source-of-truth order

When sources disagree, use this order:

1. `reference/quiet-focus-glass-approved.html` — canonical visual and interaction reference.
2. `DESIGN_SYSTEM.md` — product-wide design rules and foundations.
3. `COMPONENT_SPECS.md` — component anatomy and behavior.
4. `MOTION_AND_STATES.md` — state changes and animation contracts.
5. `design-tokens.css` / `design-tokens.json` — implementation tokens.
6. `CODEX_DESIGN_GUARDRAILS.md` — rules for future AI/Codex design work.
7. A new explicit user request — may override a specific locked rule, but only where requested.

## Recommended project integration

Put these files in the repo under a `design/` folder, and either:

- add `AGENTS.design.md` to the project root and reference it from `AGENTS.md`, or
- copy its rules into the existing `AGENTS.md` design section.

For every future UI task, Codex should inspect the canonical prototype and the design docs **before** editing production UI.

## What is intentionally locked

The core Quiet Focus composition is locked unless explicitly changed: narrow 468px companion shell, centered status/microphone/reference hierarchy, three preference pills, four circular utility buttons, one long bottom-right primary action, bottom sheets/popovers for secondary workflows, spacious minimalist copy, and the cool glass palette.
