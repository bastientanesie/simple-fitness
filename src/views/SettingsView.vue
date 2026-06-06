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

function adjustExerciseDuration(id: string, delta: number) {
  const current = config.value.exercises[id]
  if (!current || current.duration === undefined) return
  const next = current.duration + delta
  if (next < 10 || next > 120) return
  config.value = {
    ...config.value,
    exercises: { ...config.value.exercises, [id]: { ...current, duration: next } },
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
              <!-- Durée stepper (exercices timed uniquement) -->
              <div v-if="ex.duration !== undefined" style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 11px; color: var(--muted);">Durée</span>
                <button @click="adjustExerciseDuration(ex.id, -5)" style="width: 24px; height: 24px; border-radius: 5px; border: 1px solid var(--ghost-border); background: transparent; color: var(--fg); cursor: pointer; font-size: 14px;">−</button>
                <span style="font-size: 13px; min-width: 28px; text-align: center;">{{ config.exercises[ex.id]?.duration }}s</span>
                <button @click="adjustExerciseDuration(ex.id, 5)" style="width: 24px; height: 24px; border-radius: 5px; border: 1px solid var(--ghost-border); background: transparent; color: var(--fg); cursor: pointer; font-size: 14px;">+</button>
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
                  style="width: 20px; height: 18px; border-radius: 4px; border: 1px solid var(--ghost-border); background: transparent; color: var(--fg); cursor: pointer; font-size: 10px; line-height: 1;"
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
