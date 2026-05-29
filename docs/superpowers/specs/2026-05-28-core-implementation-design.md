# Core Implementation Design — simple-fitness

Date: 2026-05-28
Scope: Data layer, composables (useTimer, useAudio, useSession), SessionView wiring, and all 9 screen components.

---

## 1. Data Layer

### Exercise type (extended)

```ts
export type ExerciseCategory = 'legs' | 'back' | 'core' | 'shoulders'

export interface Exercise {
  id: string
  name: string
  emoji: string
  tc: string            // hex accent color for UI
  category: ExerciseCategory
  target: string        // e.g. "Jambes · Genoux"
  sets: number
  reps?: string         // display string, e.g. "12 reps" or "10 reps / côté"
  duration?: number     // seconds, timed exercises only
  rest: number          // seconds between sets
  gear: string | null   // e.g. "élastique" or null
  pos: string           // starting position description
  cue: string           // execution cue
}
```

`timed` is derived: `exercise.duration !== undefined`. The `ExerciseType` type alias and the `type` field from the previous stub are removed.

The 12 exercises are copied verbatim from `docs/seance.html` (POOL array). Session building logic (pick 2 legs + 1 back + 1 core + 1 shoulders, shuffle, avoid last-session IDs) lives in `useSession`.

### Stretch type (extended)

```ts
export interface Stretch {
  id: string
  name: string
  emoji: string
  tc: string
  duration: number | null   // null = rep-based (Cat-Cow)
  sides: boolean
  reps?: number             // only when duration === null
  pos: string
  cue: string
}
```

The 5 stretches are copied verbatim from `docs/seance.html` (STRETCHES array).

---

## 2. Composables

### useTimer

Generic countdown utility. Used internally by `useSession` (3 instances: exercise timer, rest timer, stretch timer).

```ts
useTimer() → {
  value: Ref<number>
  max: Ref<number>
  running: Ref<boolean>
  start(duration: number, onComplete?: () => void): void
  stop(): void
  reset(): void
}
```

Implementation: `setTimeout`-based recursion (1 s tick), not `setInterval`, to avoid drift. Cleans up on `onUnmounted`.

### useAudio

Port of the Web Audio API sound engine from the reference HTML.

```ts
useAudio() → {
  tick(): void
  go(): void
  next(): void
  exdone(): void
  side(): void
  done(): void
}
```

`AudioContext` is created lazily on the first call (requires a prior user gesture). A module-level singleton is reused across calls. Identical tone frequencies and timing to the reference.

### useSession

The session state machine. Owns all session state and coordinates timers, audio, localStorage persistence, and screen transitions.

**State exposed:**

```ts
{
  screen: Ref<ScreenName>
  session: Ref<Exercise[]>        // current session (5 exercises)
  exerciseIndex: Ref<number>
  setNumber: Ref<number>          // 1-based
  countdownValue: Ref<number>     // 1 → 4 (4 = GO displayed)
  stretchIndex: Ref<number>
  stretchSide: Ref<0 | 1>
  elapsed: Ref<string>            // formatted duration, set on done
  exTimer: { value, max }         // reactive, read-only to consumers
  restTimer: { value, max }
  stretchTimer: { value, max }
  // handlers
  handleCommencer(): void
  handleStart(): void
  handleOk(): void
  handleSkipRest(): void
  handleNext(): void
  handleRegen(): void
  handleRestart(): void
  startStretch(): void
  skipStretch(): void
  finishCatCow(): void
}
```

**Internal coordination:**

`watch(screen, ...)` drives timer start/stop on screen transitions, mirroring the `useEffect` pattern in the reference React implementation.

`useSession` also manages:
- **Wake lock** via VueUse `useWakeLock`: acquired on `handleCommencer`, released on `finishSeance` (transition to `done` screen).
- **Elapsed time**: `startTime` recorded on `handleCommencer`, formatted `elapsed` string computed on `finishSeance`.

**Persistence:**

On every state change that matters, `useSession` persists to `localStorage` key `session-state` (via VueUse `useLocalStorage`):

```ts
{
  sessionIds: string[]
  exerciseIndex: number
  setNumber: number
  stretchIndex: number
  stretchSide: 0 | 1
  screen: ScreenName
}
```

**Snap rule on restore:** if persisted `screen` is `countdown | active | rest`, restore as `intro`. If `stretch`, restore as `stretchIntro`. All other screens restore as-is.

The existing `last-session-ids` key (exercise IDs from the previous session, used to avoid repeats) is unchanged.

---

## 3. SessionView + Screens

### SessionView

Calls `useSession()`, extracts all state and handlers, then routes to the active screen via `v-if / v-else-if`. No logic of its own beyond coordinating between `useSession` and the screen components.

### Screen components

Located in `src/components/screens/`. All code in English. UI copy (exercise names, cues, labels) remains in French as in the reference.

| Screen | Props | Emits |
|---|---|---|
| HomeScreen | `session: Exercise[]`, `poolSize: number` | `commencer`, `regen` |
| IntroScreen | `exercise: Exercise`, `exerciseIndex: number`, `sessionLength: number` | `start` |
| CountdownScreen | `countdownValue: number`, `exercise: Exercise`, `setNumber: number` | — |
| ActiveScreen | `exercise: Exercise`, `setNumber: number`, `exTimerValue: number`, `exTimerMax: number` | `ok` |
| RestScreen | `exercise: Exercise`, `setNumber: number`, `restTimerValue: number`, `restTimerMax: number` | `skip` |
| ExDoneScreen | `exercise: Exercise`, `nextExercise: Exercise \| null` | `next` |
| StretchIntroScreen | `stretch: Stretch`, `stretchIndex: number`, `stretchCount: number` | `start`, `skip` |
| StretchScreen | `stretch: Stretch`, `stretchIndex: number`, `stretchCount: number`, `stretchSide: 0\|1`, `timerValue: number`, `timerMax: number` | `next-side`, `skip` |
| DoneScreen | `sessionLength: number`, `stretchCount: number`, `elapsed: string` | `restart` |

### Shared UI primitives

Two small renderless/inline components used across screens:

- **Ring** — SVG countdown ring. Props: `value`, `max`, `color`, `size?`. Port of the `Ring` function component from the reference.
- **Dots** — Progress dots. Props: `current`, `total`, `doneColor?`, `activeColor?`. Port of the `Dots` function component.

Both live in `src/components/` (not in screens/).

---

## 4. Styling

Tailwind CSS v4 utility classes where possible. CSS custom properties (`--bg`, `--fg`, etc.) are already defined in the Tailwind config from the project init phase. Animations (`pop`, `fin`, `sideIn`) are defined globally. No new CSS frameworks or libraries.

---

## 5. localStorage keys

| Key | Purpose |
|---|---|
| `last-session-ids` | IDs of last session's exercises (avoid repeats) |
| `session-state` | In-progress session state (screen, indices, exercise IDs) |
| `theme-pref` | Theme mode (`system` / `light` / `dark`) — already implemented |

---

## 6. Out of scope

- Settings view (SettingsView.vue already stubbed, not implemented in this phase)
- Unit or component tests
- New routes or navigation beyond the existing App.vue view switch
