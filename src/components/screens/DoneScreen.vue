<script setup lang="ts">
defineProps<{
  sessionLength: number
  stretchCount: number
  elapsed: string
}>()

defineEmits<{ restart: [] }>()
</script>

<template>
  <div class="fin" style="min-height: 100vh; background: var(--bg); color: var(--fg); font-family: 'IBM Plex Mono', monospace; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 40px 24px; gap: 20px;">
    <div style="font-size: 80px;">🎉</div>
    <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 32px; line-height: 1.1;">
      Séance<br/>terminée !
    </div>
    <div style="font-size: 13px; color: var(--muted); line-height: 1.9;">
      {{ sessionLength }} exercices + {{ stretchCount }} étirements<br/>
      <template v-if="elapsed">
        <span style="color: var(--fg); font-weight: 600;">{{ elapsed }}</span> · Bien joué.
      </template>
      <template v-else>Bien joué.</template>
    </div>
    <div style="width: 100%; margin-top: 8px;">
      <button
        @click="$emit('restart')"
        style="width: 100%; padding: 16px; background: #22c55e; color: #000; border: none; border-radius: 14px; font-size: 15px; font-weight: 700; font-family: 'Syne', sans-serif; cursor: pointer; letter-spacing: 0.02em;"
      >Nouvelle séance</button>
    </div>
  </div>
</template>
