# Project Init Design — Vue 3 + Bun + Docker + Makefile

Date: 2026-05-28 (révisé après validation)

## Objective

Initialize the Vue 3 project structure and developer toolchain for the `simple-fitness` app. No local Node/Bun/npm installed on the host — all commands run inside Docker containers via a Makefile.

---

## 1. Docker Image

**Primary:** `dhi.io/bun:1` (Docker Hardened Image — gratuite, zero-CVE, signed provenance, SBOM)  
**Fallback:** `oven/bun:1-alpine` (official Bun image) si l'image hardened pose problème.

The image tag is pinned to the major version (`1`) for stability.

---

## 2. Makefile

A single `Makefile` at the project root exposes all developer commands. The image is configurable via `BUN_IMAGE`.

```makefile
BUN_IMAGE ?= dhi.io/bun:1
RUN        = docker run --rm -it -v $(PWD):/app -w /app
RUN_CI     = docker run --rm -v $(PWD):/app -w /app
```

| Target | Command | TTY |
|---|---|---|
| `make install` | `bun install` | no |
| `make dev` | `bun run dev --host` (port 5173) | yes |
| `make build` | `bun run build` | no |
| `make preview` | `bun run preview --host` (port 4173) | yes |
| `make add PKG=foo` | `bun add $(PKG)` | no |
| `make add-dev PKG=foo` | `bun add -d $(PKG)` | no |

`make dev` and `make preview` expose ports to the host (`-p 5173:5173` and `-p 4173:4173`) and use `RUN` (with `-it`).  
All other targets use `RUN_CI` (no `-t`) — safe in non-TTY environments (CI, piped output).

---

## 3. Vue Project Scaffold

Bootstrap **once** with the following one-shot Docker command (not a Makefile target) :

```bash
docker run --rm -it -v $(PWD):/app -w /app dhi.io/bun:1 bunx create-vite . --template vue-ts
```

Puis installer les dépendances :

```bash
make install
make add PKG=@vueuse/core
make add-dev PKG="tailwindcss@^4.2 @tailwindcss/vite@^4.2"
```

---

## 4. Vue Project Structure

```
src/
├── main.ts
├── App.vue                    # currentView ref ('session' | 'settings') + theme class on <html>
├── views/
│   ├── SessionView.vue        # orchestrates screens via currentScreen ref
│   └── SettingsView.vue       # theme preference + future settings
├── components/
│   ├── screens/
│   │   ├── HomeScreen.vue
│   │   ├── IntroScreen.vue
│   │   ├── CountdownScreen.vue
│   │   ├── ActiveScreen.vue
│   │   ├── RestScreen.vue
│   │   ├── ExDoneScreen.vue
│   │   ├── StretchIntroScreen.vue
│   │   ├── StretchScreen.vue
│   │   └── DoneScreen.vue
│   └── ui/                    # shared UI primitives (ring, button, etc.)
├── composables/
│   ├── useTheme.ts            # system/light/dark, persisted via useStorage (VueUse)
│   ├── useSession.ts          # exercise pool, rotation, last-session-ids
│   ├── useTimer.ts            # countdown + progress ring
│   └── useAudio.ts            # Web Audio API — 6 sound events
└── data/
    ├── exercises.ts           # 12 exercises across 4 categories
    └── stretches.ts           # 5 fixed end-of-session stretches
```

**No Vue Router.** Navigation is driven entirely by refs:
- `App.vue` → `currentView: 'session' | 'settings'`
- `SessionView.vue` → `currentScreen: ScreenName`

---

## 5. Vite + Tailwind CSS v4

**`vite.config.ts`:**
```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  base: '/simple-fitness/',
})
```

**Tailwind CSS v4.2** via `@tailwindcss/vite` — no `tailwind.config.js`. Configuration lives in CSS:

```css
/* src/assets/main.css */
@import "tailwindcss";

@theme {
  /* CSS custom properties for theme variables */
}
```

**Dark mode via CSS variables uniquement** — pas d'utilitaires `dark:` Tailwind. `useTheme.ts` gère la classe `light` sur `<html>` :
- Sans préférence : `prefers-color-scheme` media query
- Préférence explicite : classe `light` ou `dark` sur `<html>`

---

## 6. Audio

Six événements dans `useAudio.ts` (Web Audio API, noms identiques à la référence) :

| Nom | Déclenchement |
|---|---|
| `tick` | Décompte 3-2-1 |
| `go` | Début d'exercice |
| `next` | Passage au set suivant |
| `exdone` | Exercice terminé |
| `side` | Changement de côté (étirements bilatéraux) |
| `done` | Fin de séance |

`AudioContext` créé après un geste utilisateur.

---

## 7. GitHub Actions Deployment

File: `.github/workflows/deploy.yml`  
Trigger: push to `main`  
Runner: `ubuntu-latest` avec `oven-sh/setup-bun@v2` (bun natif en CI, pas de Docker)  
Steps: checkout → bun install → bun run build → upload `dist/` → deploy to GitHub Pages

Required repository settings: Pages source set to "GitHub Actions".
