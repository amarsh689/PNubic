import type { Track } from './types'

export function setMediaSession(track: Track) {
  if (!('mediaSession' in navigator)) return
  const ms = navigator.mediaSession
  try {
    ms.metadata = new MediaMetadata({
      title: track.title,
      artist: track.user?.name ?? 'Unknown artist',
      album: 'PNubic',
      artwork: track.artwork?.['480x480'] ? [{ src: track.artwork['480x480'], sizes: '480x480', type: 'image/jpeg' }] : undefined
    })
  } catch {}
}

export function registerMediaActions(actions: {
  onPlay: () => void
  onPause: () => void
  onNext: () => void
  onPrevious: () => void
  onSeek: (seconds: number) => void
}) {
  if (!('mediaSession' in navigator)) return
  const ms = navigator.mediaSession
  const safe = (name: MediaSessionAction, fn: MediaSessionActionHandler) => {
    try { ms.setActionHandler(name, fn) } catch {}
  }
  safe('play', actions.onPlay)
  safe('pause', actions.onPause)
  safe('nexttrack', actions.onNext)
  safe('previoustrack', actions.onPrevious)
  safe('seekto', (details) => {
    if (typeof details.seekTime === 'number') actions.onSeek(details.seekTime)
  })
}

export function playEntranceDrop() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const master = ctx.createGain()
    master.gain.value = 0.7
    master.connect(ctx.destination)

    const rumble = ctx.createOscillator()
    const rumbleGain = ctx.createGain()
    rumble.type = 'sawtooth'
    rumble.frequency.setValueAtTime(62, ctx.currentTime)
    rumble.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + 1.3)
    rumbleGain.gain.setValueAtTime(0.0001, ctx.currentTime)
    rumbleGain.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.05)
    rumbleGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8)
    rumble.connect(rumbleGain).connect(master)

    const screech = ctx.createOscillator()
    const screechGain = ctx.createGain()
    screech.type = 'triangle'
    screech.frequency.setValueAtTime(170, ctx.currentTime)
    screech.frequency.exponentialRampToValueAtTime(54, ctx.currentTime + 0.9)
    screechGain.gain.setValueAtTime(0.0001, ctx.currentTime)
    screechGain.gain.exponentialRampToValueAtTime(0.32, ctx.currentTime + 0.05)
    screechGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.25)
    screech.connect(screechGain).connect(master)

    const sub = ctx.createOscillator()
    const subGain = ctx.createGain()
    sub.type = 'sine'
    sub.frequency.setValueAtTime(44, ctx.currentTime)
    sub.frequency.exponentialRampToValueAtTime(18, ctx.currentTime + 1.2)
    subGain.gain.setValueAtTime(0.0001, ctx.currentTime)
    subGain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.06)
    subGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.65)
    sub.connect(subGain).connect(master)

    const now = ctx.currentTime
    rumble.start(now)
    screech.start(now)
    sub.start(now)
    rumble.stop(now + 1.9)
    screech.stop(now + 1.35)
    sub.stop(now + 1.7)
    window.setTimeout(() => ctx.close().catch(() => {}), 2200)
  } catch {}
}
