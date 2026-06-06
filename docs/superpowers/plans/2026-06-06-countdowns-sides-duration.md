# Countdowns, changements de côté & durées configurables — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un décompte 5-4-3-2-1-GO avant chaque étirement et au changement de côté (étirements et exercices bilatéraux), et rendre la durée de la Planche et de la Chaise configurable dans les réglages.

**Architecture:** On étend la machine d'état de `useSession.ts` avec trois nouveaux états (`stretchCountdown`, `stretchSideChange`, `exerciseSideChange`) pilotés par un watch countdown unifié. `SideChangeScreen.vue` est un nouveau composant partagé. La durée configurable passe par un champ `duration?` dans `ExerciseOverride`.

**Tech Stack:** Vue 3 Composition API, `<script setup>`, TypeScript strict, VueUse `useLocalStorage`.

---

## Fichiers modifiés / créés

| Fichier | Action |
|---------|--------|
| `src/data/exercises.ts` | Modifier — `sides?: true` sur `Exercise`, `clam` mis à jour |
| `src/composables/useProgram.ts` | Modifier — `duration?` dans `ExerciseOverride`, makeDefault, mergeConfig, buildSession |
| `src/components/screens/CountdownScreen.vue` | Modifier — prop `stretchName?`, exercise/setNumber optionnels, affichage 5-4-3-2-1-GO |
| `src/components/screens/SideChangeScreen.vue` | Créer |
| `src/composables/useSession.ts` | Modifier — 3 nouveaux états, watch unifié, `exerciseSide`, logique bilatérale |
| `src/views/SessionView.vue` | Modifier — import `SideChangeScreen`, 3 nouveaux `v-else-if` |
| `src/views/SettingsView.vue` | Modifier — `adjustExerciseDuration()`, stepper durée exercices timed |

---

### Tâche 1 : exercises.ts — propriété `sides` et mise à jour du clamshell

**Fichiers :**
- Modifier : `src/data/exercises.ts`

- [ ] **Étape 1 : Ajouter `sides?: true` à l'interface `Exercise`**

Dans `src/data/exercises.ts`, après la ligne `cue: string` (ligne 16), ajouter :

```ts
export interface Exercise {
  id: string
  name: string
  emoji: string
  tc: string
  category: ExerciseCategory
  target: string
  sets: number
  reps?: string
  duration?: number
  rest: number
  gear: string | null
  pos: string
  cue: string
  sides?: true
}
```

- [ ] **Étape 2 : Ajouter `sides: true` à l'entrée `clam`**

Remplacer l'entrée `clam` (lignes 59-63) par :

```ts
  {
    id: 'clam', category: 'legs', name: 'Clamshell', emoji: '🦪', tc: '#60a5fa',
    target: 'Genoux · Hanches', sets: 2, reps: '12 reps / côté', rest: 45, gear: 'élastique',
    sides: true,
    pos: 'Couché sur le côté — élastique au-dessus des genoux, hanches fléchies ~45°, genoux pliés',
    cue: "Ouvre le genou du dessus vers le plafond comme une moule. Pieds collés. Résiste à l'élastique à la fermeture — ne laisse pas claquer.",
  },
```

- [ ] **Étape 3 : Vérifier que le build passe**

```bash
make build
```

Attendu : 0 erreur TypeScript.

---

### Tâche 2 : useProgram.ts — durée configurable dans `ExerciseOverride`

**Fichiers :**
- Modifier : `src/composables/useProgram.ts`

- [ ] **Étape 1 : Ajouter `duration?` à `ExerciseOverride`**

Remplacer l'interface (lignes 6-10) par :

```ts
export interface ExerciseOverride {
  enabled: boolean
  sets: number
  rest: number
  duration?: number
}
```

- [ ] **Étape 2 : Mettre à jour `makeDefault()` pour inclure `duration` des exercices timed**

Remplacer le bloc `exercises` dans `makeDefault()` (lignes 28-30) par :

```ts
    exercises: Object.fromEntries(
      exercises.map(e => [e.id, {
        enabled: true,
        sets: e.sets,
        rest: e.rest,
        ...(e.duration !== undefined ? { duration: e.duration } : {}),
      }])
    ),
```

- [ ] **Étape 3 : Mettre à jour `mergeConfig()` pour propager `duration`**

Remplacer le bloc "Add exercises" dans `mergeConfig()` (lignes 46-53) par :

```ts
  for (const e of exercises) {
    if (!merged.exercises[e.id]) {
      merged.exercises = {
        ...merged.exercises,
        [e.id]: {
          enabled: true,
          sets: e.sets,
          rest: e.rest,
          ...(e.duration !== undefined ? { duration: e.duration } : {}),
        },
      }
    }
  }
```

- [ ] **Étape 4 : Mettre à jour `buildSession()` pour appliquer `duration` override**

Remplacer le `.map(e => ({...}))` dans `buildSession()` (lignes 127-131) par :

```ts
      selected.push(...shuffle(candidates).slice(0, quota).map(e => ({
        ...e,
        sets: config.value.exercises[e.id]?.sets ?? e.sets,
        rest: config.value.exercises[e.id]?.rest ?? e.rest,
        ...(e.duration !== undefined
          ? { duration: config.value.exercises[e.id]?.duration ?? e.duration }
          : {}),
      })))
```

- [ ] **Étape 5 : Vérifier que le build passe**

```bash
make build
```

Attendu : 0 erreur TypeScript.

---

### Tâche 3 : CountdownScreen.vue — décompte 5-4-3-2-1-GO et mode étirement

**Fichiers :**
- Modifier : `src/components/screens/CountdownScreen.vue`

- [ ] **Étape 1 : Remplacer le contenu complet du fichier**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { type Exercise } from '../../data/exercises'

const props = defineProps<{
  countdownValue: number
  exercise?: Exercise
  setNumber?: number
  stretchName?: string
}>()

const isGo = computed(() => props.countdownValue > 5)
const displayValue = computed(() => 6 - props.countdownValue)
</script>

<template>
  <div style="min-height: 100vh; background: var(--bg); color: var(--fg); font-family: 'IBM Plex Mono', monospace; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; gap: 12px;">
    <div style="font-size: 10px; color: var(--subtle); letter-spacing: 0.15em; text-transform: uppercase;">
      <template v-if="stretchName">{{ stretchName }}</template>
      <template v-else-if="exercise && setNumber !== undefined">{{ exercise.name }} · Série {{ setNumber }}/{{ exercise.sets }}</template>
    </div>
    <div
      :key="countdownValue"
      class="pop"
      :style="{
        fontFamily: '\'Syne\', sans-serif',
        fontWeight: 800,
        fontSize: isGo ? '72px' : '108px',
        lineHeight: 1,
        color: isGo ? '#22c55e' : 'var(--fg)',
      }"
    >
      {{ isGo ? 'GO !' : displayValue }}
    </div>
    <div style="font-size: 11px; color: var(--subtle);">{{ isGo ? '' : 'prépare-toi' }}</div>
  </div>
</template>
```

- [ ] **Étape 2 : Vérifier que le build passe**

```bash
make build
```

Attendu : 0 erreur TypeScript.

---

### Tâche 4 : SideChangeScreen.vue — nouveau composant

**Fichiers :**
- Créer : `src/components/screens/SideChangeScreen.vue`

- [ ] **Étape 1 : Créer le fichier**

```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  countdownValue: number
}>()

const isGo = computed(() => props.countdownValue > 5)
const displayValue = computed(() => 6 - props.countdownValue)
</script>

<template>
  <div style="min-height: 100vh; background: var(--bg); color: var(--fg); font-family: 'IBM Plex Mono', monospace; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; gap: 12px;">
    <div style="font-size: 10px; color: var(--subtle); letter-spacing: 0.15em; text-transform: uppercase;">
      changez de côté
    </div>
    <div style="font-size: 14px; color: var(--muted); margin-bottom: 4px;">{{ title }}</div>
    <div
      :key="countdownValue"
      class="pop"
      :style="{
        fontFamily: '\'Syne\', sans-serif',
        fontWeight: 800,
        fontSize: isGo ? '72px' : '108px',
        lineHeight: 1,
        color: isGo ? '#22c55e' : 'var(--fg)',
      }"
    >
      {{ isGo ? 'GO !' : displayValue }}
    </div>
    <div style="font-size: 11px; color: var(--subtle);">{{ isGo ? '' : 'prépare-toi' }}</div>
  </div>
</template>
```

- [ ] **Étape 2 : Vérifier que le build passe**

```bash
make build
```

Attendu : 0 erreur TypeScript.

---

### Tâche 5 : useSession.ts — machine d'état complète

**Fichiers :**
- Modifier : `src/composables/useSession.ts`

C'est la tâche la plus volumineuse. Chaque étape est ciblée sur une zone du fichier.

- [ ] **Étape 1 : Mettre à jour `ScreenName` et `PersistedState`**

Remplacer les lignes 8-19 par :

```ts
export type ScreenName =
  | 'home' | 'intro' | 'countdown' | 'active'
  | 'rest' | 'exdone' | 'stretchIntro' | 'stretch' | 'done'
  | 'stretchCountdown' | 'stretchSideChange' | 'exerciseSideChange'

interface PersistedState {
  sessionIds: string[]
  exerciseIndex: number
  setNumber: number
  stretchIndex: number
  stretchSide: 0 | 1
  exerciseSide: 0 | 1
  screen: ScreenName
}
```

- [ ] **Étape 2 : Mettre à jour `snapScreen`**

Remplacer les lignes 21-25 par :

```ts
function snapScreen(s: ScreenName): ScreenName {
  if (s === 'countdown' || s === 'active' || s === 'rest') return 'intro'
  if (s === 'exerciseSideChange') return 'intro'
  if (s === 'stretch' || s === 'stretchCountdown' || s === 'stretchSideChange') return 'stretchIntro'
  return s
}
```

- [ ] **Étape 3 : Ajouter `exerciseSide` et mettre à jour la restauration**

Après la ligne `const stretchSide   = ref<0 | 1>(savedState.value?.stretchSide ?? 0)` (ligne 63), ajouter :

```ts
  const exerciseSide  = ref<0 | 1>(savedState.value?.exerciseSide ?? 0)
```

Mettre à jour `restoreSession()` pour appliquer `duration` override — remplacer le `.map(e => ({...}))` (lignes 51-55) par :

```ts
    return restored.map(e => ({
      ...e,
      sets: config.value.exercises[e.id]?.sets ?? e.sets,
      rest: config.value.exercises[e.id]?.rest ?? e.rest,
      ...(e.duration !== undefined
        ? { duration: config.value.exercises[e.id]?.duration ?? e.duration }
        : {}),
    }))
```

- [ ] **Étape 4 : Mettre à jour `persist()` pour inclure `exerciseSide`**

Remplacer le bloc `savedState.value = {...}` dans `persist()` (lignes 80-87) par :

```ts
    savedState.value = {
      sessionIds: session.value.map(e => e.id),
      exerciseIndex: exerciseIndex.value,
      setNumber: setNumber.value,
      stretchIndex: stretchIndex.value,
      stretchSide: stretchSide.value,
      exerciseSide: exerciseSide.value,
      screen: screen.value,
    }
```

- [ ] **Étape 5 : Remplacer le countdown watch par la version unifiée**

Remplacer le bloc `// ── Countdown watch ──` entier (lignes 125-140) par :

```ts
  // ── Countdown watch ──────────────────────────────────────────────────────
  const countdownScreens: ScreenName[] = ['countdown', 'stretchCountdown', 'stretchSideChange', 'exerciseSideChange']
  let cdTimeout: ReturnType<typeof setTimeout> | null = null

  watch([screen, countdownValue], ([s, cdv]) => {
    if (!countdownScreens.includes(s as ScreenName)) {
      if (cdTimeout) { clearTimeout(cdTimeout); cdTimeout = null }
      return
    }
    if (cdv <= 5) {
      audio.tick()
      cdTimeout = setTimeout(() => { countdownValue.value++ }, 800)
    } else {
      audio.go()
      if (s === 'countdown') {
        cdTimeout = setTimeout(() => { screen.value = 'active' }, 650)
      } else if (s === 'stretchCountdown') {
        cdTimeout = setTimeout(() => { screen.value = 'stretch' }, 650)
      } else if (s === 'stretchSideChange') {
        cdTimeout = setTimeout(() => {
          stretchSide.value = 1
          screen.value = 'stretch'
        }, 650)
      } else if (s === 'exerciseSideChange') {
        cdTimeout = setTimeout(() => {
          exerciseSide.value = 1
          setNumber.value = 1
          screen.value = 'countdown'
        }, 650)
      }
    }
  })
```

- [ ] **Étape 6 : Mettre à jour le screen watch**

Remplacer le bloc `// ── Screen watch ──` entier (lignes 142-187) par :

```ts
  // ── Screen watch ─────────────────────────────────────────────────────────
  watch(screen, (s) => {
    persist()

    if (countdownScreens.includes(s)) {
      countdownValue.value = 1
    }

    if (s === 'active') {
      const ex = currentExercise.value
      if (ex.duration !== undefined) {
        exTimer.start(ex.duration, () => {
          if (setNumber.value < ex.sets) {
            audio.next()
            restTimer.start(ex.rest, () => {
              setNumber.value++
              screen.value = 'countdown'
            })
            screen.value = 'rest'
          } else if (ex.sides && exerciseSide.value === 0) {
            audio.side()
            screen.value = 'exerciseSideChange'
          } else {
            audio.exdone()
            exerciseSide.value = 0
            screen.value = 'exdone'
          }
        })
      }
    }

    if (s === 'stretch') {
      const st = currentStretch.value
      if (st.duration !== null) {
        stretchTimer.start(st.duration, () => {
          if (st.sides && stretchSide.value === 0) {
            audio.side()
            screen.value = 'stretchSideChange'
          } else {
            audio.exdone()
            advanceStretch()
          }
        })
      }
    }
  })
```

- [ ] **Étape 7 : Mettre à jour `handleOk()` pour la logique bilatérale**

Remplacer `handleOk()` (lignes 204-218) par :

```ts
  function handleOk() {
    exTimer.stop()
    const ex = currentExercise.value
    if (setNumber.value < ex.sets) {
      audio.next()
      restTimer.start(ex.rest, () => {
        setNumber.value++
        screen.value = 'countdown'
      })
      screen.value = 'rest'
    } else if (ex.sides && exerciseSide.value === 0) {
      audio.side()
      screen.value = 'exerciseSideChange'
    } else {
      audio.exdone()
      exerciseSide.value = 0
      screen.value = 'exdone'
    }
  }
```

- [ ] **Étape 8 : Mettre à jour `handleNext()` pour remettre `exerciseSide` à 0**

Remplacer `handleNext()` (lignes 228-243) par :

```ts
  function handleNext() {
    exerciseSide.value = 0
    if (exerciseIndex.value < session.value.length - 1) {
      exerciseIndex.value++
      setNumber.value = 1
      screen.value = 'intro'
    } else {
      audio.exdone()
      if (resolvedStretches.value.length === 0) {
        finishSession()
      } else {
        stretchIndex.value = 0
        stretchSide.value = 0
        screen.value = 'stretchIntro'
      }
    }
  }
```

- [ ] **Étape 9 : Mettre à jour `handleRestart()` pour remettre `exerciseSide` à 0**

Dans `handleRestart()`, après `stretchSide.value = 0` (ligne 259), ajouter :

```ts
    exerciseSide.value = 0
```

- [ ] **Étape 10 : Mettre à jour `startStretch()` pour passer par `stretchCountdown`**

Remplacer `startStretch()` (lignes 265-269) par :

```ts
  function startStretch() {
    stretchSide.value = 0
    audio.next()
    screen.value = 'stretchCountdown'
  }
```

- [ ] **Étape 11 : Mettre à jour `handleNextSide()` pour passer par `stretchSideChange`**

Remplacer `handleNextSide()` (lignes 293-301) par :

```ts
  function handleNextSide() {
    stretchTimer.stop()
    audio.side()
    screen.value = 'stretchSideChange'
  }
```

- [ ] **Étape 12 : Exporter `exerciseSide` dans le return**

Dans le bloc `return` (ligne 303+), ajouter `exerciseSide` après `stretchSide` :

```ts
  return {
    screen,
    session,
    exerciseIndex,
    setNumber,
    countdownValue,
    stretchIndex,
    stretchSide,
    exerciseSide,
    elapsed,
    currentExercise,
    currentStretch,
    exTimer,
    restTimer,
    stretchTimer,
    handleBegin,
    handleStart,
    handleOk,
    handleSkipRest,
    handleNext,
    handleRegen,
    handleRestart,
    startStretch,
    skipStretch,
    finishCatCow,
    handleNextSide,
  }
```

- [ ] **Étape 13 : Vérifier que le build passe**

```bash
make build
```

Attendu : 0 erreur TypeScript.

---

### Tâche 6 : SessionView.vue — câblage des nouveaux écrans

**Fichiers :**
- Modifier : `src/views/SessionView.vue`

- [ ] **Étape 1 : Importer `SideChangeScreen`**

Après la ligne `import StretchScreen` (ligne 15), ajouter :

```ts
import SideChangeScreen  from '../components/screens/SideChangeScreen.vue'
```

- [ ] **Étape 2 : Ajouter les trois nouveaux cas dans le template**

Après le bloc `<CountdownScreen v-else-if="s.screen.value === 'countdown'" ...>` (lignes 41-46), ajouter :

```html
  <CountdownScreen
    v-else-if="s.screen.value === 'stretchCountdown'"
    :countdown-value="s.countdownValue.value"
    :stretch-name="s.currentStretch.value?.name"
  />

  <SideChangeScreen
    v-else-if="s.screen.value === 'stretchSideChange'"
    :title="s.currentStretch.value?.name ?? ''"
    :countdown-value="s.countdownValue.value"
  />

  <SideChangeScreen
    v-else-if="s.screen.value === 'exerciseSideChange'"
    :title="s.currentExercise.value?.name ?? ''"
    :countdown-value="s.countdownValue.value"
  />
```

- [ ] **Étape 3 : Vérifier que le build passe**

```bash
make build
```

Attendu : 0 erreur TypeScript.

---

### Tâche 7 : SettingsView.vue — stepper durée pour exercices timed

**Fichiers :**
- Modifier : `src/views/SettingsView.vue`

- [ ] **Étape 1 : Ajouter la fonction `adjustExerciseDuration`**

Dans le `<script setup>`, après la fonction `adjustExerciseRest` (ligne 66), ajouter :

```ts
function adjustExerciseDuration(id: string, delta: number) {
  const current = config.value.exercises[id]
  if (!current || current.duration === undefined) return
  const next = current.duration + delta
  if (next < 10) return
  config.value = {
    ...config.value,
    exercises: { ...config.value.exercises, [id]: { ...current, duration: next } },
  }
}
```

- [ ] **Étape 2 : Ajouter le stepper durée dans les cards d'exercice**

Dans le template, après le bloc `<!-- Repos stepper -->` (lignes 231-237), ajouter le stepper durée :

```html
              <!-- Durée stepper (exercices timed uniquement) -->
              <div v-if="ex.duration !== undefined" style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 11px; color: var(--muted);">Durée</span>
                <button @click="adjustExerciseDuration(ex.id, -5)" style="width: 24px; height: 24px; border-radius: 5px; border: 1px solid var(--ghost-border); background: transparent; color: var(--fg); cursor: pointer; font-size: 14px;">−</button>
                <span style="font-size: 13px; min-width: 28px; text-align: center;">{{ config.exercises[ex.id]?.duration }}s</span>
                <button @click="adjustExerciseDuration(ex.id, 5)" style="width: 24px; height: 24px; border-radius: 5px; border: 1px solid var(--ghost-border); background: transparent; color: var(--fg); cursor: pointer; font-size: 14px;">+</button>
              </div>
```

- [ ] **Étape 3 : Vérifier que le build final passe**

```bash
make build
```

Attendu : 0 erreur TypeScript, build propre.
