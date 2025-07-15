'use client'

import React, { useState, ReactNode } from 'react'

interface Tab {
  id: string
  label: string
  icon?: string
  badge?: string | number
}

interface CuteTabsProps {
  tabs: Tab[]
  defaultTab?: string
  children: { [key: string]: ReactNode }
  onTabChange?: (tabId: string) => void
}

export const CuteTabs = ({ tabs, defaultTab, children, onTabChange }: CuteTabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '')

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    onTabChange?.(tabId)
  }

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex flex-wrap gap-2 mb-6 p-2 bg-white/50 backdrop-blur rounded-full shadow-cute-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`
              relative px-6 py-3 rounded-full font-medium transition-all duration-300
              ${activeTab === tab.id
                ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-cute-primary scale-105'
                : 'bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-600 hover:scale-105'
              }
            `}
          >
            <span className="flex items-center gap-2">
              {tab.icon && <span className="text-lg">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`
                  inline-flex items-center justify-center px-2 py-0.5 text-xs rounded-full
                  ${activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-pink-100 text-pink-600'
                  }
                `}>
                  {tab.badge}
                </span>
              )}
            </span>
            
            {/* Active indicator */}
            {activeTab === tab.id && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="relative">
        {children && Object.entries(children).map(([tabId, content]) => (
          <div
            key={tabId}
            className={`
              transition-all duration-300
              ${activeTab === tabId
                ? 'opacity-100 transform translate-y-0'
                : 'opacity-0 transform -translate-y-4 absolute inset-0 pointer-events-none'
              }
            `}
          >
            {content}
          </div>
        ))}
      </div>
    </div>
  )
}

// 迷你标签组件（用于小空间）
interface CuteMiniTabsProps {
  tabs: Array<{ id: string; icon: string; label?: string }>
  activeTab: string
  onTabChange: (tabId: string) => void
}

export const CuteMiniTabs = ({ tabs, activeTab, onTabChange }: CuteMiniTabsProps) => {
  return (
    <div className="inline-flex p-1 bg-pink-50 rounded-full shadow-cute-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            p-2 rounded-full transition-all duration-300
            ${activeTab === tab.id
              ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-cute-primary'
              : 'text-gray-600 hover:bg-white hover:text-pink-600'
            }
          `}
          title={tab.label}
        >
          <span className="text-xl">{tab.icon}</span>
        </button>
      ))}
    </div>
  )
}