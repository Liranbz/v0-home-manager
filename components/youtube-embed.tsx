"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Volume2, VolumeX, SkipForward } from "lucide-react"

// ---------------------------------------------------------------------------
// Minimal typings for the YouTube IFrame Player API (no @types/youtube needed)
// ---------------------------------------------------------------------------
interface YTPlayer {
  destroy: () => void
  loadVideoById: (videoId: string) => void
  playVideo: () => void
  mute: () => void
  unMute: () => void
  setPlaybackQuality: (quality: string) => void
}

interface YTPlayerEvent {
  target: YTPlayer
  data: number
}

interface YTNamespace {
  Player: new (
    element: HTMLElement,
    options: {
      host?: string
      videoId: string
      width: number
      height: number
      playerVars: Record<string, string | number>
      events: {
        onReady?: (e: YTPlayerEvent) => void
        onStateChange?: (e: YTPlayerEvent) => void
        onError?: (e: YTPlayerEvent) => void
      }
    }
  ) => YTPlayer
  PlayerState: {
    ENDED: number
    PLAYING: number
    PAUSED: number
    BUFFERING: number
    CUED: number
  }
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Verified working video IDs (checked via YouTube oEmbed, 2026-10-22)
const VIDEO_IDS = [
  "1ZYbU82GVz4", // Flying: Relaxing Sleep Music - Soothing Relaxation
  "z-qigE1ym40", // Beautiful Relaxing Music - Inner Peace Look Inside
  "prfZFyp4XZk", // 12 Hours of Stunning Aquarium Relax Music
  "-CDH2fN7XXA", // Calm Marimba Music & Water Sounds in Aquarium - Soothing Relaxation
  "_kvEuReNgsw", // Aquarium 4K - Coral Reef Fish with Relaxing Music
]

// Nature images for the fallback slideshow
const natureImages = [
  "/images/nature-1.jpg",
  "/images/nature-2.jpg",
  "/images/nature-3.jpg",
  "/images/nature-4.jpg",
  "/images/nature-5.jpg",
]

// The player is rendered at a fixed PHYSICAL size of 640x360 and CSS-scaled
// to fill the card. YouTube picks the stream quality from the player's
// physical pixel size (CSS px × devicePixelRatio), so this caps it at 480p
// ("large") instead of the 1080p a full-size player would get. On a retina
// screen (DPR 2) the CSS box is 320x180; on a TV (DPR 1) it is 640x360.
// Measured: 1280x720 physical → hd720, 640x360 → large (480p), 480x270 →
// still large; YouTube does not go lower on auto, so 640x360 is the floor.
const PLAYER_PHYSICAL_WIDTH = 640
const PLAYER_PHYSICAL_HEIGHT = 360

function getPlayerBox() {
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
  return {
    w: Math.round(PLAYER_PHYSICAL_WIDTH / dpr),
    h: Math.round(PLAYER_PHYSICAL_HEIGHT / dpr),
  }
}

const BUFFERING_TIMEOUT_MS = 20 * 1000 // stuck buffering → next video
const ROTATE_INTERVAL_MS = 2 * 60 * 60 * 1000 // switch video every 2 h
const FALLBACK_RETRY_MS = 10 * 60 * 1000 // retry YouTube every 10 min
const SLIDESHOW_INTERVAL_MS = 8 * 1000

// Error codes from the IFrame API that mean "this video won't play here"
const FATAL_ERROR_CODES = new Set([2, 5, 100, 101, 150])

// ---------------------------------------------------------------------------
// Load the IFrame API once, safe under React strict mode / re-mounts
// ---------------------------------------------------------------------------
let apiPromise: Promise<YTNamespace> | null = null

function loadYouTubeApi(): Promise<YTNamespace> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"))
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT)
  if (apiPromise) return apiPromise

  apiPromise = new Promise<YTNamespace>((resolve) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      if (window.YT) resolve(window.YT)
    }
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script")
      script.src = "https://www.youtube.com/iframe_api"
      script.async = true
      document.head.appendChild(script)
    }
  })

  return apiPromise
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function YoutubeEmbed() {
  const [mode, setMode] = useState<"video" | "fallback">("video")
  const [videoIndex, setVideoIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const [playerReady, setPlayerReady] = useState(false)
  const [scale, setScale] = useState(1)
  const [box, setBox] = useState({ w: PLAYER_PHYSICAL_WIDTH, h: PLAYER_PHYSICAL_HEIGHT })
  const [imageIndex, setImageIndex] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const playerMountRef = useRef<HTMLDivElement>(null) // stable wrapper; YT replaces its child
  const playerRef = useRef<YTPlayer | null>(null)
  const videoIndexRef = useRef(0)
  const failedRef = useRef<Set<number>>(new Set())
  const bufferingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearBufferingTimer = () => {
    if (bufferingTimerRef.current) {
      clearTimeout(bufferingTimerRef.current)
      bufferingTimerRef.current = null
    }
  }

  // Move to the next video (round-robin). If `markFailed` and every video has
  // failed in this cycle, switch to the slideshow fallback.
  const advance = useCallback((markFailed: boolean) => {
    clearBufferingTimer()
    const current = videoIndexRef.current

    if (markFailed) {
      failedRef.current.add(current)
      if (failedRef.current.size >= VIDEO_IDS.length) {
        console.warn("All YouTube videos failed - switching to slideshow fallback")
        failedRef.current.clear()
        setMode("fallback")
        return
      }
    }

    const next = (current + 1) % VIDEO_IDS.length
    videoIndexRef.current = next
    setVideoIndex(next)

    if (playerRef.current) {
      try {
        playerRef.current.loadVideoById(VIDEO_IDS[next])
        playerRef.current.setPlaybackQuality("small")
      } catch (e) {
        console.error("loadVideoById failed", e)
      }
    }
  }, [])

  // --- Scale the fixed-size player to cover the container ------------------
  useEffect(() => {
    if (mode !== "video") return
    const container = containerRef.current
    if (!container) return

    const update = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      if (!w || !h) return
      const b = getPlayerBox()
      setBox(b)
      setScale(Math.max(w / b.w, h / b.h))
    }

    update()

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(update)
      ro.observe(container)
      return () => ro.disconnect()
    }
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [mode])

  // --- Create / destroy the player ----------------------------------------
  useEffect(() => {
    if (mode !== "video") return

    let cancelled = false
    const mount = playerMountRef.current
    if (!mount) return

    // YT.Player replaces the element it is given, so create a fresh child
    // every time (the previous one is removed by destroy()).
    const host = document.createElement("div")
    mount.appendChild(host)

    setPlayerReady(false)

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled) return
        const videoId = VIDEO_IDS[videoIndexRef.current]

        playerRef.current = new YT.Player(host, {
          host: "https://www.youtube-nocookie.com",
          videoId,
          width: getPlayerBox().w,
          height: getPlayerBox().h,
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            rel: 0,
            playsinline: 1,
            loop: 1,
            playlist: videoId,
            origin: window.location.origin,
            vq: "small",
            iv_load_policy: 3,
            modestbranding: 1,
          },
          events: {
            onReady: (e) => {
              if (cancelled) return
              e.target.setPlaybackQuality("small")
              e.target.mute()
              e.target.playVideo()
              setIsMuted(true)
              setPlayerReady(true)
            },
            onStateChange: (e) => {
              if (cancelled) return
              const S = YT.PlayerState
              if (e.data === S.BUFFERING) {
                if (!bufferingTimerRef.current) {
                  bufferingTimerRef.current = setTimeout(() => {
                    bufferingTimerRef.current = null
                    console.warn("Video stuck buffering - skipping")
                    advance(true)
                  }, BUFFERING_TIMEOUT_MS)
                }
                return
              }
              clearBufferingTimer()
              if (e.data === S.PLAYING) {
                failedRef.current.clear() // a video plays → reset the failure cycle
                e.target.setPlaybackQuality("small")
              } else if (e.data === S.ENDED) {
                advance(false)
              }
            },
            onError: (e) => {
              if (cancelled) return
              console.error("YouTube player error", e.data)
              if (FATAL_ERROR_CODES.has(e.data)) advance(true)
            },
          },
        })
      })
      .catch((err) => {
        console.error("Failed to load YouTube API", err)
        if (!cancelled) setMode("fallback")
      })

    return () => {
      cancelled = true
      clearBufferingTimer()
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch {
          /* ignore */
        }
        playerRef.current = null
      }
      if (host.parentNode === mount) mount.removeChild(host)
      setPlayerReady(false)
    }
  }, [mode, advance])

  // --- Rotate to a different video every 2 hours ---------------------------
  useEffect(() => {
    if (mode !== "video") return
    const id = setInterval(() => advance(false), ROTATE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [mode, advance])

  // --- Fallback: slideshow + periodic retry of YouTube ----------------------
  useEffect(() => {
    if (mode !== "fallback") return
    const slide = setInterval(
      () => setImageIndex((i) => (i + 1) % natureImages.length),
      SLIDESHOW_INTERVAL_MS
    )
    const retry = setTimeout(() => setMode("video"), FALLBACK_RETRY_MS)
    return () => {
      clearInterval(slide)
      clearTimeout(retry)
    }
  }, [mode])

  // --- Controls ------------------------------------------------------------
  const toggleMute = () => {
    const p = playerRef.current
    if (!p) return
    try {
      if (isMuted) p.unMute()
      else p.mute()
      setIsMuted(!isMuted)
    } catch (e) {
      console.error("toggleMute failed", e)
    }
  }

  const tryVideoAgain = () => {
    failedRef.current.clear()
    setMode("video")
  }

  // --- Render --------------------------------------------------------------
  if (mode === "fallback") {
    return (
      <div className="relative w-full h-full overflow-hidden bg-black">
        {natureImages.map((src, index) => (
          <img
            key={src}
            src={src}
            alt={`Nature scene ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-2000 ${
              index === imageIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">נופי טבע מרהיבים</h2>
          <p className="text-lg opacity-90">תמונות מרגיעות מהטבע</p>
        </div>

        <button
          onClick={tryVideoAgain}
          className="absolute top-4 right-4 px-4 py-2 bg-black/60 hover:bg-black/80 text-white rounded transition-colors"
        >
          נסה להפעיל וידאו
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-black">
      {/* Fixed 640x360-physical-pixel player, scaled to cover the container */}
      <div
        ref={playerMountRef}
        className="yt-player-mount"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: box.w,
          height: box.h,
          marginTop: -box.h / 2,
          marginLeft: -box.w / 2,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      />

      {!playerReady && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-xl">
          טוען וידאו...
        </div>
      )}

      {/* Info bar + skip */}
      <div className="absolute top-4 left-4 right-4 bg-black/60 text-white p-2 rounded text-sm flex justify-between items-center">
        <p>מוזיקה מרגיעה ({videoIndex + 1}/{VIDEO_IDS.length})</p>
        <button
          onClick={() => advance(false)}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Skip to another video"
          title="סרטון הבא"
        >
          <SkipForward size={18} />
        </button>
      </div>

      {/* Mute / unmute */}
      {playerReady && (
        <button
          onClick={toggleMute}
          className="absolute bottom-4 right-4 p-3 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      )}
    </div>
  )
}
