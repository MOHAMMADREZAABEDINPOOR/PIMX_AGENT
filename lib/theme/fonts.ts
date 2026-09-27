// Pimx Agent AI - Worldwide Typography Catalog & Multi-Language Engine
// 5,000+ verified fonts across all world languages with authentic preview support

import rawFonts from './fonts-catalog.json';

export type FontLanguage =
  | 'Arabic'
  | 'Bengali'
  | 'Chinese (Simplified)'
  | 'Chinese (Traditional)'
  | 'Czech'
  | 'Danish'
  | 'Dutch'
  | 'English'
  | 'Finnish'
  | 'French'
  | 'German'
  | 'Greek'
  | 'Gujarati'
  | 'Hebrew'
  | 'Hindi'
  | 'Hungarian'
  | 'Indonesian'
  | 'Italian'
  | 'Japanese'
  | 'Kannada'
  | 'Korean'
  | 'Malay'
  | 'Malayalam'
  | 'Marathi'
  | 'Norwegian'
  | 'Persian'
  | 'Polish'
  | 'Portuguese'
  | 'Romanian'
  | 'Russian'
  | 'Spanish'
  | 'Swahili'
  | 'Swedish'
  | 'Tagalog'
  | 'Tamil'
  | 'Telugu'
  | 'Thai'
  | 'Turkish'
  | 'Ukrainian'
  | 'Urdu'
  | 'Vietnamese'
  | (string & {});

export interface FontItem {
  id: string;
  name: string;
  nativeName?: string;
  language: FontLanguage;
  cssFamily: string;
  googleFont?: string;
  sampleText?: string;
  isLocal?: boolean;
}

export interface LanguageMeta {
  id: string;
  name: string;
  nativeName: string;
  nameFa?: string;
  icon: string;
}

export const WORLD_LANGUAGES: LanguageMeta[] = [
  {
    id: "ALL",
    name: "All Languages",
    nativeName: "All Languages",
    nameFa: "All Languages",
    icon: "🌐"
  },
  {
    id: "Arabic",
    name: "Arabic",
    nativeName: "العربية",
    nameFa: "Arabic",
    icon: "🌙"
  },
  {
    id: "Bengali",
    name: "Bengali",
    nativeName: "বাংলা",
    nameFa: "Bengali",
    icon: "🇧🇩"
  },
  {
    id: "Chinese (Simplified)",
    name: "Chinese (Simplified)",
    nativeName: "简体中文",
    nameFa: "Chinese (Simplified)",
    icon: "🇨🇳"
  },
  {
    id: "Chinese (Traditional)",
    name: "Chinese (Traditional)",
    nativeName: "繁體中文",
    nameFa: "Chinese (Traditional)",
    icon: "🇭🇰"
  },
  {
    id: "Czech",
    name: "Czech",
    nativeName: "Čeština",
    nameFa: "Czech",
    icon: "🇨🇿"
  },
  {
    id: "Danish",
    name: "Danish",
    nativeName: "Dansk",
    nameFa: "Danish",
    icon: "🇩🇰"
  },
  {
    id: "Dutch",
    name: "Dutch",
    nativeName: "Nederlands",
    nameFa: "Dutch",
    icon: "🇳🇱"
  },
  {
    id: "English",
    name: "English",
    nativeName: "English & Latin",
    nameFa: "English",
    icon: "🇬🇧"
  },
  {
    id: "Finnish",
    name: "Finnish",
    nativeName: "Suomi",
    nameFa: "Finnish",
    icon: "🇫🇮"
  },
  {
    id: "French",
    name: "French",
    nativeName: "Français",
    nameFa: "French",
    icon: "🇫🇷"
  },
  {
    id: "German",
    name: "German",
    nativeName: "Deutsch",
    nameFa: "German",
    icon: "🇩🇪"
  },
  {
    id: "Greek",
    name: "Greek",
    nativeName: "Ελληνικά",
    nameFa: "Greek",
    icon: "🇬🇷"
  },
  {
    id: "Gujarati",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    nameFa: "Gujarati",
    icon: "🇮🇳"
  },
  {
    id: "Hebrew",
    name: "Hebrew",
    nativeName: "עברית",
    nameFa: "Hebrew",
    icon: "🇮🇱"
  },
  {
    id: "Hindi",
    name: "Hindi",
    nativeName: "हिन्दी / Devanagari",
    nameFa: "Hindi",
    icon: "🇮🇳"
  },
  {
    id: "Hungarian",
    name: "Hungarian",
    nativeName: "Magyar",
    nameFa: "Hungarian",
    icon: "🇭🇺"
  },
  {
    id: "Indonesian",
    name: "Indonesian",
    nativeName: "Bahasa Indonesia",
    nameFa: "Indonesian",
    icon: "🇮🇩"
  },
  {
    id: "Italian",
    name: "Italian",
    nativeName: "Italiano",
    nameFa: "Italian",
    icon: "🇮🇹"
  },
  {
    id: "Japanese",
    name: "Japanese",
    nativeName: "日本語",
    nameFa: "Japanese",
    icon: "🇯🇵"
  },
  {
    id: "Kannada",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    nameFa: "Kannada",
    icon: "🇮🇳"
  },
  {
    id: "Korean",
    name: "Korean",
    nativeName: "한국어 / Hangul",
    nameFa: "Korean",
    icon: "🇰🇷"
  },
  {
    id: "Malay",
    name: "Malay",
    nativeName: "Bahasa Melayu",
    nameFa: "Malay",
    icon: "🇲🇾"
  },
  {
    id: "Malayalam",
    name: "Malayalam",
    nativeName: "മലയാളം",
    nameFa: "Malayalam",
    icon: "🇮🇳"
  },
  {
    id: "Marathi",
    name: "Marathi",
    nativeName: "मराठी",
    nameFa: "Marathi",
    icon: "🇮🇳"
  },
  {
    id: "Norwegian",
    name: "Norwegian",
    nativeName: "Norsk",
    nameFa: "Norwegian",
    icon: "🇳🇴"
  },
  {
    id: "Persian",
    name: "Persian",
    nativeName: "فارسی",
    nameFa: "Persian",
    icon: "🇮🇷"
  },
  {
    id: "Polish",
    name: "Polish",
    nativeName: "Polski",
    nameFa: "Polish",
    icon: "🇵🇱"
  },
  {
    id: "Portuguese",
    name: "Portuguese",
    nativeName: "Português",
    nameFa: "Portuguese",
    icon: "🇵🇹"
  },
  {
    id: "Romanian",
    name: "Romanian",
    nativeName: "Română",
    nameFa: "Romanian",
    icon: "🇷🇴"
  },
  {
    id: "Russian",
    name: "Russian",
    nativeName: "Русский / Cyrillic",
    nameFa: "Russian",
    icon: "🇷🇺"
  },
  {
    id: "Spanish",
    name: "Spanish",
    nativeName: "Español",
    nameFa: "Spanish",
    icon: "🇪🇸"
  },
  {
    id: "Swahili",
    name: "Swahili",
    nativeName: "Kiswahili",
    nameFa: "Swahili",
    icon: "🇰🇪"
  },
  {
    id: "Swedish",
    name: "Swedish",
    nativeName: "Svenska",
    nameFa: "Swedish",
    icon: "🇸🇪"
  },
  {
    id: "Tagalog",
    name: "Tagalog",
    nativeName: "Filipino",
    nameFa: "Tagalog",
    icon: "🇵🇭"
  },
  {
    id: "Tamil",
    name: "Tamil",
    nativeName: "தமிழ்",
    nameFa: "Tamil",
    icon: "🇮🇳"
  },
  {
    id: "Telugu",
    name: "Telugu",
    nativeName: "తెలుగు",
    nameFa: "Telugu",
    icon: "🇮🇳"
  },
  {
    id: "Thai",
    name: "Thai",
    nativeName: "ไทย",
    nameFa: "Thai",
    icon: "🇹🇭"
  },
  {
    id: "Turkish",
    name: "Turkish",
    nativeName: "Türkçe",
    nameFa: "Turkish",
    icon: "🇹🇷"
  },
  {
    id: "Ukrainian",
    name: "Ukrainian",
    nativeName: "Українська",
    nameFa: "Ukrainian",
    icon: "🇺🇦"
  },
  {
    id: "Urdu",
    name: "Urdu",
    nativeName: "اردو",
    nameFa: "Urdu",
    icon: "🇵🇰"
  },
  {
    id: "Vietnamese",
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    nameFa: "Vietnamese",
    icon: "🇻🇳"
  }
];

export const APP_FONTS: FontItem[] = rawFonts as unknown as FontItem[];

export function getFontItem(fontId: string): FontItem | undefined {
  return APP_FONTS.find((f) => f.id === fontId);
}

export function getFontFamily(fontId: string): string {
  if (!fontId || fontId === 'vazirmatn') return "'Vazirmatn Local', 'Vazirmatn', system-ui, sans-serif";
  if (fontId === 'inter') return "'Inter Local', 'Inter', system-ui, sans-serif";
  const found = APP_FONTS.find((f) => f.id === fontId);
  return found ? found.cssFamily : `'${fontId}', system-ui, sans-serif`;
}

export function getGoogleFontName(fontId: string): string | undefined {
  const found = APP_FONTS.find((f) => f.id === fontId);
  return found?.googleFont;
}

export function getFontsByLanguage(lang: string): FontItem[] {
  if (lang === 'ALL') return APP_FONTS;
  return APP_FONTS.filter((f) => f.language === lang);
}

export function getTextDirection(text: string): 'rtl' | 'ltr' {
  if (!text) return 'ltr';
  const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF]/;
  return rtlRegex.test(text) ? 'rtl' : 'ltr';
}
