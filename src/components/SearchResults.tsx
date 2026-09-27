import { Clock3, Search, UserRound } from 'lucide-react'
import type { Track } from '../types'
import { TrackRow } from './TrackRow'

export function SearchResults({ query, tracks, loading, liked, activeId, onPlay, onLike, recentQueries }: {
  query: string; tracks: Track[]; loading: boolean; liked: Set<string>; activeId?: string; onPlay: (t: Track, list: Track[]) => void; onLike: (t: Track) => void; recentQueries: string[]
}) {
  if (!query.trim()) return <div className="mx-auto max-w-6xl px-4 py-10 sm:px-7"><h1 className="font-display text-4xl font-semibold">What are you hearing?</h1><p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">Search like a streaming app. PNubic checks close spellings, relevant matches and popularity signals across the open music catalog.</p><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{recentQueries.map(q => <div key={q} className="glass rounded-2xl p-5"><div className="flex items-center gap-2 text-xs uppercase tracking-[.2em] text-zinc-600"><Clock3 size={13}/> recent</div><button className="mt-4 text-left text-lg font-medium text-zinc-200 hover:text-white">{q}</button></div>)}</div></div>
  return <div className="mx-auto max-w-6xl px-4 py-8 sm:px-7">
    <div className="flex items-end justify-between gap-4"><div><div className="text-xs uppercase tracking-[.3em] text-zinc-600">search results</div><h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{query}</h1></div><div className="hidden items-center gap-2 text-xs text-zinc-600 sm:flex"><Search size={14}/>{loading ? 'searching' : `${tracks.length} tracks`}</div></div>
    {loading ? <div className="mt-8 space-y-2">{Array.from({length: 8}).map((_,i)=><div key={i} className="h-[68px] animate-pulse rounded-xl bg-white/[.025]"/>)}</div> : tracks.length ? <div className="mt-7 space-y-1">{tracks.map((t, i)=><TrackRow key={t.id} track={t} index={i} active={activeId === t.id} liked={liked.has(t.id)} onPlay={() => onPlay(t, tracks)} onLike={() => onLike(t)}/>)}</div> : <div className="glass mt-8 rounded-2xl p-8 text-center"><UserRound className="mx-auto text-zinc-700" size={28}/><div className="mt-3 text-lg font-medium">Nothing close enough yet.</div><div className="mt-2 text-sm text-zinc-500">Try a song title, artist, or a shorter spelling.</div></div>}
  </div>
}
