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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">积分充值</h2>
        <p className="text-muted-foreground">选择适合您的套餐，充值后积分自动到账</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {packages.map((pkg) => (
          <Card key={pkg.id} className={pkg.popular ? "border-primary" : ""}>
            {pkg.popular && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-2 py-1 text-xs rounded-bl-md rounded-tr-md">
                最受欢迎
              </div>
            )}
            <CardHeader>
              <CardTitle>{pkg.name}</CardTitle>
              <CardDescription>{pkg.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">¥{pkg.price}</span>
                <span className="ml-2 text-muted-foreground">/ {pkg.credits}积分</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>可生成约{pkg.credits / 10}张图片</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>支持高质量图片生成</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>积分永久有效</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleRecharge(pkg.id)} disabled={loading === pkg.id}>
                {loading === pkg.id ? (
                  "处理中..."
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

      <div className="bg-muted p-4 rounded-md">
        <h3 className="font-medium mb-2">充值说明</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 购买后将跳转至淘宝店铺完成支付</li>
          <li>• 支付成功后，系统将自动发货（积分自动到账）</li>
          <li>• 如遇到问题，请保留订单号联系客服</li>
          <li>• 积分一经充值，不支持退款</li>
        </ul>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" className="flex items-center">
          <ExternalLink className="mr-2 h-4 w-4" />
          访问淘宝店铺
        </Button>
      </div>
    </div>
  )
}
