'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  Search,
  MessageSquare,
  Sparkles,
  Settings,
  Brain,
  Layers,
  Edit3,
  FileCode,
  BookOpen,
  Database,
  Cpu,
  Palette,
  X,
} from 'lucide-react';
import { ChatTool } from '@/lib/types';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export function CommandPalette() {
  const $t=useT();
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    chats,
    messages,
    activeChatId,
    setActiveChat,
    setToolMode,
    setSettingsOpen,
    setSelectedModelIds,
    setViewMode,
    models,
    projects,
  } = useAppStore();

  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for CMD+K / CTRL+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  // Filter only chats with messages or pinned
  const validChats = chats.filter((c) => (messages[c.id]?.length > 0 || c.pinned));

  const qLower = query.toLowerCase().trim();
  const filteredChats = validChats.filter((c) => {
    const proj = projects.find((p) => p.id === c.projectId);
    return (
      !qLower ||
      c.title.toLowerCase().includes(qLower) ||
      (proj && proj.name.toLowerCase().includes(qLower))
    );
  });

  const lastOpened = activeChatId ? validChats.find((c) => c.id === activeChatId) : validChats[0];
  const recentList = lastOpened ? validChats.filter((c) => c.id !== lastOpened.id) : validChats;

  const filteredTools = [
    { id: 'CANVAS', icon: <Edit3 className="w-3.5 h-3.5 text-blue-400" />, title: 'Canvas Mode', desc: 'Living documents workspace' },
    { id: 'ARTIFACTS', icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />, title: 'Artifacts Sandboxes', desc: 'React, HTML, SVG previews' },
    { id: 'DEEP_RESEARCH', icon: <Brain className="w-3.5 h-3.5 text-purple-400" />, title: 'Deep Research', desc: 'Autonomous multi-agent research' },
    { id: 'DEBATE', icon: <Layers className="w-3.5 h-3.5 text-pink-400" />, title: 'Model Debate', desc: 'Multi-model dialectic debate' },
    { id: 'WEB_DEV', icon: <FileCode className="w-3.5 h-3.5 text-cyan-400" />, title: 'Web Dev Sandbox', desc: 'Multi-file web project builder' },
    { id: 'LEARN', icon: <BookOpen className="w-3.5 h-3.5 text-yellow-400" />, title: 'Learn Mode', desc: 'Interactive socratic teacher' },
    { id: 'SOURCE_QA', icon: <Database className="w-3.5 h-3.5 text-emerald-400" />, title: 'Chat with Sources', desc: 'Grounded document QA' },
  ].filter((t) => !qLower || t.title.toLowerCase().includes(qLower) || t.desc.toLowerCase().includes(qLower));

  const handleSelectChat = (chatId: string) => {
    setActiveChat(chatId);
    setViewMode('CHAT');
    setCommandPaletteOpen(false);
  };

  const handleSelectTool = (tool: ChatTool) => {
    setToolMode(tool);
    setViewMode('CHAT');
    setCommandPaletteOpen(false);
  };

  return (
    <div
      id="command-palette-modal"
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input (Screenshot 3 style) */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-100 dark:border-neutral-800">
          <input
            type="text"
            placeholder={$t("Search...")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent focus:outline-none text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[420px] overflow-y-auto p-3 space-y-4 text-xs">
          {!qLower ? (
            /* Default View when query is empty: Last opened & Recent chats (Screenshot 3) */
            <>
              {lastOpened && (
                <div>
                  <div className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 px-3 py-1">
                     <UiText source={"Last opened"}/> </div>
                  <div className="space-y-0.5 mt-1">
                    <button
                      onClick={() => handleSelectChat(lastOpened.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800/70 text-left transition-colors cursor-pointer group"
                      dir="auto"
                    >
                      <MessageSquare className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 shrink-0" />
                      <span className="font-medium text-xs text-neutral-800 dark:text-neutral-200 truncate">
                        {lastOpened.title}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {recentList.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 px-3 py-1">
                     <UiText source={"Recent chats"}/> </div>
                  <div className="space-y-0.5 mt-1">
                    {recentList.slice(0, 8).map((c) => {
                      const proj = projects.find((p) => p.id === c.projectId);
                      return (
                        <button
                          key={c.id}
                          onClick={() => handleSelectChat(c.id)}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800/70 text-left transition-colors cursor-pointer group"
                          dir="auto"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <MessageSquare className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 shrink-0" />
                            <span className="font-medium text-xs text-neutral-800 dark:text-neutral-200 truncate">
                              {c.title}
                            </span>
                          </div>
                          {proj && (
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-normal shrink-0 ml-2">
                              {proj.name}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {validChats.length === 0 && (
                <div className="py-8 text-center text-xs text-neutral-400">
                   <UiText source={"No conversations found."}/> </div>
              )}
            </>
          ) : (
            /* Live Filtered Search Results */
            <>
              {filteredChats.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 px-3 py-1">
                     <UiText source={"Matching Conversations ("}/>{filteredChats.length})
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {filteredChats.map((c) => {
                      const proj = projects.find((p) => p.id === c.projectId);
                      return (
                        <button
                          key={c.id}
                          onClick={() => handleSelectChat(c.id)}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800/70 text-left transition-colors cursor-pointer group"
                          dir="auto"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <MessageSquare className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 shrink-0" />
                            <span className="font-medium text-xs text-neutral-800 dark:text-neutral-200 truncate">
                              {c.title}
                            </span>
                          </div>
                          {proj && (
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-normal shrink-0 ml-2">
                              {proj.name}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {filteredTools.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 px-3 py-1">
                     <UiText source={"Tools & Modes"}/> </div>
                  <div className="space-y-0.5 mt-1">
                    {filteredTools.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleSelectTool(t.id as ChatTool)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800/70 text-left transition-colors cursor-pointer group"
                      >
                        <span className="shrink-0">{t.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-xs text-neutral-800 dark:text-neutral-200 truncate">{t.title}</div>
                          <div className="text-[10px] text-neutral-400 truncate">{<UiText source={t.desc}/>}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredChats.length === 0 && filteredTools.length === 0 && (
                <div className="py-12 text-center text-xs text-neutral-400">
                   <UiText source={"No results matching \""}/>{query}<UiText source={"\""}/> </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
