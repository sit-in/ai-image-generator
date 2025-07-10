"use client"

import { useState } from "react"
import Image from "next/image"
import { Download, Loader2, ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { generateImage } from "@/lib/image-service"

type GenerationStatus = "idle" | "analyzing" | "generating" | "optimizing" | "complete" | "error"

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("")
  const [status, setStatus] = useState<GenerationStatus>("idle")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "请输入提示词",
        description: "请输入描述您想要生成的图片的提示词",
        variant: "destructive",
      })
      return
    }

    try {
      setStatus("analyzing")
      setError(null)

      // Check credit balance
      const hasEnoughCredits = await checkCreditBalance()
      if (!hasEnoughCredits) {
        setStatus("error")
        setError("积分不足，请充值后再试")
        return
      }

      // Simulate the generation process with status updates
      setStatus("generating")
      setTimeout(() => setStatus("optimizing"), 3000)

      // Call the image generation service
      const result = await generateImage(prompt)

      setImageUrl(result.imageUrl)
      setStatus("complete")

      // Deduct credits
      await deductCredits(10)
    } catch (err: any) {
      console.error("Image generation failed:", err)
      setStatus("error")
      
      // 处理 NSFW 错误
      if (err.message && err.message.includes('NSFW')) {
        setError("生成的内容被检测为不适合的内容，请尝试使用不同的描述或更温和的词汇")
        toast({
          title: "内容检测提醒",
          description: "请避免使用可能被误解的词汇，尝试更温和的描述",
          variant: "destructive",
        })
      } else {
        setError("图片生成失败，请稍后再试")
      }
    }
  }

  const handleDownload = () => {
    if (!imageUrl) return

    // Create a temporary link element
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `ai-image-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "下载成功",
      description: "图片已成功下载到您的设备",
    })
  }

  // Mock functions for credit system
  const checkCreditBalance = async () => {
    // In a real app, this would call an API to check the user's credit balance
    return true // Simulate having enough credits
  }

  const deductCredits = async (amount: number) => {
    // In a real app, this would call an API to deduct credits
    console.log(`Deducted ${amount} credits`)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <Textarea
            placeholder="描述您想要生成的图片，例如：一只在草地上奔跑的金毛犬，阳光明媚的日子"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] mb-4"
          />

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">每次生成消耗10积分</p>
            <Button
              onClick={handleGenerate}
              disabled={status !== "idle" && status !== "complete" && status !== "error"}
            >
              {status === "idle" || status === "complete" || status === "error" ? (
                "生成图片"
              ) : (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {status === "analyzing" && "分析提示词..."}
                  {status === "generating" && "生成图片中..."}
                  {status === "optimizing" && "优化图片中..."}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && <div className="bg-destructive/10 text-destructive p-4 rounded-md">{error}</div>}

      {imageUrl && (
        <Card>
          <CardContent className="pt-6">
            <div className="relative aspect-square w-full overflow-hidden rounded-md">
              <Image src={imageUrl || "/placeholder.svg"} alt={prompt} fill className="object-cover" priority />
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                下载图片
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!imageUrl && !error && status === "idle" && (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-md">
          <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-muted-foreground">输入提示词并点击生成按钮</p>
        </div>
      )}
    </div>
  )
}
