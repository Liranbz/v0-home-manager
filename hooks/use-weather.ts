import { useState, useEffect } from 'react';

interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  loading: boolean;
  error: string | null;
}

export function useWeather() {
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 0,
    description: '',
    icon: '',
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Netanya, Israel coordinates
        const latitude = 32.33; 
        const longitude = 34.86;
        
        // Using Open-Meteo API which doesn't require an API key
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        
        // Get weather description based on WMO weather code
        const weatherCode = data.current.weather_code;
        const description = getWeatherDescription(weatherCode);
        
        // Get appropriate icon based on weather code
        const icon = getWeatherIcon(weatherCode);
        
        setWeatherData({
          temperature: Math.round(data.current.temperature_2m),
          description: description,
          icon: icon,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setWeatherData({
          temperature: 0,
          description: '',
          icon: '',
          loading: false,
          error: error instanceof Error ? error.message : 'An unknown error occurred'
        });
      }
    };

    fetchWeather();
    
    // Refresh weather data every 30 minutes
    const intervalId = setInterval(fetchWeather, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Convert WMO weather codes to descriptions
  // Based on https://open-meteo.com/en/docs
  function getWeatherDescription(code: number): string {
    if (code === 0) return 'בהיר';
    if (code === 1) return 'בעיקר בהיר';
    if (code === 2) return 'מעונן חלקית';
    if (code === 3) return 'מעונן';
    if (code >= 45 && code <= 48) return 'ערפל';
    if (code >= 51 && code <= 55) return 'גשם קל';
    if (code >= 56 && code <= 57) return 'גשם קפוא';
    if (code >= 61 && code <= 65) return 'גשם';
    if (code >= 66 && code <= 67) return 'גשם קפוא';
    if (code >= 71 && code <= 77) return 'שלג';
    if (code >= 80 && code <= 82) return 'מטר עז';
    if (code >= 85 && code <= 86) return 'שלג כבד';
    if (code >= 95 && code <= 99) return 'סופת רעמים';
    return 'לא ידוע';
  }

  // Get icon name based on weather code
  function getWeatherIcon(code: number): string {
    if (code === 0) return 'sun';
    if (code === 1 || code === 2) return 'cloud-sun';
    if (code === 3) return 'cloud';
    if (code >= 45 && code <= 48) return 'cloud-fog';
    if ((code >= 51 && code <= 57) || (code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'cloud-rain';
    if (code >= 71 && code <= 77 || (code >= 85 && code <= 86)) return 'cloud-snow';
    if (code >= 95 && code <= 99) return 'cloud-lightning';
    return 'sun';
  }

  return weatherData;
} 