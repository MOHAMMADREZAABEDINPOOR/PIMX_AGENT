'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Compass, RotateCcw, ArrowRight } from 'lucide-react';
import {UiText,useT,useLocale} from '@/components/i18n/LocaleProvider';

export default function NotFound() {
  const $t=useT(),locale=useLocale();
  return (
    <div
      dir={locale==='fa'?'rtl':'ltr'}
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-[var(--bg-color,#0a0a0c)] text-[var(--text-color,#f4f4f8)] relative overflow-hidden font-persian selection:bg-accent/30"
    >
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-lg w-full text-center space-y-6 animate-fade-scale">
        {/* Glowing 404 Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-mono font-semibold backdrop-blur-md shadow-xs">
          <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          <span><UiText source={"کد خطا: ۴۰۴ • صفحه پیدا نشد"}/></span>
        </div>

        {/* Large Decorative 404 Number */}
        <div className="relative select-none">
          <h1 className="text-7xl sm:text-9xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-neutral-800 to-neutral-950 dark:from-neutral-100 dark:to-neutral-600 opacity-90">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand-logo.webp"
              alt={$t("Pimx Agent AI")}
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-2xl opacity-85 hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Error Explanation */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
             <UiText source={"صفحه مورد نظر شما یافت نشد"}/> </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-md mx-auto">
             <UiText source={"ممکن است آدرس این گفتگو یا بخش تغییر کرده باشد، پاک شده باشد یا لینکی که وارد کرده‌اید اشتباه باشد."}/> </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-accent hover:bg-accent text-white text-xs font-semibold shadow-md shadow-accent/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span><UiText source={"بازگشت به چت و صفحه اصلی"}/></span>
          </Link>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-[var(--surface-color)]/80 hover:bg-[var(--surface-color)] text-neutral-700 dark:text-neutral-300 text-xs font-medium backdrop-blur-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span><UiText source={"بارگذاری مجدد صفحه"}/></span>
          </button>
        </div>

        {/* Quick Help Footer */}
        <div className="pt-6 border-t border-black/5 dark:border-white/5 text-[11px] text-neutral-400 dark:text-neutral-500 flex items-center justify-center gap-4">
          <span><UiText source={"سامانه دستیار هوشمند Pimx Agent AI"}/></span>
          <span>•</span>
          <Link href="/" className="hover:underline flex items-center gap-1">
            <span><UiText source={"شروع گفتگوی جدید"}/></span>
            <ArrowRight className="w-3 h-3 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
