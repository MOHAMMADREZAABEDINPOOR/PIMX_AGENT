'use client';

import React, { useState } from 'react';
import { MessageEntity } from '@/lib/types';
import { useAppStore } from '@/lib/store/useAppStore';
import { ProviderLogo } from '../ui/ProviderLogo';
import {
  Copy,
  Check,
  Zap,
  Columns,
  Sparkles,
  AlertCircle,
  Brain,
  ChevronDown,
  ChevronUp,
  GitFork,
  RotateCcw,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';
import { ErrorCard } from './ErrorCard';
import { getTextDirection } from '@/lib/theme/fonts';
import { ToolActivity } from './ToolActivity';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

interface CompareGridProps {
  messages: MessageEntity[];
}

export function CompareGrid({ messages }: CompareGridProps) {
  const $t=useT();
  const { models, settings, saveArtifact, forkChatFromMessage, regenerateMessage } = useAppStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [forkedId, setForkedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const count = messages.length;
  const gridClasses =
    count === 1
      ? 'grid-cols-1 max-w-4xl'
      : count === 2
      ? 'grid-cols-1 md:grid-cols-2 max-w-6xl'
      : count === 3
      ? 'grid-cols-1 md:grid-cols-3 max-w-7xl'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-[96vw]';

  return (
    <div className="w-full py-3 px-2 sm:px-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between gap-2 mb-2.5 px-2">
        <div
          style={{ color: 'var(--accent-color)' }}
          className="flex items-center gap-2 text-xs font-semibold"
        >
          <Columns className="w-4 h-4" />
          <span><UiText source={"Side-by-Side Model Comparison ("}/>{count}  <UiText source={"Models)"}/></span>
        </div>
        <span className="text-[11px] text-muted font-mono"><UiText source={"Parallel Execution"}/></span>
      </div>

      {/* Grid Container */}
      <div className={`grid ${gridClasses} gap-3.5 mx-auto w-full`}>
        {messages.map((msg) => {
          const modelObj = models.find((m) => m.id === msg.modelId);
          const displayName = modelObj?.displayName || msg.modelId || 'Assistant';
          const isCopied = copiedId === msg.id;
          const textDirection = getTextDirection(msg.content || '');
          const isRtl = textDirection === 'rtl';
          const reasoningDir = msg.reasoning ? getTextDirection(msg.reasoning) : 'ltr';

          return (
            <div
              key={msg.id}
              className="rounded-3xl border border-black/10 dark:border-white/10 bg-[var(--surface-color)] flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-all min-w-0"
            >
              {/* Column Header */}
              <div className="p-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between gap-2 bg-black/[0.02] dark:bg-white/[0.02]">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center shrink-0">
                    <ProviderLogo
                      providerId={modelObj?.providerId}
                      modelId={msg.modelId || modelObj?.upstreamId}
                      size="xs"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-neutral-900 dark:text-white truncate">
                      {displayName}
                    </div>
                    <div className="text-[10px] font-mono text-muted uppercase">
                      {modelObj?.providerId || 'AI'}
                    </div>
                  </div>
                </div>

                {/* Status / Latency badge */}
                <div className="shrink-0">
                  {msg.state === 'STREAMING' ? (
                    <span
                      style={{
                        backgroundColor: 'rgba(var(--accent-rgb), 0.12)',
                        color: 'var(--accent-color)',
                      }}
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold animate-pulse"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-ping"
                        style={{ backgroundColor: 'var(--accent-color)' }}
                      />
                      <span><UiText source={"Live"}/></span>
                    </span>
                  ) : msg.latencyMs ? (
                    <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 font-mono text-[10px] text-muted">
                      {(msg.latencyMs / 1000).toFixed(1)}<UiText source={"s"}/> </span>
                  ) : null}
                </div>
              </div>

              {/* Column Content */}
              <div
                className={`p-3.5 flex-1 overflow-y-auto text-xs sm:text-sm leading-relaxed text-neutral-900 dark:text-neutral-100 space-y-2 ${
                  isRtl ? 'font-persian' : ''
                }`}
                dir={textDirection}
              >
                {/* Reasoning if present */}
                <ToolActivity message={msg} />
                {msg.reasoning && (
                  <div
                    style={{
                      borderColor: 'rgba(var(--accent-rgb), 0.25)',
                      backgroundColor: 'rgba(var(--accent-rgb), 0.05)',
                    }}
                    className={`p-2.5 rounded-xl border text-[11px] font-mono ${
                      reasoningDir === 'rtl' ? 'font-persian' : ''
                    }`}
                    dir={reasoningDir}
                  >
                    <div
                      className="font-semibold flex items-center gap-1 mb-1"
                      style={{ color: 'var(--accent-color)' }}
                    >
                      <Brain className="w-3 h-3" />
                      <span><UiText source={"Reasoning"}/></span>
                    </div>
                    <div className="whitespace-pre-wrap line-clamp-4 hover:line-clamp-none font-sans text-xs">
                      {msg.reasoning}
                    </div>
                  </div>
                )}

                {msg.state === 'ERROR' ? (
                  <ErrorCard
                    errorCode={msg.errorCode}
                    errorDetail={msg.errorDetail}
                    onRetry={() => regenerateMessage(msg.id)}
                  />
                ) : msg.content ? (
                  <div
                    className={`prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed break-words text-neutral-900 dark:text-neutral-100 ${
                      isRtl ? 'font-persian' : ''
                    }`}
                    dir={textDirection}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          const codeString = String(children).replace(/\n$/, '');
                          if (!inline && match) {
                            return (
                              <CodeBlock
                                language={match[1]}
                                code={codeString}
                                onSaveArtifact={(title: string, kind: string) =>
                                  saveArtifact(msg.chatId, title, kind as any, match[1], codeString)
                                }
                              />
                            );
                          }
                          return (
                            <code className="px-1.5 py-0.5 rounded-md bg-black/10 dark:bg-white/10 font-mono text-[11px]" {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : msg.state === 'STREAMING' ? (
                  <div className="flex items-center gap-2 py-4 text-xs text-muted font-medium animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                    <span><UiText source={"Generating response..."}/></span>
                  </div>
                ) : (
                  <div className="text-muted text-xs italic py-4"><UiText source={"No content returned."}/></div>
                )}
              </div>

              {/* Column Footer */}
              <div className="p-2 px-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px] text-muted">
                <span>
                  {msg.completionTokens ? `${msg.completionTokens} tokens` : ''}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleCopy(msg.id, msg.content)}
                    disabled={!msg.content}
                    className="p-1 px-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                    title={$t("Copy model response")}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500 font-medium"><UiText source={"Copied"}/></span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span><UiText source={"Copy"}/></span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      forkChatFromMessage(msg.chatId, msg.id);
                      setForkedId(msg.id);
                      setTimeout(() => setForkedId(null), 2500);
                    }}
                    title={$t("Branch conversation from this model's reply into a new chat")}
                    style={{ color: 'var(--accent-color)' }}
                    className="p-1 px-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {forkedId === msg.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500 font-medium"><UiText source={"Branched"}/></span>
                      </>
                    ) : (
                      <>
                        <GitFork className="w-3.5 h-3.5" />
                        <span><UiText source={"Branch"}/></span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => regenerateMessage(msg.id)}
                    title={$t("Regenerate reply from this model")}
                    className="p-1 px-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span><UiText source={"Retry"}/></span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
