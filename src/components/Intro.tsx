import { useEffect, useState } from 'react'
import { playEntranceDrop } from '../audio'

export function Intro() {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const started = sessionStorage.getItem('pnubic-intro')
    if (started) {
      setVisible(false)
      return
    }
    sessionStorage.setItem('pnubic-intro', '1')
    const timer = window.setTimeout(() => setVisible(false), 2000)
    window.setTimeout(playEntranceDrop, 120)
    return () => window.clearTimeout(timer)
  }, [])
  if (!visible) return null
  return (
    <div className="intro fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#040404]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(122,8,24,.3),transparent_36%),radial-gradient(circle_at_50%_55%,rgba(255,35,72,.08),transparent_50%)]" />
      <div className="scanline absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#ff2348] to-transparent blur-sm" />
      <div className="relative grid place-items-center">
        <svg className="sigil-spin absolute h-80 w-80 opacity-15" viewBox="0 0 400 400" fill="none">
          <circle cx="200" cy="200" r="175" stroke="#ff2348" strokeWidth="1" strokeDasharray="3 11" />
          <circle cx="200" cy="200" r="152" stroke="#7a0818" strokeWidth="1" strokeDasharray="1 16" />
          <path d="M200 35L355 320H45L200 35Z" stroke="#ff2348" strokeWidth="2" />
          <path d="M200 95L285 250H115L200 95Z" stroke="#7a0818" strokeWidth="2" />
        </svg>
        <img src="./PNubic-logo.svg" alt="PNubic" className="relative h-28 w-28 drop-shadow-[0_0_35px_rgba(255,35,72,.45)]" />
        <div className="mt-8 text-center">
          <div className="font-display text-4xl font-semibold tracking-[.32em] text-white">PNUBIC</div>
          <div className="mt-2 text-[10px] uppercase tracking-[.45em] text-red-400/70">enter the sound</div>
        </div>
      </div>
    </div>
  )
}
export default Intro