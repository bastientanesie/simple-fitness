<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from './composables/useTheme'
import SessionView from './views/SessionView.vue'
import SettingsView from './views/SettingsView.vue'

type View = 'session' | 'settings'

const currentView = ref<View>('session')
useTheme()
</script>

<template>
  <SessionView
    v-if="currentView === 'session'"
    @open-settings="currentView = 'settings'"
  />
  <SettingsView
    v-else
    @back="currentView = 'session'"
  />
</template>
