'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { CuteButton, CuteCard, CuteInput, CuteBadge } from './CuteUIComponents';
import { CuteLoadingWithProgress, CuteSuccessAnimation } from './CuteLoadingComponents';
import { CelebrationAnimation } from './CuteCelebrationComponents';
import { TrialToRegisterModal } from './TrialToRegisterModal';
import { getGuestTrialStatus, setGuestTrialUsed as markGuestTrialUsed, saveGuestImage } from '@/lib/guest-trial';
import { PromptOptimizer } from '@/lib/prompt-optimizer';
import { ImageSkeleton } from '@/components/ui/image-skeleton';

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
  const router = useRouter();
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('natural');
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [guestTrialUsed, setGuestTrialUsed] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | undefined>(undefined);
  const [generationStatus, setGenerationStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('processing');

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  // 检查认证状态和游客试用状态
  useEffect(() => {
    const checkAuthAndTrial = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      
      if (!user) {
        const trialStatus = getGuestTrialStatus();
        setGuestTrialUsed(trialStatus.hasUsedTrial);
      }
    };
    
    checkAuthAndTrial();
    
    // 监听游客试用状态变化
    const handleTrialUsed = () => {
      if (!isAuthenticated) {
        const trialStatus = getGuestTrialStatus();
        setGuestTrialUsed(trialStatus.hasUsedTrial);
      }
    };
    
    window.addEventListener('guestTrialUsed', handleTrialUsed);
    
    return () => {
      window.removeEventListener('guestTrialUsed', handleTrialUsed);
    };
  }, [isAuthenticated]);

  const checkCredits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // 游客模式：检查是否还有试用机会
      const trialStatus = getGuestTrialStatus();
      if (!trialStatus.hasUsedTrial) {
        return 'guest'; // 返回游客模式
      } else {
        toast.error('您的免费试用已用完，请注册账号继续使用', {
          description: '注册即送50积分，可生成5张图片'
        });
        // 不再自动弹出注册窗口，让用户自己选择
        return false;
      }
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
    const creditStatus = await checkCredits();
    if (!creditStatus) return;
    
    const isGuest = creditStatus === 'guest';
    
    try {
      setLoading(true);
      setImageUrl('');
      setProgress(0);
      setShowSuccess(false);
      setGenerationStatus('pending');
      setQueuePosition(Math.floor(Math.random() * 3) + 1); // 模拟排队人数
      
      // 模拟进度
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          
          // 更新状态
          if (newProgress > 5) {
            setGenerationStatus('processing');
            setQueuePosition(undefined);
          }
          
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 500);
      
      let response;
      
      if (isGuest) {
        // 游客模式：调用游客API
        console.log('游客模式调用API，参数:', { prompt, style: selectedStyle, isGuest: true });
        response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            prompt, 
            style: selectedStyle,
            isGuest: true
          }),
        });
      } else {
        // 注册用户模式
        const { data: { user } } = await supabase.auth.getUser();
        const { data: { session } } = await supabase.auth.getSession();
        response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ 
            prompt, 
            userId: user!.id,
            style: selectedStyle 
          }),
        });
      }

      const data = await response.json();
      console.log('API响应:', { status: response.status, data });

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
      setGenerationStatus('completed');
      setShowSuccess(true);
      
      if (isGuest) {
        // 游客模式：保存试用记录并显示注册引导
        markGuestTrialUsed({ url: data.imageUrl, prompt, style: selectedStyle });
        saveGuestImage({ url: data.imageUrl, prompt, style: selectedStyle });
        
        // 更新本地组件状态，防止再次试用
        setGuestTrialUsed(true);
        
        // 触发页面刷新以更新所有组件的状态
        window.dispatchEvent(new Event('guestTrialUsed'));
        
        toast.success('图片生成成功！这是你的免费试用作品');
        setTimeout(() => {
          setShowRegisterModal(true);
        }, 2000);
      } else {
        toast.success('图片生成成功！');
      }
      
      // 3秒后隐藏成功动画
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setGenerationStatus('failed');
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
    
    // 检查是否是游客且未注册
    if (!isAuthenticated) {
      // 检查是否已经显示过注册弹窗（本次会话）
      const hasShownRegisterModal = sessionStorage.getItem('hasShownRegisterModal');
      
      toast.error('请先注册账号才能下载高清原图', {
        description: '注册即送50积分，可生成5张图片'
      });
      
      // 如果还没显示过弹窗，则显示
      if (!hasShownRegisterModal) {
        setShowRegisterModal(true);
        sessionStorage.setItem('hasShownRegisterModal', 'true');
      } else {
        // 如果已经显示过，直接跳转到注册页
        router.push('/register?fromDownload=true');
      }
      return;
    }

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
            <div className="space-y-2">
              <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded-2xl border border-blue-200">
                <span className="font-medium">🤖 AI优化后的提示词:</span> 
                <br />
                <span className="font-mono text-xs bg-white px-2 py-1 rounded-full mt-2 inline-block">
                  {(() => {
                    const { optimizedPrompt, translatedPrompt } = PromptOptimizer.optimize(prompt, selectedStyle);
                    return optimizedPrompt;
                  })()}
                </span>
              </div>
              
              {/* 显示优化建议 */}
              {(() => {
                const { suggestions } = PromptOptimizer.optimize(prompt, selectedStyle);
                return suggestions.length > 0 && (
                  <div className="text-xs text-purple-600 bg-purple-50 p-3 rounded-2xl border border-purple-200">
                    <span className="font-medium">💡 优化建议:</span>
                    <ul className="mt-1 space-y-1">
                      {suggestions.map((suggestion, index) => (
                        <li key={index} className="ml-4">• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                );
              })()}
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
        {loading ? 'AI正在创作中...' : 
          (!isAuthenticated && !guestTrialUsed) ? '✨ 免费试用一次 🎁' : '✨ 开始创作魔法图片 🎨'}
      </CuteButton>
      
      {/* 游客提示 */}
      {!isAuthenticated && !guestTrialUsed && (
        <div className="text-center space-y-2">
          <p className="text-sm text-pink-600 font-medium">
            🎁 无需注册，立即免费试用一次！
          </p>
          <p className="text-xs text-gray-500">
            生成后可注册保存作品，还送50积分
          </p>
        </div>
      )}
      
      {/* Loading Animation with Skeleton */}
      {loading && (
        <div className="mt-8">
          <ImageSkeleton 
            progress={progress} 
            queuePosition={queuePosition}
            status={generationStatus}
          />
        </div>
      )}

      {/* Generated Image */}
      {imageUrl && !loading && (
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
            {isAuthenticated ? '下载可爱图片 💕' : '注册后下载高清原图 🔒'}
          </CuteButton>
        </div>
      )}
      
      {/* 注册引导弹窗 */}
      <TrialToRegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        imageUrl={imageUrl}
        prompt={prompt}
        style={selectedStyle}
      />
    </div>
  );
} 