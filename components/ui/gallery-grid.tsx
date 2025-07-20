'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CuteCard, CuteButton } from '@/components/CuteUIComponents';
import { cn } from '@/lib/utils';

interface GalleryItem {
  id: string;
  imageUrl: string;
  prompt: string;
  style: string;
  timestamp?: string;
}

interface GalleryGridProps {
  items: GalleryItem[];
  className?: string;
}

export function GalleryGrid({ items, className }: GalleryGridProps) {
  const router = useRouter();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleReusePrompt = (prompt: string) => {
    // 跳转到生成页面并预填 prompt
    router.push(`/?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {items.map((item) => (
        <CuteCard
          key={item.id}
          className="group relative overflow-hidden cursor-pointer"
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() => handleReusePrompt(item.prompt)}
        >
          <div className="aspect-square relative">
            {/* 图片 */}
            <Image
              src={item.imageUrl}
              alt={item.prompt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            
            {/* 渐变遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Hover 信息 */}
            <div className={cn(
              "absolute inset-0 p-4 flex flex-col justify-end transform transition-all duration-300",
              hoveredItem === item.id ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}>
              {/* Prompt 文本 */}
              <p className="text-white text-sm font-medium mb-3 line-clamp-3">
                {item.prompt}
              </p>
              
              {/* 立即复用按钮 */}
              <CuteButton
                size="sm"
                variant="primary"
                className="w-full bg-white/90 hover:bg-white text-gray-800"
                icon={<Sparkles className="w-3 h-3" />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReusePrompt(item.prompt);
                }}
              >
                立即复用
                <ArrowRight className="w-3 h-3 ml-1" />
              </CuteButton>
            </div>
            
            {/* 风格标签 */}
            <div className="absolute top-2 right-2">
              <span className="px-2 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-medium text-gray-700">
                {item.style}
              </span>
            </div>
          </div>
        </CuteCard>
      ))}
    </div>
  );
}