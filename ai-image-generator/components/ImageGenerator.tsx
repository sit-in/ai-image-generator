'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Label } from './ui/label';

interface ImageGeneratorProps {
  initialPrompt?: string;
}

const imageStyles = [
  {
    id: 'natural',
    name: '自然风格',
    description: '真实世界的自然照片风格，适合写实场景。',
  },
  {
    id: 'anime',
    name: '动漫风格',
    description: '日系动漫、二次元风格，色彩鲜明，线条清晰。',
  },
  {
    id: 'oil',
    name: '油画风格',
    description: '仿油画质感，厚重笔触，艺术感强。',
  },
  {
    id: 'watercolor',
    name: '水彩风格',
    description: '水彩画质感，色彩柔和，边缘晕染。',
  },
  {
    id: 'pixel',
    name: '像素风格',
    description: '像素艺术风格，复古游戏画面效果。',
  },
  {
    id: 'ghibli',
    name: '吉卜力风格',
    description: '宫崎骏动画风格，温暖细腻，充满童话感。',
  },
];

export function ImageGenerator({ initialPrompt }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('natural');

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const checkCredits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('未登录');
      toast.error('请先登录');
      return false;
    }
    
    // 恢复积分校验
    const res = await fetch(`/api/credits?userId=${user.id}`);
    const data = await res.json();
    if (data.credits === undefined) {
      toast.error('无法获取积分信息');
      return false;
    }
    if (data.credits < 10) {
      toast.error('积分不足，无法生成图片，请先充值', {
        description: `当前积分：${data.credits}，生成图片需要10积分`
      });
      return false;
    }
    return true;
  };

  const generateImage = async () => {
    const enough = await checkCredits();
    if (!enough) return;
    try {
      setLoading(true);
      setImageUrl('');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('请先登录');
        return;
      }
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt, 
          userId: user.id,
          style: selectedStyle 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 处理 NSFW 内容错误
        if (data.code === 'NSFW_DETECTED' || (data.error && data.error.includes('NSFW'))) {
          toast.error('内容检测提醒', {
            description: '生成的内容被检测为不适合的内容，请尝试使用不同的描述或更温和的词汇'
          });
          return;
        }
        
        // 恢复积分相关的错误处理
        if (response.status === 403 && data.error?.includes('积分不足')) {
          toast.error('积分不足，无法生成图片，请先充值');
          return;
        }
        if (data.error?.includes('扣除积分失败')) {
          toast.error('扣除积分失败，请稍后重试或联系客服');
          return;
        }
        const errorMessage = data.error || '生成图片失败';
        const errorDetails = data.details ? `详细信息: ${JSON.stringify(data.details)}` : '';
        toast.error(errorMessage, {
          description: errorDetails
        });
        throw new Error(errorMessage + errorDetails);
      }

      if (!data.imageUrl) {
        toast.error('未收到图片URL');
        throw new Error('未收到图片URL');
      }

      setImageUrl(data.imageUrl);
      toast.success('图片生成成功！');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成图片时发生错误';
      toast.error(errorMessage);
      console.error('Error details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ai-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('图片已开始下载');
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">AI 图片生成器</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">图片风格</div>
            <div className="flex flex-col gap-2">
              {imageStyles.map((style) => (
                <button
                  key={style.id}
                  className={`p-2 rounded-lg border transition-all
                    ${selectedStyle === style.id ? 'border-blue-500 shadow-lg bg-blue-50' : 'border-gray-200 bg-white'}
                    hover:scale-105 hover:shadow-md`}
                  onClick={() => setSelectedStyle(style.id)}
                >
                  <div className="text-sm font-medium">{style.name}</div>
                  <div className="text-xs text-gray-500">{style.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Input
              placeholder="描述你想要生成的图片..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-12 text-base"
              disabled={loading}
            />
            <div className="text-xs text-gray-500">
              💡 提示：避免使用可能被误解的词汇，尝试使用"美丽"、"优雅"、"温馨"等温和的描述
            </div>
          </div>
          
          <Button 
            onClick={generateImage} 
            disabled={loading || !prompt}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              '生成图片'
            )}
          </Button>

          {imageUrl && (
            <div className="mt-4 space-y-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                <Image 
                  src={imageUrl} 
                  alt="Generated" 
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <Button 
                variant="outline" 
                onClick={handleDownload}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                下载图片
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 