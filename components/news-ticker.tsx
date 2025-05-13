"use client"

import { useEffect, useRef, useState } from "react"

// In a production environment, this component would connect to a server-side API
// that fetches and parses news from https://www.ynet.co.il/news/category/184
// The current implementation simulates this behavior with hardcoded headlines
export function NewsTicker() {
  const [newsItems, setNewsItems] = useState(["טוען חדשות..."])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Function to fetch news from Ynet category 184
    const fetchYnetNews = async () => {
      try {
        // In a production environment, this would be a server-side API call
        // that fetches and parses the RSS feed or HTML content from:
        // https://www.ynet.co.il/news/category/184

        // These are simulated headlines from the specific Ynet category
        // In a real implementation, these would come from the API
        const ynetCategoryHeadlines = [
          'מדיני | נתניהו בפגישה עם בלינקן: "נמשיך במערכה עד השגת כל היעדים"',
          'ביטחוני | צה"ל תקף מטרות טרור ברצועת עזה; חוסלו מחבלים בחאן יונס',
          'מדיני | שר החוץ: "ישראל מחויבת להשבת כל החטופים הביתה"',
          "ביטחוני | מטח רקטות נורה לעבר יישובי עוטף עזה; אין נפגעים",
          "פוליטי | הקבינט אישר את המשך המבצע בעזה; דיונים על הסכם שחרור חטופים",
          'מדיני | ארה"ב מקדמת יוזמה חדשה להפסקת אש והחזרת החטופים',
          "ביטחוני | פיקוד העורף: הנחיות מיוחדות לתושבי הדרום והמרכז",
          'פוליטי | ראש האופוזיציה: "יש לקדם הסכם מדיני שיביא לשחרור החטופים"',
        ]

        setNewsItems(ynetCategoryHeadlines)
      } catch (error) {
        console.error("Error fetching news:", error)
        setNewsItems(["שגיאה בטעינת החדשות - נסו שוב מאוחר יותר"])
      }
    }

    fetchYnetNews()
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const animationDuration = 30 // seconds

    // Set animation
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
  }, [])

  return (
    <div className="h-full flex items-center overflow-hidden bg-white relative">
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center bg-red-600 text-white px-4 font-bold">
        חדשות
      </div>

      <div className="flex-1 overflow-hidden pl-24">
        <div
          ref={containerRef}
          className="whitespace-nowrap text-lg font-medium text-gray-800"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          {newsItems.map((item, index) => (
            <span key={index} className="mx-12 inline-flex items-center">
              <span className="bg-red-100 text-red-800 px-1 mr-2 text-sm font-bold rounded">חדש</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
