'use client';

import { Suspense } from "react";
import Link from "next/link";
import { ImageIcon, Sparkles, Heart, Star, Zap, CreditCard, ArrowRight } from "lucide-react";
import { CuteButton, CuteCard, CuteBadge } from "@/components/CuteUIComponents";
import { FloatingDecorations, InteractiveStars, RainbowBar } from "@/components/CuteDecorations";
import { CuteMiniLoader } from "@/components/CuteLoadingComponents";
import { GalleryGrid } from "@/components/ui/gallery-grid";
import { galleryExamples } from "@/lib/gallery-examples";
import { useTranslations } from 'next-intl';

export default function HomePageClient({
  searchParams,
}: {
  searchParams: { prompt?: string };
}) {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 relative overflow-hidden">
      {/* Cute Decorations */}
      <FloatingDecorations />
      <InteractiveStars />
      <RainbowBar />
      
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 blob-1" />
      <div className="absolute bottom-20 right-10 w-96 h-96 blob-2" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Cute Header */}
        <header className="text-center mb-12 relative">
          <div className="inline-block relative">
            {/* Floating emojis */}
            <div className="absolute -top-8 -left-8 text-4xl animate-bounce-soft">✨</div>
            <div className="absolute -top-6 -right-6 text-3xl animate-wiggle">🌈</div>
            <div className="absolute -bottom-4 -left-6 text-3xl animate-bounce-soft" style={{ animationDelay: '0.5s' }}>💖</div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
              {t('title')}
              <span className="inline-block ml-2 text-3xl animate-wiggle">🎨</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              {t('subtitle')}
            </p>
          </div>
          
          {/* Cute feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <CuteBadge color="yellow" size="md">
              <Star className="w-4 h-4 mr-1" />
              {t('features.fast')}
            </CuteBadge>
            <CuteBadge color="pink" size="md">
              <Heart className="w-4 h-4 mr-1" />
              {t('features.safe')}
            </CuteBadge>
            <CuteBadge color="purple" size="md">
              <Sparkles className="w-4 h-4 mr-1" />
              {t('features.available')}
            </CuteBadge>
          </div>
        </header>

        {/* Main CTA Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <CuteCard rainbow={true} className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('cta.subtitle')}
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/generate">
                <CuteButton 
                  variant="primary" 
                  size="lg" 
                  icon={<Sparkles className="w-5 h-5" />}
                >
                  {t('cta.createNow')}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </CuteButton>
              </Link>
              <Link href="/login">
                <CuteButton 
                  variant="secondary" 
                  size="lg"
                >
                  {t('cta.loginForCredits')}
                </CuteButton>
              </Link>
            </div>
          </CuteCard>
        </div>

        {/* Gallery Section */}
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              {t('gallery.title')}
              <span className="ml-2 text-2xl">🖼️</span>
            </h2>
            <p className="text-gray-600">
              {t('gallery.subtitle')}
            </p>
          </div>
          
          <Suspense fallback={<LoadingState />}>
            <GalleryGrid items={galleryExamples} />
          </Suspense>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <Link href="/generate">
              <CuteButton 
                variant="primary" 
                size="lg" 
                icon={<ImageIcon className="w-5 h-5" />}
              >
                {t('gallery.viewMore')}
              </CuteButton>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
          <CuteCard>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎨</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{t('features.styles.title')}</h3>
              <p className="text-sm text-gray-600">
                {t('features.styles.description')}
              </p>
            </div>
          </CuteCard>
          
          <CuteCard>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{t('features.speed.title')}</h3>
              <p className="text-sm text-gray-600">
                {t('features.speed.description')}
              </p>
            </div>
          </CuteCard>
          
          <CuteCard>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{t('features.pricing.title')}</h3>
              <p className="text-sm text-gray-600">
                {t('features.pricing.description')}
              </p>
            </div>
          </CuteCard>
        </div>

        {/* Bottom decoration */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <span>{tCommon('madeWith')}</span>
            <Heart className="w-4 h-4 text-pink-500 animate-pulse" />
            <span>{tCommon('by')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <CuteMiniLoader />
    </div>
  );
}