<script setup lang="ts">
import { type Warmup } from '../../data/warmups'

defineProps<{
  warmup: Warmup & { duration: number }
}>()

defineEmits<{ start: [] }>()

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  return `${m} min`
}
</script>

<template>
  <div class="fin" style="min-height: 100vh; background: var(--bg); color: var(--fg); font-family: 'IBM Plex Mono', monospace; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column;">
    <div style="flex: 1; padding: 28px 20px 32px; display: flex; flex-direction: column; gap: 18px;">
      <div>
        <div style="font-size: 10px; color: #f0a500; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 4px;">
          Échauffement
        </div>
        <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; line-height: 1.15; margin-bottom: 12px;">
          {{ warmup.emoji }} {{ warmup.name }}
        </div>
        <span style="display: inline-block; font-size: 10px; font-weight: 600; padding: 3px 10px; border-radius: 999px; background: var(--warmup-bg); color: #f0a500; border: 1px solid var(--warmup-border); letter-spacing: 0.05em; text-transform: uppercase;">
          {{ formatDuration(warmup.duration) }}
        </span>
      </div>

      <div>
        <div style="font-size: 10px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px;">Description</div>
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; font-size: 13px; color: var(--fg2); line-height: 1.7;">
          {{ warmup.description }}
        </div>
      </div>

      <div>
        <div style="font-size: 10px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px;">Détail</div>
        <div style="font-size: 13px; color: var(--muted); line-height: 1.8; border-left: 2px solid #f0a500; padding-left: 14px;">
          {{ warmup.detail }}
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
