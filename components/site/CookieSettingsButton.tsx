'use client';

import { useLocale } from '@/components/i18n/LocaleProvider';

export const OPEN_COOKIE_SETTINGS = 'pimx-open-consent';

export function CookieSettingsButton({ className }: { className?: string }) {
  const locale = useLocale();
  return <button type="button" className={className} onClick={event => {
    window.dispatchEvent(new CustomEvent(OPEN_COOKIE_SETTINGS, { detail: event.currentTarget }));
  }}>{locale === 'fa' ? 'تنظیمات کوکی' : 'Cookie settings'}</button>;
}
