import { ChevronDown, Heart, ListMusic, Pause, Play, Repeat2, Shuffle, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import type { Track } from '../types'

const fmt = (v=0) => `${Math.floor(v/60)}:${String(Math.floor(v%60)).padStart(2,'0')}`

export function Player({ track, playing, current, duration, volume, liked, onToggle, onSeek, onPrev, onNext, onVolume, onLike, onQueue }: {
  track?: Track; playing: boolean; current: number; duration: number; volume: number; liked: boolean; onToggle: () => void; onSeek: (v: number) => void; onPrev: () => void; onNext: () => void; onVolume: (v:number) => void; onLike: () => void; onQueue: () => void
}) {
  if (!track) return <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[.06] bg-black/80 px-4 py-4 backdrop-blur-xl"><div className="mx-auto max-w-6xl text-center text-xs uppercase tracking-[.3em] text-zinc-600">select a track to enter the sound</div></div>
  return <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[.07] bg-[#070709]/92 px-3 py-3 backdrop-blur-2xl sm:px-5 sm:py-4">
    <div className="mx-auto max-w-[1500px]">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-900 sm:h-14 sm:w-14">{track.artwork?.['150x150'] && <img src={track.artwork['150x150']} alt="" className="h-full w-full object-cover"/>}</div>
        <div className="min-w-0 flex-1 sm:max-w-xs"><div className="truncate text-sm font-medium">{track.title}</div><div className="truncate text-xs text-zinc-500">{track.user?.name ?? 'Unknown artist'}</div></div>
        <div className="hidden items-center gap-2 sm:flex"><button onClick={onLike} className={`grid h-9 w-9 place-items-center rounded-full ${liked ? 'text-red-400' : 'text-zinc-500 hover:text-white'}`}><Heart size={16} fill={liked ? 'currentColor' : 'none'}/></button><button className="grid h-9 w-9 place-items-center rounded-full text-zinc-500 hover:text-white"><Shuffle size={16}/></button><button onClick={onPrev} className="grid h-9 w-9 place-items-center rounded-full text-zinc-300 hover:text-white"><SkipBack size={18} fill="currentColor"/></button><button onClick={onToggle} className="grid h-11 w-11 place-items-center rounded-full bg-white text-black transition hover:scale-105">{playing ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor"/>}</button><button onClick={onNext} className="grid h-9 w-9 place-items-center rounded-full text-zinc-300 hover:text-white"><SkipForward size={18} fill="currentColor"/></button><button className="grid h-9 w-9 place-items-center rounded-full text-zinc-500 hover:text-white"><Repeat2 size={16}/></button></div>
        <div className="ml-auto hidden items-center gap-2 sm:flex"><button onClick={onVolume.bind(null, volume > 0 ? 0 : .85)} className="text-zinc-500">{volume > 0 ? <Volume2 size={17}/> : <VolumeX size={17}/>}</button><input aria-label="volume" type="range" min="0" max="1" step=".01" value={volume} onChange={e=>onVolume(Number(e.target.value))} className="accent-red-500 w-24"/><button onClick={onQueue} className="text-zinc-500 hover:text-white"><ListMusic size={18}/></button></div>
        <button onClick={onToggle} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-black sm:hidden">{playing ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor"/>}</button>
      </div>
      <div className="mt-3 grid grid-cols-[38px_1fr_38px] items-center gap-2 text-[10px] tabular-nums text-zinc-600"><span>{fmt(current)}</span><input aria-label="seek" type="range" min="0" max={duration || 1} step=".1" value={Math.min(current,duration||1)} onChange={e=>onSeek(Number(e.target.value))} className="accent-red-500"/><span className="text-right">{fmt(duration)}</span></div>
    </div>
  </footer>
}

export function PlayerMiniControls({ playing, onToggle }: { playing: boolean; onToggle:()=>void }) { return <button onClick={onToggle} className="grid h-9 w-9 place-items-center rounded-full bg-white text-black">{playing?<Pause size={15} fill="currentColor"/>:<Play size={15} fill="currentColor"/>}</button> }
export function MobileChevron({ onClick }: { onClick:()=>void }) { return <button onClick={onClick} className="grid h-9 w-9 place-items-center text-zinc-500"><ChevronDown size={18}/></button> }
