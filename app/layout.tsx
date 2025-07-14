import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import Navigation from '@/components/navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI 图片生成器',
  description: '使用 AI 技术生成高质量图片，简单易用',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <Navigation />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
