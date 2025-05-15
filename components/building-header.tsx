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
      <h1 className="text-6xl font-bold mb-3">רחוב הגלעד 3 נתניה</h1>
      <div className="text-5xl font-medium mb-1">{currentTime}</div>
      <div className="text-4xl text-gray-600 mb-5">{currentDate}</div>

      <div className="flex items-center gap-3 text-5xl font-bold">
        <Sun size={40} className="text-yellow-500" />
        <span>34°C</span>
        <span className="text-3xl font-normal text-gray-600">בהיר</span>
      </div>
    </div>
  )
}
