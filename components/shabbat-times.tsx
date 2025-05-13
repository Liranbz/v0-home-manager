"use client"

import { useEffect, useState } from "react"
import { Flame, Sunset } from "lucide-react"

// Simple function to get the next Friday's date
function getNextFriday() {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 is Sunday, 6 is Saturday
  const daysUntilFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 12 - dayOfWeek
  const nextFriday = new Date(now)
  nextFriday.setDate(now.getDate() + daysUntilFriday)
  return nextFriday
}

// Calculate Shabbat times based on location and season
// This is a simplified version - in a real app, you would use an API
function calculateShabbatTimes() {
  const friday = getNextFriday()

  // Base times that would normally come from an API
  // These times change based on location and season
  const month = friday.getMonth()

  // Simplified logic - in winter, candle lighting is earlier
  const candleLightingHour = 19
  const candleLightingMinute = month >= 3 && month <= 8 ? 15 : 0 // Summer vs winter

  // Shabbat ends approximately 42-72 minutes after sunset depending on location
  // This is a simplification
  let shabbatEndsHour = candleLightingHour + 1
  let shabbatEndsMinute = candleLightingMinute + 10

  if (shabbatEndsMinute >= 60) {
    shabbatEndsHour += 1
    shabbatEndsMinute -= 60
  }

  return {
    candleLighting: `${candleLightingHour}:${candleLightingMinute.toString().padStart(2, "0")}`,
    shabbatEnds: `${shabbatEndsHour}:${shabbatEndsMinute.toString().padStart(2, "0")}`,
    parasha: getParashaForDate(friday),
  }
}

// Simplified function to get the parasha for a given date
// In a real app, this would use a Jewish calendar API
function getParashaForDate(date) {
  const parashaList = [
    "בראשית",
    "נח",
    "לך לך",
    "וירא",
    "חיי שרה",
    "תולדות",
    "ויצא",
    "וישלח",
    "וישב",
    "מקץ",
    "ויגש",
    "ויחי",
    "שמות",
    "וארא",
    "בא",
    "בשלח",
    "יתרו",
    "משפטים",
    "תרומה",
    "תצוה",
    "כי תשא",
    "ויקהל",
    "פקודי",
    "ויקרא",
    "צו",
    "שמיני",
    "תזריע",
    "מצורע",
    "אחרי מות",
    "קדושים",
    "אמור",
    "בהר",
    "בחוקותי",
    "במדבר",
    "נשא",
    "בהעלותך",
    "שלח",
    "קרח",
    "חקת",
    "בלק",
    "פינחס",
    "מטות",
    "מסעי",
    "דברים",
    "ואתחנן",
    "עקב",
    "ראה",
    "שופטים",
    "כי תצא",
    "כי תבוא",
    "ניצבים",
    "וילך",
    "האזינו",
    "וזאת הברכה",
  ]

  // This is a simplified approach - in reality, the Jewish calendar is complex
  // and requires special calculations
  const weekOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000),
  )
  return parashaList[weekOfYear % parashaList.length]
}

export function ShabbatTimes() {
  const [shabbatTimes, setShabbatTimes] = useState({
    candleLighting: "...",
    shabbatEnds: "...",
    parasha: "...",
  })

  useEffect(() => {
    // In a real app, this would be an API call
    const times = calculateShabbatTimes()
    setShabbatTimes(times)
  }, [])

  return (
    <div
      className="flex flex-col items-center text-center p-6 rounded-lg relative"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url('/images/shabbat-background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.1)",
        borderRadius: "0.75rem",
        padding: "1.5rem",
      }}
    >
      <h2 className="text-xl font-bold mb-4">זמני שבת</h2>

      <div className="flex justify-center gap-12">
        <div className="flex flex-col items-center">
          <div className="mb-2">
            <Flame className="h-8 w-8 text-orange-500" />
          </div>
          <div className="text-lg font-bold">הדלקת נרות</div>
          <div className="text-xl">{shabbatTimes.candleLighting}</div>
        </div>

        <div className="flex flex-col items-center">
          <div className="mb-2">
            <Sunset className="h-8 w-8 text-purple-500" />
          </div>
          <div className="text-lg font-bold">צאת שבת</div>
          <div className="text-xl">{shabbatTimes.shabbatEnds}</div>
        </div>
      </div>

      <div className="mt-2 text-sm text-gray-600">פרשת השבוע: {shabbatTimes.parasha}</div>
    </div>
  )
}
