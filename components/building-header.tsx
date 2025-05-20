"use client"

import { useEffect, useState, useRef } from "react"
import { Sun, Cloud, CloudRain, Moon, CloudMoon, CloudFog, CloudSun, CloudSnow, CloudLightning } from "lucide-react"
import { useWeather } from "../hooks/use-weather"

interface BuildingHeaderProps {
  buildingName?: string
}

// Particle interface
interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  connections: number;
  angle?: number; // For special particles
  radius?: number; // For special particles
}

export function BuildingHeader({ buildingName }: BuildingHeaderProps) {
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")
  const weather = useWeather();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const bgAnimationRef = useRef<number>(0);
  const particles = useRef<Particle[]>([]);
  const mousePosition = useRef({ x: 0, y: 0 });
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });
  
  // Get weather icon based on icon name and time of day
  const getWeatherIcon = (iconName: string) => {
    const now = new Date();
    const hour = now.getHours();
    const isDay = hour >= 6 && hour < 20;
    
    switch (iconName) {
      case 'sun':
        return <Sun size={50} className="text-yellow-500 drop-shadow-glow-yellow" />;
      case 'cloud-sun':
        return <CloudSun size={50} className="text-gray-500 drop-shadow-glow-gray" />;
      case 'cloud':
        return <Cloud size={50} className="text-gray-500 drop-shadow-glow-gray" />;
      case 'cloud-fog':
        return <CloudFog size={50} className="text-gray-500 drop-shadow-glow-gray" />;
      case 'cloud-rain':
        return <CloudRain size={50} className="text-blue-500 drop-shadow-glow-blue" />;
      case 'cloud-snow':
        return <CloudSnow size={50} className="text-blue-300 drop-shadow-glow-blue" />;
      case 'cloud-lightning':
        return <CloudLightning size={50} className="text-yellow-600 drop-shadow-glow-yellow" />;
      default:
        return isDay ? 
          <Sun size={50} className="text-yellow-500 drop-shadow-glow-yellow" /> : 
          <Moon size={50} className="text-blue-300 drop-shadow-glow-blue" />;
    }
  };

  // Mouse move tracking for interactive particles
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mousePosition.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Window resize handling
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Get weather-specific particle settings
  const getWeatherParticleSettings = () => {
    if (!weather || weather.loading || weather.error) {
      return {
        count: 80,
        colors: ['#ffffff', '#f0f0f0', '#e0e0e0'],
        speedFactor: 1,
        sizeFactor: 1,
        connectionDistance: 80
      };
    }
    
    // Default settings
    let settings = {
      count: 80,
      colors: ['#ffffff', '#f0f0f0', '#e0e0e0'],
      speedFactor: 1,
      sizeFactor: 1,
      connectionDistance: 80
    };
    
    // Adjust based on weather
    switch (weather.icon) {
      case 'sun':
        settings.colors = ['#ffeb3b', '#ffc107', '#ff9800'];
        settings.count = 100;
        settings.connectionDistance = 100;
        break;
      case 'cloud-sun':
        settings.colors = ['#e0e0e0', '#bbdefb', '#90caf9'];
        settings.count = 90;
        break;
      case 'cloud':
        settings.colors = ['#e0e0e0', '#bdbdbd', '#9e9e9e'];
        settings.count = 70;
        settings.speedFactor = 0.7;
        break;
      case 'cloud-fog':
        settings.colors = ['#e0e0e0', '#cfd8dc', '#b0bec5'];
        settings.count = 120;
        settings.sizeFactor = 1.5;
        settings.speedFactor = 0.5;
        break;
      case 'cloud-rain':
        settings.colors = ['#bbdefb', '#90caf9', '#64b5f6'];
        settings.count = 150;
        settings.speedFactor = 1.5;
        settings.sizeFactor = 0.8;
        break;
      case 'cloud-snow':
        settings.colors = ['#e3f2fd', '#bbdefb', '#e1f5fe'];
        settings.count = 130;
        settings.speedFactor = 0.6;
        settings.sizeFactor = 1.2;
        break;
      case 'cloud-lightning':
        settings.colors = ['#ffeb3b', '#ffd54f', '#ffecb3'];
        settings.count = 90;
        settings.speedFactor = 1.8;
        settings.connectionDistance = 120;
        break;
    }
    
    return settings;
  };

  // Draw animated background patterns
  useEffect(() => {
    if (!bgCanvasRef.current) return;
    
    const canvas = bgCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    
    // Create geometric patterns based on time of day
    const drawBackgroundPatterns = (timestamp: number) => {
      if (!bgCanvasRef.current || !ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const hour = new Date().getHours();
      const isDay = hour >= 6 && hour < 20;
      
      // Draw different patterns based on time of day
      if (hour >= 5 && hour < 10) {
        // Morning pattern - Rising sun rays
        drawSunRays(ctx, canvas.width / 2, canvas.height, timestamp);
      } else if (hour >= 10 && hour < 16) {
        // Day pattern - Floating clouds
        drawClouds(ctx, timestamp);
      } else if (hour >= 16 && hour < 19) {
        // Evening pattern - Setting sun
        drawSunsetWaves(ctx, timestamp);
      } else {
        // Night pattern - Stars and moon
        drawStarsAndMoon(ctx, timestamp);
      }
      
      bgAnimationRef.current = requestAnimationFrame(drawBackgroundPatterns);
    };
    
    // Morning pattern - Sun rays
    const drawSunRays = (ctx: CanvasRenderingContext2D, centerX: number, bottom: number, timestamp: number) => {
      const rayCount = 12;
      const maxLength = Math.max(canvas.width, canvas.height) * 0.8;
      const animationSpeed = timestamp / 3000;
      
      ctx.save();
      ctx.translate(centerX, bottom);
      
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI + animationSpeed % (Math.PI * 2);
        const length = maxLength * (0.6 + Math.sin(animationSpeed + i) * 0.2);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
        
        // Create gradient for each ray
        const gradient = ctx.createLinearGradient(0, 0, Math.cos(angle) * length, Math.sin(angle) * length);
        gradient.addColorStop(0, 'rgba(255, 153, 102, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 153, 102, 0)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 15 + Math.sin(animationSpeed + i * 0.5) * 5;
        ctx.globalAlpha = 0.1 + Math.sin(animationSpeed + i) * 0.05;
        ctx.stroke();
      }
      
      ctx.restore();
    };
    
    // Day pattern - Clouds
    const drawClouds = (ctx: CanvasRenderingContext2D, timestamp: number) => {
      const cloudPositions = [
        { x: canvas.width * 0.2, y: canvas.height * 0.3, size: 60 },
        { x: canvas.width * 0.5, y: canvas.height * 0.2, size: 80 },
        { x: canvas.width * 0.8, y: canvas.height * 0.4, size: 50 },
      ];
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      
      cloudPositions.forEach((cloud, i) => {
        const xOffset = Math.sin(timestamp / 2000 + i) * 20;
        drawCloud(ctx, cloud.x + xOffset, cloud.y, cloud.size);
      });
    };
    
    // Helper to draw a cloud shape
    const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.beginPath();
      ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
      ctx.arc(x + size * 0.4, y - size * 0.1, size * 0.4, 0, Math.PI * 2);
      ctx.arc(x + size * 0.7, y + size * 0.1, size * 0.3, 0, Math.PI * 2);
      ctx.arc(x + size * 0.4, y + size * 0.3, size * 0.4, 0, Math.PI * 2);
      ctx.arc(x - size * 0.2, y + size * 0.2, size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    };
    
    // Evening pattern - Sunset waves
    const drawSunsetWaves = (ctx: CanvasRenderingContext2D, timestamp: number) => {
      const waveCount = 5;
      const waveHeight = canvas.height / 15;
      
      for (let i = 0; i < waveCount; i++) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * 0.5 + i * waveHeight * 2);
        
        for (let x = 0; x < canvas.width; x += 20) {
          const yOffset = Math.sin((x / canvas.width) * Math.PI * 4 + timestamp / 1000 + i) * waveHeight;
          ctx.lineTo(x, canvas.height * 0.5 + i * waveHeight * 2 + yOffset);
        }
        
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, `rgba(255, 94, 98, ${0.1 - i * 0.015})`);
        gradient.addColorStop(1, `rgba(104, 49, 179, ${0.1 - i * 0.015})`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    };
    
    // Night pattern - Stars and moon
    const drawStarsAndMoon = (ctx: CanvasRenderingContext2D, timestamp: number) => {
      // Draw stars
      const starCount = 100;
      const now = timestamp / 1000;
      
      for (let i = 0; i < starCount; i++) {
        const x = (Math.sin(i * 123.45) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(i * 67.89) * 0.5 + 0.5) * canvas.height;
        const size = (Math.sin(now + i) * 0.5 + 0.5) * 2 + 1;
        const alpha = (Math.sin(now * 0.5 + i * 2) * 0.5 + 0.5) * 0.3 + 0.2;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      }
      
      // Draw moon
      const moonX = canvas.width * 0.8;
      const moonY = canvas.height * 0.2;
      const moonSize = canvas.height * 0.1;
      const moonGlow = 20 + Math.sin(now * 0.3) * 5;
      
      // Moon glow
      const gradient = ctx.createRadialGradient(
        moonX, moonY, moonSize,
        moonX, moonY, moonSize + moonGlow
      );
      gradient.addColorStop(0, 'rgba(200, 230, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(200, 230, 255, 0)');
      
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonSize + moonGlow, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Moon
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonSize, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200, 230, 255, 0.3)';
      ctx.fill();
    };
    
    // Set up resize listener
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Start animation
    bgAnimationRef.current = requestAnimationFrame(drawBackgroundPatterns);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(bgAnimationRef.current);
    };
  }, []);

  // Initialize canvas and particles for foreground effects
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      // Create new particles when canvas is resized
      initParticles();
    };
    
    const initParticles = () => {
      particles.current = [];
      const weatherSettings = getWeatherParticleSettings();
      const particleCount = Math.floor((canvas.width * canvas.height) / 10000) * (weatherSettings.count / 80);
      
      // Create regular moving particles
      for (let i = 0; i < particleCount; i++) {
        const colorIndex = Math.floor(Math.random() * weatherSettings.colors.length);
        particles.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: (Math.random() * 3 + 1) * weatherSettings.sizeFactor,
          speedX: (Math.random() * 0.5 - 0.25) * weatherSettings.speedFactor,
          speedY: (Math.random() * 0.5 - 0.25) * weatherSettings.speedFactor,
          opacity: Math.random() * 0.5 + 0.1,
          color: weatherSettings.colors[colorIndex],
          connections: Math.floor(Math.random() * 3)
        });
      }
      
      // Add special orbital particles for sun/lightning
      if (weather?.icon === 'sun' || weather?.icon === 'cloud-lightning') {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const radius = Math.min(canvas.width, canvas.height) * 0.25;
          
          particles.current.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            size: 2 + Math.random() * 2,
            speedX: 0,
            speedY: 0,
            opacity: 0.7,
            color: weatherSettings.colors[0],
            connections: 5,
            angle,
            radius
          });
        }
      }
      
      // Add falling particles for rain or snow
      if (weather?.icon === 'cloud-rain' || weather?.icon === 'cloud-snow') {
        const count = weather.icon === 'cloud-rain' ? 50 : 30;
        const speed = weather.icon === 'cloud-rain' ? 3 : 1;
        const size = weather.icon === 'cloud-rain' ? 1 : 3;
        
        for (let i = 0; i < count; i++) {
          particles.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: size + Math.random() * size,
            speedX: Math.random() * 0.3 - 0.15,
            speedY: speed + Math.random() * speed,
            opacity: 0.7,
            color: weather.icon === 'cloud-rain' ? '#bbdefb' : '#ffffff',
            connections: 0
          });
        }
      }
    };
    
    const animate = (timestamp: number) => {
      if (!canvasRef.current || !ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const weatherSettings = getWeatherParticleSettings();
      
      // Draw connections between particles
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.current.length; i++) {
        const p1 = particles.current[i];
        
        // Only draw connections if this particle should have them
        if (p1.connections > 0) {
          for (let j = i + 1; j < particles.current.length; j++) {
            const p2 = particles.current[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < weatherSettings.connectionDistance) {
              const opacity = (1 - distance / weatherSettings.connectionDistance) * 0.2;
              ctx.beginPath();
              ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }
      
      // Draw and update particles
      particles.current.forEach(particle => {
        // Update special orbital particles
        if (particle.angle !== undefined && particle.radius !== undefined) {
          particle.angle += 0.005;
          particle.x = canvas.width / 2 + Math.cos(particle.angle) * particle.radius;
          particle.y = canvas.height / 2 + Math.sin(particle.angle) * particle.radius;
        } else {
          // Update regular particles
          particle.x += particle.speedX;
          particle.y += particle.speedY;
          
          // Handle special weather-based movement
          if (weather?.icon === 'cloud-rain' || weather?.icon === 'cloud-snow') {
            if (particle.y > canvas.height) {
              particle.y = 0;
              particle.x = Math.random() * canvas.width;
            }
          } else {
            // Wrap particles around screen for non-precipitation particles
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;
          }
        }
        
        // Interactive effect - particles move away from mouse
        const dx = particle.x - mousePosition.current.x;
        const dy = particle.y - mousePosition.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 100;
        
        if (distance < maxDistance) {
          const force = (1 - distance / maxDistance) * 0.2;
          particle.x += dx * force;
          particle.y += dy * force;
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        
        // Special rendering for weather-specific particles
        if (weather?.icon === 'cloud-lightning' && Math.random() < 0.01) {
          // Lightning flash effect
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        } else if (weather?.icon === 'cloud-snow') {
          // Snowflake effect - make it a bit star-shaped
          ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        } else {
          ctx.fillStyle = `rgba(${hexToRgb(particle.color)}, ${particle.opacity})`;
        }
        
        ctx.fill();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Helper function to convert hex to rgb
    const hexToRgb = (hex: string): string => {
      // Remove # if present
      hex = hex.replace('#', '');
      
      // Parse hex
      const r = parseInt(hex.substring(0, 2), 16) || 255;
      const g = parseInt(hex.substring(2, 4), 16) || 255;
      const b = parseInt(hex.substring(4, 6), 16) || 255;
      
      return `${r}, ${g}, ${b}`;
    };
    
    // Set up resize listener
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [weather]);

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

  // Determine background gradient based on time of day
  const getTimeBasedGradient = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 10) {
      // Morning - sunrise colors with enhanced vibrancy
      return "linear-gradient(135deg, #ff9966 0%, #ff5e62 50%, #ff6b6b 100%)";
    } else if (hour >= 10 && hour < 16) {
      // Midday - blue sky with more depth
      return "linear-gradient(135deg, #2193b0 0%, #56ccf2 50%, #6dd5fa 100%)";
    } else if (hour >= 16 && hour < 19) {
      // Evening - sunset colors with purple depth
      return "linear-gradient(135deg, #ff5e62 0%, #ff8c66 50%, #6831b3 100%)";
    } else {
      // Night - deep blue with stars
      return "linear-gradient(135deg, #0f2027 0%, #203a43 30%, #2c5364 70%, #203a43 100%)";
    }
  };

  return (
    <div className="relative flex flex-col items-center text-center w-full h-full overflow-hidden rounded-xl">
      {/* Background gradient layer */}
      <div 
        className="absolute inset-0 z-0" 
        style={{ 
          background: getTimeBasedGradient(),
          animation: "gradientShift 20s ease infinite"
        }}
      />
      
      {/* Background patterns canvas */}
      <canvas 
        ref={bgCanvasRef} 
        className="absolute inset-0 z-5"
      />
      
      {/* Particle canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-10"
      />
      
      {/* Content */}
      <div className="relative z-20 w-full h-full flex flex-col items-center justify-center py-6">
        {/* Building name with text shadow */}
        <h1 
          className="text-6xl font-bold mb-3 text-white tracking-tight" 
          style={{ 
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.2)",
            animation: "fadeInDown 0.5s ease-out"
          }}
        >
          {buildingName || "הגלעד 3 נתניה"}
        </h1>
        
        {/* Time display with glow */}
        <div 
          className="text-8xl font-medium mb-1 text-white" 
          style={{ 
            textShadow: "0 0 10px rgba(255, 255, 255, 0.7), 0 0 40px rgba(255, 255, 255, 0.3)",
            animation: "pulse 1.5s infinite ease-in-out"
          }}
        >
          {currentTime}
        </div>
        
        {/* Date display */}
        <div 
          className="text-4xl text-white opacity-80 mb-5"
          style={{ textShadow: "1px 1px 8px rgba(0, 0, 0, 0.3)" }}
        >
          {currentDate}
        </div>

        {/* Weather info with enhanced glass effect */}
        <div 
          className="flex items-center gap-4 text-5xl font-bold py-4 px-8 rounded-2xl backdrop-blur-xl"
          style={{ 
            background: "rgba(255, 255, 255, 0.15)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            animation: "floatIn 0.7s ease-out"
          }}
        >
          {weather.loading ? (
            <span className="text-white opacity-80">טוען...</span>
          ) : weather.error ? (
            <span className="text-red-300 text-3xl">שגיאה בטעינת מזג האוויר</span>
          ) : (
            <>
              <div className="animate-weather-icon">
                {getWeatherIcon(weather.icon)}
              </div>
              <span className="text-white" style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)" }}>
                {weather.temperature}°C
              </span>
              <span className="text-3xl font-normal text-white opacity-80">
                {weather.description}
              </span>
            </>
          )}
        </div>
      </div>
      
      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.02); }
        }
        
        @keyframes fadeInDown {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes floatIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-weather-icon {
          animation: weatherIconPulse 2s infinite ease-in-out;
        }
        
        @keyframes weatherIconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
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
