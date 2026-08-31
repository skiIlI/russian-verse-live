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
