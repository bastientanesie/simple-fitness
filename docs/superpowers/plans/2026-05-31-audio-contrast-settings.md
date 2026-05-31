# Audio, Contraste et Paramètres — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter les bips de fin de repos et d'étirements, corriger le contraste du thème sombre, et implémenter l'écran Paramètres avec le toggle de thème.

**Architecture:** Quatre modifications indépendantes — deux ajouts de watches dans `useSession.ts` pour les sons, un correctif CSS pour le contraste, et l'implémentation de `SettingsView.vue` + un bouton ⚙ dans `HomeScreen.vue`.

**Tech Stack:** Vue 3 (Composition API, `<script setup>`), VueUse (`useStorage`), Tailwind CSS v4, CSS variables

---

## Fichiers modifiés

| Fichier | Rôle |
|---|---|
| `src/composables/useSession.ts` | Ajouter watches pour ticks de fin de repos et d'étirements + son au départ d'un étirement |
| `src/assets/main.css` | Corriger `--muted` en thème sombre |
| `src/components/screens/HomeScreen.vue` | Ajouter emit `open-settings` + bouton ⚙ |
| `src/views/SettingsView.vue` | Implémenter l'écran Paramètres avec toggle thème |

---

## Tâche 1 — Bips 3-2-1 fin de repos

**Fichiers :** Modifier `src/composables/useSession.ts`

**Contexte :** Quand `restTimer` décompte, `restTimer.value` est un `ref<number>` qui décrémente de 1 chaque seconde. Un `watch` dessus permet de détecter les valeurs 3, 2, 1 et de jouer `audio.tick()`. Le watch existant sur `countdownValue` fait la même chose pour le compte à rebours 3-2-1-GO initial.

- [ ] **Étape 1 : Ajouter le watch dans `useSession.ts`**

Localiser le bloc `// ── Countdown watch ──` dans `useSession.ts`. Ajouter le watch suivant **juste avant** ce bloc :

```ts
// ── Rest-end tick ────────────────────────────────────────────────────────
watch(restTimer.value, (v) => {
  if (v > 0 && v <= 3) audio.tick()
})
```

- [ ] **Étape 2 : Vérifier le build**

```bash
make build
```

Attendu : build sans erreur TypeScript.

---

## Tâche 2 — Sons pendant les étirements

**Fichiers :** Modifier `src/composables/useSession.ts`

**Contexte :** `startStretch()` bascule vers l'écran `stretch` sans émettre de son. Le `stretchTimer.value` est un `ref<number>` identique au `restTimer.value` — même pattern de watch. Les sons de fin (`audio.exdone()`, `audio.side()`) sont déjà câblés dans les callbacks de timer.

- [ ] **Étape 1 : Ajouter `audio.next()` au départ d'un étirement**

Dans `useSession.ts`, localiser la fonction `startStretch()` :

```ts
function startStretch() {
  stretchSide.value = 0
  screen.value = 'stretch'
}
```

La remplacer par :

```ts
function startStretch() {
  stretchSide.value = 0
  audio.next()
  screen.value = 'stretch'
}
```

- [ ] **Étape 2 : Ajouter le watch pour les ticks de fin d'étirement**

Dans le même fichier, ajouter le watch suivant **juste après** le watch ajouté en Tâche 1 (avant le bloc `// ── Countdown watch ──`) :

```ts
// ── Stretch-end tick ─────────────────────────────────────────────────────
watch(stretchTimer.value, (v) => {
  if (v > 0 && v <= 3) audio.tick()
})
```

- [ ] **Étape 3 : Vérifier le build**

```bash
make build
```

Attendu : build sans erreur.

---

## Tâche 3 — Contraste thème sombre

**Fichiers :** Modifier `src/assets/main.css`

**Contexte :** En thème sombre, `--muted: #555555` sur `--bg: #080808` donne un ratio de contraste ~2,7:1 — insuffisant (WCAG AA exige ≥ 4,5:1). Passer à `#888888` donne ~9:1. `--fg2: #aaaaaa` (~13:1) est déjà correct.

- [ ] **Étape 1 : Corriger `--muted` dans `:root`**

Dans `src/assets/main.css`, localiser dans le bloc `:root` :

```css
  --muted:          #555555;
```

Remplacer par :

```css
  --muted:          #888888;
```

- [ ] **Étape 2 : Vérifier le build**

```bash
make build
```

Attendu : build sans erreur.

---

## Tâche 4 — HomeScreen : bouton Paramètres

**Fichiers :** Modifier `src/components/screens/HomeScreen.vue`

**Contexte :** `HomeScreen` émet `commencer` et `regen`. `App.vue` a déjà `@open-settings="currentView = 'settings'"` câblé sur `<SessionView>`, qui le délègue à `HomeScreen`. Il faut donc ajouter l'emit et le bouton.

- [ ] **Étape 1 : Ajouter l'emit `open-settings`**

Dans `<script setup>`, remplacer :

```ts
defineEmits<{
  commencer: []
  regen: []
}>()
```

par :

```ts
defineEmits<{
  commencer: []
  regen: []
  'open-settings': []
}>()
```

- [ ] **Étape 2 : Ajouter le bouton ⚙ dans le header**

Dans le template, localiser le bloc `<!-- Header -->` :

```html
<!-- Header -->
<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
  <div>
    <div style="font-size: 10px; color: #f0a500; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 8px;">
```

Ajouter le bouton ⚙ comme **second enfant** de ce div flex, après le `<div>` de gauche (chercher la balise `</div>` fermant le div du titre, puis ajouter après) :

```html
  <button
    @click="$emit('open-settings')"
    style="background: transparent; border: 1px solid var(--ghost-border); color: var(--muted); border-radius: 8px; padding: 5px 10px; cursor: pointer; font-size: 14px; flex-shrink: 0; margin-top: 2px;"
  >⚙</button>
```

- [ ] **Étape 3 : Déclarer l'emit dans `SessionView.vue` et le propager**

`SessionView` sert de relais entre `HomeScreen` et `App.vue`. `App.vue` écoute déjà `@open-settings` sur `<SessionView>`, mais `SessionView` ne déclare pas encore cet emit.

Dans `src/views/SessionView.vue`, localiser le bloc `<script setup>` qui commence par :

```ts
import { watch } from 'vue'
import { useSession } from '../composables/useSession'
```

Ajouter `defineEmits` juste après les imports (avant `const s = useSession()`) :

```ts
const emit = defineEmits<{ 'open-settings': [] }>()
```

Puis localiser `<HomeScreen` dans le template et ajouter `@open-settings` :

```html
<HomeScreen
  v-if="s.screen.value === 'home'"
  :session="s.session.value"
  :pool-size="exercises.length"
  @commencer="s.handleBegin()"
  @regen="s.handleRegen()"
  @open-settings="emit('open-settings')"
/>
```

- [ ] **Étape 4 : Vérifier le build**

```bash
make build
```

Attendu : build sans erreur TypeScript.

---

## Tâche 5 — SettingsView : écran Paramètres

**Fichiers :** Modifier `src/views/SettingsView.vue`

**Contexte :** Le stub actuel ne fait qu'émettre `back`. `useTheme()` retourne `{ pref }` — un `useStorage<'system' | 'light' | 'dark'>`. Appeler `useTheme()` depuis n'importe quel composant partage le même état réactif (même clé localStorage `theme-pref`).

- [ ] **Étape 1 : Implémenter `SettingsView.vue`**

Remplacer tout le contenu du fichier par :

```vue
<script setup lang="ts">
import { useTheme } from '../composables/useTheme'

defineEmits<{ back: [] }>()

const { pref } = useTheme()

const themeOptions = [
  { value: 'system' as const, label: 'Système' },
  { value: 'light'  as const, label: 'Clair'   },
  { value: 'dark'   as const, label: 'Sombre'  },
]
</script>

<template>
  <div class="fin" style="min-height: 100vh; background: var(--bg); color: var(--fg); font-family: 'IBM Plex Mono', monospace; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column;">
    <div style="padding: 24px 20px;">

      <!-- Header -->
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 36px;">
        <button
          @click="$emit('back')"
          style="background: transparent; border: 1px solid var(--ghost-border); color: var(--muted); border-radius: 8px; padding: 5px 12px; cursor: pointer; font-size: 14px; font-family: 'IBM Plex Mono', monospace;"
        >←</button>
        <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px;">Paramètres</div>
      </div>

      <!-- Thème -->
      <div>
        <div style="font-size: 10px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 12px;">Thème</div>
        <div style="display: flex; gap: 8px;">
          <button
            v-for="opt in themeOptions"
            :key="opt.value"
            @click="pref = opt.value"
            :style="{
              flex: 1,
              padding: '10px 8px',
              borderRadius: '10px',
              fontSize: '12px',
              fontFamily: '\'IBM Plex Mono\', monospace',
              cursor: 'pointer',
              border: pref === opt.value ? '1px solid var(--fg)' : '1px solid var(--ghost-border)',
              background: pref === opt.value ? 'var(--surface)' : 'transparent',
              color: pref === opt.value ? 'var(--fg)' : 'var(--muted)',
              fontWeight: pref === opt.value ? 600 : 400,
              transition: 'all 0.15s',
            }"
          >{{ opt.label }}</button>
        </div>
      </div>

    </div>
  </div>
</template>
```

- [ ] **Étape 2 : Vérifier le build**

```bash
make build
```

Attendu : build sans erreur TypeScript.
