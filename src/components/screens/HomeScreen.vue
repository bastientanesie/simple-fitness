<script setup lang="ts">
import { type Exercise, CAT_LABELS } from '../../data/exercises'

defineProps<{
  session: Exercise[]
  poolSize: number
}>()

defineEmits<{
  commencer: []
  regen: []
  'open-settings': []
}>()
</script>

<template>
  <div class="fin" style="min-height: 100vh; background: var(--bg); color: var(--fg); font-family: 'IBM Plex Mono', monospace; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column;">
    <div style="padding: 28px 20px 80px;">

      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
        <div>
          <div style="font-size: 10px; color: #f0a500; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 8px;">
            Mercredi · Vendredi · 12h15
          </div>
          <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 30px; line-height: 1.1;">
            Séance<br/><span style="color: #f0a500;">renforcement</span>
          </div>
        </div>
        <button
          @click="$emit('open-settings')"
          style="background: transparent; border: 1px solid var(--ghost-border); color: var(--muted); border-radius: 8px; padding: 5px 10px; cursor: pointer; font-size: 14px; flex-shrink: 0; margin-top: 2px;"
        >⚙</button>
      </div>

      <!-- Warmup card -->
      <div style="background: var(--warmup-bg); border: 1px solid var(--warmup-border); border-radius: 12px; padding: 14px 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 24px;">🚴</span>
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px;">Échauffement d'abord</div>
          <div style="font-size: 11px; color: var(--muted);">Vélo d'appart · résistance minimale · 5 min</div>
        </div>
        <span style="font-size: 13px; color: #f0a500; font-weight: 600;">↓</span>
      </div>

      <!-- Session header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div style="font-size: 10px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase;">
          Séance du jour · {{ session.length }} exercices
        </div>
        <button
          @click="$emit('regen')"
          style="background: transparent; border: 1px solid var(--ghost-border); color: var(--muted); border-radius: 8px; padding: 5px 10px; cursor: pointer; font-size: 11px; font-family: 'IBM Plex Mono', monospace; flex-shrink: 0;"
        >↻ changer</button>
      </div>

      <!-- Exercise list -->
      <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
        <div
          v-for="ex in session"
          :key="ex.id"
          style="background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; gap: 12px;"
        >
          <div style="width: 36px; height: 36px; border-radius: 10px; background: var(--ex-bg); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
            {{ ex.emoji }}
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 13px; font-weight: 600; margin-bottom: 3px;">{{ ex.name }}</div>
            <div style="font-size: 11px; color: var(--muted);">{{ ex.sets }} × {{ ex.reps }}</div>
          </div>
          <span v-if="ex.gear" style="font-size: 10px; padding: 2px 7px; border-radius: 999px; background: var(--warmup-bg); color: #f0a500; border: 1px solid var(--warmup-border);">🔗</span>
          <span :style="{ display: 'inline-block', fontSize: '10px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: ex.tc + '20', color: ex.tc, border: `1px solid ${ex.tc}40`, letterSpacing: '0.05em', textTransform: 'uppercase' }">
            {{ CAT_LABELS[ex.category] }}
          </span>
        </div>
      </div>

      <!-- Stretches preview -->
      <div style="background: var(--stretch-bg); border: 1px solid var(--stretch-border); border-radius: 12px; padding: 14px 16px; margin-bottom: 28px; display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 20px;">🧘</span>
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 12px; margin-bottom: 1px;">Étirements · fin de séance</div>
          <div style="font-size: 11px; color: var(--muted);">5 étirements · ~7 min</div>
        </div>
        <span style="font-size: 11px; color: #34d399;">auto</span>
      </div>

      <div style="font-size: 10px; color: var(--muted); text-align: center; margin-bottom: 16px;">
        Tiré d'un pool de {{ poolSize }} exercices · change à chaque séance
      </div>

      <button
        @click="$emit('commencer')"
        style="width: 100%; padding: 16px; background: #22c55e; color: #000; border: none; border-radius: 14px; font-size: 15px; font-weight: 700; font-family: 'Syne', sans-serif; cursor: pointer; letter-spacing: 0.02em;"
      >Commencer →</button>
    </div>
  </div>
</template>
