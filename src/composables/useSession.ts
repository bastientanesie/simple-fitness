import { ref, computed, watch } from 'vue'
import { useLocalStorage, useWakeLock } from '@vueuse/core'
import { exercises, type Exercise } from '../data/exercises'
import { useTimer } from './useTimer'
import { useAudio } from './useAudio'
import { useProgram } from './useProgram'

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

function snapScreen(s: ScreenName): ScreenName {
  if (s === 'countdown' || s === 'active' || s === 'rest') return 'intro'
  if (s === 'exerciseSideChange') return 'intro'
  if (s === 'stretch' || s === 'stretchCountdown' || s === 'stretchSideChange') return 'stretchIntro'
  return s
}

export function useSession() {
  const audio = useAudio()
  const { config, buildSession, resolvedStretches } = useProgram()
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
    if (restored.length !== savedState.value.sessionIds.length) {
      return buildSession(lastSessionIds.value)
    }
    return restored.map(e => ({
      ...e,
      sets: config.value.exercises[e.id]?.sets ?? e.sets,
      rest: config.value.exercises[e.id]?.rest ?? e.rest,
      ...(e.duration !== undefined
        ? { duration: config.value.exercises[e.id]?.duration ?? e.duration }
        : {}),
    }))
  }

  const session       = ref<Exercise[]>(restoreSession())
  const screen        = ref<ScreenName>(savedState.value ? snapScreen(savedState.value.screen) : 'home')
  const exerciseIndex = ref(savedState.value?.exerciseIndex ?? 0)
  const setNumber     = ref(savedState.value?.setNumber ?? 1)
  const stretchIndex  = ref(savedState.value?.stretchIndex ?? 0)
  const stretchSide   = ref<0 | 1>(savedState.value?.stretchSide ?? 0)
  const exerciseSide  = ref<0 | 1>(savedState.value?.exerciseSide ?? 0)
  const countdownValue = ref(1)
  const elapsed       = ref('')
  let startTime: number | null = null

  const currentExercise = computed(() =>
    session.value[Math.min(exerciseIndex.value, session.value.length - 1)] ?? session.value[0]
  )
  const currentStretch = computed(() =>
    resolvedStretches.value[Math.min(stretchIndex.value, resolvedStretches.value.length - 1)]
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
      exerciseSide: exerciseSide.value,
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

  // ── Rest-end tick ────────────────────────────────────────────────────────
  watch(restTimer.value, (v) => {
    if (v > 0 && v <= 3) audio.tick()
  })

  // ── Stretch-end tick ─────────────────────────────────────────────────────
  watch(stretchTimer.value, (v) => {
    if (v > 0 && v <= 3) audio.tick()
  })

  // ── Countdown watch ──────────────────────────────────────────────────────
  const countdownScreens: ScreenName[] = ['countdown', 'stretchCountdown', 'stretchSideChange', 'exerciseSideChange']
  let cdTimeout: ReturnType<typeof setTimeout> | null = null

  watch([screen, countdownValue], ([s, cdv]) => {
    if (!countdownScreens.includes(s as ScreenName)) {
      if (cdTimeout) { clearTimeout(cdTimeout); cdTimeout = null }
      return
    }
    if (cdTimeout) { clearTimeout(cdTimeout); cdTimeout = null }
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
    } else if (ex.sides && exerciseSide.value === 0) {
      audio.side()
      screen.value = 'exerciseSideChange'
    } else {
      audio.exdone()
      exerciseSide.value = 0
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
    exerciseSide.value = 0
    elapsed.value = ''
    savedState.value = null
    screen.value = 'home'
  }

  function startStretch() {
    stretchSide.value = 0
    screen.value = 'stretchCountdown'
  }

  function skipStretch() {
    stretchTimer.stop()
    if (stretchIndex.value < resolvedStretches.value.length - 1) {
      stretchIndex.value++
      stretchSide.value = 0
      screen.value = 'stretchCountdown'
    } else {
      finishSession()
    }
  }

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

  function handleNextSide() {
    stretchTimer.stop()
    audio.side()
    screen.value = 'stretchSideChange'
  }

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
}
