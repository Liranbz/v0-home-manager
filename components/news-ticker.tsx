"use client"

import { useEffect, useRef, useState } from "react"

interface YnetHeadline {
  title: string
  link: string
  pubDate: string
  guid: string
}

interface YnetResponse {
  success: boolean
  headlines: YnetHeadline[]
  source: string
  lastUpdated: string
}

interface NewsItem {
  title: string
  timestamp: string
}

const REFRESH_MS = 5 * 60 * 1000
const FETCH_TIMEOUT_MS = 15_000

// Rendered once; a single CSS transform animation, no per-frame JS.
// Page is dir=rtl. The track gets padding-right: 100% (one container width),
// so at translateX(0) the text sits exactly off the LEFT edge, and at
// translateX(100%) (own width = text + padding) it has fully exited to the
// RIGHT. Hebrew headlines therefore enter start-first with no blank gap.
const TICKER_CSS = `
@keyframes news-ticker-rtl {
  from { transform: translateX(0); }
  to   { transform: translateX(100%); }
}
.news-ticker-track {
  display: inline-block;
  white-space: nowrap;
  padding-right: 100%;
  will-change: transform;
  animation-name: news-ticker-rtl;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
`
const TICKER_SPEED_PX_PER_S = 90

// Format date to Hebrew friendly format (DD/MM HH:MM)
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ""
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `${day}/${month} ${hours}:${minutes}`
}

export function NewsTicker() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    const fetchYnetNews = async () => {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
      try {
        const response = await fetch("/api/ynet", { cache: "no-store", signal: controller.signal })
        if (!response.ok) throw new Error(`API error: ${response.status}`)

        const data: YnetResponse = await response.json()
        if (!data.success || !data.headlines?.length) throw new Error("No headlines returned from API")

        const items = data.headlines.map((h) => ({ title: h.title, timestamp: formatDate(h.pubDate) }))

        if (cancelled) return
        // Only replace state (and restart the animation) when the headlines actually changed.
        setNewsItems((prev) =>
          prev.map((i) => i.title).join("\u0001") === items.map((i) => i.title).join("\u0001") ? prev : items,
        )
        setError(null)
      } catch (err) {
        console.error("Error fetching news:", err)
        // Keep whatever headlines we already have; the error only matters when we have none.
        if (!cancelled) setError("שגיאה בטעינת החדשות - נסו שוב מאוחר יותר")
      } finally {
        clearTimeout(timer)
        if (!cancelled) setLoaded(true)
      }
    }

    fetchYnetNews()
    const refreshInterval = setInterval(fetchYnetNews, REFRESH_MS)

    return () => {
      cancelled = true
      clearInterval(refreshInterval)
    }
  }, [])

  const hasHeadlines = newsItems.length > 0
  const contentKey = newsItems.map((i) => i.title).join("\u0001")
  const trackRef = useRef<HTMLDivElement>(null)

  // Duration from the real rendered width so the scroll speed is constant
  // regardless of how many headlines came back.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const seconds = Math.max(30, track.scrollWidth / TICKER_SPEED_PX_PER_S)
    track.style.animationDuration = `${seconds}s`
  }, [contentKey])

  return (
    <div className="h-full flex items-center overflow-hidden bg-white relative border-t border-gray-200">
      <style>{TICKER_CSS}</style>

      <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center bg-red-600 text-white px-4 font-bold h-full">
        חדשות
      </div>

      <div className="flex-1 overflow-hidden pr-24">
        {hasHeadlines ? (
          <div
            key={contentKey}
            ref={trackRef}
            className="news-ticker-track text-lg font-bold text-gray-800 py-2"
            style={{ fontFamily: "Arial, sans-serif", direction: "rtl", animationDuration: "120s" }}
          >
            {newsItems.map((item, index) => (
              <span key={index} className="mx-12 inline-flex items-center">
                <span className="bg-red-100 text-red-800 px-1 ml-2 text-sm font-bold rounded">חדש</span>
                {item.title}
                {item.timestamp && (
                  <span className="mr-2 text-sm text-gray-500 font-normal">({item.timestamp})</span>
                )}
              </span>
            ))}
          </div>
        ) : error && loaded ? (
          <div className="text-lg font-medium text-red-600 py-2">{error}</div>
        ) : (
          <div className="text-lg font-medium text-gray-600 py-2">טוען חדשות...</div>
        )}
      </div>
    </div>
  )
}
