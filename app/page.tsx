"use client"
import { useEffect } from "react"
import { Card } from "@/components/ui/card"
import { YoutubeEmbed } from "@/components/youtube-embed"
import { BuildingHeader } from "@/components/building-header"
import { AnnouncementsList } from "@/components/announcements-list"
import { ShabbatTimes } from "@/components/shabbat-times"
import { NewsTicker } from "@/components/news-ticker"
import { ShabbatScreen } from "@/components/shabbat-screen"
import { useShabbatMode } from "@/hooks/use-shabbat-mode"

// Hard-reload the page once a day at 03:30 local time so the lobby TV recovers
// from browser memory leaks and picks up new deployments.
const RELOAD_HOUR = 3
const RELOAD_MINUTE = 30

function msUntilNextReload(): number {
  const now = new Date()
  const next = new Date(now)
  next.setHours(RELOAD_HOUR, RELOAD_MINUTE, 0, 0)
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1)
  }
  return next.getTime() - now.getTime()
}

export default function LobbyDashboard() {
  // From candle lighting to havdalah: still picture instead of video, no music.
  const shabbat = useShabbatMode()

  useEffect(() => {
    const timer = setTimeout(() => window.location.reload(), msUntilNextReload())
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className="flex flex-col h-[96vh] my-[2vh] w-[96vw] mx-auto overflow-hidden rounded-2xl"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.15)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
      }}
    >
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Right Section - Building Info (40%) */}
        <div className="w-2/5 p-3 flex flex-col gap-0 min-h-0">
          {/* Top Area - Building Name & Weather */}
          <Card className="p-1 shadow-md rounded-xl mb-1 shrink-0">
            <BuildingHeader buildingName="הגלעד 3 נתניה" />
          </Card>

          {/* Middle Area - Announcements: takes whatever height the header and
              Shabbat cards leave, so the same number of items fit regardless
              of browser zoom or screen size. */}
          <div className="flex-1 min-h-0">
            <Card
              className="h-full shadow-lg rounded-xl overflow-hidden relative"
              style={{
                background: "linear-gradient(to right, #f1f1f1 0%, #ffffff 3%, #ffffff 97%, #dddddd 100%)",
                boxShadow:
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05), 5px 5px 15px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Book binding effect */}
              <div className="absolute left-0 top-0 bottom-0 w-[10px] bg-gradient-to-r from-amber-700 to-amber-500 rounded-l-lg"></div>

              <div className="h-full pt-1 pl-4 overflow-auto">
                <AnnouncementsList />
              </div>
            </Card>
          </div>

          {/* Bottom Area - Shabbat Times: natural content height */}
          <Card className="p-0 shadow-md rounded-xl mt-1 shrink-0">
            <ShabbatTimes />
          </Card>
        </div>

        {/* Left Section - YouTube Video (60%) */}
        <div className="w-3/5 p-3 min-h-0">
          <Card className="h-full overflow-hidden rounded-xl shadow-lg">
            {shabbat.active ? (
              <ShabbatScreen parasha={shabbat.parasha} havdalah={shabbat.havdalah} />
            ) : (
              <YoutubeEmbed />
            )}
          </Card>
        </div>
      </div>

      {/* Bottom Ticker */}
      <div className="h-14 shrink-0 bg-white border-t">
        <NewsTicker />
      </div>
    </div>
  )
}
