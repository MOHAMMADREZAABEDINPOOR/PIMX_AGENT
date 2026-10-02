'use client';

import React from 'react';
import {UiText,useT} from '@/components/i18n/LocaleProvider';
import {Sparkles} from 'lucide-react';

export interface PimxLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export function PimxLogo({
  size = 'md',
  showText = false,
  className = '',
}: PimxLogoProps) {
  const $t=useT();
  const sizeMap = {
    xs: { icon: 'w-6 h-6', text: 'text-xs', sub: 'text-[8px]', badge: 'text-[7.5px] px-1.5 py-0.5 gap-0.5', spark: 'w-2 h-2' },
    sm: { icon: 'w-7 h-7', text: 'text-sm', sub: 'text-[9px]', badge: 'text-[8px] px-1.5 py-0.5 gap-1', spark: 'w-2 h-2' },
    md: { icon: 'w-9 h-9', text: 'text-base', sub: 'text-[10px]', badge: 'text-[8.5px] px-2 py-0.5 gap-1', spark: 'w-2.5 h-2.5' },
    lg: { icon: 'w-11 h-11', text: 'text-lg', sub: 'text-xs', badge: 'text-[9px] px-2 py-0.5 gap-1', spark: 'w-2.5 h-2.5' },
    xl: { icon: 'w-14 h-14', text: 'text-2xl', sub: 'text-xs', badge: 'text-[10px] px-2.5 py-1 gap-1.5', spark: 'w-3 h-3' },
  };

  const { icon: iconClass, text: textClass, sub: subClass, badge: badgeClass, spark: sparkClass } = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Pimx AI Brand Symbol */}
      <div className={`relative shrink-0 ${iconClass} flex items-center justify-center group`}>
        {/* Ambient Cosmic Glow */}
        <div className="absolute inset-0 rounded-full bg-violet-600/30 blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand-logo.webp"
          alt={$t("PIMX AI Logo")}
          className="w-full h-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Brand Text Lockup */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-extrabold tracking-tight text-neutral-900 dark:text-white ${textClass}`}>
              <UiText source={"PIMX"}/>
            </span>
            <span
              className={`inline-flex items-center rounded-full font-mono font-bold tracking-widest uppercase transition-all duration-300
                bg-gradient-to-r from-violet-500/15 via-purple-500/15 to-indigo-500/15
                dark:from-violet-400/20 dark:via-fuchsia-400/15 dark:to-indigo-400/20
                text-violet-700 dark:text-violet-200
                border border-violet-500/30 dark:border-violet-400/35
                shadow-[0_0_10px_rgba(139,92,246,0.18)] hover:shadow-[0_0_14px_rgba(139,92,246,0.35)]
                backdrop-blur-xs select-none ${badgeClass}`}
            >
              <Sparkles className={`${sparkClass} text-violet-500 dark:text-violet-300 shrink-0`} />
              <span className="leading-none">AI</span>
            </span>
          </div>
          <span className={`text-muted font-mono tracking-wider uppercase ${subClass}`}>
            <UiText source={"Agent Suite"}/>
          </span>
        </div>
      )}
    </div>
  );
}
