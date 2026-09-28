'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MessageEntity } from '@/lib/types';
import { useAppStore } from '@/lib/store/useAppStore';
import { getTextDirection } from '@/lib/theme/fonts';
import { ProviderLogo } from '@/components/ui/ProviderLogo';
import { CodeArtifactBox } from './CodeArtifactBox';
import { ThinkingProcessAccordion } from './ThinkingProcessAccordion';
import { WebBrowsingActivity, WebSearchSource } from './WebBrowsingActivity';
import { AgentTimeline } from './AgentTimeline';
import { MessageReactions } from './MessageReactions';
import { ToolActivity } from './ToolActivity';
import { ErrorCard } from './ErrorCard';
import {
  Copy,
  Check,
  RotateCcw,
  Play,
  Volume2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Brain,
  Terminal,
  Sparkles,
  AlertCircle,
  Clock,
  Coins,
  Cpu,
  Layers,
  Pencil,
  GitFork,
  FileCode,
  ExternalLink,
  Code2,
  Presentation,
} from 'lucide-react';
import { parseSlideDeckFromContent } from '@/lib/slides/parser';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

interface MessageBubbleProps {
  message: MessageEntity;
}
function photoMatches(output?: string) { try { return JSON.parse(output || '{}').photos || 0; } catch { return 0; } }

export function MessageBubble({ message }: MessageBubbleProps) {
  const $t=useT();
  const {
    settings,
    models,
    getSiblings,
    switchBranch,
    regenerateMessage,
    continueMessage,
    saveArtifact,
    editAndResubmitMessage,
    forkChatFromMessage,
    setActiveToolPanel,
    saveWebFile,
    saveSlideDeck,
  } = useAppStore();

  const [copied, setCopied] = useState(false);
  const [forkedNotification, setForkedNotification] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [reasoningOpen, setReasoningOpen] = useState(settings.expandThinking);

  const isUser = message.role === 'user';
  const textDirection = getTextDirection(message.content || '');

  const { siblings, currentIndex } = getSiblings(message.chatId, message.id);
  const hasSiblings = siblings.length > 1;

  const modelObj = models.find((m) => m.id === message.modelId);
  const modelDisplayName = modelObj ? modelObj.displayName : message.modelId || 'Assistant';

  // Calculate pricing
  const promptCost = ((message.promptTokens || 0) / 1000000) * (modelObj?.promptPricePerM || 0);
  const completionCost = ((message.completionTokens || 0) / 1000000) * (modelObj?.completionPricePerM || 0);
  const totalCost = promptCost + completionCost;

  // Extract Web Dev Workspace files if present
  const extractedFiles: { path: string; content: string; lines: number }[] = [];
  if (!isUser && message.content) {
    const webFilesRegex = /<file\s+path=["']([^"']+)["']>([\s\S]*?)<\/file>/gi;
    let fileMatch;
    while ((fileMatch = webFilesRegex.exec(message.content)) !== null) {
      extractedFiles.push({
        path: fileMatch[1],
        content: fileMatch[2],
        lines: fileMatch[2].split('\n').length,
      });
    }
  }

  const showTimeline = (message.toolSteps || []).some((s) => s.toolName.startsWith('agent_'));

  // Active streaming check for Web Dev Workspace
  const isStreamingFile =
    !isUser &&
    message.state === 'STREAMING' &&
    /<file\s+path=/i.test(message.content || '') &&
    !(message.content || '').endsWith('</file>');

  // Extract Slide Deck if present
  const extractedSlideDeck = !isUser && message.content ? parseSlideDeckFromContent(message.content, message.chatId) : null;
  const openSlides = () => {
    if (!extractedSlideDeck) return;
    if (!useAppStore.getState().slideDecks[message.chatId]) saveSlideDeck(message.chatId, extractedSlideDeck);
    setActiveToolPanel('SLIDES');
  };

  // Conversational text stripped of raw file XML and slides code blocks
  let cleanProseContent = !isUser
    ? (message.content || '')
        .replace(/<file\s+path=["'][^"']+["']>[\s\S]*?<\/file>/gi, '')
        .replace(/<file\s+path=["'][^"']+["']>[\s\S]*$/gi, '')
        .replace(/```(?:slides|slide-deck|json:slides)[\s\S]*?(?:```|$)/gi, '')
        .trim()
    : message.content;

  if (!isUser && extractedSlideDeck && extractedSlideDeck.slides.length > 0) {
    // Remove auxiliary json code blocks containing slide telemetry or raw json
    cleanProseContent = cleanProseContent.replace(/```(?:json)?\s*[\s\S]*?(?:```|$)/gi, (match) => {
      if (
        match.includes('"title"') ||
        match.includes('"bullets"') ||
        match.includes('snippet.slides') ||
        match.includes('data.json') ||
        match.includes('vehicle_id')
      ) {
        return '';
      }
      return match;
    }).trim();

    // If prose contains raw slide outlines, extract only the introductory agent confirmation
    const firstSlideIndex = cleanProseContent.search(/(?:^|\n)(?:#{1,4}\s*)?(?:اسلاید|Slide)\s*[۰-۹0-9]+/i);
    if (firstSlideIndex > 0) {
      cleanProseContent = cleanProseContent.slice(0, firstSlideIndex).trim();
    } else if (firstSlideIndex === 0) {
      cleanProseContent = `ارائه «${extractedSlideDeck.title}» در قالب ${extractedSlideDeck.slides.length} اسلاید حرفه‌ای طراحی و در ورک‌اسپیس بارگذاری شد.`;
    }
  }

  // Auto-sync extracted files with workspace store
  React.useEffect(() => {
    if (message.state === 'DONE' && extractedFiles.length > 0 && !useAppStore.getState().webFiles[message.chatId]?.length) {
      extractedFiles.forEach((f) => {
        const ext = f.path.split('.').pop() || 'html';
        saveWebFile(message.chatId, f.path, ext, f.content);
      });
    }
  }, [message.content, message.state]);

  // Auto-sync extracted slide deck with workspace store
  React.useEffect(() => {
    if (message.state === 'DONE' && extractedSlideDeck && extractedSlideDeck.slides.length > 0 && !useAppStore.getState().slideDecks[message.chatId]) {
      saveSlideDeck(message.chatId, extractedSlideDeck);
    }
  }, [message.content, message.state]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const clean = message.content.replace(/```[\s\S]*?```/g, '').replace(/[#*_`]/g, '');
      const utter = new SpeechSynthesisUtterance(clean);
      window.speechSynthesis.speak(utter);
    }
  };

  const handleBranchPrev = () => {
    if (currentIndex > 0) {
      switchBranch(message.chatId, siblings[currentIndex - 1].id);
    }
  };

  const handleBranchNext = () => {
    if (currentIndex < siblings.length - 1) {
      switchBranch(message.chatId, siblings[currentIndex + 1].id);
    }
  };

  // User Message: Clean bubble with buttons displayed OUTSIDE and UNDER the bubble on hover
  if (isUser) {
    return (
      <div
        id={`msg-${message.id}`}
        className="group w-full py-1.5 px-4 transition-all duration-200 flex justify-end"
      >
        <div className="flex flex-col items-end max-w-full md:max-w-[75%] group/user">
          {isEditingUser ? (
            <div className="w-full min-w-[280px] sm:min-w-[340px] p-3.5 rounded-3xl bg-white dark:bg-neutral-900 border border-accent/50 shadow-md space-y-2.5">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="w-full bg-transparent border-0 text-sm focus:outline-none text-neutral-900 dark:text-neutral-100 resize-none leading-relaxed"
                placeholder={$t("Edit your message...")}
              />
              <div className="flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setEditContent(message.content);
                    setIsEditingUser(false);
                  }}
                  className="px-3 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400 font-medium cursor-pointer transition-colors"
                >
                   <UiText source={"Cancel"}/> </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (editContent.trim()) {
                      setIsEditingUser(false);
                      await editAndResubmitMessage(message.chatId, message.id, editContent.trim());
                    }
                  }}
                  className="px-4 py-1.5 rounded-xl text-white font-semibold shadow-xs cursor-pointer transition-all hover:opacity-95 active:scale-95"
                  style={{ backgroundColor: 'var(--accent-color)' }}
                >
                   <UiText source={"Save & Submit"}/> </button>
              </div>
            </div>
          ) : (
            <>
              {/* Clean User Message Bubble (no lines, no embedded buttons inside) */}
              <div
                className="relative rounded-3xl px-4 py-2.5 shadow-xs transition-all duration-300 border"
                style={{
                  backgroundColor: 'var(--accent-subtle)',
                  borderColor: 'var(--accent-border)',
                  color: 'var(--text-color)',
                }}
                dir={textDirection}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
              </div>

              <MessageReactions chatId={message.chatId} msgId={message.id} reactions={message.reactions} variant="user" />

              {/* Action buttons displayed UNDER the field/bubble on hover */}
              <div className="flex items-center gap-1 mt-1 pr-1 opacity-0 group-hover:opacity-100 group-hover/user:opacity-100 transition-opacity duration-200">
                <button
                  type="button"
                  onClick={handleCopy}
                  title={$t(copied ? "Copied" : "Copy message")}
                  className="p-1.5 hover:bg-black/10 dark:hover:bg-white/15 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditContent(message.content);
                    setIsEditingUser(true);
                  }}
                  title={$t("Edit message")}
                  className="p-1.5 hover:bg-black/10 dark:hover:bg-white/15 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Assistant Message Rendering
  return (
    <div
      id={`msg-${message.id}`}
      className="group w-full py-2.5 px-4 transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-2 flex justify-start"
    >
      <div
        className="flex flex-col min-w-0 w-full max-w-full"
      >
      <div
        className={`assistant-message relative min-w-0 rounded-3xl p-4 border bg-[var(--surface-color)] border-[var(--border-color)] text-[var(--text-color)] shadow-sm bubble-${(settings.bubbleStyle || 'MODERN').toLowerCase()}`}
        style={{ '--chat-text-size': settings.fontSizeLevel === 'SMALL' ? '13px' : settings.fontSizeLevel === 'LARGE' ? '16px' : '14px', '--chat-line-height': settings.chatLineHeight ?? 1.8 } as React.CSSProperties}
        dir={textDirection}
      >
        {/* Header line for Assistant */}
        <div className={`flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[var(--border-color)] text-[11px] ${settings.showModelLine ? '' : 'hidden'}`}>
          <div className="flex items-center gap-1.5 font-medium">
            <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0">
              <ProviderLogo
                providerId={modelObj?.providerId}
                modelId={message.modelId || modelObj?.upstreamId}
                size="xs"
              />
            </div>
            <span className="font-semibold text-[var(--text-color)]">{modelDisplayName}</span>
            {message.groupId && (
              <span className="px-1.5 py-0.2 rounded-sm text-[9px] bg-blue-500/20 text-blue-700 dark:text-blue-300 font-mono">
                 <UiText source={"Fan-out Compare"}/> </span>
            )}
          </div>

          {/* Branch Switcher (‹ 2 / 3 ›) */}
          {hasSiblings && (
            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full text-[10px] font-mono select-none">
              <button
                onClick={handleBranchPrev}
                disabled={currentIndex === 0}
                className="hover:text-black dark:hover:text-white disabled:opacity-30 p-0.5 cursor-pointer active:scale-75 transition-transform"
                title={$t("Previous branch response")}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 font-semibold">
                {currentIndex + 1} / {siblings.length}
              </span>
              <button
                onClick={handleBranchNext}
                disabled={currentIndex === siblings.length - 1}
                className="hover:text-black dark:hover:text-white disabled:opacity-30 p-0.5 cursor-pointer active:scale-75 transition-transform"
                title={$t("Next branch response")}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
        <ToolActivity message={message} />

        {/* Unified agent timeline (Grok/GPT style) when an agentic run exists, else legacy blocks */}
        {showTimeline && settings.showAgentActivity !== false ? (
          <AgentTimeline
            steps={message.toolSteps || []}
            reasoning={message.reasoning}
            reasoningMs={message.reasoningMs}
            isStreaming={message.state === 'STREAMING'}
          />
        ) : (
          <>
            {/* 1. Web Search / Web Browsing Activity (ChatGPT / Gemini style live search & citations) */}
            {(() => {
              const searchStep = message.toolSteps?.find((s) => s.toolName === 'web_search');
              if (!searchStep) return null;
              let sources: WebSearchSource[] = [];
              if (searchStep.output) {
                try {
                  const parsed = JSON.parse(searchStep.output);
                  if (parsed.sources && Array.isArray(parsed.sources)) {
                    sources = parsed.sources;
                  }
                } catch {
                  // Non-JSON output fallback
                }
              }
              return (
                <WebBrowsingActivity
                  query={searchStep.input?.query}
                  sources={sources}
                  isSearching={searchStep.status === 'CALLING'}
                />
              );
            })()}

            {/* 2. Deep Thinking Process Accordion (DeepSeek-R1 / o1 / Claude 3.7 style) */}
            {Boolean(message.reasoning && message.reasoning.trim()) && (
              <ThinkingProcessAccordion
                reasoning={message.reasoning!}
                reasoningMs={message.reasoningMs}
                isThinking={message.state === 'STREAMING'}
                defaultOpen={settings.expandThinking}
              />
            )}
          </>
        )}

        {/* 3. Non-search, non-agent Tool Steps Trace */}
        {message.toolSteps && message.toolSteps.filter((s) => s.toolName !== 'web_search' && !s.toolName.startsWith('agent_')).length > 0 && (
          <div className="mb-3 space-y-1.5">
            {message.toolSteps
              .filter((s) => s.toolName !== 'web_search' && !s.toolName.startsWith('agent_'))
              .map((step) => (
                <div
                  key={step.id}
                  className="px-3.5 py-2 rounded-xl border border-cyan-500/25 bg-cyan-500/5 text-xs text-cyan-800 dark:text-cyan-300 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-cyan-500" />
                    <span className="font-medium">{step.toolName === 'slide_images' ? (textDirection === 'rtl' ? 'جستجوی عکس‌های اسلاید' : 'Slide photo search') : step.toolName}</span>
                  </div>
                  <span className="text-[10px] opacity-75">{step.toolName === 'slide_images' && step.status === 'DONE' ? `${photoMatches(step.output)} ${textDirection === 'rtl' ? 'عکس مرتبط' : 'matching photos'}` : step.status}</span>
                </div>
              ))}
          </div>
        )}

        {/* Assistant Message Content (Error, Workspace Files, Markdown, Cancelled) */}
        <>
            {message.state === 'ERROR' ? (
              <ErrorCard
                errorCode={message.errorCode}
                errorDetail={message.errorDetail}
                onRetry={() => regenerateMessage(message.id)}
              />
            ) : (
              <div className="space-y-3">
                {/* 1. Conversational Prose Text */}
                {cleanProseContent ? (
                  <div className="prose dark:prose-invert ai-answer max-w-full text-sm leading-relaxed break-words text-neutral-900 dark:text-neutral-100">
                    {settings.renderMarkdown === false ? <div className="whitespace-pre-wrap">{cleanProseContent}</div> :
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          const codeString = String(children).replace(/\n$/, '');

                          if (!inline && match) {
                            return (
                              <CodeArtifactBox
                                language={match[1]}
                                code={codeString}
                                onSaveArtifact={(title, kind) =>
                                  saveArtifact(message.chatId, title, kind as any, match[1], codeString)
                                }
                              />
                            );
                          }
                          return (
                            <code className="px-1.5 py-0.5 rounded-md bg-black/10 dark:bg-white/10 font-mono text-[13px] text-neutral-900 dark:text-neutral-100" {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {cleanProseContent}
                    </ReactMarkdown>}
                  </div>
                ) : message.state === 'STREAMING' && !isStreamingFile ? (
                  <div className="flex items-center gap-2 py-1 not-prose select-none animate-in fade-in duration-150">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                       <UiText source={"Writing response..."}/> </span>
                  </div>
                ) : null}

                {/* 2. Active Web Dev Workspace Code Streaming Indicator */}
                {isStreamingFile && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-600 dark:text-cyan-400 animate-pulse">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <FileCode className="w-4 h-4 animate-spin text-cyan-500" />
                      <span><UiText source={"Writing code into Web Dev Workspace files..."}/></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveToolPanel('WEB_DEV')}
                      className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-[11px] font-sans font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span><UiText source={"Open Workspace"}/></span>
                    </button>
                  </div>
                )}

                {/* 3. Generated Web Dev Workspace File Bundle */}
                {extractedFiles.length > 0 && (
                  <div className="p-3.5 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 dark:bg-cyan-500/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-cyan-800 dark:text-cyan-300">
                        <FileCode className="w-4 h-4 text-cyan-500" />
                        <span><UiText source={"Web Dev Workspace:"}/> {extractedFiles.length}  <UiText source={"Project Files Generated"}/></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          extractedFiles.forEach((f) => {
                            const ext = f.path.split('.').pop() || 'html';
                            saveWebFile(message.chatId, f.path, ext, f.content);
                          });
                          setActiveToolPanel('WEB_DEV');
                        }}
                        className="px-3 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all hover:scale-[1.02]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span><UiText source={"Open in Workspace Panel"}/></span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {extractedFiles.map((file) => (
                        <div
                          key={file.path}
                          onClick={() => {
                            const ext = file.path.split('.').pop() || 'html';
                            saveWebFile(message.chatId, file.path, ext, file.content);
                            setActiveToolPanel('WEB_DEV');
                          }}
                          className="p-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 flex items-center justify-between gap-2 text-xs cursor-pointer hover:border-cyan-500 hover:shadow-xs transition-all"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Code2 className="w-4 h-4 text-cyan-500 shrink-0" />
                            <span className="font-mono font-medium truncate text-neutral-900 dark:text-neutral-100">
                              {file.path}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted font-mono shrink-0">
                            {file.lines}  <UiText source={"lines"}/> </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Generated Slide Deck Presentation Card */}
                {extractedSlideDeck && extractedSlideDeck.slides.length > 0 && (
                  <div className="p-3.5 rounded-2xl border border-accent/30 bg-accent/5 dark:bg-accent/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-accent dark:text-accent">
                        <Presentation className="w-4 h-4 text-accent" />
                        <span><UiText source={"Presentation Slides:"}/> {extractedSlideDeck.slides.length}  <UiText source={"Slides Ready"}/></span>
                      </div>
                      <button
                        type="button"
                        onClick={openSlides}
                        className="px-3 py-1 rounded-xl bg-accent hover:bg-accent text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all hover:scale-[1.02]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span><UiText source={"Open in Workspace"}/></span>
                      </button>
                    </div>

                    <div
                      onClick={openSlides}
                      className="p-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 flex items-center justify-between gap-2 text-xs cursor-pointer hover:border-accent hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Presentation className="w-4 h-4 text-accent shrink-0" />
                        <span className="font-semibold truncate text-neutral-900 dark:text-neutral-100">
                          {extractedSlideDeck.title}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 shrink-0">
                        {extractedSlideDeck.slides.length}  <UiText source={"Slides"}/> </span>
                    </div>
                  </div>
                )}

                {/* Cancelled State */}
                {message.state === 'CANCELLED' && (
                  <div className="flex items-center gap-2 py-1 text-xs text-muted select-none not-prose">
                    <span className="italic"><UiText source={"Generation stopped by user"}/></span>
                    <button
                      type="button"
                      onClick={() => regenerateMessage(message.id)}
                      className="px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 text-accent dark:text-accent font-medium transition-colors cursor-pointer text-xs not-italic"
                    >
                       <UiText source={"Retry"}/> </button>
                  </div>
                )}
              </div>
            )}
          </>

        {/* Metadata Footer: Model line, tokens, latency */}
        {!isUser && message.state === 'DONE' && (
          <div className="mt-3 pt-2 border-t border-black/10 dark:border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] opacity-80 font-mono">
            <div className="flex flex-wrap items-center gap-3">
              {settings.showTimestamps && <time dateTime={new Date(message.createdAt).toISOString()}>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>}
              {settings.showModelLine && <span className="font-semibold">{modelDisplayName}</span>}
              {settings.showTokenUsage && (
                <span title={$t("Prompt / Completion tokens; — means the provider did not report usage")} className="flex items-center gap-1 text-neutral-700 dark:text-neutral-300">
                  <Cpu className="w-3 h-3 text-accent" />
                  <span>{message.usageEstimated ? '~' : ''}{message.promptTokens ?? '—'}↑ {message.usageEstimated ? '~' : ''}{message.completionTokens ?? '—'}↓</span>
                  <span className="opacity-60 text-[9px]"><UiText source={"tokens"}/></span>
                </span>
              )}
              {settings.showLatency && (
                <span title={$t("Response latency")} className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-500" />
                  {message.latencyMs != null ? `${(message.latencyMs / 1000).toFixed(2)}s` : '—'}
                </span>
              )}
            </div>

            {/* Action Bar (Copy, Fork, Regenerate) */}
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <button onClick={handleCopy} title={$t("Copy message")} className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  forkChatFromMessage(message.chatId, message.id);
                  setForkedNotification(true);
                  setTimeout(() => setForkedNotification(false), 2500);
                }}
                title={$t("Branch conversation from here into a new chat")}
                className="relative p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer active:scale-90 transition-all"
                style={{ color: 'var(--accent-color)' }}
              >
                {forkedNotification ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <GitFork className="w-3.5 h-3.5" />}
                {forkedNotification && (
                  <span className="absolute bottom-full right-0 mb-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[10px] font-semibold whitespace-nowrap shadow-xl animate-fade-scale pointer-events-none z-30">
                     <UiText source={"Branched into new chat!"}/> </span>
                )}
              </button>
              <button
                onClick={() => regenerateMessage(message.id)}
                title={$t("Regenerate sibling reply")}
                className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
        {message.state === 'DONE' && <MessageReactions chatId={message.chatId} msgId={message.id} reactions={message.reactions} variant="assistant" />}
      </div>
    </div>
  );
}
