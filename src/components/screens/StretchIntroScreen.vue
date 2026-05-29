<script setup lang="ts">
import Dots from '../Dots.vue'
import { type Stretch } from '../../data/stretches'

defineProps<{
  stretch: Stretch
  stretchIndex: number
  stretchCount: number
}>()

defineEmits<{ start: [], skip: [] }>()
</script>

<template>
  <div style="min-height: 100vh; background: var(--bg); color: var(--fg); font-family: 'IBM Plex Mono', monospace; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column;">
    <div style="padding: 24px 20px 0;">
      <Dots :current="stretchIndex" :total="stretchCount" done-color="#34d399" active-color="#fbbf24" />
    </div>
    <div class="sideIn" style="flex: 1; padding: 16px 20px 32px; display: flex; flex-direction: column; gap: 18px;">
      <div>
        <div style="font-size: 10px; color: #34d399; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 4px;">
          Étirements · {{ stretchIndex + 1 }}/{{ stretchCount }}
        </div>
        <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; line-height: 1.15; margin-bottom: 12px;">
          {{ stretch.emoji }} {{ stretch.name }}
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <span :style="{ display: 'inline-block', fontSize: '10px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: stretch.tc + '20', color: stretch.tc, border: `1px solid ${stretch.tc}40`, letterSpacing: '0.05em', textTransform: 'uppercase' }">
            {{ stretch.duration !== null ? (stretch.sides ? `${stretch.duration}s × 2 côtés` : `${stretch.duration}s`) : `${stretch.reps} répétitions` }}
          </span>
        </div>
      </div>

      <div>
        <div style="font-size: 10px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px;">Position</div>
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; font-size: 13px; color: var(--fg2); line-height: 1.7;">
          {{ stretch.pos }}
        </div>
      </div>

      <div>
        <div style="font-size: 10px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px;">Conseil</div>
        <div :style="{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.8', borderLeft: `2px solid ${stretch.tc}`, paddingLeft: '14px' }">
          {{ stretch.cue }}
        </div>
      </div>

      <div style="margin-top: auto; display: flex; flex-direction: column; gap: 10px;">
        <button
          @click="$emit('start')"
          style="width: 100%; padding: 16px; background: #34d399; color: #000; border: none; border-radius: 14px; font-size: 15px; font-weight: 700; font-family: 'Syne', sans-serif; cursor: pointer; letter-spacing: 0.02em;"
        >{{ stretch.duration !== null ? 'Lancer le timer →' : "C'est parti →" }}</button>
        <button
          @click="$emit('skip')"
          style="width: 100%; padding: 12px; background: transparent; color: var(--muted); border: 1px solid var(--ghost-border); border-radius: 14px; font-size: 12px; font-family: 'IBM Plex Mono', monospace; cursor: pointer;"
        >Passer cet étirement</button>
      </div>
    </div>
  </div>
</template>
