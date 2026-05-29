<script setup lang="ts">
import Dots from '../Dots.vue'
import { type Exercise } from '../../data/exercises'

defineProps<{
  exercise: Exercise
  exerciseIndex: number
  sessionLength: number
  nextExercise: Exercise | null
}>()

defineEmits<{ next: [] }>()
</script>

<template>
  <div class="fin" style="min-height: 100vh; background: var(--bg); color: var(--fg); font-family: 'IBM Plex Mono', monospace; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 40px 24px; gap: 20px;">
    <Dots :current="exerciseIndex" :total="sessionLength" />
    <div style="font-size: 64px;">{{ exercise.emoji }}</div>
    <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; color: #22c55e;">Exercice terminé !</div>
    <div style="font-size: 12px; color: var(--muted);">{{ exercise.sets }} séries · {{ exercise.reps ?? `${exercise.duration} s` }}</div>
    <div style="width: 100%; margin-top: 8px;">
      <button
        v-if="nextExercise"
        @click="$emit('next')"
        style="width: 100%; padding: 16px; background: #22c55e; color: #000; border: none; border-radius: 14px; font-size: 15px; font-weight: 700; font-family: 'Syne', sans-serif; cursor: pointer; letter-spacing: 0.02em;"
      >{{ nextExercise.emoji }} {{ nextExercise.name }} →</button>
      <button
        v-else
        @click="$emit('next')"
        style="width: 100%; padding: 16px; background: #34d399; color: #000; border: none; border-radius: 14px; font-size: 15px; font-weight: 700; font-family: 'Syne', sans-serif; cursor: pointer; letter-spacing: 0.02em;"
      >🧘 Étirements →</button>
    </div>
  </div>
</template>
