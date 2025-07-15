'use client'

import React, { useEffect, useState } from 'react'

// 可爱的进度条组件
export const CuteProgressBar = ({ progress = 0 }: { progress: number }) => {
  return (
    <div className="w-full">
      <div className="relative w-full h-8 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full overflow-hidden shadow-inner">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
          style={{ 
            width: `${progress}%`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s linear infinite'
          }}
        >
          {progress > 10 && (
            <span className="text-white text-xl animate-bounce">
              {progress < 30 ? '🎨' : progress < 60 ? '✨' : progress < 90 ? '🌈' : '🎉'}
            </span>
          )}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-600">
            {progress}%
          </span>
        </div>
      </div>
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  )
}

// 可爱的Loading动画
export const CuteLoadingAnimation = () => {
  const [currentMessage, setCurrentMessage] = useState(0)
  const messages = [
    "AI正在施展魔法... ✨",
    "给画笔加点彩虹... 🌈",
    "召唤创意精灵... 🧚‍♀️",
    "调配神奇颜料... 🎨",
    "创作中请稍候... 💫"
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [messages.length])

  return (
    <div className="flex flex-col items-center space-y-6 p-8">
      {/* 主要动画容器 */}
      <div className="relative w-32 h-32">
        {/* 旋转的外圈 */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-400 border-r-purple-400 animate-spin" />
        
        {/* 中心画板 */}
        <div className="absolute inset-4 bg-gradient-to-br from-pink-200 to-purple-200 rounded-2xl shadow-lg flex items-center justify-center">
          <span className="text-4xl animate-pulse">🎨</span>
        </div>

        {/* 飞舞的装饰元素 */}
        {['✨', '💫', '🌟'].map((emoji, i) => (
          <div
            key={i}
            className="absolute text-2xl"
            style={{
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${i * 120}deg) translateY(-60px)`,
              animation: `orbit ${3 + i}s linear infinite`
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* 文字提示 */}
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-gray-700 transition-all duration-500">
          {messages[currentMessage]}
        </p>
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-pink-400 rounded-full"
              style={{
                animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes orbit {
          from { transform: translate(-50%, -50%) rotate(0deg) translateY(-60px); }
          to { transform: translate(-50%, -50%) rotate(360deg) translateY(-60px); }
        }
      `}</style>
    </div>
  )
}

// 带进度的Loading组件
export const CuteLoadingWithProgress = ({ progress = 0 }: { progress: number }) => {
  const stages = [
    { min: 0, max: 25, emoji: '🖌️', text: '准备画布...' },
    { min: 25, max: 50, emoji: '🎨', text: '调配颜色...' },
    { min: 50, max: 75, emoji: '✨', text: '添加魔法...' },
    { min: 75, max: 100, emoji: '🌈', text: '最后润色...' }
  ]

  const currentStage = stages.find(s => progress >= s.min && progress < s.max) || stages[stages.length - 1]

  return (
    <div className="flex flex-col items-center space-y-6 p-8">
      {/* 圆形进度指示器 */}
      <div className="relative w-40 h-40">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="#fce7f3"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="url(#gradient)"
            strokeWidth="12"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 70}`}
            strokeDashoffset={`${2 * Math.PI * 70 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* 中心内容 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl mb-1">{currentStage.emoji}</span>
          <span className="text-2xl font-bold text-gray-700">{progress}%</span>
        </div>
      </div>

      {/* 状态文字 */}
      <p className="text-lg font-medium text-gray-600">{currentStage.text}</p>

      {/* 进度条 */}
      <CuteProgressBar progress={progress} />
    </div>
  )
}

// 成功动画组件
export const CuteSuccessAnimation = () => {
  return (
    <div className="flex flex-col items-center space-y-4 p-8">
      <div className="relative">
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-bounce">
          <span className="text-5xl">✅</span>
        </div>
        {/* 庆祝粒子 */}
        {['🎉', '✨', '🎊', '💖'].map((emoji, i) => (
          <div
            key={i}
            className="absolute text-2xl"
            style={{
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%)`,
              animation: `celebrate ${0.8 + i * 0.1}s ease-out forwards`
            }}
          >
            {emoji}
          </div>
        ))}
      </div>
      <p className="text-xl font-bold text-gray-700">创作完成！</p>
      
      <style jsx>{`
        @keyframes celebrate {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(
              calc(-50% + ${Math.random() * 100 - 50}px),
              calc(-50% - ${50 + Math.random() * 50}px)
            ) scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

// 迷你Loading指示器
export const CuteMiniLoader = () => {
  return (
    <div className="inline-flex items-center space-x-2">
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      <span className="text-sm text-gray-600">加载中</span>
    </div>
  )
}

// 骨架屏Loading
export const CuteSkeletonLoader = () => {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full w-3/4 animate-pulse" />
          <div className="h-3 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full w-1/2 animate-pulse" />
        </div>
      </div>
      <div className="h-40 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl animate-pulse" />
    </div>
  )
}