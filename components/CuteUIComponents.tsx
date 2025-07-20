'use client'

import React, { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from 'react'

// 可爱按钮组件
interface CuteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'rainbow'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
}

export const CuteButton = ({ 
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props 
}: CuteButtonProps) => {
  const variants = {
    primary: 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-cute-primary hover:shadow-cute-lg',
    secondary: 'bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 shadow-cute-secondary hover:shadow-cute-md',
    ghost: 'bg-white/80 backdrop-blur text-gray-700 shadow-cute-ghost hover:shadow-cute-md',
    rainbow: 'rainbow-border bg-white text-gray-700 shadow-cute-md hover:shadow-cute-lg'
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-2xl',
    md: 'px-6 py-3 text-base rounded-3xl',
    lg: 'px-8 py-4 text-lg rounded-full'
  }
  
  return (
    <button
      className={`
        ${variants[variant]} 
        ${sizes[size]}
        font-medium transform transition-all duration-300
        hover:scale-105 active:scale-95
        relative overflow-hidden group
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {/* 闪光效果 */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
      </div>
      
      {/* 内容 */}
      <span className="relative z-10 flex items-center justify-center space-x-2">
        {loading ? (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        ) : (
          <>
            {icon && <span>{icon}</span>}
            <span>{children}</span>
          </>
        )}
      </span>
    </button>
  )
}

// 可爱卡片组件
interface CuteCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
  rainbow?: boolean
  className?: string
}

export const CuteCard = ({ 
  children, 
  hover = true,
  rainbow = false,
  className = '',
  ...props
}: CuteCardProps) => {
  return (
    <div 
      className={`
        ${rainbow ? 'rainbow-border' : ''}
        bg-white rounded-3xl p-6 shadow-cute-md
        ${hover ? 'hover:shadow-cute-lg hover:-translate-y-1' : ''}
        transition-all duration-300
        relative overflow-hidden
        ${className}
      `}
      {...props}
    >
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-50" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full translate-y-12 -translate-x-12 opacity-50" />
      
      {/* 内容 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// 可爱输入框组件
interface CuteInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode
  error?: string
}

export const CuteInput = ({ 
  icon,
  error,
  className = '',
  ...props 
}: CuteInputProps) => {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        className={`
          w-full px-4 py-3 ${icon ? 'pl-12' : ''}
          bg-white border-2 border-pink-200
          rounded-2xl transition-all duration-300
          focus:outline-none focus:border-pink-400 focus:scale-[1.02]
          focus:shadow-cute-primary
          placeholder:text-gray-400
          ${error ? 'border-red-400' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-500 flex items-center space-x-1">
          <span>❌</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}

// 可爱选择框组件
interface CuteSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  icon?: ReactNode
  options: { value: string; label: string }[]
}

export const CuteSelect = ({ 
  icon,
  options,
  className = '',
  ...props 
}: CuteSelectProps) => {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </div>
      )}
      <select
        className={`
          w-full px-4 py-3 ${icon ? 'pl-12' : ''}
          bg-white border-2 border-pink-200
          rounded-2xl transition-all duration-300
          focus:outline-none focus:border-pink-400 focus:scale-[1.02]
          focus:shadow-cute-primary
          appearance-none cursor-pointer
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {/* 自定义下拉箭头 */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <span className="text-gray-400">▼</span>
      </div>
    </div>
  )
}

// 可爱徽章组件
interface CuteBadgeProps {
  children: ReactNode
  color?: 'pink' | 'purple' | 'blue' | 'green' | 'yellow'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
}

export const CuteBadge = ({ 
  children,
  color = 'pink',
  size = 'md',
  pulse = false
}: CuteBadgeProps) => {
  const colors = {
    pink: 'bg-pink-100 text-pink-700 border-pink-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }
  
  return (
    <span 
      className={`
        inline-flex items-center rounded-full
        border font-medium
        ${colors[color]}
        ${sizes[size]}
        ${pulse ? 'animate-cute-pulse' : ''}
      `}
    >
      {children}
    </span>
  )
}

// 可爱分隔线
export const CuteDivider = ({ text }: { text?: string }) => {
  return (
    <div className="relative my-8">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t-2 border-dashed border-pink-200" />
      </div>
      {text && (
        <div className="relative flex justify-center">
          <span className="px-4 bg-white text-sm text-gray-500">
            {text}
          </span>
        </div>
      )}
    </div>
  )
}

// 可爱开关组件
interface CuteToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}

export const CuteToggle = ({ checked, onChange, label }: CuteToggleProps) => {
  return (
    <label className="flex items-center space-x-3 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div 
          className={`
            w-12 h-6 rounded-full transition-colors duration-300
            ${checked ? 'bg-gradient-to-r from-pink-400 to-purple-400' : 'bg-gray-300'}
          `}
        />
        <div 
          className={`
            absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
            transition-transform duration-300 shadow-md
            ${checked ? 'translate-x-6' : ''}
          `}
        >
          <span className="absolute inset-0 flex items-center justify-center text-xs">
            {checked ? '✨' : '💤'}
          </span>
        </div>
      </div>
      {label && <span className="text-gray-700">{label}</span>}
    </label>
  )
}