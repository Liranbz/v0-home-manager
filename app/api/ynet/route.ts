import { NextResponse } from "next/server"
import Parser from "rss-parser"

export const dynamic = "force-dynamic"

const FEED_URLS = [
  "https://www.ynet.co.il/Integration/StoryRss184.xml", // מבזקים
  "https://www.ynet.co.il/Integration/StoryRss2.xml", // חדשות (fallback)
]

const MAX_HEADLINES = 12
const FETCH_TIMEOUT_MS = 10_000
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

const parser = new Parser({
  customFields: {
    item: [
      ["title", "title"],
      ["link", "link"],
      ["pubDate", "pubDate"],
      ["guid", "guid"],
    ],
  },
})

const stripHtml = (s: string) => s.replace(/<\/?[^>]+(>|$)/g, "").trim()

async function fetchFeedText(url: string): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/rss+xml, application/xml, text/xml, */*" },
      signal: controller.signal,
      cache: "no-store",
    })
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`)
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

export async function GET() {
  const errors: string[] = []

  for (const url of FEED_URLS) {
    try {
      const xml = await fetchFeedText(url)
      const feed = await parser.parseString(xml)

      const headlines = (feed.items ?? [])
        .filter((item) => item.title)
        .slice(0, MAX_HEADLINES)
        .map((item) => ({
          title: stripHtml(String(item.title)),
          link: item.link ?? "",
          pubDate: item.pubDate ?? item.isoDate ?? "",
          guid: item.guid ?? item.link ?? "",
        }))

      if (headlines.length === 0) throw new Error(`No items in ${url}`)

      return NextResponse.json(
        {
          success: true,
          headlines,
          source: "Ynet News",
          feed: url,
          lastUpdated: new Date().toISOString(),
        },
        { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" } },
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(msg)
      console.error("Ynet feed failed:", url, msg)
    }
  }

  return NextResponse.json(
    { success: false, error: "Failed to fetch news headlines", details: errors },
    { status: 502, headers: { "Cache-Control": "no-store" } },
  )
}
