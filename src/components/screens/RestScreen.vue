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
