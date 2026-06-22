<script setup lang="ts">
import Ring from '../Ring.vue'
import { type Warmup } from '../../data/warmups'

defineProps<{
  warmup: Warmup & { duration: number }
  timerValue: number
  timerMax: number
}>()

defineEmits<{ skip: [] }>()
</script>

<template>
  <div style="min-height: 100vh; background: var(--bg); color: var(--fg); font-family: 'IBM Plex Mono', monospace; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column;">
    <div style="flex: 1; padding: 28px 20px 32px; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="font-size: 10px; color: #f0a500; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 4px;">Échauffement</div>
        <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px;">
          {{ warmup.emoji }} {{ warmup.name }}
        </div>
      </div>

      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <Ring :value="timerValue" :max="timerMax" color="#f0a500" />
          <div style="position: absolute; text-align: center;">
            <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 50px; line-height: 1;">{{ timerValue }}</div>
            <div style="font-size: 10px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-top: 4px;">secondes</div>
          </div>
        </div>
        <div style="font-size: 12px; color: var(--muted); max-width: 260px; text-align: center; line-height: 1.7;">
          {{ warmup.detail }}
        </div>
      </div>

      <button
        @click="$emit('skip')"
        style="width: 100%; padding: 16px; border-radius: 14px; font-size: 15px; font-weight: 700; font-family: 'Syne', sans-serif; cursor: pointer; letter-spacing: 0.02em; background: transparent; border: 1px solid var(--ghost-border); color: var(--muted);"
      >Passer →</button>
    </div>
  </div>
</template>
