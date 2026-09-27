import type { Track, VisitorRecord } from './types'

const API_BASE = 'https://api.audius.co/v1'
const apiKey = (import.meta.env.VITE_AUDIUS_API_KEY ?? '').trim()
const visitorLogUrl = (import.meta.env.VITE_VISITOR_LOG_URL ?? '').trim()
const defaultVisitorApi = 'http://localhost:5000/api/visitors'
const demoVisitorKey = 'pnubic-demo-visitors'

const headers: HeadersInit = apiKey ? { 'x-api-key': apiKey } : {}

export const readDemoVisitors = (): VisitorRecord[] => {
  try {
    const raw = localStorage.getItem(demoVisitorKey)
    return raw ? JSON.parse(raw) as VisitorRecord[] : []
  } catch {
    return []
  }
}

export const writeDemoVisitors = (records: VisitorRecord[]) => {
  try {
    localStorage.setItem(demoVisitorKey, JSON.stringify(records))
  } catch {}
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers })
  if (!res.ok) throw new Error(`Audius request failed: ${res.status}`)
  const json = await res.json()
  return json.data as T
}

export async function logVisitor(data: {
  pageUrl?: string
  referrer?: string
  userAgent?: string
  language?: string
  timezone?: string
  screen?: string
  name?: string
  email?: string
  phoneNumber?: string
  socialHandle?: string
  consentGranted?: boolean
}) {
  const url = visitorLogUrl || defaultVisitorApi

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'omit'
    })
    if (!res.ok) throw new Error('visitor log rejected')
    return true
  } catch {
    const demoRecord: VisitorRecord = {
      id: Date.now(),
      timestampUtc: new Date().toISOString(),
      pageUrl: data.pageUrl ?? null,
      referrer: data.referrer ?? null,
      userAgent: data.userAgent ?? null,
      language: data.language ?? null,
      timezone: data.timezone ?? null,
      screen: data.screen ?? null,
      name: data.name ?? null,
      email: data.email ?? null,
      phoneNumber: data.phoneNumber ?? null,
      socialHandle: data.socialHandle ?? null,
      consentGranted: data.consentGranted ?? true
    }
    const current = readDemoVisitors()
    writeDemoVisitors([demoRecord, ...current].slice(0, 100))
    return true
  }
}

export async function fetchVisitors(): Promise<VisitorRecord[]> {
  try {
    const res = await fetch(visitorLogUrl || defaultVisitorApi, { credentials: 'omit' })
    if (!res.ok) {
      return readDemoVisitors()
    }
    const json = await res.json() as { records?: VisitorRecord[] }
    const records = json.records ?? []
    if (records.length > 0) return records
    return readDemoVisitors()
  } catch {
    return readDemoVisitors()
  }
}

const normalize = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ')

function variants(query: string) {
  const q = normalize(query)
  const out = new Set([q])
  if (q.includes('barbad')) out.add(q.replaceAll('barbad', 'barbaad'))
  if (q.includes('baad')) out.add(q.replaceAll('baad', 'bad'))
  if (q.length >= 5) out.add(q.replace(/[aeiou]/g, ''))
  return [...out].filter(Boolean).slice(0, 4)
}

function score(track: Track, query: string) {
  const q = normalize(query)
  const title = normalize(track.title)
  const artist = normalize(track.user?.name ?? track.user?.handle ?? '')
  const hay = `${title} ${artist}`
  let s = 0
  if (title === q) s += 1000
  if (title.startsWith(q)) s += 500
  if (title.includes(q)) s += 300
  if (artist.startsWith(q)) s += 260
  if (artist.includes(q)) s += 180
  if (hay.includes(q)) s += 120
  if (track.streamable !== false) s += 20
  s += Math.min((track.playCount ?? 0) / 1000, 100)
  s += Math.min((track.repostCount ?? 0) / 100, 50)
  return s
}

export async function trending(): Promise<Track[]> {
  return get<Track[]>('/tracks/trending?time=week&limit=24')
}

export async function searchTracks(query: string): Promise<Track[]> {
  const qs = variants(query)
  const results = await Promise.all(qs.map(q =>
    get<Track[]>(`/tracks/search?query=${encodeURIComponent(q)}&sortMethod=relevant&limit=30`).catch(() => [])
  ))
  const byId = new Map<string, Track>()
  for (const group of results) for (const track of group) byId.set(track.id, track)
  return [...byId.values()].sort((a, b) => score(b, query) - score(a, query)).slice(0, 50)
}

export async function searchByGenre(genre: string): Promise<Track[]> {
  return get<Track[]>(`/tracks/trending?genre=${encodeURIComponent(genre)}&time=month&limit=24`).catch(() => [])
}

export async function streamUrl(trackId: string): Promise<string> {
  const prefix = `${API_BASE}/tracks/${encodeURIComponent(trackId)}/stream`
  return apiKey ? `${prefix}?app_name=PNubic&api_key=${encodeURIComponent(apiKey)}` : prefix
}
