<script setup lang="ts">
import { ref } from 'vue'

type ScreenName =
  | 'home' | 'intro' | 'countdown' | 'active'
  | 'rest' | 'exdone' | 'stretchIntro' | 'stretch' | 'done'

defineEmits<{ 'open-settings': [] }>()

const currentScreen = ref<ScreenName>('home')
</script>

<template>
  <div>{{ currentScreen }}</div>
</template>
