import { Heart, MoreHorizontal, Play } from 'lucide-react'
import type { Track } from '../types'

const duration = (seconds = 0) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`

export function TrackRow({ track, index, active, liked, onPlay, onLike }: { track: Track; index: number; active: boolean; liked: boolean; onPlay: () => void; onLike: () => void }) {
  return <div className={`group grid grid-cols-[34px_1fr_auto] items-center gap-3 rounded-xl border px-2 py-2 transition sm:grid-cols-[40px_48px_minmax(0,1fr)_90px_44px] ${active ? 'border-red-500/20 bg-gradient-to-r from-red-600/18 to-black/80 shadow-[inset_0_0_30px_rgba(255,35,72,.06)]' : 'border-white/[.04] bg-[#08090a]/90 hover:border-red-500/15 hover:bg-[#101114]'}`}>
    <div className="hidden text-center text-xs tabular-nums text-zinc-600 sm:block">{index + 1}</div>
    <button onClick={onPlay} className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/[.06] bg-zinc-950">
      {track.artwork?.['150x150'] ? <img src={track.artwork['150x150']} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-zinc-600">♪</div>}
      <span className="absolute inset-0 grid place-items-center bg-black/55 opacity-0 transition group-hover:opacity-100"><Play size={17} fill="currentColor" /></span>
    </button>
    <button onClick={onPlay} className="min-w-0 text-left"><div className={`truncate text-sm font-medium ${active ? 'text-red-300' : 'text-zinc-100'}`}>{track.title}</div><div className="mt-0.5 truncate text-xs text-zinc-500">{track.user?.name ?? track.user?.handle ?? 'Unknown artist'}{track.genre ? ` · ${track.genre}` : ''}</div></button>
    <div className="hidden text-right text-xs tabular-nums text-zinc-600 sm:block">{duration(track.duration)}</div>
    <div className="flex items-center justify-end gap-1"><button onClick={onLike} className={`grid h-9 w-9 place-items-center rounded-full transition ${liked ? 'text-red-400' : 'text-zinc-600 hover:bg-white/[.06] hover:text-zinc-200'}`}><Heart size={15} fill={liked ? 'currentColor' : 'none'} /></button><button className="hidden h-9 w-9 place-items-center rounded-full text-zinc-600 hover:bg-white/[.06] hover:text-zinc-200 sm:grid"><MoreHorizontal size={16}/></button></div>
  </div>
}
