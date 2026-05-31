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
  const exTimer      = useTimer()
  const restTimer    = useTimer()
  const stretchTimer = useTimer()
  const { request: acquireWakeLock, release: releaseWakeLock } = useWakeLock()

  const lastSessionIds = useLocalStorage<string[]>('last-session-ids', [])
  const savedState     = useLocalStorage<PersistedState | null>('session-state', null, {
    serializer: {
      read:  (v: string) => { try { return JSON.parse(v) as PersistedState } catch { return null } },
      write: (v: PersistedState | null) => JSON.stringify(v),
    },
  })

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

  // ── Rest-end tick ────────────────────────────────────────────────────────
  watch(restTimer.value, (v) => {
    if (v > 0 && v <= 3) audio.tick()
  })

  // ── Stretch-end tick ─────────────────────────────────────────────────────
  watch(stretchTimer.value, (v) => {
    if (v > 0 && v <= 3) audio.tick()
  })

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
  function handleBegin() {
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
    audio.next()
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
}
