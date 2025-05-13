"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Volume2, VolumeX, SkipForward } from "lucide-react"

// Nature images for fallback slideshow
const natureImages = [
  "/images/nature-1.jpg",
  "/images/nature-2.jpg",
  "/images/nature-3.jpg",
  "/images/nature-4.jpg",
  "/images/nature-5.jpg",
]

export function YoutubeEmbed() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [fallbackActive, setFallbackActive] = useState(true) // Start with fallback active by default
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(true) // Track mute state
  const [videoError, setVideoError] = useState(false)

  // Updated reliable video IDs from SoothingRelaxation
  const relaxingVideoIds = [
    "qFZKK3OXbDw", // Piano with Nature Sounds
    "lCOF9LN-Opo", // Relaxing Sleep Music
    "HSOtku1j600", // Beautiful Piano Music
    "WJ3-F02-F_Y", // Relaxing Music with Beautiful Nature
    "WZKW2Hq2fks", // Meditation Music with Nature
    "lE6RYpe9IT0", // Relaxing Music with Nature
    "sjkrrmBnpGE", // Beautiful Piano Music
    "hlWiI4xVXKY", // Relaxing Music & Soft Rain
    "77ZozI0rw7w", // Relaxing Sleep Music
    "y7e-GC6oGhg", // Relaxing Music with Water Sounds
    "vwrYbdAypUU"  // Relaxing Piano Music & Rain Sounds
  ]

  // Select a random video on component mount
  useEffect(() => {
    selectRandomVideo()

    // Try to load YouTube after a short delay
    const timer = setTimeout(() => {
      setFallbackActive(false) // Try to load YouTube
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Function to select a random video
  const selectRandomVideo = () => {
    // Reset error state
    setVideoError(false)
    
    // Get a video ID that we haven't tried yet
    let randomIndex = Math.floor(Math.random() * relaxingVideoIds.length)
    let videoId = relaxingVideoIds[randomIndex]
    
    setCurrentVideoId(videoId)
  }

  // Try a different video if the current one fails
  const tryDifferentVideo = () => {
    console.log("Trying a different video...")
    selectRandomVideo()
    setFallbackActive(false) // Try YouTube again
  }

  // Toggle mute state and reload iframe with new mute parameter
  const toggleMute = () => {
    setIsMuted(!isMuted)
    
    // Update the iframe src to apply mute/unmute
    if (iframeRef.current && currentVideoId) {
      const currentSrc = iframeRef.current.src
      const newSrc = currentSrc.replace(
        isMuted ? 'mute=1' : 'mute=0', 
        isMuted ? 'mute=0' : 'mute=1'
      )
      iframeRef.current.src = newSrc
    }
  }

  // Fallback slideshow effect
  useEffect(() => {
    if (!fallbackActive) return

    // Change image every 8 seconds
    const slideshowTimer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % natureImages.length)
    }, 8000)

    return () => clearInterval(slideshowTimer)
  }, [fallbackActive])

  useEffect(() => {
    if (!currentVideoId || fallbackActive) return

    // Ensure the iframe is properly sized
    const resizeIframe = () => {
      if (iframeRef.current) {
        const container = iframeRef.current.parentElement
        if (container) {
          const width = container.clientWidth
          const height = container.clientHeight
          iframeRef.current.width = width.toString()
          iframeRef.current.height = height.toString()
        }
      }
    }

    resizeIframe()
    window.addEventListener("resize", resizeIframe)

    // Set a timeout to check if video loaded
    const loadTimeout = setTimeout(() => {
      if (!videoLoaded) {
        console.log("Video load timeout - activating fallback")
        setFallbackActive(true)
      }
    }, 5000) // 5 seconds timeout

    return () => {
      window.removeEventListener("resize", resizeIframe)
      clearTimeout(loadTimeout)
    }
  }, [currentVideoId, videoLoaded, fallbackActive])

  // Handle iframe load event
  const handleIframeLoad = () => {
    console.log("YouTube iframe loaded")
    setVideoLoaded(true)
    setVideoError(false)
  }

  // Handle iframe error
  const handleIframeError = () => {
    console.error("YouTube iframe failed to load")
    setVideoError(true)
  }

  // Render the fallback slideshow
  const renderFallbackSlideshow = () => {
    return (
      <div className="relative w-full h-full overflow-hidden bg-black">
        {/* Current image with fade transition */}
        {natureImages.map((src, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-2000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="relative w-full h-full">
              <Image
                src={`/placeholder.svg?height=600&width=800`}
                alt={`Nature scene ${index + 1}`}
                fill
                style={{ objectFit: "cover" }}
                priority={index === 0}
              />
            </div>
          </div>
        ))}

        {/* Caption overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">נופי טבע מרהיבים</h2>
          <p className="text-lg opacity-90">תמונות מרגיעות מהטבע</p>
        </div>

        {/* Try YouTube again button */}
        <button
          onClick={tryDifferentVideo}
          className="absolute top-4 right-4 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded backdrop-blur-sm transition-colors"
        >
          נסה להפעיל וידאו
        </button>
      </div>
    )
  }

  // If no video ID is selected yet, show loading
  if (!currentVideoId && !fallbackActive) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-xl">טוען תוכן...</p>
      </div>
    )
  }

  return (
    <>
      {!fallbackActive ? (
        <div className="relative w-full h-full">
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&mute=1&controls=1&showinfo=0&rel=0&loop=1&playlist=${currentVideoId}`}
            title="Relaxing Videos"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          ></iframe>
          
          {/* Video info overlay */}
          <div className="absolute top-4 left-4 right-4 bg-black/50 text-white p-2 rounded backdrop-blur-sm text-sm flex justify-between items-center">
            <p>SoothingRelaxation - Relaxing Piano Music</p>
            
            {/* Skip button for unavailable videos */}
            <button
              onClick={tryDifferentVideo}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Skip to another video"
              title="Try another video"
            >
              <SkipForward size={18} />
            </button>
          </div>
          
          {/* Video error message */}
          {videoError && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
              <p className="text-white mb-4">הסרטון אינו זמין</p>
              <button
                onClick={tryDifferentVideo}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                נסה סרטון אחר
              </button>
            </div>
          )}
          
          {/* Mute/Unmute Button */}
          {videoLoaded && !videoError && (
            <button 
              onClick={toggleMute}
              className="absolute bottom-4 right-4 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          )}
        </div>
      ) : (
        renderFallbackSlideshow()
      )}
    </>
  )
}
