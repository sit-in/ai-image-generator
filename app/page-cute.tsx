import { Suspense } from "react"
import Link from "next/link"
import { ImageIcon, Sparkles, Heart, Star, Rainbow } from "lucide-react"
import { ImageGenerator } from "@/components/ImageGenerator"
import { BatchImageGenerator } from "@/components/BatchImageGenerator"
import CreditBalance from "@/components/credit-balance"
import RechargePackages from "@/components/recharge-packages"

export default function HomePage({
  searchParams,
}: {
  searchParams: { prompt?: string }
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 relative overflow-hidden">
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
            <span className="tag-cute">
              <Star className="w-4 h-4 mr-1 text-yellow-500" />
              超快生成
            </span>
            <span className="tag-cute">
              <Heart className="w-4 h-4 mr-1 text-pink-500" />
              安全可靠
            </span>
            <span className="tag-cute">
              <Sparkles className="w-4 h-4 mr-1 text-purple-500" />
              24小时服务
            </span>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Generation Card */}
            <div className="lg:col-span-2">
              <div className="card-cute">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    创作你的作品
                    <span className="ml-2 text-xl">🎨</span>
                  </h2>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors">
                      <ImageIcon className="w-5 h-5 text-pink-600" />
                    </button>
                    <button className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                    </button>
                  </div>
                </div>
                
                <Suspense fallback={<LoadingState />}>
                  <ImageGenerator initialPrompt={searchParams.prompt} />
                </Suspense>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Credit Card */}
              <div className="card-cute bg-gradient-to-br from-pink-50 to-blue-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    我的积分
                  </h3>
                  <span className="text-2xl">💰</span>
                </div>
                <CreditBalance />
                <Link href="/recharge" className="btn-cute btn-primary w-full mt-4 text-center block">
                  充值积分 ✨
                </Link>
              </div>

              {/* Quick Guide */}
              <div className="card-cute">
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
                      <p className="font-medium text-sm text-gray-700">选择风格</p>
                      <p className="text-xs text-gray-500">6种可爱的艺术风格</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">2️⃣</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-700">描述创意</p>
                      <p className="text-xs text-gray-500">写下你的想法</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">3️⃣</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-700">生成图片</p>
                      <p className="text-xs text-gray-500">消耗10积分</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fun Facts */}
              <div className="card-cute gradient-peach">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">💡</span>
                  小贴士
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  试试描述一些可爱的场景，比如"粉色的云朵上坐着一只小猫咪"或"彩虹色的独角兽在花园里玩耍"！
                </p>
              </div>
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
      <div className="text-4xl animate-bounce mb-4">🎨</div>
      <p className="text-gray-500">加载中...</p>
    </div>
  )
}