'use client';

import { Progress } from '@/components/ui/progress';
import { CuteCard } from '@/components/CuteUIComponents';
import { Sparkles, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageSkeletonProps {
  progress?: number;
  queuePosition?: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  className?: string;
}

export function ImageSkeleton({ 
  progress = 0, 
  queuePosition, 
  status = 'processing',
  className 
}: ImageSkeletonProps) {
  return (
    <CuteCard className={cn("relative overflow-hidden", className)}>
      <div className="aspect-square relative">
        {/* Skeleton 背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse">
          {/* 装饰性线条 */}
          <div className="absolute inset-0">
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent 
                          animate-shimmer" 
                 style={{ 
                   backgroundSize: '200% 100%',
                   animation: 'shimmer 2s infinite'
                 }} 
            />
          </div>
        </div>

        {/* 中心内容 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
          {/* 图标动画 */}
          <div className="mb-4 relative">
            <div className="w-20 h-20 bg-white/80 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-10 h-10 text-purple-600 animate-pulse" />
            </div>
            {/* 旋转的光环 */}
            <div className="absolute inset-0 w-20 h-20 border-4 border-purple-200 border-t-purple-600 
                          rounded-full animate-spin" />
          </div>

          {/* 状态文本 */}
          <div className="text-center mb-4">
            {queuePosition && queuePosition > 0 ? (
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <Users className="w-4 h-4" />
                <span className="font-medium">排队中：前面还有 {queuePosition} 人</span>
              </div>
            ) : (
              <p className="text-lg font-bold text-gray-800 mb-2">
                {status === 'pending' && '准备生成...'}
                {status === 'processing' && 'AI 正在创作中...'}
                {status === 'completed' && '生成完成！'}
                {status === 'failed' && '生成失败'}
              </p>
            )}
            
            <p className="text-sm text-gray-600">
              {status === 'processing' && progress < 30 && '正在理解您的创意...'}
              {status === 'processing' && progress >= 30 && progress < 60 && '正在绘制细节...'}
              {status === 'processing' && progress >= 60 && progress < 90 && '正在优化画面...'}
              {status === 'processing' && progress >= 90 && '即将完成...'}
            </p>
          </div>

          {/* 进度条 */}
          <div className="w-full max-w-xs">
            <Progress value={progress} className="h-2 mb-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{progress}%</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                预计 {Math.max(1, Math.ceil((100 - progress) / 10))}s
              </span>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              💡 小贴士：详细的描述能生成更好的图片哦
            </p>
          </div>
        </div>
      </div>
    </CuteCard>
  );
}

// 添加shimmer动画的CSS
const shimmerStyle = `
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
`;

// 将样式注入到document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = shimmerStyle;
  document.head.appendChild(style);
}