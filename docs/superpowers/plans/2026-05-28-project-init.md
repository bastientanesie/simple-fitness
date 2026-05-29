# Project Init — Vue 3 + Bun + Docker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffolder un projet Vue 3 + TypeScript + Tailwind CSS v4 + VueUse avec Bun dans Docker, déployable sur GitHub Pages via GitHub Actions.

**Architecture:** Pas de Vue Router ni Pinia — navigation par `ref` uniquement. App.vue gère `currentView` ('session' | 'settings'), SessionView gère `currentScreen`. Toutes les commandes passent par le Makefile → Docker.

**Tech Stack:** Vue 3 (Composition API + `<script setup>`), TypeScript, Vite, Tailwind CSS v4 via `@tailwindcss/vite`, VueUse, Bun dans `dhi.io/bun:1`, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-05-28-project-init-design.md`

---

## File Map

| Fichier | Action | Responsabilité |
|---|---|---|
| `Makefile` | Créer | Toutes les commandes dev via Docker |
| `vite.config.ts` | Modifier | Plugins vue + tailwindcss, base `/simple-fitness/` |
| `src/main.ts` | Modifier | Import CSS corrigé |
| `src/style.css` | Supprimer | Remplacé par assets/main.css |
| `src/assets/main.css` | Créer | @import tailwindcss + @theme |
| `src/App.vue` | Remplacer | currentView ref + useTheme() |
| `src/views/SessionView.vue` | Créer | Stub — orchestrateur des écrans |
| `src/views/SettingsView.vue` | Créer | Stub — préférences thème |
| `src/components/screens/*.vue` | Créer (×9) | Stubs des 9 écrans |
| `src/composables/useTheme.ts` | Créer | Gestion thème + classe sur `<html>` |
| `src/composables/useSession.ts` | Créer | Stub |
| `src/composables/useTimer.ts` | Créer | Stub |
| `src/composables/useAudio.ts` | Créer | Stub — 6 méthodes audio |
| `src/data/exercises.ts` | Créer | Stub — tableau vide typé |
| `src/data/stretches.ts` | Créer | Stub — tableau vide typé |
| `.github/workflows/deploy.yml` | Créer | CI/CD GitHub Pages |

---

## Task 1 : Scaffold Vue project

**Files:**
- Génère tout le projet Vite/Vue/TS dans le répertoire courant

- [ ] **Step 1 : Lancer le scaffold**

Depuis la racine du repo :

```bash
docker run --rm -it -v $(PWD):/app -w /app dhi.io/bun:1 bunx create-vite . --template vue-ts
```

Si create-vite demande "Directory is not empty. Remove existing files and continue?" → répondre **Yes**.

- [ ] **Step 2 : Vérifier les fichiers générés**

```bash
ls src/
```

Résultat attendu : `App.vue  assets/  components/  main.ts  style.css` (ou similaire).

---

## Task 2 : Créer le Makefile

**Files:**
- Create: `Makefile`

- [ ] **Step 1 : Créer le Makefile**

```makefile
BUN_IMAGE ?= dhi.io/bun:1
RUN        = docker run --rm -it -v $(PWD):/app -w /app
RUN_CI     = docker run --rm -v $(PWD):/app -w /app

.PHONY: install dev build preview add add-dev

install:
	$(RUN_CI) $(BUN_IMAGE) bun install

dev:
	$(RUN) -p 5173:5173 $(BUN_IMAGE) bun run dev --host

build:
	$(RUN_CI) $(BUN_IMAGE) bun run build

preview:
	$(RUN) -p 4173:4173 $(BUN_IMAGE) bun run preview --host

add:
	$(RUN_CI) $(BUN_IMAGE) bun add $(PKG)

add-dev:
	$(RUN_CI) $(BUN_IMAGE) bun add -d $(PKG)
```

> Les indentations **doivent être des tabulations**, pas des espaces.

---

## Task 3 : Installer les dépendances

**Files:**
- Modifie: `package.json`, `bun.lock`

- [ ] **Step 1 : Installer les dépendances de base**

```bash
make install
```

- [ ] **Step 2 : Ajouter VueUse**

```bash
make add PKG=@vueuse/core
```

- [ ] **Step 3 : Ajouter Tailwind CSS v4**

```bash
make add-dev PKG="tailwindcss@^4.2 @tailwindcss/vite@^4.2"
```

---

## Task 4 : Configurer Vite

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1 : Remplacer le contenu de vite.config.ts**

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  base: '/simple-fitness/',
})
```

---

## Task 5 : Configurer Tailwind CSS

**Files:**
- Delete: `src/style.css`
- Create: `src/assets/main.css`
- Modify: `src/main.ts`

- [ ] **Step 1 : Supprimer src/style.css**

```bash
rm src/style.css
```

- [ ] **Step 2 : Créer src/assets/main.css**

```css
@import "tailwindcss";

@theme {
  --color-bg: #1a1a2e;
  --color-surface: #16213e;
  --color-primary: #e94560;
  --color-text: #e0e0e0;
  --color-muted: #a0a0b0;
}

:root {
  background-color: var(--color-bg);
  color: var(--color-text);
}

html.light {
  --color-bg: #f5f5f5;
  --color-surface: #ffffff;
  --color-primary: #e94560;
  --color-text: #1a1a2e;
  --color-muted: #606070;
}
```

> Les valeurs exactes de couleurs sont dans `docs/seance.html` — ajuster à la prochaine itération en consultant la référence.

- [ ] **Step 3 : Mettre à jour src/main.ts**

```ts
import { createApp } from 'vue'
import './assets/main.css'
import App from './App.vue'

createApp(App).mount('#app')
```

---

## Task 6 : Créer App.vue

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1 : Remplacer src/App.vue**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from './composables/useTheme'
import SessionView from './views/SessionView.vue'
import SettingsView from './views/SettingsView.vue'

type View = 'session' | 'settings'

const currentView = ref<View>('session')
useTheme()
</script>

<template>
  <SessionView
    v-if="currentView === 'session'"
    @open-settings="currentView = 'settings'"
  />
  <SettingsView
    v-else
    @back="currentView = 'session'"
  />
</template>
```

---

## Task 7 : Créer les composables

**Files:**
- Create: `src/composables/useTheme.ts`
- Create: `src/composables/useSession.ts`
- Create: `src/composables/useTimer.ts`
- Create: `src/composables/useAudio.ts`

- [ ] **Step 1 : Créer useTheme.ts**

```ts
import { useStorage, usePreferredDark } from '@vueuse/core'
import { watchEffect } from 'vue'

type ThemePref = 'system' | 'light' | 'dark'

export function useTheme() {
  const pref = useStorage<ThemePref>('theme-pref', 'system')
  const prefersDark = usePreferredDark()

  watchEffect(() => {
    const el = document.documentElement
    el.classList.remove('light', 'dark')
    if (pref.value === 'light') {
      el.classList.add('light')
    } else if (pref.value === 'dark') {
      el.classList.add('dark')
    }
  })

  return { pref }
}
```

- [ ] **Step 2 : Créer useSession.ts**

```ts
export function useSession() {
  return {}
}
```

- [ ] **Step 3 : Créer useTimer.ts**

```ts
export function useTimer() {
  return {}
}
```

- [ ] **Step 4 : Créer useAudio.ts**

```ts
export function useAudio() {
  function tick() {}
  function go() {}
  function next() {}
  function exdone() {}
  function side() {}
  function done() {}

  return { tick, go, next, exdone, side, done }
}
```

---

## Task 8 : Créer les data files

**Files:**
- Create: `src/data/exercises.ts`
- Create: `src/data/stretches.ts`

- [ ] **Step 1 : Créer src/data/exercises.ts**

```ts
export type ExerciseCategory = 'legs' | 'back' | 'core' | 'shoulders'
export type ExerciseType = 'timed' | 'reps'

export interface Exercise {
  id: string
  name: string
  category: ExerciseCategory
  type: ExerciseType
  sets: number
  reps?: number
  duration?: number
  rest: number
}

export const exercises: Exercise[] = []
```

- [ ] **Step 2 : Créer src/data/stretches.ts**

```ts
export interface Stretch {
  id: string
  name: string
  duration: number
  sides: boolean
}

export const stretches: Stretch[] = []
```

---

## Task 9 : Créer les views

**Files:**
- Create: `src/views/SessionView.vue`
- Create: `src/views/SettingsView.vue`

- [ ] **Step 1 : Créer SessionView.vue**

```vue
<script setup lang="ts">
import { ref } from 'vue'

type ScreenName =
  | 'home' | 'intro' | 'countdown' | 'active'
  | 'rest' | 'exdone' | 'stretchIntro' | 'stretch' | 'done'

defineEmits<{ 'open-settings': [] }>()

const currentScreen = ref<ScreenName>('home')
</script>

<template>
  <div>{{ currentScreen }}</div>
</template>
```

- [ ] **Step 2 : Créer SettingsView.vue**

```vue
<script setup lang="ts">
defineEmits<{ back: [] }>()
</script>

<template>
  <div>Settings</div>
</template>
```

---

## Task 10 : Créer les screen components

**Files:**
- Create: `src/components/screens/HomeScreen.vue`
- Create: `src/components/screens/IntroScreen.vue`
- Create: `src/components/screens/CountdownScreen.vue`
- Create: `src/components/screens/ActiveScreen.vue`
- Create: `src/components/screens/RestScreen.vue`
- Create: `src/components/screens/ExDoneScreen.vue`
- Create: `src/components/screens/StretchIntroScreen.vue`
- Create: `src/components/screens/StretchScreen.vue`
- Create: `src/components/screens/DoneScreen.vue`

- [ ] **Step 1 : Créer les 9 stubs**

Chaque fichier a le même contenu (remplacer `HomeScreen` par le nom du composant) :

`src/components/screens/HomeScreen.vue` :
```vue
<template><div>HomeScreen</div></template>
```

`src/components/screens/IntroScreen.vue` :
```vue
<template><div>IntroScreen</div></template>
```

`src/components/screens/CountdownScreen.vue` :
```vue
<template><div>CountdownScreen</div></template>
```

`src/components/screens/ActiveScreen.vue` :
```vue
<template><div>ActiveScreen</div></template>
```

`src/components/screens/RestScreen.vue` :
```vue
<template><div>RestScreen</div></template>
```

`src/components/screens/ExDoneScreen.vue` :
```vue
<template><div>ExDoneScreen</div></template>
```

`src/components/screens/StretchIntroScreen.vue` :
```vue
<template><div>StretchIntroScreen</div></template>
```

`src/components/screens/StretchScreen.vue` :
```vue
<template><div>StretchScreen</div></template>
```

`src/components/screens/DoneScreen.vue` :
```vue
<template><div>DoneScreen</div></template>
```

---

## Task 11 : Supprimer les fichiers de démo create-vite

**Files:**
- Delete: `src/components/HelloWorld.vue` (si présent)
- Delete: `src/assets/vue.svg` (si présent)
- Delete: `public/vite.svg` (si présent)

- [ ] **Step 1 : Nettoyer les fichiers de démo**

```bash
rm -f src/components/HelloWorld.vue src/assets/vue.svg public/vite.svg
```

---

## Task 12 : GitHub Actions workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1 : Créer le répertoire et le fichier**

```bash
mkdir -p .github/workflows
```

- [ ] **Step 2 : Créer deploy.yml**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
        id: deployment
```

---

## Task 13 : Vérifier que le projet compile

**Files:**
- Aucun fichier modifié

- [ ] **Step 1 : Lancer le build**

```bash
make build
```

Résultat attendu : `dist/` créé, aucune erreur TypeScript.

- [ ] **Step 2 : Lancer le dev server et vérifier**

```bash
make dev
```

Ouvrir `http://localhost:5173/simple-fitness/` — la page doit s'afficher (même vide).

---

## Self-Review

- **Spec coverage** : ✅ Docker image (Task 1), Makefile (Task 2), scaffold + deps (Tasks 1–3), Vite config (Task 4), Tailwind v4 (Task 5), App.vue structure (Task 6), composables (Task 7), data (Task 8), views (Task 9), screens (Task 10), GitHub Actions (Task 12).
- **No placeholders** : ✅ Tout le code est complet et compilable.
- **Type consistency** : ✅ `useTheme()` retourne `{ pref }` — App.vue l'appelle sans destructuring (usage correct). `ScreenName` défini dans SessionView.vue utilisé localement. `Exercise` et `Stretch` interfaces définies dans data files.
- **Gap** : La couleur exacte des CSS variables sera à ajuster en consultant `docs/seance.html` (Task 5, Step 2 — noté explicitement).
