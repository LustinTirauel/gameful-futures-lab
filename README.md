# Gameful Futures Lab

## `app/page.tsx` state overview

- `mode`: controls which top-level view is active (`home`, `people`, or `projects`).
- `selectedPerson`: stores the currently selected person ID for the people detail panel.
- `selectedProject`: stores the currently selected project ID for project details.
- `reactionId`: stores the person ID currently showing the temporary home-mode reaction bounce.
- `scene3DFailed`: tracks whether the 3D scene runtime failed and fallback characters should render.

## Safe project content editing

- Project detail content lives in `app/data/content.ts` under each project's `sections` array (with optional `heading`, plus `paragraphs`, and optional `bullets`).
- Keep project copy as plain text in these structured fields; do not add raw HTML strings.
- If richer formatting is needed in the future, use a controlled markdown pipeline (sanitized + explicitly rendered) instead of `dangerouslySetInnerHTML`.
