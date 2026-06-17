let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContext
  } catch {
    return null
  }
}

function tone(freq: number, dur: number, vol = 0.3, delay = 0) {
  const ctx = getAudioContext()
  if (!ctx) return
  try {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g)
    g.connect(ctx.destination)
    o.type = 'sine'
    o.frequency.value = freq
    g.gain.setValueAtTime(vol, ctx.currentTime + delay)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur)
    o.start(ctx.currentTime + delay)
    o.stop(ctx.currentTime + delay + dur)
  } catch {}
}

export function useAudio() {
  function tick()   { tone(660, 0.07, 0.3) }
  function go()     { tone(880, 0.1, 0.4, 0); tone(880, 0.1, 0.35, 0.12); tone(1100, 0.2, 0.45, 0.25) }
  function next()   { tone(880, 0.12, 0.4, 0); tone(1100, 0.2, 0.4, 0.15) }
  function exdone() { tone(550, 0.1, 0.3, 0); tone(660, 0.1, 0.3, 0.12); tone(880, 0.25, 0.4, 0.26) }
  function side()   { tone(770, 0.1, 0.3, 0); tone(990, 0.15, 0.35, 0.12) }
  function done()    { [0, 0.2, 0.42, 0.66].forEach((dt, i) => tone([660, 880, 1100, 1320][i], 0.25, 0.4, dt)) }
  function restEnd() { tone(660, 0.12, 0.3, 0); tone(550, 0.18, 0.35, 0.14) }

  return { tick, go, next, exdone, side, done, restEnd }
}
