<script setup lang="ts">
import { useTheme } from '../composables/useTheme'

defineEmits<{ back: [] }>()

const { pref } = useTheme()

const themeOptions = [
  { value: 'system' as const, label: 'Système' },
  { value: 'light'  as const, label: 'Clair'   },
  { value: 'dark'   as const, label: 'Sombre'  },
]
</script>

<template>
  <div class="fin" style="min-height: 100vh; background: var(--bg); color: var(--fg); font-family: 'IBM Plex Mono', monospace; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column;">
    <div style="padding: 24px 20px;">

      <!-- Header -->
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 36px;">
        <button
          @click="$emit('back')"
          style="background: transparent; border: 1px solid var(--ghost-border); color: var(--muted); border-radius: 8px; padding: 5px 12px; cursor: pointer; font-size: 14px; font-family: 'IBM Plex Mono', monospace;"
        >←</button>
        <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px;">Paramètres</div>
      </div>

      <!-- Thème -->
      <div>
        <div style="font-size: 10px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 12px;">Thème</div>
        <div style="display: flex; gap: 8px;">
          <button
            v-for="opt in themeOptions"
            :key="opt.value"
            @click="pref = opt.value"
            :style="{
              flex: 1,
              padding: '10px 8px',
              borderRadius: '10px',
              fontSize: '12px',
              fontFamily: '\'IBM Plex Mono\', monospace',
              cursor: 'pointer',
              border: pref === opt.value ? '1px solid var(--fg)' : '1px solid var(--ghost-border)',
              background: pref === opt.value ? 'var(--surface)' : 'transparent',
              color: pref === opt.value ? 'var(--fg)' : 'var(--muted)',
              fontWeight: pref === opt.value ? 600 : 400,
              transition: 'all 0.15s',
            }"
          >{{ opt.label }}</button>
        </div>
      </div>

    </div>
  </div>
</template>
