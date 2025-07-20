import { getRequestConfig } from 'next-intl/server';
import { locales } from './i18n';

export async function getMessages(locale?: string) {
  const finalLocale = locale || 'zh';
  
  try {
    return (await import(`../locales/${finalLocale}/common.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale ${finalLocale}:`, error);
    return (await import(`../locales/zh/common.json`)).default;
  }
}