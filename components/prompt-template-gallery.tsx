'use client';

import { useState } from 'react';
import { promptCategories, promptTemplates, getTemplatesByCategory, PromptTemplate } from '@/lib/prompt-templates';
import { cn } from '@/lib/utils';
import { Sparkles, ChevronRight } from 'lucide-react';

interface PromptTemplateGalleryProps {
  onSelectTemplate: (prompt: string) => void;
  className?: string;
}

export function PromptTemplateGallery({ onSelectTemplate, className }: PromptTemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState('character');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const currentTemplates = getTemplatesByCategory(selectedCategory);

  return (
    <div className={cn("w-full", className)}>
      {/* 标题部分 */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          Prompt 模板库
          <Sparkles className="w-6 h-6 text-purple-500" />
        </h2>
        <p className="text-gray-600">选择模板快速生成精美图片，或在此基础上自由创作</p>
      </div>

      {/* 分类选择 */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {promptCategories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              "hover:scale-105 hover:shadow-md",
              selectedCategory === category.id
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            <span className="mr-1">{category.emoji}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* 模板网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentTemplates.map(template => (
          <div
            key={template.id}
            onMouseEnter={() => setHoveredTemplate(template.id)}
            onMouseLeave={() => setHoveredTemplate(null)}
            onClick={() => onSelectTemplate(template.prompt)}
            className={cn(
              "relative p-4 rounded-xl border cursor-pointer transition-all duration-300",
              "hover:shadow-xl hover:scale-[1.02] hover:border-purple-300",
              "bg-white hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50",
              hoveredTemplate === template.id && "ring-2 ring-purple-400"
            )}
          >
            {/* 类别标签 */}
            <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
              {template.categoryEmoji} {promptCategories.find(c => c.id === template.category)?.name}
            </div>

            {/* 标题 */}
            <h3 className="font-bold text-lg mb-2 pr-20">{template.title}</h3>

            {/* 描述 */}
            <p className="text-sm text-gray-600 mb-3">{template.description}</p>

            {/* Prompt预览 */}
            <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm text-gray-700 line-clamp-2">
              {template.prompt}
            </div>

            {/* 标签 */}
            <div className="flex flex-wrap gap-1 mb-3">
              {template.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 使用按钮 */}
            <button
              className={cn(
                "w-full py-2 rounded-lg font-medium text-sm transition-all duration-200",
                "flex items-center justify-center gap-2",
                hoveredTemplate === template.id
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-gray-100 text-gray-700"
              )}
            >
              使用此模板
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* 底部提示 */}
      <div className="text-center mt-8 text-sm text-gray-500">
        💡 提示：选择模板后可以继续编辑，加入你的创意想法
      </div>
    </div>
  );
}