import { useRef, useState, useEffect, useCallback } from 'react'
import {
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize, Minimize,
  Settings, PictureInPicture2, AlertTriangle, Check, Loader2
} from 'lucide-react'
import type { StreamSource } from '../api/froststream'

interface VideoPlayerProps {
  sources: StreamSource[]
  poster?: string
  title: string
  subtitle?: string
}

const fmt = (t: number) => {
  if (!isFinite(t) || t < 0) return '0:00'
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const s = Math.floor(t % 60)
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`
}

export default function VideoPlayer({ sources, poster, title, subtitle }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const hideTimer = useRef<number | null>(null)

  const [idx, setIdx] = useState(0)
  const [failed, setFailed] = useState<number[]>([])
  const [dead, setDead] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const [playing, setPlaying] = useState(false)
  const [buffering, setBuffering] = useState(true)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [bufferedEnd, setBufferedEnd] = useState(0)
  const [scrubbing, setScrubbing] = useState(false)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [isPiP, setIsPiP] = useState(false)

  const src = sources[idx]

  useEffect(() => {
    if (sources.length > 0) {
      setIdx(0)
      setFailed([])
      setDead(false)
    }
  }, [sources])

  // Troca de fonte: reseta estado e tenta dar play
  useEffect(() => {
    const v = videoRef.current
    if (!v || !src) return
    setCurrent(0)
    setDuration(0)
    setBufferedEnd(0)
    setBuffering(true)
    setDead(false)
    v.load()
    v.play().catch(() => setPlaying(false))
  }, [idx, src])

  // Auto-hide dos controles
  const bump = useCallback(() => {
    setShowControls(true)
    if (hideTimer.current) window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false)
    }, 3000)
  }, [])

  useEffect(() => () => { if (hideTimer.current) window.clearTimeout(hideTimer.current) }, [])

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
    bump()
  }, [bump])

  const seekBy = useCallback((delta: number) => {
    const v = videoRef.current
    if (!v || !isFinite(v.duration)) return
    v.currentTime = Math.min(v.duration, Math.max(0, v.currentTime + delta))
    bump()
  }, [bump])

  const toggleMute = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
    bump()
  }, [bump])

  const changeVolume = useCallback((val: number) => {
    const v = videoRef.current
    if (!v) return
    v.volume = val
    v.muted = val === 0
    setVolume(val)
    setMuted(val === 0)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    else containerRef.current?.requestFullscreen().catch(() => {})
  }, [])

  const togglePiP = useCallback(async () => {
    const v = videoRef.current
    if (!v) return
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture()
      else if (document.pictureInPictureEnabled) await v.requestPictureInPicture()
    } catch { /* navegador bloqueou */ }
  }, [])

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement)
    const onPip = () => setIsPiP(!!document.pictureInPictureElement)
    document.addEventListener('fullscreenchange', onFs)
    document.addEventListener('enterpictureinpicture', onPip)
    document.addEventListener('leavepictureinpicture', onPip)
    return () => {
      document.removeEventListener('fullscreenchange', onFs)
      document.removeEventListener('enterpictureinpicture', onPip)
      document.removeEventListener('leavepictureinpicture', onPip)
    }
  }, [])

  // Atalhos de teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return
      switch (e.key.toLowerCase()) {
        case ' ': case 'k': e.preventDefault(); togglePlay(); break
        case 'arrowright': case 'l': e.preventDefault(); seekBy(10); break
        case 'arrowleft': case 'j': e.preventDefault(); seekBy(-10); break
        case 'f': toggleFullscreen(); break
        case 'm': toggleMute(); break
        case 'p': togglePiP(); break
        case 'arrowup': e.preventDefault(); changeVolume(Math.min(1, volume + 0.1)); break
        case 'arrowdown': e.preventDefault(); changeVolume(Math.max(0, volume - 0.1)); break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePlay, seekBy, toggleFullscreen, toggleMute, togglePiP, changeVolume, volume])

  // Fallback automatico quando a fonte falha
  const handleError = () => {
    const next = sources.findIndex((_, i) => i !== idx && !failed.includes(i))
    if (next === -1) {
      setDead(true)
      return
    }
    setFailed(f => [...f, idx])
    setNotice(`"${src?.provider}" falhou — tentando "${sources[next].provider}"...`)
    window.setTimeout(() => setNotice(null), 4000)
    setIdx(next)
  }

  const pickSource = (i: number) => {
    if (i === idx || failed.includes(i)) return
    setIdx(i)
    setShowMenu(false)
    bump()
  }

  const retryAll = () => {
    setFailed([])
    setIdx(0)
  }

  const seekTo = (clientX: number) => {
    const el = barRef.current
    const v = videoRef.current
    if (!el || !v || !isFinite(duration) || duration <= 0) return
    const rect = el.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    v.currentTime = ratio * duration
    setCurrent(ratio * duration)
  }

  if (!src) return null

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black group select-none"
      onMouseMove={bump}
      onMouseLeave={() => playing && !scrubbing && setShowControls(false)}
      style={{ cursor: showControls ? 'default' : 'none' }}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-contain"
        poster={poster}
        playsInline
        preload="auto"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        onPlay={() => setPlaying(true)}
        onPause={() => { setPlaying(false); setShowControls(true) }}
        onWaiting={() => setBuffering(true)}
        onCanPlay={() => setBuffering(false)}
        onLoadedMetadata={(e) => { setDuration(e.currentTarget.duration || 0); setBuffering(false) }}
        onTimeUpdate={(e) => !scrubbing && setCurrent(e.currentTarget.currentTime)}
        onProgress={(e) => {
          const v = e.currentTarget
          if (v.buffered.length > 0) setBufferedEnd(v.buffered.end(v.buffered.length - 1))
        }}
        onError={handleError}
      >
        <source src={src.url} type={/\.mkv(\?|$)/i.test(src.url) ? 'video/x-matroska' : 'video/mp4'} />
      </video>

      {/* TOPO: titulo + fonte atual */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 flex items-start justify-between gap-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity z-20 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="min-w-0">
          <p className="text-white font-black text-sm truncate drop-shadow">{title}</p>
          <p className="text-white/60 text-xs truncate">{subtitle || '\u00A0'}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="bg-[#00A8E1]/25 border border-[#00A8E1]/40 text-[#7fd8ff] text-[10px] font-black px-2 py-1 rounded-md">
            {src.quality}
          </span>
          <span className="bg-black/50 border border-white/15 text-white/80 text-[10px] font-bold px-2 py-1 rounded-md">
            {src.provider}
          </span>
          {!src.url.startsWith('https:') && (
            <span className="bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-[10px] font-black px-2 py-1 rounded-md" title="Fonte HTTP — pode ser bloqueada fora do localhost">
              HTTP
            </span>
          )}
        </div>
      </div>

      {/* AVISO DE TROCA AUTOMATICA */}
      {notice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-[#1a242f]/95 border border-yellow-500/40 text-yellow-200 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-xl">
          <AlertTriangle size={14} />
          {notice}
        </div>
      )}

      {/* SPINNER */}
      {buffering && !dead && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <Loader2 size={48} className="text-[#00A8E1] animate-spin" />
        </div>
      )}

      {/* PLAY CENTRAL */}
      {!playing && !buffering && !dead && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-[#00A8E1]/90 hover:bg-[#00A8E1] flex items-center justify-center transition-all hover:scale-105 shadow-2xl z-10"
        >
          <Play size={34} fill="#fff" className="text-white ml-1" />
        </button>
      )}

      {/* TODAS AS FONTES FALHARAM */}
      {dead && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/70">
          <div className="text-center max-w-sm mx-auto p-6">
            <AlertTriangle size={40} className="text-red-400 mx-auto mb-4" />
            <h3 className="text-white font-black mb-2">Nenhuma fonte funcionou</h3>
            <p className="text-white/60 text-sm mb-6">Todos os provedores falharam para este título. Tente novamente ou volte mais tarde.</p>
            <button
              type="button"
              onClick={retryAll}
              className="bg-[#00A8E1] hover:bg-[#0090c0] text-white font-black text-sm px-6 py-3 rounded-xl transition-colors"
            >
              TENTAR NOVAMENTE
            </button>
          </div>
        </div>
      )}

      {/* MENU DE FONTES */}
      {showMenu && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-3xl mx-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-black tracking-wider text-sm">FONTES DISPONÍVEIS</h3>
              <button
                type="button"
                onClick={() => setShowMenu(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <Settings size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-6">
              {sources.map((s, i) => {
                const isCurrent = i === idx
                const isFailed = failed.includes(i)
                return (
                  <button
                    key={`${s.provider}-${i}`}
                    type="button"
                    onClick={() => pickSource(i)}
                    disabled={isFailed}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? 'bg-[#00A8E1]/20 border-[#00A8E1]'
                        : isFailed
                          ? 'bg-[#1a242f]/60 border-red-500/30 opacity-50 cursor-not-allowed'
                          : 'bg-[#1a242f] border-[#2a3a48] hover:border-[#00A8E1]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-white font-bold text-sm truncate">{s.provider}</span>
                      <span className="bg-[#00A8E1]/20 text-[#7fd8ff] text-[10px] font-black px-2 py-0.5 rounded shrink-0">
                        {s.quality}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.language && <span className="text-white/50 text-xs">🌎 {s.language}</span>}
                      {!s.url.startsWith('https:') && (
                        <span className="text-yellow-400/80 text-[10px] font-black">HTTP</span>
                      )}
                      {isFailed && <span className="text-red-400 text-xs font-bold">falhou</span>}
                    </div>
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 text-[#00A8E1] text-xs font-black mt-2">
                        <Check size={12} /> REPRODUZINDO
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* CONTROLES INFERIORES */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-10 pb-3 px-4 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {/* BARRA DE PROGRESSO */}
        <div
          ref={barRef}
          className="relative h-4 flex items-center cursor-pointer mb-2 touch-none"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            setScrubbing(true)
            seekTo(e.clientX)
          }}
          onPointerMove={(e) => scrubbing && seekTo(e.clientX)}
          onPointerUp={(e) => {
            setScrubbing(false)
            e.currentTarget.releasePointerCapture(e.pointerId)
          }}
        >
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden relative">
            {duration > 0 && (
              <div
                className="absolute left-0 top-0 h-full bg-white/30 rounded-full"
                style={{ width: `${Math.min(100, (bufferedEnd / duration) * 100)}%` }}
              />
            )}
            <div
              className="absolute left-0 top-0 h-full bg-[#00A8E1] rounded-full"
              style={{ width: duration > 0 ? `${Math.min(100, (current / duration) * 100)}%` : '0%' }}
            />
          </div>
          {duration > 0 && (
            <div
              className={`absolute w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${scrubbing ? 'scale-125' : ''}`}
              style={{ left: `calc(${Math.min(100, (current / duration) * 100)}% - 7px)` }}
            />
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button type="button" onClick={togglePlay} className="text-white hover:text-[#00A8E1] transition-colors p-1">
            {playing ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
          </button>
          <button type="button" onClick={() => seekBy(-10)} className="text-white/80 hover:text-white transition-colors p-1 hidden sm:block">
            <RotateCcw size={18} />
          </button>
          <button type="button" onClick={() => seekBy(10)} className="text-white/80 hover:text-white transition-colors p-1 hidden sm:block">
            <RotateCw size={18} />
          </button>

          <span className="text-white/80 text-xs font-bold tabular-nums whitespace-nowrap">
            {fmt(current)} <span className="text-white/40">/ {fmt(duration)}</span>
          </span>

          <div className="flex-1" />

          <div className="flex items-center gap-2 group/vol">
            <button type="button" onClick={toggleMute} className="text-white hover:text-[#00A8E1] transition-colors p-1">
              {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              className="w-0 group-hover/vol:w-20 focus:w-20 transition-all duration-200 accent-[#00A8E1] cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={() => { setShowMenu(m => !m); bump() }}
            className={`transition-colors p-1 ${showMenu ? 'text-[#00A8E1]' : 'text-white hover:text-[#00A8E1]'}`}
            title="Trocar fonte"
          >
            <Settings size={20} />
          </button>

          <button
            type="button"
            onClick={togglePiP}
            className={`hidden sm:block transition-colors p-1 ${isPiP ? 'text-[#00A8E1]' : 'text-white hover:text-[#00A8E1]'}`}
            title="Picture-in-Picture (P)"
          >
            <PictureInPicture2 size={19} />
          </button>

          <button type="button" onClick={toggleFullscreen} className="text-white hover:text-[#00A8E1] transition-colors p-1" title="Tela cheia (F)">
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>
    </div>
  )
}
