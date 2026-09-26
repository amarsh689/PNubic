import { Flame, Headphones, Sparkles } from 'lucide-react'
import type { Track } from '../types'
import { TrackRow } from './TrackRow'
import { Sigil } from './Sigil'

export function Home({ tracks, liked, activeId, onPlay, onLike, setSearch }: { tracks: Track[]; liked: Set<string>; activeId?: string; onPlay: (t: Track, list: Track[]) => void; onLike:(t:Track)=>void; setSearch:(q:string)=>void }) {
  const quick = ['Barbaad', 'Arijit Singh', 'Hindi love songs', 'lofi', 'phonk', 'Punjabi']
  return <div className="relative overflow-hidden px-4 pb-10 pt-6 sm:px-7 sm:pt-8">
    <div className="hero-orb -left-24 top-0"/><div className="hero-orb right-0 top-40"/>
    <div className="relative mx-auto max-w-6xl">
      <section className="glass glow relative overflow-hidden rounded-[28px] p-6 sm:p-8 lg:p-10">
        <div className="absolute right-[-50px] top-[-60px] hidden opacity-45 sm:block"><Sigil className="sigil-pulse h-[360px] w-[360px] text-red-400/20"/></div>
        <div className="relative max-w-2xl"><div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/[.06] px-3 py-1.5 text-[10px] uppercase tracking-[.25em] text-red-300"><Headphones size={13}/> private frequency</div><h1 className="mt-6 font-display text-4xl font-semibold leading-[1.03] tracking-[-.04em] sm:text-6xl">Music for the hours<br/><span className="text-red-400">nobody sees.</span></h1><p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">A personal, cinematic music shell. Search the open catalog, follow the signal, and let the queue disappear into the dark.</p><button onClick={()=>setSearch('')} className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.05] px-4 py-3 text-sm text-zinc-200 hover:bg-white/[.09]"><Sparkles size={16} className="text-red-400"/> explore the signal</button></div>
      </section>
      <section className="mt-10"><div className="flex items-center justify-between"><div><div className="flex items-center gap-2 text-[10px] uppercase tracking-[.3em] text-zinc-600"><Flame size={13} className="text-red-400"/> hot right now</div><h2 className="mt-2 font-display text-2xl font-semibold">Trending in the network</h2></div><button onClick={()=>setSearch('')} className="hidden rounded-full border border-white/[.07] px-3 py-2 text-xs text-zinc-500 hover:text-white sm:block">view all</button></div><div className="mt-4 space-y-1">{tracks.slice(0,10).map((t,i)=><TrackRow key={t.id} track={t} index={i} active={activeId===t.id} liked={liked.has(t.id)} onPlay={()=>onPlay(t,tracks)} onLike={()=>onLike(t)}/>)}</div></section>
      <section className="mt-10"><div className="text-[10px] uppercase tracking-[.3em] text-zinc-600">try a signal</div><div className="mt-4 flex flex-wrap gap-2">{quick.map(q=><button key={q} onClick={()=>setSearch(q)} className="rounded-full border border-white/[.07] bg-white/[.025] px-4 py-2.5 text-xs text-zinc-400 transition hover:border-red-500/20 hover:bg-red-500/[.05] hover:text-red-200">{q}</button>)}</div></section>
    </div>
  </div>
}
