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

export function NewsTicker() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([{ title: "טוען חדשות...", timestamp: "" }])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Format date to Hebrew friendly format (DD/MM HH:MM)
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ""
      
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      
      return `${day}/${month} ${hours}:${minutes}`
    } catch (e) {
      return ""
    }
  }

  useEffect(() => {
    // Function to fetch news from Ynet via our backend API
    const fetchYnetNews = async () => {
      try {
        setLoading(true)
        
        // Fetch news from our local API endpoint
        const response = await fetch('/api/ynet')
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        
        const data: YnetResponse = await response.json()
        
        if (!data.success || !data.headlines || data.headlines.length === 0) {
          throw new Error('No headlines returned from API')
        }
        
        // Extract titles and format timestamps from headlines
        const formattedNewsItems = data.headlines.map(headline => ({
          title: headline.title,
          timestamp: formatDate(headline.pubDate)
        }))
        
        setNewsItems(formattedNewsItems)
      } catch (error) {
        console.error("Error fetching news:", error)
        setError('שגיאה בטעינת החדשות - נסו שוב מאוחר יותר')
        setNewsItems([{ title: 'שגיאה בטעינת החדשות - נסו שוב מאוחר יותר', timestamp: "" }])
      } finally {
        setLoading(false)
      }
    }

    fetchYnetNews()
    
    // Set up a refresh interval to fetch news every 5 minutes
    const refreshInterval = setInterval(fetchYnetNews, 5 * 60 * 1000)
    
    return () => {
      clearInterval(refreshInterval)
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    
    // Calculate animation duration based on content length for smoother scrolling
    const contentLength = newsItems.reduce((acc, item) => acc + item.title.length, 0)
    const animationDuration = Math.max(30, contentLength / 5) // at least 30s, longer for more content
    
    // Set up animation
    container.style.animationDuration = `${animationDuration}s`
    container.style.animationName = "ticker"
    container.style.animationTimingFunction = "linear"
    container.style.animationIterationCount = "infinite"

    // Create keyframes for the animation
    const keyframes = `
      @keyframes ticker {
        0% {
          transform: translateX(100%);
        }
        100% {
          transform: translateX(-100%);
        }
      }
    `

    // Add keyframes to document
    const styleSheet = document.createElement("style")
    styleSheet.type = "text/css"
    styleSheet.innerText = keyframes
    document.head.appendChild(styleSheet)

    return () => {
      document.head.removeChild(styleSheet)
    }
  }, [newsItems])

  return (
    <div className="h-full flex items-center overflow-hidden bg-white relative border-t border-gray-200">
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center bg-red-600 text-white px-4 font-bold h-full">
        חדשות
      </div>

      <div className="flex-1 overflow-hidden pl-24">
        {loading && newsItems.length <= 1 && !newsItems[0].timestamp ? (
          <div className="text-lg font-medium text-gray-600 py-2">טוען חדשות...</div>
        ) : error ? (
          <div className="text-lg font-medium text-red-600 py-2">{error}</div>
        ) : (
          <div
            ref={containerRef}
            className="whitespace-nowrap text-lg font-bold text-gray-800 py-2"
            style={{ fontFamily: "Arial, sans-serif", direction: "rtl" }}
          >
            {newsItems.map((item, index) => (
              <span key={index} className="mx-12 inline-flex items-center">
                <span className="bg-red-100 text-red-800 px-1 mr-2 text-sm font-bold rounded">חדש</span>
                {item.title}
                {item.timestamp && (
                  <span className="mr-2 text-sm text-gray-500 font-normal">
                    ({item.timestamp})
                  </span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
