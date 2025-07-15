'use client'

import React, { useEffect, useState } from 'react'

// 浮动装饰元素
export const FloatingDecorations = () => {
  const [bubbles, setBubbles] = useState<Array<{
    id: number
    left: number
    top: number
    size: number
    delay: number
    duration: number
    color: string
  }>>([])

  useEffect(() => {
    // 生成随机泡泡
    const generateBubbles = () => {
      return Array.from({ length: 8 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 10 + Math.random() * 20,
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 10,
        color: ['pink', 'purple', 'blue'][Math.floor(Math.random() * 3)]
      }))
    }
    
    setBubbles(generateBubbles())
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* 浮动泡泡 */}
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className={`absolute rounded-full opacity-10 animate-float`}
          style={{
            left: `${bubble.left}%`,
            top: `${bubble.top}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            animationDelay: `${bubble.delay}s`,
            animationDuration: `${bubble.duration}s`,
            background: bubble.color === 'pink' 
              ? 'radial-gradient(circle, rgba(236, 72, 153, 0.8) 0%, transparent 70%)'
              : bubble.color === 'purple'
              ? 'radial-gradient(circle, rgba(168, 85, 247, 0.8) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, transparent 70%)'
          }}
        />
      ))}
      
      {/* 角落装饰 */}
      <div className="absolute top-0 left-0 w-64 h-64 opacity-5">
        <div className="w-full h-full bg-gradient-to-br from-pink-300 to-transparent rounded-full blur-3xl" />
      </div>
      <div className="absolute bottom-0 right-0 w-96 h-96 opacity-5">
        <div className="w-full h-full bg-gradient-to-tl from-purple-300 to-transparent rounded-full blur-3xl" />
      </div>
    </div>
  )
}

// 交互式星星背景
export const InteractiveStars = () => {
  const [stars, setStars] = useState<Array<{
    id: number
    x: number
    y: number
    size: number
    opacity: number
  }>>([])

  const createStar = (e: MouseEvent) => {
    const newStar = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
      size: 20 + Math.random() * 20,
      opacity: 0.8
    }
    
    setStars(prev => [...prev, newStar])
    
    // 2秒后移除星星
    setTimeout(() => {
      setStars(prev => prev.filter(star => star.id !== newStar.id))
    }, 2000)
  }

  useEffect(() => {
    window.addEventListener('click', createStar)
    return () => window.removeEventListener('click', createStar)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute animate-sparkle"
          style={{
            left: star.x - star.size / 2,
            top: star.y - star.size / 2,
            width: star.size,
            height: star.size,
          }}
        >
          <span className="text-2xl">✨</span>
        </div>
      ))}
    </div>
  )
}

// 页面顶部彩虹条
export const RainbowBar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-50">
      <div 
        className="h-full"
        style={{
          background: 'linear-gradient(90deg, #ff6b6b 0%, #ffd93d 16.66%, #6bcf7f 33.33%, #4ecdc4 50%, #a06cd5 66.66%, #ff6b6b 83.33%, #ff6b6b 100%)',
          backgroundSize: '200% 100%',
          animation: 'rainbow-slide 5s linear infinite'
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

// 可爱的光标跟随效果
export const CuteCursor = () => {
  const [trail, setTrail] = useState<Array<{
    id: number
    x: number
    y: number
  }>>([])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newDot = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY
      }
      
      setTrail(prev => [...prev.slice(-10), newDot])
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none">
      {trail.map((dot, index) => (
        <div
          key={dot.id}
          className="absolute w-2 h-2 bg-pink-400 rounded-full transition-all duration-300"
          style={{
            left: dot.x - 4,
            top: dot.y - 4,
            opacity: (index + 1) / trail.length * 0.5,
            transform: `scale(${(index + 1) / trail.length})`
          }}
        />
      ))}
    </div>
  )
}

// 装饰性图标散布
export const ScatteredIcons = () => {
  const icons = ['🌸', '⭐', '💕', '🌈', '✨', '🦄', '🍭', '🎀']
  const [decorations, setDecorations] = useState<Array<{
    id: number
    icon: string
    left: number
    top: number
    rotate: number
  }>>([])

  useEffect(() => {
    const generateDecorations = () => {
      return Array.from({ length: 15 }, (_, i) => ({
        id: i,
        icon: icons[Math.floor(Math.random() * icons.length)],
        left: Math.random() * 100,
        top: Math.random() * 100,
        rotate: Math.random() * 360
      }))
    }
    
    setDecorations(generateDecorations())
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {decorations.map((deco) => (
        <div
          key={deco.id}
          className="absolute text-2xl opacity-10 animate-wiggle"
          style={{
            left: `${deco.left}%`,
            top: `${deco.top}%`,
            transform: `rotate(${deco.rotate}deg)`,
            animationDelay: `${Math.random() * 2}s`
          }}
        >
          {deco.icon}
        </div>
      ))}
    </div>
  )
}