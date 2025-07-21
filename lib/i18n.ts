import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export const locales = ['zh', 'en'] as const;
export const defaultLocale = 'zh' as const;

export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // 从请求中获取locale，如果没有则使用默认值
  const awaitedLocale = await requestLocale;
  let locale = awaitedLocale || defaultLocale;
  
  // 确保locale是支持的语言之一
  if (!locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../locales/${locale}/common.json`)).default
  };
});

// 获取用户首选语言
export function getPreferredLocale(): Locale {
  try {
    const headersList = headers();
    const acceptLanguage = headersList.get('accept-language') || '';
    
    // 解析 Accept-Language header
    const languages = acceptLanguage.split(',').map(lang => {
      const [code] = lang.trim().split(';');
      return code.toLowerCase();
    });
    
    // 查找支持的语言
    for (const lang of languages) {
      if (lang.startsWith('zh')) return 'zh';
      if (lang.startsWith('en')) return 'en';
    }
  } catch (error) {
    console.error('Error getting preferred locale:', error);
  }
  
  return defaultLocale;
}