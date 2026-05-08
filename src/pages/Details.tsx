import { useEffect, useState } from 'react'
import { ArrowLeft, Star, Play, ChevronRight, Tv, MonitorPlay, Calendar } from 'lucide-react'
import tmdbApi from '../api/tmdb'

interface DetailsProps {
  itemId: number
  categoryType: 'tv' | 'movie'
  onBack: () => void
  onPlay: (c: { id: number; type: 'filme' | 'serie'; title: string; season?: number; episode?: number }) => void
}

interface Episode {
  id: number
  episode_number: number
  name: string
  still_path: string | null
  overview: string
  vote_average: number
}

const tmdbImg = (path: string | null, size = 'w500') => path ? `https://image.tmdb.org/t/p/${size}${path}` : ''

export default function Details({ itemId, categoryType, onBack, onPlay }: DetailsProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loadingEpisodes, setLoadingEpisodes] = useState(false)

  const isSeries = categoryType === 'tv'
  const title = data?.title || data?.name || ''
  const year = (data?.release_date || data?.first_air_date || '').split('-')[0]
  const genres = (data?.genres || []).map((g: any) => g.name)
  const rating = data?.vote_average?.toFixed(1)
  const seasons = data?.number_of_seasons || 1

  useEffect(() => {
    setLoading(true)
    const endpoint = `/${categoryType}/${itemId}`
    tmdbApi.get(endpoint).then(res => {
      setData(res.data)
      setLoading(false)
      if (res.data.number_of_seasons) {
        loadEpisodes(1)
      }
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [itemId, categoryType])

  const loadEpisodes = (season: number) => {
    setLoadingEpisodes(true)
    setSelectedSeason(season)
    const endpoint = `/${categoryType}/${itemId}/season/${season}`
    tmdbApi.get(endpoint).then(res => {
      setEpisodes(res.data.episodes || [])
    }).catch(() => {
      setEpisodes([])
    }).finally(() => setLoadingEpisodes(false))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f171e] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#00A8E1] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f171e] text-white">
      {/* BACK BUTTON */}
      <div className="sticky top-0 z-40 bg-[#0f171e]/95 backdrop-blur-md border-b border-[#1a242f]/50">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center gap-4">
          <button type="button" onClick={onBack} className="p-2 hover:bg-[#1a242f] rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-sm font-black tracking-wider truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* HERO */}
      <div className="relative h-[40vh] md:h-[55vh] w-full overflow-hidden">
        {data?.backdrop_path && (
          <img src={tmdbImg(data.backdrop_path, 'original')} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f171e] via-[#0f171e]/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-10 pb-6">
          <div className="flex items-end gap-5">
            {data?.poster_path && (
              <img
                src={tmdbImg(data.poster_path)}
                alt=""
                className="w-24 md:w-32 rounded-xl shadow-2xl border-2 border-[#00A8E1]/30 hidden sm:block"
              />
            )}
            <div className="flex-1">
              <h2 className="text-2xl md:text-4xl font-black mb-2">{title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-[#8197a4] mb-4">
                {year && <span className="flex items-center gap-1"><Calendar size={12} />{year}</span>}
                {rating && <span className="flex items-center gap-1 text-yellow-500"><Star size={12} fill="currentColor" />{rating}</span>}
                {isSeries && <span className="flex items-center gap-1"><Tv size={12} />{seasons} temporada{seasons > 1 ? 's' : ''}</span>}
                {genres.length > 0 && <span className="flex items-center gap-1"><MonitorPlay size={12} />{genres.join(', ')}</span>}
              </div>
              <button
                type="button"
                onClick={() => onPlay({ id: itemId, type: isSeries ? 'serie' : 'filme', title, season: selectedSeason, episode: episodes[0]?.episode_number || 1 })}
                className="flex items-center gap-2 bg-[#00A8E1] hover:bg-[#00adee] text-white font-bold px-6 py-3 rounded-lg transition-all shadow-lg shadow-[#00A8E1]/30 text-sm"
              >
                <Play fill="white" size={18} /> {isSeries ? 'ASSISTIR AGORA' : 'ASSISTIR FILME'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-8">
        {/* SYNOPSIS */}
        {data?.overview && (
          <section className="mb-10">
            <h3 className="text-[#00A8E1] font-black text-xs tracking-widest mb-3">SINOPSE</h3>
            <p className="text-[#8197a4] text-sm leading-relaxed max-w-3xl">{data.overview}</p>
          </section>
        )}

        {/* SEASONS & EPISODES (for series) */}
        {isSeries && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Tv size={16} className="text-[#00A8E1]" />
              <h3 className="text-[#00A8E1] font-black text-xs tracking-widest">TEMPORADAS</h3>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {Array.from({ length: seasons }, (_, i) => i + 1).map(num => (
                <button
                  type="button"
                  key={num}
                  onClick={() => loadEpisodes(num)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    selectedSeason === num
                      ? 'bg-[#00A8E1] text-white shadow-lg shadow-[#00A8E1]/20'
                      : 'bg-[#1a242f] text-[#8197a4] hover:text-white hover:bg-[#2a3a48] border border-[#1a242f]'
                  }`}
                >
                  T{num}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-6">
              <MonitorPlay size={16} className="text-[#00A8E1]" />
              <h3 className="text-[#00A8E1] font-black text-xs tracking-widest">
                EPISÓDIOS • TEMPORADA {selectedSeason}
              </h3>
            </div>

            {loadingEpisodes ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 border-3 border-[#00A8E1] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {episodes.length === 0 && (
                  <p className="text-[#5a6a78] text-sm col-span-full">Nenhum episódio encontrado.</p>
                )}
                {episodes.map(ep => (
                  <button
                    type="button"
                    key={ep.id}
                    onClick={() => onPlay({ id: itemId, type: 'serie', title, season: selectedSeason, episode: ep.episode_number })}
                    className="flex items-start gap-4 bg-[#1a242f]/50 hover:bg-[#1a242f] border border-[#1a242f]/50 hover:border-[#00A8E1]/30 rounded-xl p-3 transition-all group text-left"
                  >
                    <div className="relative w-28 flex-shrink-0 aspect-video rounded-lg overflow-hidden bg-[#1a242f]">
                      {(ep.still_path || data?.backdrop_path) && (
                        <img
                          src={tmdbImg(ep.still_path || data?.backdrop_path, 'w300')}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play fill="white" size={20} className="text-[#00A8E1]" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#00A8E1] font-black text-xs mb-1">EP {ep.episode_number}</p>
                      <p className="text-white font-bold text-sm truncate">
                        {ep.name || `Episódio ${ep.episode_number}`}
                      </p>
                      {ep.overview && (
                        <p className="text-[#5a6a78] text-xs mt-1 line-clamp-2">{ep.overview}</p>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-[#4a5a68] group-hover:text-[#00A8E1] transition-colors mt-2 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* For movies */}
        {!isSeries && (
          <section className="flex justify-center py-10">
            <button
              type="button"
              onClick={() => onPlay({ id: itemId, type: 'filme', title })}
              className="flex items-center gap-3 bg-[#00A8E1] hover:bg-[#00adee] text-white font-bold px-10 py-4 rounded-xl transition-all shadow-xl shadow-[#00A8E1]/30 text-lg"
            >
              <Play fill="white" size={24} /> ASSISTIR FILME
            </button>
          </section>
        )}
      </div>
    </div>
  )
}
