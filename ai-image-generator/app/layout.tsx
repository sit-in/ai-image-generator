import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
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
        <header className="border-b">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" className="text-xl font-bold">
              AI 图片生成器
            </a>
            <Navigation />
          </div>
        </header>
        <main>
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  )
}
