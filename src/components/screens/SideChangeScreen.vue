<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  countdownValue: number
}>()

const isGo = computed(() => props.countdownValue > 5)
const displayValue = computed(() => 6 - props.countdownValue)
</script>

<template>
  <div style="min-height: 100vh; background: var(--bg); color: var(--fg); font-family: 'IBM Plex Mono', monospace; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; gap: 12px;">
    <div style="font-size: 10px; color: var(--subtle); letter-spacing: 0.15em; text-transform: uppercase;">
      changez de côté
    </div>
    <div style="font-size: 14px; color: var(--muted); margin-bottom: 4px;">{{ title }}</div>
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
      {{ isGo ? 'GO !' : displayValue }}
    </div>
    <div style="font-size: 11px; color: var(--subtle);">{{ isGo ? '' : 'prépare-toi' }}</div>
  </div>
</template>
