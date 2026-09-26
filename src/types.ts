export type Track = {
  id: string
  title: string
  user?: { name?: string; handle?: string }
  artwork?: { '150x150'?: string; '480x480'?: string; '1000x1000'?: string }
  duration?: number
  genre?: string
  mood?: string
  playCount?: number
  repostCount?: number
  permalink?: string
  streamable?: boolean
}

export type View = 'home' | 'search' | 'library' | 'about' | 'visitors'

export type VisitorRecord = {
  id: number
  timestampUtc?: string | null
  pageUrl?: string | null
  referrer?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  language?: string | null
  timezone?: string | null
  screen?: string | null
  name?: string | null
  email?: string | null
  socialHandle?: string | null
  consentGranted?: boolean
}
