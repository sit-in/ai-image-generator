'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

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
        body: JSON.stringify({ prompt, userId: user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
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
          <Input
            placeholder="描述你想要生成的图片..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full"
            disabled={loading}
          />
          
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