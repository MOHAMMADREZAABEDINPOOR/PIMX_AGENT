'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { ProviderConfigPanel } from './ProviderConfigPanel';
import { X } from 'lucide-react';
import {UiText} from '@/components/i18n/LocaleProvider';

export function ProviderConfigModal() {
  const {
    providerConfigModalOpen,
    selectedProviderForConfig,
    setProviderConfigModalOpen,
  } = useAppStore();

  if (!providerConfigModalOpen) return null;

  return (
    <div
      id="provider-config-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] rounded-3xl border shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        style={{
          backgroundColor: 'var(--surface-color)',
          borderColor: 'var(--border-color)',
        }}
      >
        {/* Header with Close */}
        <div className="px-5 py-3 border-b border-black/10 dark:border-white/10 flex items-center justify-between gap-3" style={{ borderColor: 'var(--border-color)' }}>
          <div className="text-xs font-semibold text-muted"><UiText source={"Provider Configuration"}/></div>
          <button
            onClick={() => setProviderConfigModalOpen(false)}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto flex-1">
          <ProviderConfigPanel
            providerId={selectedProviderForConfig}
            onSelectProvider={(id) => setProviderConfigModalOpen(true, id)}
          />
        </div>
      </div>
    </div>
  );
}
