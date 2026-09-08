'use client'

import { useEffect, useState } from 'react'

export default function LoadingPage() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90
        return prev + Math.random() * 15
      })
    }, 300)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Chef Hat SVG */}
      <div className="relative mb-8">
        <svg
          width="120"
          height="100"
          viewBox="0 0 120 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-bounce"
          style={{ animationDuration: '2s' }}
        >
          {/* Hat Top - Puffy part */}
          <ellipse cx="60" cy="35" rx="45" ry="30" fill="currentColor" className="text-white" />
          <ellipse cx="45" cy="40" rx="25" ry="20" fill="currentColor" className="text-gray-100" />
          <ellipse cx="75" cy="38" rx="28" ry="22" fill="currentColor" className="text-gray-50" />
          <ellipse cx="60" cy="28" rx="30" ry="18" fill="currentColor" className="text-white" />

          {/* Hat Band */}
          <rect x="20" y="55" width="80" height="15" rx="2" fill="currentColor" className="text-primary" />
          <rect x="25" y="58" width="70" height="9" rx="1" fill="currentColor" className="text-primary/80" />

          {/* Hat Base */}
          <rect x="15" y="68" width="90" height="12" rx="3" fill="currentColor" className="text-white" />

          {/* Mustache */}
          <path
            d="M45 85 Q50 80, 55 85 Q60 82, 65 85 Q70 80, 75 85"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            className="text-gray-800"
          />
        </svg>
      </div>

      {/* Animated Omelette */}
      <div className="relative mb-8">
        <div className="relative">
          {/* Plate shadow */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-3 bg-gray-300/50 rounded-full blur-sm" />

          {/* Plate */}
          <div className="w-28 h-8 bg-gray-200 rounded-full shadow-inner border-2 border-gray-300 flex items-center justify-center">
            {/* Omelette */}
            <div
              className="relative w-20 h-5 bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-400 rounded-full border-2 border-yellow-500 shadow-lg animate-omelette-jump"
              style={{
                animationName: 'omeletteJump',
                animationDuration: '1.5s',
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-in-out',
              }}
            >
              {/* Fold lines */}
              <div className="absolute top-1 left-3 w-2 h-1 bg-yellow-600/30 rounded-full rotate-12" />
              <div className="absolute top-2 left-6 w-2 h-1 bg-yellow-600/30 rounded-full -rotate-6" />
              <div className="absolute top-1 right-4 w-2 h-1 bg-yellow-600/30 rounded-full rotate-12" />

              {/* Flip effect */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-amber-300 rounded-full opacity-0 animate-omelette-flip"
                style={{
                  animationName: 'omeletteFlip',
                  animationDuration: '1.5s',
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'ease-in-out',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading Text */}
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3 animate-pulse">
        Stiamo preparando tutto...
      </h1>
      <p className="text-muted-foreground text-sm md:text-base mb-6">
        Gli ingredienti più freschi per te
      </p>

      {/* Progress Bar */}
      <div className="w-64 md:w-80">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {Math.round(progress)}%
        </p>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 text-4xl animate-float opacity-30" style={{ animationDelay: '0s' }}>
        🥚
      </div>
      <div className="absolute top-1/3 right-12 text-3xl animate-float opacity-30" style={{ animationDelay: '0.5s' }}>
        🥓
      </div>
      <div className="absolute bottom-1/4 left-16 text-3xl animate-float opacity-30" style={{ animationDelay: '1s' }}>
        🍅
      </div>
      <div className="absolute bottom-1/3 right-16 text-4xl animate-float opacity-30" style={{ animationDelay: '1.5s' }}>
        🧀
      </div>

      <style jsx>{`
        @keyframes omeletteJump {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          30% {
            transform: translateY(-20px) rotate(-15deg) scale(1.1);
          }
          50% {
            transform: translateY(-30px) rotate(0deg) scale(1.05);
          }
          70% {
            transform: translateY(-20px) rotate(15deg) scale(1.1);
          }
        }

        @keyframes omeletteFlip {
          0%, 100% {
            opacity: 0;
          }
          30%, 70% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(5deg);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
