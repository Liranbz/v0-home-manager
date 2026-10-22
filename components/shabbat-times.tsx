"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Flame, Sunset, CalendarIcon, Loader2, MapPinIcon, RefreshCw } from "lucide-react"

// Shape returned by /api/shabbat
interface ShabbatData {
  candleLighting: string
  havdalah: string
  candleISO: string
  havdalahISO: string
  parasha: string
  shabbatDate: string // YYYY-MM-DD (Saturday)
  location: string
}

interface City {
  key: "netanya" | "telaviv"
  hebrewName: string
}

const CITIES: City[] = [
  { key: "netanya", hebrewName: "נתניה" },
  { key: "telaviv", hebrewName: "תל אביב" },
]

const SIX_HOURS = 6 * 60 * 60 * 1000
const TEN_MINUTES = 10 * 60 * 1000

// Format the Saturday date in Hebrew, e.g. "שבת, 24 באוקטובר"
function formatShabbatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number)
  if (!y || !m || !d) return ""
  // Noon local time avoids any day shift from timezone offsets
  const date = new Date(y, m - 1, d, 12)
  return date.toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })
}

export function ShabbatTimes() {
  const [cityIndex, setCityIndex] = useState(0) // Default to Netanya
  const [data, setData] = useState<ShabbatData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const havdalahTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const city = CITIES[cityIndex]

  const fetchShabbatTimes = useCallback(async (cityKey: City["key"]) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/shabbat?city=${cityKey}`, { cache: "no-store" })
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const json = await response.json()
      if (!json.success) throw new Error(json.message || "API returned failure")
      setData(json as ShabbatData)
      setError(false)
    } catch (err) {
      console.error("Error fetching Shabbat times:", err)
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch on mount / city change, then every 6 hours. On failure retry every 10 minutes.
  useEffect(() => {
    fetchShabbatTimes(city.key)
    const interval = setInterval(() => fetchShabbatTimes(city.key), error ? TEN_MINUTES : SIX_HOURS)
    return () => clearInterval(interval)
  }, [city.key, error, fetchShabbatTimes])

  // Refetch once shortly after havdalah so Saturday night already shows next week's times
  useEffect(() => {
    if (havdalahTimerRef.current) clearTimeout(havdalahTimerRef.current)
    if (!data?.havdalahISO) return

    const delay = new Date(data.havdalahISO).getTime() + 5 * 60 * 1000 - Date.now()
    if (delay <= 0) return

    havdalahTimerRef.current = setTimeout(() => fetchShabbatTimes(city.key), delay)
    return () => {
      if (havdalahTimerRef.current) clearTimeout(havdalahTimerRef.current)
    }
  }, [data?.havdalahISO, city.key, fetchShabbatTimes])

  const toggleCity = () => setCityIndex((prev) => (prev === 0 ? 1 : 0))
  const refreshData = () => fetchShabbatTimes(city.key)

  const showTimes = data !== null && !error
  const candleLighting = showTimes ? data.candleLighting : "—"
  const havdalah = showTimes ? data.havdalah : "—"
  const parasha = showTimes && data.parasha ? data.parasha : "—"

  return (
    <div
      className="flex flex-col items-center text-center p-3 pb-1 rounded-lg relative overflow-hidden h-full"
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        borderRadius: "0.75rem",
      }}
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div
          style={{
            width: "120%",
            height: "120%",
            position: "absolute",
            opacity: 0.3,
          }}
        >
          <img
            src="/images/shabbat-background.jpg"
            alt="Shabbat items"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        </div>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        <h2 className="text-5xl font-extrabold mb-1 text-amber-800">זמני שבת</h2>

        {/* City selector row */}
        <div className="flex items-center gap-2 mb-1">
          <div
            className="flex items-center gap-1 cursor-pointer bg-amber-100 px-2 py-1 rounded-full"
            onClick={toggleCity}
          >
            <MapPinIcon className="h-4 w-4 text-amber-700" />
            <span className="text-lg font-bold text-amber-800">{city.hebrewName}</span>
            <span className="text-xs bg-amber-200 px-1 py-0.5 rounded-full text-amber-800">לחץ להחלפה</span>
          </div>

          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center justify-center bg-amber-100 p-1 rounded-full hover:bg-amber-200 transition-colors"
            title="רענן זמני שבת"
          >
            <RefreshCw className={`h-4 w-4 text-amber-700 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Which Shabbat these times are for */}
        {showTimes && (
          <div className="text-sm text-amber-700 mb-0.5">{formatShabbatDate(data.shabbatDate)}</div>
        )}

        {isLoading && !data ? (
          <div className="flex flex-col items-center justify-center py-2">
            <Loader2 className="h-8 w-8 text-amber-700 animate-spin mb-1" />
            <p className="text-lg text-amber-900">טוען זמני שבת...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-1">
            <div className="flex justify-center gap-14 mt-1 w-full">
              <div className="flex flex-col items-center">
                <div className="flex items-center mb-0.5">
                  <Flame className="h-9 w-9 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-amber-900">הדלקת נרות</div>
                <div className="text-6xl font-black text-amber-900 leading-tight">{candleLighting}</div>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center mb-0.5">
                  <Sunset className="h-9 w-9 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-amber-900">צאת שבת</div>
                <div className="text-6xl font-black text-amber-900 leading-tight">{havdalah}</div>
              </div>
            </div>

            <div className="mt-1 mb-0 text-2xl font-bold text-amber-800">
              <div className="flex items-center justify-center gap-1">
                <CalendarIcon className="h-5 w-5" />
                <span>
                  פרשת השבוע: <span className="font-black">{parasha}</span>
                </span>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 font-bold">לא ניתן לטעון זמני שבת</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
