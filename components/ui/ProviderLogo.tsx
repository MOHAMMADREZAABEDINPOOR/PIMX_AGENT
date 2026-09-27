'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { PimxLogo } from './PimxLogo';
import {useT} from '@/components/i18n/LocaleProvider';

export interface ProviderLogoProps {
  providerId?: string;
  modelId?: string;
  customIconUrl?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function ProviderLogo({
  providerId,
  modelId,
  customIconUrl,
  className = '',
  size = 'md',
}: ProviderLogoProps) {
  const $t=useT();
  const sizeMap = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9',
  };

  const currentSizeClass = sizeMap[size] || sizeMap.md;

  // 1. Direct Custom Icon URL passed as prop
  if (customIconUrl) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={customIconUrl}
        alt={$t(providerId || 'Custom Provider')}
        className={`${currentSizeClass} shrink-0 rounded-md object-contain ${className}`}
      />
    );
  }

  // 2. Lookup custom provider saved in store for custom uploaded/linked iconUrl
  if (providerId) {
    const customProviders = useAppStore.getState().customProviders;
    const matchedCustom = customProviders?.find((p) => p.id === providerId);
    if (matchedCustom?.iconUrl) {
      return (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={matchedCustom.iconUrl}
          alt={$t(matchedCustom.name || 'Custom Provider')}
          className={`${currentSizeClass} shrink-0 rounded-md object-contain ${className}`}
        />
      );
    }
  }

  // Derive effective provider identity from providerId or modelId
  const normalizedId = (providerId || '').toLowerCase().trim();
  const normalizedModel = (modelId || '').toLowerCase().trim();

  const isMatch = (...keys: string[]) =>
    keys.some(
      (k) => normalizedId.includes(k) || normalizedModel.includes(k)
    );

  // Official Pimx Agent AI Brand Vector
  if (isMatch('pimx')) {
    return <PimxLogo size={size} className={className} />;
  }

  // Official Mistral AI Vector Mark (Stepped M Gradient Blocks)
  if (isMatch('mistral')) {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${currentSizeClass} shrink-0 ${className} rounded-lg overflow-hidden shadow-2xs`}
        aria-label={$t("Mistral AI")}
      >
        <rect width="100" height="100" rx="20" fill="#000000" />
        {/* Row 0: Yellow */}
        <rect x="12" y="12" width="15.2" height="15.2" fill="#FFD800" rx="1.5" />
        <rect x="72.8" y="12" width="15.2" height="15.2" fill="#FFD800" rx="1.5" />
        {/* Row 1: Amber Orange */}
        <rect x="12" y="27.2" width="15.2" height="15.2" fill="#FFA000" rx="1.5" />
        <rect x="27.2" y="27.2" width="15.2" height="15.2" fill="#FFA000" rx="1.5" />
        <rect x="57.6" y="27.2" width="15.2" height="15.2" fill="#FFA000" rx="1.5" />
        <rect x="72.8" y="27.2" width="15.2" height="15.2" fill="#FFA000" rx="1.5" />
        {/* Row 2: Vivid Orange Bar */}
        <rect x="12" y="42.4" width="15.2" height="15.2" fill="#FF6400" rx="1.5" />
        <rect x="27.2" y="42.4" width="15.2" height="15.2" fill="#FF6400" rx="1.5" />
        <rect x="42.4" y="42.4" width="15.2" height="15.2" fill="#FF6400" rx="1.5" />
        <rect x="57.6" y="42.4" width="15.2" height="15.2" fill="#FF6400" rx="1.5" />
        <rect x="72.8" y="42.4" width="15.2" height="15.2" fill="#FF6400" rx="1.5" />
        {/* Row 3: Coral Red */}
        <rect x="12" y="57.6" width="15.2" height="15.2" fill="#FF2E00" rx="1.5" />
        <rect x="42.4" y="57.6" width="15.2" height="15.2" fill="#FF2E00" rx="1.5" />
        <rect x="72.8" y="57.6" width="15.2" height="15.2" fill="#FF2E00" rx="1.5" />
        {/* Row 4: Crimson Red Base */}
        <rect x="12" y="72.8" width="15.2" height="15.2" fill="#E1000F" rx="1.5" />
        <rect x="72.8" y="72.8" width="15.2" height="15.2" fill="#E1000F" rx="1.5" />
      </svg>
    );
  }

  // High-res official provider image assets
  const logoImageMap: Record<string, string> = {
    openai: '/logos/openai.png',
    gpt: '/logos/openai.png',
    chatgpt: '/logos/openai.png',
    o1: '/logos/openai.png',
    o3: '/logos/openai.png',
    o4: '/logos/openai.png',
    gemini: '/logos/gemini.png',
    google: '/logos/gemini.png',
    anthropic: '/logos/claudeai.webp',
    claude: '/logos/claudeai.webp',
    deepseek: '/logos/deepseek.png',
    grok: '/logos/grok.png',
    xai: '/logos/grok.png',
    groq: '/logos/groq.webp',
    mistral: '/logos/mistral.webp',
    kimi: '/logos/kimi.webp',
    moonshot: '/logos/kimi.webp',
    xiaomi: '/logos/mi.png',
    mimo: '/logos/mi.png',
    mi: '/logos/mi.png',
    minimax: '/logos/minimax.webp',
    nvidia: '/logos/nvidia.png',
    ollama: '/logos/ollama.png',
    openrouter: '/logos/openrouter.png',
    perplexity: '/logos/perplexity.webp',
    qwen: '/logos/qwen.webp',
    dashscope: '/logos/qwen.webp',
    huggingface: '/logos/hugging face.png',
    hf: '/logos/hugging face.png',
    cloudflare: '/logos/Cloudflare.png',
  };

  const matchedKey = Object.keys(logoImageMap).find((k) => isMatch(k));
  if (matchedKey && logoImageMap[matchedKey]) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={logoImageMap[matchedKey]}
        alt={$t(providerId || 'AI Provider')}
        className={`${currentSizeClass} shrink-0 rounded-md object-contain ${className}`}
      />
    );
  }

  // Unique ID prefix for gradients/filters in SVGs to prevent DOM ID collisions
  const uid = React.useId().replace(/:/g, '');

  // ==========================================
  // 0. Custom Provider Spec (Custom / Local / Proxy)
  // ==========================================
  if (isMatch('custom', 'new_custom', 'custom_provider', 'local_endpoint')) {
    const customGradId = `custom-grad-${uid}`;
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${currentSizeClass} shrink-0 ${className} rounded-xl overflow-hidden shadow-sm`}
        aria-label={$t("Custom Provider")}
      >
        <defs>
          <linearGradient id={customGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="22" fill={`url(#${customGradId})`} />
        {/* Modern API / Server Connector Glyph */}
        <g fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          {/* Top Server Layer */}
          <rect x="22" y="22" width="56" height="22" rx="6" />
          <circle cx="34" cy="33" r="2.5" fill="#FFFFFF" stroke="none" />
          <circle cx="44" cy="33" r="2.5" fill="#FFFFFF" stroke="none" />
          {/* Bottom Server Layer */}
          <rect x="22" y="56" width="56" height="22" rx="6" />
          <circle cx="34" cy="67" r="2.5" fill="#FFFFFF" stroke="none" />
          <circle cx="44" cy="67" r="2.5" fill="#FFFFFF" stroke="none" />
          {/* Connecting Vertical Sync Link */}
          <path d="M64 44 V56" strokeWidth="5" strokeDasharray="3 3" />
        </g>
      </svg>
    );
  }

  // ==========================================
  // 1. OpenAI (openai.png)
  // ==========================================
  if (isMatch('openai', 'gpt', 'o1', 'o3', 'o4', 'chatgpt')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${currentSizeClass} text-emerald-400 shrink-0 ${className}`}
        aria-label={$t("OpenAI")}
      >
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1683a.0757.0757 0 0 1-.071 0l-4.8303-2.7866A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zM20.252 5.4852a4.4755 4.4755 0 0 1 .5346 3.0137l-.142-.0852-4.783-2.7582a.7712.7712 0 0 0-.7806 0L9.2382 9.024V6.6916a.0804.0804 0 0 1 .0332-.0615l4.8493-2.796a4.4992 4.4992 0 0 1 6.1313 1.6511zM12.008 13.1677l-2.616-1.508 2.616-1.5127 2.616 1.5127z" />
      </svg>
    );
  }

  // ==========================================
  // 2. Google Gemini (gemini.png)
  // ==========================================
  if (isMatch('gemini', 'google', 'gemma')) {
    const gradId = `gemini-grad-${uid}`;
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${currentSizeClass} shrink-0 ${className}`}
        aria-label={$t("Google Gemini")}
      >
        <defs>
          <radialGradient
            id={gradId}
            cx="35%"
            cy="40%"
            r="65%"
            fx="30%"
            fy="35%"
          >
            <stop offset="0%" stopColor="#4285F4" />
            <stop offset="25%" stopColor="#669DF6" />
            <stop offset="50%" stopColor="#9B72CB" />
            <stop offset="75%" stopColor="#EA4335" />
            <stop offset="90%" stopColor="#FBBC04" />
            <stop offset="100%" stopColor="#34A853" />
          </radialGradient>
        </defs>
        <path
          fill={`url(#${gradId})`}
          d="M50 0C50 27.614 27.614 50 0 50C27.614 50 50 72.386 50 100C50 72.386 72.386 50 100 50C72.386 50 50 27.614 50 0Z"
        />
      </svg>
    );
  }

  // ==========================================
  // 3. Anthropic Claude (claudeai.webp)
  // ==========================================
  if (isMatch('anthropic', 'claude')) {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${currentSizeClass} shrink-0 ${className} rounded-md overflow-hidden`}
        aria-label={$t("Anthropic Claude")}
      >
        {/* Warm Terracotta Rounded Square */}
        <rect width="100" height="100" rx="22" fill="#CC785C" />
        {/* Authentic Multi-Ray Cream Sunburst */}
        <g fill="#FAF4ED" transform="translate(50, 50)">
          {/* 14 Radiating Petals / Rays */}
          {[
            { angle: 0, scaleY: 1.05 },
            { angle: 25.7, scaleY: 0.95 },
            { angle: 51.4, scaleY: 1.08 },
            { angle: 77.1, scaleY: 0.92 },
            { angle: 102.8, scaleY: 1.05 },
            { angle: 128.5, scaleY: 0.94 },
            { angle: 154.2, scaleY: 1.06 },
            { angle: 180, scaleY: 0.98 },
            { angle: 205.7, scaleY: 1.04 },
            { angle: 231.4, scaleY: 0.93 },
            { angle: 257.1, scaleY: 1.07 },
            { angle: 282.8, scaleY: 0.91 },
            { angle: 308.5, scaleY: 1.06 },
            { angle: 334.2, scaleY: 0.96 },
          ].map((ray, i) => (
            <g key={i} transform={`rotate(${ray.angle})`}>
              <path
                d="M-3.5 0 L0 -35 L3.5 0 L0 3 Z"
                transform={`scale(1, ${ray.scaleY})`}
              />
              <circle cx="0" cy={-34 * ray.scaleY} r="3.2" />
            </g>
          ))}
          <circle cx="0" cy="0" r="7.5" fill="#FAF4ED" />
        </g>
      </svg>
    );
  }

  // ==========================================
  // 4. DeepSeek (deepseek.png)
  // ==========================================
  if (isMatch('deepseek', 'deep-seek', 'r1', 'v3')) {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${currentSizeClass} shrink-0 ${className}`}
        aria-label={$t("DeepSeek")}
      >
        {/* Vibrant Blue Jumping Whale Mascot */}
        <g fill="#2B7FFF">
          {/* Main Swimming Whale Body */}
          <path d="M48 18C28 18 10 32 10 52C10 74 29 88 52 88C64 88 75 83 82 74C80 67 76 60 70 55C66 43 72 34 81 29C74 27 67 30 63 34C58 24 53 18 48 18Z" />
          {/* Whale Tail Flukes */}
          <path d="M82 23C87 18 95 19 97 22C99 26 95 34 88 38C82 41 78 36 78 32C78 28 80 25 82 23Z" />
          <path d="M78 38C85 40 93 46 95 50C96 54 90 60 84 60C78 60 74 54 75 48C75 44 76 40 78 38Z" />
          {/* Whale Belly Cutout (White Patch) */}
          <path
            d="M17 55C17 68 31 80 48 80C58 80 63 76 64 71C60 67 52 64 45 64C35 64 26 59 22 51C19 52 17 53 17 55Z"
            fill="#FFFFFF"
          />
          {/* Whale Eye & Smile */}
          <circle cx="56" cy="49" r="3.2" fill="#FFFFFF" />
          <path
            d="M52 56C55 58 60 57 63 54"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>
    );
  }

  // ==========================================
  // 5. xAI / Grok (grok.png)
  // ==========================================
  if (isMatch('xai', 'grok', 'twitter')) {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${currentSizeClass} shrink-0 ${className} rounded-md bg-black`}
        aria-label={$t("xAI Grok")}
      >
        {/* Authentic xAI Grok Monogram Blade */}
        <g fill="#FFFFFF">
          <path d="M49.9 22.5C34.7 22.5 22.4 34.8 22.4 50C22.4 65.2 34.7 77.5 49.9 77.5C59.2 77.5 67.4 72.8 72.3 65.7L64.1 57.5C61 62.4 55.7 65.6 49.9 65.6C41.3 65.6 34.3 58.6 34.3 50C34.3 41.4 41.3 34.4 49.9 34.4C55.7 34.4 60.9 37.6 64.1 42.5L72.3 34.3C67.4 27.2 59.2 22.5 49.9 22.5Z" />
          <path d="M12.5 87.5L87.5 12.5L78.8 3.8L3.8 78.8L12.5 87.5Z" />
        </g>
      </svg>
    );
  }

  // ==========================================
  // 6. Groq (groq.webp)
  // ==========================================
  if (isMatch('groq')) {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${currentSizeClass} shrink-0 ${className} rounded-md overflow-hidden`}
        aria-label={$t("Groq")}
      >
        {/* Vibrant Red-Orange Background */}
        <rect width="100" height="100" rx="20" fill="#F04438" />
        {/* Bold White Stylized 'g' / 9 Loop */}
        <path
          d="M50 18C32.327 18 18 32.327 18 50C18 67.673 32.327 82 50 82C67.673 82 82 67.673 82 50V24H66V50C66 58.837 58.837 66 50 66C41.163 66 34 58.837 34 50C34 41.163 41.163 34 50 34C58.837 34 66 41.163 66 50H82C82 32.327 67.673 18 50 18Z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // ==========================================
  // 7. Moonshot / Kimi (kimi.webp)
  // ==========================================
  if (isMatch('moonshot', 'kimi')) {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${currentSizeClass} shrink-0 ${className} rounded-md bg-black`}
        aria-label={$t("Moonshot Kimi")}
      >
        {/* Bold White 'K' with Smooth Curve Leg */}
        <path
          d="M24 24H35V45.5L54.5 24H68L44.5 50.5C44.5 50.5 57.5 61 68 76H54L35 55V76H24V24Z"
          fill="#FFFFFF"
        />
        {/* Electric Blue / Cyan Top-Right Dot */}
        <circle cx="74" cy="28" r="7.5" fill="#3B82F6" />
      </svg>
    );
  }

  // ==========================================
  // 8. Xiaomi (Mi / MiMo) (mi.png)
  // ==========================================
  if (isMatch('xiaomi', 'mimo', 'mi')) {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${currentSizeClass} shrink-0 ${className} rounded-md overflow-hidden`}
        aria-label={$t("Xiaomi")}
      >
        {/* Xiaomi Orange Squircle Background */}
        <rect width="100" height="100" rx="30" fill="#FF6900" />
        {/* White Xiaomi 'mi' Glyph */}
        <g fill="#FFFFFF">
          {/* 'm' left vertical, arch & right vertical */}
          <path d="M23 33H47C53 33 57 37 57 43V67H48V46C48 43 46 41 43 41H32V67H23V33Z" />
          {/* 'm' middle column */}
          <rect x="38" y="47" width="9" height="20" />
          {/* 'i' letter stem */}
          <rect x="68" y="33" width="9" height="34" />
        </g>
      </svg>
    );
  }

  // ==========================================
  // 9. MiniMax (minimax.webp)
  // ==========================================
  if (isMatch('minimax', 'abab')) {
    const gradId = `minimax-grad-${uid}`;
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${currentSizeClass} shrink-0 ${className} rounded-md overflow-hidden`}
        aria-label={$t("MiniMax")}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E91E63" />
            <stop offset="50%" stopColor="#FF4081" />
            <stop offset="100%" stopColor="#FF9800" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="20" fill={`url(#${gradId})`} />
        {/* White Soundwave 'M' Rounded Bars */}
        <g stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M18 50 V48 C18 40 28 40 28 48 V65 C28 73 38 73 38 65 V28 C38 20 48 20 48 28 V70 C48 78 58 78 58 70 V32 C58 24 68 24 68 32 V62 C68 70 78 70 78 62 V50" />
        </g>
      </svg>
    );
  }

  // ==========================================
  // 10. Mistral AI (mistral.webp)
  // ==========================================
  if (isMatch('mistral', 'codestral', 'pixtral', 'mixtral')) {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${currentSizeClass} shrink-0 ${className} rounded-md bg-black p-1`}
        aria-label={$t("Mistral AI")}
      >
        {/* 5 Rows of French Sunset Gradient Pixels */}
        {/* Row 1 (Top Yellow) */}
        <rect x="14" y="16" width="14" height="14" rx="2" fill="#FCD34D" />
        <rect x="72" y="16" width="14" height="14" rx="2" fill="#FCD34D" />

        {/* Row 2 (Amber) */}
        <rect x="14" y="32" width="14" height="14" rx="2" fill="#F59E0B" />
        <rect x="33.5" y="32" width="14" height="14" rx="2" fill="#F59E0B" />
        <rect x="52.5" y="32" width="14" height="14" rx="2" fill="#F59E0B" />
        <rect x="72" y="32" width="14" height="14" rx="2" fill="#F59E0B" />

        {/* Row 3 (Orange) */}
        <rect x="14" y="48" width="14" height="14" rx="2" fill="#F97316" />
        <rect x="43" y="48" width="14" height="14" rx="2" fill="#F97316" />
        <rect x="72" y="48" width="14" height="14" rx="2" fill="#F97316" />

        {/* Row 4 (Deep Orange) */}
        <rect x="14" y="64" width="14" height="14" rx="2" fill="#EA580C" />
        <rect x="72" y="64" width="14" height="14" rx="2" fill="#EA580C" />

        {/* Row 5 (Bottom Red Accent) */}
        <rect x="43" y="70" width="14" height="12" rx="2" fill="#DC2626" />
      </svg>
    );
  }

  // ==========================================
  // 11. NVIDIA (nvidia.png)
  // ==========================================
  if (isMatch('nvidia', 'nemotron', 'nim')) {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${currentSizeClass} shrink-0 ${className} rounded-md overflow-hidden`}
        aria-label={$t("NVIDIA")}
      >
        {/* NVIDIA Signature Green Square */}
        <rect x="38" y="16" width="60" height="68" rx="2" fill="#76B900" />
        {/* White Cyber Eye Contour Curves */}
        <g stroke="#FFFFFF" fill="none" strokeWidth="6" strokeLinecap="round">
          <path d="M6 46C20 28 48 28 62 46C48 64 20 64 6 46Z" stroke="#76B900" strokeWidth="8" />
          <path d="M14 46C26 33 46 33 58 46C46 59 26 59 14 46Z" stroke="#FFFFFF" strokeWidth="6" />
          <path d="M25 46C32 38 42 38 49 46C42 54 32 54 25 46Z" fill="#FFFFFF" stroke="none" />
        </g>
      </svg>
    );
  }

  // ==========================================
  // 12. Ollama (ollama.png)
  // ==========================================
  if (isMatch('ollama')) {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${currentSizeClass} shrink-0 ${className} rounded-md bg-white p-1`}
        aria-label={$t("Ollama")}
      >
        {/* Cute Friendly Llama Outline */}
        <g stroke="#000000" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Llama Ears */}
          <path d="M30 30 C30 14 38 14 38 28" fill="#000000" />
          <path d="M70 30 C70 14 62 14 62 28" fill="#000000" />
          {/* Fluffy Wool Head Outline */}
          <path d="M30 34 C20 38 20 54 25 64 C18 70 18 84 26 90 C32 94 40 94 46 92 C50 94 60 94 66 92 C74 94 82 88 80 78 C82 66 80 56 75 48 C78 38 70 34 62 34 C58 26 42 26 36 34" fill="#FFFFFF" />
          {/* Face Features: Eyes & Snout */}
          <circle cx="38" cy="54" r="4.5" fill="#000000" stroke="none" />
          <circle cx="62" cy="54" r="4.5" fill="#000000" stroke="none" />
          {/* Snout Outline */}
          <ellipse cx="50" cy="68" rx="12" ry="9" fill="#000000" />
          <circle cx="50" cy="65" r="3.5" fill="#FFFFFF" stroke="none" />
          <path d="M46 72 Q50 76 54 72" stroke="#FFFFFF" strokeWidth="2.5" />
        </g>
      </svg>
    );
  }

  // ==========================================
  // 13. OpenRouter (openrouter.png)
  // ==========================================
  if (isMatch('openrouter', 'open-router')) {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${currentSizeClass} shrink-0 ${className}`}
        aria-label={$t("OpenRouter")}
      >
        {/* Electric Neon Chartreuse 'R' Keyhole */}
        <path
          d="M20 16H60C78 16 92 30 92 48C92 63 81 76 67 79L95 86H70L48 76H20C12 76 8 72 8 64V28C8 20 12 16 20 16Z"
          fill="#B8FF00"
        />
        {/* Inner Circle Cutout */}
        <circle cx="45" cy="48" r="18" fill="#0A0A0A" />
      </svg>
    );
  }

  // ==========================================
  // 14. Perplexity (perplexity.webp)
  // ==========================================
  if (isMatch('perplexity', 'sonar')) {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${currentSizeClass} shrink-0 ${className} rounded-md bg-black p-0.5`}
        aria-label={$t("Perplexity")}
      >
        {/* 3D Interlocking Blue-Violet Asterisk Prism */}
        <g fill="#20B2AA">
          {/* Vertical & Diagonal Woven 3D Segments */}
          <path d="M50 10L68 28H50V10Z" fill="#5C7CFA" />
          <path d="M50 10L32 28H50V10Z" fill="#4263EB" />
          <path d="M90 50L72 68V50H90Z" fill="#4C6EF5" />
          <path d="M90 50L72 32V50H90Z" fill="#3B5BDB" />
          <path d="M50 90L32 72H50V90Z" fill="#364FC7" />
          <path d="M50 90L68 72H50V90Z" fill="#4263EB" />
          <path d="M10 50L28 32V50H10Z" fill="#5C7CFA" />
          <path d="M10 50L28 68V50H10Z" fill="#748FFC" />
          {/* Center Hex Core */}
          <polygon points="50,30 68,40 68,60 50,70 32,60 32,40" fill="#FFFFFF" fillOpacity="0.9" />
          <polygon points="50,35 63,42 63,58 50,65 37,58 37,42" fill="#0D1117" />
        </g>
      </svg>
    );
  }

  // ==========================================
  // 15. Qwen / Alibaba DashScope (qwen.webp)
  // ==========================================
  if (isMatch('qwen', 'dashscope', 'alibaba')) {
    const gradId = `qwen-grad-${uid}`;
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${currentSizeClass} shrink-0 ${className} rounded-md bg-black p-0.5`}
        aria-label={$t("Qwen Alibaba")}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>
        {/* 3D Crystalline Mobius Star */}
        <g fill={`url(#${gradId})`}>
          <polygon points="50,12 85,32 85,68 50,88 15,68 15,32" fillOpacity="0.2" stroke="#818CF8" strokeWidth="4" />
          <polygon points="50,24 75,38 75,62 50,76 25,62 25,38" fill="#6366F1" fillOpacity="0.6" />
          <polygon points="50,34 65,42 65,58 50,66 35,58 35,42" fill="#FFFFFF" />
          <circle cx="50" cy="50" r="5" fill="#4F46E5" />
        </g>
      </svg>
    );
  }

  // ==========================================
  // 16. Hugging Face (hugging face.png)
  // ==========================================
  if (isMatch('huggingface', 'hf', 'hugging-face')) {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${currentSizeClass} shrink-0 ${className}`}
        aria-label={$t("Hugging Face")}
      >
        {/* Warm Golden Yellow Smiling Face */}
        <circle cx="50" cy="50" r="42" fill="#FFD21E" stroke="#FFB000" strokeWidth="3" />

        {/* Happy Smiling Eyes */}
        <path d="M30 42C33 36 40 36 43 42" stroke="#2D3748" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M57 42C60 36 67 36 70 42" stroke="#2D3748" strokeWidth="4.5" strokeLinecap="round" fill="none" />

        {/* Blush Cheeks */}
        <circle cx="28" cy="52" r="5" fill="#FFA000" />
        <circle cx="72" cy="52" r="5" fill="#FFA000" />

        {/* Open Smiling Mouth with Pink Tongue */}
        <path d="M36 54C36 68 64 68 64 54Z" fill="#E53E3E" />
        <path d="M42 60C42 66 58 66 58 60C54 58 46 58 42 60Z" fill="#FF8596" />

        {/* Two Hugging Hands on Left & Right */}
        {/* Left Hand */}
        <g fill="#FFD21E" stroke="#FFB000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 60C8 56 12 50 18 52L30 58C34 60 35 66 31 70L22 76C16 80 10 74 12 68Z" />
          <path d="M18 52L26 62" />
          <path d="M14 58L22 66" />
        </g>
        {/* Right Hand */}
        <g fill="#FFD21E" stroke="#FFB000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M88 60C92 56 88 50 82 52L70 58C66 60 65 66 69 70L78 76C84 80 90 74 88 68Z" />
          <path d="M82 52L74 62" />
          <path d="M86 58L78 66" />
        </g>
      </svg>
    );
  }

  // ==========================================
  // 17. Cloudflare (Cloudflare.png)
  // ==========================================
  if (isMatch('cloudflare')) {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${currentSizeClass} shrink-0 ${className}`}
        aria-label={$t("Cloudflare")}
      >
        {/* Iconic Cloudflare Orange & Gold Cloud */}
        {/* Main Orange Cloud Body */}
        <path
          d="M68 34C64 24 53 18 42 20C32 22 24 30 22 40C12 41 4 49 4 60C4 71 13 80 24 80H74C86 80 96 70 96 58C96 47 88 38 78 36C76 34 72 34 68 34Z"
          fill="#F38020"
        />
        {/* Golden Orange Right Tail Accent */}
        <path
          d="M74 54H32C30 54 28 56 28 58C28 60 30 62 32 62H74C82 62 88 56 88 54C88 54 82 54 74 54Z"
          fill="#FAAD3F"
        />
      </svg>
    );
  }

  // ==========================================
  // 18. GLM / Zhipu AI
  // ==========================================
  if (isMatch('glm', 'zhipu', 'chatglm')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${currentSizeClass} shrink-0 ${className}`}
        aria-label={$t("GLM Zhipu AI")}
      >
        <circle cx="12" cy="12" r="10" fill="#0EA5E9" fillOpacity="0.2" stroke="#38BDF8" strokeWidth="1.8" />
        <path d="M7 12H17M12 7V17M8.5 8.5L15.5 15.5M8.5 15.5L15.5 8.5" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3.5" fill="#38BDF8" />
      </svg>
    );
  }

  // ==========================================
  // 19. Meta / Llama
  // ==========================================
  if (isMatch('meta', 'llama')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${currentSizeClass} text-blue-500 shrink-0 ${className}`}
        aria-label={$t("Meta Llama")}
      >
        <path d="M12 6.5C8.8 3 4.5 3.5 2 6.8C-0.8 10.5-0.5 16 3 19.5C5.8 22.2 9.5 21.5 12 18.2C14.5 21.5 18.2 22.2 21 19.5C24.5 16 24.8 10.5 22 6.8C19.5 3.5 15.2 3 12 6.5ZM7.8 16.5C5.5 16.5 4 14.8 4 12.8C4 10.8 5.5 9.2 7.8 9.2C10.1 9.2 11.2 11.5 12 13.5C11.2 15.5 10.1 16.5 7.8 16.5ZM16.2 16.5C13.9 16.5 12.8 15.5 12 13.5C12.8 11.5 13.9 9.2 16.2 9.2C18.5 9.2 20 10.8 20 12.8C20 14.8 18.5 16.5 16.2 16.5Z" />
      </svg>
    );
  }

  // ==========================================
  // 20. Together AI
  // ==========================================
  if (isMatch('together')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${currentSizeClass} text-blue-400 shrink-0 ${className}`}
        aria-label={$t("Together AI")}
      >
        <path d="M12 3L4 9V15L12 21L20 15V9L12 3ZM12 7L16 10V14L12 17L8 14V10L12 7Z" />
      </svg>
    );
  }

  // ==========================================
  // 21. Fireworks AI
  // ==========================================
  if (isMatch('fireworks')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${currentSizeClass} text-rose-500 shrink-0 ${className}`}
        aria-label={$t("Fireworks AI")}
      >
        <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="#F43F5E" />
        <circle cx="19" cy="5" r="1.5" fill="#FB7185" />
        <circle cx="5" cy="19" r="1.5" fill="#FB7185" />
      </svg>
    );
  }

  // ==========================================
  // 22. Cerebras
  // ==========================================
  if (isMatch('cerebras')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={`${currentSizeClass} text-purple-400 shrink-0 ${className}`}
        aria-label={$t("Cerebras")}
      >
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="#C084FC" />
        <rect x="8" y="8" width="8" height="8" fill="#A855F7" />
        <path d="M12 2V4M12 20V22M2 12H4M20 12H22" stroke="#C084FC" />
      </svg>
    );
  }

  // ==========================================
  // 23. LM Studio / Local Studio
  // ==========================================
  if (isMatch('lmstudio', 'lm-studio', 'local')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={`${currentSizeClass} text-violet-400 shrink-0 ${className}`}
        aria-label={$t("LM Studio")}
      >
        <rect x="3" y="3" width="18" height="18" rx="4" stroke="#A78BFA" fill="#8B5CF6" fillOpacity="0.2" />
        <path d="M7 8L11 12L7 16M13 16H17" stroke="#C4B5FD" strokeLinecap="round" />
      </svg>
    );
  }

  // ==========================================
  // 24. Cohere
  // ==========================================
  if (isMatch('cohere', 'command')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${currentSizeClass} text-emerald-400 shrink-0 ${className}`}
        aria-label={$t("Cohere")}
      >
        <circle cx="8" cy="12" r="5" fill="#34D399" fillOpacity="0.8" />
        <circle cx="16" cy="12" r="5" fill="#F87171" fillOpacity="0.8" />
      </svg>
    );
  }

  // Default Fallback Logo (Cyber Badge with Ambient Glow)
  const initialLetter = (normalizedId.slice(0, 2) || 'AI').toUpperCase();
  return (
    <div
      className={`${currentSizeClass} relative rounded-xl bg-gradient-to-tr from-purple-900/60 via-indigo-900/50 to-neutral-900/80 border border-purple-500/40 text-purple-200 flex items-center justify-center font-bold text-[10px] font-mono shrink-0 shadow-xs ring-1 ring-purple-500/20 backdrop-blur-xs select-none ${className}`}
      title={$t(providerId || 'AI Provider')}
    >
      <span className="drop-shadow-xs tracking-wider">{initialLetter}</span>
      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
    </div>
  );
}
