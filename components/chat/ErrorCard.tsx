'use client';

import React, { useState } from 'react';
import {
  WifiOff,
  KeyRound,
  ZapOff,
  ServerCrash,
  Timer,
  ShieldAlert,
  ShieldX,
  FileText,
  AlertCircle,
  RotateCcw,
  Settings,
  Sparkles,
  PlusCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { resolveApiError, ApiErrorKind } from '@/lib/errors/apiErrors';
import { useAppStore } from '@/lib/store/useAppStore';
import {UiText} from '@/components/i18n/LocaleProvider';

interface ErrorCardProps {
  errorCode?: string;
  errorDetail?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorCard({ errorCode, errorDetail, onRetry, className = '' }: ErrorCardProps) {
  const { setSettingsOpen, setModelPickerOpen, createChat, setActiveChat } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const resolved = resolveApiError(errorDetail, errorCode);

  const renderIcon = (kind: ApiErrorKind) => {
    switch (kind) {
      case 'NETWORK_OFFLINE':
        return <WifiOff className="w-5 h-5 text-rose-500 animate-pulse" />;
      case 'AUTH_INVALID_KEY':
        return <KeyRound className="w-5 h-5 text-amber-500" />;
      case 'RATE_LIMIT_429':
        return <ZapOff className="w-5 h-5 text-amber-500" />;
      case 'SERVER_OVERLOAD_503':
        return <ServerCrash className="w-5 h-5 text-purple-500" />;
      case 'GATEWAY_TIMEOUT_504':
        return <Timer className="w-5 h-5 text-amber-500" />;
      case 'PERMISSION_FORBIDDEN_403':
        return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'CONTEXT_LENGTH_EXCEEDED':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'SAFETY_FILTERED':
        return <ShieldX className="w-5 h-5 text-rose-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
    }
  };

  const handleCopyRaw = () => {
    const text = `Error Code: ${errorCode || 'N/A'}\nDetail: ${errorDetail || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAction = () => {
    switch (resolved.suggestedAction) {
      case 'RETRY':
        if (onRetry) onRetry();
        break;
      case 'SETTINGS':
        setSettingsOpen(true);
        break;
      case 'SWITCH_MODEL':
        setModelPickerOpen(true);
        break;
      case 'NEW_CHAT':
        const newId = createChat({ title: 'New Conversation' });
        setActiveChat(newId);
        break;
      default:
        if (onRetry) onRetry();
    }
  };

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-300 shadow-sm text-left ${
        resolved.colorClass === 'amber'
          ? 'bg-amber-500/5 border-amber-500/25 text-neutral-900 dark:text-neutral-100'
          : resolved.colorClass === 'purple'
          ? 'bg-purple-500/5 border-purple-500/25 text-neutral-900 dark:text-neutral-100'
          : resolved.colorClass === 'blue'
          ? 'bg-blue-500/5 border-blue-500/25 text-neutral-900 dark:text-neutral-100'
          : 'bg-rose-500/5 border-rose-500/25 text-neutral-900 dark:text-neutral-100'
      } ${className}`}
    >
      {/* Top Bar: Icon, Title & Code badge */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-black/5 dark:bg-white/10 shadow-2xs">
            {renderIcon(resolved.kind)}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold tracking-tight text-neutral-900 dark:text-white truncate">
              {resolved.titleFa}
            </h4>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono" dir="ltr">
              {resolved.titleEn}
            </span>
          </div>
        </div>

        {errorCode && (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400 shrink-0">
            {errorCode}
          </span>
        )}
      </div>

      {/* Error Explanation */}
      <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed mb-2">
        {resolved.messageFa}
      </p>

      {/* Helpful Actionable Advice */}
      <div className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-black/[0.02] dark:bg-white/[0.02] p-2 rounded-xl border border-black/5 dark:border-white/5 mb-3 leading-relaxed">
        <span className="font-semibold text-neutral-900 dark:text-neutral-200"><UiText source={"Advice:"}/> </span>
        <span>{resolved.adviceFa}</span>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-black/5 dark:border-white/5">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            style={{ backgroundColor: 'var(--accent-color)', color: '#ffffff' }}
            className="px-3 py-1.5 rounded-xl font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer hover:opacity-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span><UiText source={"Retry"}/></span>
          </button>
        )}

        {resolved.suggestedAction === 'SETTINGS' && (
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/10 hover:bg-black/10 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span><UiText source={"Provider Settings"}/></span>
          </button>
        )}

        {resolved.suggestedAction === 'SWITCH_MODEL' && (
          <button
            type="button"
            onClick={() => setModelPickerOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/10 hover:bg-black/10 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span><UiText source={"Switch Model"}/></span>
          </button>
        )}

        {resolved.suggestedAction === 'NEW_CHAT' && (
          <button
            type="button"
            onClick={() => {
              const newId = createChat({ title: 'New Conversation' });
              setActiveChat(newId);
            }}
            className="px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/10 hover:bg-black/10 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span><UiText source={"New Chat"}/></span>
          </button>
        )}

        {/* Collapsible raw error toggle */}
        <button
          type="button"
          onClick={() => setShowRaw(!showRaw)}
          className="mr-auto text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span><UiText source={"Technical Details"}/></span>
          {showRaw ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Raw Error Code & Details Box */}
      {showRaw && (
        <div
          dir="ltr"
          className="mt-2.5 p-2.5 rounded-xl bg-black/50 border border-white/5 font-mono text-[11px] text-rose-300 text-left space-y-1.5 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between text-[10px] text-neutral-400 border-b border-white/5 pb-1">
            <span><UiText source={"Raw Upstream Response"}/></span>
            <button
              type="button"
              onClick={handleCopyRaw}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? <UiText source={"Copied"}/> : <UiText source={"Copy"}/>}</span>
            </button>
          </div>
          <div className="whitespace-pre-wrap max-h-32 overflow-y-auto leading-relaxed opacity-90">
            {errorDetail || errorCode || 'No additional technical details.'}
          </div>
        </div>
      )}
    </div>
  );
}
