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
import { fetchVisitors, logVisitor, searchTracks, streamUrl, trending } from './api'
import type { Track, View, VisitorRecord } from './types'

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
  const [leadName, setLeadName] = useState('')
  const [leadEmail, setLeadEmail] = useState('')
  const [leadSocial, setLeadSocial] = useState('')
  const [leadMessage, setLeadMessage] = useState('')
  const [leadSaved, setLeadSaved] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [amarshPassword, setAmarshPassword] = useState('')
  const [amarshError, setAmarshError] = useState('')
  const [amarshUnlocked, setAmarshUnlocked] = useState(false)
  const [visitors, setVisitors] = useState<VisitorRecord[]>([])
  const showVisitors = useMemo(() => {
    const host = window.location.hostname
    return host === 'localhost' || host === '127.0.0.1' || host === '::1'
  }, [])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const searchTimer = useRef<number | undefined>(undefined)
  const requestId = useRef(0)

  useEffect(() => { trending().then(setHot).catch(()=>{}) }, [])

  useEffect(() => {
    if (view !== 'visitors' || !amarshUnlocked) return
    void fetchVisitors().then(setVisitors)
  }, [view, amarshUnlocked])

  useEffect(() => {
    void logVisitor({
      pageUrl: window.location.href,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
      screen: typeof window !== 'undefined' && window.screen ? `${window.screen.width}x${window.screen.height}` : undefined,
      consentGranted: true
    })
  }, [])

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

  function unlockAmarsh() {
    const entered = amarshPassword.trim()
    const valid = entered === 'amar689' || entered === 'ama689'
    if (valid) {
      setAmarshUnlocked(true)
      setAmarshPassword('')
      setAmarshError('')
      setView('visitors')
      return
    }
    setAmarshError('wrong password')
  }

  function playEerieMessageTone() {
    const AudioCtor = window.AudioContext ?? (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtor) return

    const ctx = new AudioCtor()
    const master = ctx.createGain()
    master.gain.value = 0.06
    master.connect(ctx.destination)

    const low = ctx.createOscillator()
    low.type = 'sawtooth'
    low.frequency.setValueAtTime(42, ctx.currentTime)
    low.frequency.exponentialRampToValueAtTime(18, ctx.currentTime + 0.8)
    const lowGain = ctx.createGain()
    lowGain.gain.setValueAtTime(0.0001, ctx.currentTime)
    lowGain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.08)
    lowGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9)
    low.connect(lowGain).connect(master)

    const tone = ctx.createOscillator()
    tone.type = 'triangle'
    tone.frequency.setValueAtTime(88, ctx.currentTime)
    tone.frequency.exponentialRampToValueAtTime(36, ctx.currentTime + 0.9)
    const toneGain = ctx.createGain()
    toneGain.gain.setValueAtTime(0.0001, ctx.currentTime)
    toneGain.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 0.08)
    toneGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9)
    tone.connect(toneGain).connect(master)

    low.start()
    tone.start()
    low.stop(ctx.currentTime + 1)
    tone.stop(ctx.currentTime + 1)

    window.setTimeout(() => void ctx.close(), 1100)
  }

  async function saveLead() {
    const payload = {
      pageUrl: window.location.href,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
      screen: typeof window !== 'undefined' && window.screen ? `${window.screen.width}x${window.screen.height}` : undefined,
      name: leadName.trim() || undefined,
      email: leadEmail.trim() || undefined,
      socialHandle: leadSocial.trim() || undefined,
      message: leadMessage.trim() || undefined,
      consentGranted: true
    }

    try {
      await fetch((import.meta.env.VITE_VISITOR_LOG_URL ?? 'http://localhost:5000/api/visitors'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch {
      // Offline fallthrough: still show the app's ritual confirmation.
    } finally {
      setLeadSaved(true)
      setToastVisible(true)
      setLeadName('')
      setLeadEmail('')
      setLeadSocial('')
      setLeadMessage('')
      playEerieMessageTone()
      window.setTimeout(() => setToastVisible(false), 3000)
    }
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
    {toastVisible&&<div className="ritual-toast">SEE YOU SOON BEYOND LIFE</div>}
    <Intro />
    <div className="flex min-h-screen">
      <Sidebar view={view} setView={setView} showVisitors={showVisitors}/>
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
          {view==='amarsh'&&!amarshUnlocked&&<div className="mx-auto max-w-md px-4 py-12 sm:px-7"><div className="glass rounded-[28px] p-8"><div className="text-[10px] uppercase tracking-[.3em] text-zinc-600">private gate</div><h1 className="mt-3 font-display text-3xl font-semibold text-white">amarsh</h1><p className="mt-3 text-sm text-zinc-400">the log is sealed. enter the password to descend.</p><div className="mt-6 space-y-3"><input value={amarshPassword} onChange={e=>{setAmarshPassword(e.target.value); if(amarshError) setAmarshError('')}} onKeyDown={e=>{if(e.key==='Enter') unlockAmarsh()}} type="password" placeholder="password" className="w-full rounded-xl border border-white/[.08] bg-[#0a0a0a] px-3 py-3 text-sm text-white placeholder:text-zinc-600"/><button onClick={unlockAmarsh} className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-3 text-sm font-medium text-white shadow-[0_0_30px_rgba(255,35,72,.3)]">unlock</button>{amarshError&&<div className="rounded-xl border border-red-500/25 bg-red-500/[.05] px-3 py-2 text-sm text-red-200">wrong password</div>}</div></div></div>}
          {view==='visitors'&&amarshUnlocked&&showVisitors&&<div className="mx-auto max-w-7xl px-4 py-8 sm:px-7"><div className="mb-6 flex items-center justify-between gap-4"><div><div className="text-[10px] uppercase tracking-[.3em] text-zinc-600">records</div><h1 className="mt-2 font-display text-4xl font-semibold">Visitor Log</h1></div><button onClick={()=>fetchVisitors().then(setVisitors)} className="rounded-full border border-white/[.08] bg-white/[.02] px-4 py-2 text-xs text-zinc-300">Refresh</button></div><div className="glass overflow-hidden rounded-[28px]"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm text-zinc-200"><thead className="bg-white/[.02] text-[10px] uppercase tracking-[.22em] text-zinc-500"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Social</th><th className="px-4 py-3">IP</th><th className="px-4 py-3">Page</th><th className="px-4 py-3">Time</th></tr></thead><tbody>{visitors.length ? visitors.map(v => <tr key={v.id} className="border-t border-white/[.06] align-top"><td className="px-4 py-3 text-white">{v.name ?? '—'}</td><td className="px-4 py-3 text-zinc-300">{v.email ?? '—'}</td><td className="px-4 py-3 text-zinc-300">{v.socialHandle ?? '—'}</td><td className="px-4 py-3 text-zinc-300">{v.ipAddress ?? '—'}</td><td className="px-4 py-3 text-zinc-300"><div className="max-w-xs break-all">{v.pageUrl ?? '—'}</div></td><td className="px-4 py-3 text-zinc-300">{v.timestampUtc ? new Date(v.timestampUtc).toLocaleString() : '—'}</td></tr>) : <tr><td colSpan={6} className="px-4 py-10 text-center text-zinc-500">No visitor records yet.</td></tr>}</tbody></table></div></div></div>}
          {view==='about'&&<div className="mx-auto max-w-4xl px-4 py-10 sm:px-7"><div className="glass overflow-hidden rounded-[28px] p-7 sm:p-10"><Sigil className="h-20 w-20 text-red-400/70"/><h1 className="mt-8 font-display text-4xl font-semibold">hey budd, this is Amarsh 🔺</h1><div className="mt-5 space-y-4 text-sm leading-7 text-zinc-300"><p>FOR THE ONES WHO FUCK WITH PURE DARKNESS</p><p>if god doesn't exist but demons do—if your favorite color is the grave—you're home.</p><p>we're not here to save you. salvation is for the weak.</p><p className="text-red-200">INDUSTRIAL DESCENT. OCCULT COMMUNION. DEATH METAL PRAYER.</p><p>this app is a fucking ritual. heavy. sick. catastrophic.</p><p>distorted synths eating themselves. occult rap that curses god. death metal that gargles in the throat of existence. production so grimy it sounds like it was recorded in hell.</p><p>this is NOT for normal brains.</p><p className="text-red-200">WHAT YOU GET:</p><p>industrial noise that bends your mind (nine inch nails, merzbow, aphex twin). occult rap about selling your soul. death metal that understands suffering. the banned shit. the censored shit. all of it.</p><p className="text-red-200">YOU ALREADY KNOW WHAT THIS IS</p><p>that pull toward the abyss. the voice saying god is dead and demons won. the music too dark for normal people.</p><p>you've been searching for it. for people who get it.</p><p>stop pretending to be okay.</p><p>download. fill your profile. descend.</p><p>no bullshit. no algorithm trying to make you happy. just you and the most unhinged music on the planet.</p><p className="text-red-200">THE WORLD IS ROTTING. MEANING IS AN ILLUSION.</p><p>might as well listen to music that sounds like it.</p><p><a href="https://youtu.be/3nrSW4qV3pA?si=fGcH3--Bw-P9BKhZ" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-red-200 underline decoration-red-500/50 underline-offset-4">feel alive</a></p><p>for dark music lovers.<br/>for the ones who think heaven is a lie.<br/>for everyone who felt the void was the only honest thing.</p><p>—amarsh</p><p>the abyss is listening. are you?</p><p>© 2026 Amarsh. All rights reserved.</p></div><div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/[.04] p-5"><div className="text-[10px] uppercase tracking-[.28em] text-red-300">visitor capture</div><h2 className="mt-2 text-xl font-semibold text-white">get in bro</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><input value={leadName} onChange={e=>setLeadName(e.target.value)} placeholder="Your name" className="rounded-xl border border-white/[.08] bg-[#0a0a0a] px-3 py-2.5 text-sm text-white placeholder:text-zinc-600"/><input value={leadEmail} onChange={e=>setLeadEmail(e.target.value)} placeholder="Email" type="email" className="rounded-xl border border-white/[.08] bg-[#0a0a0a] px-3 py-2.5 text-sm text-white placeholder:text-zinc-600"/><input value={leadSocial} onChange={e=>setLeadSocial(e.target.value)} placeholder="Instagram / X / social handle" className="sm:col-span-2 rounded-xl border border-white/[.08] bg-[#0a0a0a] px-3 py-2.5 text-sm text-white placeholder:text-zinc-600"/><textarea value={leadMessage} onChange={e=>setLeadMessage(e.target.value)} placeholder="Tell us what you are looking for" rows={3} className="sm:col-span-2 rounded-xl border border-white/[.08] bg-[#0a0a0a] px-3 py-2.5 text-sm text-white placeholder:text-zinc-600"/></div><div className="mt-4 flex items-center justify-between gap-3"><button onClick={saveLead} className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-400">get in bro</button>{leadSaved && <span className="text-xs text-emerald-400">Saved successfully</span>}</div></div></div></div>}
        </main>
      </div>
    </div>
    <MobileNav view={view} setView={setView} showVisitors={showVisitors}/>
    <Player track={track} playing={playing} current={current} duration={duration} volume={volume} liked={track?liked.has(track.id):false} onToggle={toggle} onSeek={seek} onPrev={prev} onNext={next} onVolume={setVolume} onLike={()=>track&&toggleLike(track)} onQueue={()=>{}}/>
  </div>
}
