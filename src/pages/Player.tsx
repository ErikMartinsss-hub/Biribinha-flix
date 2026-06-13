import { useState, useEffect } from 'react'
import { ArrowLeft, MonitorPlay, ChevronDown, ChevronUp, Play, Signal, Radio } from 'lucide-react'
import tmdbApi from '../api/tmdb'
import { getChannelUrl } from '../data/channels'
import type { EventData, EmbedData } from '../api/reidosembeds'

interface PlayerProps {
  id: number
  type: 'filme' | 'serie' | 'canal' | 'evento'
  title: string
  season?: number
  episode?: number
  slug?: string
  eventData?: EventData
  onBack: () => void
}

export default function PlayerPage({ id, type, title, season, episode, slug, eventData, onBack }: PlayerProps) {
  const [activeSeason, setActiveSeason] = useState(season ?? 1)
  const [activeEpisode, setActiveEpisode] = useState(episode ?? 1)
  const [totalSeasons, setTotalSeasons] = useState(1)
  const [episodesInSeason, setEpisodesInSeason] = useState<number[]>([])
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedEmbed, setSelectedEmbed] = useState<EmbedData | null>(null)

  const isSeries = type === 'serie'
  const isChannel = type === 'canal'
  const isEvent = type === 'evento'
  const embedUrl = isEvent
    ? (selectedEmbed?.embed_url || '')
    : isChannel
      ? getChannelUrl(slug || '')
      : `https://superflixapi.cyou/${isSeries ? `serie/${id}/${activeSeason}/${activeEpisode}` : `filme/${id}`}`

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
    if (!embedUrl) return
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
        {isEvent && !selectedEmbed ? (
          /* EMBED PROVIDER SELECTION */
          <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#00A8E1]/20 flex items-center justify-center">
                <Signal size={28} className="text-[#00A8E1]" />
              </div>
              <h2 className="text-xl font-black text-white mb-2">{title}</h2>
              <p className="text-[#8197a4] text-sm">Selecione um provedor para assistir ao vivo</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {eventData?.embeds.map((embed, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedEmbed(embed); setLoading(true) }}
                  className="p-5 rounded-xl bg-[#1a242f] border border-[#2a3a48] hover:border-[#00A8E1]/50 transition-all text-left group hover:bg-[#1e2d3a]"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#00A8E1]/15 flex items-center justify-center group-hover:bg-[#00A8E1]/25 transition-colors">
                      <Radio size={18} className="text-[#00A8E1]" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{embed.provider}</p>
                      <p className="text-[#8197a4] text-xs">{embed.quality}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#00A8E1] text-xs font-bold">
                    <Play size={12} fill="#00A8E1" />
                    ASSISTIR
                  </div>
                </button>
              ))}
            </div>

            {(!eventData?.embeds || eventData.embeds.length === 0) && (
              <div className="text-center py-12">
                <p className="text-[#5a6a78] text-sm font-bold">Nenhum provedor disponível para este evento.</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <iframe
              key={isEvent ? (selectedEmbed?.slug || '') : `${activeSeason}-${activeEpisode}`}
              src={embedUrl}
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen
              allow="autoplay *; encrypted-media *; picture-in-picture *; fullscreen *; clipboard-write *; accelerometer *; gyroscope *"
              onLoad={() => setLoading(false)}
            />

            {loading && (
              <div className="flex flex-col items-center gap-3 z-10">
                <div className="w-10 h-10 border-4 border-[#00A8E1] border-t-transparent rounded-full animate-spin" />
                <p className="text-[#5a6a78] text-sm font-bold">Carregando...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
