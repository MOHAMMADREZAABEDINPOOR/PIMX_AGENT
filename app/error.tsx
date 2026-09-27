'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, RotateCcw, Home, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import {UiText,useLocale} from '@/components/i18n/LocaleProvider';

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale=useLocale();
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error('[Application Crash Boundary Caught Error]:', error);
  }, [error]);

  const copyError = () => {
    const text = `Error: ${error.message}\nDigest: ${error.digest || 'N/A'}\nStack: ${error.stack || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      dir={locale==='fa'?'rtl':'ltr'}
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-[var(--bg-color,#0a0a0c)] text-[var(--text-color,#f4f4f8)] relative overflow-hidden font-persian"
    >
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-lg w-full text-center space-y-5 animate-fade-scale bg-[var(--surface-color,#121216)] border border-rose-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-500/5">
        {/* Warning Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-7 h-7 animate-bounce" style={{ animationDuration: '2.5s' }} />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
             <UiText source={"خطای غیرمنتظره در اجرای برنامه"}/> </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
             <UiText source={"سیستم در رندر بخش جاری با مشکل فنی مواجه شد. داده‌های گفتگوهای شما محفوظ است و می‌توانید با تلاش مجدد ادامه دهید."}/> </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span><UiText source={"تلاش مجدد (بارگذاری مجدد کامپوننت)"}/></span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 text-xs font-medium flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span><UiText source={"بازگشت به صفحه اصلی"}/></span>
          </Link>
        </div>

        {/* Technical Error Details Accordion */}
        <div className="pt-3 border-t border-black/5 dark:border-white/10 text-right">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer py-1"
          >
            <span><UiText source={"مشاهده جزئیات فنی خطا (برای گزارش یا عیب‌یابی)"}/></span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showDetails && (
            <div className="mt-2 p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-rose-300/90 text-left space-y-2 overflow-hidden animate-fade-in" dir="ltr">
              <div className="flex items-center justify-between text-[10px] text-neutral-400 border-b border-white/5 pb-1">
                <span><UiText source={"Error details"}/></span>
                <button
                  type="button"
                  onClick={copyError}
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? <UiText source={"Copied"}/> : <UiText source={"Copy"}/>}</span>
                </button>
              </div>
              <div className="whitespace-pre-wrap max-h-36 overflow-y-auto font-mono text-[11px] leading-normal opacity-90">
                {error.message || 'Unknown application error'}
                {error.digest && `\nDigest: ${error.digest}`}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
