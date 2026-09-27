'use client';

import React from 'react';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

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
    xs: { icon: 'w-6 h-6', text: 'text-xs', sub: 'text-[8px]' },
    sm: { icon: 'w-7 h-7', text: 'text-sm', sub: 'text-[9px]' },
    md: { icon: 'w-9 h-9', text: 'text-base', sub: 'text-[10px]' },
    lg: { icon: 'w-11 h-11', text: 'text-lg', sub: 'text-xs' },
    xl: { icon: 'w-14 h-14', text: 'text-2xl', sub: 'text-xs' },
  };

  const { icon: iconClass, text: textClass, sub: subClass } = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Pimx AI Brand Symbol */}
      <div className={`relative shrink-0 ${iconClass} flex items-center justify-center group`}>
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-full bg-blue-600/30 blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand-logo.webp"
          alt={$t("PIMX AI Logo")}
          className="w-full h-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Brand Text Lockup (Optional) */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-extrabold tracking-tight text-neutral-900 dark:text-white ${textClass}`}>
               <UiText source={"PIMX"}/> </span>
            <span className="px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-2xs">
               <UiText source={"AI"}/> </span>
          </div>
          <span className={`text-muted font-mono tracking-wider uppercase ${subClass}`}>
             <UiText source={"Agent Suite"}/> </span>
        </div>
      )}
    </div>
  );
}
