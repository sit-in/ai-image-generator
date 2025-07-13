"use client"

import { useState } from "react"
import { ExternalLink, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

const packages = [
  {
    id: 1,
    name: "基础套餐",
    credits: 100,
    price: 9.9,
    description: "适合轻度使用，可生成约10张图片",
    popular: false,
  },
  {
    id: 2,
    name: "标准套餐",
    credits: 300,
    price: 19.9,
    description: "最受欢迎的选择，可生成约30张图片",
    popular: true,
  },
  {
    id: 3,
    name: "高级套餐",
    credits: 1000,
    price: 49.9,
    description: "适合重度使用，可生成约100张图片",
    popular: false,
  },
]

export default function RechargePackages() {
  const [loading, setLoading] = useState<number | null>(null)
  const { toast } = useToast()

  const handleRecharge = (packageId: number) => {
    setLoading(packageId)

    // Simulate API call
    setTimeout(() => {
      // In a real app, this would redirect to Taobao or another payment platform
      window.open("https://www.taobao.com", "_blank")
      setLoading(null)

      toast({
        title: "跳转到淘宝",
        description: "请在淘宝完成支付，支付成功后积分将自动到账",
      })
    }, 1000)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
          选择充值套餐
        </h2>
        <p className="text-muted-foreground text-lg">选择适合您的套餐，享受AI创作乐趣</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {packages.map((pkg) => (
          <Card 
            key={pkg.id} 
            className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 ${
              pkg.popular 
                ? "border-purple-400 shadow-purple-100 dark:shadow-purple-900/20" 
                : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
            }`}
          >
            {pkg.popular && (
              <div className="absolute top-0 right-0 z-10">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 text-xs font-semibold rounded-bl-2xl rounded-tr-xl shadow-lg">
                  🔥 最受欢迎
                </div>
              </div>
            )}
            
            {/* Background gradient for popular package */}
            {pkg.popular && (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10"></div>
            )}
            
            <CardHeader className="relative z-10 pb-4">
              <CardTitle className="text-xl font-bold text-center">{pkg.name}</CardTitle>
              <CardDescription className="text-center text-sm">{pkg.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="relative z-10 text-center pb-6">
              <div className="mb-6">
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">¥{pkg.price}</span>
                </div>
                <div className="mt-2">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-semibold">
                    {pkg.credits} 积分
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>可生成约 <strong>{pkg.credits / 10}</strong> 张图片</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>支持所有艺术风格</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>积分永久有效</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>高清图片下载</span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="relative z-10 pt-0">
              <Button 
                className={`w-full h-12 font-semibold rounded-xl transition-all duration-300 ${
                  pkg.popular
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                onClick={() => handleRecharge(pkg.id)} 
                disabled={loading === pkg.id}
              >
                {loading === pkg.id ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    处理中...
                  </div>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    立即购买
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-2xl border border-amber-200 dark:border-amber-800">
        <h3 className="font-semibold mb-4 flex items-center text-amber-800 dark:text-amber-200">
          <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm">💡</span>
          </div>
          充值说明
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-amber-700 dark:text-amber-300">
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>点击购买后将跳转至淘宝店铺</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>支付成功后积分自动到账</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>如遇问题请保留订单号联系客服</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>积分一经充值不支持退款</span>
            </div>
          </div>
        </div>
      </div>

      {/* Taobao Store Link */}
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          className="flex items-center px-6 py-3 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          访问淘宝官方店铺
        </Button>
      </div>
    </div>
  )
}
