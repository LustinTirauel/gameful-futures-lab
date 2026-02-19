# Gameful Futures Lab

An interactive **Next.js + React + TypeScript** web app that combines a 3D landing scene, people explorer, and project showcase.

This README is written for beginners and aims to answer:

1. What this project is.
2. Which technologies and settings it uses.
3. How to run it locally.
4. How the files are organized.
5. How to safely edit content and scene behavior.
6. How to debug common problems.

---

## 1) What this project does

Gameful Futures Lab has three main user modes:

- **Home mode**: intro view + animated 3D scene.
- **People mode**: people-focused layout, individual details, and scroll interactions.
- **Projects mode**: project cards/details and character interaction.

The 3D area is the heart of the app and is rendered with **Three.js** through React bindings (`@react-three/fiber` and helpers from `@react-three/drei`).

---

## 2) Technology stack (for research and onboarding)

If you need to study or Google specific parts of the stack, use these names and versions from `package.json`.

### Core runtime

- **Node.js**: recommended **v20+** (LTS suggested). Runs JavaScript outside the browser and executes all project tooling (`npm`, build, dev server).
- **Package manager**: npm (project ships with `package-lock.json`). Installs dependencies and runs scripts such as `dev`, `build`, and `lint`.
- **Framework**: **Next.js 14.2.5**. Provides routing, bundling, dev server, and production build pipeline for the app.
- **UI library**: **React 18.3.1** + **react-dom 18.3.1**. Builds interactive UI from reusable components and state.
- **Language**: **TypeScript 5.5.4**. Adds static typing so editor tooling and builds catch errors earlier.

### 3D and animation

- **three 0.166.1**: low-level 3D engine for scenes, cameras, meshes, lights, materials, and animation loops.
- **@react-three/fiber 8.16.8**: React renderer for Three.js so you can build 3D scenes with React components/hooks.
- **@react-three/drei 9.108.3**: ready-made helpers (controls, loaders, effects, etc.) that reduce scene boilerplate.
- **framer-motion 11.3.11**: declarative UI animation library used for smooth transitions and motion interactions.

### Linting and typing

- **eslint 8.57.0**: static code-quality checks (finds suspicious patterns, style issues, and common mistakes).
- **eslint-config-next 14.2.5**: Next.js recommended ESLint rules for React + App Router projects.
- **@types/node, @types/react, @types/react-dom**: official type definitions so TypeScript understands these runtime libraries.

---

## 3) Beginner setup: run locally step by step

### Step A: Install prerequisites

1. Install **Node.js 20+**.
   - Go to <https://nodejs.org> and install the **LTS** version (recommended for beginners).
   - macOS/Linux users can also use `nvm` if preferred; Windows users can use the official installer.
2. Verify installation:

```bash
node -v
npm -v
```

### Step B: Install project dependencies

From the project root:

```bash
npm install
```

### Step C: Start the development server

```bash
npm run dev
```

Open: <http://localhost:3000>

### Step D: Build for production (optional check)

```bash
npm run build
npm run start
```

### Step E: Lint checks

```bash
npm run lint
```

---

## 4) NPM scripts reference

Use these commands from the project root terminal to run, validate, and package the app during development.

- `npm run dev` → start local development server with hot reload.
- `npm run build` → create optimized production build.
- `npm run start` → run the production build.
- `npm run lint` → run ESLint checks.

---

## 5) Project structure (high-value files)

- `app/page.tsx`:
  - Main page-level controller.
  - Holds top-level state (`mode`, selected entities, edit mode, scroll state).
  - Interface reference: this powers the Home/People/Projects switching, detail panel open/close behavior, and edit-mode toggles visible in the current site.

- `app/components/LandingScene3D.tsx`:
  - Main 3D scene component.
  - Interface reference: this is the full-screen 3D environment in the background, including character placement and click interactions.

- `app/components/modes/SceneViewport.tsx`:
  - Wrapper that decides when to show the 3D scene.
  - Interface reference: controls whether the 3D canvas is visible and activates custom wheel/touch behavior while you browse People mode.

- `app/hooks/useSceneTuning.ts`:
  - Central hook for scene tuning state.
  - Interface reference: drives the edit panel slider values and model transform updates while edit mode is enabled.

- `app/components/scene3d/tuningSchema.ts`:
  - Canonical defaults + slider metadata.
  - Interface reference: defines what sliders/options appear in the tuning panel and what value ranges they allow.

- `app/components/scene3d/defaults.ts`:
  - Curated baseline tuning values committed to source control.
  - Interface reference: controls the initial "look" of the world before a user applies local edits.

- `app/data/content.ts`:
  - People/project content and scene character configuration.
  - Interface reference: updates to this file appear directly in People cards/details, Projects panels, and character metadata.

---

## 6) How app state works (beginner mental model)

A useful way to understand this codebase:

- **Global page state** (in `app/page.tsx`) decides *which mode is visible* and *which panels are open*.
  - Clarification: "global" here means "global to this page component," not app-wide Redux/Context state. It is the top-level `useState` block near the top of `app/page.tsx`.
- **3D scene state** (from `useSceneTuning`) decides *how objects look and where they sit*.
  - Clarification: this comes from `app/hooks/useSceneTuning.ts` and is consumed by `SceneViewport`/`LandingScene3D` plus the tuning panel.
- **Mode components** (`HomeModeContent`, `PeopleModeContent`, `ProjectsModeContent`) render mode-specific UI based on current page state.

Think of it as:

1. Page state chooses the active experience.
2. Scene tuning customizes the visual world.
3. Data files provide actual content to render.

---

## 7) Safe content editing workflow

Project detail content lives in `app/data/content.ts`.

### Rules

- Keep content as plain text fields in the structured schema:
  - `sections[]`
  - `heading` (optional)
  - `paragraphs[]`
  - `bullets[]` (optional)
- **Do not** inject raw HTML strings.
- If rich text is needed in future, use a controlled markdown pipeline (sanitization + explicit rendering).

---

## 8) Scene tuning workflow (recommended for collaborators)

When adjusting scene values:

1. Start from canonical schema defaults in `app/components/scene3d/tuningSchema.ts`.
2. Enter edit mode in UI, adjust sliders / draggable models.
3. Use **Copy JSON** to export complete overrides.
4. Paste curated values into `app/components/scene3d/defaults.ts`.
5. Keep schema migrations inside tuning helpers if payload shape changes.
6. Verify both Home and People modes across wide and narrow viewports.

---

## 9) Beginner troubleshooting

### Problem: page loads but 3D scene does not show

- Check browser console for runtime errors.
- Run `npm run lint` and fix any surfaced issues.
- Ensure your browser supports WebGL (modern Chrome/Edge/Firefox/Safari generally do).

### Problem: tuning changes disappear on refresh

- Tuning is saved in `localStorage`.
- If your browser blocks local storage or uses strict privacy settings, persistence may fail.
- Also verify no code path is resetting tuning (`resetTuning`) unexpectedly.

### Problem: type errors while editing

- Confirm your editor is using the workspace TypeScript version.
- Run `npm install` again if dependencies are missing.

### Problem: mode transitions feel inconsistent

- Check `handleModeChange` logic in `app/page.tsx`.
- Confirm mode-specific state resets (e.g., people scroll progress) are intentional.

---

## 10) Suggested beginner learning path

If you are new to this stack, learn in this order:

1. React basics (components, props, state, hooks).
2. TypeScript basics (types, interfaces, unions, narrowing).
3. Next.js App Router basics.
4. Three.js concepts (scene, camera, mesh, light).
5. react-three-fiber patterns (React wrapper around Three.js).
6. This repo’s flow: `app/page.tsx` → hooks → scene components.

---

## 11) Quick glossary

- **Mode**: top-level app view (`home`, `people`, `projects`).
- **Override**: per-model transform values replacing defaults (`x`, `y`, `z`, `scale`, `rotX`, `rotY`, `rotZ`).
- **Canonical defaults**: source-of-truth baseline values stored in schema/default files.
- **Tuning payload**: JSON snapshot of scene settings used for sharing/reproducing layout.

---

## 12) Current state variables in `app/page.tsx`

- `mode`: active top-level view (`home`, `people`, `projects`).
- `selectedPerson`: currently opened person ID.
- `selectedProject`: currently opened project ID.
- `reactionId`: person ID showing temporary home reaction bounce.
- `scene3DFailed`: whether 3D runtime failed and fallback is needed.
- `editMode`: whether scene tuning/edit controls are enabled.
- `selectedModelId`: currently selected draggable/editable model.
- `peopleScrollProgress`: normalized people-scroll position (0 → 1).
- `peopleScrollAnimated`: enables/disables smooth people-scroll animation.
- `peopleScrollEnabled`: whether custom people wheel/touch scrolling is active.

---

If you want, a next README improvement can be a **"first 30 minutes" walkthrough** with screenshots of each mode and edit panel. (Great suggestion — this is now a recommended next documentation task.)
