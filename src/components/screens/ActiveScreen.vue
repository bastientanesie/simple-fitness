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
