import { useEffect, useMemo, useRef, useState } from 'react'
import { Menu, Search, X } from 'lucide-react'
import { Home } from './components/Home'
import { Intro } from './components/Intro'
import { MobileNav, Sidebar } from './components/Sidebar'
import { Player } from './components/Player'
import { SearchResults } from './components/SearchResults'
import { Sigil } from './components/Sigil'
import { TrackRow } from './components/TrackRow'
import { registerMediaActions, setMediaSession } from './audio'
import { searchTracks, streamUrl, trending } from './api'
import type { Track, View } from './types'

const read = <T,>(key: string, fallback: T): T => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback } }
const write = (key: string, value: unknown) => { try { localStorage.setItem(key, JSON.stringify(value)) } catch {} }

export default function App() {
  const [view, setView] = useState<View>('home')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<Track[]>([])
  const [hot, setHot] = useState<Track[]>([])
  const [track, setTrack] = useState<Track>()
  const [queue, setQueue] = useState<Track[]>([])
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(.85)
  const [liked, setLiked] = useState<Set<string>>(new Set(read<string[]>('pnubic-likes', [])))
  const [recentQueries, setRecentQueries] = useState<string[]>(read<string[]>('pnubic-queries', []))
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const searchTimer = useRef<number | undefined>(undefined)
  const requestId = useRef(0)

  useEffect(() => { trending().then(setHot).catch(()=>{}) }, [])

  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audio.volume = volume
    audioRef.current = audio
    const onTime = () => setCurrent(audio.currentTime)
    const onLoaded = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    const onEnded = () => next()
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    audio.addEventListener('timeupdate', onTime); audio.addEventListener('loadedmetadata', onLoaded); audio.addEventListener('ended', onEnded); audio.addEventListener('play', onPlay); audio.addEventListener('pause', onPause)
    registerMediaActions({ onPlay:()=>audio.play().catch(()=>{}), onPause:()=>audio.pause(), onNext:next, onPrevious:prev, onSeek:(s)=>{audio.currentTime=s} })
    return () => { audio.pause(); audio.removeEventListener('timeupdate', onTime); audio.removeEventListener('loadedmetadata', onLoaded); audio.removeEventListener('ended', onEnded); audio.removeEventListener('play', onPlay); audio.removeEventListener('pause', onPause) }
  }, [])

  useEffect(()=>{ if(audioRef.current) audioRef.current.volume=volume },[volume])

  useEffect(() => {
    window.clearTimeout(searchTimer.current)
    const q = query.trim()
    if (!q) { setResults([]); setSearching(false); return }
    setView('search')
    setSearching(true)
    const id = ++requestId.current
    searchTimer.current = window.setTimeout(async () => {
      try { const data = await searchTracks(q); if (id === requestId.current) setResults(data) }
      finally { if (id === requestId.current) setSearching(false) }
    }, 280)
  }, [query])

  function rememberQuery(q: string) {
    if (!q.trim()) return
    const next = [q.trim(), ...recentQueries.filter(x=>x.toLowerCase()!==q.trim().toLowerCase())].slice(0,8)
    setRecentQueries(next); write('pnubic-queries',next)
  }

  async function playTrack(t: Track, list: Track[]) {
    const audio = audioRef.current; if (!audio) return
    setTrack(t); setQueue(list)
    setCurrent(0)
    const url = await streamUrl(t.id)
    audio.src = url
    setMediaSession(t)
    try { await audio.play(); setPlaying(true) } catch { setPlaying(false) }
    rememberQuery(query)
    const history = read<Track[]>('pnubic-history', [])
    write('pnubic-history', [t, ...history.filter(x=>x.id!==t.id)].slice(0,30))
  }

  function toggle() { const a=audioRef.current; if(!a) return; if(a.paused) a.play().catch(()=>{}); else a.pause() }
  function next() { if(!queue.length) return; const i=queue.findIndex(t=>t.id===track?.id); const n=queue[(i+1)%queue.length]; if(n) playTrack(n,queue) }
  function prev() { if(!queue.length) return; const i=queue.findIndex(t=>t.id===track?.id); const n=queue[(i-1+queue.length)%queue.length]; if(n) playTrack(n,queue) }
  function seek(v:number) { if(audioRef.current) { audioRef.current.currentTime=v; setCurrent(v) } }
  function toggleLike(t: Track) { const copy=new Set(liked); copy.has(t.id)?copy.delete(t.id):copy.add(t.id); setLiked(copy); write('pnubic-likes',[...copy]) }

  const library = useMemo(()=>read<Track[]>('pnubic-history',[]),[track])
  const activeList = view==='search' ? results : hot

  return <div className="noise min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,35,72,.04),transparent_28%),#050505] pb-28">
    <Intro />
    <div className="flex min-h-screen">
      <Sidebar view={view} setView={setView}/>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-white/[.06] bg-[#050505]/75 backdrop-blur-2xl">
          <div className="mx-auto flex h-[76px] max-w-[1500px] items-center gap-3 px-4 sm:px-7">
            <button onClick={()=>setMobileMenu(x=>!x)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/[.06] text-zinc-500 lg:hidden">{mobileMenu?<X size={18}/>:<Menu size={18}/>}</button>
            <div className="relative flex max-w-2xl flex-1"><Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')rememberQuery(query)}} placeholder="What do you want to hear?" className="search-focus w-full rounded-2xl border border-white/[.07] bg-white/[.025] py-3 pl-11 pr-10 text-sm text-white outline-none placeholder:text-zinc-600"/>{query&&<button onClick={()=>setQuery('')} className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-white/[.06] text-zinc-500 hover:text-white"><X size={14}/></button>}</div>
            <div className="hidden items-center gap-2 lg:flex"><div className="mr-2 hidden items-center gap-1.5 text-[10px] uppercase tracking-[.22em] text-zinc-600 xl:flex"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500"/> live signal</div><button onClick={()=>setView('about')} className="rounded-full border border-white/[.07] px-4 py-2 text-xs text-zinc-500 hover:text-white">about</button></div>
          </div>
          {mobileMenu&&<div className="border-t border-white/[.06] px-4 py-3 lg:hidden"><button onClick={()=>{setView('home');setMobileMenu(false)}} className="mr-2 rounded-full bg-white/[.05] px-4 py-2 text-xs">Home</button><button onClick={()=>{setView('library');setMobileMenu(false)}} className="rounded-full bg-white/[.05] px-4 py-2 text-xs">My Library</button></div>}
        </header>
        <main>
          {view==='home'&&<Home tracks={hot} liked={liked} activeId={track?.id} onPlay={playTrack} onLike={toggleLike} setSearch={q=>{setQuery(q);setView('search')}}/>}
          {view==='search'&&<SearchResults query={query} tracks={results} loading={searching} liked={liked} activeId={track?.id} onPlay={playTrack} onLike={toggleLike} recentQueries={recentQueries}/>} 
          {view==='library'&&<div className="mx-auto max-w-6xl px-4 py-8 sm:px-7"><div className="text-[10px] uppercase tracking-[.3em] text-zinc-600">your space</div><h1 className="mt-2 font-display text-4xl font-semibold">My Library</h1><p className="mt-2 text-sm text-zinc-500">Local listening history and likes. Nothing is uploaded anywhere.</p><div className="mt-7 space-y-1">{library.length?library.map((t,i)=><TrackRow key={t.id} track={t} index={i} active={track?.id===t.id} liked={liked.has(t.id)} onPlay={()=>playTrack(t,library)} onLike={()=>toggleLike(t)}/>):<div className="glass rounded-2xl p-10 text-center text-sm text-zinc-600">Your listening history will appear here.</div>}</div></div>}
          {view==='about'&&<div className="mx-auto max-w-4xl px-4 py-10 sm:px-7"><div className="glass overflow-hidden rounded-[28px] p-7 sm:p-10"><Sigil className="h-20 w-20 text-red-400/70"/><h1 className="mt-8 font-display text-4xl font-semibold">PNubic</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">A personal, dark music interface built with React + TypeScript + Tailwind and streamed from Audius. Search is deliberately broader than a single exact-match request: close spellings and multiple relevance signals are merged before the UI renders results.</p><div className="mt-8 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-white/[.06] bg-white/[.025] p-4"><div className="text-xs uppercase tracking-[.2em] text-zinc-600">stack</div><div className="mt-2 text-sm">React · TypeScript · Tailwind</div></div><div className="rounded-2xl border border-white/[.06] bg-white/[.025] p-4"><div className="text-xs uppercase tracking-[.2em] text-zinc-600">audio</div><div className="mt-2 text-sm">HTML5 Audio · Media Session</div></div><div className="rounded-2xl border border-white/[.06] bg-white/[.025] p-4"><div className="text-xs uppercase tracking-[.2em] text-zinc-600">source</div><div className="mt-2 text-sm">Audius open music catalog</div></div></div></div></div>}
        </main>
      </div>
    </div>
    <MobileNav view={view} setView={setView}/>
    <Player track={track} playing={playing} current={current} duration={duration} volume={volume} liked={track?liked.has(track.id):false} onToggle={toggle} onSeek={seek} onPrev={prev} onNext={next} onVolume={setVolume} onLike={()=>track&&toggleLike(track)} onQueue={()=>{}}/>
  </div>
}
