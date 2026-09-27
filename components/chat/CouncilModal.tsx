'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  X,
  Search,
  Check,
  Zap,
  Users,
  Sparkles,
  Layers,
  Brain,
  Shield,
} from 'lucide-react';
import { ProviderLogo } from '@/components/ui/ProviderLogo';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export function CouncilModal() {
  const $t=useT();
  const {
    councilModalOpen,
    setCouncilModalOpen,
    councilModelIds,
    setCouncilModelIds,
    toggleCouncilModelId,
    models,
    accounts,
    customProviders,
    testModel,
    activeChatId,
    updateChat,
  } = useAppStore();

  const [search, setSearch] = useState('');
  const [testingModelId, setTestingModelId] = useState<string | null>(null);

  if (!councilModalOpen) return null;

  const configuredProviderIds = new Set(accounts.map((a) => a.providerId));
  const activeModels = models.filter((m) => {
    if (configuredProviderIds.has(m.providerId)) return true;
    if (m.isCustom && customProviders.some((cp) => cp.id === m.providerId)) return true;
    return false;
  });

  const filteredModels = activeModels.filter((m) => {
    if (!m.visible && !search) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.displayName.toLowerCase().includes(q) ||
        m.displayId.toLowerCase().includes(q) ||
        m.providerId.toLowerCase().includes(q) ||
        m.upstreamId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleTest = async (e: React.MouseEvent, modelId: string) => {
    e.stopPropagation();
    setTestingModelId(modelId);
    await testModel(modelId);
    setTestingModelId(null);
  };

  const handleSelectAll = () => {
    setCouncilModelIds(activeModels.map((m) => m.id));
  };

  const handleClearAll = () => {
    setCouncilModelIds([]);
  };

  const handleApply = () => {
    if (councilModelIds.length < 2 && activeModels.length >= 2) {
      setCouncilModelIds(activeModels.slice(0, 3).map((m) => m.id));
    }
    if (activeChatId) {
      const nextTools = ['COUNCIL' as const];
      updateChat(activeChatId, {
        toolMode: 'COUNCIL',
        activeTools: nextTools,
        modelIds: councilModelIds.length >= 2 ? councilModelIds : activeModels.slice(0, 3).map((m) => m.id),
      });
    }
    setCouncilModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl max-h-[85vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        style={{
          backgroundColor: 'var(--surface-color)',
          borderColor: 'var(--border-color)',
        }}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
          <div className="space-y-0.5">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              <span><UiText source={"Model Council & Consensus"}/></span>
            </h3>
            <p className="text-xs text-muted">
               <UiText source={"Select 2 or more models (unlimited) to collaborate, debate, and synthesize collective wisdom."}/> </p>
          </div>
          <button
            type="button"
            onClick={() => setCouncilModalOpen(false)}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar & Search */}
        <div className="p-3 border-b space-y-2.5" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder={$t("Search models for council...")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2.5 py-1 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-muted transition-colors cursor-pointer"
              >
                 <UiText source={"Select All ("}/>{activeModels.length})
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2.5 py-1 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-muted transition-colors cursor-pointer"
              >
                 <UiText source={"Clear"}/> </button>
              <span className="font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300">
                {councilModelIds.length}  <UiText source={"models selected (Min: 2)"}/> </span>
            </div>
          </div>
        </div>

        {/* Models List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredModels.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted">
               <UiText source={"No configured models match the search criteria."}/> </div>
          ) : (
            filteredModels.map((m) => {
              const isSelected = councilModelIds.includes(m.id);

              return (
                <div
                  key={m.id}
                  onClick={() => toggleCouncilModelId(m.id)}
                  className={`p-3 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/40 shadow-xs'
                      : 'hover:bg-black/[0.03] dark:hover:bg-white/5 border-black/5 dark:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center shrink-0">
                      <ProviderLogo providerId={m.providerId} modelId={m.upstreamId} size="sm" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-neutral-900 dark:text-white">{m.displayName}</span>
                        <span className="text-[10px] font-mono text-muted uppercase bg-black/5 dark:bg-white/10 px-1.5 py-0.2 rounded">
                          {m.providerId}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted">
                        <span>{(m.contextWindow / 1000).toFixed(0)}<UiText source={"k context"}/></span>
                        {m.reasoningCapable && <span className="text-purple-600 dark:text-purple-400 font-medium"><UiText source={"• Reasoning"}/></span>}
                        {m.visionCapable && <span className="text-blue-600 dark:text-blue-400 font-medium"><UiText source={"• Vision"}/></span>}
                        {m.toolsCapable && <span className="text-emerald-600 dark:text-emerald-400 font-medium"><UiText source={"• Tools"}/></span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleTest(e, m.id)}
                      disabled={testingModelId === m.id}
                      title={$t("Live Test Connection")}
                      className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 text-neutral-600 dark:text-neutral-300 transition-all text-xs cursor-pointer"
                    >
                      <Zap className={`w-3.5 h-3.5 ${testingModelId === m.id ? 'animate-spin text-amber-500' : 'text-amber-500'}`} />
                    </button>

                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : 'border-black/20 dark:border-white/20'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--border-color)' }}>
          <span className="text-muted">
            {councilModelIds.length < 2
              ? <UiText source={"Select at least 2 models for multi-model council"}/>
              : `${councilModelIds.length} models will collaborate to answer`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCouncilModalOpen(false)}
              className="px-3.5 py-1.5 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
               <UiText source={"Cancel"}/> </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={councilModelIds.length < 2}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-medium shadow-xs transition-all cursor-pointer"
            >
               <UiText source={"Activate Council ("}/>{councilModelIds.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
