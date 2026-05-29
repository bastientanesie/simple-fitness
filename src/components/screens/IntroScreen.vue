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
