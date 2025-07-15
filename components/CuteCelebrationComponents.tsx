'use client'

import React, { useEffect, useState } from 'react'

// 全屏庆祝动画
export const CelebrationAnimation = ({ duration = 3000 }: { duration?: number }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration])

  if (!isVisible) return null

  const emojis = ['🎉', '✨', '🌟', '💖', '🎊', '🌈', '🎨', '💫']
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random()
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute text-3xl"
          style={{
            left: `${particle.left}%`,
            animation: `confetti ${particle.duration}s ease-out ${particle.delay}s forwards`
          }}
        >
          {particle.emoji}
        </div>
      ))}
      
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

// 成功提示卡片
export const SuccessCard = ({ 
  message = "创作完成！", 
  onClose 
}: { 
  message?: string
  onClose?: () => void 
}) => {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-auto animate-bounce-in">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto flex items-center justify-center">
            <span className="text-4xl">✨</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{message}</h3>
          <p className="text-gray-600">你的AI艺术作品已经完成啦！</p>
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full font-medium hover:scale-105 transition-transform"
            >
              查看作品
            </button>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}

// 彩虹进度完成动画
export const RainbowCompleteAnimation = () => {
  return (
    <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className="absolute inset-y-0 left-0 w-full rounded-full"
        style={{
          background: 'linear-gradient(90deg, #ff6b6b 0%, #ffd93d 16.66%, #6bcf7f 33.33%, #4ecdc4 50%, #a06cd5 66.66%, #ff6b6b 83.33%, #ff6b6b 100%)',
          backgroundSize: '200% 100%',
          animation: 'rainbow-slide 2s linear infinite'
        }}
      />
      
      <style jsx>{`
        @keyframes rainbow-slide {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  )
}

// 星星爆炸效果
export const StarburstEffect = ({ x, y }: { x: number; y: number }) => {
  const stars = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    angle: (i * 45) * Math.PI / 180
  }))

  return (
    <div 
      className="fixed pointer-events-none z-50"
      style={{ left: x, top: y }}
    >
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full"
          style={{
            animation: 'starburst 0.6s ease-out forwards',
            transform: `rotate(${star.angle}rad)`
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes starburst {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(50px, 0) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

// 浮动提示
export const FloatingToast = ({ 
  message, 
  type = 'success' 
}: { 
  message: string
  type?: 'success' | 'info' | 'warning' 
}) => {
  const icons = {
    success: '✅',
    info: '💡',
    warning: '⚠️'
  }

  const colors = {
    success: 'from-green-400 to-blue-500',
    info: 'from-blue-400 to-purple-500',
    warning: 'from-yellow-400 to-orange-500'
  }

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div className={`bg-gradient-to-r ${colors[type]} text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2`}>
        <span className="text-xl">{icons[type]}</span>
        <span className="font-medium">{message}</span>
      </div>
      
      <style jsx>{`
        @keyframes slide-down {
          0% {
            transform: translate(-50%, -100px);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}