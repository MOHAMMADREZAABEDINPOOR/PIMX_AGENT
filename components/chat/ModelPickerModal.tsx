'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  X,
  Search,
  Check,
  Eye,
  EyeOff,
  Brain,
  Wrench,
  Layers,
  Sparkles,
  Zap,
  Plus,
  Settings2,
  AlertCircle,
} from 'lucide-react';
import { VISIBLE_PROVIDERS } from '@/lib/providers/catalog';
import { ProviderLogo } from '@/components/ui/ProviderLogo';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export function ModelPickerModal() {
  const $t=useT();
  const {
    modelPickerOpen,
    setModelPickerOpen,
    models,
    accounts,
    customProviders,
    selectedModelIds,
    setSelectedModelIds,
    toggleSelectedModel,
    activeChatId,
    updateChat,
    setSettingsOpen,
    setProviderConfigModalOpen,
    testModel,
    clearAllModelsForProvider,
  } = useAppStore();

  const [search, setSearch] = useState('');
  const [filterCapability, setFilterCapability] = useState<'ALL' | 'VISION' | 'REASONING' | 'TOOLS' | 'FREE'>('ALL');
  const [selectedProvider, setSelectedProvider] = useState<string>('ALL');
  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  // Session-only live test results: only display test status if tested within this modal session, and cleared on close
  const [localLiveTestResults, setLocalLiveTestResults] = useState<Record<string, { status: 'OK' | 'FAILED'; latencyMs?: number; detail: string }>>({});

  if (!modelPickerOpen) return null;

  const configuredProviderIds = new Set(accounts.map((a) => a.providerId));
  const allProviders = [...VISIBLE_PROVIDERS, ...customProviders];
  const configuredProviders = allProviders.filter(
    (p) => configuredProviderIds.has(p.id) || (p.isCustom && customProviders.some((cp) => cp.id === p.id))
  );

  // STRICT: Only models with an active provider key or valid custom provider are shown
  const activeModels = models.filter((m) => {
    if (configuredProviderIds.has(m.providerId)) return true;
    if (m.isCustom && customProviders.some((cp) => cp.id === m.providerId)) return true;
    return false;
  });

  const filteredModels = activeModels.filter((m) => {
    if (!m.visible && !search) return false;
    if (selectedProvider !== 'ALL' && m.providerId !== selectedProvider) return false;
    if (filterCapability === 'VISION' && !m.visionCapable) return false;
    if (filterCapability === 'REASONING' && !m.reasoningCapable) return false;
    if (filterCapability === 'TOOLS' && !m.toolsCapable) return false;
    if (filterCapability === 'FREE' && !m.isFree) return false;

    if (search) {
      const q = search.toLowerCase();
      return (
        m.displayName.toLowerCase().includes(q) ||
        m.displayId.toLowerCase().includes(q) ||
        m.providerId.toLowerCase().includes(q) ||
        m.upstreamId.toLowerCase().includes(q)
      );
    }
    return true;
  }).sort((a, b) => (b.visible ? 1 : 0) - (a.visible ? 1 : 0));

  const handleCloseModal = () => {
    setLocalLiveTestResults({});
    setModelPickerOpen(false);
  };

  const handleSelectSingle = (id: string) => {
    setSelectedModelIds([id]);
    if (activeChatId) {
      updateChat(activeChatId, { modelIds: [id] });
    }
    handleCloseModal();
  };

  const handleToggleMulti = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSelectedModel(id);
    if (activeChatId) {
      const exists = selectedModelIds.includes(id);
      const next = exists ? selectedModelIds.filter((m) => m !== id) : [...selectedModelIds, id];
      updateChat(activeChatId, { modelIds: next.length > 0 ? next : [id] });
    }
  };

  const handleTestModel = async (e: React.MouseEvent, modelId: string) => {
    e.stopPropagation();
    setTestingModelId(modelId);
    const res = await testModel(modelId);
    if (res) {
      setLocalLiveTestResults((prev) => ({
        ...prev,
        [modelId]: {
          status: res.ok ? 'OK' : 'FAILED',
          latencyMs: res.latencyMs,
          detail: res.ok ? `Ping: ${res.latencyMs || 0}ms ("OK")` : (res.error || 'Test failed'),
        },
      }));
    }
    setTestingModelId(null);
  };

  return (
    <div
      id="model-picker-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
    >
      <div
        className="w-full max-w-3xl max-h-[85vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        style={{
          backgroundColor: 'var(--surface-color)',
          borderColor: 'var(--border-color)',
        }}
      >
        {/* Modal Header */}
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
          <div className="space-y-0.5">
            <h3 className="font-semibold text-sm"><UiText source={"Select AI Model"}/></h3>
            <p className="text-xs text-muted">
               <UiText source={"Choose the primary model for your conversation. (To compare models side-by-side, use the 'Compare Models' tool in Tools)."}/> </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setModelPickerOpen(false);
                setSettingsOpen(true, 'Providers & Models');
              }}
              className="px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <Settings2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-300" />
              <span><UiText source={"Manage Providers"}/></span>
            </button>
            <button
              onClick={handleCloseModal}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="p-3 border-b space-y-2.5" style={{ borderColor: 'var(--border-color)' }}>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-color)' }}
          >
            <Search className="w-3.5 h-3.5 opacity-50" />
            <input
              type="text"
              placeholder={$t("Search by model name or provider (GPT-4o, Claude 3.7, Gemini 2.5, DeepSeek R1, Llama 3.3)...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent w-full focus:outline-none placeholder:text-muted text-neutral-900 dark:text-neutral-100"
            />
          </div>

          {/* Capability Filters */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <FilterChip label={$t("All Models")} active={filterCapability === 'ALL'} onClick={() => setFilterCapability('ALL')} />
            <FilterChip label={$t("⚡ Free Tier")} active={filterCapability === 'FREE'} onClick={() => setFilterCapability('FREE')} />
            <FilterChip label={$t("🧠 Reasoning")} active={filterCapability === 'REASONING'} onClick={() => setFilterCapability('REASONING')} />
            <FilterChip label={$t("👁 Vision")} active={filterCapability === 'VISION'} onClick={() => setFilterCapability('VISION')} />
            <FilterChip label={$t("🛠 Tools")} active={filterCapability === 'TOOLS'} onClick={() => setFilterCapability('TOOLS')} />

            <div className="ml-auto flex items-center gap-1.5 w-48 sm:w-56">
              <CustomSelect
                value={selectedProvider}
                onChange={setSelectedProvider}
                options={[
                  {
                    value: 'ALL',
                    label:
                      configuredProviders.length > 0
                        ? `All Connected (${configuredProviders.length})`
                        : 'No Connected Providers',
                  },
                  ...configuredProviders.map((p) => ({
                    value: p.id,
                    label: p.name,
                    icon: <ProviderLogo providerId={p.isCustom ? 'custom' : p.id} size="xs" />,
                  })),
                ]}
                size="xs"
              />
            </div>
          </div>
        </div>

        {/* Models List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {activeModels.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-3">
              <Layers className="w-10 h-10 mx-auto opacity-30 text-purple-500 dark:text-purple-400" />
              <div className="space-y-1">
                <h4 className="font-semibold text-sm"><UiText source={"No Models Configured"}/></h4>
                <p className="text-xs text-muted max-w-sm mx-auto">
                   <UiText source={"No providers or API keys have been added yet. Add an API key to automatically import models."}/> </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setModelPickerOpen(false);
                    setSettingsOpen(true, 'Providers & Models');
                  }}
                  className="px-5 py-2.5 rounded-xl text-white font-medium text-xs shadow-md transition-all inline-flex items-center gap-2"
                  style={{ backgroundColor: 'var(--accent-color)' }}
                >
                  <Settings2 className="w-4 h-4" />
                  <span><UiText source={"Configure Providers & Add API Keys"}/></span>
                </button>
              </div>
            </div>
          ) : filteredModels.length === 0 ? (
            <div className="py-12 text-center text-xs opacity-50">
               <UiText source={"No models match the selected search or filter criteria."}/> </div>
          ) : (
            filteredModels.map((m) => {
              const isSelected = selectedModelIds.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => handleSelectSingle(m.id)}
                  className={`group p-3 rounded-2xl border transition-all cursor-pointer flex flex-wrap items-center justify-between gap-3 ${
                    isSelected
                      ? 'shadow-xs'
                      : 'hover:bg-black/[0.04] dark:hover:bg-white/5 border-black/5 dark:border-transparent hover:border-black/15 dark:hover:border-white/10'
                  }`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: 'rgba(var(--accent-rgb), 0.1)',
                          borderColor: 'var(--accent-color)',
                        }
                      : undefined
                  }
                >
                  <div className="min-w-0 flex-1 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center shrink-0 shadow-2xs">
                      <ProviderLogo providerId={m.providerId} modelId={m.upstreamId || m.displayName} size="md" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-neutral-900 dark:text-white">{m.displayName}</span>
                        <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">{m.displayId}</span>
                        {m.isFree && (
                          <span className="px-1.5 py-0.2 rounded-sm text-[9px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                             <UiText source={"FREE"}/> </span>
                        )}
                        {m.isCustom && (
                          <span
                            style={{
                              backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                              color: 'var(--accent-color)',
                              borderColor: 'rgba(var(--accent-rgb), 0.3)',
                            }}
                            className="px-1.5 py-0.2 rounded-sm text-[9px] font-mono border"
                          >
                             <UiText source={"Custom"}/> </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-neutral-600 dark:text-neutral-300">
                        {m.reasoningCapable && (
                          <span className="flex items-center gap-0.5 font-medium" style={{ color: 'var(--accent-color)' }}>
                            <Brain className="w-3 h-3" />  <UiText source={"Reasoning"}/> </span>
                        )}
                        {m.visionCapable && (
                          <span className="flex items-center gap-0.5 text-blue-700 dark:text-blue-300 font-medium">
                            <Eye className="w-3 h-3" />  <UiText source={"Vision"}/> </span>
                        )}
                        {m.toolsCapable && (
                          <span className="flex items-center gap-0.5 text-teal-700 dark:text-teal-300 font-medium">
                            <Wrench className="w-3 h-3" />  <UiText source={"Tools"}/> </span>
                        )}
                        <span className="opacity-70"><UiText source={"• Context:"}/> {(m.contextWindow / 1000).toFixed(0)}<UiText source={"k"}/></span>
                        {m.promptPricePerM > 0 && (
                          <span className="opacity-70">
                            • ${m.promptPricePerM}/M in, ${m.completionPricePerM}/M out
                          </span>
                        )}
                      </div>

                      {localLiveTestResults[m.id] && (
                        <div
                          className={`text-[10px] flex items-center gap-1 pt-0.5 ${
                            localLiveTestResults[m.id].status === 'OK'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {localLiveTestResults[m.id].status === 'OK' ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          <span>{localLiveTestResults[m.id].detail}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions: Live Test & Select Status */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleTestModel(e, m.id)}
                      disabled={testingModelId === m.id}
                      title={$t("Live Ping Model")}
                      className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/15 text-neutral-600 dark:text-neutral-300 transition-all text-xs cursor-pointer"
                    >
                      <Zap className={`w-3.5 h-3.5 ${testingModelId === m.id ? 'animate-spin text-amber-500' : 'text-amber-500 dark:text-amber-300'}`} />
                    </button>

                    <div
                      style={
                        isSelected
                          ? {
                              backgroundColor: 'var(--accent-color)',
                              color: '#ffffff',
                            }
                          : undefined
                      }
                      className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'shadow-xs'
                          : 'bg-black/5 dark:bg-white/5 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span><UiText source={"Active"}/></span>
                        </>
                      ) : (
                        <span><UiText source={"Select"}/></span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="p-3 border-t flex items-center justify-between text-xs font-mono opacity-80"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <span><UiText source={"Click any model to select as active primary model"}/></span>
          <button
            type="button"
            onClick={handleCloseModal}
            className="px-4 py-1.5 rounded-xl text-white font-sans font-medium cursor-pointer"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
             <UiText source={"Close"}/> </button>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={
        active
          ? {
              backgroundColor: 'var(--accent-color)',
              color: '#ffffff',
              borderColor: 'var(--accent-color)',
            }
          : undefined
      }
      className={`px-2.5 py-1 rounded-lg transition-colors border font-medium cursor-pointer ${
        active
          ? 'shadow-xs'
          : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border-black/5 dark:border-white/5 text-neutral-700 dark:text-neutral-300'
      }`}
    >
      {label}
    </button>
  );
}
