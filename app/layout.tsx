import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './globals-design-system.css'
import { Toaster } from 'sonner'
import Navigation from '@/components/navigation'
import { Footer } from '@/components/Footer'
import { StyleProvider } from './providers'

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
        <StyleProvider>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster position="top-center" richColors />
        </StyleProvider>
      </body>
    </html>
  )
}
