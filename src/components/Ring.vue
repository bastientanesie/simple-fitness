<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  value: number
  max: number
  color: string
  size?: number
}>(), { size: 160 })

const sw = 10
const r = computed(() => (props.size - sw) / 2)
const circumference = computed(() => 2 * Math.PI * r.value)
const pct = computed(() => props.max > 0 ? Math.max(0, props.value) / props.max : 0)
</script>

<template>
  <svg :width="size" :height="size" style="transform: rotate(-90deg)">
    <circle
      :cx="size / 2" :cy="size / 2" :r="r"
      fill="none" stroke="var(--ring-track)" :stroke-width="sw"
    />
    <circle
      :cx="size / 2" :cy="size / 2" :r="r"
      fill="none" :stroke="color" :stroke-width="sw"
      :stroke-dasharray="circumference"
      :stroke-dashoffset="circumference * (1 - pct)"
      stroke-linecap="round"
      style="transition: stroke-dashoffset 1s linear"
    />
  </svg>
</template>
