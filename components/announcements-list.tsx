"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AlertCircle, Trash2, PenToolIcon as Tools, CableCarIcon as Elevator } from "lucide-react"

interface Announcement {
  id: number
  title: string
  content: string
  icon: React.ReactNode
  priority: "high" | "medium" | "low"
}

export function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 1,
      title: "פינוי אשפה",
      content: "תזכורת: פינוי אשפה מתבצע בימים א', ג', ה'. נא להוציא את האשפה עד השעה 20:00.",
      icon: <Trash2 className="h-6 w-6 text-green-600" />,
      priority: "medium",
    },
    {
      id: 2,
      title: "פינוי גזם",
      content: "פינוי גזם ניתן להוציא החל מיום א׳ ב20:00 בערב ועד ליום ב׳ בבוקר",

      icon: <Tools className="h-6 w-6 text-blue-600" />,
      priority: "high",
    },
    {
      id: 3,
      title: "ניקיון הבנין",
      content: "דיירים יקרים נא לשמור על ניקיון הבנין.",
      icon: <Elevator className="h-6 w-6 text-red-600" />,
      priority: "high",
    },
  ])

  // Auto-scroll through announcements with page-turning effect
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState("next")

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection("next")
      setIsAnimating(true)

      // After animation starts, update the active index
      setTimeout(() => {
        setActiveIndex((current) => (current + 1) % announcements.length)

        // Reset animation state after it completes
        setTimeout(() => {
          setIsAnimating(false)
        }, 500)
      }, 500)
    }, 8000)

    return () => clearInterval(interval)
  }, [announcements.length])

  // Add CSS for page turn animation
  useEffect(() => {
    const styleSheet = document.createElement("style")
    styleSheet.type = "text/css"

    // Define keyframes outside of the string to avoid conditional hook call
    const keyframes = `
      @keyframes pageTurn {
        0% {
          transform: rotateY(0deg);
          opacity: 1;
        }
        50% {
          transform: rotateY(${direction === "next" ? "-" : ""}80deg);
          opacity: 0.5;
        }
        100% {
          transform: rotateY(0deg);
          opacity: 1;
        }
      }
    `

    styleSheet.innerText = `
      ${keyframes}
      .page-turn-animation {
        animation: pageTurn 1s ease-in-out;
      }
    `
    document.head.appendChild(styleSheet)

    return () => {
      document.head.removeChild(styleSheet)
    }
  }, [direction])

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 p-4 border-b">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          הודעות חשובות
        </h2>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <div className="h-full relative">
          {announcements.map((announcement, index) => (
            <div
              key={announcement.id}
              className={`absolute top-0 left-0 right-0 p-4 rounded-lg border transition-all duration-1000 
                ${
                  announcement.priority === "high"
                    ? "border-red-200 bg-red-50"
                    : announcement.priority === "medium"
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-gray-200 bg-gray-50"
                }
                ${index === activeIndex ? "opacity-100 z-10 transform-gpu rotate-0" : "opacity-0 z-0"}
                ${isAnimating && index === activeIndex ? "page-turn-animation" : ""}
              `}
              style={{
                transformOrigin: direction === "next" ? "left center" : "right center",
              }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">{announcement.icon}</div>
                <div>
                  <h3 className="text-lg font-bold">{announcement.title}</h3>
                  <p className="text-gray-700">{announcement.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-2 flex justify-center gap-2">
        {announcements.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              index === activeIndex ? "bg-amber-600 w-4" : "bg-gray-300"
            }`}
            onClick={() => {
              setDirection(index > activeIndex ? "next" : "prev")
              setIsAnimating(true)
              setTimeout(() => {
                setActiveIndex(index)
                setTimeout(() => setIsAnimating(false), 500)
              }, 500)
            }}
          />
        ))}
      </div>
    </div>
  )
}
