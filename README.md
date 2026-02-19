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

## Scene tuning edit flow (for agency collaborators)

When tuning scene values in edit mode, use this workflow so updates are easy to review and keep stable across releases:

1. **Start from canonical defaults**
   - The base defaults and slider metadata live in `app/components/scene3d/tuningSchema.ts`.
   - Keep defaults there as the single source of truth for shared/home/people tuning behavior.
2. **Adjust in UI, then export JSON**
   - Toggle edit mode in home or people view.
   - Make adjustments with sliders and model drags.
   - Use **Copy JSON** to capture a full payload with complete character/environment overrides.
3. **Apply curated values in code**
   - Paste vetted values into `app/components/scene3d/defaults.ts` (canonical baseline committed in git).
   - Avoid one-off hardcoded slider/key logic in page or hook files; drive these from schema metadata.
4. **Keep saved payloads backward-compatible**
   - Persisted tuning is versioned and migrated in schema helpers.
   - If payload shape changes, add migration logic there rather than spreading parsing across components.
5. **Verify both modes**
   - Check home and people mode camera/lighting and lineup behavior.
   - Confirm layout columns/preset behavior on both wide and narrow viewports.
