'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { CookieSettingsButton } from '@/components/site/CookieSettingsButton';
import { AdvancedPreferences } from './AdvancedPreferences';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import {
  X,
  Search,
  Settings,
  Palette,
  Type,
  Key,
  Sliders,
  Brain,
  Terminal,
  BarChart3,
  DollarSign,
  Plus,
  Trash2,
  Check,
  Copy,
  Globe,
  Calculator,
  ExternalLink,
  Coins,
  TrendingUp,
  Zap,
  Layers,
  Activity,
  Cpu,
  Filter,
  Eye,
  EyeOff,
  Sparkles,
  Database,
  Languages,
  ChevronDown,
  Upload,
} from 'lucide-react';
import { THEME_PRESETS, THEME_GROUPS } from '@/lib/theme/presets';
import { ACCENT_PRESETS, ACCENT_GROUPS } from '@/lib/theme/accents';
import { APP_FONTS, WORLD_LANGUAGES, FontItem, getFontItem } from '@/lib/theme/fonts';
import { ProviderCardGrid } from '@/components/providers/ProviderCardGrid';
import { ProviderConfigPanel } from '@/components/providers/ProviderConfigPanel';
import { ProviderLogo } from '@/components/ui/ProviderLogo';
import { VISIBLE_PROVIDERS, buildModelsForProvider } from '@/lib/providers/catalog';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

interface ModelPriceItem {
  provider: string;
  name: string;
  contextWindow: string;
  inputPricePerM: number;
  outputPricePerM: number;
  highlight?: boolean;
}

const GLOBAL_MODEL_PRICES: ModelPriceItem[] = [
  // OpenAI
  { provider: 'openai', name: 'GPT-4o', contextWindow: '128K', inputPricePerM: 2.5, outputPricePerM: 10.0, highlight: true },
  { provider: 'openai', name: 'GPT-4o mini', contextWindow: '128K', inputPricePerM: 0.15, outputPricePerM: 0.6, highlight: true },
  { provider: 'openai', name: 'o1 (Reasoning)', contextWindow: '200K', inputPricePerM: 15.0, outputPricePerM: 60.0 },
  { provider: 'openai', name: 'o3-mini', contextWindow: '200K', inputPricePerM: 1.1, outputPricePerM: 4.4, highlight: true },
  { provider: 'openai', name: 'GPT-4 Turbo', contextWindow: '128K', inputPricePerM: 10.0, outputPricePerM: 30.0 },

  // Anthropic
  { provider: 'anthropic', name: 'Claude 3.7 Sonnet', contextWindow: '200K', inputPricePerM: 3.0, outputPricePerM: 15.0, highlight: true },
  { provider: 'anthropic', name: 'Claude 3.5 Sonnet', contextWindow: '200K', inputPricePerM: 3.0, outputPricePerM: 15.0 },
  { provider: 'anthropic', name: 'Claude 3.5 Haiku', contextWindow: '200K', inputPricePerM: 0.8, outputPricePerM: 4.0 },
  { provider: 'anthropic', name: 'Claude 3 Opus', contextWindow: '200K', inputPricePerM: 15.0, outputPricePerM: 75.0 },

  // Google Gemini
  { provider: 'gemini', name: 'Gemini 2.0 Flash', contextWindow: '1M', inputPricePerM: 0.1, outputPricePerM: 0.4, highlight: true },
  { provider: 'gemini', name: 'Gemini 2.0 Pro', contextWindow: '2M', inputPricePerM: 2.0, outputPricePerM: 8.0 },
  { provider: 'gemini', name: 'Gemini 1.5 Pro', contextWindow: '2M', inputPricePerM: 1.25, outputPricePerM: 5.0 },
  { provider: 'gemini', name: 'Gemini 1.5 Flash', contextWindow: '1M', inputPricePerM: 0.075, outputPricePerM: 0.3 },

  // DeepSeek
  { provider: 'deepseek', name: 'DeepSeek V3', contextWindow: '64K', inputPricePerM: 0.14, outputPricePerM: 0.28, highlight: true },
  { provider: 'deepseek', name: 'DeepSeek R1', contextWindow: '64K', inputPricePerM: 0.55, outputPricePerM: 2.19, highlight: true },

  // xAI / Grok
  { provider: 'xai', name: 'Grok 2', contextWindow: '128K', inputPricePerM: 2.0, outputPricePerM: 10.0 },
  { provider: 'xai', name: 'Grok 2 Vision', contextWindow: '128K', inputPricePerM: 2.0, outputPricePerM: 10.0 },

  // Groq / Meta
  { provider: 'groq', name: 'Llama 3.3 70B (Groq)', contextWindow: '128K', inputPricePerM: 0.59, outputPricePerM: 0.79 },
  { provider: 'groq', name: 'Llama 3.1 8B (Groq)', contextWindow: '128K', inputPricePerM: 0.05, outputPricePerM: 0.08 },

  // Mistral
  { provider: 'mistral', name: 'Mistral Large 2', contextWindow: '128K', inputPricePerM: 2.0, outputPricePerM: 6.0 },
  { provider: 'mistral', name: 'Codestral', contextWindow: '256K', inputPricePerM: 0.3, outputPricePerM: 0.9 },

  // Qwen
  { provider: 'qwen', name: 'Qwen 2.5 72B', contextWindow: '128K', inputPricePerM: 0.4, outputPricePerM: 1.2 },
  { provider: 'qwen', name: 'Qwen 2.5 Coder 32B', contextWindow: '128K', inputPricePerM: 0.2, outputPricePerM: 0.6 },

  // Perplexity
  { provider: 'perplexity', name: 'Sonar Reasoning Pro', contextWindow: '128K', inputPricePerM: 2.0, outputPricePerM: 8.0 },
  { provider: 'perplexity', name: 'Sonar Small', contextWindow: '128K', inputPricePerM: 0.2, outputPricePerM: 0.2 },

  // Moonshot Kimi & MiniMax & Xiaomi
  { provider: 'kimi', name: 'Moonshot Kimi v1', contextWindow: '128K', inputPricePerM: 1.65, outputPricePerM: 1.65 },
  { provider: 'minimax', name: 'MiniMax Abab 6.5', contextWindow: '245K', inputPricePerM: 1.0, outputPricePerM: 1.0 },
  { provider: 'xiaomi', name: 'Xiaomi MiMo', contextWindow: '128K', inputPricePerM: 0.3, outputPricePerM: 0.8 },
];

export function SettingsModal() {
  const $t=useT();
  const {
    settingsOpen,
    setSettingsOpen,
    settingsTab,
    settings,
    updateSettings,
    accounts,
    logs,
    addLog,
    clearLogs,
    messages,
    customFonts,
    addCustomFont,
    deleteCustomFont,
    models,
    customProviders,
    testModel,
    toggleModelVisibility,
    updateModel,
    memories,
    removeMemory,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState(settingsTab || 'Appearance');
  const [inlineConfigProviderId, setInlineConfigProviderId] = useState<string | null>(null);
  const [pricingFilter, setPricingFilter] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('ALL');

  // The pricing calculator is a reference surface, so it lists every model the
  // platform ships with across every provider company, not only the models whose
  // provider has already been connected. Connected models keep their live stats.
  const catalogueModels = useMemo(
    () => VISIBLE_PROVIDERS.flatMap((spec, index) => buildModelsForProvider(spec, index * 100)),
    []
  );
  const liveModelIds = useMemo(() => new Set(models.map((m) => m.id)), [models]);
  const pricingModels = useMemo(() => {
    const liveById = new Map(models.map((m) => [m.id, m]));
    const merged = catalogueModels.map((entry) => liveById.get(entry.id) || entry);
    const extra = models.filter((m) => !catalogueModels.some((entry) => entry.id === m.id));
    return [...merged, ...extra];
  }, [catalogueModels, models]);
  const [capabilityFilter, setCapabilityFilter] = useState<'ALL' | 'VISION' | 'REASONING' | 'TOOLS' | 'FREE'>('ALL');
  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  const [batchTesting, setBatchTesting] = useState(false);

  // Diagnostics Tab State
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
  const [logSearch, setLogSearch] = useState('');
  const [copiedLogs, setCopiedLogs] = useState(false);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (logFilter !== 'ALL' && l.level !== logFilter) return false;
      if (logSearch.trim()) {
        const q = logSearch.toLowerCase();
        return (
          l.message.toLowerCase().includes(q) ||
          l.tag.toLowerCase().includes(q) ||
          (l.detail && l.detail.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [logs, logFilter, logSearch]);

  // Theme & Accent Filtering
  const [themeSearch, setThemeSearch] = useState('');
  const [selectedThemeGroup, setSelectedThemeGroup] = useState<string>('ALL');
  const [accentSearch, setAccentSearch] = useState('');
  const [selectedAccentGroup, setSelectedAccentGroup] = useState<string>('ALL');

  const filteredThemes = useMemo(() => {
    return THEME_PRESETS.filter((t) => {
      if (selectedThemeGroup !== 'ALL' && t.group !== selectedThemeGroup) {
        return false;
      }
      if (themeSearch.trim()) {
        const q = themeSearch.toLowerCase();
        return t.name.toLowerCase().includes(q) || t.group.toLowerCase().includes(q);
      }
      return true;
    });
  }, [themeSearch, selectedThemeGroup]);

  const filteredAccents = useMemo(() => {
    return ACCENT_PRESETS.filter((a) => {
      if (selectedAccentGroup !== 'ALL' && a.group !== selectedAccentGroup) {
        return false;
      }
      if (accentSearch.trim()) {
        const q = accentSearch.toLowerCase();
        return a.name.toLowerCase().includes(q) || a.group.toLowerCase().includes(q);
      }
      return true;
    });
  }, [accentSearch, selectedAccentGroup]);

  // Custom Font Form & Multi-Language Typography Filter
  const fontFileInputRef = React.useRef<HTMLInputElement>(null);
  const contentPanelRef = React.useRef<HTMLDivElement>(null);
  const navigationRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!settingsOpen) return;
    contentPanelRef.current?.scrollTo({ top: 0 });
    const revealTab = () => navigationRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    revealTab();
    window.addEventListener('resize', revealTab);
    return () => window.removeEventListener('resize', revealTab);
  }, [activeTab, settingsOpen]);
  const fontCatalogGridTopRef = React.useRef<HTMLDivElement>(null);
  const [isCustomFontModalOpen, setIsCustomFontModalOpen] = useState<boolean>(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState<boolean>(false);
  const [langDropdownSearch, setLangDropdownSearch] = useState<string>('');
  const [fontUploadError,setFontUploadError]=useState('');
  const [customFontName, setCustomFontName] = useState('');
  const [customFontUrl, setCustomFontUrl] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
  const [fontNameSearch, setFontNameSearch] = useState<string>('');
  const [catalogPage, setCatalogPage] = useState<number>(1);
  const FONTS_PER_PAGE = 36;

  // Languages strictly sorted in alphabetical order (A-Z)
  const sortedLanguagesAlphabetical = useMemo(() => {
    const all = WORLD_LANGUAGES.find((l) => l.id === 'ALL');
    const rest = WORLD_LANGUAGES.filter((l) => l.id !== 'ALL').sort((a, b) =>
      a.name.localeCompare(b.name, 'en')
    );
    return all ? [all, ...rest] : rest;
  }, []);

  // Filtered languages in dropdown by search query
  const filteredAlphabeticalLanguages = useMemo(() => {
    if (!langDropdownSearch.trim()) return sortedLanguagesAlphabetical;
    const q = langDropdownSearch.toLowerCase();
    return sortedLanguagesAlphabetical.filter(
      (lang) =>
        lang.name.toLowerCase().includes(q) ||
        lang.nativeName.toLowerCase().includes(q) ||
        lang.id.toLowerCase().includes(q)
    );
  }, [sortedLanguagesAlphabetical, langDropdownSearch]);

  // Smooth auto-scroll to top of font catalog on pagination
  const handleCatalogPageChange = (newPage: number) => {
    setCatalogPage(newPage);
    if (fontCatalogGridTopRef.current) {
      fontCatalogGridTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (contentPanelRef.current) {
      contentPanelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Current per-language configured fonts
  const currentLangFonts = useMemo(() => {
    return {
      persian: settings.languageFonts?.persian || 'vazirmatn',
      latin: settings.languageFonts?.latin || 'inter',
      arabic: settings.languageFonts?.arabic || 'cairo',
      mono: settings.languageFonts?.mono || 'jetbrains-mono',
      japanese: settings.languageFonts?.japanese || 'noto-sans-jp',
      korean: settings.languageFonts?.korean || 'nanum-gothic',
      hebrew: settings.languageFonts?.hebrew || 'heebo',
      devanagari: settings.languageFonts?.devanagari || 'poppins',
      thai: settings.languageFonts?.thai || 'prompt',
      cyrillic: settings.languageFonts?.cyrillic || 'oswald',
      greek: settings.languageFonts?.greek || 'roboto',
      vietnamese: settings.languageFonts?.vietnamese || 'be-vietnam-pro',
      serif: settings.languageFonts?.serif || 'playfair-display',
      display: settings.languageFonts?.display || 'bungee',
    };
  }, [settings.languageFonts]);

  // Helper to map language name to settings key
  const getLanguageKey = (lang: string): keyof typeof currentLangFonts => {
    switch (lang) {
      case 'Persian': return 'persian';
      case 'English': return 'latin';
      case 'Arabic': return 'arabic';
      case 'Coding': return 'mono';
      case 'Japanese & CJK': return 'japanese';
      case 'Korean': return 'korean';
      case 'Hebrew': return 'hebrew';
      case 'Devanagari': return 'devanagari';
      case 'Thai': return 'thai';
      case 'Cyrillic': return 'cyrillic';
      case 'Greek': return 'greek';
      case 'Vietnamese': return 'vietnamese';
      case 'Serif': return 'serif';
      case 'Display': return 'display';
      default: return 'latin';
    }
  };

  // Filtered fonts by selected language and keyword search
  const filteredFonts = useMemo(() => {
    return APP_FONTS.filter((f) => {
      // 1. Language Filter
      if (selectedLanguage !== 'ALL' && f.language !== selectedLanguage) {
        return false;
      }
      // 2. Font Name search
      if (fontNameSearch.trim()) {
        const q = fontNameSearch.toLowerCase();
        const matchesName = f.name.toLowerCase().includes(q);
        const matchesNative = f.nativeName?.toLowerCase().includes(q);
        const matchesLang = f.language.toLowerCase().includes(q);
        if (!matchesName && !matchesNative && !matchesLang) {
          return false;
        }
      }
      return true;
    });
  }, [selectedLanguage, fontNameSearch]);

  // Reset pagination on filter change
  useEffect(() => {
    setCatalogPage(1);
  }, [selectedLanguage, fontNameSearch]);

  // Paginated fonts for smooth display of 4800+ fonts
  const totalPages = Math.ceil(filteredFonts.length / FONTS_PER_PAGE) || 1;
  const paginatedFonts = useMemo(() => {
    const start = (catalogPage - 1) * FONTS_PER_PAGE;
    return filteredFonts.slice(start, start + FONTS_PER_PAGE);
  }, [filteredFonts, catalogPage]);

  // Dynamic preview font loader: injects <link> for visible Google Fonts
  useEffect(() => {
    const visibleGFonts = Array.from(
      new Set(
        paginatedFonts
          .map((f) => f.googleFont)
          .filter(Boolean) as string[]
      )
    );
    if (visibleGFonts.length === 0) return;

    const familiesParam = visibleGFonts.slice(0, 35).map((f) => `family=${f}:wght@400;700`).join('&');
    let link = document.getElementById('pimx-catalog-preview-fonts') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = 'pimx-catalog-preview-fonts';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?${familiesParam}&display=swap`;
  }, [paginatedFonts]);

  // Select font for a language: strictly isolates to that language and preserves all other languages!
  const handleSelectFontForLanguage = (font: FontItem, targetLangOverride?: string) => {
    const targetLang = targetLangOverride || (selectedLanguage !== 'ALL' ? selectedLanguage : font.language);
    const targetKey = getLanguageKey(targetLang);
    updateSettings({
      languageFonts: {
        ...currentLangFonts,
        [targetKey]: font.id,
      },
      ...(targetKey === 'persian' ? { appFont: font.id } : {}),
    });
  };

  // Interactive Calculator
  const [calcModelName, setCalcModelName] = useState('GPT-4o');
  const [calcInputTokens, setCalcInputTokens] = useState<number>(5000);
  const [calcOutputTokens, setCalcOutputTokens] = useState<number>(1500);
  const [calcHighlight, setCalcHighlight] = useState(false);

  const handleCalculateWithModel = (modelName: string) => {
    if (activeTab !== 'Pricing & Analytics') {
      setActiveTab('Pricing & Analytics');
    }
    const matched = GLOBAL_MODEL_PRICES.find(
      (p) =>
        p.name.toLowerCase() === modelName.toLowerCase() ||
        modelName.toLowerCase().includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().includes(modelName.toLowerCase())
    );
    if (matched) {
      setCalcModelName(matched.name);
    } else {
      setCalcModelName(modelName);
    }
    setTimeout(() => {
      const el = document.getElementById('interactive-token-cost-estimator');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setCalcHighlight(true);
        setTimeout(() => setCalcHighlight(false), 2200);
      }
    }, 80);
  };

  // Calculate accumulated token usage from all stored messages
  const totalUsage = useMemo(() => {
    let prompt = 0;
    let completion = 0;
    let totalMessages = 0;

    Object.values(messages).forEach((msgList) => {
      msgList.forEach((m) => {
        totalMessages++;
        if (m.promptTokens) prompt += m.promptTokens;
        if (m.completionTokens) completion += m.completionTokens;
      });
    });

    const estCost = (prompt / 1_000_000) * 1.5 + (completion / 1_000_000) * 6.0;

    return {
      totalMessages,
      promptTokens: prompt,
      completionTokens: completion,
      totalTokens: prompt + completion,
      estimatedCostUsd: estCost,
    };
  }, [messages]);

  // Per-model usage statistics (request count, token count, cost estimation)
  const modelUsageStats = useMemo(() => {
    const stats: Record<string, { requests: number; promptTokens: number; completionTokens: number; totalTokens: number }> = {};
    Object.values(messages).forEach((msgList) => {
      msgList.forEach((m) => {
        if (!m.modelId) return;
        if (!stats[m.modelId]) {
          stats[m.modelId] = { requests: 0, promptTokens: 0, completionTokens: 0, totalTokens: 0 };
        }
        if (m.role === 'assistant') {
          stats[m.modelId].requests += 1;
        }
        if (m.promptTokens) stats[m.modelId].promptTokens += m.promptTokens;
        if (m.completionTokens) stats[m.modelId].completionTokens += m.completionTokens;
        stats[m.modelId].totalTokens = stats[m.modelId].promptTokens + stats[m.modelId].completionTokens;
      });
    });
    return stats;
  }, [messages]);

  // Calculator cost calculation
  const selectedCalcModel = useMemo(() => {
    return GLOBAL_MODEL_PRICES.find((m) => m.name === calcModelName) || GLOBAL_MODEL_PRICES[0];
  }, [calcModelName]);

  const calculatedCostUsd =
    (calcInputTokens / 1_000_000) * selectedCalcModel.inputPricePerM +
    (calcOutputTokens / 1_000_000) * selectedCalcModel.outputPricePerM;
  const calculatedToman = Math.round(calculatedCostUsd * 95000); // approx exchange rate

  const tabs = useMemo(() => [
    { id: 'Appearance', label: 'Theme & Styling', icon: Palette },
    { id: 'Typography', label: 'Fonts & Worldwide Typography', icon: Type },
    { id: 'Providers & Models', label: 'Providers & API Keys', icon: Key },
    { id: 'Models', label: 'Models & Analytics', icon: Cpu },
    { id: 'Pricing & Analytics', label: 'Pricing & Cost Calculator', icon: DollarSign },
    { id: 'Prompt Systems', label: 'Prompt & Model Defaults', icon: Sliders },
    { id: 'General', label: 'General & UI Display', icon: Settings },
    { id: 'Reasoning & Agent', label: 'Reasoning & Agent Mode', icon: Brain },
    { id: 'Diagnostics', label: 'Diagnostics & Logs', icon: Terminal },
  ], []);

  const handleFontFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;setFontUploadError('');

    if(file.size>5*1024*1024 || !/\.(woff2?|ttf|otf)$/i.test(file.name)){setFontUploadError('Use a WOFF, WOFF2, TTF or OTF file below 5 MB.');return;}
    const signature=new Uint8Array(await file.slice(0,4).arrayBuffer()),magic=new TextDecoder().decode(signature);
    if(!['wOFF','wOF2','OTTO','true'].includes(magic) && !(signature[0]===0&&signature[1]===1&&signature[2]===0&&signature[3]===0)){setFontUploadError('This file is not a supported font.');return;}
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const format = file.name.endsWith('.woff2')
        ? 'woff2'
        : file.name.endsWith('.woff')
        ? 'woff'
        : file.name.endsWith('.otf')
        ? 'opentype'
        : 'truetype';

      const fontId = addCustomFont({
        name: cleanName,
        fontFamily: cleanName,
        fileBase64: base64,
        format: format as any,
      });

      updateSettings({ appFont: fontId });
    };
    reader.readAsDataURL(file);
    if (fontFileInputRef.current) fontFileInputRef.current.value = '';
  };

  const handleAddCustomFont = () => {
    if (!customFontName.trim()) return;
    const cleanFamily = customFontName.trim();setFontUploadError('');
    if(cleanFamily.length>80){setFontUploadError('Font names are limited to 80 characters.');return;}
    if(customFontUrl.trim()){try{const url=new URL(customFontUrl.trim(),location.origin);if(!['fonts.googleapis.com','fonts.gstatic.com',location.hostname].includes(url.hostname) || (url.protocol!=='https:' && url.origin!==location.origin))throw new Error();}catch{setFontUploadError('Use a supported Google Fonts URL or a font from this site.');return;}}

    if (customFontUrl.trim()) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = customFontUrl.trim();
      document.head.appendChild(link);
    }

    const fontId = addCustomFont({
      name: `${cleanFamily} (Web)`,
      fontFamily: cleanFamily,
      url: customFontUrl.trim() || undefined,
    });

    updateSettings({ appFont: fontId });
    setCustomFontName('');
    setCustomFontUrl('');
  };

  if (!settingsOpen) return null;

  return (
    <div
      id="settings-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) setSettingsOpen(false);
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs"
    >
      <div
        className="w-full max-w-4xl h-[92vh] sm:h-[85vh] rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        style={{
          backgroundColor: 'var(--surface-color)',
          borderColor: 'var(--border-color)',
        }}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold shadow-md"
              style={{ backgroundColor: 'var(--accent-color)',color:'var(--accent-contrast)' }}
            >
              ⚙
            </div>
            <div>
              <h3 className="font-semibold text-sm"><UiText source={"Settings & Preferences"}/></h3>
              <p className="text-xs text-muted"><UiText source={"Customize 18+ providers, 145 themes, global pricing & international fonts."}/></p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setSettingsOpen(false)} className="p-1.5 rounded-lg opacity-70 hover:opacity-100 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body (Sidebar + Content) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Navigation Tabs */}
          <div ref={navigationRef} className="settings-navigation w-56 border-r p-2 space-y-1 overflow-y-auto shrink-0" style={{ borderColor: 'var(--border-color)' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setActiveTab(tab.id)}
                  style={active ? {
                    backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                    color: 'var(--accent-color)',
                    borderColor: 'rgba(var(--accent-rgb), 0.35)',
                  } : undefined}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-all cursor-pointer ${
                    active
                      ? 'font-semibold border shadow-2xs'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" style={active ? { color: 'var(--accent-color)' } : undefined} />
                  <span className="truncate">{<UiText source={tab.label}/>}</span>
                </button>
              );
            })}
          </div>

          {/* Content Panel */}
          <div ref={contentPanelRef} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-neutral-900 dark:text-neutral-100">
            {/* THEME & APPEARANCE TAB */}
            {activeTab === 'Appearance' && (
              <div className="space-y-6">
                {/* 1. Color Mode */}
                <div>
                  <h4 className="font-semibold text-sm mb-1.5"><UiText source={"Color Mode"}/></h4>
                  <div className="flex items-center gap-2">
                    {[
                      { id: 'DARK', label: 'Dark Mode', icon: '🌙' },
                      { id: 'LIGHT', label: 'Light Mode', icon: '☀️' },
                      { id: 'SYSTEM', label: 'System Default', icon: '💻' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => updateSettings({ themeMode: mode.id as any })}
                        style={settings.themeMode === mode.id ? {
                          backgroundColor: 'var(--accent-color)',
                          borderColor: 'var(--accent-color)',
                          boxShadow: '0 0 14px rgba(var(--accent-rgb), 0.35)'
                        } : undefined}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                          settings.themeMode === mode.id
                            ? 'text-white shadow-xs font-semibold ring-2 ring-white/20'
                            : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                      >
                        <span>{mode.icon}</span>
                        <span>{<UiText source={mode.label}/>}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. 180+ Creative Theme Presets Gallery */}
                <div className="space-y-3 pt-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-black/10 dark:border-white/10">
                    <div>
                      <h4 className="font-bold text-sm flex items-center gap-2">
                        <Palette className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
                        <span><UiText source={"Creative Theme Presets ("}/>{THEME_PRESETS.length}  <UiText source={"Curated Themes)"}/></span>
                      </h4>
                      <p className="text-muted text-[11px] mt-0.5">
                         <UiText source={"Inspiring aesthetics across Cyberpunk, OLED Deep Black, Aurora Borealis, Obsidian Gold, and Wabi-Sabi styles."}/> </p>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-xl font-mono text-xs font-semibold border"
                      style={{
                        backgroundColor: 'rgba(var(--accent-rgb), 0.12)',
                        borderColor: 'rgba(var(--accent-rgb), 0.25)',
                        color: 'var(--accent-color)'
                      }}
                    >
                      {filteredThemes.length}  <UiText source={"of"}/> {THEME_PRESETS.length}  <UiText source={"themes"}/> </span>
                  </div>

                  {/* Theme Search & Category Filter */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        placeholder={$t("Search themes by name or style (e.g., Cyberpunk, Tokyo, Aurora, Gold, OLED)...")}
                        value={themeSearch}
                        onChange={(e) => setThemeSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-black/[0.03] dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-xl text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[var(--accent-color)]"
                      />
                      {themeSearch && (
                        <button
                          type="button"
                          onClick={() => setThemeSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Theme Groups Strip */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                      <button
                        type="button"
                        onClick={() => setSelectedThemeGroup('ALL')}
                        style={selectedThemeGroup === 'ALL' ? {
                          backgroundColor: 'var(--accent-color)',
                          color: 'var(--accent-contrast)'
                        } : undefined}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                          selectedThemeGroup === 'ALL'
                            ? 'text-white font-semibold shadow-2xs'
                            : 'bg-black/5 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-black/10'
                        }`}
                      >
                         <UiText source={"All Categories ("}/>{THEME_PRESETS.length})
                      </button>
                      {THEME_GROUPS.map((grp) => {
                        const isGrpActive = selectedThemeGroup === grp;
                        const count = THEME_PRESETS.filter((t) => t.group === grp).length;
                        return (
                          <button
                            key={grp}
                            type="button"
                            onClick={() => setSelectedThemeGroup(grp)}
                            style={isGrpActive ? {
                              backgroundColor: 'var(--accent-color)',
                              color: 'var(--accent-contrast)'
                            } : undefined}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                              isGrpActive
                                ? 'text-white font-semibold shadow-2xs'
                                : 'bg-black/5 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-black/10'
                            }`}
                          >
                            {grp} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Themes Cards Grid with 4-Color Swatches */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1 pr-1.5 scrollbar-thin">
                    {filteredThemes.map((t) => {
                      const isSelected = settings.themePreset === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            updateSettings({themePreset:t.id,...(!ACCENT_PRESETS.some(item=>item.id===settings.accent)?{accent:'VIOLET',customAccentHex:''}:{})});
                          }}
                          style={isSelected ? {
                            backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                            borderColor: 'var(--accent-color)',
                            boxShadow: '0 0 0 2px rgba(var(--accent-rgb), 0.35)'
                          } : undefined}
                          className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2.5 cursor-pointer ${
                            isSelected
                              ? 'shadow-xs'
                              : 'bg-black/[0.02] dark:bg-white/5 border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 hover:bg-black/[0.04] dark:hover:bg-white/[0.08]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-xs text-neutral-900 dark:text-white truncate block">{t.name}</span>
                              <span className="text-[9px] text-muted uppercase font-mono block mt-0.5 truncate">{t.group}</span>
                            </div>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-color)' }} />
                            )}
                          </div>

                          {/* 4-Block Color Palette Swatch */}
                          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 self-stretch justify-between">
                            <div className="flex items-center gap-1">
                              <div
                                className="w-4 h-4 rounded-md border border-black/20 dark:border-white/20 shadow-2xs"
                                style={{ backgroundColor: t.darkBg }}
                                title={$t("Dark Background: {0}",t.darkBg)}
                              />
                              <div
                                className="w-4 h-4 rounded-md border border-black/20 dark:border-white/20 shadow-2xs"
                                style={{ backgroundColor: t.darkSurface }}
                                title={$t("Dark Surface: {0}",t.darkSurface)}
                              />
                              <div
                                className="w-4 h-4 rounded-md border border-black/20 dark:border-white/20 shadow-2xs"
                                style={{ backgroundColor: t.lightBg }}
                                title={$t("Light Background: {0}",t.lightBg)}
                              />
                            </div>
                            <div
                              className="w-3.5 h-3.5 rounded-full ring-2 ring-white/50 dark:ring-black/50 shadow-2xs"
                              style={{
                                backgroundColor:
                                  settings.themeMode === 'LIGHT'
                                    ? (t.lightAccent || t.darkAccent)
                                    : (t.darkAccent || t.lightAccent)
                              }}
                              title={$t("Theme Accent: {0} / {1}",t.darkAccent,t.lightAccent)}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. 100+ Accent Colors Gallery with Real-Time Filter */}
                <div className="space-y-3 pt-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-black/10 dark:border-white/10">
                    <div>
                      <h4 className="font-bold text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
                        <span><UiText source={"Accent Colors ("}/>{ACCENT_PRESETS.length}  <UiText source={"Vibrant Accents)"}/></span>
                      </h4>
                      <p className="text-muted text-[11px] mt-0.5">
                         <UiText source={"Highlight colors for buttons, indicators, and interactive elements across the platform."}/> </p>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-xl font-mono text-xs font-semibold border"
                      style={{
                        backgroundColor: 'rgba(var(--accent-rgb), 0.12)',
                        borderColor: 'rgba(var(--accent-rgb), 0.25)',
                        color: 'var(--accent-color)'
                      }}
                    >
                      {filteredAccents.length}  <UiText source={"accents"}/> </span>
                  </div>

                  {/* Accent Search & Group Strip */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        placeholder={$t("Search accent colors (e.g., Neon, Cyan, Gold, Violet, Rose)...")}
                        value={accentSearch}
                        onChange={(e) => setAccentSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-black/[0.03] dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-xl text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[var(--accent-color)]"
                      />
                      {accentSearch && (
                        <button
                          type="button"
                          onClick={() => setAccentSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                      <button
                        type="button"
                        onClick={() => setSelectedAccentGroup('ALL')}
                        style={selectedAccentGroup === 'ALL' ? {
                          backgroundColor: 'var(--accent-color)',
                          color: 'var(--accent-contrast)'
                        } : undefined}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                          selectedAccentGroup === 'ALL'
                            ? 'text-white font-semibold shadow-2xs'
                            : 'bg-black/5 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-black/10'
                        }`}
                      >
                         <UiText source={"All ("}/>{ACCENT_PRESETS.length})
                      </button>
                      {ACCENT_GROUPS.map((grp) => {
                        const isGrpActive = selectedAccentGroup === grp.id;
                        const count = ACCENT_PRESETS.filter((a) => a.group === grp.id).length;
                        return (
                          <button
                            key={grp.id}
                            type="button"
                            onClick={() => setSelectedAccentGroup(grp.id)}
                            style={isGrpActive ? {
                              backgroundColor: 'var(--accent-color)',
                              color: 'var(--accent-contrast)'
                            } : undefined}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                              isGrpActive
                                ? 'text-white font-semibold shadow-2xs'
                                : 'bg-black/5 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-black/10'
                            }`}
                          >
                            {<UiText source={grp.label}/>} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Accent Swatches Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-52 overflow-y-auto p-1 pr-1.5 scrollbar-thin">
                    {filteredAccents.map((acc) => {
                      const isSelected = settings.accent === acc.id && !settings.customAccentHex;
                      return (
                        <button
                          key={acc.id}
                          onClick={() => updateSettings({ accent: acc.id, customAccentHex: '' })}
                          style={isSelected ? {
                            backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                            borderColor: 'var(--accent-color)',
                            boxShadow: '0 0 0 2px rgba(var(--accent-rgb), 0.35)'
                          } : undefined}
                          className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'shadow-xs'
                              : 'bg-black/[0.02] dark:bg-white/5 border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'
                          }`}
                        >
                          <div
                            className="w-5 h-5 rounded-full shadow-xs border border-black/15 dark:border-white/25 flex items-center justify-center"
                            style={{ backgroundColor: acc.dark }}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white drop-shadow-xs" />}
                          </div>
                          <span className="text-[10px] truncate max-w-full font-medium text-neutral-800 dark:text-neutral-200">
                            {acc.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {/* TYPOGRAPHY TAB */}
            {activeTab === 'Typography' && (
              <div className="space-y-5">
                {/* Anchor for auto-scrolling to top of font catalog on page change */}
                <div ref={fontCatalogGridTopRef} id="font-catalog-grid-top" className="scroll-mt-4" />

                {/* Unified Typography Control Bar (Font Name Search + Alphabetical Language Dropdown + Add Custom Font Modal Trigger) */}
                <div
                  className="p-4 rounded-2xl border space-y-3"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-color)' }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-black/10 dark:border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl border flex items-center justify-center"
                        style={{
                          backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                          borderColor: 'rgba(var(--accent-rgb), 0.3)',
                          color: 'var(--accent-color)'
                        }}
                      >
                        <Type className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                          <span><UiText source={"Font Catalog -"}/> {WORLD_LANGUAGES.find((l) => l.id === selectedLanguage)?.name || selectedLanguage}</span>
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border"
                            style={{
                              backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                              borderColor: 'rgba(var(--accent-rgb), 0.3)',
                              color: 'var(--accent-color)'
                            }}
                          >
                            {filteredFonts.length}  <UiText source={"fonts"}/> </span>
                        </h4>
                        <p className="text-muted text-[11px] mt-0.5">
                           <UiText source={"Font preferences are stored separately per language and remain active across sessions."}/> </p>
                      </div>
                    </div>

                    {/* Add Custom Font Button (Opens Modal) */}
                    <button
                      type="button"
                      onClick={() => setIsCustomFontModalOpen(true)}
                      style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-contrast)' }}
                      className="px-3.5 py-2 rounded-xl hover:opacity-90 text-white font-medium text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span><UiText source={"Upload Custom Font"}/></span>
                    </button>
                  </div>

                  {/* Filter Toolbar: Font Name Search + Alphabetical Language Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {/* A. Font Name Search Box */}
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        placeholder={$t("Search fonts by name (e.g., Inter, Montserrat, Roboto, Noto)...")}
                        value={fontNameSearch}
                        onChange={(e) => setFontNameSearch(e.target.value)}
                        className="w-full pl-10 pr-9 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] shadow-2xs"
                      />
                      {fontNameSearch && (
                        <button
                          type="button"
                          onClick={() => setFontNameSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white text-xs p-1 cursor-pointer"
                          title={$t("Clear search")}
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* B. Alphabetical Language Selector with Internal Search */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs flex items-center justify-between text-neutral-900 dark:text-white hover:border-[var(--accent-color)] transition-all cursor-pointer shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base shrink-0">
                            {WORLD_LANGUAGES.find((l) => l.id === selectedLanguage)?.icon || '🌐'}
                          </span>
                          <span className="font-medium truncate">
                             <UiText source={"Language:"}/> {WORLD_LANGUAGES.find((l) => l.id === selectedLanguage)?.name || selectedLanguage}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 text-muted">
                          <span className="text-[10px] font-mono">({filteredFonts.length})</span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`}
                            style={isLangDropdownOpen ? { color: 'var(--accent-color)' } : undefined}
                          />
                        </div>
                      </button>

                      {/* Dropdown Popup */}
                      {isLangDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-20"
                            onClick={() => setIsLangDropdownOpen(false)}
                          />
                          <div
                            className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-2xl border shadow-xl p-2.5 space-y-2 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
                            style={{
                              backgroundColor: 'var(--surface-color)',
                              borderColor: 'var(--border-color)',
                            }}
                          >
                            {/* Search inside language list */}
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                              <input
                                type="text"
                                placeholder={$t("Search languages (A-Z)...")}
                                value={langDropdownSearch}
                                onChange={(e) => setLangDropdownSearch(e.target.value)}
                                autoFocus
                                className="w-full pl-8 pr-3 py-1.5 bg-black/[0.03] dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-xl text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[var(--accent-color)]"
                              />
                              {langDropdownSearch && (
                                <button
                                  type="button"
                                  onClick={() => setLangDropdownSearch('')}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs p-1 cursor-pointer"
                                >
                                  ✕
                                </button>
                              )}
                            </div>

                            {/* Alphabetical list of languages */}
                            <div className="max-h-56 overflow-y-auto space-y-1 p-0.5 scrollbar-thin">
                              {filteredAlphabeticalLanguages.map((lang) => {
                                const isSelected = selectedLanguage === lang.id;
                                const count = lang.id === 'ALL'
                                  ? APP_FONTS.length
                                  : APP_FONTS.filter((f) => f.language === lang.id).length;

                                return (
                                  <button
                                    key={lang.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedLanguage(lang.id);
                                      setIsLangDropdownOpen(false);
                                    }}
                                    style={isSelected ? {
                                      backgroundColor: 'var(--accent-color)',
                                      color: 'var(--accent-contrast)'
                                    } : undefined}
                                    className={`w-full px-2.5 py-2 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                                      isSelected
                                        ? 'text-white font-bold shadow-2xs'
                                        : 'hover:bg-black/5 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <span className="text-base shrink-0">{lang.icon}</span>
                                      <div className="text-left min-w-0 flex-1">
                                        <div className="truncate">{lang.name}</div>
                                        {lang.nativeName && lang.nativeName !== lang.name && (
                                          <div className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-muted'} truncate`}>
                                            {lang.nativeName}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                      <span className={`text-[10px] font-mono ${isSelected ? 'text-white/90' : 'text-muted'}`}>
                                        {count}  <UiText source={"fonts"}/> </span>
                                      {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Font Catalog Grid Filtered with Pagination */}
                <div
                  className="p-4 rounded-2xl border space-y-3.5"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-color)' }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-black/10 dark:border-white/10">
                    <div className="text-xs text-muted">
                       <UiText source={"Click any font to apply it for \""}/>{WORLD_LANGUAGES.find((l) => l.id === selectedLanguage)?.name || selectedLanguage}<UiText source={"\"."}/> </div>

                    <span
                      className="px-2.5 py-1 rounded-xl border font-mono text-xs font-semibold"
                      style={{
                        backgroundColor: 'rgba(var(--accent-rgb), 0.12)',
                        borderColor: 'rgba(var(--accent-rgb), 0.25)',
                        color: 'var(--accent-color)'
                      }}
                    >
                       <UiText source={"Page"}/> {catalogPage}  <UiText source={"of"}/> {totalPages}
                    </span>
                  </div>

                  {/* Font Cards Grid with Exact Typography Rendering */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {paginatedFonts.length === 0 ? (
                      <div className="col-span-full py-12 text-center text-muted space-y-2">
                        <Type className="w-8 h-8 mx-auto opacity-40" />
                        <div className="text-xs font-medium"><UiText source={"No fonts found matching your criteria."}/></div>
                        <button
                          type="button"
                          onClick={() => {
                            setFontNameSearch('');
                            setSelectedLanguage('ALL');
                          }}
                          style={{ color: 'var(--accent-color)' }}
                          className="text-xs hover:underline cursor-pointer"
                        >
                           <UiText source={"Clear Filters"}/> </button>
                      </div>
                    ) : (
                      paginatedFonts.map((f) => {
                        const targetKey = selectedLanguage !== 'ALL' ? getLanguageKey(selectedLanguage) : getLanguageKey(f.language);
                        const isSelected = currentLangFonts[targetKey] === f.id;

                        return (
                          <div
                            key={f.id}
                            onClick={() => handleSelectFontForLanguage(f)}
                            style={isSelected ? {
                              backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                              borderColor: 'var(--accent-color)',
                              boxShadow: '0 0 0 2px rgba(var(--accent-rgb), 0.35)'
                            } : undefined}
                            className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 cursor-pointer text-left relative ${
                              isSelected
                                ? 'shadow-xs'
                                : 'bg-white dark:bg-neutral-900 border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 hover:shadow-xs'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-1.5">
                                <div className="min-w-0 flex-1">
                                  <div
                                    className="font-bold text-sm text-neutral-900 dark:text-white truncate"
                                    style={{ fontFamily: f.cssFamily }}
                                  >
                                    {f.name}
                                  </div>
                                  {f.nativeName && (
                                    <div className="text-[11px] text-muted font-sans truncate mt-0.5 opacity-80">
                                      {f.nativeName}
                                    </div>
                                  )}
                                </div>
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-mono uppercase bg-black/5 dark:bg-white/10 text-muted shrink-0">
                                  {f.language}
                                </span>
                              </div>

                              {/* Live Typography Preview String with exact authentic typeface */}
                              <div
                                className="mt-2.5 p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 text-xs text-neutral-900 dark:text-neutral-100 line-clamp-2 leading-relaxed"
                                style={{ fontFamily: f.cssFamily }}
                              >
                                {f.sampleText || 'The quick brown fox jumps over the lazy dog 12345'}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1 text-[10px] text-muted border-t border-black/5 dark:border-white/5">
                              <span className="font-sans opacity-75">{f.isLocal ? <UiText source={"⚡ Local Font"}/> : <UiText source={"🌐 Web Font"}/>}</span>
                              {isSelected ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" />  <UiText source={"Active for"}/> {WORLD_LANGUAGES.find((l) => l.id === (selectedLanguage !== 'ALL' ? selectedLanguage : f.language))?.name || f.language}
                                </span>
                              ) : (
                                <span style={{ color: 'var(--accent-color)' }} className="opacity-70 hover:opacity-100 font-medium">
                                   <UiText source={"Click to activate"}/> </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Pagination Controls with Auto-Scroll to Top */}
                  {totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-black/10 dark:border-white/10">
                      <div className="text-xs text-muted">
                         <UiText source={"Page"}/> {catalogPage}  <UiText source={"of"}/> {totalPages}  <UiText source={"(Showing"}/> {((catalogPage - 1) * FONTS_PER_PAGE) + 1}  <UiText source={"to"}/> {Math.min(catalogPage * FONTS_PER_PAGE, filteredFonts.length)}  <UiText source={"of"}/> {filteredFonts.length}  <UiText source={"fonts)"}/> </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={catalogPage <= 1}
                          onClick={() => handleCatalogPageChange(Math.max(1, catalogPage - 1))}
                          className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                        >
                           <UiText source={"Previous"}/> </button>
                        <span style={{ color: 'var(--accent-color)' }} className="px-2 py-1 font-mono text-xs font-bold">
                          {catalogPage} / {totalPages}
                        </span>
                        <button
                          type="button"
                          disabled={catalogPage >= totalPages}
                          onClick={() => handleCatalogPageChange(Math.min(totalPages, catalogPage + 1))}
                          className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                        >
                           <UiText source={"Next"}/> </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PROVIDERS & ACCOUNTS TAB */}
            {activeTab === 'Providers & Models' && (
              <div className="space-y-6">
                {inlineConfigProviderId ? (
                  <ProviderConfigPanel
                    providerId={inlineConfigProviderId}
                    onBack={() => setInlineConfigProviderId(null)}
                    onSelectProvider={(id) => setInlineConfigProviderId(id)}
                  />
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-black/10 dark:border-white/10">
                      <div>
                        <h3 className="font-semibold text-sm"><UiText source={"Provider & API Key Management"}/></h3>
                        <p className="text-[11px] text-muted">
                           <UiText source={"Select any provider card to configure single or bulk API keys, test connection latency, and import models."}/> </p>
                      </div>
                    </div>

                    {/* Card Grid with In-Place Selection */}
                    <ProviderCardGrid
                      onOpenConfig={(pId) => setInlineConfigProviderId(pId)}
                      onAddNewCustom={() => setInlineConfigProviderId('new_custom')}
                    />
                  </>
                )}
              </div>
            )}

            {/* DEDICATED INDEPENDENT MODELS TAB (All Models, Live Health Tests & Telemetry) */}
            {activeTab === 'Models' && (
              <div className="space-y-6">
                {/* Header and Summary Cards */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-black/10 dark:border-white/10">
                  <div>
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Cpu className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
                      <span><UiText source={"All Models & Performance Analytics"}/></span>
                    </h3>
                    <p className="text-[11px] text-muted">
                       <UiText source={"Comprehensive catalogue of all models across all connected providers. Monitor usage, latency, tokens, and test connectivity."}/> </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        if (batchTesting) return;
                        setBatchTesting(true);
                        const targetModels = models.filter((m) => {
                          if (providerFilter !== 'ALL' && m.providerId !== providerFilter) return false;
                          return true;
                        });
                        for (const m of targetModels) {
                          setTestingModelId(m.id);
                          await testModel(m.id);
                        }
                        setTestingModelId(null);
                        setBatchTesting(false);
                      }}
                      disabled={batchTesting}
                      style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-contrast)' }}
                      className="px-3 py-1.5 rounded-xl hover:opacity-90 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Zap className={`w-3.5 h-3.5 ${batchTesting ? 'animate-spin' : ''}`} />
                      <span>{batchTesting ? <UiText source={"Testing Models..."}/> : <UiText source={"Test All Models"}/>}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        models.forEach((m) => {
                          if ((providerFilter === 'ALL' || m.providerId === providerFilter) && !m.visible) {
                            toggleModelVisibility(m.id);
                          }
                        });
                      }}
                      className="px-2.5 py-1.5 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs text-muted hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    >
                       <UiText source={"Enable All"}/> </button>
                    <button
                      type="button"
                      onClick={() => {
                        models.forEach((m) => {
                          if ((providerFilter === 'ALL' || m.providerId === providerFilter) && m.visible) {
                            toggleModelVisibility(m.id);
                          }
                        });
                      }}
                      className="px-2.5 py-1.5 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs text-muted hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    >
                       <UiText source={"Disable All"}/> </button>
                  </div>
                </div>

                {/* KPI Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 space-y-1">
                    <div className="text-[10px] text-muted font-medium flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
                      <span><UiText source={"Total Models"}/></span>
                    </div>
                    <div className="text-lg font-bold font-mono">{pricingModels.length}</div>
                    <div className="text-[10px] text-muted">{[...new Set(pricingModels.map((m) => m.providerId))].length}  <UiText source={"companies,"}/> {models.length}  <UiText source={"connected"}/></div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 space-y-1">
                    <div className="text-[10px] text-muted font-medium flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-blue-500" />
                      <span><UiText source={"Total Requests"}/></span>
                    </div>
                    <div className="text-lg font-bold font-mono">{totalUsage.totalMessages}</div>
                    <div className="text-[10px] text-muted"><UiText source={"Across all conversations"}/></div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 space-y-1">
                    <div className="text-[10px] text-muted font-medium flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      <span><UiText source={"Total Tokens"}/></span>
                    </div>
                    <div className="text-lg font-bold font-mono">
                      {totalUsage.totalTokens > 1000 ? `${(totalUsage.totalTokens / 1000).toFixed(1)}k` : totalUsage.totalTokens}
                    </div>
                    <div className="text-[10px] text-muted">
                      {(totalUsage.promptTokens / 1000).toFixed(1)}<UiText source={"k in /"}/> {(totalUsage.completionTokens / 1000).toFixed(1)}<UiText source={"k out"}/> </div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 space-y-1">
                    <div className="text-[10px] text-muted font-medium flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                      <span><UiText source={"Estimated Cost"}/></span>
                    </div>
                    <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      ${totalUsage.estimatedCostUsd.toFixed(4)}
                    </div>
                    <div className="text-[10px] text-muted"><UiText source={"Blended estimation"}/></div>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(['ALL', 'VISION', 'REASONING', 'TOOLS', 'FREE'] as const).map((cap) => (
                        <button
                          key={cap}
                          type="button"
                          onClick={() => setCapabilityFilter(cap)}
                          style={capabilityFilter === cap ? {
                            backgroundColor: 'var(--accent-color)',
                            borderColor: 'var(--accent-color)',
                            color: 'var(--accent-contrast)'
                          } : undefined}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border cursor-pointer ${
                            capabilityFilter === cap
                              ? 'text-white shadow-2xs font-semibold'
                              : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-black/10'
                          }`}
                        >
                          {cap === 'ALL' ? <UiText source={"All Types"}/> : cap}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative w-48 sm:w-60">
                        <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          placeholder={$t("Search models...")}
                          value={modelSearch}
                          onChange={(e) => setModelSearch(e.target.value)}
                          className="w-full pl-7 pr-2.5 py-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-[var(--accent-color)]"
                        />
                      </div>

                      <select
                        value={providerFilter}
                        onChange={(e) => setProviderFilter(e.target.value)}
                        className="px-2.5 py-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-[var(--accent-color)] cursor-pointer"
                      >
                        <option value="ALL"><UiText source={"All Providers"}/></option>
                        {Array.from(new Set(pricingModels.map((m) => m.providerId))).map((pId) => (
                          <option key={pId} value={pId}>
                            {pId.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Responsive Models Table / Cards */}
                  <div className="border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden bg-black/[0.01] dark:bg-white/[0.02]">
                    <div className="max-h-96 overflow-y-auto divide-y divide-black/5 dark:divide-white/5">
                      {pricingModels.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted">
                           <UiText source={"No models in the catalogue yet."}/> </div>
                      ) : (
                        pricingModels
                          .filter((m) => {
                            if (providerFilter !== 'ALL' && m.providerId !== providerFilter) return false;
                            if (capabilityFilter === 'VISION' && !m.visionCapable) return false;
                            if (capabilityFilter === 'REASONING' && !m.reasoningCapable) return false;
                            if (capabilityFilter === 'TOOLS' && !m.toolsCapable) return false;
                            if (capabilityFilter === 'FREE' && !m.isFree) return false;
                            if (modelSearch.trim()) {
                              const q = modelSearch.toLowerCase();
                              return (
                                m.displayName.toLowerCase().includes(q) ||
                                m.upstreamId.toLowerCase().includes(q) ||
                                m.providerId.toLowerCase().includes(q)
                              );
                            }
                            return true;
                          })
                          .sort((a, b) => (b.visible ? 1 : 0) - (a.visible ? 1 : 0))
                          .map((m) => {
                            const stats = modelUsageStats[m.id] || { requests: 0, totalTokens: 0, promptTokens: 0, completionTokens: 0 };
                            return (
                              <div
                                key={m.id}
                                className={`p-3 flex flex-wrap items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors text-xs ${
                                  !m.visible ? 'opacity-50' : ''
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center shrink-0">
                                    <ProviderLogo providerId={m.providerId} modelId={m.upstreamId} size="sm" />
                                  </div>
                                  <div className="min-w-0 space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">{m.displayName}</span>
                                      <span className="text-[10px] font-mono text-muted uppercase bg-black/5 dark:bg-white/10 px-1.5 py-0.2 rounded">
                                        {m.providerId}
                                      </span>
                                      {!liveModelIds.has(m.id) && (
                                        <span className="text-[9px] font-mono text-neutral-500 dark:text-neutral-400 border border-black/10 dark:border-white/15 px-1.5 py-0.2 rounded">
                                           <UiText source={"Catalogue"}/> </span>
                                      )}
                                      {!m.visible && (
                                        <span className="text-[9px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.2 rounded">
                                           <UiText source={"Hidden"}/> </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-muted font-mono truncate max-w-xs">{m.upstreamId}</div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 shrink-0">
                                  {/* Stats: Requests & Tokens */}
                                  <div className="text-right space-y-0.5 hidden sm:block font-mono text-[10px]">
                                    <div className="text-neutral-800 dark:text-neutral-200">
                                      {stats.requests}  <UiText source={"reqs •"}/> {stats.totalTokens > 1000 ? `${(stats.totalTokens / 1000).toFixed(1)}k` : stats.totalTokens}  <UiText source={"tok"}/> </div>
                                    <div className="text-muted">{(m.contextWindow / 1000).toFixed(0)}<UiText source={"k context"}/></div>
                                  </div>

                                  {/* Live Test Status */}
                                  {m.lastTestStatus && m.lastTestStatus !== 'UNTESTED' && (
                                    <span
                                      className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                                        m.lastTestStatus === 'OK'
                                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                          : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                                      }`}
                                    >
                                      {m.lastTestStatus === 'OK' ? `OK (${m.lastLatencyMs || 0}ms)` : <UiText source={"Failed"}/>}
                                    </span>
                                  )}

                                  {/* Actions: Live Test & Toggle Visibility */}
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      setTestingModelId(m.id);
                                      await testModel(m.id);
                                      setTestingModelId(null);
                                    }}
                                    disabled={testingModelId === m.id || !liveModelIds.has(m.id)}
                                    title={$t(liveModelIds.has(m.id)
                                        ? 'Live Test Connection'
                                        : 'Connect this provider to run a live test')}
                                    className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs transition-colors cursor-pointer"
                                  >
                                    <Zap
                                      className={`w-3.5 h-3.5 ${
                                        testingModelId === m.id ? 'animate-spin text-amber-500' : 'text-amber-500'
                                      }`}
                                    />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => toggleModelVisibility(m.id)}
                                    disabled={!liveModelIds.has(m.id)}
                                    title={$t(!liveModelIds.has(m.id)
                                        ? 'Connect this provider to publish this model'
                                        : m.visible
                                          ? 'Hide from picker'
                                          : 'Show in picker')}
                                    className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-muted hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                                  >
                                    {m.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleCalculateWithModel(m.displayName || m.upstreamId)}
                                    title={$t("Calculate Token Cost with this Model")}
                                    className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:opacity-80 text-muted hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                                  >
                                    <Calculator className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODEL PRICING & TOKEN CALCULATOR TAB */}
            {activeTab === 'Pricing & Analytics' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-black/10 dark:border-white/10">
                  <div>
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
                      <span><UiText source={"Model Pricing & Cost Calculator"}/></span>
                    </h3>
                    <p className="text-[11px] text-muted">
                       <UiText source={"Detailed token usage analytics, real-time estimated inference cost, and industry model pricing catalog."}/> </p>
                  </div>
                </div>

                {/* 1. LARGE PROMINENT HERO CARD: Consumed Tokens & Cost Summary */}
                <div
                  className="p-5 rounded-3xl border shadow-md space-y-4"
                  style={{
                    borderColor: 'var(--accent-border)',
                    background: 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.1) 0%, rgba(var(--accent-rgb), 0.03) 50%, transparent 100%)',
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-2xl border flex items-center justify-center"
                        style={{
                          backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                          borderColor: 'rgba(var(--accent-rgb), 0.25)',
                          color: 'var(--accent-color)',
                        }}
                      >
                        <Coins className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                           <UiText source={"Total Token Usage & Estimated Cost"}/> </div>
                        <div className="text-[11px] text-muted">
                           <UiText source={"Calculated across all stored conversation turns and messages"}/> </div>
                      </div>
                    </div>

                    <div className="text-right bg-white/70 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-2">
                      <div className="text-[10px] text-muted font-medium"><UiText source={"Total Estimated Cost"}/></div>
                      <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                        ${totalUsage.estimatedCostUsd.toFixed(4)} <span className="text-xs font-sans font-normal opacity-80"><UiText source={"USD"}/></span>
                      </div>
                      <div className="text-[10px] text-muted font-mono">
                        ≈ {(Math.round(totalUsage.estimatedCostUsd * 95000)).toLocaleString('fa-IR')}  <UiText source={"Toman"}/> </div>
                    </div>
                  </div>

                  {/* 4 Large Prominent Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-neutral-900/60 border border-black/10 dark:border-white/10 space-y-1 shadow-2xs">
                      <div className="text-[10px] text-muted font-medium flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                        <span><UiText source={"Total Tokens"}/></span>
                      </div>
                      <div className="text-lg font-bold font-mono text-neutral-900 dark:text-white">
                        {totalUsage.totalTokens.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-muted font-mono">
                        {totalUsage.totalTokens > 1000 ? `${(totalUsage.totalTokens / 1000).toFixed(1)}k Tokens` : `${totalUsage.totalTokens} Tokens`}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-neutral-900/60 border border-black/10 dark:border-white/10 space-y-1 shadow-2xs">
                      <div className="text-[10px] text-muted font-medium flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                        <span><UiText source={"Input Tokens (Prompt)"}/></span>
                      </div>
                      <div className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
                        {totalUsage.promptTokens.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-muted font-mono">
                        {((totalUsage.promptTokens / (totalUsage.totalTokens || 1)) * 100).toFixed(0)}<UiText source={"% of total"}/> </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-neutral-900/60 border border-black/10 dark:border-white/10 space-y-1 shadow-2xs">
                      <div className="text-[10px] text-muted font-medium flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
                        <span><UiText source={"Output Tokens (Reply)"}/></span>
                      </div>
                      <div className="text-lg font-bold font-mono" style={{ color: 'var(--accent-color)' }}>
                        {totalUsage.completionTokens.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-muted font-mono">
                        {((totalUsage.completionTokens / (totalUsage.totalTokens || 1)) * 100).toFixed(0)}<UiText source={"% of total"}/> </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-neutral-900/60 border border-black/10 dark:border-white/10 space-y-1 shadow-2xs">
                      <div className="text-[10px] text-muted font-medium flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-rose-500" />
                        <span><UiText source={"Total Requests"}/></span>
                      </div>
                      <div className="text-lg font-bold font-mono text-neutral-900 dark:text-white">
                        {totalUsage.totalMessages.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-muted font-mono">
                         <UiText source={"Avg"}/> {totalUsage.totalMessages > 0 ? Math.round(totalUsage.totalTokens / totalUsage.totalMessages) : 0}  <UiText source={"tokens / req"}/> </div>
                    </div>
                  </div>

                  {/* Ratio visual progress bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[10px] font-mono text-muted">
                      <span><UiText source={"Input (Prompt):"}/> {totalUsage.promptTokens.toLocaleString()}</span>
                      <span><UiText source={"Output (Reply):"}/> {totalUsage.completionTokens.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden flex">
                      <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${(totalUsage.promptTokens / (totalUsage.totalTokens || 1)) * 100}%` }}
                        title={$t("Prompt Tokens Ratio")}
                      />
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          backgroundColor: 'var(--accent-color)',
                          width: `${(totalUsage.completionTokens / (totalUsage.totalTokens || 1)) * 100}%`,
                        }}
                        title={$t("Completion Tokens Ratio")}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. SECTION: Foundational Model Price Cards (Exactly 2 Cards Per Row) */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
                      <span className="font-bold text-xs text-neutral-900 dark:text-white">
                         <UiText source={"Foundational Model Rates (per 1,000,000 Tokens)"}/> </span>
                    </div>
                    <div className="relative w-64">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        placeholder={$t("Search models or providers...")}
                        value={pricingFilter}
                        onChange={(e) => setPricingFilter(e.target.value)}
                        className="w-full pl-8 pr-2.5 py-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:border-[var(--accent-color)]"
                      />
                    </div>
                  </div>

                  {/* Cards Grid: Exactly 2 cards per row on md and above */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {GLOBAL_MODEL_PRICES.filter(
                      (p) =>
                        !pricingFilter ||
                        p.name.toLowerCase().includes(pricingFilter.toLowerCase()) ||
                        p.provider.toLowerCase().includes(pricingFilter.toLowerCase())
                    ).map((p) => {
                      const isSelectedForCalc = calcModelName === p.name;
                      return (
                        <div
                          key={p.name}
                          style={isSelectedForCalc ? {
                            borderColor: 'var(--accent-color)',
                            backgroundColor: 'rgba(var(--accent-rgb), 0.08)',
                            boxShadow: '0 0 0 1px rgba(var(--accent-rgb), 0.3)',
                          } : undefined}
                          className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between gap-3.5 ${
                            isSelectedForCalc
                              ? 'shadow-xs'
                              : 'border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 hover:border-black/30 dark:hover:border-white/30'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <ProviderLogo providerId={p.provider} size="sm" />
                                <div>
                                  <div className="font-bold text-xs text-neutral-900 dark:text-white">{p.name}</div>
                                  <div className="text-[10px] font-mono text-muted uppercase tracking-wider">{p.provider}</div>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-black/5 dark:bg-white/10 text-muted">
                                {p.contextWindow}  <UiText source={"context"}/> </span>
                            </div>

                            {/* Token Rates */}
                            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono">
                              <div className="p-2.5 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/15">
                                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-sans font-medium"><UiText source={"Input (Prompt)"}/></div>
                                <div className="font-bold text-blue-700 dark:text-blue-300 text-sm mt-0.5">
                                  ${p.inputPricePerM} <span className="text-[10px] opacity-70 font-sans">/ 1M</span>
                                </div>
                              </div>
                              <div
                                className="p-2.5 rounded-xl border"
                                style={{
                                  backgroundColor: 'rgba(var(--accent-rgb), 0.08)',
                                  borderColor: 'rgba(var(--accent-rgb), 0.18)',
                                }}
                              >
                                <div className="text-[10px] font-sans font-medium" style={{ color: 'var(--accent-color)' }}><UiText source={"Output (Reply)"}/></div>
                                <div className="font-bold text-sm mt-0.5" style={{ color: 'var(--accent-color)' }}>
                                  ${p.outputPricePerM} <span className="text-[10px] opacity-70 font-sans">/ 1M</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCalculateWithModel(p.name)}
                            style={isSelectedForCalc ? {
                              backgroundColor: 'var(--accent-color)',
                              color: 'var(--accent-contrast)',
                            } : undefined}
                            className={`w-full py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              isSelectedForCalc
                                ? 'text-white shadow-2xs'
                                : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 text-neutral-700 dark:text-neutral-300'
                            }`}
                          >
                            <Calculator className="w-3.5 h-3.5" />
                            <span>{isSelectedForCalc ? <UiText source={"Active in Calculator"}/> : <UiText source={"Calculate with this Model"}/>}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. SECTION: Interactive Token Pricing Calculator Card */}
                <div
                  id="interactive-token-cost-estimator"
                  style={calcHighlight ? {
                    borderColor: 'var(--accent-color)',
                    backgroundColor: 'rgba(var(--accent-rgb), 0.12)',
                    boxShadow: '0 0 20px rgba(var(--accent-rgb), 0.35)',
                  } : undefined}
                  className={`p-5 rounded-3xl border transition-all duration-700 space-y-4 shadow-sm ${
                    calcHighlight
                      ? 'scale-[1.01]'
                      : 'border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/5'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
                      <Calculator className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
                      <span><UiText source={"Interactive Token Cost Estimator"}/></span>
                      {calcHighlight && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full text-white font-mono animate-pulse"
                          style={{ backgroundColor: 'var(--accent-color)' }}
                        >
                           <UiText source={"Active Target"}/> </span>
                      )}
                    </div>
                    <div className="text-xs text-muted font-mono">
                       <UiText source={"Active Model:"}/> <span className="font-bold" style={{ color: 'var(--accent-color)' }}>{selectedCalcModel.name}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 block mb-1"><UiText source={"Target Model"}/></label>
                      <select
                        value={calcModelName}
                        onChange={(e) => setCalcModelName(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-[var(--accent-color)] cursor-pointer"
                      >
                        {GLOBAL_MODEL_PRICES.map((mp) => (
                          <option key={mp.name} value={mp.name}>
                            {mp.name} (${mp.inputPricePerM}  <UiText source={"in / $"}/>{mp.outputPricePerM}  <UiText source={"out)"}/> </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200"><UiText source={"Input Tokens (Prompt)"}/></label>
                        <div className="flex items-center gap-1">
                          {[1000, 10000, 100000].map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setCalcInputTokens(v)}
                              className="px-1.5 py-0.5 rounded-md text-[9px] font-mono bg-black/5 dark:bg-white/10 text-muted hover:bg-black/10 cursor-pointer"
                            >
                              {v >= 1000 ? `${v / 1000}k` : v}
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="number"
                        value={calcInputTokens}
                        onChange={(e) => setCalcInputTokens(parseInt(e.target.value) || 0)}
                        className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-[var(--accent-color)]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200"><UiText source={"Output Tokens (Reply)"}/></label>
                        <div className="flex items-center gap-1">
                          {[500, 2000, 8000].map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setCalcOutputTokens(v)}
                              className="px-1.5 py-0.5 rounded-md text-[9px] font-mono bg-black/5 dark:bg-white/10 text-muted hover:bg-black/10 cursor-pointer"
                            >
                              {v >= 1000 ? `${v / 1000}k` : v}
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="number"
                        value={calcOutputTokens}
                        onChange={(e) => setCalcOutputTokens(parseInt(e.target.value) || 0)}
                        className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-[var(--accent-color)]"
                      />
                    </div>
                  </div>

                  {/* Total Calculated Call Cost Output */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 font-mono">
                    <div className="space-y-0.5 font-sans">
                      <div className="text-xs font-semibold text-neutral-900 dark:text-white"><UiText source={"Estimated Request Cost:"}/></div>
                      <div className="text-[10px] text-muted font-mono">
                        ({calcInputTokens.toLocaleString()}  <UiText source={"in × $"}/>{selectedCalcModel.inputPricePerM}/M) + ({calcOutputTokens.toLocaleString()}  <UiText source={"out × $"}/>{selectedCalcModel.outputPricePerM}/M)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        ${calculatedCostUsd.toFixed(6)}  <UiText source={"USD"}/> </div>
                      <div className="text-[11px] text-muted">
                        ≈ {(Math.round(calculatedCostUsd * 95000)).toLocaleString('fa-IR')}  <UiText source={"Toman"}/> </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PROMPT SYSTEMS TAB */}
            {activeTab === 'Prompt Systems' && (
              <div className="space-y-6">
                <AdvancedPreferences section="prompt" />
                {/* Global System Prompt Directive */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
                      <span><UiText source={"Global System Prompt Directive"}/></span>
                    </label>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {settings.globalSystemPrompt.length}  <UiText source={"chars"}/> </span>
                  </div>

                  {/* System Prompt Presets */}
                  <div className="flex flex-wrap items-center gap-1.5 pb-1">
                    <span className="text-[10px] text-muted mr-1 font-medium"><UiText source={"Quick Presets:"}/></span>
                    {[
                      {
                        label: 'Senior Architect',
                        prompt:
                          'You are a senior principal software architect. Provide direct, production-grade solutions, robust error handling, best practices, and clean architecture without unnecessary fluff.',
                      },
                      {
                        label: 'Concise Expert',
                        prompt:
                          'You are a direct, concise expert assistant. Answer accurately with high information density, clear bullet points, and minimal introductory filler.',
                      },
                      {
                        label: 'Creative Writer',
                        prompt:
                          'You are a creative writer and master copywriter. Craft engaging, vivid, elegant prose with rich vocabulary and compelling storytelling.',
                      },
                      {
                        label: 'Socratic Mentor',
                        prompt:
                          'You are a patient Socratic mentor. Guide the user through concepts step-by-step with intuitive analogies, thought-provoking questions, and practical examples.',
                      },
                      {
                        label: 'Bilingual Tech Translator',
                        prompt:
                          'You are a technical localization expert fluent in Persian (Farsi) and English. Provide fluent, natural, idiomatically accurate translations with proper technical terminology.',
                      },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => updateSettings({ globalSystemPrompt: preset.prompt })}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-black/5 dark:bg-white/5 hover:border-[var(--accent-color)] hover:text-neutral-900 dark:hover:text-white border border-black/10 dark:border-white/10 transition-colors cursor-pointer"
                      >
                        {<UiText source={preset.label}/>}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={4}
                    value={settings.globalSystemPrompt}
                    onChange={(e) => updateSettings({ globalSystemPrompt: e.target.value })}
                    placeholder={$t("Standing global instructions prepended across all models, chats, and tool modes...")}
                    className="w-full bg-black/[0.03] dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-xl p-3 font-mono text-[11px] text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[var(--accent-color)] resize-none leading-relaxed"
                  />
                </div>

                {/* ChatGPT-style Custom User Instructions */}
                <div className="space-y-3.5 pt-3 border-t border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-semibold text-xs text-neutral-900 dark:text-white">
                       <UiText source={"Custom User Instructions (Personalization)"}/> </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-muted block font-medium">
                         <UiText source={"What should models know about you to provide better answers?"}/> </label>
                      <textarea
                        rows={3}
                        value={settings.userProfileBio || ''}
                        onChange={(e) => updateSettings({ userProfileBio: e.target.value })}
                        placeholder={$t("e.g. Senior TypeScript engineer based in Tehran, building AI web apps...")}
                        className="w-full bg-black/[0.02] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[var(--accent-color)] resize-none leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] text-muted block font-medium">
                         <UiText source={"How would you like AI models to format and phrase responses?"}/> </label>
                      <textarea
                        rows={3}
                        value={settings.userResponsePreferences || ''}
                        onChange={(e) => updateSettings({ userResponsePreferences: e.target.value })}
                        placeholder={$t("e.g. Direct, professional tone, omit polite conversational filler, provide runnable code snippets...")}
                        className="w-full bg-black/[0.02] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[var(--accent-color)] resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* Sampling Sliders & Parameters */}
                <div className="space-y-4 pt-3 border-t border-black/10 dark:border-white/10">
                  <div className="font-semibold text-xs text-neutral-900 dark:text-white">
                     <UiText source={"Inference Hyperparameters"}/> </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Temperature */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold"><UiText source={"Temperature"}/></label>
                        <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--accent-color)' }}>
                          {settings.defaultTemperature} (
                          {settings.defaultTemperature < 0.3
                            ? <UiText source={"Deterministic"}/>
                            : settings.defaultTemperature <= 0.8
                            ? <UiText source={"Balanced"}/>
                            : <UiText source={"Creative"}/>}
                          )
                        </span>
                      </div>
                      <input
                        type="range"
                        step="0.05"
                        min="0"
                        max="2"
                        value={settings.defaultTemperature}
                        onChange={(e) => updateSettings({ defaultTemperature: parseFloat(e.target.value) })}
                        style={{ accentColor: 'var(--accent-color)' }}
                        className="w-full cursor-pointer"
                      />
                      <p className="text-[9px] text-muted"><UiText source={"Controls randomness: 0 for code/math, 1+ for creative tasks."}/></p>
                    </div>

                    {/* Max Output Tokens with Presets */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold"><UiText source={"Max Output Tokens"}/></label>
                        <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--accent-color)' }}>
                          {settings.defaultMaxTokens.toLocaleString()}
                        </span>
                      </div>
                      <input
                        type="range"
                        step="512"
                        min="512"
                        max="32768"
                        value={settings.defaultMaxTokens}
                        onChange={(e) => updateSettings({ defaultMaxTokens: parseInt(e.target.value) })}
                        style={{ accentColor: 'var(--accent-color)' }}
                        className="w-full cursor-pointer"
                      />
                      <div className="flex items-center gap-1 pt-0.5">
                        {[2048, 4096, 8192, 16384].map((tok) => (
                          <button
                            key={tok}
                            type="button"
                            onClick={() => updateSettings({ defaultMaxTokens: tok })}
                            style={settings.defaultMaxTokens === tok ? {
                              backgroundColor: 'var(--accent-color)',
                              color: 'var(--accent-contrast)',
                            } : undefined}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-colors ${
                              settings.defaultMaxTokens === tok
                                ? 'text-white font-bold shadow-2xs'
                                : 'bg-black/5 dark:bg-white/5 text-muted hover:bg-black/10'
                            }`}
                          >
                            {(tok / 1024).toFixed(0)}<UiText source={"k"}/> </button>
                        ))}
                      </div>
                    </div>

                    {/* Top-P */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold"><UiText source={"Top-P Nucleus"}/></label>
                        <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--accent-color)' }}>
                          {settings.defaultTopP}
                        </span>
                      </div>
                      <input
                        type="range"
                        step="0.05"
                        min="0.05"
                        max="1"
                        value={settings.defaultTopP}
                        onChange={(e) => updateSettings({ defaultTopP: parseFloat(e.target.value) })}
                        style={{ accentColor: 'var(--accent-color)' }}
                        className="w-full cursor-pointer"
                      />
                      <p className="text-[9px] text-muted"><UiText source={"Tokens comprising top p cumulative probability mass."}/></p>
                    </div>

                    {/* Frequency Penalty */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold"><UiText source={"Frequency Penalty"}/></label>
                        <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--accent-color)' }}>
                          {settings.frequencyPenalty ?? 0}
                        </span>
                      </div>
                      <input
                        type="range"
                        step="0.1"
                        min="-2"
                        max="2"
                        value={settings.frequencyPenalty ?? 0}
                        onChange={(e) => updateSettings({ frequencyPenalty: parseFloat(e.target.value) })}
                        style={{ accentColor: 'var(--accent-color)' }}
                        className="w-full cursor-pointer"
                      />
                      <p className="text-[9px] text-muted"><UiText source={"Penalizes repeated words based on frequency in text."}/></p>
                    </div>

                    {/* Presence Penalty */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold"><UiText source={"Presence Penalty"}/></label>
                        <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--accent-color)' }}>
                          {settings.presencePenalty ?? 0}
                        </span>
                      </div>
                      <input
                        type="range"
                        step="0.1"
                        min="-2"
                        max="2"
                        value={settings.presencePenalty ?? 0}
                        onChange={(e) => updateSettings({ presencePenalty: parseFloat(e.target.value) })}
                        style={{ accentColor: 'var(--accent-color)' }}
                        className="w-full cursor-pointer"
                      />
                      <p className="text-[9px] text-muted"><UiText source={"Encourages introducing novel subjects and vocabulary."}/></p>
                    </div>

                    {/* Default Reasoning Effort */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold block"><UiText source={"Default Reasoning Effort"}/></label>
                      <div className="flex items-center gap-1.5 pt-1">
                        {(['LOW', 'MEDIUM', 'HIGH'] as const).map((eff) => (
                          <button
                            key={eff}
                            type="button"
                            onClick={() => updateSettings({ reasoningEffort: eff })}
                            style={(settings.reasoningEffort || 'MEDIUM') === eff ? {
                              backgroundColor: 'var(--accent-color)',
                              color: 'var(--accent-contrast)',
                            } : undefined}
                            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold uppercase transition-all ${
                              (settings.reasoningEffort || 'MEDIUM') === eff
                                ? 'text-white shadow-xs font-bold'
                                : 'bg-black/5 dark:bg-white/5 text-muted hover:bg-black/10'
                            }`}
                          >
                            {eff.toLowerCase()}
                          </button>
                        ))}
                      </div>
                      <p className="text-[9px] text-muted"><UiText source={"Applies to o1/o3-mini & Claude 3.7 Sonnet thinking budgets."}/></p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GENERAL & UI DISPLAY TAB */}
            {activeTab === 'General' && (
              <div className="space-y-5">
                <CookieSettingsButton className="w-full rounded-2xl border border-black/10 dark:border-white/10 p-3 text-start text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer" />
                <AdvancedPreferences section="general" />
                {/* Visual Appearance & Layout */}
                <div className="space-y-3">
                  <div className="font-semibold text-xs text-neutral-900 dark:text-white">
                     <UiText source={"UI Appearance & Typography Scale"}/> </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Message Bubble Style */}
                    <div className="p-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 space-y-2">
                      <label className="text-xs font-semibold block text-neutral-900 dark:text-white">
                         <UiText source={"Message Bubble Style"}/> </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'CARD', label: 'Modern Card' },
                          { id: 'GLASS', label: 'Glassmorphic' },
                          { id: 'MODERN', label: 'Rounded Chat' },
                          { id: 'MINIMAL', label: 'Minimalist' },
                        ].map((style) => (
                          <button
                            key={style.id}
                            type="button"
                            onClick={() => updateSettings({ bubbleStyle: style.id as any })}
                            style={(settings.bubbleStyle || 'card') === style.id ? {
                              backgroundColor: 'var(--accent-color)',
                              borderColor: 'var(--accent-color)',
                              color: 'var(--accent-contrast)',
                            } : undefined}
                            className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                              (settings.bubbleStyle || 'card') === style.id
                                ? 'text-white shadow-2xs font-semibold'
                                : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-muted'
                            }`}
                          >
                            {<UiText source={style.label}/>}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font Size Scale */}
                    <div className="p-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 space-y-2">
                      <label className="text-xs font-semibold block text-neutral-900 dark:text-white">
                         <UiText source={"Chat Text Size Scale"}/> </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'SMALL', label: 'Compact (13px)' },
                          { id: 'DEFAULT', label: 'Default (14px)' },
                          { id: 'LARGE', label: 'Large (16px)' },
                        ].map((sz) => (
                          <button
                            key={sz.id}
                            type="button"
                            onClick={() => updateSettings({ fontSizeLevel: sz.id as any })}
                            style={(settings.fontSizeLevel || 'md') === sz.id ? {
                              backgroundColor: 'var(--accent-color)',
                              borderColor: 'var(--accent-color)',
                              color: 'var(--accent-contrast)',
                            } : undefined}
                            className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                              (settings.fontSizeLevel || 'md') === sz.id
                                ? 'text-white shadow-2xs font-semibold'
                                : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-muted'
                            }`}
                          >
                            {<UiText source={sz.label}/>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Toggles List */}
                <div className="space-y-3 pt-2 border-t border-black/10 dark:border-white/10">
                  <ToggleRow
                    label={$t("Smooth Streaming & Token Delivery")}
                    desc="Groups rapid incoming token updates into smooth frames for easier reading."
                    checked={settings.smoothStreaming ?? true}
                    onChange={(c) => updateSettings({ smoothStreaming: c })}
                  />
                  <ToggleRow
                    label={$t("Auto-Wrap Code Blocks")}
                    desc="Wraps long code lines automatically instead of requiring horizontal scrolling."
                    checked={settings.codeBlockWrap ?? false}
                    onChange={(c) => updateSettings({ codeBlockWrap: c })}
                  />
                  <ToggleRow
                    label={$t("Play Audio Chime on Response Complete")}
                    desc="Plays a subtle ambient chime notification when the assistant finishes generating."
                    checked={settings.soundOnDone ?? false}
                    onChange={(c) => updateSettings({ soundOnDone: c })}
                  />
                  <ToggleRow
                    label={$t("Display Token Counts & Estimation")}
                    desc="Shows prompt (↑) and completion (↓) token counts on each assistant turn."
                    checked={settings.showTokenUsage}
                    onChange={(c) => updateSettings({ showTokenUsage: c })}
                  />
                  <ToggleRow
                    label={$t("Display Live Request Cost ($ USD & Toman)")}
                    desc="Computes real-time inference cost per turn in USD and Iranian Toman."
                    checked={settings.showCost}
                    onChange={(c) => updateSettings({ showCost: c })}
                  />
                  <ToggleRow
                    label={$t("Display Turn Latency (ms / s)")}
                    desc="Measures round-trip execution latency for each message."
                    checked={settings.showLatency}
                    onChange={(c) => updateSettings({ showLatency: c })}
                  />
                  <ToggleRow
                    label={$t("Display Model Header Line")}
                    desc="Displays model logo and name at the top of assistant responses."
                    checked={settings.showModelLine}
                    onChange={(c) => updateSettings({ showModelLine: c })}
                  />
                  <ToggleRow
                    label={$t("Send Message on Enter Key")}
                    desc="Pressing Enter sends the prompt immediately; Shift+Enter creates a new line."
                    checked={settings.sendOnEnter}
                    onChange={(c) => updateSettings({ sendOnEnter: c })}
                  />
                  <ToggleRow
                    label={$t("Stream Upstream Responses via SSE")}
                    desc="Streams token deltas in real-time as they are synthesized."
                    checked={settings.streamResponses}
                    onChange={(c) => updateSettings({ streamResponses: c })}
                  />
                  <ToggleRow
                    label={$t("Render Live Markdown Formatting")}
                    desc="Parses Markdown, code blocks, tables, and mathematical formulas."
                    checked={settings.renderMarkdown}
                    onChange={(c) => updateSettings({ renderMarkdown: c })}
                  />
                  <ToggleRow
                    label={$t("Auto-Speak Assistant Replies (Text-to-Speech)")}
                    desc="Uses speech synthesis to read assistant responses aloud upon arrival."
                    checked={settings.autoSpeak}
                    onChange={(c) => updateSettings({ autoSpeak: c })}
                  />
                  <ToggleRow
                    label={$t("Reduce Motion & Animations")}
                    desc="Disables complex layout shifts and particle transitions for smoother performance."
                    checked={settings.reduceMotion}
                    onChange={(c) => updateSettings({ reduceMotion: c })}
                  />
                </div>
              </div>
            )}

            {/* REASONING & AGENT TAB */}
            {activeTab === 'Reasoning & Agent' && (
              <div className="space-y-5">
                <AdvancedPreferences section="agent" />
                <div
                  className="p-3.5 rounded-2xl border space-y-2"
                  style={{
                    borderColor: 'rgba(var(--accent-rgb), 0.25)',
                    backgroundColor: 'rgba(var(--accent-rgb), 0.08)',
                  }}
                >
                  <div className="font-semibold text-xs flex items-center gap-1.5" style={{ color: 'var(--accent-color)' }}>
                    <Brain className="w-4 h-4" />
                    <span><UiText source={"Reasoning Models, Thinking Effort & Autonomous Agent"}/></span>
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed">
                     <UiText source={"Fine-tune internal Chain-of-Thought deliberation budgets, tool calling permissions, search depth, and persistent memory."}/> </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Web Search Depth */}
                  <div className="p-3.5 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 space-y-2">
                    <label className="text-xs font-semibold block text-neutral-900 dark:text-white">
                       <UiText source={"Web Search Engine Depth"}/> </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'QUICK', label: 'Quick Search' },
                        { id: 'DEEP', label: 'Deep Synthesis (Multi-query)' },
                      ].map((dp) => (
                        <button
                          key={dp.id}
                          type="button"
                          onClick={() => updateSettings({ searchDepth: dp.id as any })}
                          style={(settings.searchDepth || 'quick') === dp.id ? {
                            backgroundColor: 'var(--accent-color)',
                            borderColor: 'var(--accent-color)',
                            color: 'var(--accent-contrast)',
                          } : undefined}
                          className={`py-2 px-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                            (settings.searchDepth || 'quick') === dp.id
                              ? 'text-white shadow-2xs font-semibold'
                              : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-muted'
                          }`}
                        >
                          {<UiText source={dp.label}/>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Agent Max Steps Slider */}
                  <div className="p-3.5 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-neutral-900 dark:text-white">
                         <UiText source={"Autonomous Agent Max Steps"}/> </label>
                      <span className="font-mono font-bold text-xs" style={{ color: 'var(--accent-color)' }}>
                        {settings.agentMaxSteps || 5}  <UiText source={"steps"}/> </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={settings.agentMaxSteps || 5}
                      onChange={(e) => updateSettings({ agentMaxSteps: parseInt(e.target.value) })}
                      style={{ accentColor: 'var(--accent-color)' }}
                      className="w-full cursor-pointer"
                    />
                    <p className="text-[10px] text-muted">
                       <UiText source={"Safety cap on multi-step tool execution loops per turn."}/> </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-black/10 dark:border-white/10">
                  <ToggleRow
                    label={$t("Extended Thinking / Reasoning Mode")}
                    desc="Explicitly prompts reasoning models to output full Chain-of-Thought thinking blocks."
                    checked={settings.thinkingMode}
                    onChange={(c) => updateSettings({ thinkingMode: c })}
                  />
                  <ToggleRow
                    label={$t("Auto-Expand Thinking Blocks by Default")}
                    desc="Automatically reveals thinking process collapsible blocks upon completion."
                    checked={settings.expandThinking}
                    onChange={(c) => updateSettings({ expandThinking: c })}
                  />
                  <ToggleRow
                    label={$t("Autonomous Tool Calling Agent Mode")}
                    desc="Permits models to autonomously invoke live web search, Python/JS sandbox, slide deck builder, and file parsers."
                    checked={settings.agentMode}
                    onChange={(c) => updateSettings({ agentMode: c })}
                  />
                  <ToggleRow
                    label={$t("Cross-Turn Context Memory Recall")}
                    desc="Automatically retrieves relevant memories and facts from previous conversations using local vector embeddings."
                    checked={settings.memoryEnabled}
                    onChange={(c) => updateSettings({ memoryEnabled: c })}
                  />
                </div>

                {/* Live Memory Viewer & Manager */}
                <div className="p-3.5 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-neutral-900 dark:text-white">
                      <Database className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
                      <span><UiText source={"Persistent Stored Memories ("}/>{memories.length})</span>
                    </div>
                    <span className="text-[10px] text-muted"><UiText source={"Locally encrypted"}/></span>
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {memories.length === 0 ? (
                      <div className="text-center py-6 text-xs text-muted">
                         <UiText source={"No persistent memories recorded yet. Turn on memory recall to allow AI to remember personal preferences across chats."}/> </div>
                    ) : (
                      memories.map((mem) => (
                        <div
                          key={mem.id}
                          className="p-2 rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 flex items-center justify-between gap-2 text-xs"
                        >
                          <span className="text-neutral-800 dark:text-neutral-200 truncate">{mem.content}</span>
                          <button
                            type="button"
                            onClick={() => removeMemory(mem.id)}
                            className="p-1 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors shrink-0 cursor-pointer"
                            title={$t("Delete memory")}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* DIAGNOSTICS TAB */}
            {activeTab === 'Diagnostics' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-black/10 dark:border-white/10">
                  <div>
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Terminal className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
                      <span><UiText source={"Runtime Execution Logs ("}/>{filteredLogs.length}  <UiText source={"of"}/> {logs.length})</span>
                    </h3>
                    <p className="text-[11px] text-muted">
                       <UiText source={"Real-time telemetry of model dispatches, SSE streams, web search, connection tests, and errors."}/> </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        addLog(
                          'INFO',
                          'MANUAL_PING',
                          `Diagnostics ping triggered from settings console (${new Date().toLocaleTimeString()})`,
                          'Status: Operational'
                        );
                      }}
                      style={{
                        backgroundColor: 'rgba(var(--accent-rgb), 0.12)',
                        borderColor: 'rgba(var(--accent-rgb), 0.25)',
                        color: 'var(--accent-color)',
                      }}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 border"
                    >
                      <Activity className="w-3 h-3" />
                      <span><UiText source={"Ping Test Log"}/></span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const text = logs
                          .map(
                            (l) =>
                              `[${new Date(l.timestamp).toISOString()}] [${l.level}] [${l.tag}] ${l.message}${
                                l.detail ? ` (${l.detail})` : ''
                              }`
                          )
                          .join('\n');
                        navigator.clipboard.writeText(text);
                        setCopiedLogs(true);
                        setTimeout(() => setCopiedLogs(false), 2000);
                      }}
                      disabled={logs.length === 0}
                      className="px-2.5 py-1 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {copiedLogs ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLogs ? <UiText source={"Copied!"}/> : <UiText source={"Copy Logs"}/>}</span>
                    </button>

                    <button
                      type="button"
                      onClick={clearLogs}
                      disabled={logs.length === 0}
                      className="px-2.5 py-1 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-[11px] font-medium disabled:opacity-30 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span><UiText source={"Clear"}/></span>
                    </button>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map((lvl) => {
                      const count = lvl === 'ALL' ? logs.length : logs.filter((l) => l.level === lvl).length;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setLogFilter(lvl)}
                          style={logFilter === lvl ? {
                            backgroundColor: 'var(--accent-color)',
                            color: 'var(--accent-contrast)',
                          } : undefined}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                            logFilter === lvl
                              ? 'text-white shadow-xs font-semibold'
                              : 'bg-black/5 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-black/10 dark:hover:bg-white/10'
                          }`}
                        >
                          {lvl} ({count})
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder={$t("Filter by keyword or tag...")}
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[var(--accent-color)]"
                    />
                  </div>
                </div>

                {/* Log Stream Terminal Window */}
                <div className="p-3.5 rounded-2xl bg-neutral-100/90 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-zinc-300 font-mono text-[11px] h-72 max-h-[360px] overflow-y-auto space-y-1.5 shadow-inner scrollbar-thin">
                  {filteredLogs.length === 0 ? (
                    <div className="text-center py-16 text-neutral-400 dark:text-neutral-500">
                      <Terminal className="w-8 h-8 mx-auto opacity-40 mb-2" />
                      <div><UiText source={"No runtime logs found matching your filter."}/></div>
                    </div>
                  ) : (
                    filteredLogs.map((l) => {
                      const levelColor =
                        l.level === 'ERROR'
                          ? 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/25'
                          : l.level === 'WARN'
                          ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25'
                          : 'text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/25';

                      return (
                        <div key={l.id} className="flex items-start gap-2 leading-relaxed hover:bg-black/5 dark:hover:bg-white/[0.03] p-1 rounded-lg transition-colors">
                          <span className="text-neutral-400 dark:text-neutral-500 text-[10px] shrink-0 select-none">
                            {new Date(l.timestamp).toLocaleTimeString()}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold shrink-0 ${levelColor}`}>
                            {l.level}
                          </span>
                          <span className="font-semibold shrink-0" style={{ color: 'var(--accent-color)' }}>
                            [{l.tag}]
                          </span>
                          <span className="flex-1 break-all text-neutral-800 dark:text-neutral-200">
                            {l.message}
                            {l.detail && (
                              <span className="text-neutral-500 dark:text-neutral-400 text-[10px] block mt-0.5 font-sans opacity-90">
                                ↳ {l.detail}
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Font Upload & Link Modal */}
      {isCustomFontModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCustomFontModalOpen(false);
          }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            className="w-full max-w-lg rounded-3xl border shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150"
            style={{
              backgroundColor: 'var(--surface-color)',
              borderColor: 'var(--border-color)',
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl border flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                    borderColor: 'rgba(var(--accent-rgb), 0.3)',
                    color: 'var(--accent-color)',
                  }}
                >
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                     <UiText source={"Upload Custom Font"}/> </h3>
                  {fontUploadError && <p role="alert" className="text-xs text-red-500 mt-2">{fontUploadError}</p>}
                  <p className="text-[11px] text-muted mt-0.5">
                     <UiText source={"Upload a font file from your device or import via web font URL"}/> </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomFontModalOpen(false)}
                className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Content */}
            <div className="space-y-3.5">
              {/* File Upload Trigger */}
              <div
                onClick={() => fontFileInputRef.current?.click()}
                className="p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-all hover:bg-black/[0.03] dark:hover:bg-white/5 border-black/15 dark:border-white/15"
              >
                <Type className="w-6 h-6 opacity-80" style={{ color: 'var(--accent-color)' }} />
                <div>
                  <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200 block">
                     <UiText source={"Choose font file from your computer"}/> </span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block mt-0.5">
                     <UiText source={"Supported formats: .ttf, .woff2, .woff, .otf"}/> </span>
                </div>
                <input
                  type="file"
                  ref={fontFileInputRef}
                  accept=".ttf,.woff2,.woff,.otf"
                  onChange={(e) => {
                    handleFontFileUpload(e);
                    setIsCustomFontModalOpen(false);
                  }}
                  className="hidden"
                />
              </div>

              {/* Google Fonts / Web Link Option */}
              <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-2.5">
                <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                   <UiText source={"Or enter web font stylesheet specifications (Google Fonts / Web URL):"}/> </div>
                <input
                  type="text"
                  placeholder={$t("Font Name (e.g., Geist, Space Grotesk, Outfit)...")}
                  value={customFontName}
                  onChange={(e) => setCustomFontName(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-900 border border-black/15 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[var(--accent-color)]"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={$t("Font Stylesheet URL (CSS URL - optional)...")}
                    value={customFontUrl}
                    onChange={(e) => setCustomFontUrl(e.target.value)}
                    className="flex-1 bg-white dark:bg-neutral-900 border border-black/15 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[var(--accent-color)]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleAddCustomFont();
                      setIsCustomFontModalOpen(false);
                    }}
                    disabled={!customFontName.trim()}
                    style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-contrast)' }}
                    className="px-4 py-2 hover:opacity-90 disabled:opacity-40 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                     <UiText source={"Add"}/> </button>
                </div>
              </div>

              {/* List of Custom Uploaded Fonts */}
              {customFonts.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-black/10 dark:border-white/10">
                  <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                     <UiText source={"Your Custom Fonts ("}/>{customFonts.length}):
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 scrollbar-thin">
                    {customFonts.map((cf) => {
                      const isSelected = currentLangFonts.persian === cf.id || currentLangFonts.latin === cf.id;
                      return (
                        <div
                          key={cf.id}
                          onClick={() => {
                            const targetKey = selectedLanguage !== 'ALL' ? getLanguageKey(selectedLanguage) : 'persian';
                            updateSettings({
                              languageFonts: {
                                ...currentLangFonts,
                                [targetKey]: cf.id,
                              },
                              appFont: cf.id,
                            });
                          }}
                          style={isSelected ? {
                            backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                            borderColor: 'var(--accent-color)',
                            boxShadow: '0 0 0 1px rgba(var(--accent-rgb), 0.4)',
                          } : undefined}
                          className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                            isSelected
                              ? ''
                              : 'bg-black/[0.02] dark:bg-white/5 border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div
                              className="font-semibold text-xs text-neutral-900 dark:text-white truncate"
                              style={{ fontFamily: `'${cf.fontFamily}', system-ui, sans-serif` }}
                            >
                              {cf.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className="text-[9px] uppercase px-1.5 py-0.2 rounded font-mono"
                                style={{
                                  backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                                  color: 'var(--accent-color)',
                                }}
                              >
                                {cf.format?.toUpperCase() || 'CUSTOM'}
                              </span>
                              {isSelected && (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" />  <UiText source={"Active Font"}/> </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCustomFont(cf.id);
                            }}
                            title={$t("Delete font")}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-black/10 dark:border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCustomFontModalOpen(false)}
                className="px-4 py-1.5 rounded-xl border border-black/15 dark:border-white/15 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              >
                 <UiText source={"Close"}/> </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (c: boolean) => void;
}) {
  const $t=useT();
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/5">
      <div className="space-y-0.5">
        <div className="font-semibold text-xs text-neutral-900 dark:text-white">{label}</div>
        <div className="text-[11px] opacity-60 text-neutral-600 dark:text-neutral-400">{desc}</div>
      </div>
      <ToggleSwitch label={$t(label)} checked={checked} onChange={onChange} />
    </div>
  );
}
