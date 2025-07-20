'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Sparkles, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { CuteButton, CuteCard, CuteInput } from './CuteUIComponents';
import { ImageSkeleton } from '@/components/ui/image-skeleton';
import { getGuestTrialStatus, setGuestTrialUsed as markGuestTrialUsed, saveGuestImage } from '@/lib/guest-trial';
import { PromptOptimizer } from '@/lib/prompt-optimizer';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

interface InlineImageGeneratorProps {
  onClose?: () => void;
  className?: string;
  initialPrompt?: string;
}

const imageStyles = [
  { id: 'natural', name: '自然', emoji: '🌿' },
  { id: 'anime', name: '动漫', emoji: '✨' },
  { id: 'oil', name: '油画', emoji: '🎨' },
  { id: 'watercolor', name: '水彩', emoji: '💧' },
  { id: 'pixel', name: '像素', emoji: '👾' },
  { id: 'ghibli', name: '吉卜力', emoji: '🏰' },
];

export function InlineImageGenerator({ onClose, className, initialPrompt }: InlineImageGeneratorProps) {
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('natural');
  const [progress, setProgress] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [guestTrialUsed, setGuestTrialUsed] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'pending' | 'processing' | 'completed' | 'failed'>('idle');

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
  }, []);

  // 监听URL参数变化
  useEffect(() => {
    const promptParam = searchParams.get('prompt');
    if (promptParam) {
      setPrompt(promptParam);
    }
  }, [searchParams]);

  // 监听initialPrompt变化
  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const checkCredits = async () => {
    if (!isAuthenticated) {
      if (guestTrialUsed) {
        return 'trial_used';
      }
      return 'guest';
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 'no_user';

      const response = await fetch('/api/credits', {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取积分失败');
      }

      const data = await response.json();
      return data.credits >= 10 ? 'sufficient' : 'insufficient';
    } catch (error) {
      console.error('检查积分失败:', error);
      return 'error';
    }
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error('请输入图片描述');
      return;
    }

    const creditStatus = await checkCredits();
    
    if (creditStatus === 'trial_used') {
      toast.error('游客试用次数已用完', {
        description: '请注册账号继续使用，注册即送50积分'
      });
      return;
    }

    if (creditStatus === 'insufficient') {
      toast.error('积分不足', {
        description: '请充值后继续使用'
      });
      return;
    }
    
    const isGuest = creditStatus === 'guest';
    
    try {
      setLoading(true);
      setImageUrl('');
      setProgress(0);
      setGenerationStatus('pending');
      
      // 模拟进度
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          
          if (newProgress > 5) {
            setGenerationStatus('processing');
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
        // 游客模式
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

      if (!response.ok) {
        toast.error(data.error || '生成图片失败');
        setGenerationStatus('failed');
        return;
      }

      if (!data.imageUrl) {
        toast.error('未收到图片URL');
        setGenerationStatus('failed');
        return;
      }

      setImageUrl(data.imageUrl);
      setProgress(100);
      setGenerationStatus('completed');
      
      if (isGuest) {
        markGuestTrialUsed({ url: data.imageUrl, prompt, style: selectedStyle });
        saveGuestImage({ url: data.imageUrl, prompt, style: selectedStyle });
        setGuestTrialUsed(true);
        window.dispatchEvent(new Event('guestTrialUsed'));
        toast.success('图片生成成功！这是你的免费试用作品');
      } else {
        toast.success('图片生成成功！');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成图片时发生错误';
      toast.error(errorMessage);
      console.error('Error details:', err);
      setGenerationStatus('failed');
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

  const handleReset = () => {
    setPrompt('');
    setImageUrl('');
    setGenerationStatus('idle');
  };

  return (
    <div className={cn("space-y-4", className)}>
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* 风格选择 - 横向滚动 */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-2 min-w-max">
          {imageStyles.map(style => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-200",
                selectedStyle === style.id 
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              <span className="mr-1">{style.emoji}</span>
              {style.name}
            </button>
          ))}
        </div>
      </div>

      {/* 输入框和生成按钮 */}
      <div className="space-y-3">
        <CuteInput
          placeholder="描述你想要的图片，例如：夕阳下的富士山..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !loading && generateImage()}
          disabled={loading}
          className="w-full text-base"
          icon={<Sparkles className="w-4 h-4" />}
        />

        <CuteButton
          onClick={generateImage}
          disabled={!prompt.trim() || loading}
          loading={loading}
          variant="primary"
          size="lg"
          className="w-full"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              生成中 {Math.round(progress)}%
            </div>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              {!isAuthenticated && !guestTrialUsed ? '免费生成' : '开始生成'}
            </>
          )}
        </CuteButton>

        {/* 游客提示 */}
        {!isAuthenticated && !guestTrialUsed && (
          <p className="text-xs text-center text-pink-600 font-medium">
            🎁 无需注册，立即免费试用一次！
          </p>
        )}
      </div>

      {/* 生成进度或结果展示 */}
      {loading && (
        <div className="mt-4">
          <ImageSkeleton 
            progress={progress} 
            status={generationStatus as any}
          />
        </div>
      )}

      {/* 生成的图片 */}
      {imageUrl && !loading && (
        <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CuteCard className="p-2">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg">
              <Image 
                src={imageUrl} 
                alt="AI Generated Art" 
                fill
                className="object-cover"
                priority
              />
            </div>
          </CuteCard>
          
          {/* 操作按钮 */}
          <div className="flex gap-2">
            <CuteButton
              size="sm"
              variant="secondary"
              onClick={handleReset}
              className="flex-1"
              icon={<RefreshCw className="w-4 h-4" />}
            >
              再来一张
            </CuteButton>
            <CuteButton
              size="sm"
              variant="primary"
              onClick={handleDownload}
              className="flex-1"
              icon={<Download className="w-4 h-4" />}
            >
              下载图片
            </CuteButton>
          </div>
        </div>
      )}
    </div>
  );
}