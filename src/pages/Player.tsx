import { useState, useEffect } from 'react'
import { ArrowLeft, MonitorPlay, ChevronDown, ChevronUp } from 'lucide-react'
import tmdbApi from '../api/tmdb'
import { getChannelUrl } from '../data/channels'

interface PlayerProps {
  id: number
  type: 'filme' | 'serie' | 'canal'
  title: string
  season?: number
  episode?: number
  slug?: string
  onBack: () => void
}

export default function PlayerPage({ id, type, title, season, episode, slug, onBack }: PlayerProps) {
  const [activeSeason, setActiveSeason] = useState(season ?? 1)
  const [activeEpisode, setActiveEpisode] = useState(episode ?? 1)
  const [totalSeasons, setTotalSeasons] = useState(1)
  const [episodesInSeason, setEpisodesInSeason] = useState<number[]>([])
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(true)

  const isSeries = type === 'serie'
  const isChannel = type === 'canal'
  const embedUrl = isChannel
    ? getChannelUrl(slug || '')
    : `https://superflixapi.online/${isSeries ? `serie/${id}/${activeSeason}/${activeEpisode}` : `filme/${id}`}`

  useEffect(() => {
    if (!isSeries) return
    tmdbApi.get(`/tv/${id}`).then(res => {
      setTotalSeasons(res.data.number_of_seasons || 1)
    }).catch(() => {})
  }, [id, isSeries])

  useEffect(() => {
    if (!isSeries) return
    tmdbApi.get(`/tv/${id}/season/${activeSeason}`).then(res => {
      const eps = res.data.episodes || []
      setEpisodesInSeason(eps.map((e: any) => e.episode_number))
    }).catch(() => {
      setEpisodesInSeason(Array.from({ length: 24 }, (_, i) => i + 1))
    })
  }, [id, activeSeason, isSeries])

  // Retorna janela fake no window.open + aplica sandbox apos o video carregar
  useEffect(() => {
    const origOpen = window.open.bind(window)
    window.open = () => {
      const win: any = {
        closed: false,
        document: { write: () => {}, close: () => {} },
        close: () => { win.closed = true },
        focus: () => {},
        blur: () => {},
        location: { href: '', replace: () => {}, assign: () => {} },
        addEventListener: () => {},
        removeEventListener: () => {},
        postMessage: () => {},
      }
      return win
    }

    // Aplica sandbox no iframe apos o video ja ter carregado
    // Isso bloqueia popups sem impedir o video de iniciar
    const timer = setTimeout(() => {
      const iframe = document.querySelector('iframe')
      if (iframe && !iframe.hasAttribute('sandbox')) {
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-presentation')
      }
    }, 3000)

    return () => {
      window.open = origOpen
      clearTimeout(timer)
    }
  }, [embedUrl])

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* TOP BAR */}
      <div className="bg-[#1a242f]/90 backdrop-blur-md border-b border-[#1a242f] px-4 py-3 flex items-center justify-between z-10">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-bold truncate max-w-[200px]">{title}</span>
        </button>

        {!isChannel && isSeries && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 bg-[#00A8E1]/20 hover:bg-[#00A8E1]/30 border border-[#00A8E1]/40 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
            >
              <MonitorPlay size={16} />
              T{activeSeason} EP{activeEpisode}
              {showMenu ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#1a242f] border border-[#2a3a48] rounded-xl p-4 shadow-2xl z-20 max-h-96 overflow-y-auto">
                <h4 className="text-[#00A8E1] font-black text-[10px] tracking-widest mb-3">TEMPORADAS</h4>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {Array.from({ length: totalSeasons }, (_, i) => i + 1).map(num => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => { setActiveSeason(num); setActiveEpisode(1) }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeSeason === num
                          ? 'bg-[#00A8E1] text-white'
                          : 'bg-[#1a242f] text-[#8197a4] hover:text-white'
                      }`}
                    >
                      T{num}
                    </button>
                  ))}
                </div>
                <h4 className="text-[#00A8E1] font-black text-[10px] tracking-widest mb-3">EPISÓDIOS</h4>
                <div className="space-y-1">
                  {episodesInSeason.map(ep => (
                    <button
                      type="button"
                      key={ep}
                      onClick={() => { setActiveEpisode(ep); setShowMenu(false) }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                        activeEpisode === ep
                          ? 'bg-[#00A8E1]/20 text-white'
                          : 'text-[#8197a4] hover:text-white hover:bg-[#1a242f]'
                      }`}
                    >
                      <span className="font-bold">EP {ep}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PLAYER AREA */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        <iframe
          key={`${activeSeason}-${activeEpisode}`}
          src={embedUrl}
          className="absolute inset-0 w-full h-full border-0"
          allowFullScreen
          allow="autoplay; fullscreen"
          onLoad={() => setLoading(false)}
        />

        {loading && (
          <div className="flex flex-col items-center gap-3 z-10">
            <div className="w-10 h-10 border-4 border-[#00A8E1] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#5a6a78] text-sm font-bold">Carregando...</p>
          </div>
        )}
      </div>
    </div>
  )
}
