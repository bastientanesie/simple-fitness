<script setup lang="ts">
withDefaults(defineProps<{
  current: number
  total: number
  doneColor?: string
  activeColor?: string
}>(), {
  doneColor: '#22c55e',
  activeColor: '#f0a500',
})
</script>

<template>
  <div style="display: flex; gap: 5px; justify-content: center;">
    <div
      v-for="(_, i) in Array.from({ length: total })"
      :key="i"
      :style="{
        width: i === current ? '20px' : '7px',
        height: '7px',
        borderRadius: '4px',
        transition: 'all 0.3s',
        background: i < current ? doneColor : i === current ? activeColor : 'var(--border)',
      }"
    />
  </div>
</template>
