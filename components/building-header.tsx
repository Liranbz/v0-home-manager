"use client"

import { useEffect, useState } from "react"
import { Sun } from "lucide-react"

interface BuildingHeaderProps {
  buildingName?: string
}

export function BuildingHeader({ buildingName }: BuildingHeaderProps) {
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    // Update time every second
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString("he-IL", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      )
      setCurrentDate(
        now.toLocaleDateString("he-IL", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      )
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="text-3xl font-bold mb-2">רחוב הגלעד 3 נתניה</h1>
      <div className="text-2xl font-medium">{currentTime}</div>
      <div className="text-lg text-gray-600 mb-4">{currentDate}</div>

      <div className="flex items-center gap-2 text-2xl font-bold">
        <Sun size={32} className="text-yellow-500" />
        <span>34°C</span>
        <span className="text-lg font-normal text-gray-600">בהיר</span>
      </div>
    </div>
  )
}
