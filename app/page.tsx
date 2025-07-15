import { Suspense } from "react"
import Link from "next/link"
import { CreditCard, ImageIcon, Loader2, Sparkles, Zap, Shield, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              AI 图片生成器
            </h1>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            释放您的创造力，用最先进的AI技术将想象变为现实
          </p>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Zap className="mr-1 h-4 w-4" />
              快速生成
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Shield className="mr-1 h-4 w-4" />
              安全可靠
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Clock className="mr-1 h-4 w-4" />
              24/7 服务
            </Badge>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            <Card className="shadow-2xl border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl">
              <CardContent className="p-0">
                <Tabs defaultValue="generate" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 p-1 bg-gray-100/50 dark:bg-gray-700/50">
                    <TabsTrigger 
                      value="generate" 
                      className="data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-200"
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      单张生成
                    </TabsTrigger>
                    <TabsTrigger 
                      value="batch" 
                      className="data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-200"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      批量生成
                    </TabsTrigger>
                    <TabsTrigger 
                      value="recharge"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-200"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      积分充值
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="generate" className="mt-0 p-6">
                    <Suspense fallback={<LoadingState />}>
                      <ImageGenerator initialPrompt={searchParams.prompt} />
                    </Suspense>
                  </TabsContent>
                  <TabsContent value="batch" className="mt-0 p-6">
                    <Suspense fallback={<LoadingState />}>
                      <BatchImageGenerator initialPrompt={searchParams.prompt} />
                    </Suspense>
                  </TabsContent>
                  <TabsContent value="recharge" className="mt-0 p-6">
                    <RechargePackages />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3 space-y-6">
            {/* Credit Balance Card */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20">
              <CardContent className="pt-6">
                <CreditBalance />
              </CardContent>
            </Card>

            {/* Usage Guide Card */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-blue-600" />
                  使用指南
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/60 dark:bg-gray-700/60">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">选择风格</p>
                      <p className="text-xs text-muted-foreground">从6种艺术风格中选择</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/60 dark:bg-gray-700/60">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">描述创意</p>
                      <p className="text-xs text-muted-foreground">用文字描述您的想象</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/60 dark:bg-gray-700/60">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-green-600 dark:text-green-400">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">AI生成</p>
                      <p className="text-xs text-muted-foreground">消耗10积分生成图片</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-muted-foreground text-center">
                    需要帮助？
                    <Link href="/support" className="text-primary hover:underline ml-1">
                      联系客服
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}
