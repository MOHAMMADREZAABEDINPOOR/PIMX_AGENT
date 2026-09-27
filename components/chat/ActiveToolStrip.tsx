'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  X,
  Edit3,
  Sparkles,
  Database,
  Brain,
  Layers,
  FileCode,
  BookOpen,
  FolderLock,
  Globe,
  Presentation,
  Columns,
  Users,
  PanelRightOpen,
  PanelRightClose,
} from 'lucide-react';
import { ChatTool } from '@/lib/types';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export function ActiveToolStrip() {
  const $t=useT();
  const { activeChatId, chats, personas, updateChat, setToolMode, setActiveToolPanel, activeToolPanel } = useAppStore();
  const currentChat = chats.find((c) => c.id === activeChatId);
  const toolMode: ChatTool = currentChat?.toolMode || 'NONE';
  const activePersona = personas.find((p) => p.id === currentChat?.personaId);

  if (toolMode === 'NONE' && !activePersona) return null;

  const toolMeta: Record<ChatTool, { label: string; desc: string; icon: any; color: string }> = {
    NONE: { label: 'Standard Chat', desc: '', icon: null, color: '' },
    WEB_SEARCH: {
      label: 'Live Web Search',
      desc: 'Retrieves current web results and citations dynamically.',
      icon: Globe,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    },
    THINK: {
      label: 'Deep Thinking',
      desc: 'Formulates comprehensive internal reasoning traces before answering.',
      icon: Brain,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    CANVAS: {
      label: 'Canvas Mode',
      desc: 'Living document writer with version history and inline replacement.',
      icon: Edit3,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    },
    SLIDES: {
      label: 'Slides Presentation',
      desc: 'Interactive slide deck generation with PDF and PowerPoint export.',
      icon: Presentation,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
    },
    ARTIFACTS: {
      label: 'Artifacts Mode',
      desc: 'Generates interactive React, HTML, SVG, and Mermaid preview sandboxes.',
      icon: Sparkles,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    SOURCE_QA: {
      label: 'Chat with Sources',
      desc: 'Strictly grounds answers in uploaded documents, URLs, and citations [S1:C2].',
      icon: Database,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    DEEP_RESEARCH: {
      label: 'Multi-Agent Research',
      desc: 'Executes independent research rounds, peer critiques, and lead synthesis.',
      icon: Brain,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    },
    DEBATE: {
      label: 'Multi-Model Debate',
      desc: 'Role-based dialectic arguments, rebuttals, and reasoned judge scoring.',
      icon: Layers,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
    },
    WEB_DEV: {
      label: 'Web Dev Workspace',
      desc: 'Multi-file web project generation with live iframe execution sandbox.',
      icon: FileCode,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    },
    LEARN: {
      label: 'Interactive Learn',
      desc: 'Progressive lessons, quiz mode, worked exercises, and progress tracking.',
      icon: BookOpen,
      color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    },
    MEMORY: {
      label: 'Memory & Knowledge',
      desc: 'Personal long-term facts and knowledge base association.',
      icon: FolderLock,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    },
    COMPARE: {
      label: 'Multi-Model Compare',
      desc: 'Comparing up to 4 AI models side-by-side in real-time.',
      icon: Columns,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    },
    COUNCIL: {
      label: 'Model Council & Consensus',
      desc: 'Multi-model deliberation, brainstorming, and collective synthesis.',
      icon: Users,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
  };

  const meta = toolMode !== 'NONE' ? toolMeta[toolMode] : null;
  const Icon = meta?.icon;

  return (
    <div className="flex items-center gap-1.5 min-w-0 max-w-[200px] sm:max-w-[320px] md:max-w-[420px]">
      {/* Tool Mode Pill */}
      {meta && (
        <div
          id="active-tool-strip"
          className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-2 text-xs transition-all shadow-2xs backdrop-blur-md min-w-0 ${meta.color}`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
            <span className="font-semibold truncate max-w-[90px] sm:max-w-[130px]">{<UiText source={meta.label}/>}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {['CANVAS', 'SLIDES', 'ARTIFACTS', 'WEB_DEV', 'SOURCE_QA', 'DEEP_RESEARCH', 'DEBATE', 'LEARN'].includes(toolMode) && (
              <button
                onClick={() => setActiveToolPanel(activeToolPanel === toolMode ? 'NONE' : toolMode)}
                className="px-2 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 font-medium transition-colors text-[11px] cursor-pointer flex items-center gap-1"
                title={$t(activeToolPanel === toolMode ? 'Minimize Workspace Panel' : 'Open Workspace Panel')}
              >
                {activeToolPanel === toolMode ? (
                  <>
                    <PanelRightClose className="w-3 h-3" />
                    <span className="hidden xs:inline"><UiText source={"Minimize"}/></span>
                  </>
                ) : (
                  <>
                    <PanelRightOpen className="w-3 h-3" />
                    <span><UiText source={"Workspace"}/></span>
                  </>
                )}
              </button>
            )}
            <button
              onClick={() => setToolMode('NONE')}
              title={$t("Deactivate Tool")}
              className="p-0.5 rounded-md hover:bg-white/20 opacity-70 hover:opacity-100 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Active Persona Pill */}
      {activePersona && (
        <div
          id="active-persona-strip"
          className="px-2.5 py-1.5 rounded-xl border flex items-center gap-2 text-xs transition-all shadow-2xs backdrop-blur-md min-w-0"
          style={{
            backgroundColor: 'var(--accent-subtle, rgba(139, 92, 246, 0.12))',
            borderColor: 'var(--accent-border, rgba(139, 92, 246, 0.35))',
            color: 'var(--accent-color, #8B5CF6)',
          }}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm shrink-0">{activePersona.symbol || '🤖'}</span>
            <span className="font-semibold truncate max-w-[85px] sm:max-w-[130px] text-neutral-900 dark:text-white">
              {activePersona.name}
            </span>
            <span className="text-[9px] px-1 py-0.2 rounded-md font-mono bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 hidden sm:inline">
              {activePersona.category || 'ASSISTANT'}
            </span>
          </div>

          <button
            onClick={() =>
              updateChat(currentChat!.id, {
                personaId: undefined,
                systemPrompt: undefined,
                temperature: undefined,
                topP: undefined,
                maxTokens: undefined,
              })
            }
            title={$t("Detach Assistant from Chat")}
            className="p-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
