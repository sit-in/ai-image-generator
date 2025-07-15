'use client';

import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { CuteButton, CuteCard, CuteInput, CuteBadge } from './CuteUIComponents';
import { CuteLoadingWithProgress, CuteSuccessAnimation } from './CuteLoadingComponents';
import { CelebrationAnimation } from './CuteCelebrationComponents';

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
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

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
      setProgress(0);
      setShowSuccess(false);
      
      // 模拟进度
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 500);
      
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
      setProgress(100);
      setShowSuccess(true);
      toast.success('图片生成成功！');
      
      // 3秒后隐藏成功动画
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成图片时发生错误';
      toast.error(errorMessage);
      console.error('Error details:', err);
    } finally {
      setLoading(false);
      setProgress(0);
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
    <div className="w-full space-y-8">
      {/* Success Celebration */}
      {showSuccess && <CelebrationAnimation />}
      {/* Style Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="mr-2 text-2xl">🎨</span>
          选择你喜欢的风格
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {imageStyles.map((style) => (
            <CuteCard
              key={style.id}
              hover={true}
              rainbow={selectedStyle === style.id}
              className={`cursor-pointer transition-all duration-300 ${selectedStyle === style.id ? 'scale-105' : ''}`}
            >
              <button
                className="w-full text-left"
                onClick={() => setSelectedStyle(style.id)}
              >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-bold text-gray-800">
                  {style.name}
                </div>
                {selectedStyle === style.id && (
                  <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="text-xs text-gray-600 leading-relaxed">
                {style.description}
              </div>
              </button>
            </CuteCard>
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="mr-2 text-2xl">💭</span>
          描述你的创意
        </h2>
        <div className="relative">
          <textarea
            placeholder="例如：一只粉色的小猫咪在彩虹桥上玩耍，周围有很多星星..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-pink-200 rounded-2xl transition-all duration-300 focus:outline-none focus:border-pink-400 focus:scale-[1.02] focus:shadow-cute-primary min-h-24 resize-none"
            disabled={loading}
            rows={3}
          />
          {prompt && (
            <div className="absolute right-3 bottom-3">
              <CuteBadge color="pink" size="sm">
                {prompt.length}/200
              </CuteBadge>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-pink-600 bg-pink-50 p-3 rounded-2xl border border-pink-200">
            <span>💡</span>
            <span>试试描述一些可爱的场景，比如"粉色的云朵"、"彩虹独角兽"等～</span>
          </div>
          {prompt && (
            <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded-2xl border border-blue-200">
              <span className="font-medium">🤖 AI会这样理解你的描述:</span> 
              <br />
              <span className="font-mono text-xs bg-white px-2 py-1 rounded-full mt-2 inline-block">
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
      <CuteButton
        onClick={generateImage}
        disabled={loading || !prompt}
        variant="primary"
        size="lg"
        loading={loading}
        className="w-full"
      >
        {loading ? 'AI正在创作中...' : '✨ 开始创作魔法图片 🎨'}
      </CuteButton>
      
      {/* Loading Animation */}
      {loading && (
        <div className="mt-8">
          <CuteLoadingWithProgress progress={progress} />
        </div>
      )}

      {/* Generated Image */}
      {imageUrl && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-2xl font-bold text-center text-gray-800">
            🎉 你的专属AI作品完成啦！
          </h3>
          <div className="relative group">
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl shadow-kawaii border-4 border-pink-100">
              <Image 
                src={imageUrl} 
                alt="AI Generated Art" 
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pink-100/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-pink-300 to-blue-300 rounded-3xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-300"></div>
          </div>
          <CuteButton
            onClick={handleDownload}
            variant="secondary"
            size="md"
            icon={<Download className="w-5 h-5" />}
            className="w-full"
          >
            下载可爱图片 💕
          </CuteButton>
        </div>
      )}
    </div>
  );
} 