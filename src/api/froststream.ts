import axios from 'axios'
import tmdbApi from './tmdb'

const BASE = 'https://froststream.cloutteam.com'

export interface StreamSource {
  url: string
  quality: string
  provider: string
  language?: string
  headers?: Record<string, string>
}

interface FrostStreamRaw {
  name?: string
  title?: string
  url: string
  headers?: Record<string, string>
}

const streamCache = new Map<string, StreamSource[]>()

export async function getImdbId(categoryType: 'movie' | 'tv', tmdbId: number): Promise<string | null> {
  try {
    const res = await tmdbApi.get(`/${categoryType}/${tmdbId}/external_ids`)
    return res.data?.imdb_id || null
  } catch {
    return null
  }
}

function extractProvider(title: string): string {
  for (const raw of title.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    if (/^[🎬🥏🌎]/u.test(line)) continue
    const clean = line.replace(/^[^\p{L}\p{N}]+/u, '').trim()
    if (clean) return clean
  }
  return 'Fonte'
}

function extractLanguage(title: string): string | undefined {
  for (const raw of title.split('\n')) {
    const line = raw.trim()
    if (line.startsWith('🌎')) {
      return line.replace(/^[^\p{L}\p{N}]+/u, '').trim() || undefined
    }
  }
  return undefined
}

// Prioriza fontes que funcionam no navegador:
// https > http (mixed content bloqueia em deploy https)
// sem headers custom > com headers (browser nao consegue enviar Referer custom)
// mp4 > mkv (mkv nao toca no Firefox)
function scoreSource(s: StreamSource): number {
  let n = 0
  if (s.url.startsWith('https:')) n += 4
  if (!s.headers || Object.keys(s.headers).length === 0) n += 2
  if (/\.mp4(\?|$)/i.test(s.url)) n += 2
  else if (/\.mkv(\?|$)/i.test(s.url)) n -= 1
  return n
}

// Busca o JSON de streams em cascata:
// 1. Proxy serverless na propria Vercel (sem CORS, com retry interno)
// 2. Chamada direta (funciona se a API liberar CORS)
// 3. Em dev: proxy publico de CORS
async function fetchStreamsJson(path: string): Promise<any> {
  const candidates = [
    `/api/froststream?path=${encodeURIComponent(path)}`,
    `${BASE}/${path}`,
  ]
  if (import.meta.env.DEV) {
    candidates.push(`https://corsproxy.io/?url=${encodeURIComponent(`${BASE}/${path}`)}`)
  }

  let lastErr: unknown
  for (const url of candidates) {
    try {
      const res = await axios.get(url, { timeout: 55000 })
      if (res.data?.error && !res.data.streams) throw new Error(res.data.detail || res.data.error)
      return res.data
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('FrostStream indisponivel')
}

export async function getFrostStreams(
  type: 'filme' | 'serie',
  tmdbId: number,
  season = 1,
  episode = 1
): Promise<StreamSource[]> {
  const categoryType = type === 'serie' ? 'tv' : 'movie'
  const imdbId = await getImdbId(categoryType, tmdbId)
  if (!imdbId) throw new Error('IMDB ID não encontrado para este título')

  const path = type === 'serie'
    ? `series/${imdbId}:${season}:${episode}`
    : `movie/${imdbId}`

  const cached = streamCache.get(path)
  if (cached) return cached

  const data = await fetchStreamsJson(path)
  const raw: FrostStreamRaw[] = data?.streams || []

  const sources: StreamSource[] = raw
    .filter(s => s.url)
    .map(s => ({
      url: s.url,
      quality: (s.name || '').replace(/FrostStream/i, '').trim() || 'AUTO',
      provider: extractProvider(s.title || ''),
      language: extractLanguage(s.title || ''),
      headers: s.headers,
    }))

  sources.sort((a, b) => scoreSource(b) - scoreSource(a))
  streamCache.set(path, sources)
  return sources
}
