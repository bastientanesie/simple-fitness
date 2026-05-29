<script setup lang="ts">
import { computed } from 'vue'
import Dots from '../Dots.vue'
import Ring from '../Ring.vue'
import { type Stretch } from '../../data/stretches'

const props = defineProps<{
  stretch: Stretch
  stretchIndex: number
  stretchCount: number
  stretchSide: 0 | 1
  timerValue: number
  timerMax: number
}>()

defineEmits<{ 'next-side': [], skip: [], done: [] }>()

const sideLabel = computed(() => {
  if (!props.stretch.sides) return null
  return props.stretchSide === 0 ? 'Côté gauche' : 'Côté droit'
})
</script>

<template>
  <div style="min-height: 100vh; background: var(--bg); color: var(--fg); font-family: 'IBM Plex Mono', monospace; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column;">
    <div style="padding: 24px 20px 0;">
      <Dots :current="stretchIndex" :total="stretchCount" done-color="#34d399" active-color="#fbbf24" />
    </div>

    <!-- Rep-based stretch (Cat-Cow) -->
    <template v-if="stretch.duration === null">
      <div class="sideIn" style="flex: 1; padding: 16px 20px 32px; display: flex; flex-direction: column;">
        <div style="font-size: 10px; color: #34d399; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 4px;">
          Étirements · {{ stretchIndex + 1 }}/{{ stretchCount }}
        </div>
        <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; margin-bottom: 16px;">
          {{ stretch.emoji }} {{ stretch.name }}
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 12px; text-align: center;">
          <div style="font-size: 80px;">{{ stretch.emoji }}</div>
          <div :style="{ fontFamily: '\'Syne\', sans-serif', fontWeight: 800, fontSize: '28px', color: stretch.tc }">{{ stretch.reps }} répétitions</div>
          <div style="font-size: 12px; color: var(--muted); max-width: 280px; line-height: 1.7;">{{ stretch.cue.split('.')[0] }}.</div>
        </div>
        <button
          @click="$emit('done')"
          style="width: 100%; padding: 16px; background: #34d399; color: #000; border: none; border-radius: 14px; font-size: 15px; font-weight: 700; font-family: 'Syne', sans-serif; cursor: pointer; letter-spacing: 0.02em;"
        >✓ Terminé</button>
      </div>
    </template>

    <!-- Timed stretch -->
    <template v-else>
      <div class="sideIn" style="flex: 1; padding: 16px 20px 32px; display: flex; flex-direction: column; align-items: center; justify-content: space-between;">
        <div style="text-align: center;">
          <div style="font-size: 10px; color: #34d399; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 4px;">
            Étirements · {{ stretchIndex + 1 }}/{{ stretchCount }}
          </div>
          <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px;">
            {{ stretch.emoji }} {{ stretch.name }}
          </div>
          <div
            v-if="sideLabel"
            :key="stretchSide"
            class="pop"
            :style="{ fontFamily: '\'Syne\', sans-serif', fontWeight: 800, fontSize: '16px', color: stretch.tc, marginTop: '6px' }"
          >{{ sideLabel }}</div>
        </div>
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <Ring :value="timerValue" :max="timerMax" :color="stretch.tc" />
          <div style="position: absolute; text-align: center;">
            <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 50px; line-height: 1;">{{ timerValue }}</div>
            <div style="font-size: 10px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-top: 4px;">secondes</div>
          </div>
        </div>
        <div style="width: 100%; display: flex; flex-direction: column; gap: 10px;">
          <button
            v-if="stretch.sides && stretchSide === 0"
            @click="$emit('next-side')"
            style="width: 100%; padding: 16px; background: #34d399; color: #000; border: none; border-radius: 14px; font-size: 15px; font-weight: 700; font-family: 'Syne', sans-serif; cursor: pointer; letter-spacing: 0.02em;"
          >Côté droit →</button>
          <button
            @click="$emit('skip')"
            style="width: 100%; padding: 12px; background: transparent; color: var(--muted); border: 1px solid var(--ghost-border); border-radius: 14px; font-size: 12px; font-family: 'IBM Plex Mono', monospace; cursor: pointer;"
          >Passer →</button>
        </div>
      </div>
    </template>
  </div>
</template>
