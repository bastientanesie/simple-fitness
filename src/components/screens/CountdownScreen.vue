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
