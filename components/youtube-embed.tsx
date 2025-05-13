"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

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

  // Expanded list of reliable relaxing/nature video IDs from YouTube
  const relaxingVideoIds = [
    // Nature scenes
    "TGan48YE9Us", // Beautiful Nature Video
    "BHACKCNDMW8", // 4K Relaxing Nature
    "86YLFOog4GM", // Relaxing Nature Sounds
    "qRTVg8HHzUo", // Beautiful Nature Scenery
    "ynLpZGegiJE", // Peaceful Nature Scenes

    // Aquarium/Ocean videos
    "Z0KTUPXfADg", // Coral Reef Aquarium
    "8plwv25NYRo", // Underwater Wonders
    "zJ7hUvU-d2Q", // Ocean Aquarium

    // Relaxing music with nature
    "lE6RYpe9IT0", // Relaxing Music with Nature
    "WZKW2Hq2fks", // Meditation Music with Nature
    "qFZKK3OXbDw", // Piano with Nature Sounds
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
    const randomIndex = Math.floor(Math.random() * relaxingVideoIds.length)
    setCurrentVideoId(relaxingVideoIds[randomIndex])
  }

  // Try a different video if the current one fails
  const tryDifferentVideo = () => {
    console.log("Trying a different video...")
    selectRandomVideo()
    setFallbackActive(false) // Try YouTube again
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
  }

  // Handle iframe error
  const handleIframeError = () => {
    console.error("YouTube iframe failed to load")
    setFallbackActive(true)
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
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${currentVideoId}`}
          title="Relaxing Videos"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        ></iframe>
      ) : (
        renderFallbackSlideshow()
      )}
    </>
  )
}
