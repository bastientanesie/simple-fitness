# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project goal

Transform `docs/seance.html` (a standalone React 18 / CDN page) into a proper **Vue.js 3 + VueUse + Tailwind CSS** application, built with **Vite**, deployed via **GitHub Actions** to **GitHub Pages**.

## Stack

- Vue 3 (Composition API + `<script setup>`)
- VueUse (`useLocalStorage`, `useWakeLock`)
- Tailwind CSS v4
- Vite (build tool)
- GitHub Actions → GitHub Pages (deployment via Bun, not Docker)

## Commands

Local dev runs inside Docker via the Makefile — no local Node/Bun/npm required.

```bash
make dev          # dev server (Vite, port 5173)
make build        # production build → dist/
make preview      # preview the built app locally (port 4173)
make install      # install dependencies
make add PKG=foo  # add a runtime dependency
make add-dev PKG=foo  # add a dev dependency
```

CI/CD (GitHub Actions) uses Bun directly (`bun install` + `bun run build`).

## Architecture

```
src/
  App.vue                    # root: routes between SessionView and SettingsView
  main.ts
  env.d.ts
  assets/
    main.css                 # CSS variables, animations, global styles
  data/
    exercises.ts             # Exercise type + POOL (12 exercises)
    stretches.ts             # Stretch type + STRETCHES (5 fixed)
  composables/
    useSession.ts            # session state machine + persistence
    useTimer.ts              # countdown/interval timer
    useAudio.ts              # Web Audio API sound engine
    useTheme.ts              # light/dark/system theme toggle
  components/
    Ring.vue                 # SVG circular progress for timed exercises
    Dots.vue                 # dot-based exercise progress indicator
    screens/
      HomeScreen.vue
      IntroScreen.vue
      CountdownScreen.vue
      ActiveScreen.vue
      RestScreen.vue
      ExDoneScreen.vue
      StretchIntroScreen.vue
      StretchScreen.vue
      DoneScreen.vue
  views/
    SessionView.vue          # screen router (delegates to screen components)
    SettingsView.vue         # stub — not yet implemented
```

## App domain

A personal fitness session assistant. Key domain concepts:

- **POOL** — 12 exercises in 4 categories (`legs`, `back`, `core`, `shoulders`). Each session draws 2 legs + 1 back + 1 core + 1 shoulders, shuffled, avoiding exercises from the previous session (stored in `localStorage` under `last-session-ids`).
- **STRETCHES** — 5 fixed stretches always played at the end of every session.
- **Exercise types** — `timed` (fixed-duration countdown ring, e.g. *Chaise* 30 s, *Planche* 20 s) vs `reps` (rep-count display with manual "done" button).
- **Sets** — each exercise has a `sets` count (e.g. 3). The `countdown → active → rest` loop repeats for each set before moving to `exdone`.
- **Bilateral stretches** — `sides: true` on a stretch plays left side then right side with a `side` sound cue between them.
- **Screen flow**: `home` → `intro` → `countdown` (3-2-1-GO) → `active` → `rest` → *(repeat per set)* → `exdone` → `stretchIntro` → `stretch` → `done`.
- **Session persistence** — active session is saved to `localStorage` under `session-state`; mid-exercise screens snap back to `intro`/`stretchIntro` on reload.

## Audio

All sounds are generated via the **Web Audio API** (no audio files). `AudioContext` must be created after a user gesture. Six distinct sound events: `tick`, `go`, `next`, `exdone`, `side`, `done`.

## Theme

Three modes: `system` / `light` / `dark`. Active mode stored in `localStorage` under `theme-pref`. CSS variables on `:root` (dark) and `html.light` (light).

## Reference implementation

`docs/seance.html` is the working reference. All behaviour, exercises, stretches, timings and copy must be preserved exactly when migrating to Vue.
