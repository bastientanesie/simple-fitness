# Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the standalone `docs/seance.html` (React 18 / CDN) into the Vue 3 + Tailwind v4 + Vite scaffold, preserving all behaviour exactly.

**Architecture:** `useSession` is the state machine (screen, exercise state, timers, persistence). `useTimer` and `useAudio` are utilities used by `useSession`. `SessionView` coordinates screens via props + emits.

**Tech Stack:** Vue 3 (Composition API, `<script setup>`), VueUse (`useLocalStorage`, `useWakeLock`), Tailwind CSS v4, Web Audio API.

**Reference:** `docs/seance.html` is the source of truth for all behaviour, data, and copy. Read it before implementing any task. Design spec: `docs/superpowers/specs/2026-05-28-core-implementation-design.md`.

---

### Task 1: Data — exercises.ts + stretches.ts

**Files:**
- Modify: `src/data/exercises.ts`
- Modify: `src/data/stretches.ts`

- [ ] **Step 1: Replace `src/data/exercises.ts`**

```ts
export type ExerciseCategory = 'legs' | 'back' | 'core' | 'shoulders'

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
}

export const CAT_LABELS: Record<ExerciseCategory, string> = {
  legs: 'Jambes',
  back: 'Dos',
  core: 'Gainage',
  shoulders: 'Épaules',
}

export const exercises: Exercise[] = [
  // JAMBES / GENOUX
  {
    id: 'squat', category: 'legs', name: 'Squat', emoji: '🦵', tc: '#60a5fa',
    target: 'Jambes · Genoux', sets: 3, reps: '12 reps', rest: 45, gear: null,
    pos: "Debout, pieds écartés largeur épaules, orteils légèrement vers l'extérieur",
    cue: "Descends comme pour t'asseoir sur une chaise. Genoux dans l'axe des orteils. Dos droit, regard devant. Remonte en poussant dans les talons.",
  },
  {
    id: 'lunge', category: 'legs', name: 'Fente avant', emoji: '🚶', tc: '#60a5fa',
    target: 'Jambes · Genoux', sets: 3, reps: '10 reps / côté', rest: 45, gear: null,
    pos: 'Debout, pieds joints',
    cue: "Grand pas en avant, descends le genou arrière vers le sol sans le toucher. Genou avant dans l'axe du pied, pas au-delà des orteils. Repousse pour revenir.",
  },
  {
    id: 'wallsit', category: 'legs', name: 'Chaise', emoji: '🪑', tc: '#60a5fa',
    target: 'Jambes · Genoux', sets: 3, reps: '30 s', duration: 30, rest: 45, gear: null,
    pos: 'Dos contre le mur, pieds à 60 cm du mur, genoux à 90°',
    cue: "Dos bien plaqué contre le mur, cuisses parallèles au sol. Respire normalement. Si 30s devient confortable après quelques séances, vise 45s.",
  },
  {
    id: 'glute', category: 'legs', name: 'Pont fessier', emoji: '🌉', tc: '#60a5fa',
    target: 'Genoux · Fessiers', sets: 3, reps: '10 reps', rest: 45, gear: null,
    pos: 'Sur le dos — genoux fléchis à 90°, pieds à plat au sol',
    cue: "Soulève le bassin jusqu'à une ligne droite épaules → genoux. Tiens 2s en haut. Redescends lentement.",
  },
  {
    id: 'clam', category: 'legs', name: 'Clamshell', emoji: '🦪', tc: '#60a5fa',
    target: 'Genoux · Hanches', sets: 2, reps: '12 reps / côté', rest: 45, gear: 'élastique',
    pos: 'Couché sur le côté — élastique au-dessus des genoux, hanches fléchies ~45°, genoux pliés',
    cue: "Ouvre le genou du dessus vers le plafond comme une moule. Pieds collés. Résiste à l'élastique à la fermeture — ne laisse pas claquer. N'oublie pas les 2 côtés.",
  },
  // DOS
  {
    id: 'catcow', category: 'back', name: 'Cat-Cow', emoji: '🐈', tc: '#4ade80',
    target: 'Dos', sets: 2, reps: '10 reps', rest: 30, gear: null,
    pos: 'À 4 pattes — poignets sous épaules, genoux sous hanches',
    cue: "Inspiration : creuse le dos, ventre vers le sol, tête qui se lève. Expiration : arrondis le dos vers le plafond, tête qui tombe. Lent, guidé par la respiration.",
  },
  {
    id: 'birddog', category: 'back', name: 'Bird-Dog', emoji: '🦅', tc: '#4ade80',
    target: 'Dos · Gainage', sets: 3, reps: '8 reps / côté', rest: 45, gear: null,
    pos: 'À 4 pattes — même position que le cat-cow',
    cue: "Tends le bras droit et la jambe gauche simultanément, horizontaux. Tiens 2-3s, reviens, change de côté. Dos plat, pas de rotation du bassin. Le plus technique — prends le temps de bien te placer.",
  },
  {
    id: 'superman', category: 'back', name: 'Superman', emoji: '🦸', tc: '#4ade80',
    target: 'Dos · Lombaires', sets: 3, reps: '10 reps', rest: 45, gear: null,
    pos: 'Allongé sur le ventre, bras tendus devant toi',
    cue: "Soulève simultanément bras et jambes du sol, tiens 2s, redescends lentement. Regard vers le sol, pas de tension dans la nuque.",
  },
  // GAINAGE
  {
    id: 'plank', category: 'core', name: 'Planche', emoji: '🏋️', tc: '#a78bfa',
    target: 'Gainage', sets: 3, reps: '20 s', duration: 20, rest: 45, gear: null,
    pos: 'Avant-bras au sol, corps en ligne droite des épaules aux talons',
    cue: "Contracte le ventre et les fessiers. Ne laisse pas le bassin monter ou descendre. Respire. Si 20s devient confortable, vise 30s.",
  },
  {
    id: 'deadbug', category: 'core', name: 'Dead Bug', emoji: '🐛', tc: '#a78bfa',
    target: 'Gainage · Dos', sets: 3, reps: '8 reps / côté', rest: 45, gear: null,
    pos: 'Sur le dos, bras tendus vers le plafond, genoux fléchis à 90° en l\'air',
    cue: "Descends simultanément le bras droit et la jambe gauche vers le sol sans les poser. Dos plaqué au sol. Reviens, change de côté. Lent et contrôlé.",
  },
  // ÉPAULES / POSTURE
  {
    id: 'pullap', category: 'shoulders', name: 'Band Pull-Apart', emoji: '💪', tc: '#f472b6',
    target: 'Épaules · Posture', sets: 2, reps: '12 reps', rest: 30, gear: 'élastique',
    pos: 'Debout — élastique à hauteur de poitrine, bras tendus devant toi',
    cue: "Écarte les bras latéralement jusqu'à ce que l'élastique touche ta poitrine. Contrôle le retour — pas de relâchement brutal. Omoplates qui se rapprochent dans le dos.",
  },
  {
    id: 'wallang', category: 'shoulders', name: 'Wall Angel', emoji: '😇', tc: '#f472b6',
    target: 'Épaules · Mobilité', sets: 2, reps: '10 reps', rest: 30, gear: null,
    pos: 'Dos contre le mur, bras fléchis à 90° (position « mains en l\'air »), coudes et poignets contre le mur',
    cue: "Fais glisser les bras vers le haut pour former un W puis un Y, en gardant contact avec le mur. Lent. Si les poignets décollent, ne force pas — c'est normal au début.",
  },
]
```

- [ ] **Step 2: Replace `src/data/stretches.ts`**

```ts
export interface Stretch {
  id: string
  name: string
  emoji: string
  tc: string
  duration: number | null
  sides: boolean
  reps?: number
  pos: string
  cue: string
}

export const stretches: Stretch[] = [
  {
    id: 'child-pose', name: 'Posture enfant', emoji: '🧘', tc: '#4ade80',
    duration: 40, sides: false,
    pos: 'À genoux, assis sur les talons, bras étirés devant toi sur le sol, front posé',
    cue: "Laisse le dos s'allonger naturellement. Respiration profonde et lente. Relâche les épaules complètement à chaque expiration.",
  },
  {
    id: 'hamstring', name: 'Ischio-jambiers couché', emoji: '🦵', tc: '#60a5fa',
    duration: 30, sides: true,
    pos: 'Sur le dos — une jambe tendue vers le plafond, mains derrière la cuisse',
    cue: "Tire doucement la jambe vers toi sans plier le genou. Tu dois sentir l'arrière de la cuisse. L'autre jambe reste à plat au sol. Pas de douleur, juste une tension douce.",
  },
  {
    id: 'piriformis', name: 'Piriforme', emoji: '🔄', tc: '#a78bfa',
    duration: 30, sides: true,
    pos: "Sur le dos — cheville d'une jambe posée sur le genou opposé",
    cue: "Tire la jambe du dessous vers ta poitrine. Tu dois sentir l'étirement profond dans la fesse. Respire et relâche à chaque expiration.",
  },
  {
    id: 'chest-opener', name: 'Ouverture pectorale', emoji: '🤸', tc: '#f472b6',
    duration: 30, sides: true,
    pos: 'Au sol sur le côté — bras supérieur tendu vers le plafond, puis laisse-le tomber derrière toi',
    cue: "Laisse l'épaule et la poitrine s'ouvrir vers l'arrière sous le poids du bras. Hanches stables. Respiration lente.",
  },
  {
    id: 'cat-cow', name: 'Cat-cow lent', emoji: '🐈', tc: '#fbbf24',
    duration: null, sides: false, reps: 8,
    pos: 'À 4 pattes — poignets sous épaules, genoux sous hanches',
    cue: "8 répétitions très lentes, guidées par la respiration. C'est la clôture de la séance — prends ton temps, ressens chaque vertèbre.",
  },
]
```

- [ ] **Step 3: Commit**

```bash
git add src/data/exercises.ts src/data/stretches.ts
git commit -m "feat: populate exercise and stretch data with full type definitions"
```

---

### Task 2: useTimer composable

**Files:**
- Modify: `src/composables/useTimer.ts`

- [ ] **Step 1: Implement `src/composables/useTimer.ts`**

```ts
import { ref, onUnmounted } from 'vue'

export function useTimer() {
  const value = ref(0)
  const max = ref(0)
  const running = ref(false)

  let timeout: ReturnType<typeof setTimeout> | null = null
  let onCompleteCallback: (() => void) | undefined

  function tick() {
    if (!running.value) return
    value.value--
    if (value.value <= 0) {
      running.value = false
      timeout = null
      onCompleteCallback?.()
    } else {
      timeout = setTimeout(tick, 1000)
    }
  }

  function start(duration: number, onComplete?: () => void) {
    stop()
    value.value = duration
    max.value = duration
    onCompleteCallback = onComplete
    running.value = true
    timeout = setTimeout(tick, 1000)
  }

  function stop() {
    running.value = false
    if (timeout !== null) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  function reset() {
    stop()
    value.value = 0
    max.value = 0
  }

  onUnmounted(() => stop())

  return { value, max, running, start, stop, reset }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/composables/useTimer.ts
git commit -m "feat: implement useTimer generic countdown composable"
```

---

### Task 3: useAudio composable

**Files:**
- Modify: `src/composables/useAudio.ts`

- [ ] **Step 1: Implement `src/composables/useAudio.ts`**

Exact port of the `sfx` object from `docs/seance.html` (lines 87–94).

```ts
let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContext
  } catch {
    return null
  }
}

function tone(freq: number, dur: number, vol = 0.3, delay = 0) {
  const ctx = getAudioContext()
  if (!ctx) return
  try {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g)
    g.connect(ctx.destination)
    o.type = 'sine'
    o.frequency.value = freq
    g.gain.setValueAtTime(vol, ctx.currentTime + delay)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur)
    o.start(ctx.currentTime + delay)
    o.stop(ctx.currentTime + delay + dur)
  } catch {}
}

export function useAudio() {
  function tick()   { tone(660, 0.07, 0.3) }
  function go()     { tone(880, 0.1, 0.4, 0); tone(880, 0.1, 0.35, 0.12); tone(1100, 0.2, 0.45, 0.25) }
  function next()   { tone(880, 0.12, 0.4, 0); tone(1100, 0.2, 0.4, 0.15) }
  function exdone() { tone(550, 0.1, 0.3, 0); tone(660, 0.1, 0.3, 0.12); tone(880, 0.25, 0.4, 0.26) }
  function side()   { tone(770, 0.1, 0.3, 0); tone(990, 0.15, 0.35, 0.12) }
  function done()   { [0, 0.2, 0.42, 0.66].forEach((dt, i) => tone([660, 880, 1100, 1320][i], 0.25, 0.4, dt)) }

  return { tick, go, next, exdone, side, done }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/composables/useAudio.ts
git commit -m "feat: implement useAudio Web Audio API sound engine"
```

---

### Task 4: Ring.vue + Dots.vue shared components

**Files:**
- Create: `src/components/Ring.vue`
- Create: `src/components/Dots.vue`

- [ ] **Step 1: Create `src/components/Ring.vue`**

Port of the `Ring` component from `docs/seance.html` (line ~255).

```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  value: number
  max: number
  color: string
  size?: number
}>(), { size: 160 })

const sw = 10
const r = computed(() => (props.size - sw) / 2)
const circumference = computed(() => 2 * Math.PI * r.value)
const pct = computed(() => props.max > 0 ? Math.max(0, props.value) / props.max : 0)
</script>

<template>
  <svg :width="size" :height="size" style="transform: rotate(-90deg)">
    <circle
      :cx="size / 2" :cy="size / 2" :r="r"
      fill="none" stroke="var(--ring-track)" :stroke-width="sw"
    />
    <circle
      :cx="size / 2" :cy="size / 2" :r="r"
      fill="none" :stroke="color" :stroke-width="sw"
      :stroke-dasharray="circumference"
      :stroke-dashoffset="circumference * (1 - pct)"
      stroke-linecap="round"
      style="transition: stroke-dashoffset 1s linear"
    />
  </svg>
</template>
```

- [ ] **Step 2: Create `src/components/Dots.vue`**

Port of the `Dots` component from `docs/seance.html` (line ~269).

```vue
<script setup lang="ts">
withDefaults(defineProps<{
  current: number
  total: number
  doneColor?: string
  activeColor?: string
}>(), {
  doneColor: '#22c55e',
  activeColor: '#f0a500',
})
</script>

<template>
  <div style="display: flex; gap: 5px; justify-content: center;">
    <div
      v-for="(_, i) in Array.from({ length: total })"
      :key="i"
      :style="{
        width: i === current ? '20px' : '7px',
        height: '7px',
        borderRadius: '4px',
        transition: 'all 0.3s',
        background: i < current ? doneColor : i === current ? activeColor : 'var(--border)',
      }"
    />
  </div>
</template>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Ring.vue src/components/Dots.vue
git commit -m "feat: add Ring and Dots shared UI components"
```

---

### Task 5: useSession composable

**Files:**
- Modify: `src/composables/useSession.ts`

This is the state machine. Read `docs/seance.html` (the App component, lines ~281–728) and the design spec before implementing.

- [ ] **Step 1: Implement `src/composables/useSession.ts`**

```ts
import { ref, computed, watch } from 'vue'
import { useLocalStorage, useWakeLock } from '@vueuse/core'
import { exercises, type Exercise } from '../data/exercises'
import { stretches } from '../data/stretches'
import { useTimer } from './useTimer'
import { useAudio } from './useAudio'

export type ScreenName =
  | 'home' | 'intro' | 'countdown' | 'active'
  | 'rest' | 'exdone' | 'stretchIntro' | 'stretch' | 'done'

interface PersistedState {
  sessionIds: string[]
  exerciseIndex: number
  setNumber: number
  stretchIndex: number
  stretchSide: 0 | 1
  screen: ScreenName
}

const TIMER_SCREENS = new Set<ScreenName>(['countdown', 'active', 'rest', 'stretch'])

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function buildSession(lastIds: string[]): Exercise[] {
  const pickFrom = (pool: Exercise[], n: number) => {
    const fresh = pool.filter(e => !lastIds.includes(e.id))
    return shuffle(fresh.length >= n ? fresh : pool).slice(0, n)
  }
  const legs      = pickFrom(exercises.filter(e => e.category === 'legs'),      2)
  const back      = pickFrom(exercises.filter(e => e.category === 'back'),      1)
  const core      = pickFrom(exercises.filter(e => e.category === 'core'),      1)
  const shoulders = pickFrom(exercises.filter(e => e.category === 'shoulders'), 1)
  return shuffle([...legs, ...back, ...core, ...shoulders])
}

function snapScreen(s: ScreenName): ScreenName {
  if (s === 'countdown' || s === 'active' || s === 'rest') return 'intro'
  if (s === 'stretch') return 'stretchIntro'
  return s
}

export function useSession() {
  const audio = useAudio()
  const exTimer     = useTimer()
  const restTimer   = useTimer()
  const stretchTimer = useTimer()
  const { request: acquireWakeLock, release: releaseWakeLock } = useWakeLock()

  const lastSessionIds = useLocalStorage<string[]>('last-session-ids', [])
  const savedState     = useLocalStorage<PersistedState | null>('session-state', null)

  function restoreSession(): Exercise[] {
    if (!savedState.value) return buildSession(lastSessionIds.value)
    const restored = savedState.value.sessionIds
      .map(id => exercises.find(e => e.id === id))
      .filter((e): e is Exercise => e !== undefined)
    return restored.length === savedState.value.sessionIds.length
      ? restored
      : buildSession(lastSessionIds.value)
  }

  const session       = ref<Exercise[]>(restoreSession())
  const screen        = ref<ScreenName>(savedState.value ? snapScreen(savedState.value.screen) : 'home')
  const exerciseIndex = ref(savedState.value?.exerciseIndex ?? 0)
  const setNumber     = ref(savedState.value?.setNumber ?? 1)
  const stretchIndex  = ref(savedState.value?.stretchIndex ?? 0)
  const stretchSide   = ref<0 | 1>(savedState.value?.stretchSide ?? 0)
  const countdownValue = ref(1)
  const elapsed       = ref('')
  let startTime: number | null = null

  const currentExercise = computed(() =>
    session.value[Math.min(exerciseIndex.value, session.value.length - 1)] ?? session.value[0]
  )
  const currentStretch = computed(() =>
    stretches[Math.min(stretchIndex.value, stretches.length - 1)]
  )

  function persist() {
    if (screen.value === 'home' || screen.value === 'done') {
      savedState.value = null
      return
    }
    savedState.value = {
      sessionIds: session.value.map(e => e.id),
      exerciseIndex: exerciseIndex.value,
      setNumber: setNumber.value,
      stretchIndex: stretchIndex.value,
      stretchSide: stretchSide.value,
      screen: screen.value,
    }
  }

  function finishSession() {
    releaseWakeLock()
    if (startTime !== null) {
      const secs = Math.round((Date.now() - startTime) / 1000)
      const m = Math.floor(secs / 60)
      const s = secs % 60
      elapsed.value = s > 0 ? `${m} min ${String(s).padStart(2, '0')} s` : `${m} min`
    }
    savedState.value = null
    screen.value = 'done'
  }

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

  // ── Countdown watch ──────────────────────────────────────────────────────
  let cdTimeout: ReturnType<typeof setTimeout> | null = null

  watch([screen, countdownValue], ([s, cdv]) => {
    if (s !== 'countdown') {
      if (cdTimeout) { clearTimeout(cdTimeout); cdTimeout = null }
      return
    }
    if (cdv <= 3) {
      audio.tick()
      cdTimeout = setTimeout(() => { countdownValue.value++ }, 800)
    } else {
      audio.go()
      cdTimeout = setTimeout(() => { screen.value = 'active' }, 650)
    }
  })

  // ── Screen watch ─────────────────────────────────────────────────────────
  watch(screen, (s) => {
    persist()

    if (s === 'countdown') {
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
          } else {
            audio.exdone()
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
            stretchSide.value = 1
            stretchTimer.start(st.duration!, () => {
              audio.exdone()
              advanceStretch()
            })
          } else {
            audio.exdone()
            advanceStretch()
          }
        })
      }
    }
  })

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleCommencer() {
    lastSessionIds.value = session.value.map(e => e.id)
    acquireWakeLock('screen')
    startTime = Date.now()
    exerciseIndex.value = 0
    setNumber.value = 1
    screen.value = 'intro'
  }

  function handleStart() {
    countdownValue.value = 1
    screen.value = 'countdown'
  }

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
    } else {
      audio.exdone()
      screen.value = 'exdone'
    }
  }

  function handleSkipRest() {
    restTimer.stop()
    audio.next()
    setNumber.value++
    countdownValue.value = 1
    screen.value = 'countdown'
  }

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

  function handleRegen() {
    session.value = buildSession(lastSessionIds.value)
  }

  function handleRestart() {
    exTimer.stop()
    restTimer.stop()
    stretchTimer.stop()
    if (cdTimeout) { clearTimeout(cdTimeout); cdTimeout = null }
    session.value = buildSession(lastSessionIds.value)
    exerciseIndex.value = 0
    setNumber.value = 1
    countdownValue.value = 1
    stretchIndex.value = 0
    stretchSide.value = 0
    elapsed.value = ''
    savedState.value = null
    screen.value = 'home'
  }

  function startStretch() {
    stretchSide.value = 0
    screen.value = 'stretch'
  }

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

  function handleNextSide() {
    stretchTimer.stop()
    audio.side()
    stretchSide.value = 1
    stretchTimer.start(currentStretch.value.duration!, () => {
      audio.exdone()
      advanceStretch()
    })
  }

  return {
    screen,
    session,
    exerciseIndex,
    setNumber,
    countdownValue,
    stretchIndex,
    stretchSide,
    elapsed,
    currentExercise,
    currentStretch,
    exTimer,
    restTimer,
    stretchTimer,
    handleCommencer,
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
}
```

- [ ] **Step 2: Commit**

```bash
git add src/composables/useSession.ts
git commit -m "feat: implement useSession state machine with localStorage persistence"
```

---

### Task 6: HomeScreen.vue

**Files:**
- Modify: `src/components/screens/HomeScreen.vue`

Port the `// ── HOME ──` section of `docs/seance.html` (line ~432).

- [ ] **Step 1: Implement `src/components/screens/HomeScreen.vue`**

```vue
<script setup lang="ts">
import { type Exercise, CAT_LABELS } from '../../data/exercises'

defineProps<{
  session: Exercise[]
  poolSize: number
}>()

defineEmits<{
  commencer: []
  regen: []
}>()
</script>

<template>
  <div class="fin" style="min-height: 100vh; background: var(--bg); color: var(--fg); font-family: 'IBM Plex Mono', monospace; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column;">
    <div style="padding: 28px 20px 80px;">

      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
        <div>
          <div style="font-size: 10px; color: #f0a500; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 8px;">
            Mercredi · Vendredi · 12h15
          </div>
          <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 30px; line-height: 1.1;">
            Séance<br/><span style="color: #f0a500;">renforcement</span>
          </div>
        </div>
      </div>

      <!-- Warmup card -->
      <div style="background: var(--warmup-bg); border: 1px solid var(--warmup-border); border-radius: 12px; padding: 14px 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 24px;">🚴</span>
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px;">Échauffement d'abord</div>
          <div style="font-size: 11px; color: var(--muted);">Vélo d'appart · résistance minimale · 5 min</div>
        </div>
        <span style="font-size: 13px; color: #f0a500; font-weight: 600;">↓</span>
      </div>

      <!-- Session header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div style="font-size: 10px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase;">
          Séance du jour · {{ session.length }} exercices
        </div>
        <button
          @click="$emit('regen')"
          style="background: transparent; border: 1px solid var(--ghost-border); color: var(--muted); border-radius: 8px; padding: 5px 10px; cursor: pointer; font-size: 11px; font-family: 'IBM Plex Mono', monospace; flex-shrink: 0;"
        >↻ changer</button>
      </div>

      <!-- Exercise list -->
      <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
        <div
          v-for="ex in session"
          :key="ex.id"
          style="background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; gap: 12px;"
        >
          <div style="width: 36px; height: 36px; border-radius: 10px; background: var(--ex-bg); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
            {{ ex.emoji }}
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 13px; font-weight: 600; margin-bottom: 3px;">{{ ex.name }}</div>
            <div style="font-size: 11px; color: var(--muted);">{{ ex.sets }} × {{ ex.reps }}</div>
          </div>
          <span v-if="ex.gear" style="font-size: 10px; padding: 2px 7px; border-radius: 999px; background: var(--warmup-bg); color: #f0a500; border: 1px solid var(--warmup-border);">🔗</span>
          <span :style="{ display: 'inline-block', fontSize: '10px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: ex.tc + '20', color: ex.tc, border: `1px solid ${ex.tc}40`, letterSpacing: '0.05em', textTransform: 'uppercase' }">
            {{ CAT_LABELS[ex.category] }}
          </span>
        </div>
      </div>

      <!-- Stretches preview -->
      <div style="background: var(--stretch-bg); border: 1px solid var(--stretch-border); border-radius: 12px; padding: 14px 16px; margin-bottom: 28px; display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 20px;">🧘</span>
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 12px; margin-bottom: 1px;">Étirements · fin de séance</div>
          <div style="font-size: 11px; color: var(--muted);">5 étirements · ~7 min</div>
        </div>
        <span style="font-size: 11px; color: #34d399;">auto</span>
      </div>

      <div style="font-size: 10px; color: var(--muted); text-align: center; margin-bottom: 16px;">
        Tiré d'un pool de {{ poolSize }} exercices · change à chaque séance
      </div>

      <button
        @click="$emit('commencer')"
        style="width: 100%; padding: 16px; background: #22c55e; color: #000; border: none; border-radius: 14px; font-size: 15px; font-weight: 700; font-family: 'Syne', sans-serif; cursor: pointer; letter-spacing: 0.02em;"
      >Commencer →</button>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/screens/HomeScreen.vue
git commit -m "feat: implement HomeScreen component"
```

---

### Task 7: IntroScreen.vue + CountdownScreen.vue

**Files:**
- Modify: `src/components/screens/IntroScreen.vue`
- Modify: `src/components/screens/CountdownScreen.vue`

Port the `// ── INTRO ──` (line ~493) and `// ── COUNTDOWN ──` (line ~529) sections of `docs/seance.html`.

- [ ] **Step 1: Implement `src/components/screens/IntroScreen.vue`**

```vue
<script setup lang="ts">
import Dots from '../Dots.vue'
import { type Exercise } from '../../data/exercises'

defineProps<{
  exercise: Exercise
  exerciseIndex: number
  sessionLength: number
}>()

defineEmits<{ start: [] }>()
</script>

<template>
  <div style="min-height: 100vh; background: var(--bg); color: var(--fg); font-family: 'IBM Plex Mono', monospace; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column;">
    <div style="padding: 24px 20px 0;">
      <Dots :current="exerciseIndex" :total="sessionLength" />
    </div>
    <div class="fin" style="flex: 1; padding: 16px 20px 32px; display: flex; flex-direction: column; gap: 18px;">
      <div>
        <div style="font-size: 10px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 4px;">
          Exercice {{ exerciseIndex + 1 }}/{{ sessionLength }}
        </div>
        <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; line-height: 1.15; margin-bottom: 12px;">
          {{ exercise.emoji }} {{ exercise.name }}
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <span :style="{ display: 'inline-block', fontSize: '10px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: exercise.tc + '20', color: exercise.tc, border: `1px solid ${exercise.tc}40`, letterSpacing: '0.05em', textTransform: 'uppercase' }">
            {{ exercise.target }}
          </span>
          <span v-if="exercise.gear" style="display: inline-block; font-size: 10px; font-weight: 600; padding: 3px 10px; border-radius: 999px; background: var(--warmup-bg); color: #f0a500; border: 1px solid var(--warmup-border); letter-spacing: 0.05em; text-transform: uppercase;">
            🔗 {{ exercise.gear }}
          </span>
        </div>
      </div>

      <!-- Stats grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
        <div
          v-for="stat in [{ l: 'séries', v: exercise.sets }, { l: 'reps', v: exercise.reps ?? `${exercise.duration}s` }, { l: 'repos', v: `${exercise.rest}s` }]"
          :key="stat.l"
          style="background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 12px 8px; text-align: center;"
        >
          <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 14px; margin-bottom: 2px;">{{ stat.v }}</div>
          <div style="font-size: 10px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase;">{{ stat.l }}</div>
        </div>
      </div>

      <div>
        <div style="font-size: 10px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px;">Position</div>
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; font-size: 13px; color: var(--fg2); line-height: 1.7;">
          {{ exercise.pos }}
        </div>
      </div>

      <div>
        <div style="font-size: 10px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px;">Exécution</div>
        <div :style="{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.8', borderLeft: `2px solid ${exercise.tc}`, paddingLeft: '14px' }">
          {{ exercise.cue }}
        </div>
      </div>

      <div style="margin-top: auto;">
        <button
          @click="$emit('start')"
          style="width: 100%; padding: 16px; background: #22c55e; color: #000; border: none; border-radius: 14px; font-size: 15px; font-weight: 700; font-family: 'Syne', sans-serif; cursor: pointer; letter-spacing: 0.02em;"
        >C'est parti →</button>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Implement `src/components/screens/CountdownScreen.vue`**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { type Exercise } from '../../data/exercises'

const props = defineProps<{
  countdownValue: number
  exercise: Exercise
  setNumber: number
}>()

const isGo = computed(() => props.countdownValue > 3)
</script>

<template>
  <div style="min-height: 100vh; background: var(--bg); color: var(--fg); font-family: 'IBM Plex Mono', monospace; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; gap: 12px;">
    <div style="font-size: 10px; color: var(--subtle); letter-spacing: 0.15em; text-transform: uppercase;">
      {{ exercise.name }} · Série {{ setNumber }}/{{ exercise.sets }}
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
      {{ isGo ? 'GO !' : countdownValue }}
    </div>
    <div style="font-size: 11px; color: var(--subtle);">{{ isGo ? '' : 'prépare-toi' }}</div>
  </div>
</template>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/screens/IntroScreen.vue src/components/screens/CountdownScreen.vue
git commit -m "feat: implement IntroScreen and CountdownScreen components"
```

---

### Task 8: ActiveScreen.vue + RestScreen.vue

**Files:**
- Modify: `src/components/screens/ActiveScreen.vue`
- Modify: `src/components/screens/RestScreen.vue`

Port `// ── ACTIVE ──` (line ~543) and `// ── REST ──` (line ~589) from `docs/seance.html`.

- [ ] **Step 1: Implement `src/components/screens/ActiveScreen.vue`**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import Dots from '../Dots.vue'
import Ring from '../Ring.vue'
import { type Exercise } from '../../data/exercises'

const props = defineProps<{
  exercise: Exercise
  exerciseIndex: number
  sessionLength: number
  setNumber: number
  exTimerValue: number
  exTimerMax: number
}>()

defineEmits<{ ok: [] }>()

const isTimed = computed(() => props.exercise.duration !== undefined)
</script>

<template>
  <div style="min-height: 100vh; background: var(--bg); color: var(--fg); font-family: 'IBM Plex Mono', monospace; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column;">
    <div style="padding: 24px 20px 0;">
      <Dots :current="exerciseIndex" :total="sessionLength" />
    </div>

    <!-- Timed exercise -->
    <template v-if="isTimed">
      <div style="flex: 1; padding: 16px 20px 32px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="font-size: 10px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 4px;">{{ exercise.name }}</div>
          <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px;">
            Série {{ setNumber }}<span style="color: var(--subtle);">/{{ exercise.sets }}</span>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <Ring :value="exTimerValue" :max="exTimerMax" :color="exercise.tc" />
            <div style="position: absolute; text-align: center;">
              <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 50px; line-height: 1;">{{ exTimerValue }}</div>
              <div style="font-size: 10px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-top: 4px;">secondes</div>
            </div>
          </div>
          <div style="font-size: 12px; color: var(--muted); max-width: 260px; text-align: center; line-height: 1.7;">
            {{ exercise.cue.split('.')[0] }}.
          </div>
        </div>
        <button
          @click="$emit('ok')"
          style="width: 100%; padding: 16px; background: #22c55e; color: #000; border: none; border-radius: 14px; font-size: 15px; font-weight: 700; font-family: 'Syne', sans-serif; cursor: pointer; letter-spacing: 0.02em;"
        >✓ Arrêter la série</button>
      </div>
    </template>

    <!-- Reps exercise -->
    <template v-else>
      <div style="flex: 1; padding: 16px 20px 32px; display: flex; flex-direction: column;">
        <div style="font-size: 10px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 4px;">{{ exercise.name }}</div>
        <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px;">
          Série {{ setNumber }}<span style="color: var(--subtle);">/{{ exercise.sets }}</span>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 12px; text-align: center;">
          <div style="font-size: 80px;">{{ exercise.emoji }}</div>
          <div :style="{ fontFamily: '\'Syne\', sans-serif', fontWeight: 800, fontSize: '30px', color: exercise.tc }">{{ exercise.reps }}</div>
          <div style="font-size: 12px; color: var(--muted); max-width: 280px; line-height: 1.7;">{{ exercise.cue.split('.')[0] }}.</div>
        </div>
        <button
          @click="$emit('ok')"
          style="width: 100%; padding: 16px; background: #22c55e; color: #000; border: none; border-radius: 14px; font-size: 15px; font-weight: 700; font-family: 'Syne', sans-serif; cursor: pointer; letter-spacing: 0.02em;"
        >✓ Série terminée</button>
      </div>
    </template>
  </div>
</template>
```

- [ ] **Step 2: Implement `src/components/screens/RestScreen.vue`**

```vue
<script setup lang="ts">
import Dots from '../Dots.vue'
import Ring from '../Ring.vue'
import { type Exercise } from '../../data/exercises'

defineProps<{
  exercise: Exercise
  exerciseIndex: number
  sessionLength: number
  setNumber: number
  restTimerValue: number
  restTimerMax: number
}>()

defineEmits<{ skip: [] }>()
</script>

<template>
  <div style="min-height: 100vh; background: var(--bg); color: var(--fg); font-family: 'IBM Plex Mono', monospace; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column;">
    <div style="padding: 24px 20px 0;">
      <Dots :current="exerciseIndex" :total="sessionLength" />
    </div>
    <div style="flex: 1; padding: 16px 20px 32px; display: flex; flex-direction: column; align-items: center; justify-content: space-between;">
      <div style="text-align: center;">
        <div style="font-size: 10px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px;">Repos · {{ exercise.name }}</div>
        <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: var(--muted);">
          Prochaine série {{ setNumber + 1 }}/{{ exercise.sets }}
        </div>
      </div>
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <Ring :value="restTimerValue" :max="restTimerMax" :color="exercise.tc" />
        <div style="position: absolute; text-align: center;">
          <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 50px; line-height: 1;">{{ restTimerValue }}</div>
          <div style="font-size: 10px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-top: 4px;">secondes</div>
        </div>
      </div>
      <button
        @click="$emit('skip')"
        style="width: 100%; padding: 12px; background: transparent; color: var(--muted); border: 1px solid var(--ghost-border); border-radius: 14px; font-size: 12px; font-family: 'IBM Plex Mono', monospace; cursor: pointer;"
      >Passer le repos →</button>
    </div>
  </div>
</template>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/screens/ActiveScreen.vue src/components/screens/RestScreen.vue
git commit -m "feat: implement ActiveScreen and RestScreen components"
```

---

### Task 9: ExDoneScreen.vue + StretchIntroScreen.vue + StretchScreen.vue

**Files:**
- Modify: `src/components/screens/ExDoneScreen.vue`
- Modify: `src/components/screens/StretchIntroScreen.vue`
- Modify: `src/components/screens/StretchScreen.vue`

Port `// ── EXERCISE DONE ──` (~610), `// ── STRETCH INTRO ──` (~629), `// ── STRETCH ──` (~662) from `docs/seance.html`.

- [ ] **Step 1: Implement `src/components/screens/ExDoneScreen.vue`**

```vue
<script setup lang="ts">
import Dots from '../Dots.vue'
import { type Exercise } from '../../data/exercises'

defineProps<{
  exercise: Exercise
  exerciseIndex: number
  sessionLength: number
  nextExercise: Exercise | null
}>()

defineEmits<{ next: [] }>()
</script>

<template>
  <div class="fin" style="min-height: 100vh; background: var(--bg); color: var(--fg); font-family: 'IBM Plex Mono', monospace; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 40px 24px; gap: 20px;">
    <Dots :current="exerciseIndex" :total="sessionLength" />
    <div style="font-size: 64px;">{{ exercise.emoji }}</div>
    <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; color: #22c55e;">Exercice terminé !</div>
    <div style="font-size: 12px; color: var(--muted);">{{ exercise.sets }} séries · {{ exercise.reps }}</div>
    <div style="width: 100%; margin-top: 8px;">
      <button
        v-if="nextExercise"
        @click="$emit('next')"
        style="width: 100%; padding: 16px; background: #22c55e; color: #000; border: none; border-radius: 14px; font-size: 15px; font-weight: 700; font-family: 'Syne', sans-serif; cursor: pointer; letter-spacing: 0.02em;"
      >{{ nextExercise.emoji }} {{ nextExercise.name }} →</button>
      <button
        v-else
        @click="$emit('next')"
        style="width: 100%; padding: 16px; background: #34d399; color: #000; border: none; border-radius: 14px; font-size: 15px; font-weight: 700; font-family: 'Syne', sans-serif; cursor: pointer; letter-spacing: 0.02em;"
      >🧘 Étirements →</button>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Implement `src/components/screens/StretchIntroScreen.vue`**

```vue
<script setup lang="ts">
import Dots from '../Dots.vue'
import { type Stretch } from '../../data/stretches'

defineProps<{
  stretch: Stretch
  stretchIndex: number
  stretchCount: number
}>()

defineEmits<{ start: [], skip: [] }>()
</script>

<template>
  <div style="min-height: 100vh; background: var(--bg); color: var(--fg); font-family: 'IBM Plex Mono', monospace; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column;">
    <div style="padding: 24px 20px 0;">
      <Dots :current="stretchIndex" :total="stretchCount" done-color="#34d399" active-color="#fbbf24" />
    </div>
    <div class="sideIn" style="flex: 1; padding: 16px 20px 32px; display: flex; flex-direction: column; gap: 18px;">
      <div>
        <div style="font-size: 10px; color: #34d399; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 4px;">
          Étirements · {{ stretchIndex + 1 }}/{{ stretchCount }}
        </div>
        <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; line-height: 1.15; margin-bottom: 12px;">
          {{ stretch.emoji }} {{ stretch.name }}
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <span :style="{ display: 'inline-block', fontSize: '10px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: stretch.tc + '20', color: stretch.tc, border: `1px solid ${stretch.tc}40`, letterSpacing: '0.05em', textTransform: 'uppercase' }">
            {{ stretch.duration !== null ? (stretch.sides ? `${stretch.duration}s × 2 côtés` : `${stretch.duration}s`) : `${stretch.reps} répétitions` }}
          </span>
        </div>
      </div>

      <div>
        <div style="font-size: 10px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px;">Position</div>
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; font-size: 13px; color: var(--fg2); line-height: 1.7;">
          {{ stretch.pos }}
        </div>
      </div>

      <div>
        <div style="font-size: 10px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px;">Conseil</div>
        <div :style="{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.8', borderLeft: `2px solid ${stretch.tc}`, paddingLeft: '14px' }">
          {{ stretch.cue }}
        </div>
      </div>

      <div style="margin-top: auto; display: flex; flex-direction: column; gap: 10px;">
        <button
          @click="$emit('start')"
          style="width: 100%; padding: 16px; background: #34d399; color: #000; border: none; border-radius: 14px; font-size: 15px; font-weight: 700; font-family: 'Syne', sans-serif; cursor: pointer; letter-spacing: 0.02em;"
        >{{ stretch.duration !== null ? 'Lancer le timer →' : "C'est parti →" }}</button>
        <button
          @click="$emit('skip')"
          style="width: 100%; padding: 12px; background: transparent; color: var(--muted); border: 1px solid var(--ghost-border); border-radius: 14px; font-size: 12px; font-family: 'IBM Plex Mono', monospace; cursor: pointer;"
        >Passer cet étirement</button>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 3: Implement `src/components/screens/StretchScreen.vue`**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import Dots from '../Dots.vue'
import Ring from '../Ring.vue'
import { type Stretch } from '../../data/stretches'

const props = defineProps<{
  stretch: Stretch
  stretchIndex: number
  stretchCount: number
  stretchSide: 0 | 1
  timerValue: number
  timerMax: number
}>()

defineEmits<{ 'next-side': [], skip: [], done: [] }>()

const sideLabel = computed(() => {
  if (!props.stretch.sides) return null
  return props.stretchSide === 0 ? 'Côté gauche' : 'Côté droit'
})
</script>

<template>
  <div style="min-height: 100vh; background: var(--bg); color: var(--fg); font-family: 'IBM Plex Mono', monospace; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column;">
    <div style="padding: 24px 20px 0;">
      <Dots :current="stretchIndex" :total="stretchCount" done-color="#34d399" active-color="#fbbf24" />
    </div>

    <!-- Rep-based stretch (Cat-Cow) -->
    <template v-if="stretch.duration === null">
      <div class="sideIn" style="flex: 1; padding: 16px 20px 32px; display: flex; flex-direction: column;">
        <div style="font-size: 10px; color: #34d399; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 4px;">
          Étirements · {{ stretchIndex + 1 }}/{{ stretchCount }}
        </div>
        <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; margin-bottom: 16px;">
          {{ stretch.emoji }} {{ stretch.name }}
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 12px; text-align: center;">
          <div style="font-size: 80px;">{{ stretch.emoji }}</div>
          <div :style="{ fontFamily: '\'Syne\', sans-serif', fontWeight: 800, fontSize: '28px', color: stretch.tc }">{{ stretch.reps }} répétitions</div>
          <div style="font-size: 12px; color: var(--muted); max-width: 280px; line-height: 1.7;">{{ stretch.cue.split('.')[0] }}.</div>
        </div>
        <button
          @click="$emit('done')"
          style="width: 100%; padding: 16px; background: #34d399; color: #000; border: none; border-radius: 14px; font-size: 15px; font-weight: 700; font-family: 'Syne', sans-serif; cursor: pointer; letter-spacing: 0.02em;"
        >✓ Terminé</button>
      </div>
    </template>

    <!-- Timed stretch -->
    <template v-else>
      <div class="sideIn" style="flex: 1; padding: 16px 20px 32px; display: flex; flex-direction: column; align-items: center; justify-content: space-between;">
        <div style="text-align: center;">
          <div style="font-size: 10px; color: #34d399; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 4px;">
            Étirements · {{ stretchIndex + 1 }}/{{ stretchCount }}
          </div>
          <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px;">
            {{ stretch.emoji }} {{ stretch.name }}
          </div>
          <div
            v-if="sideLabel"
            :key="stretchSide"
            class="pop"
            :style="{ fontFamily: '\'Syne\', sans-serif', fontWeight: 800, fontSize: '16px', color: stretch.tc, marginTop: '6px' }"
          >{{ sideLabel }}</div>
        </div>
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <Ring :value="timerValue" :max="timerMax" :color="stretch.tc" />
          <div style="position: absolute; text-align: center;">
            <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 50px; line-height: 1;">{{ timerValue }}</div>
            <div style="font-size: 10px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-top: 4px;">secondes</div>
          </div>
        </div>
        <div style="width: 100%; display: flex; flex-direction: column; gap: 10px;">
          <button
            v-if="stretch.sides && stretchSide === 0"
            @click="$emit('next-side')"
            style="width: 100%; padding: 16px; background: #34d399; color: #000; border: none; border-radius: 14px; font-size: 15px; font-weight: 700; font-family: 'Syne', sans-serif; cursor: pointer; letter-spacing: 0.02em;"
          >Côté droit →</button>
          <button
            @click="$emit('skip')"
            style="width: 100%; padding: 12px; background: transparent; color: var(--muted); border: 1px solid var(--ghost-border); border-radius: 14px; font-size: 12px; font-family: 'IBM Plex Mono', monospace; cursor: pointer;"
          >Passer →</button>
        </div>
      </div>
    </template>
  </div>
</template>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/screens/ExDoneScreen.vue src/components/screens/StretchIntroScreen.vue src/components/screens/StretchScreen.vue
git commit -m "feat: implement ExDoneScreen, StretchIntroScreen, StretchScreen components"
```

---

### Task 10: DoneScreen.vue

**Files:**
- Modify: `src/components/screens/DoneScreen.vue`

Port `// ── DONE ──` (line ~710) from `docs/seance.html`.

- [ ] **Step 1: Implement `src/components/screens/DoneScreen.vue`**

```vue
<script setup lang="ts">
defineProps<{
  sessionLength: number
  stretchCount: number
  elapsed: string
}>()

defineEmits<{ restart: [] }>()
</script>

<template>
  <div class="fin" style="min-height: 100vh; background: var(--bg); color: var(--fg); font-family: 'IBM Plex Mono', monospace; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 40px 24px; gap: 20px;">
    <div style="font-size: 80px;">🎉</div>
    <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 32px; line-height: 1.1;">
      Séance<br/>terminée !
    </div>
    <div style="font-size: 13px; color: var(--muted); line-height: 1.9;">
      {{ sessionLength }} exercices + {{ stretchCount }} étirements<br/>
      <template v-if="elapsed">
        <span style="color: var(--fg); font-weight: 600;">{{ elapsed }}</span> · Bien joué.
      </template>
      <template v-else>Bien joué.</template>
    </div>
    <div style="width: 100%; margin-top: 8px;">
      <button
        @click="$emit('restart')"
        style="width: 100%; padding: 16px; background: #22c55e; color: #000; border: none; border-radius: 14px; font-size: 15px; font-weight: 700; font-family: 'Syne', sans-serif; cursor: pointer; letter-spacing: 0.02em;"
      >Nouvelle séance</button>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/screens/DoneScreen.vue
git commit -m "feat: implement DoneScreen component"
```

---

### Task 11: SessionView wiring + CSS globals + fonts

**Files:**
- Modify: `src/views/SessionView.vue`
- Modify: `src/assets/main.css`
- Modify: `index.html`

- [ ] **Step 1: Add Google Fonts and global styles to `index.html`**

Read the current `index.html`. Add the font preconnect and stylesheet links inside `<head>`, before the existing `<script>` tag:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
```

- [ ] **Step 2: Update `src/assets/main.css`**

Replace the file contents with:

```css
@import "tailwindcss";

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #app { height: 100%; }
body { -webkit-tap-highlight-color: transparent; background: var(--bg); }

:root {
  --bg:             #080808;
  --surface:        #111111;
  --border:         #1a1a1a;
  --fg:             #e5e5e5;
  --fg2:            #aaaaaa;
  --muted:          #555555;
  --subtle:         #282828;
  --warmup-bg:      #100d00;
  --warmup-border:  rgba(240,165,0,0.13);
  --stretch-bg:     #081008;
  --stretch-border: rgba(52,211,153,0.12);
  --ex-bg:          #181818;
  --ghost-border:   #1e1e1e;
  --ring-track:     #1a1a1a;
  --toggle-bg:      #141414;
  --toggle-border:  #282828;
  --toggle-fg:      #666666;
}

html.light {
  --bg:             #f2f1ed;
  --surface:        #ffffff;
  --border:         #e0dfd8;
  --fg:             #1a1a1a;
  --fg2:            #444444;
  --muted:          #888888;
  --subtle:         #d0cfca;
  --warmup-bg:      #fefbf0;
  --warmup-border:  rgba(180,120,0,0.15);
  --stretch-bg:     #f0faf4;
  --stretch-border: rgba(22,163,74,0.15);
  --ex-bg:          #f5f4f0;
  --ghost-border:   #d5d4ce;
  --ring-track:     #e0dfd8;
  --toggle-bg:      #ffffff;
  --toggle-border:  #e0dfd8;
  --toggle-fg:      #888888;
}

@keyframes pop    { 0% { transform: scale(1.4); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
@keyframes fin    { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes sideIn { 0% { opacity: 0; transform: translateX(24px); } 100% { opacity: 1; transform: translateX(0); } }
.pop    { animation: pop    0.3s cubic-bezier(.175, .885, .32, 1.275) both; }
.fin    { animation: fin    0.3s ease-out both; }
.sideIn { animation: sideIn 0.25s ease-out both; }

button { transition: opacity 0.15s, transform 0.1s; -webkit-appearance: none; }
button:active { opacity: 0.8; transform: scale(0.98); }
```

- [ ] **Step 3: Replace `src/views/SessionView.vue`**

```vue
<script setup lang="ts">
import { useSession } from '../composables/useSession'
import { exercises } from '../data/exercises'
import { stretches } from '../data/stretches'
import HomeScreen         from '../components/screens/HomeScreen.vue'
import IntroScreen        from '../components/screens/IntroScreen.vue'
import CountdownScreen    from '../components/screens/CountdownScreen.vue'
import ActiveScreen       from '../components/screens/ActiveScreen.vue'
import RestScreen         from '../components/screens/RestScreen.vue'
import ExDoneScreen       from '../components/screens/ExDoneScreen.vue'
import StretchIntroScreen from '../components/screens/StretchIntroScreen.vue'
import StretchScreen      from '../components/screens/StretchScreen.vue'
import DoneScreen         from '../components/screens/DoneScreen.vue'

defineEmits<{ 'open-settings': [] }>()

const s = useSession()
</script>

<template>
  <HomeScreen
    v-if="s.screen.value === 'home'"
    :session="s.session.value"
    :pool-size="exercises.length"
    @commencer="s.handleCommencer()"
    @regen="s.handleRegen()"
  />

  <IntroScreen
    v-else-if="s.screen.value === 'intro'"
    :exercise="s.currentExercise.value"
    :exercise-index="s.exerciseIndex.value"
    :session-length="s.session.value.length"
    @start="s.handleStart()"
  />

  <CountdownScreen
    v-else-if="s.screen.value === 'countdown'"
    :countdown-value="s.countdownValue.value"
    :exercise="s.currentExercise.value"
    :set-number="s.setNumber.value"
  />

  <ActiveScreen
    v-else-if="s.screen.value === 'active'"
    :exercise="s.currentExercise.value"
    :exercise-index="s.exerciseIndex.value"
    :session-length="s.session.value.length"
    :set-number="s.setNumber.value"
    :ex-timer-value="s.exTimer.value.value"
    :ex-timer-max="s.exTimer.max.value"
    @ok="s.handleOk()"
  />

  <RestScreen
    v-else-if="s.screen.value === 'rest'"
    :exercise="s.currentExercise.value"
    :exercise-index="s.exerciseIndex.value"
    :session-length="s.session.value.length"
    :set-number="s.setNumber.value"
    :rest-timer-value="s.restTimer.value.value"
    :rest-timer-max="s.restTimer.max.value"
    @skip="s.handleSkipRest()"
  />

  <ExDoneScreen
    v-else-if="s.screen.value === 'exdone'"
    :exercise="s.currentExercise.value"
    :exercise-index="s.exerciseIndex.value"
    :session-length="s.session.value.length"
    :next-exercise="s.session.value[s.exerciseIndex.value + 1] ?? null"
    @next="s.handleNext()"
  />

  <StretchIntroScreen
    v-else-if="s.screen.value === 'stretchIntro'"
    :stretch="s.currentStretch.value"
    :stretch-index="s.stretchIndex.value"
    :stretch-count="stretches.length"
    @start="s.startStretch()"
    @skip="s.skipStretch()"
  />

  <StretchScreen
    v-else-if="s.screen.value === 'stretch'"
    :stretch="s.currentStretch.value"
    :stretch-index="s.stretchIndex.value"
    :stretch-count="stretches.length"
    :stretch-side="s.stretchSide.value"
    :timer-value="s.stretchTimer.value.value"
    :timer-max="s.stretchTimer.max.value"
    @next-side="s.handleNextSide()"
    @skip="s.skipStretch()"
    @done="s.finishCatCow()"
  />

  <DoneScreen
    v-else-if="s.screen.value === 'done'"
    :session-length="s.session.value.length"
    :stretch-count="stretches.length"
    :elapsed="s.elapsed.value"
    @restart="s.handleRestart()"
  />
</template>
```

- [ ] **Step 4: Commit**

```bash
git add index.html src/assets/main.css src/views/SessionView.vue
git commit -m "feat: wire SessionView, add CSS variables, animations and Google Fonts"
```
