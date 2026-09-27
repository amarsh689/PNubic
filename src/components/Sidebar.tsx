import { Compass, Disc3, KeyRound, Library, Radio, Sparkles } from 'lucide-react'
import type { View } from '../types'
import { Sigil } from './Sigil'

export function Sidebar({ view, setView, showVisitors = false }: { view: View; setView: (v: View) => void; showVisitors?: boolean }) {
  const item = (v: View, label: string, Icon: typeof Compass) => (
    <button onClick={() => setView(v)} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${view === v ? 'bg-white/[.06] text-white' : 'text-zinc-400 hover:bg-white/[.035] hover:text-white'}`}>
      <Icon size={18} className={view === v ? 'text-red-400' : 'text-zinc-500 group-hover:text-red-400'} />
      <span>{label}</span>
      {view === v && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(255,35,72,.8)]" />}
    </button>
  )
  return (
    <aside className="hidden w-[248px] shrink-0 border-r border-white/[.06] bg-black/20 lg:block">
      <div className="flex h-full flex-col px-5 py-6">
        <button onClick={() => setView('home')} className="flex items-center gap-3 px-2 pb-8 text-left">
          <div className="relative grid h-10 w-10 place-items-center rounded-xl border border-red-500/20 bg-red-950/20 text-red-400"><Sigil className="h-8 w-8" /></div>
          <div><div className="font-display text-lg font-semibold tracking-[.15em]">PNUBIC</div><div className="text-[9px] uppercase tracking-[.3em] text-zinc-600">private listening system</div></div>
        </button>
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[10px] uppercase tracking-[.3em] text-zinc-600">discover</div>
          {item('home', 'Home', Compass)}
          {item('search', 'Search', Radio)}
        </div>
        <div className="mt-7 space-y-1">
          <div className="px-3 pb-2 text-[10px] uppercase tracking-[.3em] text-zinc-600">your space</div>
          {item('library', 'My Library', Library)}
          <button onClick={() => setView('amarsh')} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${view === 'amarsh' ? 'bg-white/[.06] text-white' : 'text-zinc-400 hover:bg-white/[.035] hover:text-white'}`}>
            <div className={`grid h-8 w-8 place-items-center rounded-lg border ${view === 'amarsh' ? 'border-red-500/30 bg-red-950/30 text-red-400' : 'border-white/[.08] bg-black/20 text-zinc-500 group-hover:border-red-500/20 group-hover:text-red-400'}`}>
              <Sigil className="h-4 w-4" />
            </div>
            <span className="sr-only">amarsh</span>
          </button>
        </div>
        <div className="mt-auto rounded-2xl border border-white/[.06] bg-white/[.02] p-4">
          <div className="flex items-start gap-3"><Sparkles size={16} className="mt-0.5 text-red-400" /><div><div className="text-sm font-medium">Night mode</div><div className="mt-1 text-xs leading-5 text-zinc-500">A darker, quieter shell built for headphones.</div></div></div>
        </div>
      </div>
    </aside>
  )
}

export function MobileNav({ view, setView, showVisitors = false }: { view: View; setView: (v: View) => void; showVisitors?: boolean }) {
  const items: Array<[View, string, typeof Compass]> = [
    ['home', 'Home', Compass], ['search', 'Search', Radio], ['library', 'Library', Library], ['about', 'About', Disc3], ['amarsh', ' ', KeyRound]
  ]

  return <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[.06] bg-[#070709]/90 px-2 py-2 backdrop-blur-xl lg:hidden">
    <div className="mx-auto grid max-w-md grid-cols-5">
      {items.map(([v, label, Icon]) => v === 'amarsh' ? <button key={v as string} onClick={() => setView(v as View)} className={`flex flex-col items-center gap-1 py-2 text-[10px] ${view === v ? 'text-red-400' : 'text-zinc-500'}`}><div className={`grid h-7 w-7 place-items-center rounded-lg border ${view === v ? 'border-red-500/30 bg-red-950/30 text-red-400' : 'border-white/[.08] bg-black/20 text-zinc-500'}`}><Sigil className="h-4 w-4" /></div><span className="sr-only">amarsh</span></button> : <button key={v as string} onClick={() => setView(v as View)} className={`flex flex-col items-center gap-1 py-2 text-[10px] ${view === v ? 'text-red-400' : 'text-zinc-500'}`}><Icon size={18}/><span>{label as string}</span></button>)}
    </div>
  </nav>
}
