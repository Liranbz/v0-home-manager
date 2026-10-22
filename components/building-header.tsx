"use client"

import { useEffect, useState } from "react"
import { Sun, Cloud, CloudRain, Moon, CloudFog, CloudSun, CloudSnow, CloudLightning } from "lucide-react"
import { useWeather } from "../hooks/use-weather"

interface BuildingHeaderProps {
  buildingName?: string
}

// Static background gradient chosen by hour of day (no animation: the lobby TV is weak)
function getTimeBasedGradient(hour: number): string {
  if (hour >= 5 && hour < 10) {
    // Morning - sunrise colors
    return "linear-gradient(135deg, #ff9966 0%, #ff5e62 50%, #ff6b6b 100%)"
  } else if (hour >= 10 && hour < 16) {
    // Midday - blue sky
    return "linear-gradient(135deg, #2193b0 0%, #56ccf2 50%, #6dd5fa 100%)"
  } else if (hour >= 16 && hour < 19) {
    // Evening - sunset colors
    return "linear-gradient(135deg, #ff5e62 0%, #ff8c66 50%, #6831b3 100%)"
  }
  // Night - deep blue
  return "linear-gradient(135deg, #0f2027 0%, #203a43 30%, #2c5364 70%, #203a43 100%)"
}

export function BuildingHeader({ buildingName }: BuildingHeaderProps) {
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")
  const [hour, setHour] = useState(() => new Date().getHours())
  const weather = useWeather()

  // Weather icon by icon name and time of day
  const getWeatherIcon = (iconName: string) => {
    const isDay = hour >= 6 && hour < 20

    switch (iconName) {
      case "sun":
        return <Sun size={35} className="text-yellow-500 drop-shadow-glow-yellow" />
      case "cloud-sun":
        return <CloudSun size={35} className="text-gray-500 drop-shadow-glow-gray" />
      case "cloud":
        return <Cloud size={35} className="text-gray-500 drop-shadow-glow-gray" />
      case "cloud-fog":
        return <CloudFog size={35} className="text-gray-500 drop-shadow-glow-gray" />
      case "cloud-rain":
        return <CloudRain size={35} className="text-blue-500 drop-shadow-glow-blue" />
      case "cloud-snow":
        return <CloudSnow size={35} className="text-blue-300 drop-shadow-glow-blue" />
      case "cloud-lightning":
        return <CloudLightning size={35} className="text-yellow-600 drop-shadow-glow-yellow" />
      default:
        return isDay ? (
          <Sun size={35} className="text-yellow-500 drop-shadow-glow-yellow" />
        ) : (
          <Moon size={35} className="text-blue-300 drop-shadow-glow-blue" />
        )
    }
  }

  useEffect(() => {
    // Update clock every second; hour state only changes when the hour changes
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
      setHour(now.getHours())
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative flex flex-col items-center text-center w-full h-full overflow-hidden rounded-xl">
      {/* Background gradient layer */}
      <div className="absolute inset-0 z-0" style={{ background: getTimeBasedGradient(hour) }} />

      {/* Content */}
      <div className="relative z-20 w-full h-full flex flex-col items-center justify-center py-6">
        {/* Building name */}
        <h1
          className="text-4xl font-bold mb-2 text-white tracking-tight"
          style={{
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.2)",
          }}
        >
          {buildingName || "הגלעד 3 נתניה"}
        </h1>

        {/* Time display */}
        <div
          className="text-6xl font-medium mb-1 text-white"
          style={{
            textShadow: "0 0 10px rgba(255, 255, 255, 0.7), 0 0 40px rgba(255, 255, 255, 0.3)",
          }}
        >
          {currentTime}
        </div>

        {/* Date display */}
        <div
          className="text-2xl text-white opacity-80 mb-3"
          style={{ textShadow: "1px 1px 8px rgba(0, 0, 0, 0.3)" }}
        >
          {currentDate}
        </div>

        {/* Weather info */}
        <div
          className="flex items-center gap-3 text-3xl font-bold py-2 px-6 rounded-2xl"
          style={{
            background: "rgba(255, 255, 255, 0.22)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
          }}
        >
          {weather.loading ? (
            <span className="text-white opacity-80">טוען...</span>
          ) : weather.error ? (
            <span className="text-red-300 text-xl">שגיאה בטעינת מזג האוויר</span>
          ) : (
            <>
              <div>{getWeatherIcon(weather.icon)}</div>
              <span className="text-white" style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)" }}>
                {weather.temperature}°C
              </span>
              <span className="text-xl font-normal text-white opacity-80">{weather.description}</span>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .drop-shadow-glow-yellow {
          filter: drop-shadow(0 0 10px rgba(255, 220, 0, 0.7));
        }

        .drop-shadow-glow-blue {
          filter: drop-shadow(0 0 10px rgba(0, 149, 255, 0.7));
        }

        .drop-shadow-glow-gray {
          filter: drop-shadow(0 0 10px rgba(200, 200, 200, 0.7));
        }
      `}</style>
    </div>
  )
}
