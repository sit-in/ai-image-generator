'use client';

import { useState, useEffect } from 'react';
import { GalleryGrid } from './ui/gallery-grid';
import { galleryExamples as defaultExamples } from '@/lib/gallery-examples';

export function DynamicGalleryGrid() {
  const [galleryItems, setGalleryItems] = useState(defaultExamples);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 异步加载真实的图片
    const loadGalleryExamples = async () => {
      try {
        const response = await fetch('/api/gallery-examples');
        const data = await response.json();
        
        if (data.success && data.examples && data.examples.length > 0) {
          setGalleryItems(data.examples);
        }
      } catch (error) {
        console.error('加载展示图片失败:', error);
        // 保持使用默认图片
      } finally {
        setLoading(false);
      }
    };

    loadGalleryExamples();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return <GalleryGrid items={galleryItems} />;
}