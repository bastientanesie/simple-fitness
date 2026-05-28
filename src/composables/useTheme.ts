import { useStorage, usePreferredDark } from '@vueuse/core'
import { watchEffect } from 'vue'

type ThemePref = 'system' | 'light' | 'dark'

export function useTheme() {
  const pref = useStorage<ThemePref>('theme-pref', 'system')
  const prefersDark = usePreferredDark()

  watchEffect(() => {
    const el = document.documentElement
    el.classList.remove('light', 'dark')
    if (pref.value === 'light') {
      el.classList.add('light')
    } else if (pref.value === 'dark') {
      el.classList.add('dark')
    }
  })

  return { pref }
}
