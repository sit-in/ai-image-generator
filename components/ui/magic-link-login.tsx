'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Loader2, Check, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { CuteButton, CuteInput, CuteCard } from '@/components/CuteUIComponents';
import { cn } from '@/lib/utils';

interface MagicLinkLoginProps {
  redirectTo?: string;
  className?: string;
}

export function MagicLinkLogin({ redirectTo = '/', className }: MagicLinkLoginProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('请输入邮箱地址');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}${redirectTo}`,
        },
      });

      if (error) {
        toast.error('发送失败', {
          description: error.message
        });
      } else {
        setSent(true);
        toast.success('邮件已发送', {
          description: '请检查您的邮箱并点击登录链接'
        });
      }
    } catch (err) {
      toast.error('发送失败', {
        description: '请稍后重试'
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <CuteCard className={cn("p-6 text-center", className)}>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">邮件已发送！</h3>
        <p className="text-gray-600 mb-4">
          我们已向 <strong>{email}</strong> 发送了登录链接
        </p>
        <p className="text-sm text-gray-500">
          请检查您的收件箱（包括垃圾邮件文件夹）
        </p>
        <CuteButton
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() => {
            setSent(false);
            setEmail('');
          }}
        >
          重新发送
        </CuteButton>
      </CuteCard>
    );
  }

  return (
    <form onSubmit={handleMagicLink} className={className}>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            邮箱地址
          </label>
          <CuteInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={loading}
            required
            icon={<Mail className="w-4 h-4" />}
          />
        </div>
        
        <CuteButton
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={loading}
          icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
        >
          {loading ? '发送中...' : '发送登录链接'}
        </CuteButton>

        <div className="text-center text-xs text-gray-500">
          无需密码，通过邮件安全登录
        </div>

        {/* WeChat Login Placeholder (Hidden) */}
        <div className="hidden">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">或</span>
            </div>
          </div>
          
          <CuteButton
            type="button"
            variant="secondary"
            size="lg"
            className="w-full mt-4"
            icon={<MessageSquare className="w-4 h-4" />}
            disabled
          >
            微信登录（即将上线）
          </CuteButton>
        </div>
      </div>
    </form>
  );
}