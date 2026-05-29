import { ref, onUnmounted } from 'vue'

export function useTimer() {
  const value = ref(0)
  const max = ref(0)
  const running = ref(false)

  let timeout: ReturnType<typeof setTimeout> | null = null
  let onCompleteCallback: (() => void) | undefined

  function tick() {
    if (!running.value) return
    value.value--
    if (value.value <= 0) {
      running.value = false
      timeout = null
      onCompleteCallback?.()
    } else {
      timeout = setTimeout(tick, 1000)
    }
  }

  function start(duration: number, onComplete?: () => void) {
    stop()
    value.value = duration
    max.value = duration
    onCompleteCallback = onComplete
    running.value = true
    timeout = setTimeout(tick, 1000)
  }

  function stop() {
    running.value = false
    if (timeout !== null) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  function reset() {
    stop()
    value.value = 0
    max.value = 0
  }

  onUnmounted(() => stop())

  return { value, max, running, start, stop, reset }
}
