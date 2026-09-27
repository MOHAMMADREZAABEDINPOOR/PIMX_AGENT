'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, AlertCircle } from 'lucide-react';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export function NetworkStatusBanner() {
  const $t=useT();
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [showReconnected, setShowReconnected] = useState<boolean>(false);

  useEffect(() => {
    // Initial check
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }

    function handleOnline() {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 4000);
      return () => clearTimeout(timer);
    }

    function handleOffline() {
      setIsOffline(true);
      setShowReconnected(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  return (
    <div
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[92%] sm:w-auto animate-in fade-in slide-in-from-top-3 duration-300 select-none pointer-events-auto"
    >
      {isOffline ? (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-rose-500/95 text-white shadow-xl shadow-rose-950/40 border border-white/20 backdrop-blur-md text-xs sm:text-sm">
          <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-white" />
          <div className="min-w-0 flex-1">
            <span className="font-bold"><UiText source={"Internet connection lost!"}/></span>{' '}
            <span className="opacity-90 text-[11px] sm:text-xs">
               <UiText source={"Please check your internet connection, Wi-Fi, or VPN."}/> </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (navigator.onLine) {
                setIsOffline(false);
                setShowReconnected(true);
              } else {
                // Flash animation
                setIsOffline(false);
                setTimeout(() => setIsOffline(true), 150);
              }
            }}
            className="px-2.5 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
            title={$t("Retry connection")}
          >
            <RefreshCw className="w-3 h-3" />
            <span><UiText source={"Retry"}/></span>
          </button>
        </div>
      ) : showReconnected ? (
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-600/95 text-white shadow-xl shadow-emerald-950/30 border border-white/20 backdrop-blur-md text-xs sm:text-sm">
          <Wifi className="w-4 h-4 shrink-0 text-white" />
          <span className="font-medium"><UiText source={"Your internet connection has been successfully restored."}/></span>
        </div>
      ) : null}
    </div>
  );
}
