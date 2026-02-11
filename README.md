# Gameful Futures Lab — Interactive Website Starter

This repository contains a starter skeleton for a lab website where 3D character-agents move according to page context.

## What this starter demonstrates

- **Persistent character population** represented in a shared 3D scene.
- **Route-based movement targets** for `home`, `projects`, and `people`.
- **Alphabetical placement for people** (A–Z by last name, then first name) when switching to the people route.
- **Project clustering behavior** where characters gather near project landmarks.

## Suggested folder structure

```text
src/
  data/
    people.ts        # Person records + alphabetical sorter
    projects.ts      # Project hubs + positions
  scene/
    CharacterAgent.tsx # Steering/motion logic for each character
    layouts.ts         # Route -> target position maps
    LabScene.tsx       # Shared 3D scene and geometry landmarks
  store/
    useLabWorldStore.ts # Global route state
  ui/
    Nav.tsx            # Route controls
  App.tsx
  main.tsx
```

## Run locally

```bash
npm install
npm run dev
```

## Next steps to evolve this starter

1. Replace capsule placeholders with GLB character models and animation clips (`idle`, `run`, `wave`).
2. Replace in-memory route state with real URL routing while keeping scene mounted.
3. Introduce navmesh/pathfinding when geometry gets complex.
4. Add click interactions and detail panels for people/projects.
