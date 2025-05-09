import { Suspense } from "react"
import Link from "next/link"
import { CreditCard, ImageIcon, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ImageGenerator from "@/components/image-generator"
import CreditBalance from "@/components/credit-balance"
import RechargePackages from "@/components/recharge-packages"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">AI 图片生成器</h1>
        <p className="text-muted-foreground mt-2">使用AI技术生成高质量图片，简单易用</p>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-3/4">
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">
                <ImageIcon className="mr-2 h-4 w-4" />
                图片生成
              </TabsTrigger>
              <TabsTrigger value="recharge">
                <CreditCard className="mr-2 h-4 w-4" />
                积分充值
              </TabsTrigger>
            </TabsList>
            <TabsContent value="generate" className="mt-4">
              <Suspense fallback={<LoadingState />}>
                <ImageGenerator />
              </Suspense>
            </TabsContent>
            <TabsContent value="recharge" className="mt-4">
              <RechargePackages />
            </TabsContent>
          </Tabs>
        </div>

        <div className="md:w-1/4">
          <Card>
            <CardContent className="pt-6">
              <CreditBalance />
              <div className="mt-4">
                <h3 className="font-medium mb-2">使用说明</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 每生成一张图片消耗10积分</li>
                  <li>• 高质量图片可能消耗更多积分</li>
                  <li>• 充值后积分自动到账</li>
                  <li>
                    • 有问题请
                    <Link href="/support" className="text-primary underline">
                      联系客服
                    </Link>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="mt-2 text-muted-foreground">加载中...</p>
    </div>
  )
}
