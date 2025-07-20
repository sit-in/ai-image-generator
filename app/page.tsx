"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { ImageIcon, Sparkles, Heart, Star, Zap, CreditCard, ArrowRight } from "lucide-react";
import { CuteButton, CuteCard, CuteBadge } from "@/components/CuteUIComponents";
import { FloatingDecorations, InteractiveStars, RainbowBar } from "@/components/CuteDecorations";
import { CuteMiniLoader } from "@/components/CuteLoadingComponents";
import { DynamicGalleryGrid } from "@/components/dynamic-gallery-grid";
import { InlineImageGenerator } from "@/components/inline-image-generator";
import { PromptTemplateGallery } from "@/components/prompt-template-gallery";

export default function HomePage({
  searchParams,
}: {
  searchParams: { prompt?: string };
}) {
  const [showGenerator, setShowGenerator] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  
  const handleTemplateSelect = (prompt: string) => {
    setSelectedPrompt(prompt);
    setShowGenerator(true);
    // 滚动到生成器位置
    setTimeout(() => {
      document.querySelector('.inline-generator')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };
  
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
              探索无限创意，让 AI 为你绘制梦想
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

        {/* Main CTA Section with Inline Generator */}
        <div className="max-w-4xl mx-auto mb-12">
          {showGenerator ? (
            <CuteCard rainbow={true} className="p-6 inline-generator">
              <InlineImageGenerator className="w-full" initialPrompt={selectedPrompt} />
            </CuteCard>
          ) : (
            <CuteCard rainbow={true} className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                开始创作你的第一幅作品
              </h2>
              <p className="text-gray-600 mb-6">
                选择下方示例开始，或直接创建你的独特作品
              </p>
              <div className="flex justify-center gap-4">
                <CuteButton 
                  variant="primary" 
                  size="lg" 
                  icon={<Sparkles className="w-5 h-5" />}
                  onClick={() => setShowGenerator(true)}
                >
                  立即创作
                  <ArrowRight className="w-4 h-4 ml-1" />
                </CuteButton>
                <Link href="/login">
                  <CuteButton 
                    variant="secondary" 
                    size="lg"
                  >
                    登录获取积分
                  </CuteButton>
                </Link>
              </div>
            </CuteCard>
          )}
        </div>

        {/* Gallery Section */}
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              作品展示
              <span className="ml-2 text-2xl">🖼️</span>
            </h2>
            <p className="text-gray-600">
              点击任意作品，即可复用 Prompt 创作相似风格
            </p>
          </div>
          
          <Suspense fallback={<LoadingState />}>
            <DynamicGalleryGrid />
          </Suspense>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <Link href="/generate">
              <CuteButton 
                variant="primary" 
                size="lg" 
                icon={<ImageIcon className="w-5 h-5" />}
              >
                查看更多作品
              </CuteButton>
            </Link>
          </div>
        </div>

        {/* Prompt Template Gallery */}
        <div className="max-w-7xl mx-auto mt-16 mb-16">
          <PromptTemplateGallery onSelectTemplate={handleTemplateSelect} />
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
          <CuteCard>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎨</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">多样风格</h3>
              <p className="text-sm text-gray-600">
                支持动漫、油画、水彩等多种艺术风格
              </p>
            </div>
          </CuteCard>
          
          <CuteCard>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">极速生成</h3>
              <p className="text-sm text-gray-600">
                最快10秒生成高质量图片
              </p>
            </div>
          </CuteCard>
          
          <CuteCard>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">灵活计费</h3>
              <p className="text-sm text-gray-600">
                按需付费，新用户赠送免费积分
              </p>
            </div>
          </CuteCard>
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
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <CuteMiniLoader />
    </div>
  );
}