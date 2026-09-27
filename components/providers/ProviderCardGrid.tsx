'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { VISIBLE_PROVIDERS } from '@/lib/providers/catalog';
import { ProviderSpec } from '@/lib/types';
import { ProviderLogo } from '@/components/ui/ProviderLogo';
import {
  Key,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Zap,
  Cpu,
  Search,
  Settings2,
  Trash2,
  Check,
  Server,
  Layers,
} from 'lucide-react';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

interface ProviderCardGridProps {
  onOpenConfig?: (providerId: string) => void;
  onAddNewCustom?: () => void;
}

export function ProviderCardGrid({ onOpenConfig, onAddNewCustom }: ProviderCardGridProps) {
  const $t=useT();
  const {
    accounts,
    customProviders,
    models,
    setProviderConfigModalOpen,
    deleteCustomProvider,
    testAccount,
  } = useAppStore();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'MAJOR' | 'FAST' | 'LOCAL' | 'CUSTOM'>('ALL');
  const [testingId, setTestingId] = useState<string | null>(null);

  const allProviders: ProviderSpec[] = [...VISIBLE_PROVIDERS, ...customProviders];

  const handleCardClick = (pId: string) => {
    if (onOpenConfig) {
      onOpenConfig(pId);
    } else {
      setProviderConfigModalOpen(true, pId);
    }
  };

  const handleQuickTest = async (e: React.MouseEvent, pId: string) => {
    e.stopPropagation();
    const acc = accounts.find((a) => a.providerId === pId && a.enabled) || accounts.find((a) => a.providerId === pId);
    if (!acc) return;
    setTestingId(pId);
    await testAccount(acc.id);
    setTestingId(null);
  };

  const filteredProviders = allProviders.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (filterCategory === 'MAJOR') {
      return ['openai', 'gemini', 'anthropic', 'deepseek', 'xai'].includes(p.id);
    }
    if (filterCategory === 'FAST') {
      return ['groq', 'cerebras', 'fireworks'].includes(p.id);
    }
    if (filterCategory === 'LOCAL') {
      return ['ollama', 'lmstudio', 'huggingface', 'cloudflare'].includes(p.id);
    }
    if (filterCategory === 'CUSTOM') {
      return !!p.isCustom;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            placeholder={$t("Search provider by name, ID or feature...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-neutral-900/90 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)]/20 shadow-xs"
          />
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/10 dark:border-white/10 text-[11px] overflow-x-auto scrollbar-none">
          {([
            { id: 'ALL', label: `All (${allProviders.length})` },
            { id: 'MAJOR', label: 'Major AI' },
            { id: 'FAST', label: 'Fast & LPU' },
            { id: 'LOCAL', label: 'Local / Edge' },
            { id: 'CUSTOM', label: `Custom (${customProviders.length})` },
          ] as const).map((cat) => {
            const isActive = filterCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                style={isActive ? { backgroundColor: 'var(--accent-color)', color: '#ffffff' } : undefined}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'font-medium shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {<UiText source={cat.label}/>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Provider Cards (Always 2 columns on sm and up, fully responsive) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* + Add Provider Card */}
        <button
          onClick={() => {
            if (onAddNewCustom) onAddNewCustom();
            else setProviderConfigModalOpen(true, 'new_custom');
          }}
          style={{
            borderColor: 'rgba(var(--accent-rgb), 0.35)',
            backgroundColor: 'rgba(var(--accent-rgb), 0.03)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-color)';
            e.currentTarget.style.backgroundColor = 'rgba(var(--accent-rgb), 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb), 0.35)';
            e.currentTarget.style.backgroundColor = 'rgba(var(--accent-rgb), 0.03)';
          }}
          className="group p-4 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center gap-2.5 min-h-[145px] cursor-pointer"
        >
          <div
            style={{
              backgroundColor: 'rgba(var(--accent-rgb), 0.12)',
              borderColor: 'rgba(var(--accent-rgb), 0.25)',
              color: 'var(--accent-color)',
            }}
            className="w-10 h-10 rounded-2xl border flex items-center justify-center group-hover:scale-110 transition-all shadow-xs"
          >
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-xs text-neutral-900 dark:text-white"><UiText source={"+ Add Provider"}/></div>
            <div className="text-[10px] text-muted mt-0.5 max-w-[200px]"><UiText source={"Connect any OpenAI / Anthropic / Ollama compatible endpoint"}/></div>
          </div>
        </button>

        {filteredProviders.map((provider) => {
          const providerAccounts = accounts.filter((a) => a.providerId === provider.id);
          const providerModels = models.filter((m) => m.providerId === provider.id);
          const isConfigured = providerAccounts.length > 0;
          const isConnected = isConfigured && providerAccounts.some((a) => a.status === 'CONNECTED');
          const hasError = isConfigured && providerAccounts.some((a) => a.status === 'NETWORK_FAILURE' || a.status === 'INVALID_KEY');

          return (
            <div
              key={provider.id}
              onClick={() => handleCardClick(provider.id)}
              className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 text-left ${
                isConnected
                  ? 'bg-emerald-500/[0.05] dark:bg-white/[0.07] border-emerald-500/40 hover:border-emerald-500/70 shadow-xs'
                  : isConfigured
                  ? 'bg-amber-500/[0.05] dark:bg-white/[0.04] border-amber-500/40 hover:border-amber-500/70'
                  : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/25 hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
              }`}
            >
              {/* Top Row: Provider Identity & Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 group-hover:border-black/20 dark:group-hover:border-white/20 transition-all overflow-hidden">
                    <ProviderLogo providerId={provider.id} customIconUrl={provider.iconUrl} size="md" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-xs flex items-center gap-1.5 flex-wrap">
                      <span className="text-neutral-900 dark:text-white whitespace-nowrap">{provider.name}</span>
                      {provider.isCustom && (
                        <span
                          style={{
                            backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                            color: 'var(--accent-color)',
                            borderColor: 'rgba(var(--accent-rgb), 0.3)',
                          }}
                          className="px-1.5 py-0.2 rounded-sm text-[8px] font-mono border"
                        >
                           <UiText source={"Custom"}/> </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted font-mono uppercase mt-0.5">{provider.apiFormat}</div>
                  </div>
                </div>

                {/* Status indicator badge */}
                <div className="shrink-0">
                  {isConnected ? (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/25 whitespace-nowrap">
                      <CheckCircle2 className="w-3 h-3" />
                      <span><UiText source={"Active"}/></span>
                    </span>
                  ) : hasError ? (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-rose-700 dark:text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/25 whitespace-nowrap">
                      <AlertCircle className="w-3 h-3" />
                      <span><UiText source={"Error"}/></span>
                    </span>
                  ) : isConfigured ? (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/25 whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      <span><UiText source={"Ready"}/></span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full whitespace-nowrap border border-black/5 dark:border-transparent">
                       <UiText source={"No Keys"}/> </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">
                {provider.description || `${provider.name} API endpoint with native models`}
              </p>

              {/* Bottom Row: Stats & Actions */}
              <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-2 text-[10px]">
                <div className="flex items-center gap-1.5 text-muted">
                  <span className="font-mono">
                    {providerAccounts.length} {providerAccounts.length === 1 ? <UiText source={"key"}/> : <UiText source={"keys"}/>}
                  </span>
                  <span>•</span>
                  <span className="font-mono">
                    {providerModels.length} {providerModels.length === 1 ? <UiText source={"model"}/> : <UiText source={"models"}/>}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {isConfigured && (
                    <button
                      onClick={(e) => handleQuickTest(e, provider.id)}
                      disabled={testingId === provider.id}
                      title={$t("Quick Ping Test")}
                      className="p-1 rounded-md bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/15 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-all cursor-pointer"
                    >
                      <Zap className={`w-3 h-3 ${testingId === provider.id ? 'animate-spin text-amber-500' : ''}`} />
                    </button>
                  )}
                  {provider.isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCustomProvider(provider.id);
                      }}
                      title={$t("Delete Custom Provider")}
                      className="p-1 rounded-md bg-black/5 dark:bg-white/5 hover:bg-rose-500/20 text-muted hover:text-rose-600 dark:hover:text-rose-300 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  <span className="px-2.5 py-1 rounded-lg border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/10 group-hover:bg-black/10 dark:group-hover:bg-white/20 text-neutral-900 dark:text-white font-medium transition-all flex items-center gap-1 text-[11px]">
                    <Settings2 className="w-3 h-3" />
                    <span><UiText source={"Setup"}/></span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
