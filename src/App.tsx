import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Search, Star, MonitorPlay, Film, Tv, X, ChevronRight, Clock, Sparkles, ChevronLeft, Info, TrendingUp, Award, Flame, Eye, Radio } from 'lucide-react'
import tmdbApi from './api/tmdb'
import Details from './pages/Details'
import PlayerPage from './pages/Player'
import { CHANNELS } from './data/channels'

interface TMDBItem {
  id: number
  title?: string
  name?: string
  poster_path?: string
  backdrop_path?: string
  overview?: string
  vote_average?: number
  release_date?: string
  first_air_date?: string
  media_type?: string
}

interface HistoryItem {
  id: number
  title: string
  poster: string
  type: string
  timestamp: number
}

interface RowData {
  title: string
  categoryId: string
  data: TMDBItem[]
}

const CATEGORIES = [
  { id: 'animes', label: 'Animes', icon: MonitorPlay, type: 'tv', prefix: 'ANIMES' },
  { id: 'filmes', label: 'Filmes', icon: Film, type: 'movie', prefix: 'FILMES' },
  { id: 'series', label: 'Séries', icon: Tv, type: 'tv', prefix: 'SÉRIES' },
  { id: 'canais', label: 'Canais', icon: Radio, type: 'tv', prefix: 'CANAIS' },
] as const

const ROWS_CONFIG = [
  { title: 'EM ALTA', icon: TrendingUp },
  { title: 'MELHORES AVALIADOS', icon: Award },
  { title: 'AÇÃO', icon: Flame },
  { title: 'LANÇAMENTOS', icon: Sparkles },
]

const CATEGORY_ROWS: Record<string, { params: Record<string, string> }[]> = {
  animes: [
    { params: { with_genres: '16', sort_by: 'popularity.desc' } },
    { params: { with_genres: '16', sort_by: 'vote_average.desc', 'vote_count.gte': '200' } },
    { params: { with_genres: '16,10759', with_original_language: 'ja' } },
    { params: { with_genres: '16', sort_by: 'first_air_date.desc', 'first_air_date_date.gte': '2025-01-01' } },
  ],
  filmes: [
    { params: { sort_by: 'popularity.desc' } },
    { params: { sort_by: 'vote_average.desc', 'vote_count.gte': '500' } },
    { params: { with_genres: '28', sort_by: 'popularity.desc' } },
    { params: { sort_by: 'primary_release_date.desc', 'primary_release_date.gte': '2025-01-01' } },
  ],
  series: [
    { params: { sort_by: 'popularity.desc' } },
    { params: { sort_by: 'vote_average.desc', 'vote_count.gte': '500' } },
    { params: { with_genres: '10759', sort_by: 'popularity.desc' } },
    { params: { sort_by: 'first_air_date.desc', 'first_air_date_date.gte': '2025-01-01' } },
  ],
}

const tmdbImg = (path: string | null, size = 'w500') => path ? `https://image.tmdb.org/t/p/${size}${path}` : ''

export default function App() {
  const [rows, setRows] = useState<RowData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [playerContent, setPlayerContent] = useState<any>(null)
  const [detailContent, setDetailContent] = useState<{ id: number; type: 'tv' | 'movie'; label: string } | null>(null)
  const [heroIndex, setHeroIndex] = useState(0)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showCarouselModal, setShowCarouselModal] = useState(false)
  const [trendingAll, setTrendingAll] = useState<TMDBItem[]>([])
  const [searchResults, setSearchResults] = useState<TMDBItem[]>([])
  const [searching, setSearching] = useState(false)
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const heroTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const heroData = rows.slice(4, 7).flatMap(r => r.data).filter((_, i) => i < 5) || []
  const displayedRows = activeCategory === 'all' ? rows : rows.filter(r => r.categoryId === activeCategory)

  // Load history
  useEffect(() => {
    try {
      const saved = localStorage.getItem('biribinha_history')
      if (saved) setHistory(JSON.parse(saved))
    } catch {}
  }, [])

  // Fetch ALL data on mount
  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const fetchAll = async () => {
      const allRows: RowData[] = []

      for (const cat of CATEGORIES) {
        const catRows = (CATEGORY_ROWS as any)[cat.id]

        if (!catRows) continue // Pula categorias sem config de busca (ex: canais)

        const discoverEndpoint = `/discover/${cat.type}`
        try {
          const results = await Promise.all(
            catRows.map((row: any) => tmdbApi.get(discoverEndpoint, { params: row.params }))
          )
          if (cancelled) return
          results.forEach((res: any, i: number) => {
            allRows.push({
              categoryId: cat.id,
              title: `${cat.prefix} • ${ROWS_CONFIG[i].title}`,
              data: res.data.results.slice(0, 20),
            })
          })
        } catch (e) {
          console.error(`Erro ao carregar ${cat.label}`, e)
        }
      }

      // Adiciona canais de TV agrupados por categoria
      for (const chCat of ['Filmes e Séries', 'Esportes', 'Notícias', 'Infantil', 'Documentários', 'Música', 'Abertos']) {
        const filtered = CHANNELS.filter(c => c.category === chCat)
        if (filtered.length === 0) continue
        allRows.push({
          categoryId: 'canais',
          title: `CANAIS • ${chCat.toUpperCase()}`,
          data: filtered.map(ch => ({
            id: ch.id as any,
            name: ch.name,
            title: ch.name,
            poster_path: null,
            backdrop_path: null,
            vote_average: 0,
            overview: ch.category,
            media_type: 'canal',
            // Campo customizado para identificar o slug
            ...({ slug: ch.slug } as any),
          })),
        })
      }

      if (!cancelled) {
        setRows(allRows)
        setLoading(false)
      }
    }

    fetchAll()
    return () => { cancelled = true }
  }, [])

  // Fetch trending movies for carousel modal
  useEffect(() => {
    tmdbApi.get('/trending/movie/week').then(res => {
      setTrendingAll(res.data.results.slice(0, 15))
    }).catch(() => {})
  }, [])

  // Hero auto-play
  useEffect(() => {
    if (heroData.length < 2) return
    heroTimerRef.current = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroData.length)
    }, 6000)
    return () => {
      if (heroTimerRef.current) clearInterval(heroTimerRef.current)
    }
  }, [heroData.length])

  // Search via TMDB API
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(() => {
      setSearching(true)
      tmdbApi.get('/search/multi', { params: { query: searchTerm } })
        .then(res => setSearchResults(res.data.results.slice(0, 20)))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false))
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleItemClick = useCallback((item: TMDBItem & { slug?: string }) => {
    if (item.media_type === 'canal') {
      setPlayerContent({ id: 0, type: 'canal', title: item.name || item.title || '', slug: item.slug })
      return
    }
    const isMovie = !!item.title || item.media_type === 'movie'
    setDetailContent({ id: item.id, type: isMovie ? 'movie' : 'tv', label: isMovie ? 'filmes' : 'series' })
  }, [])

  const handleHeroPlay = useCallback((item: TMDBItem) => {
    const title = item.title || item.name || 'Título'
    if (item.title || item.media_type === 'movie') {
      setPlayerContent({ id: item.id, type: 'filme', title })
      saveToHistory(item, 'filme')
    } else {
      setDetailContent({ id: item.id, type: 'tv', label: 'series' })
    }
  }, [])

  const saveToHistory = (item: TMDBItem, type: string) => {
    const title = item.title || item.name || 'Título'
    const entry: HistoryItem = {
      id: item.id,
      title,
      poster: item.poster_path || '',
      type,
      timestamp: Date.now(),
    }
    setHistory(prev => {
      const filtered = prev.filter(h => h.id !== item.id)
      const updated = [entry, ...filtered].slice(0, 10)
      try { localStorage.setItem('biribinha_history', JSON.stringify(updated)) } catch {}
      return updated
    })
  }

  const filteredHistory = history.filter(h =>
    h.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // --- Carousel Modal ---
  const CarouselModal = () => {
    const featured = trendingAll
    if (!featured.length) return null

    const item = featured[featuredIndex]
    const title = item.title || item.name || ''

    return (
      <div className="fixed inset-0 z-[60] bg-black/98 flex flex-col">
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/90 to-transparent px-6 py-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[#00A8E1] font-black text-sm tracking-widest flex items-center gap-2">
              <Sparkles size={16} /> DESTAQUES
            </h2>
            <button onClick={() => setShowCarouselModal(false)} className="p-2 text-[#8197a4] hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center relative">
          <button
            onClick={() => setFeaturedIndex(prev => (prev - 1 + featured.length) % featured.length)}
            className="absolute left-4 z-10 p-2 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft size={28} />
          </button>

          <div className="w-full max-w-4xl mx-auto px-12">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-[#00A8E1]/10">
              {item.backdrop_path && (
                <img src={tmdbImg(item.backdrop_path, 'original')} alt="" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h3 className="text-xl md:text-3xl font-black text-white mb-2">{title}</h3>
                <div className="flex items-center gap-4 text-xs md:text-sm text-[#8197a4] mb-4">
                  <span className="flex items-center gap-1 text-yellow-500">
                    <Star size={14} fill="currentColor" /> {item.vote_average?.toFixed(1)}
                  </span>
                  <span>Filme</span>
                </div>
                <p className="text-[#8197a4] text-xs md:text-sm line-clamp-2 mb-4 max-w-xl">{item.overview}</p>
                <button
                  onClick={() => {
                    setShowCarouselModal(false)
                    setPlayerContent({ id: item.id, type: 'filme', title })
                    saveToHistory(item, 'filme')
                  }}
                  className="flex items-center gap-2 bg-[#00A8E1] hover:bg-[#00adee] text-white font-bold px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-[#00A8E1]/30 text-sm"
                >
                  <Play fill="white" size={16} /> ASSISTIR
                </button>
              </div>
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-2 mt-4 justify-center overflow-x-auto no-scrollbar px-4">
              {featured.map((f, i) => (
                <button
                  key={f.id}
                  onClick={() => setFeaturedIndex(i)}
                  className={`flex-shrink-0 w-16 md:w-20 aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                    i === featuredIndex ? 'border-[#00A8E1] opacity-100 scale-110' : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  {f.backdrop_path && (
                    <img src={tmdbImg(f.backdrop_path, 'w200')} alt="" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setFeaturedIndex(prev => (prev + 1) % featured.length)}
            className="absolute right-4 z-10 p-2 text-white/60 hover:text-white transition-colors"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* Progress dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {featured.slice(0, 7).map((_, i) => (
            <button
              key={i}
              onClick={() => setFeaturedIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === featuredIndex ? 'bg-[#00A8E1] w-4' : 'bg-[#4a5a68]'
              }`}
            />
          ))}
        </div>
      </div>
    )
  }

  // --- Row Component ---
  const Row = ({ title, data }: RowData) => {
    const scrollRef = useRef<HTMLDivElement>(null)

    const scroll = (dir: 'left' | 'right') => {
      if (!scrollRef.current) return
      const amount = scrollRef.current.clientWidth * 0.6
      scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
    }

    if (!data.length) return null

    return (
      <div className="mb-8 md:mb-10">
        <div className="flex items-center gap-2 mb-4 px-4 md:px-10">
          <span className="text-[#00A8E1] font-black text-xs md:text-sm">|</span>
          <h2 className="text-white font-black text-xs md:text-sm tracking-wider">{title}</h2>
        </div>

        <div className="relative group">
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-10 w-10 md:w-14 bg-gradient-to-r from-[#0f171e] to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-start pl-1"
          >
            <ChevronLeft size={22} className="text-white" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-10 w-10 md:w-14 bg-gradient-to-l from-[#0f171e] to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-1"
          >
            <ChevronRight size={22} className="text-white" />
          </button>

          <div ref={scrollRef} className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar px-4 md:px-10 scroll-smooth">
            {data.map(item => (
              <div key={item.id} className="flex-shrink-0 group/card cursor-pointer w-[120px] md:w-[150px]">
                <div
                  className="relative aspect-[2/3] rounded-lg md:rounded-xl overflow-hidden bg-[#1a242f] transition-all duration-300 group-hover/card:scale-105 group-hover/card:shadow-xl group-hover/card:shadow-[#00A8E1]/15 border border-transparent hover:border-[#00A8E1]/30"
                  onClick={() => handleItemClick(item)}
                >
                  {(item as any).media_type === 'canal' ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#1a242f] to-[#0f171e]">
                      <Radio size={28} className="text-[#00A8E1]" />
                      <span className="text-white font-black text-xs text-center px-2 leading-tight">
                        {(item as any).name || (item as any).title}
                      </span>
                      <span className="text-[#00A8E1] text-[9px] font-bold tracking-widest">AO VIVO</span>
                    </div>
                  ) : item.poster_path ? (
                    <img src={tmdbImg(item.poster_path)} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#5a6a78] text-xs font-bold px-2 text-center">
                      {item.title || item.name}
                    </div>
                  )}
                  {(item as any).media_type !== 'canal' && (
                    <div className="absolute top-1.5 right-1.5 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-yellow-500 flex items-center gap-1">
                      <Star size={7} fill="currentColor" /> {item.vote_average?.toFixed(1)}
                    </div>
                  )}
                  {(item as any).media_type === 'canal' && (
                    <div className="absolute top-1.5 left-1.5 bg-[#00A8E1] px-1.5 py-0.5 rounded text-[9px] font-bold text-white tracking-wider flex items-center gap-1">
                      <Radio size={8} /> AO VIVO
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-[#00A8E1]/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white text-[#0f171e] p-2.5 md:p-3 rounded-full shadow-lg shadow-black/50 transform scale-90 group-hover/card:scale-100 transition-transform">
                      <Play size={16} />
                    </div>
                  </div>
                </div>
                <p className="mt-1.5 text-[10px] md:text-[11px] text-[#8197a4] font-bold truncate px-0.5">
                  {item.title || item.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const handlePlay = useCallback((c: { id: number; type: 'filme' | 'serie' | 'canal'; title: string; season?: number; episode?: number; slug?: string }) => {
    setPlayerContent(c)
  }, [])

  // PLAYER PAGE
  if (playerContent) {
    return (
      <PlayerPage
        id={playerContent.id}
        type={playerContent.type}
        title={playerContent.title}
        season={playerContent.season}
        episode={playerContent.episode}
        slug={playerContent.slug}
        onBack={() => setPlayerContent(null)}
      />
    )
  }

  // DETAILS PAGE
  if (detailContent) {
    return (
      <Details
        itemId={detailContent.id}
        categoryType={detailContent.type}
        onBack={() => setDetailContent(null)}
        onPlay={handlePlay}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#0f171e] text-white selection:bg-[#00A8E1]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#0f171e]/90 border-b border-[#1a242f]/50">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-4">
          <h1 className="text-base md:text-xl font-black flex-shrink-0 tracking-normal">
            BIRIBINHA<span className="text-[#00A8E1] ml-1">FLIX</span>
          </h1>

          <nav className="hidden md:flex items-center gap-0.5">
            {[{ id: 'all', label: 'Todos', icon: undefined }, ...CATEGORIES].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 font-bold text-sm transition-colors rounded ${
                  activeCategory === cat.id
                    ? 'text-white bg-[#1a242f]'
                    : 'text-[#8197a4] hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => setShowCarouselModal(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded border border-[#00A8E1]/40 text-[#79b8f3] hover:text-white hover:bg-[#00A8E1]/10 font-bold text-[11px] transition-all"
            >
              <Sparkles size={14} /> DESTAQUES
            </button>

            <div className="relative flex-1 max-w-[200px] md:max-w-xs hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a6a78]" size={15} />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#1a242f] border border-[#1a242f] rounded-full py-1.5 md:py-2 pl-9 pr-4 text-xs md:text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 transition-all placeholder:text-[#5a6a78]"
              />
            </div>

            <div className="flex md:hidden gap-1">
              <button onClick={() => setActiveCategory('all')} className={`p-2 ${activeCategory === 'all' ? 'text-white' : 'text-[#8197a4]'}`}>
                <MonitorPlay size={16} />
              </button>
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`p-2 ${activeCategory === cat.id ? 'text-white' : 'text-[#8197a4]'}`}>
                  <cat.icon size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <div className="px-4 pb-3 sm:hidden">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a6a78]" size={15} />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#1a242f] border border-[#1a242f] rounded-full py-2 pl-9 pr-4 text-xs outline-none focus:ring-2 focus:ring-[#00A8E1]/50 transition-all placeholder:text-[#5a6a78]"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowCarouselModal(true)}
              className="px-3 py-2 rounded border border-[#00A8E1]/40 text-[#79b8f3] font-bold text-xs"
            >
              <Sparkles size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* LOADING */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-[#00A8E1] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#5a6a78] text-xs font-bold">CARREGANDO...</p>
          </div>
        </div>
      ) : searchTerm ? (
        /* SEARCH RESULTS */
        <main className="max-w-[1600px] mx-auto px-4 md:px-10 py-6 md:py-10">
          <h2 className="text-white font-black text-sm md:text-lg mb-6">
            RESULTADOS PARA: <span className="text-[#00A8E1]">"{searchTerm}"</span>
          </h2>

          {filteredHistory.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Clock size={14} className="text-[#00A8E1]" />
                <h3 className="text-[#8197a4] font-bold text-xs md:text-sm">CONTINUAR ASSISTINDO</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {filteredHistory.map(item => (
                  <div
                    key={item.id}
                    className="group cursor-pointer"
                    onClick={() => {
                      setPlayerContent({ id: item.id, type: item.type, title: item.title })
                    }}
                  >
                    <div className="relative aspect-[2/3] rounded-lg md:rounded-xl overflow-hidden bg-[#1a242f]">
                      {item.poster ? (
                        <img src={tmdbImg(item.poster)} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#5a6a78] text-xs font-bold px-2">{item.title}</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-[#00A8E1]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white text-[#0f171e] p-2.5 md:p-3 rounded-full shadow-lg shadow-black/50">
                          <Play size={16} />
                        </div>
                      </div>
                    </div>
                    <p className="mt-1.5 text-[10px] md:text-[11px] text-[#8197a4] font-bold truncate">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searching ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-[#00A8E1] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {searchResults.filter(item => item.media_type !== 'person').map(item => {
                const title = item.title || item.name || ''
                const isMovie = item.media_type === 'movie'
                return (
                  <div
                    key={item.id}
                    className="group cursor-pointer"
                    onClick={() => {
                      setDetailContent({ id: item.id, type: isMovie ? 'movie' : 'tv', label: isMovie ? 'filmes' : 'series' })
                    }}
                  >
                    <div className="relative aspect-[2/3] rounded-lg md:rounded-xl overflow-hidden bg-[#1a242f] transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-[#00A8E1]/15">
                      {item.poster_path ? (
                        <img src={tmdbImg(item.poster_path)} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#5a6a78] text-xs font-bold px-2">{title}</div>
                      )}
                      <div className="absolute top-1.5 right-1.5 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-yellow-500 flex items-center gap-1">
                        <Star size={7} fill="currentColor" /> {item.vote_average?.toFixed(1)}
                      </div>
                      <div className="absolute top-1.5 left-1.5 bg-[#00A8E1]/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-bold text-white">
                        {isMovie ? 'FILME' : 'SÉRIE'}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-[#00A8E1]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white text-[#0f171e] p-2.5 md:p-3 rounded-full shadow-lg shadow-black/50">
                          <Play size={16} />
                        </div>
                      </div>
                    </div>
                    <p className="mt-1.5 text-[10px] md:text-[11px] text-[#8197a4] font-bold truncate">{title}</p>
                    {item.release_date || item.first_air_date ? (
                      <p className="text-[#5a6a78] text-[9px] truncate">{(item.release_date || item.first_air_date || '').split('-')[0]}</p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : null}

          {/* CANAIS - busca local */}
          {(() => {
            const q = searchTerm.toLowerCase()
            const found = CHANNELS.filter(c => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q))
            if (found.length === 0) return null
            return (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Radio size={14} className="text-[#00A8E1]" />
                  <h3 className="text-[#8197a4] font-bold text-xs md:text-sm">CANAIS</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                  {found.map(ch => (
                    <div
                      key={ch.id}
                      className="group cursor-pointer"
                      onClick={() => setPlayerContent({ id: 0, type: 'canal', title: ch.name, slug: ch.slug })}
                    >
                      <div className="relative aspect-[2/3] rounded-lg md:rounded-xl overflow-hidden bg-gradient-to-br from-[#1a242f] to-[#0f171e] transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-[#00A8E1]/15 flex flex-col items-center justify-center gap-2">
                        <Radio size={28} className="text-[#00A8E1]" />
                        <span className="text-white font-black text-xs text-center px-2 leading-tight">{ch.name}</span>
                        <span className="text-[#00A8E1] text-[9px] font-bold tracking-widest">{ch.category}</span>
                      </div>
                      <p className="mt-1.5 text-[10px] md:text-[11px] text-[#8197a4] font-bold truncate">{ch.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {searchResults.length === 0 && (() => {
            const q = searchTerm.toLowerCase()
            const hasChannels = CHANNELS.some(c => c.name.toLowerCase().includes(q))
            if (hasChannels) return null
            return (
              <div className="flex flex-col items-center justify-center py-20 text-[#5a6a78]">
                <Search size={40} className="mb-4" />
                <p className="text-sm font-bold">Nenhum resultado encontrado.</p>
              </div>
            )
          })()}
        </main>
      ) : (
        /* MAIN CONTENT */
        <main>
          {/* HERO BANNER */}
          {heroData.length > 0 && (
            <div className="relative h-[55vh] md:h-[70vh] w-full overflow-hidden">
              {heroData.map((item, i) => {
                const title = item.title || item.name || ''
                const overview = item.overview || ''
                const backdrop = item.backdrop_path
                return (
                  <div
                    key={item.id}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                      i === heroIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                    }`}
                  >
                    {backdrop && (
                      <img
                        src={tmdbImg(backdrop, 'original')}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f171e] via-[#0f171e]/70 to-30%" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0f171e] via-[#0f171e]/80 via-40% to-transparent" />
                    <div className="absolute bottom-[12%] left-4 md:left-16 right-4 md:right-16 max-w-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-1.5 bg-[#00A8E1] rounded-full animate-pulse" />
                        <span className="text-[#8197a4] text-[10px] md:text-xs font-bold tracking-widest">
                          FILME EM DESTAQUE
                        </span>
                      </div>
                      <h2 className="text-xl md:text-4xl lg:text-5xl font-black text-white mb-3 drop-shadow-xl leading-tight">
                        {title}
                      </h2>
                      <p className="text-[#8197a4] text-xs md:text-sm leading-relaxed mb-4 md:mb-6 line-clamp-2 max-w-lg">
                        {overview}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleHeroPlay(item)}
                          className="flex items-center gap-2 bg-[#00A8E1] hover:bg-[#00adee] text-white font-bold px-5 md:px-7 py-2.5 md:py-3 rounded-lg md:rounded-xl transition-all shadow-lg shadow-[#00A8E1]/30 text-xs md:text-sm"
                        >
                          <Play fill="white" size={16} /> ASSISTIR AGORA
                        </button>
                        <button
                          type="button"
                          onClick={() => handleItemClick(item)}
                          className="flex items-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-sm text-white font-bold px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl transition-all text-xs md:text-sm border border-white/10"
                        >
                          <Info size={16} /> DETALHES
                        </button>
                        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 md:px-3 py-2 rounded border border-white/10">
                          <Star size={12} className="text-yellow-500" fill="currentColor" />
                          <span className="text-white font-bold text-xs md:text-sm">{item.vote_average?.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Hero nav dots */}
              <div className="absolute bottom-[4%] left-4 md:left-16 flex gap-2">
                {heroData.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setHeroIndex(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === heroIndex ? 'bg-[#00A8E1] w-6 h-1.5' : 'bg-[#5a6a78] hover:bg-[#6a7a88] w-1.5 h-1.5'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* CONTINUE WATCHING */}
          {history.length > 0 && (
            <div className="mb-6 mt-6 md:mt-8">
              <div className="flex items-center gap-3 mb-4 px-4 md:px-10">
                <Eye size={14} className="text-[#00A8E1]" />
                <h2 className="text-white font-black text-xs md:text-sm tracking-wider">CONTINUAR ASSISTINDO</h2>
              </div>
              <div className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar px-4 md:px-10">
                {history.map(item => (
                  <div
                    key={`hist-${item.id}`}
                    className="flex-shrink-0 group cursor-pointer w-[160px] md:w-[200px]"
                    onClick={() => {
                      setPlayerContent({ id: item.id, type: item.type, title: item.title })
                    }}
                  >
                    <div className="relative aspect-video rounded-lg md:rounded-xl overflow-hidden bg-[#1a242f] border border-[#1a242f]/50 group-hover:border-[#00A8E1]/30 transition-all">
                      {item.poster ? (
                        <img src={tmdbImg(item.poster)} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#5a6a78] text-xs font-bold px-2">{item.title}</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
                        <div className="bg-white text-[#0f171e] p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play size={12} />
                        </div>
                        <p className="text-white text-[10px] font-bold truncate opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.title}
                        </p>
                      </div>
                    </div>
                    <p className="mt-1.5 text-[10px] text-[#8197a4] font-bold truncate px-0.5">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ROWS */}
          {displayedRows.map(row => <Row key={row.title} {...row} />)}
          <div className="h-16 md:h-20" />
        </main>
      )}

      {/* CAROUSEL MODAL */}
      {showCarouselModal && <CarouselModal />}

      {/* FOOTER */}
      <footer className="py-12 md:py-16 text-center border-t border-[#1a242f]/50">
        <div className="max-w-[1600px] mx-auto px-6">
          <h3 className="text-base md:text-xl font-black mb-4">
            BIRIBINHA<span className="text-[#00A8E1] ml-1">FLIX</span>
          </h3>
          <div className="flex items-center justify-center gap-6 mb-6 text-[#5a6a78] text-xs">
            <span>Animes</span>
            <span className="text-[#3a4a58]">•</span>
            <span>Filmes</span>
            <span className="text-[#3a4a58]">•</span>
            <span>Séries</span>
          </div>
          <p className="text-[#3a4a58] text-[9px] md:text-[10px] font-black tracking-[0.3em]">
            BITSOUL TECHNOLOGY • BIRIBINHA FLIX © {new Date().getFullYear()}
          </p>
          <p className="text-[#2a3a48] text-[8px] mt-3 tracking-widest">
            TODOS OS DIREITOS RESERVADOS
          </p>
        </div>
      </footer>
    </div>
  )
}
