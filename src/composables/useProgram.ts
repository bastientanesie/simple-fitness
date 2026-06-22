import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { exercises, type Exercise, type ExerciseCategory } from '../data/exercises'
import { stretches, type Stretch } from '../data/stretches'
import { warmups, type Warmup } from '../data/warmups'

export interface ExerciseOverride {
  enabled: boolean
  sets: number
  rest: number
  duration?: number
}

export interface StretchEntry {
  id: string
  enabled: boolean
  duration?: number
  reps?: number
}

export interface WarmupEntry {
  id: string
  enabled: boolean
  duration: number
}

export interface ProgramConfig {
  categoryQuotas: Record<ExerciseCategory, number>
  exercises: Record<string, ExerciseOverride>
  stretches: StretchEntry[]
  warmups: WarmupEntry[]
  sideChangeDuration: number
}

function makeDefault(): ProgramConfig {
  return {
    categoryQuotas: { legs: 2, back: 1, core: 1, shoulders: 1 },
    exercises: Object.fromEntries(
      exercises.map(e => [e.id, {
        enabled: true,
        sets: e.sets,
        rest: e.rest,
        ...(e.duration !== undefined ? { duration: e.duration } : {}),
      }])
    ),
    stretches: stretches.map(s => ({
      id: s.id,
      enabled: true,
      ...(s.duration !== null ? { duration: s.duration } : { reps: (s as { reps: number }).reps }),
    })),
    warmups: warmups.map(w => ({
      id: w.id,
      enabled: true,
      duration: w.duration,
    })),
    sideChangeDuration: 10,
  }
}

function mergeConfig(saved: Partial<ProgramConfig>): ProgramConfig {
  if (!saved?.exercises || !saved?.stretches || !saved?.categoryQuotas || !saved?.warmups) {
    return makeDefault()
  }
  const merged = { ...makeDefault(), ...saved }

  // Add exercises present in pool but absent from saved config
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
    } else if (e.duration !== undefined && merged.exercises[e.id].duration === undefined) {
      merged.exercises = {
        ...merged.exercises,
        [e.id]: { ...merged.exercises[e.id], duration: e.duration },
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

  const savedWarmupIds = new Set(merged.warmups.map(w => w.id))
  const newWarmups: WarmupEntry[] = []
  for (const w of warmups) {
    if (!savedWarmupIds.has(w.id)) {
      newWarmups.push({ id: w.id, enabled: true, duration: w.duration })
    }
  }
  if (newWarmups.length > 0) {
    merged.warmups = [...merged.warmups, ...newWarmups]
  }

  return merged
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function avoidConsecutiveCategories(list: Exercise[]): Exercise[] {
  const result: Exercise[] = []
  const remaining = [...list]

  while (remaining.length > 0) {
    const lastCategory = result.length > 0 ? result[result.length - 1].category : null
    const idx = remaining.findIndex(e => e.category !== lastCategory)
    result.push(...remaining.splice(idx === -1 ? 0 : idx, 1))
  }

  return result
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

  const enabledWarmups = computed<(Warmup & { duration: number })[]>(() =>
    config.value.warmups
      .filter(entry => entry.enabled)
      .map(entry => {
        const base = warmups.find(w => w.id === entry.id)
        if (!base) return null
        return { ...base, duration: entry.duration }
      })
      .filter((w): w is Warmup & { duration: number } => w !== null)
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
        ...(e.duration !== undefined
          ? { duration: config.value.exercises[e.id]?.duration ?? e.duration }
          : {}),
      })))
    }

    return avoidConsecutiveCategories(shuffle(selected))
  }

  function resetToDefault() {
    config.value = makeDefault()
  }

  return { config, resolvedStretches, enabledWarmups, buildSession, resetToDefault }
}
