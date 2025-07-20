'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // 获取当前语言
  const currentLocale = pathname.startsWith('/en') ? 'en' : 'zh';
  
  const toggleLanguage = () => {
    const newLocale = currentLocale === 'zh' ? 'en' : 'zh';
    
    // 构建新的路径
    let newPath = pathname;
    if (currentLocale === 'zh') {
      // 从中文切换到英文
      newPath = `/en${pathname}`;
    } else {
      // 从英文切换到中文
      newPath = pathname.replace(/^\/en/, '');
    }
    
    router.push(newPath);
  };
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className={cn(
        "w-10 h-10 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200",
        className
      )}
      title={currentLocale === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      {currentLocale === 'zh' ? (
        <span className="text-lg">🌐</span>
      ) : (
        <span className="text-lg">🇨🇳</span>
      )}
    </Button>
  );
}