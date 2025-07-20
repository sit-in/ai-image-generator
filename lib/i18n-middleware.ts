import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export const i18nMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});