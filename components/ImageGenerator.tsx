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
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`/api/credits?userId=${user.id}`, {
      headers: {
        'Authorization': `Bearer ${session?.access_token}`
      }
    });
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
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ 
          prompt, 
          userId: user.id,
          style: selectedStyle 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 处理不同类型的错误
        switch (data.code) {
          case 'NSFW_DETECTED':
            toast.error('内容检测提醒', {
              description: '生成的内容被检测为不适合的内容，请尝试使用不同的描述或更温和的词汇'
            });
            return;
            
          case 'SERVICE_UNAVAILABLE':
            toast.error('服务暂时不可用', {
              description: 'AI图片生成服务暂时不可用，请稍后再试'
            });
            return;
            
          case 'TIMEOUT':
            toast.error('请求超时', {
              description: '图片生成超时，请重试'
            });
            return;
            
          default:
            break;
        }
        
        // 兼容旧版错误处理
        if (data.error && data.error.includes('NSFW')) {
          toast.error('内容检测提醒', {
            description: '生成的内容被检测为不适合的内容，请尝试使用不同的描述或更温和的词汇'
          });
          return;
        }
        
        // 处理积分相关错误
        if (response.status === 403 && data.error?.includes('积分不足')) {
          toast.error('积分不足，无法生成图片，请先充值');
          return;
        }
        if (data.error?.includes('扣除积分失败')) {
          toast.error('扣除积分失败，请稍后重试或联系客服');
          return;
        }
        
        // 处理服务不可用错误
        if (response.status === 503) {
          toast.error('服务暂时不可用', {
            description: 'AI图片生成服务暂时不可用，请稍后再试'
          });
          return;
        }
        
        // 处理超时错误
        if (response.status === 408) {
          toast.error('请求超时', {
            description: '图片生成超时，请重试'
          });
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
    <div className="w-full space-y-6">
      {/* Style Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center">
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            选择艺术风格
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {imageStyles.map((style) => (
            <button
              key={style.id}
              className={`group relative p-4 rounded-xl border-2 transition-all duration-300 text-left
                ${selectedStyle === style.id 
                  ? 'border-purple-500 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 scale-105' 
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 hover:shadow-md hover:scale-102'}
                `}
              onClick={() => setSelectedStyle(style.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {style.name}
                </div>
                {selectedStyle === style.id && (
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {style.description}
              </div>
              <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
                ${selectedStyle === style.id ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10' : 'bg-gradient-to-r from-gray-500/5 to-gray-500/5'}
              `}></div>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold flex items-center">
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            描述您的创意
          </span>
        </h2>
        <div className="relative">
          <Input
            placeholder="例如：一只可爱的橙色小猫，在阳光明媚的花园里玩耍..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-14 text-base pl-4 pr-4 border-2 focus:border-purple-500 rounded-xl bg-white dark:bg-gray-800 transition-all duration-200"
            disabled={loading}
          />
          {prompt && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                {prompt.length}/200
              </div>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
            <span>💡</span>
            <span>使用具体、清晰的描述能获得更好的效果，如"美丽的女性"、"英俊的男性"等</span>
          </div>
          {prompt && (
            <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
              <span className="font-medium">预处理后的提示词:</span> 
              <br />
              <span className="font-mono text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded mt-1 inline-block">
                {(() => {
                  const chineseToEnglish: { [key: string]: string } = {
                    '美女': 'beautiful woman',
                    '帅哥': 'handsome man', 
                    '女孩': 'girl',
                    '男孩': 'boy',
                    '猫': 'cat',
                    '狗': 'dog',
                    '花': 'flower',
                    '山': 'mountain',
                    '海': 'ocean',
                    '城市': 'city',
                    '森林': 'forest'
                  };
                  
                  let processedPrompt = prompt.trim();
                  const chinesePattern = /[\u4e00-\u9fff]/;
                  const isChinese = chinesePattern.test(processedPrompt);
                  
                  if (isChinese) {
                    let englishEquivalent = '';
                    for (const [chinese, english] of Object.entries(chineseToEnglish)) {
                      if (processedPrompt.includes(chinese)) {
                        englishEquivalent = english;
                        break;
                      }
                    }
                    if (englishEquivalent) {
                      processedPrompt = `${englishEquivalent}, ${processedPrompt}`;
                    }
                  }
                  
                  const styleDescriptions = {
                    'anime': 'anime style',
                    'oil': 'oil painting style',  
                    'watercolor': 'watercolor painting style',
                    'pixel': 'pixel art style',
                    'ghibli': 'Studio Ghibli style',
                    'natural': 'realistic style'
                  };
                  
                  const styleDesc = styleDescriptions[selectedStyle as keyof typeof styleDescriptions] || styleDescriptions.natural;
                  return `${styleDesc}, ${processedPrompt}, high quality`;
                })()}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Generate Button */}
      <Button 
        onClick={generateImage} 
        disabled={loading || !prompt}
        className={`w-full h-14 text-lg font-semibold rounded-xl transition-all duration-300 
          ${loading || !prompt 
            ? 'bg-gray-300 dark:bg-gray-600' 
            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
      >
        {loading ? (
          <>
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            <span>AI正在创作中...</span>
          </>
        ) : (
          <>
            <span>✨ 开始生成图片</span>
          </>
        )}
      </Button>

      {/* Generated Image */}
      {imageUrl && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xl font-semibold text-center">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              🎨 您的专属AI作品
            </span>
          </h3>
          <div className="relative group">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-2xl border-4 border-white dark:border-gray-700">
              <Image 
                src={imageUrl} 
                alt="AI Generated Art" 
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-300"></div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleDownload}
            className="w-full h-12 text-base font-semibold rounded-xl border-2 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
          >
            <Download className="mr-2 h-5 w-5" />
            下载高清图片
          </Button>
        </div>
      )}
    </div>
  );
} 