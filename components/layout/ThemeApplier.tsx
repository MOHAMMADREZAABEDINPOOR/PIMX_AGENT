'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { getPresetById } from '@/lib/theme/presets';
import { getAccentById } from '@/lib/theme/accents';
import { getFontFamily, getFontItem } from '@/lib/theme/fonts';

function hexToRgbValues(hex: string): { r: number; g: number; b: number; str: string } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num) || clean.length !== 6) {
    return { r: 139, g: 92, b: 246, str: '139, 92, 246' };
  }
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return { r, g, b, str: `${r}, ${g}, ${b}` };
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let c = hex.replace('#', '').trim();
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return ('#' + f(0) + f(8) + f(4)).toUpperCase();
}

/**
 * Ensures theme colors are aesthetically balanced, elegant, and never oversaturated
 * in light mode or washed out in dark mode. Prevents eye-burning high-vis colors.
 */
function sanitizeThemeColor(hex: string, role: 'bg' | 'surface', isDark: boolean): string {
  if (!hex || typeof hex !== 'string') {
    return isDark
      ? (role === 'bg' ? '#08090C' : '#141724')
      : (role === 'bg' ? '#FAFAFA' : '#FFFFFF');
  }

  const { h, s, l } = hexToHsl(hex);

  if (!isDark) {
    // Light Mode: Calm, high-contrast, zero eye-fatigue
    if (role === 'surface') {
      // Modals, cards, sidebar, composer, message bubbles MUST be crisp white
      if (s > 4 || l < 98) {
        return '#FFFFFF';
      }
      return hex;
    }
    if (role === 'bg') {
      // Background can have a very subtle whisper of theme hue, never blinding saturation
      if (s > 8 || l < 97) {
        return hslToHex(h, Math.min(s, 6), Math.max(l, 98));
      }
      return hex;
    }
  } else {
    // Dark Mode: Deep, rich true darks
    if (role === 'bg' && l > 12) {
      return hslToHex(h, Math.min(s, 18), 6);
    }
    if (role === 'surface' && l > 20) {
      return hslToHex(h, Math.min(s, 20), 12);
    }
  }

  return hex;
}

export function ThemeApplier() {
  const { settings, customFonts } = useAppStore();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Inject or update dynamic @font-face rules for all user uploaded fonts
    let styleEl = document.getElementById('pimx-custom-fonts-style') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'pimx-custom-fonts-style';
      document.head.appendChild(styleEl);
    }

    const fontFaceRules = customFonts
      .filter((cf) => (cf.fileBase64 && /^data:(?:font\/[a-z0-9.+-]+|application\/[a-z0-9.+-]+);base64,[A-Za-z0-9+/]+=*$/.test(cf.fileBase64)) || (cf.url && /^https:\/\/[^'\\\s]+$/.test(cf.url)))
      .map((cf) => {
        const src = cf.fileBase64
          ? `url('${cf.fileBase64}') format('${cf.format || 'truetype'}')`
          : `url('${cf.url}')`;
        return `
          @font-face {
            font-family: '${CSS.escape(cf.fontFamily)}';
            src: ${src};
            font-weight: 100 900;
            font-style: normal;
            font-display: swap;
          }
        `;
      })
      .join('\n');

    styleEl.textContent = fontFaceRules;

    // 2. Load Google Fonts dynamically on demand for all configured languages
    const langFonts = settings.languageFonts || {
      persian: 'vazirmatn',
      latin: 'inter',
      arabic: 'cairo',
      mono: 'jetbrains-mono',
      japanese: 'noto-sans-jp',
      korean: 'nanum-gothic',
      hebrew: 'heebo',
      devanagari: 'poppins',
      thai: 'prompt',
      cyrillic: 'oswald',
      greek: 'roboto',
      vietnamese: 'be-vietnam-pro',
      serif: 'playfair-display',
      display: 'bungee',
    };

    const fontsToCheck = [
      langFonts.persian,
      langFonts.latin,
      langFonts.arabic,
      langFonts.mono,
      langFonts.japanese,
      langFonts.korean,
      langFonts.hebrew,
      langFonts.devanagari,
      langFonts.thai,
      langFonts.cyrillic,
      langFonts.greek,
      langFonts.vietnamese,
      langFonts.serif,
      langFonts.display,
      settings.appFont,
      settings.monoFont,
    ].filter((id): id is string => Boolean(id));

    const googleFontsToLoad = Array.from(
      new Set(
        fontsToCheck
          .map((id) => getFontItem(id)?.googleFont)
          .filter(Boolean) as string[]
      )
    );

    if (googleFontsToLoad.length > 0) {
      const familyParams = googleFontsToLoad
        .map((f) => `family=${f}:ital,wght@0,300..900;1,300..900`)
        .join('&');
      let googleLink = document.getElementById('pimx-dynamic-google-fonts') as HTMLLinkElement | null;
      if (!googleLink) {
        googleLink = document.createElement('link');
        googleLink.id = 'pimx-dynamic-google-fonts';
        googleLink.rel = 'stylesheet';
        document.head.appendChild(googleLink);
      }
      googleLink.href = `https://fonts.googleapis.com/css2?${familyParams}&display=swap`;
    }

    const preset = getPresetById(settings.themePreset);
    const accent = getAccentById(settings.accent);
    const isDark =
      settings.themeMode === 'DARK'
        ? true
        : settings.themeMode === 'LIGHT'
        ? false
        : window.matchMedia('(prefers-color-scheme: dark)').matches;

    const root = document.documentElement;

    const rawBg = isDark ? preset.darkBg : preset.lightBg;
    const rawSurface = isDark ? preset.darkSurface : preset.lightSurface;

    const bg = sanitizeThemeColor(rawBg, 'bg', isDark);
    const surface = sanitizeThemeColor(rawSurface, 'surface', isDark);

    // Dynamically derive text, textMuted, and border tones tailored to the theme's aesthetic
    const group = (preset.group || '').toLowerCase();
    let text = isDark ? '#F4F4F8' : '#0F172A';
    let textMuted = isDark ? '#A1A1AA' : '#64748B';
    let border = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

    if (group.includes('paper') || group.includes('editorial') || group.includes('warm')) {
      text = isDark ? '#F5EFEB' : '#231812';
      textMuted = isDark ? '#A8998A' : '#685444';
      border = isDark ? 'rgba(240, 210, 170, 0.14)' : 'rgba(90, 60, 25, 0.12)';
    } else if (group.includes('cyber') || group.includes('neon') || group.includes('terminal')) {
      text = isDark ? '#F8FAFC' : '#0F172A';
      textMuted = isDark ? '#94A3B8' : '#64748B';
      border = isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.1)';
    } else if (group.includes('nature') || group.includes('forest') || group.includes('earthy')) {
      text = isDark ? '#F0FDF4' : '#0F172A';
      textMuted = isDark ? '#86EFAC' : '#475569';
      border = isDark ? 'rgba(74, 222, 128, 0.16)' : 'rgba(0, 0, 0, 0.1)';
    } else if (group.includes('oled') || group.includes('luxury')) {
      text = isDark ? '#FFFFFF' : '#18181B';
      textMuted = isDark ? '#A1A1AA' : '#71717A';
      border = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)';
    }

    const defaultPresetAccent = isDark ? (preset.darkAccent || accent.dark) : (preset.lightAccent || accent.light);
    const accentHex = settings.customAccentHex || defaultPresetAccent;

    const rgb = hexToRgbValues(accentHex);

    // Primary CSS Variables used across components
    root.style.setProperty('--bg-color', bg);
    root.style.setProperty('--surface-color', surface);
    root.style.setProperty('--text-color', text);
    root.style.setProperty('--text-muted', textMuted);
    root.style.setProperty('--border-color', border);
    root.style.setProperty('--accent-color', accentHex);
    root.style.setProperty('--accent-rgb', rgb.str);
    const luminance = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    root.style.setProperty('--accent-contrast', luminance > 165 ? '#09090b' : '#ffffff');
    root.style.setProperty('--accent-subtle', `rgba(${rgb.str}, ${isDark ? 0.18 : 0.14})`);
    root.style.setProperty('--accent-border', `rgba(${rgb.str}, ${isDark ? 0.42 : 0.35})`);
    root.style.setProperty('--accent-ring', `rgba(${rgb.str}, 0.35)`);

    // Complementary aliases
    root.style.setProperty('--bg-base', bg);
    root.style.setProperty('--bg-surface', surface);
    root.style.setProperty('--text-main', text);
    root.style.setProperty('--border-subtle', border);
    root.style.setProperty('--accent-primary', accentHex);
    root.style.setProperty('--accent-primary-rgb', rgb.str);
    root.style.setProperty('--accent-glow', `0 0 24px rgba(${rgb.str}, ${isDark ? 0.4 : 0.25})`);

    root.style.colorScheme = isDark ? 'dark' : 'light';
    root.dataset.reduceMotion = String(settings.reduceMotion);
    root.dataset.codeWrap = String(settings.codeBlockWrap);
    root.dataset.smoothStreaming = String(settings.smoothStreaming);

    // 3. Multi-Script Typography Engine
    const persianFontFamily = getFontFamily(langFonts.persian || 'vazirmatn');
    const latinFontFamily = getFontFamily(langFonts.latin || 'inter');
    const arabicFontFamily = getFontFamily(langFonts.arabic || 'cairo');
    const monoFontFamily = getFontFamily(langFonts.mono || settings.monoFont || 'jetbrains-mono');
    const japaneseFontFamily = getFontFamily(langFonts.japanese || 'noto-sans-jp');
    const koreanFontFamily = getFontFamily(langFonts.korean || 'nanum-gothic');
    const hebrewFontFamily = getFontFamily(langFonts.hebrew || 'heebo');
    const devanagariFontFamily = getFontFamily(langFonts.devanagari || 'poppins');
    const thaiFontFamily = getFontFamily(langFonts.thai || 'prompt');
    const cyrillicFontFamily = getFontFamily(langFonts.cyrillic || 'oswald');
    const greekFontFamily = getFontFamily(langFonts.greek || 'roboto');
    const vietnameseFontFamily = getFontFamily(langFonts.vietnamese || 'be-vietnam-pro');
    const serifFontFamily = getFontFamily(langFonts.serif || 'playfair-display');
    const displayFontFamily = getFontFamily(langFonts.display || 'bungee');

    root.style.setProperty('--font-persian', persianFontFamily);
    root.style.setProperty('--font-latin', latinFontFamily);
    root.style.setProperty('--font-arabic', arabicFontFamily);
    root.style.setProperty('--font-mono', monoFontFamily);
    root.style.setProperty('--font-japanese', japaneseFontFamily);
    root.style.setProperty('--font-korean', koreanFontFamily);
    root.style.setProperty('--font-hebrew', hebrewFontFamily);
    root.style.setProperty('--font-devanagari', devanagariFontFamily);
    root.style.setProperty('--font-thai', thaiFontFamily);
    root.style.setProperty('--font-cyrillic', cyrillicFontFamily);
    root.style.setProperty('--font-greek', greekFontFamily);
    root.style.setProperty('--font-vietnamese', vietnameseFontFamily);
    root.style.setProperty('--font-serif', serifFontFamily);
    root.style.setProperty('--font-display', displayFontFamily);

    // Cascading font stack: Non-Latin scripts take precedence for their glyphs, falling back to Latin
    const activeFontFamily = `${persianFontFamily}, ${arabicFontFamily}, ${hebrewFontFamily}, ${japaneseFontFamily}, ${koreanFontFamily}, ${devanagariFontFamily}, ${thaiFontFamily}, ${cyrillicFontFamily}, ${greekFontFamily}, ${latinFontFamily}, system-ui, sans-serif`;

    root.style.setProperty('--font-app', activeFontFamily);

    // Dynamic style block for per-language font isolation
    let langStyleEl = document.getElementById('pimx-per-language-styles') as HTMLStyleElement | null;
    if (!langStyleEl) {
      langStyleEl = document.createElement('style');
      langStyleEl.id = 'pimx-per-language-styles';
      document.head.appendChild(langStyleEl);
    }

    langStyleEl.textContent = `
      body, html {
        font-family: ${activeFontFamily};
      }
      [dir="rtl"], [lang="fa"], .font-persian {
        font-family: var(--font-persian), var(--font-arabic), var(--font-latin), system-ui, sans-serif;
      }
      [dir="ltr"], [lang="en"], .font-latin {
        font-family: var(--font-latin), var(--font-persian), var(--font-arabic), system-ui, sans-serif;
      }
      [lang="ar"], .font-arabic {
        font-family: var(--font-arabic), system-ui, sans-serif;
      }
      [lang="he"], .font-hebrew {
        font-family: var(--font-hebrew), system-ui, sans-serif;
      }
      [lang="ja"], [lang="zh"], .font-japanese {
        font-family: var(--font-japanese), system-ui, sans-serif;
      }
      [lang="ko"], .font-korean {
        font-family: var(--font-korean), system-ui, sans-serif;
      }
      [lang="hi"], .font-devanagari {
        font-family: var(--font-devanagari), system-ui, sans-serif;
      }
      [lang="th"], .font-thai {
        font-family: var(--font-thai), system-ui, sans-serif;
      }
      [lang="ru"], .font-cyrillic {
        font-family: var(--font-cyrillic), system-ui, sans-serif;
      }
      [lang="el"], .font-greek {
        font-family: var(--font-greek), system-ui, sans-serif;
      }
      [lang="vi"], .font-vietnamese {
        font-family: var(--font-vietnamese), system-ui, sans-serif;
      }
      code, pre, kbd, samp, .font-mono {
        font-family: var(--font-mono), monospace !important;
      }
    `;

    document.body.style.backgroundColor = bg;
    document.body.style.color = text;
    document.body.style.fontFamily = activeFontFamily;

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings, customFonts]);

  return null;
}
