import { Suspense } from "react"
import Link from "next/link"
import { ImageIcon, Sparkles, Heart, Star, Zap, CreditCard } from "lucide-react"
import { ImageGenerator } from "@/components/ImageGenerator"
import { BatchImageGenerator } from "@/components/BatchImageGenerator"
import CreditBalance from "@/components/credit-balance"
import { CuteButton, CuteCard, CuteBadge } from "@/components/CuteUIComponents"
import { FloatingDecorations, InteractiveStars, RainbowBar, ScatteredIcons } from "@/components/CuteDecorations"
import { CuteMiniLoader } from "@/components/CuteLoadingComponents"
import { CuteTabs } from "@/components/CuteTabs"

export default function HomePage({
  searchParams,
}: {
  searchParams: { prompt?: string }
}) {
  const tabs = [
    { id: 'single', label: '单张生成', icon: '🎨' },
    { id: 'batch', label: '批量生成', icon: '🎯', badge: 'HOT' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 relative overflow-hidden">
      {/* Cute Decorations */}
      <FloatingDecorations />
      <InteractiveStars />
      <RainbowBar />
      
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 blob-1" />
      <div className="absolute bottom-20 right-10 w-96 h-96 blob-2" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Cute Header */}
        <header className="text-center mb-12 relative">
          <div className="inline-block relative">
            {/* Floating emojis */}
            <div className="absolute -top-8 -left-8 text-4xl animate-bounce-soft">✨</div>
            <div className="absolute -top-6 -right-6 text-3xl animate-wiggle">🌈</div>
            <div className="absolute -bottom-4 -left-6 text-3xl animate-bounce-soft" style={{ animationDelay: '0.5s' }}>💖</div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
              AI 画画小助手
              <span className="inline-block ml-2 text-3xl animate-wiggle">🎨</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              把你的奇思妙想变成可爱的图片～
            </p>
          </div>
          
          {/* Cute feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <CuteBadge color="yellow" size="md">
              <Star className="w-4 h-4 mr-1" />
              超快生成
            </CuteBadge>
            <CuteBadge color="pink" size="md">
              <Heart className="w-4 h-4 mr-1" />
              安全可靠
            </CuteBadge>
            <CuteBadge color="purple" size="md">
              <Sparkles className="w-4 h-4 mr-1" />
              24小时服务
            </CuteBadge>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Generation Card with Tabs */}
            <div className="lg:col-span-2">
              <CuteCard rainbow={true} className="relative">
                <ScatteredIcons />
                
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    创作你的作品
                    <span className="ml-2 text-xl">🎨</span>
                  </h2>
                </div>
                
                <CuteTabs tabs={tabs} defaultTab="single">
                  {{
                    single: (
                      <Suspense fallback={<LoadingState />}>
                        <ImageGenerator initialPrompt={searchParams.prompt} />
                      </Suspense>
                    ),
                    batch: (
                      <Suspense fallback={<LoadingState />}>
                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-200">
                            <h3 className="text-lg font-bold text-purple-700 mb-2 flex items-center">
                              <Zap className="w-5 h-5 mr-2" />
                              批量生成模式
                            </h3>
                            <p className="text-sm text-purple-600 mb-3">
                              一次生成多张图片，节省时间和积分！
                            </p>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="bg-white/70 rounded-xl p-2 text-center">
                                <div className="font-bold text-purple-700">3张</div>
                                <div className="text-purple-600">优惠10%</div>
                              </div>
                              <div className="bg-white/70 rounded-xl p-2 text-center">
                                <div className="font-bold text-purple-700">5张</div>
                                <div className="text-purple-600">优惠15%</div>
                              </div>
                              <div className="bg-white/70 rounded-xl p-2 text-center">
                                <div className="font-bold text-purple-700">10张</div>
                                <div className="text-purple-600">优惠20%</div>
                              </div>
                            </div>
                          </div>
                          <BatchImageGenerator initialPrompt={searchParams.prompt} />
                        </div>
                      </Suspense>
                    )
                  }}
                </CuteTabs>
              </CuteCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Credit Card with Recharge */}
              <CuteCard className="bg-gradient-to-br from-pink-50 to-blue-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    我的积分
                  </h3>
                  <span className="text-2xl">💰</span>
                </div>
                <CreditBalance />
                
                {/* Quick Recharge Options */}
                <div className="mt-4 space-y-3">
                  <div className="text-sm text-gray-600 mb-2">快速充值：</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/recharge?amount=100" className="block">
                      <div className="bg-white/80 rounded-xl p-3 text-center hover:scale-105 transition-transform cursor-pointer border-2 border-transparent hover:border-pink-300">
                        <div className="text-lg font-bold text-pink-600">100积分</div>
                        <div className="text-xs text-gray-500">¥10</div>
                      </div>
                    </Link>
                    <Link href="/recharge?amount=500" className="block">
                      <div className="bg-white/80 rounded-xl p-3 text-center hover:scale-105 transition-transform cursor-pointer border-2 border-transparent hover:border-pink-300">
                        <div className="text-lg font-bold text-pink-600">500积分</div>
                        <div className="text-xs text-gray-500">¥45</div>
                        <CuteBadge color="pink" size="sm">优惠</CuteBadge>
                      </div>
                    </Link>
                  </div>
                  
                  <Link href="/recharge" className="block">
                    <CuteButton variant="primary" size="md" className="w-full">
                      <CreditCard className="w-4 h-4 mr-2" />
                      更多充值选项
                    </CuteButton>
                  </Link>
                  
                  {/* Taobao Payment Hint */}
                  <div className="text-center text-xs text-gray-500 mt-2">
                    支持淘宝扫码支付 🛍️
                  </div>
                </div>
              </CuteCard>

              {/* Quick Guide */}
              <CuteCard>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">📝</span>
                  使用指南
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">1️⃣</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-700">选择模式</p>
                      <p className="text-xs text-gray-500">单张或批量生成</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">2️⃣</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-700">描述创意</p>
                      <p className="text-xs text-gray-500">越详细越好</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">3️⃣</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-700">生成图片</p>
                      <p className="text-xs text-gray-500">单张10积分</p>
                    </div>
                  </div>
                </div>
              </CuteCard>

              {/* Fun Facts */}
              <CuteCard className="gradient-peach">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">💡</span>
                  小贴士
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  批量生成更划算！生成3张只需27积分，5张只需42.5积分哦～
                </p>
              </CuteCard>
            </div>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-pink-500 animate-pulse" />
            <span>by AI Team</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <CuteMiniLoader />
    </div>
  )
}