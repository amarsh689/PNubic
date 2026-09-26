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

export type View = 'home' | 'search' | 'library' | 'about'
