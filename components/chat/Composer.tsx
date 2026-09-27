'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { Attachment, ChatTool } from '@/lib/types';
import { ProviderLogo } from '@/components/ui/ProviderLogo';
import {
  Send,
  Square,
  Paperclip,
  Sparkles,
  ChevronDown,
  X,
  FileText,
  Image as ImageIcon,
  Brain,
  Edit3,
  Layers,
  FileCode,
  BookOpen,
  Database,
  Globe,
  Plus,
  SlidersHorizontal,
  Check,
  Presentation,
  AlertCircle,
  Columns,
  Users,
} from 'lucide-react';
import { TOOL_OPTIONS, DEDICATED_TOOLS } from '@/lib/tools/catalog';
import { readAttachment } from '@/lib/rag/attachments';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export function Composer() {
  const $t=useT();
  const {
    settings,
    sendMessage,
    isGenerating,
    generatingChatId,
    stopGeneration,
    activeChatId,
    chats,
    selectedModelIds,
    models,
    personas,
    knowledgeBases,
    updateChat,
    setWorkspaceModalOpen,
    toggleChatTool,
    toggleWebSearch,
    toggleThinking,
    setModelPickerOpen,
    setSettingsOpen,
    setCompareModalOpen,
    setCouncilModalOpen,
  } = useAppStore();

  const [prompt, setPrompt] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentError, setAttachmentError] = useState('');
  const [readingFiles, setReadingFiles] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentChat = chats.find((c) => c.id === activeChatId);
  const activePersona = personas.find((p) => p.id === currentChat?.personaId);
  const attachedKbs = knowledgeBases.filter((kb) => currentChat?.knowledgeBaseIds?.includes(kb.id));
  const activeTools: ChatTool[] = currentChat?.activeTools || (currentChat?.toolMode && currentChat.toolMode !== 'NONE' ? [currentChat.toolMode] : []);
  const isWebSearchActive = !!(currentChat?.webSearchEnabled || activeTools.includes('WEB_SEARCH'));
  const isThinkingActive = !!(currentChat?.thinkingEnabled || activeTools.includes('THINK'));

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowToolsDropdown(false);
      }
    }
    if (showToolsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showToolsDropdown]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  // Stop is shown only in the chat that is actually generating — other chats keep a working Send.
  const generatingHere = isGenerating && generatingChatId !== null && generatingChatId === activeChatId;

  const handleSend = () => {
    const text = prompt.trim();
    if (!text && attachments.length === 0) return;
    if (generatingHere || readingFiles) return;

    sendMessage(text, attachments);
    setPrompt('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (settings.sendOnEnter && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      } else if (!settings.sendOnEnter && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if(files.length+attachments.length>8 || Array.from(files).reduce((sum,file)=>sum+file.size,0)+attachments.reduce((sum,file)=>sum+file.size,0)>40*1024*1024){setAttachmentError('Use up to 8 attachments, with a total size below 40 MB.');e.target.value='';return;}

    setReadingFiles(true); setAttachmentError('');
    const results = await Promise.allSettled(Array.from(files).map(readAttachment));
    const read = results.flatMap(result => result.status === 'fulfilled' ? [result.value] : []);
    setAttachments(prev => [...prev, ...read]);
    const errors = results.flatMap(result => result.status === 'rejected' ? [String(result.reason?.message || result.reason)] : []);
    setAttachmentError(errors.join(' ')); setReadingFiles(false);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Primary model name to show
  const primaryModelId = currentChat?.modelIds?.[0] || selectedModelIds[0];
  const primaryModel = models.find((m) => m.id === primaryModelId);
  const modelCount = currentChat?.modelIds?.length || selectedModelIds.length;

  // Check active dedicated workspace tool
  const activeDedicatedTool = activeTools.find((t) => DEDICATED_TOOLS.includes(t));

  const toggleToolItem = (tool: ChatTool) => {
    if (tool === 'WEB_SEARCH') {
      toggleWebSearch();
    } else if (tool === 'THINK') {
      toggleThinking();
    } else if (tool === 'COMPARE') {
      const isAlreadyActive = activeTools.includes('COMPARE');
      if (isAlreadyActive) {
        toggleChatTool('COMPARE');
      } else {
        setCompareModalOpen(true);
      }
    } else if (tool === 'COUNCIL') {
      const isAlreadyActive = activeTools.includes('COUNCIL');
      if (isAlreadyActive) {
        toggleChatTool('COUNCIL');
      } else {
        setCouncilModalOpen(true);
      }
    } else {
      toggleChatTool(tool);
    }
  };

  // Collect active tool definitions to show sleek chips
  const activeToolDefs = TOOL_OPTIONS.filter((opt) => {
    if (opt.tool === 'WEB_SEARCH') return isWebSearchActive;
    if (opt.tool === 'THINK') return isThinkingActive;
    return activeTools.includes(opt.tool);
  });

  return (
    <div
      id="composer-container"
      className="mx-auto w-full transition-all duration-200 max-w-3xl px-4 pb-4"
    >
      {/* Main Composer Box */}
      <div
        className="relative rounded-2xl sm:rounded-3xl border shadow-lg composer-glow transition-all duration-300"
        style={{
          backgroundColor: 'var(--surface-color)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-color)',
        }}
      >

        {/* Active Tool & Persona Chips (when selected with fluid animation) */}
        {(activeToolDefs.length > 0 || activePersona || attachedKbs.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5 px-3.5 pt-3 pb-1 border-b border-[var(--border-color)] animate-in fade-in slide-in-from-top-1 duration-200">
            {/* Active Persona Chip */}
            {activePersona && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border shadow-xs transition-all animate-in fade-in zoom-in-95 cursor-pointer"
                style={{
                  backgroundColor: 'var(--accent-subtle, rgba(139, 92, 246, 0.12))',
                  borderColor: 'var(--accent-border, rgba(139, 92, 246, 0.35))',
                  color: 'var(--accent-color, #8B5CF6)',
                }}
                onClick={() => setWorkspaceModalOpen(true)}
                title={$t("Active Assistant: {0}. Click to view in Workspace Hub.",activePersona.name)}
              >
                <span>{activePersona.symbol || '🤖'}</span>
                <span className="font-semibold">{activePersona.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateChat(currentChat!.id, {
                      personaId: undefined,
                      systemPrompt: undefined,
                      temperature: undefined,
                      topP: undefined,
                      maxTokens: undefined,
                    });
                  }}
                  className="p-0.5 ml-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/15 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                  title={$t("Detach Assistant")}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Attached Knowledge Bases Chips */}
            {attachedKbs.map((kb) => (
              <div
                key={kb.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shadow-xs transition-all animate-in fade-in zoom-in-95 cursor-pointer"
                onClick={() => setWorkspaceModalOpen(true)}
                title={$t("Attached Knowledge Base: {0} (RAG grounded)",kb.name)}
              >
                <Database className="w-3.5 h-3.5 shrink-0" />
                <span>{kb.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextList = (currentChat?.knowledgeBaseIds || []).filter((id) => id !== kb.id);
                    updateChat(currentChat!.id, { knowledgeBaseIds: nextList });
                  }}
                  className="p-0.5 ml-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/15 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                  title={$t("Detach Knowledge Base")}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {activeToolDefs.map((def) => {
              const Icon = def.icon;
              return (
                <div
                  key={def.tool}
                  onClick={() => {
                    if (def.tool === 'COMPARE') setCompareModalOpen(true);
                    if (def.tool === 'COUNCIL') setCouncilModalOpen(true);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border border-black/5 dark:border-white/10 ${def.bgLight} ${def.bgDark} ${def.textColor} shadow-xs transition-all duration-300 ease-out transform animate-in fade-in zoom-in-95 cursor-pointer hover:opacity-90`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{<UiText source={def.label}/>}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleToolItem(def.tool);
                    }}
                    className="p-0.5 ml-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/15 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                    title={$t("Remove {0}",$t(def.label))}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Attachment preview chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-3.5 pt-2.5">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 shadow-xs"
              >
                {att.kind === 'IMAGE' ? (
                  <ImageIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                )}
                <span className="truncate max-w-[140px] text-[11px]">{att.name}</span>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="p-0.5 hover:text-red-500 text-neutral-400 hover:opacity-100 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Textarea */}
        {readingFiles && <p className="px-4 pt-3 text-xs text-muted" role="status"><UiText source={"Reading documents…"}/></p>}
        {attachmentError && <p className="px-4 pt-3 text-xs text-red-500" role="alert">{attachmentError}</p>}
        <div className="p-3.5 pb-2">
          <textarea
            id="composer-input"
            ref={textareaRef}
            rows={1}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={$t(activeTools.includes('CANVAS')
                ? 'Describe document to write, revise, or format in Canvas...'
                : activeTools.includes('SLIDES')
                ? 'Describe presentation topic or outline for interactive slide deck...'
                : activeTools.includes('WEB_DEV')
                ? 'Describe web application or components to generate...'
                : activeTools.includes('DEEP_RESEARCH')
                ? 'Enter topic for autonomous deep research & synthesis...'
                : isWebSearchActive
                ? 'Ask with live web search enabled...'
                : 'Ask anything, summarize documents, brainstorm...')}
            className="w-full bg-transparent border-0 outline-none! focus:outline-none! ring-0! focus:ring-0! resize-none text-sm text-[var(--text-color)] placeholder:text-[var(--text-muted)] leading-relaxed max-h-72"
          />
        </div>

        {/* Bottom controls bar */}
        <div className="flex items-center justify-between gap-2 px-3.5 pb-3 pt-1 text-xs">
          {/* Left Toolbar Actions */}
          <div className="flex items-center gap-1.5 relative min-w-0 flex-1" ref={dropdownRef}>
            {/* 1. Attach File (Paperclip on the left) */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              className="hidden"
            />
            <button
              id="btn-attach-file"
              onClick={() => fileInputRef.current?.click()}
              title={$t("Attach images, documents, or code files")}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors cursor-pointer"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* 2. Tools Dropdown Button */}
            <div className="relative">
              <button
                id="btn-composer-tools-list"
                onClick={() => setShowToolsDropdown(!showToolsDropdown)}
                title={$t("Tools & Capabilities")}
                style={
                  activeToolDefs.length > 0
                    ? {
                        backgroundColor: 'rgba(var(--accent-rgb), 0.12)',
                        color: 'var(--accent-color)',
                        borderColor: 'rgba(var(--accent-rgb), 0.35)',
                      }
                    : undefined
                }
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  activeToolDefs.length > 0
                    ? 'shadow-xs font-semibold'
                    : 'bg-neutral-100/80 dark:bg-neutral-800/60 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200/80 dark:border-neutral-700/60'
                }`}
              >
                <Plus
                  className="w-3.5 h-3.5"
                  style={activeToolDefs.length > 0 ? { color: 'var(--accent-color)' } : undefined}
                />
                <span><UiText source={"Tools"}/></span>
                <ChevronDown className={`w-3 h-3 opacity-60 transition-transform ${showToolsDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Tools List Dropdown Menu */}
              {showToolsDropdown && (
                <div
                  id="composer-tools-dropdown-menu"
                  className="absolute bottom-full left-0 mb-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-1.5 z-50 text-xs animate-fadeIn"
                >
                  <div className="px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300 text-[11px] uppercase tracking-wider">
                       <UiText source={"Capabilities & Tools"}/> </span>
                    <span className="text-[10px] text-neutral-400"><UiText source={"Select to activate"}/></span>
                  </div>

                  <div className="max-h-72 overflow-y-auto py-1 space-y-0.5">
                    {TOOL_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isActive =
                        (opt.tool === 'WEB_SEARCH' && isWebSearchActive) ||
                        (opt.tool === 'THINK' && isThinkingActive) ||
                        activeTools.includes(opt.tool);

                      const isIncompatible = Boolean(
                        activeDedicatedTool &&
                        activeDedicatedTool !== opt.tool &&
                        DEDICATED_TOOLS.includes(opt.tool)
                      );

                      return (
                        <button
                          key={opt.tool}
                          disabled={isIncompatible}
                          onClick={() => {
                            if (!isIncompatible) {
                              toggleToolItem(opt.tool);
                            }
                          }}
                          title={$t(isIncompatible?$t("Incompatible with active {0}",activeDedicatedTool):undefined)}
                          className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                            isIncompatible
                              ? 'opacity-35 cursor-not-allowed bg-neutral-50 dark:bg-neutral-950/30'
                              : isActive
                              ? `${opt.bgLight} ${opt.bgDark} font-medium border border-black/5 dark:border-white/10 cursor-pointer`
                              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/70 text-neutral-700 dark:text-neutral-300 cursor-pointer'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-white dark:bg-neutral-900 shadow-xs' : 'bg-neutral-100 dark:bg-neutral-800'}`}>
                            <Icon className={`w-4 h-4 ${opt.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`font-semibold ${isActive ? opt.textColor : 'text-neutral-900 dark:text-neutral-100'}`}>
                                {<UiText source={opt.label}/>}
                              </span>
                              {isActive && (
                                <Check
                                  className="w-3.5 h-3.5 shrink-0"
                                  style={{ color: 'var(--accent-color)' }}
                                />
                              )}
                              {isIncompatible && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-500 font-mono">
                                   <UiText source={"Conflict"}/> </span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug line-clamp-1">
                              {isIncompatible ? `Not combinable with ${activeDedicatedTool}` : <UiText source={opt.description}/>}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Model Badge (With dynamic AI Model Brand Logo) */}
            <button
              id="btn-composer-model"
              onClick={() => (models.length > 0 ? setModelPickerOpen(true) : setSettingsOpen(true, 'Providers & Models'))}
              style={
                models.length === 0
                  ? {
                      backgroundColor: 'rgba(var(--accent-rgb), 0.1)',
                      color: 'var(--accent-color)',
                      borderColor: 'rgba(var(--accent-rgb), 0.3)',
                    }
                  : undefined
              }
              className={`flex min-w-0 items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer border ${
                models.length > 0
                  ? 'bg-neutral-100/80 dark:bg-neutral-800/60 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-neutral-200/80 dark:border-neutral-700/60'
                  : 'shadow-xs font-semibold'
              }`}
            >
              {models.length > 0 ? (
                <>
                  <ProviderLogo
                    providerId={primaryModel?.providerId}
                    modelId={primaryModel?.upstreamId || primaryModel?.id || primaryModelId}
                    size="xs"
                    className="w-3.5 h-3.5 shrink-0 object-contain rounded-xs"
                  />
                  <span className="truncate max-w-[85px] xs:max-w-[120px] sm:max-w-[170px]">
                    {primaryModel ? primaryModel.displayName : primaryModelId}
                  </span>
                  {modelCount > 1 && (
                    <span
                      style={{
                        backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                        color: 'var(--accent-color)',
                        borderColor: 'rgba(var(--accent-rgb), 0.3)',
                      }}
                      className="px-1.5 py-0.2 rounded-md font-mono font-semibold text-[10px] border"
                    >
                      +{modelCount - 1}
                    </span>
                  )}
                  <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" style={{ color: 'var(--accent-color)' }} />
                  <span><UiText source={"Connect"}/></span>
                </>
              )}
            </button>
          </div>

          {/* Right Action: Send / Stop */}
          <div className="flex items-center gap-2">
            {generatingHere ? (
              <button
                id="btn-stop-generation"
                onClick={stopGeneration}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium shadow-md transition-all animate-pulse cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span className="text-xs"><UiText source={"Stop"}/></span>
              </button>
            ) : (
              <button
                id="btn-send-message"
                onClick={handleSend}
                disabled={readingFiles || (!prompt.trim() && attachments.length === 0)}
                style={{ backgroundColor: 'var(--accent-color)' }}
                className="flex items-center justify-center p-2.5 rounded-xl text-white transition-all shadow-md disabled:opacity-30 hover:opacity-90 active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
