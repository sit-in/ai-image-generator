'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface CSRFContextType {
  token: string | null
  getToken: () => Promise<string>
}

const CSRFContext = createContext<CSRFContextType | undefined>(undefined)

export function CSRFProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)

  const getToken = async (): Promise<string> => {
    if (token) return token

    try {
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setToken(data.token)
        return data.token
      }
    } catch (error) {
      console.error('获取CSRF token失败:', error)
    }
    
    throw new Error('无法获取CSRF token')
  }

  useEffect(() => {
    // 页面加载时获取token
    getToken().catch(console.error)
  }, [])

  return (
    <CSRFContext.Provider value={{ token, getToken }}>
      {children}
    </CSRFContext.Provider>
  )
}

export function useCSRF() {
  const context = useContext(CSRFContext)
  if (!context) {
    throw new Error('useCSRF must be used within a CSRFProvider')
  }
  return context
}

// 自动为表单添加CSRF token的hook
export function useCSRFForm() {
  const { getToken } = useCSRF()

  const submitWithCSRF = async (formData: FormData | Record<string, any>, url: string, options: RequestInit = {}) => {
    const token = await getToken()
    
    let body: string | FormData
    let headers: HeadersInit = {
      'X-CSRF-Token': token,
      ...options.headers
    }

    if (formData instanceof FormData) {
      formData.append('_csrf', token)
      body = formData
    } else {
      const dataToStringify = { ...formData, _csrf: token };
      body = JSON.stringify(dataToStringify);
      (headers as Record<string, string>)['Content-Type'] = 'application/json'
    }

    return fetch(url, {
      ...options,
      method: options.method || 'POST',
      headers,
      body,
      credentials: 'include'
    })
  }

  return { submitWithCSRF }
}

// CSRF保护的fetch wrapper
export async function csrfFetch(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'include'
    })
    
    if (!response.ok) {
      throw new Error('无法获取CSRF token')
    }
    
    const { token } = await response.json()
    
    const headers = new Headers(options.headers)
    headers.set('X-CSRF-Token', token)
    
    return fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    })
  } catch (error) {
    console.error('CSRF保护请求失败:', error)
    throw error
  }
}