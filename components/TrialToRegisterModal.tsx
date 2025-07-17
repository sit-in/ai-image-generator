'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Sparkles, Star, Heart, Lock } from 'lucide-react';
import Image from 'next/image';
import { CuteButton, CuteCard, CuteBadge } from './CuteUIComponents';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface TrialToRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  prompt: string;
  style: string;
}

export function TrialToRegisterModal({
  isOpen,
  onClose,
  imageUrl,
  prompt,
  style
}: TrialToRegisterModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = () => {
    setIsLoading(true);
    // 保存当前图片信息到 sessionStorage，注册后可以恢复
    sessionStorage.setItem('pendingImage', JSON.stringify({
      imageUrl,
      prompt,
      style
    }));
    router.push('/register?fromTrial=true');
  };

  const handleLogin = () => {
    setIsLoading(true);
    sessionStorage.setItem('pendingImage', JSON.stringify({
      imageUrl,
      prompt,
      style
    }));
    router.push('/login?fromTrial=true');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-pink-50 via-white to-blue-50 border-pink-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            <span className="text-3xl mr-2">🎉</span>
            哇！你的第一幅AI作品完成了！
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 生成的图片预览 */}
          <div className="relative mx-auto w-64 h-64">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-300 to-blue-300 rounded-2xl opacity-20 blur-lg"></div>
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-4 border-pink-100">
              <Image 
                src={imageUrl} 
                alt="Generated image" 
                fill
                className="object-cover"
              />
              {/* 水印遮罩 - 可点击的注册按钮 */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/30 flex items-end justify-center pb-4">
                <button
                  onClick={handleRegister}
                  className="bg-white/90 hover:bg-white px-4 py-2 rounded-full text-sm text-gray-700 hover:text-purple-600 flex items-center gap-2 transition-all hover:scale-105 shadow-lg"
                >
                  <Lock className="w-4 h-4" />
                  <span>注册后下载高清原图</span>
                </button>
              </div>
            </div>
          </div>

          {/* 注册福利 */}
          <CuteCard className="bg-gradient-to-r from-purple-50 to-pink-50">
            <h3 className="text-lg font-bold text-purple-700 mb-3 flex items-center justify-center">
              <Sparkles className="w-5 h-5 mr-2" />
              立即注册，解锁更多功能！
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">🎁</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-700">新用户福利</p>
                  <p className="text-xs text-gray-500">注册即送50积分（可生成5张图片）</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">💾</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-700">永久保存作品</p>
                  <p className="text-xs text-gray-500">所有作品云端存储，随时查看下载</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">🚀</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-700">批量生成</p>
                  <p className="text-xs text-gray-500">一次生成多张，享受折扣优惠</p>
                </div>
              </div>
            </div>
          </CuteCard>

          {/* 行动按钮 */}
          <div className="space-y-3">
            <CuteButton
              onClick={handleRegister}
              variant="primary"
              size="lg"
              className="w-full"
              loading={isLoading}
            >
              <Star className="w-5 h-5 mr-2" />
              立即注册（免费获得50积分）
            </CuteButton>
            
            <div className="flex items-center gap-2">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-sm text-gray-500">已有账号？</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
            
            <CuteButton
              onClick={handleLogin}
              variant="secondary"
              size="md"
              className="w-full"
              loading={isLoading}
            >
              直接登录
            </CuteButton>
          </div>

          {/* 暂时跳过 */}
          <button
            onClick={onClose}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            稍后再说
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}