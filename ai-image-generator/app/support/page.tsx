import Link from "next/link"
import { ArrowLeft, Mail, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回首页
      </Link>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">客户支持</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>联系我们</CardTitle>
              <CardDescription>如果您在使用过程中遇到任何问题，请通过以下方式联系我们</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <Mail className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">电子邮件</h3>
                  <p className="text-muted-foreground">support@example.com</p>
                  <p className="text-sm text-muted-foreground mt-1">工作时间：周一至周五 9:00-18:00</p>
                </div>
              </div>

              <div className="flex items-start">
                <MessageSquare className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">在线客服</h3>
                  <p className="text-muted-foreground">点击下方按钮联系在线客服</p>
                  <Button className="mt-2" size="sm">
                    联系客服
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>常见问题</CardTitle>
              <CardDescription>以下是用户常见的问题和解答</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">积分如何使用？</h3>
                <p className="text-muted-foreground mt-1">每生成一张图片将消耗10积分，高质量图片可能消耗更多积分。</p>
              </div>

              <div>
                <h3 className="font-medium">充值后积分没有到账怎么办？</h3>
                <p className="text-muted-foreground mt-1">
                  充值后积分通常会在1分钟内自动到账。如果超过5分钟仍未到账，请联系客服并提供订单号。
                </p>
              </div>

              <div>
                <h3 className="font-medium">如何提高图片生成质量？</h3>
                <p className="text-muted-foreground mt-1">
                  提供详细、具体的提示词可以提高生成图片的质量。描述场景、风格、颜色等细节会有所帮助。
                </p>
              </div>

              <div>
                <h3 className="font-medium">积分有有效期吗？</h3>
                <p className="text-muted-foreground mt-1">充值的积分永久有效，没有使用期限。</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
