"use client"

import { useEffect, useState, useRef } from "react"
import { Flame, Sunset, CalendarIcon, Loader2, MapPinIcon, RefreshCw } from "lucide-react"

// Interface for Shabbat times data from API
interface ShabbatData {
  candleLighting: string;
  havdalah: string;
  parasha: string;
  location: string;
  error?: string;
  lastRefreshed?: Date;
}

// City location data
interface CityLocation {
  name: string;
  hebrewName: string;
  latitude: number;
  longitude: number;
}

// Available cities
const CITIES: CityLocation[] = [
  {
    name: "Netanya",
    hebrewName: "נתניה",
    latitude: 32.3215,
    longitude: 34.8532
  },
  {
    name: "Tel Aviv",
    hebrewName: "תל אביב",
    latitude: 32.0853,
    longitude: 34.7818
  }
];

export function ShabbatTimes() {
  const [selectedCityIndex, setSelectedCityIndex] = useState(0); // Default to Netanya
  const [shabbatTimes, setShabbatTimes] = useState<ShabbatData>({
    candleLighting: "...",
    havdalah: "...",
    parasha: "...",
    location: CITIES[0].hebrewName,
    lastRefreshed: new Date(),
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastCheckedDay, setLastCheckedDay] = useState<number>(new Date().getDay())
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch Shabbat times whenever the selected city changes
  useEffect(() => {
    fetchShabbatTimes(CITIES[selectedCityIndex]);
  }, [selectedCityIndex])

  // Set up periodic checks for day changes
  useEffect(() => {
    // Check if we need to refresh when component mounts
    checkAndRefreshIfNeeded();
    
    // Set up daily interval to check if it's time to refresh (every 6 hours)
    checkIntervalRef.current = setInterval(() => {
      checkAndRefreshIfNeeded();
    }, 6 * 60 * 60 * 1000); // Check every 6 hours
    
    // Cleanup on unmount
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [selectedCityIndex]);

  // Function to check if we need to refresh the data
  const checkAndRefreshIfNeeded = () => {
    const today = new Date();
    const currentDay = today.getDay();
    
    // If it's Sunday (day 0) and we haven't refreshed today
    if (currentDay === 0 && lastCheckedDay !== 0) {
      console.log("It's Sunday, refreshing Shabbat times for next weekend");
      fetchShabbatTimes(CITIES[selectedCityIndex]);
    }
    
    // Update the last checked day
    setLastCheckedDay(currentDay);
  };

  // Manually refresh data
  const refreshData = () => {
    fetchShabbatTimes(CITIES[selectedCityIndex]);
  };

  // Function to switch cities
  const toggleCity = () => {
    setSelectedCityIndex((prevIndex) => (prevIndex === 0 ? 1 : 0));
  }

  async function fetchShabbatTimes(city: CityLocation) {
    try {
      setIsLoading(true)
      
      // Get upcoming Shabbat info from Hebcal API
      const response = await fetch(
        `https://www.hebcal.com/shabbat?cfg=json&latitude=${city.latitude}&longitude=${city.longitude}&havdalahMins=42&timezone=Asia/Jerusalem&M=on`
      )
      
      if (!response.ok) {
        throw new Error("Failed to fetch Shabbat times")
      }
      
      const data = await response.json()
      
      // Find candle lighting and havdalah times
      let candleLighting = "";
      let havdalah = "";
      let parasha = "";
      
      // Parse items from Hebcal response
      if (data.items && data.items.length) {
        for (const item of data.items) {
          if (item.category === "candles") {
            candleLighting = formatTime(new Date(item.date))
          } 
          else if (item.category === "havdalah") {
            havdalah = formatTime(new Date(item.date))
          }
          else if (item.category === "parashat") {
            // Extract just the parasha name in Hebrew
            parasha = item.hebrew || item.title.replace("Parashat ", "")
          }
        }
      }
      
      setShabbatTimes({
        candleLighting: candleLighting || "19:15", // Fallback value
        havdalah: havdalah || "20:25", // Fallback value
        parasha: parasha || "פרשת השבוע", // Fallback value
        location: city.hebrewName,
        lastRefreshed: new Date(),
      })
    } catch (err) {
      console.error("Error fetching Shabbat times:", err)
      setError("שגיאה בטעינת נתוני השבת")
      
      // Set fallback values in case of error
      setShabbatTimes({
        candleLighting: "19:15", 
        havdalah: "20:25",
        parasha: "תצווה",
        location: city.hebrewName,
        lastRefreshed: new Date(),
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Helper function to format time in HH:MM format
  function formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    return `${hours}:${minutes}`
  }

  return (
    <div
      className="flex flex-col items-center text-center p-3 pb-1 rounded-lg relative overflow-hidden h-full"
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        borderRadius: "0.75rem",
      }}
    >
      {/* Background image with improved positioning */}
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
              left: 0
            }}
          />
        </div>
      </div>
      
      {/* Content with better vertical distribution */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <h2 className="text-6xl font-extrabold mb-2 text-amber-800">זמני שבת</h2>
        
        {/* City selector row - more compact */}
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="flex items-center gap-1 cursor-pointer bg-amber-100 px-3 py-1 rounded-full"
            onClick={toggleCity}
          >
            <MapPinIcon className="h-5 w-5 text-amber-700" />
            <span className="text-2xl font-bold text-amber-800">{shabbatTimes.location}</span>
            <span className="text-sm bg-amber-200 px-1.5 py-0.5 rounded-full text-amber-800">לחץ להחלפה</span>
          </div>
          
          {/* Manual refresh button */}
          <button 
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center justify-center bg-amber-100 p-1.5 rounded-full hover:bg-amber-200 transition-colors"
            title="רענן זמני שבת"
          >
            <RefreshCw className={`h-5 w-5 text-amber-700 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {/* Last refreshed info - smaller */}
        {shabbatTimes.lastRefreshed && (
          <div className="text-xl text-amber-700 mb-1">
            עודכן לאחרונה: {shabbatTimes.lastRefreshed.toLocaleDateString('he-IL')}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="h-12 w-12 text-amber-700 animate-spin mb-2" />
            <p className="text-2xl text-amber-900">טוען זמני שבת...</p>
          </div>
        ) : error ? (
          <div className="text-red-600 text-xl font-bold mb-2">{error}</div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2">
            {/* Candle lighting and Havdalah times */}
            <div className="flex justify-center gap-16 mt-2 w-full">
              <div className="flex flex-col items-center">
                <div className="flex items-center mb-1">
                  <Flame className="h-10 w-10 text-orange-500" />
                </div>
                <div className="text-4xl font-bold text-amber-900">הדלקת נרות</div>
                <div className="text-5xl font-bold text-amber-900">{shabbatTimes.candleLighting}</div>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center mb-1">
                  <Sunset className="h-10 w-10 text-purple-500" />
                </div>
                <div className="text-4xl font-bold text-amber-900">צאת שבת</div>
                <div className="text-5xl font-bold text-amber-900">{shabbatTimes.havdalah}</div>
              </div>
            </div>

            {/* Parasha info */}
            <div className="mt-2 mb-0 text-4xl font-bold text-amber-800">
              <div className="flex items-center justify-center gap-2">
                <CalendarIcon className="h-8 w-8" />
                <span>פרשת השבוע: <span className="font-black">{shabbatTimes.parasha}</span></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
