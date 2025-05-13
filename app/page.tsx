"use client"
import { Card } from "@/components/ui/card"
import { YoutubeEmbed } from "@/components/youtube-embed"
import { BuildingHeader } from "@/components/building-header"
import { AnnouncementsList } from "@/components/announcements-list"
import { ShabbatTimes } from "@/components/shabbat-times"
import { NewsTicker } from "@/components/news-ticker"

export default function LobbyDashboard() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Section - YouTube Video (60%) */}
        <div className="w-3/5 p-4">
          <Card className="h-full overflow-hidden rounded-xl shadow-lg">
            <YoutubeEmbed />
          </Card>
        </div>

        {/* Right Section - Building Info (40%) */}
        <div className="w-2/5 p-4 flex flex-col gap-4">
          {/* Top Area - Building Name & Weather */}
          <Card className="p-6 shadow-md rounded-xl">
            <BuildingHeader buildingName="הגלעד 3 נתניה" />
          </Card>

          {/* Middle Area - Announcements */}
          <div className="flex-1 perspective-1000">
            <Card
              className="flex-1 h-full shadow-lg rounded-xl overflow-hidden book-style relative transform-gpu"
              style={{
                background: "linear-gradient(to right, #f1f1f1 0%, #ffffff 3%, #ffffff 97%, #dddddd 100%)",
                boxShadow:
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05), 5px 5px 15px rgba(0, 0, 0, 0.1)",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Book binding effect */}
              <div className="absolute left-0 top-0 bottom-0 w-[10px] bg-gradient-to-r from-amber-700 to-amber-500 rounded-l-lg"></div>

              {/* Page corner fold effect */}
              <div className="absolute top-0 right-0 w-[20px] h-[20px] bg-gradient-to-bl from-gray-200 to-white transform rotate-[-5deg] origin-top-right"></div>

              <div className="h-full pt-1 pl-4">
                <AnnouncementsList />
              </div>
            </Card>
          </div>

          {/* Bottom Area - Shabbat Times */}
          <Card className="p-6 shadow-md rounded-xl">
            <ShabbatTimes />
          </Card>
        </div>
      </div>

      {/* Bottom Ticker */}
      <div className="h-16 bg-white border-t">
        <NewsTicker />
      </div>
    </div>
  )
}
