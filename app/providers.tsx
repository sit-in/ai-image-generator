'use client'

import { useEffect } from 'react'

export function StyleProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 在开发环境下，确保样式表正确加载
    if (process.env.NODE_ENV === 'development') {
      // 强制重新加载样式表如果检测到样式丢失
      const checkStyles = () => {
        const root = document.documentElement
        const computedStyle = window.getComputedStyle(root)
        
        // 检查关键CSS变量是否存在
        const hasCuteStyles = computedStyle.getPropertyValue('--cute-radius-sm')
        
        if (!hasCuteStyles) {
          console.warn('样式表可能丢失，尝试重新加载...')
          // 创建一个新的link标签来重新加载样式
          const links = document.querySelectorAll('link[rel="stylesheet"]')
          links.forEach(link => {
            const href = link.getAttribute('href')
            if (href) {
              link.setAttribute('href', href.includes('?') ? href + '&reload=' + Date.now() : href + '?reload=' + Date.now())
            }
          })
        }
      }
      
      // 初始检查
      setTimeout(checkStyles, 1000)
      
      // 监听页面可见性变化
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          checkStyles()
        }
      })
    }
  }, [])
  
  return <>{children}</>
}