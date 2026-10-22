import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Hebcal geoname IDs for supported cities
const CITIES = {
  netanya: { geonameid: 294071, hebrewName: "נתניה" },
  telaviv: { geonameid: 293397, hebrewName: "תל אביב" },
} as const

type CityKey = keyof typeof CITIES

interface HebcalItem {
  category: string
  title: string
  hebrew?: string
  date: string
}

// Extract HH:MM from an ISO string like 2026-10-23T17:39:00+03:00.
// Uses the wall-clock time embedded in the string, not the server timezone (Vercel runs in UTC).
function wallClockTime(iso: string): string {
  const m = iso.match(/T(\d{2}):(\d{2})/)
  return m ? `${m[1]}:${m[2]}` : ""
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cityParam = (searchParams.get("city") || "netanya").toLowerCase()
  const cityKey: CityKey = cityParam in CITIES ? (cityParam as CityKey) : "netanya"
  const city = CITIES[cityKey]

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    const url = `https://www.hebcal.com/shabbat?cfg=json&geonameid=${city.geonameid}&M=on&b=18`
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" })
    if (!res.ok) throw new Error(`Hebcal responded ${res.status}`)

    const data = (await res.json()) as { items?: HebcalItem[] }
    const items = data.items ?? []

    // First candle lighting (Friday) and last havdalah (Saturday night) cover holiday weekends too
    const candles = items.find((i) => i.category === "candles")
    const havdalah = [...items].reverse().find((i) => i.category === "havdalah")
    const parashat = items.find((i) => i.category === "parashat")
    if (!candles || !havdalah) throw new Error("Hebcal response missing candle/havdalah items")

    // When there is no parasha (e.g. a yom tov Shabbat), fall back to the holiday name
    const holiday = items.find((i) => i.category === "holiday" && i.date.slice(0, 10) >= candles.date.slice(0, 10))

    const parasha = parashat
      ? (parashat.hebrew || parashat.title).replace(/^פרשת\s+/, "").replace(/^Parashat\s+/, "")
      : holiday?.hebrew || holiday?.title || ""

    const shabbatDate = havdalah.date.slice(0, 10)

    return NextResponse.json(
      {
        success: true,
        candleLighting: wallClockTime(candles.date),
        havdalah: wallClockTime(havdalah.date),
        candleISO: candles.date,
        havdalahISO: havdalah.date,
        parasha,
        shabbatDate,
        location: city.hebrewName,
        city: cityKey,
        fetchedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" } },
    )
  } catch (error) {
    console.error("Error fetching Shabbat times:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch Shabbat times",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 },
    )
  } finally {
    clearTimeout(timeout)
  }
}
