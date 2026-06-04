# Program Config Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to configure their fitness program (category quotas, per-exercise sets/rest, stretch order and toggles) via SettingsView, persisted to localStorage per device.

**Architecture:** Introduce `useProgram` composable that owns `ProgramConfig` in localStorage, merges new pool entries on init, and exposes `buildSession` + `resolvedStretches`. Refactor `useSession` to consume `useProgram` instead of raw pool arrays. Implement SettingsView with three scrollable sections (session structure / exercises / stretches) plus a reset button.

**Tech Stack:** Vue 3 Composition API (`<script setup>`), VueUse `useLocalStorage`, TypeScript, Tailwind CSS v4, inline styles (matching existing SettingsView pattern)

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/data/exercises.ts` | Add `lunge-back` exercise |
| Create | `src/composables/useProgram.ts` | Config types, DEFAULT_CONFIG, merge, buildSession, resolvedStretches |
| Modify | `src/composables/useSession.ts` | Remove local buildSession, consume useProgram |
| Modify | `src/views/SettingsView.vue` | Full Settings UI (3 sections + reset) |

> Note: `plank`, `deadbug`, `pullap`, `wallang` are already in `exercises.ts`. The spec listed them as "manquants" but they were added earlier.

---

## Task 1 — Add `lunge-back` to exercises.ts

**Files:**
- Modify: `src/data/exercises.ts`

- [ ] **Step 1: Add `lunge-back` after the existing `lunge` entry**

In `src/data/exercises.ts`, after the `lunge` object (line ~35), insert:

```ts
  {
    id: 'lunge-back', category: 'legs', name: 'Fente arrière', emoji: '🔙', tc: '#60a5fa',
    target: 'Jambes · Fessiers', sets: 3, reps: '10 reps / côté', rest: 45, gear: null,
    pos: 'Debout, pieds joints, mains sur les hanches',
    cue: "Grand pas en arrière, descends le genou arrière près du sol sans le toucher. Tronc droit. Repousse sur le pied avant pour revenir. Alterne les côtés.",
  },
```

- [ ] **Step 2: Verify the app still builds**

```bash
make build
```

Expected: build exits 0, no TypeScript errors.

---

## Task 2 — Create `src/composables/useProgram.ts`

**Files:**
- Create: `src/composables/useProgram.ts`

- [ ] **Step 1: Write the full composable**

Create `src/composables/useProgram.ts` with this exact content:

```ts
import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { exercises, type Exercise, type ExerciseCategory } from '../data/exercises'
import { stretches, type Stretch } from '../data/stretches'

export interface ExerciseOverride {
  enabled: boolean
  sets: number
  rest: number
}

export interface StretchEntry {
  id: string
  enabled: boolean
  duration?: number
  reps?: number
}

export interface ProgramConfig {
  categoryQuotas: Record<ExerciseCategory, number>
  exercises: Record<string, ExerciseOverride>
  stretches: StretchEntry[]
}

function makeDefault(): ProgramConfig {
  return {
    categoryQuotas: { legs: 2, back: 1, core: 1, shoulders: 1 },
    exercises: Object.fromEntries(
      exercises.map(e => [e.id, { enabled: true, sets: e.sets, rest: e.rest }])
    ),
    stretches: stretches.map(s => ({
      id: s.id,
      enabled: true,
      ...(s.duration !== null ? { duration: s.duration } : { reps: (s as { reps: number }).reps }),
    })),
  }
}

function mergeConfig(saved: ProgramConfig): ProgramConfig {
  const merged = { ...saved }

  // Add exercises present in pool but absent from saved config
  for (const e of exercises) {
    if (!merged.exercises[e.id]) {
      merged.exercises = {
        ...merged.exercises,
        [e.id]: { enabled: true, sets: e.sets, rest: e.rest },
      }
    }
  }

  // Append stretches present in pool but absent from saved config
  const savedIds = new Set(merged.stretches.map(s => s.id))
  const newStretches: StretchEntry[] = []
  for (const s of stretches) {
    if (!savedIds.has(s.id)) {
      newStretches.push({
        id: s.id,
        enabled: true,
        ...(s.duration !== null ? { duration: s.duration } : { reps: (s as { reps: number }).reps }),
      })
    }
  }
  if (newStretches.length > 0) {
    merged.stretches = [...merged.stretches, ...newStretches]
  }

  return merged
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function useProgram() {
  const config = useLocalStorage<ProgramConfig>('program-config', makeDefault(), {
    serializer: {
      read: (v: string) => {
        try {
          return mergeConfig(JSON.parse(v) as ProgramConfig)
        } catch {
          return makeDefault()
        }
      },
      write: (v: ProgramConfig) => JSON.stringify(v),
    },
  })

  const resolvedStretches = computed<Stretch[]>(() =>
    config.value.stretches
      .filter(entry => entry.enabled)
      .map(entry => {
        const base = stretches.find(s => s.id === entry.id)
        if (!base) return null
        if (base.duration !== null) {
          return { ...base, duration: entry.duration ?? base.duration } as Stretch
        }
        return { ...base, reps: entry.reps ?? (base as { reps: number }).reps } as Stretch
      })
      .filter((s): s is Stretch => s !== null)
  )

  function buildSession(lastIds: string[]): Exercise[] {
    const categories: ExerciseCategory[] = ['legs', 'back', 'core', 'shoulders']
    const selected: Exercise[] = []

    for (const cat of categories) {
      const quota = config.value.categoryQuotas[cat] ?? 0
      if (quota === 0) continue

      const enabled = exercises.filter(
        e => e.category === cat && config.value.exercises[e.id]?.enabled
      )
      const pool = enabled.length <= quota
        ? enabled
        : enabled.filter(e => !lastIds.includes(e.id))

      const candidates = pool.length > 0 ? pool : enabled
      selected.push(...shuffle(candidates).slice(0, quota).map(e => ({
        ...e,
        sets: config.value.exercises[e.id]?.sets ?? e.sets,
        rest: config.value.exercises[e.id]?.rest ?? e.rest,
      })))
    }

    return shuffle(selected)
  }

  function resetToDefault() {
    config.value = makeDefault()
  }

  return { config, resolvedStretches, buildSession, resetToDefault }
}
```

- [ ] **Step 2: Verify the app builds**

```bash
make build
```

Expected: build exits 0, no TypeScript errors.

---

## Task 3 — Refactor `useSession.ts` to consume `useProgram`

**Files:**
- Modify: `src/composables/useSession.ts`

- [ ] **Step 1: Replace the file header and module-level buildSession**

Replace lines 1–35 (imports + `shuffle` + `buildSession` function) with:

```ts
import { ref, computed, watch } from 'vue'
import { useLocalStorage, useWakeLock } from '@vueuse/core'
import { exercises, type Exercise } from '../data/exercises'
import { useTimer } from './useTimer'
import { useAudio } from './useAudio'
import { useProgram } from './useProgram'
```

- [ ] **Step 2: Wire useProgram inside useSession**

At the top of the `useSession()` function body (after `const audio = useAudio()`), add:

```ts
const { buildSession, resolvedStretches } = useProgram()
```

- [ ] **Step 3: Fix `restoreSession` — uses `exercises` directly (still valid)**

`restoreSession` still needs to look up exercises by id. It already imports `exercises`, so no change needed there. Verify its body still references `exercises.find(e => e.id === id)` — this is correct.

- [ ] **Step 4: Fix `currentStretch` to use `resolvedStretches`**

Replace:
```ts
  const currentStretch = computed(() =>
    stretches[Math.min(stretchIndex.value, stretches.length - 1)]
  )
```

With:
```ts
  const currentStretch = computed(() =>
    resolvedStretches.value[Math.min(stretchIndex.value, resolvedStretches.value.length - 1)]
  )
```

- [ ] **Step 5: Fix `advanceStretch` to use `resolvedStretches`**

Replace:
```ts
  function advanceStretch() {
    stretchTimer.stop()
    if (stretchIndex.value < stretches.length - 1) {
      setTimeout(() => {
        stretchIndex.value++
        stretchSide.value = 0
        screen.value = 'stretchIntro'
      }, 600)
    } else {
      setTimeout(() => finishSession(), 600)
    }
  }
```

With:
```ts
  function advanceStretch() {
    stretchTimer.stop()
    if (stretchIndex.value < resolvedStretches.value.length - 1) {
      setTimeout(() => {
        stretchIndex.value++
        stretchSide.value = 0
        screen.value = 'stretchIntro'
      }, 600)
    } else {
      setTimeout(() => finishSession(), 600)
    }
  }
```

- [ ] **Step 6: Fix `handleNext` to skip stretch phase when resolvedStretches is empty**

Replace:
```ts
  function handleNext() {
    if (exerciseIndex.value < session.value.length - 1) {
      exerciseIndex.value++
      setNumber.value = 1
      screen.value = 'intro'
    } else {
      audio.exdone()
      stretchIndex.value = 0
      stretchSide.value = 0
      screen.value = 'stretchIntro'
    }
  }
```

With:
```ts
  function handleNext() {
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

- [ ] **Step 7: Fix `skipStretch` to use `resolvedStretches`**

Replace:
```ts
  function skipStretch() {
    stretchTimer.stop()
    if (stretchIndex.value < stretches.length - 1) {
      stretchIndex.value++
      stretchSide.value = 0
      screen.value = 'stretchIntro'
    } else {
      finishSession()
    }
  }
```

With:
```ts
  function skipStretch() {
    stretchTimer.stop()
    if (stretchIndex.value < resolvedStretches.value.length - 1) {
      stretchIndex.value++
      stretchSide.value = 0
      screen.value = 'stretchIntro'
    } else {
      finishSession()
    }
  }
```

- [ ] **Step 8: Fix `finishCatCow` to use `resolvedStretches`**

Replace:
```ts
  function finishCatCow() {
    audio.exdone()
    if (stretchIndex.value < stretches.length - 1) {
      stretchIndex.value++
      stretchSide.value = 0
      screen.value = 'stretchIntro'
    } else {
      finishSession()
    }
  }
```

With:
```ts
  function finishCatCow() {
    audio.exdone()
    if (stretchIndex.value < resolvedStretches.value.length - 1) {
      stretchIndex.value++
      stretchSide.value = 0
      screen.value = 'stretchIntro'
    } else {
      finishSession()
    }
  }
```

- [ ] **Step 9: Remove unused `stretches` import**

The `import { stretches } from '../data/stretches'` line is now unused — remove it.

- [ ] **Step 10: Verify build**

```bash
make build
```

Expected: build exits 0, no TypeScript errors.

---

## Task 4 — Implement SettingsView.vue

**Files:**
- Modify: `src/views/SettingsView.vue`

This task replaces the entire SettingsView stub with the full 3-section UI. Read `src/composables/useProgram.ts` (from Task 2) and `src/data/exercises.ts` before editing.

- [ ] **Step 1: Replace the entire file content**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from '../composables/useTheme'
import { useProgram } from '../composables/useProgram'
import { exercises, CAT_LABELS, type ExerciseCategory } from '../data/exercises'
import { stretches } from '../data/stretches'

defineEmits<{ back: [] }>()

const { pref } = useTheme()
const { config, resetToDefault } = useProgram()

const themeOptions = [
  { value: 'system' as const, label: 'Système' },
  { value: 'light'  as const, label: 'Clair'   },
  { value: 'dark'   as const, label: 'Sombre'  },
]

const categories: ExerciseCategory[] = ['legs', 'back', 'core', 'shoulders']

const totalExercises = computed(() =>
  categories.reduce((sum, cat) => sum + (config.value.categoryQuotas[cat] ?? 0), 0)
)

function enabledCountForCat(cat: ExerciseCategory): number {
  return exercises.filter(e => e.category === cat && config.value.exercises[e.id]?.enabled).length
}

function adjustQuota(cat: ExerciseCategory, delta: number) {
  const next = (config.value.categoryQuotas[cat] ?? 0) + delta
  if (next < 0) return
  config.value = {
    ...config.value,
    categoryQuotas: { ...config.value.categoryQuotas, [cat]: next },
  }
}

function toggleExercise(id: string) {
  const current = config.value.exercises[id]
  if (!current) return
  config.value = {
    ...config.value,
    exercises: { ...config.value.exercises, [id]: { ...current, enabled: !current.enabled } },
  }
}

function adjustExerciseSets(id: string, delta: number) {
  const current = config.value.exercises[id]
  if (!current) return
  const next = current.sets + delta
  if (next < 1) return
  config.value = {
    ...config.value,
    exercises: { ...config.value.exercises, [id]: { ...current, sets: next } },
  }
}

function adjustExerciseRest(id: string, delta: number) {
  const current = config.value.exercises[id]
  if (!current) return
  const next = current.rest + delta
  if (next < 0) return
  config.value = {
    ...config.value,
    exercises: { ...config.value.exercises, [id]: { ...current, rest: next } },
  }
}

function moveStretch(index: number, direction: -1 | 1) {
  const arr = [...config.value.stretches]
  const target = index + direction
  if (target < 0 || target >= arr.length) return
  ;[arr[index], arr[target]] = [arr[target], arr[index]]
  config.value = { ...config.value, stretches: arr }
}

function toggleStretch(id: string) {
  config.value = {
    ...config.value,
    stretches: config.value.stretches.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ),
  }
}

function adjustStretchDuration(id: string, delta: number) {
  config.value = {
    ...config.value,
    stretches: config.value.stretches.map(s => {
      if (s.id !== id || s.duration === undefined) return s
      const next = s.duration + delta
      if (next < 5) return s
      return { ...s, duration: next }
    }),
  }
}

function adjustStretchReps(id: string, delta: number) {
  config.value = {
    ...config.value,
    stretches: config.value.stretches.map(s => {
      if (s.id !== id || s.reps === undefined) return s
      const next = s.reps + delta
      if (next < 1) return s
      return { ...s, reps: next }
    }),
  }
}

const showResetConfirm = ref(false)

function confirmReset() {
  resetToDefault()
  showResetConfirm.value = false
}
</script>

<template>
  <div style="min-height: 100vh; background: var(--bg); color: var(--fg); font-family: 'IBM Plex Mono', monospace; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column;">
    <div style="padding: 24px 20px 80px;">

      <!-- Header -->
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 36px;">
        <button
          @click="$emit('back')"
          style="background: transparent; border: 1px solid var(--ghost-border); color: var(--muted); border-radius: 8px; padding: 5px 12px; cursor: pointer; font-size: 14px; font-family: 'IBM Plex Mono', monospace;"
        >←</button>
        <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px;">Paramètres</div>
      </div>

      <!-- Thème -->
      <div style="margin-bottom: 40px;">
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

      <!-- 5.1 Structure de séance -->
      <div style="margin-bottom: 40px;">
        <div style="font-size: 10px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 16px;">Structure de séance</div>

        <div v-for="cat in categories" :key="cat" style="margin-bottom: 12px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 13px;">{{ CAT_LABELS[cat] }}</span>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span
                v-if="enabledCountForCat(cat) < config.categoryQuotas[cat]"
                style="font-size: 11px; color: #f59e0b;"
              >seulement {{ enabledCountForCat(cat) }} dispo</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <button
                  @click="adjustQuota(cat, -1)"
                  style="width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--ghost-border); background: transparent; color: var(--fg); cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;"
                >−</button>
                <span style="font-size: 14px; min-width: 16px; text-align: center;">{{ config.categoryQuotas[cat] }}</span>
                <button
                  @click="adjustQuota(cat, 1)"
                  style="width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--ghost-border); background: transparent; color: var(--fg); cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;"
                >+</button>
              </div>
            </div>
          </div>
        </div>

        <div style="margin-top: 12px; font-size: 11px; color: var(--muted);">
          {{ totalExercises }} exercice{{ totalExercises !== 1 ? 's' : '' }} par séance
        </div>
      </div>

      <!-- 5.2 Exercices -->
      <div style="margin-bottom: 40px;">
        <div style="font-size: 10px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 16px;">Exercices</div>

        <div v-for="cat in categories" :key="cat" style="margin-bottom: 24px;">
          <div style="font-size: 11px; color: var(--muted); margin-bottom: 8px;">{{ CAT_LABELS[cat] }}</div>

          <div
            v-for="ex in exercises.filter(e => e.category === cat)"
            :key="ex.id"
            style="margin-bottom: 8px; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--ghost-border);"
            :style="{ opacity: config.exercises[ex.id]?.enabled ? 1 : 0.45 }"
          >
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span>{{ ex.emoji }}</span>
                <span style="font-size: 13px;">{{ ex.name }}</span>
              </div>
              <!-- Toggle -->
              <button
                @click="toggleExercise(ex.id)"
                :style="{
                  width: '40px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer',
                  background: config.exercises[ex.id]?.enabled ? 'var(--fg)' : 'var(--ghost-border)',
                  position: 'relative', transition: 'background 0.2s',
                }"
              >
                <span :style="{
                  position: 'absolute', top: '3px', width: '16px', height: '16px',
                  borderRadius: '50%', background: 'var(--bg)', transition: 'left 0.2s',
                  left: config.exercises[ex.id]?.enabled ? '21px' : '3px',
                }"></span>
              </button>
            </div>

            <div v-if="config.exercises[ex.id]?.enabled" style="display: flex; gap: 16px; flex-wrap: wrap;">
              <!-- Séries stepper -->
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 11px; color: var(--muted);">Séries</span>
                <button @click="adjustExerciseSets(ex.id, -1)" style="width: 24px; height: 24px; border-radius: 5px; border: 1px solid var(--ghost-border); background: transparent; color: var(--fg); cursor: pointer; font-size: 14px;">−</button>
                <span style="font-size: 13px; min-width: 14px; text-align: center;">{{ config.exercises[ex.id]?.sets }}</span>
                <button @click="adjustExerciseSets(ex.id, 1)" style="width: 24px; height: 24px; border-radius: 5px; border: 1px solid var(--ghost-border); background: transparent; color: var(--fg); cursor: pointer; font-size: 14px;">+</button>
              </div>
              <!-- Repos stepper -->
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 11px; color: var(--muted);">Repos</span>
                <button @click="adjustExerciseRest(ex.id, -5)" style="width: 24px; height: 24px; border-radius: 5px; border: 1px solid var(--ghost-border); background: transparent; color: var(--fg); cursor: pointer; font-size: 14px;">−</button>
                <span style="font-size: 13px; min-width: 24px; text-align: center;">{{ config.exercises[ex.id]?.rest }}s</span>
                <button @click="adjustExerciseRest(ex.id, 5)" style="width: 24px; height: 24px; border-radius: 5px; border: 1px solid var(--ghost-border); background: transparent; color: var(--fg); cursor: pointer; font-size: 14px;">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 5.3 Étirements -->
      <div style="margin-bottom: 40px;">
        <div style="font-size: 10px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 16px;">Étirements</div>

        <div
          v-for="(entry, index) in config.stretches"
          :key="entry.id"
          style="margin-bottom: 8px; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--ghost-border);"
          :style="{ opacity: entry.enabled ? 1 : 0.45 }"
        >
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <!-- Reorder buttons -->
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <button
                  @click="moveStretch(index, -1)"
                  :disabled="index === 0"
                  style="width: 20px; height: 18px; border-radius: 4px; border: 1px solid var(--ghost-border); background: transparent; color: var(--fg); cursor: pointer; font-size: 10px; line-height: 1; disabled:opacity-30;"
                  :style="{ opacity: index === 0 ? 0.3 : 1 }"
                >↑</button>
                <button
                  @click="moveStretch(index, 1)"
                  :disabled="index === config.stretches.length - 1"
                  style="width: 20px; height: 18px; border-radius: 4px; border: 1px solid var(--ghost-border); background: transparent; color: var(--fg); cursor: pointer; font-size: 10px; line-height: 1;"
                  :style="{ opacity: index === config.stretches.length - 1 ? 0.3 : 1 }"
                >↓</button>
              </div>
              <span>{{ stretches.find(s => s.id === entry.id)?.emoji }}</span>
              <span style="font-size: 13px;">{{ stretches.find(s => s.id === entry.id)?.name }}</span>
            </div>
            <!-- Toggle -->
            <button
              @click="toggleStretch(entry.id)"
              :style="{
                width: '40px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer',
                background: entry.enabled ? 'var(--fg)' : 'var(--ghost-border)',
                position: 'relative', transition: 'background 0.2s',
              }"
            >
              <span :style="{
                position: 'absolute', top: '3px', width: '16px', height: '16px',
                borderRadius: '50%', background: 'var(--bg)', transition: 'left 0.2s',
                left: entry.enabled ? '21px' : '3px',
              }"></span>
            </button>
          </div>

          <!-- Duration / reps stepper -->
          <div v-if="entry.enabled" style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 11px; color: var(--muted);">{{ entry.duration !== undefined ? 'Durée' : 'Reps' }}</span>
            <template v-if="entry.duration !== undefined">
              <button @click="adjustStretchDuration(entry.id, -5)" style="width: 24px; height: 24px; border-radius: 5px; border: 1px solid var(--ghost-border); background: transparent; color: var(--fg); cursor: pointer; font-size: 14px;">−</button>
              <span style="font-size: 13px; min-width: 28px; text-align: center;">{{ entry.duration }}s</span>
              <button @click="adjustStretchDuration(entry.id, 5)" style="width: 24px; height: 24px; border-radius: 5px; border: 1px solid var(--ghost-border); background: transparent; color: var(--fg); cursor: pointer; font-size: 14px;">+</button>
            </template>
            <template v-else-if="entry.reps !== undefined">
              <button @click="adjustStretchReps(entry.id, -1)" style="width: 24px; height: 24px; border-radius: 5px; border: 1px solid var(--ghost-border); background: transparent; color: var(--fg); cursor: pointer; font-size: 14px;">−</button>
              <span style="font-size: 13px; min-width: 24px; text-align: center;">{{ entry.reps }}</span>
              <button @click="adjustStretchReps(entry.id, 1)" style="width: 24px; height: 24px; border-radius: 5px; border: 1px solid var(--ghost-border); background: transparent; color: var(--fg); cursor: pointer; font-size: 14px;">+</button>
            </template>
          </div>
        </div>
      </div>

      <!-- Réinitialisation -->
      <div style="border-top: 1px solid var(--ghost-border); padding-top: 24px;">
        <button
          @click="showResetConfirm = true"
          style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid var(--ghost-border); background: transparent; color: var(--muted); font-family: 'IBM Plex Mono', monospace; font-size: 13px; cursor: pointer;"
        >Réinitialiser les paramètres</button>
      </div>

    </div>

    <!-- Reset confirm dialog -->
    <div
      v-if="showResetConfirm"
      style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: flex-end; justify-content: center; padding: 24px;"
      @click.self="showResetConfirm = false"
    >
      <div style="background: var(--surface); border-radius: 16px; padding: 24px; width: 100%; max-width: 480px;">
        <div style="font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; margin-bottom: 8px;">Réinitialiser ?</div>
        <div style="font-size: 13px; color: var(--muted); margin-bottom: 20px;">Tous les paramètres reviendront aux valeurs par défaut.</div>
        <div style="display: flex; gap: 8px;">
          <button
            @click="showResetConfirm = false"
            style="flex: 1; padding: 12px; border-radius: 10px; border: 1px solid var(--ghost-border); background: transparent; color: var(--fg); font-family: 'IBM Plex Mono', monospace; font-size: 13px; cursor: pointer;"
          >Annuler</button>
          <button
            @click="confirmReset"
            style="flex: 1; padding: 12px; border-radius: 10px; border: none; background: var(--fg); color: var(--bg); font-family: 'IBM Plex Mono', monospace; font-size: 13px; cursor: pointer; font-weight: 600;"
          >Confirmer</button>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Verify build**

```bash
make build
```

Expected: build exits 0, no TypeScript errors.

- [ ] **Step 3: Manual smoke test**

Run `make dev`, open the app in the browser, navigate to Settings and verify:
- Category steppers change the quota value
- Warning appears when quota > enabled exercises count
- Exercise toggle hides/shows sets and rest steppers
- Stretch toggle, reorder buttons (↑/↓), and duration/reps steppers work
- Reset button shows confirmation dialog; Confirmer resets to defaults; Annuler dismisses

---

## Self-Review

**Spec coverage:**

| Spec section | Covered by |
|---|---|
| § Pool étendu (lunge-back) | Task 1 |
| § Type `ProgramConfig` | Task 2 |
| § Clé localStorage `program-config` | Task 2 |
| § Config par défaut | Task 2 `makeDefault()` |
| § Merge au chargement | Task 2 `mergeConfig()` |
| § `buildSession` avec fallback lastIds | Task 2 |
| § Interface publique useProgram | Task 2 return |
| § useSession consomme useProgram | Task 3 |
| § `resolvedStretches` remplace `stretches` | Task 3 steps 4–8 |
| § Skip stretch phase si vide | Task 3 step 6 |
| § Étirements non persistés dans session-state | No change needed — stretches were never in PersistedState |
| § SettingsView § 5.1 quotas + warnings | Task 4 |
| § SettingsView § 5.2 exercices toggle + sets/rest | Task 4 |
| § SettingsView § 5.3 étirements toggle + ordre + durée | Task 4 |
| § Réinitialisation avec confirmation | Task 4 |
| § Auto-save | Task 2 (`useLocalStorage` auto-saves on every mutation) |
| § Settings sans effet séance en cours | Guaranteed — useProgram is only called at session start via buildSession |

**Out-of-scope items confirmed absent:** multi-profils, import/export, exercices personnalisés, durée/reps configurables — aucun n'est implémenté.

**Type consistency check:** `ExerciseOverride`, `StretchEntry`, `ProgramConfig` définis dans Task 2 et consommés tels quels dans Tasks 3 et 4. `resolvedStretches` est `ComputedRef<Stretch[]>` — `Stretch` importé de `stretches.ts`, utilisé directement dans `useSession.ts` et `SettingsView.vue`.
