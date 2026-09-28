'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  Plus,
  MessageSquare,
  Pin,
  Trash2,
  Edit2,
  Settings,
  Database,
  Layers,
  Sparkles,
  Search,
  Check,
  CheckCheck,
  X,
  EyeOff,
  Bot,
  Brain,
  Loader2,
  FolderKanban,
  FileCode,
  BookOpen,
  Folder,
  FolderPlus,
  RotateCcw,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Share2,
  Zap,
  HardDrive,
  Files,
  PanelLeftClose,
  PanelLeftOpen,
  SquarePen,
} from 'lucide-react';
import { ChatTool, ChatEntity, ProjectEntity } from '@/lib/types';
import { PimxLogo } from '@/components/ui/PimxLogo';
import {WorkspaceControls} from '@/components/security/WorkspaceControls';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWorkspace: () => void;
}

interface PendingDeletion {
  secondsLeft: number;
  intervalId: NodeJS.Timeout;
}

export function ChatDrawer({ isOpen, onClose, onOpenWorkspace }: ChatDrawerProps) {
  const $t=useT();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const {
    chats,
    messages,
    activeChatId,
    createChat,
    setActiveChat,
    deleteChat,
    renameChat,
    pinChat,
    assignChatToProject,
    setSettingsOpen,
    setExportModalOpen,
    projects,
    activeProjectId,
    setActiveProject,
    setProjectModalOpen,
    viewMode,
    setViewMode,
    setCommandPaletteOpen,
    isGenerating,
    generatingChatId,
    lastCompletedChatId,
    lastCompletedAt,
  } = useAppStore();
  const isChatWorking = (id: string) => isGenerating && generatingChatId === id;
  // Freshly-finished flash — the store clears lastCompletedChatId after 12s, so a plain equality check suffices.
  const isChatFresh = (id: string) => lastCompletedChatId === id && lastCompletedChatId !== null;

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [collapsedFlyout, setCollapsedFlyout] = useState<'RECENTS' | 'PINNED' | null>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const [pendingDeletions, setPendingDeletions] = useState<Record<string, PendingDeletion>>({});
  const timerRefs = useRef<Record<string, NodeJS.Timeout>>({});

  // Outside click listener for collapsed flyouts
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target as Node)) {
        setCollapsedFlyout(null);
      }
    }
    if (collapsedFlyout) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [collapsedFlyout]);

  // Clean up timers on unmount only
  useEffect(() => {
    return () => {
      Object.values(timerRefs.current).forEach((id) => clearInterval(id));
    };
  }, []);

  // Filter chats: do NOT show empty chats that haven't sent any messages yet
  const filteredChats = chats.filter((c) => {
    if (c.temporary) return false;
    const chatMsgs = messages[c.id];
    const hasMessages = chatMsgs && chatMsgs.length > 0;
    // Don't show ghost/empty chats in history
    if (!hasMessages && !c.pinned) return false;

    const q = searchQuery.toLowerCase().trim();
    const chatProj = projects.find((p) => p.id === c.projectId);
    const matchesSearch =
      !q ||
      c.title.toLowerCase().includes(q) ||
      (chatProj && chatProj.name.toLowerCase().includes(q));
    if (!matchesSearch) return false;

    if (activeProjectId) {
      return c.projectId === activeProjectId;
    }
    // Show all non-empty chats in Recents
    return true;
  });

  const pinnedChats = filteredChats.filter((c) => c.pinned);
  const regularChats = filteredChats.filter((c) => !c.pinned);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  const handleStartEdit = (id: string, currentTitle: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (editTitle.trim()) {
      renameChat(id, editTitle.trim());
    }
    setEditingId(null);
  };

  // Clicking New Chat clears project mode and opens a fresh conversation
  const handleNewChat = () => {
    setActiveProject(null);
    setViewMode('CHAT');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
    }
    const newId = createChat({
      projectId: undefined,
      title: 'New Conversation',
    });
    setActiveChat(newId);
    onClose();
  };

  // 7-second soft delete with countdown, animated timer & instant delete
  const handleTriggerDelete = (chatId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // If already deleting, cancel
    if (timerRefs.current[chatId]) {
      handleCancelDelete(chatId, e);
      return;
    }

    let remaining = 7.0;

    const intervalId = setInterval(() => {
      remaining = Math.max(0, parseFloat((remaining - 0.1).toFixed(1)));

      if (remaining <= 0) {
        clearInterval(intervalId);
        delete timerRefs.current[chatId];
        setPendingDeletions((prev) => {
          const next = { ...prev };
          delete next[chatId];
          return next;
        });
        deleteChat(chatId);
      } else {
        setPendingDeletions((prev) => {
          if (!prev[chatId]) return prev;
          return {
            ...prev,
            [chatId]: {
              secondsLeft: remaining,
              intervalId,
            },
          };
        });
      }
    }, 100);

    timerRefs.current[chatId] = intervalId;

    setPendingDeletions((prev) => ({
      ...prev,
      [chatId]: {
        secondsLeft: 7.0,
        intervalId,
      },
    }));
  };

  const handleCancelDelete = (chatId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (timerRefs.current[chatId]) {
      clearInterval(timerRefs.current[chatId]);
      delete timerRefs.current[chatId];
    }
    setPendingDeletions((prev) => {
      const next = { ...prev };
      delete next[chatId];
      return next;
    });
  };

  const handleForceDeleteNow = (chatId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (timerRefs.current[chatId]) {
      clearInterval(timerRefs.current[chatId]);
      delete timerRefs.current[chatId];
    }
    setPendingDeletions((prev) => {
      const next = { ...prev };
      delete next[chatId];
      return next;
    });
    deleteChat(chatId);
  };

  const toolIcon = (mode?: ChatTool) => {
    switch (mode) {
      case 'CANVAS':
        return <Edit2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
      case 'WEB_DEV':
        return <FileCode className="w-3.5 h-3.5 text-cyan-500 shrink-0" />;
      case 'SOURCE_QA':
        return <Database className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      case 'LEARN':
        return <BookOpen className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
      case 'DEBATE':
        return <Layers className="w-3.5 h-3.5 text-orange-500 shrink-0" />;
      case 'DEEP_RESEARCH':
        return <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-color)' }} />;
      case 'THINK':
        return <Brain className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      default:
        return <MessageSquare className="w-3.5 h-3.5 opacity-60 shrink-0" />;
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Collapsed Narrow Icon Rail (Desktop only) */}
      {isCollapsed ? (
        <aside
          id="chat-drawer-collapsed"
          className="relative hidden lg:flex w-16 h-full flex-col items-center justify-between py-3 border-r select-none bg-[var(--surface-color)] text-[var(--text-color)] shrink-0 transition-all z-30"
          style={{ borderColor: 'var(--border-color)' }}
        >
          {/* Top Icons */}
          <div className="flex flex-col items-center gap-2.5">
            {/* Logo / Expand trigger */}
            <button
              onClick={() => setIsCollapsed(false)}
              title={$t("Expand sidebar (Pimx Agent AI)")}
              className="w-10 h-10 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer overflow-hidden p-0.5"
            >
              <PimxLogo size="xs" />
            </button>

            {/* New Chat */}
            <button
              onClick={() => {
                setCollapsedFlyout(null);
                handleNewChat();
              }}
              title={$t("New chat (Ctrl+O)")}
              className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 opacity-75 hover:opacity-100 transition-colors cursor-pointer"
            >
              <SquarePen className="w-4 h-4" />
            </button>

            {/* Search */}
            <button
              onClick={() => {
                setCollapsedFlyout(null);
                setCommandPaletteOpen(true);
              }}
              title={$t("Search chats (Ctrl+K)")}
              className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 opacity-75 hover:opacity-100 transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Pinned Shortcut */}
            {pinnedChats.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCollapsedFlyout(collapsedFlyout === 'PINNED' ? null : 'PINNED');
                }}
                title={$t("Pinned chats ({0})",pinnedChats.length)}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                  collapsedFlyout === 'PINNED'
                    ? 'bg-black/10 dark:bg-white/15 text-amber-500 shadow-xs'
                    : 'hover:bg-black/5 dark:hover:bg-white/10 text-amber-500 opacity-85 hover:opacity-100'
                }`}
              >
                <Pin className="w-4 h-4 fill-amber-500" />
              </button>
            )}

            {/* Recents Shortcut */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCollapsedFlyout(collapsedFlyout === 'RECENTS' ? null : 'RECENTS');
              }}
              title={$t("Recent conversations")}
              style={collapsedFlyout === 'RECENTS' ? { color: 'var(--accent-color)' } : undefined}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                collapsedFlyout === 'RECENTS'
                  ? 'bg-black/10 dark:bg-white/15 shadow-xs'
                  : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-75 hover:opacity-100'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>

          {/* Collapsed Flyout Popover (Screenshots 1 & 2) */}
          {collapsedFlyout && (
            <div
              ref={flyoutRef}
              className="absolute left-16 z-50 w-72 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-2.5 animate-in fade-in zoom-in-95 duration-150 flex flex-col"
              style={{
                top: collapsedFlyout === 'PINNED' ? '125px' : '165px',
              }}
            >
              {collapsedFlyout === 'RECENTS' && (
                <>
                  <div className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 px-3 pt-1 pb-2">
                     <UiText source={"Recents"}/> </div>
                  <div className="max-h-80 overflow-y-auto space-y-0.5 pr-1">
                    {regularChats.length === 0 ? (
                      <div className="px-3 py-6 text-xs text-neutral-400 text-center">
                         <UiText source={"No conversations yet."}/> </div>
                    ) : (
                      regularChats.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setActiveChat(c.id);
                            setCollapsedFlyout(null);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-2xl text-xs transition-colors truncate block cursor-pointer ${
                            activeChatId === c.id
                              ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-white'
                              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                          }`}
                          dir="auto"
                        >
                          <span className="truncate">{c.title}</span>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}

              {collapsedFlyout === 'PINNED' && (
                <>
                  <div className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 px-3 pt-1 pb-2">
                     <UiText source={"Pinned"}/> </div>
                  <div className="max-h-80 overflow-y-auto space-y-0.5 pr-1">
                    {pinnedChats.length === 0 ? (
                      <div className="px-3 py-6 text-xs text-neutral-400 text-center">
                         <UiText source={"No pinned chats."}/> </div>
                    ) : (
                      pinnedChats.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setActiveChat(c.id);
                            setCollapsedFlyout(null);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs transition-colors truncate cursor-pointer ${
                            activeChatId === c.id
                              ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-white'
                              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                          }`}
                          dir="auto"
                        >
                          <MessageSquare className="w-3.5 h-3.5 opacity-60 shrink-0" />
                          <span className="truncate">{c.title}</span>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Bottom Expand & Settings */}
          <div className="flex flex-col items-center gap-2">
            <WorkspaceControls compact/>
            <button
              onClick={() => {
                setSettingsOpen(true);
              }}
              title={$t("Settings")}
              className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsCollapsed(false)}
              title={$t("Expand Sidebar")}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors cursor-pointer"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        </aside>
      ) : (
        <aside
          id="chat-drawer"
          className={`fixed lg:relative top-0 bottom-0 left-0 z-30 lg:z-30 w-72 flex flex-col border-r transition-transform duration-200 ease-in-out select-none bg-[var(--surface-color)] text-[var(--text-color)] shrink-0 ${
            isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
          style={{ borderColor: 'var(--border-color)' }}
        >
          {/* Header Actions */}
          <div className="p-3 border-b space-y-2.5" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between px-1">
              <PimxLogo size="xs" showText={true} />
              {/* Collapse sidebar trigger (Desktop) */}
              <button
                onClick={() => setIsCollapsed(true)}
                title={$t("Collapse Sidebar")}
                className="hidden lg:flex p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors cursor-pointer"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              {/* New Chat Button (Prominent ChatGPT style) */}
              <button
                id="btn-new-chat-drawer"
                onClick={handleNewChat}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-xs cursor-pointer bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span><UiText source={"New chat"}/></span>
                </div>
                <span className="text-[10px] opacity-60 font-mono"><UiText source={"Ctrl+O"}/></span>
              </button>
            </div>

            {/* Search bar */}
            <div
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs bg-neutral-100/70 dark:bg-neutral-800/70"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <Search className="w-3.5 h-3.5 opacity-50" />
              <input
                type="text"
                placeholder={$t("Search conversations...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent w-full focus:outline-none placeholder:text-neutral-400 text-xs text-inherit"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="opacity-60 hover:opacity-100 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

        {/* Navigation Section (ChatGPT Style: Library & Projects) */}
        <div className="px-2 py-2 border-b space-y-0.5" style={{ borderColor: 'var(--border-color)' }}>
          {/* Library */}
          <button
            id="btn-nav-library"
            onClick={() => {
              setViewMode('LIBRARY');
              onClose();
            }}
            style={
              viewMode === 'LIBRARY'
                ? {
                    backgroundColor: 'rgba(var(--accent-rgb), 0.12)',
                    color: 'var(--accent-color)',
                    borderColor: 'rgba(var(--accent-rgb), 0.3)',
                  }
                : undefined
            }
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${
              viewMode === 'LIBRARY'
                ? 'font-semibold border shadow-2xs'
                : 'opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <Files
                className="w-4 h-4"
                style={{ color: 'var(--accent-color)' }}
              />
              <span className="truncate font-medium"><UiText source={"Library"}/></span>
            </div>
          </button>

          {/* Projects */}
          <button
            id="btn-nav-projects-drawer"
            onClick={() => {
              setViewMode('PROJECTS_LIST');
              onClose();
            }}
            style={
              viewMode === 'PROJECTS_LIST' || viewMode === 'PROJECT_DETAIL'
                ? {
                    backgroundColor: 'rgba(var(--accent-rgb), 0.12)',
                    color: 'var(--accent-color)',
                    borderColor: 'rgba(var(--accent-rgb), 0.3)',
                  }
                : undefined
            }
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${
              viewMode === 'PROJECTS_LIST' || viewMode === 'PROJECT_DETAIL'
                ? 'font-semibold border shadow-2xs'
                : 'opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <FolderKanban
                className="w-4 h-4"
                style={{ color: 'var(--accent-color)' }}
              />
              <span className="truncate font-medium"><UiText source={"Projects"}/></span>
            </div>
            {projects.length > 0 && (
              <span
                style={{
                  backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                  color: 'var(--accent-color)',
                }}
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              >
                {projects.length}
              </span>
            )}
          </button>
        </div>

        {/* Active Project Filter indicator if user is focusing a project */}
        {activeProject && (
          <div
            style={{
              backgroundColor: 'rgba(var(--accent-rgb), 0.1)',
              borderColor: 'rgba(var(--accent-rgb), 0.25)',
            }}
            className="mx-2 mt-2 px-3 py-1.5 rounded-xl border flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm">{activeProject.emoji || 'ðŸ“'}</span>
              <span className="truncate font-medium" style={{ color: 'var(--accent-color)' }}>
                {activeProject.name}
              </span>
            </div>
            <button
              onClick={() => setActiveProject(null)}
              title={$t("Clear project filter")}
              style={{ color: 'var(--accent-color)' }}
              className="p-1 rounded-md hover:opacity-80 opacity-70 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {/* Pinned Chats */}
          {pinnedChats.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 opacity-50 flex items-center gap-1">
                <Pin className="w-3 h-3 rotate-45 text-amber-500" />
                <span><UiText source={"Pinned"}/></span>
              </div>
              <div className="space-y-1 mt-0.5">
                {pinnedChats.map((chat) => {
                  const pending = pendingDeletions[chat.id];
                  return (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={activeChatId === chat.id}
                      isEditing={editingId === chat.id}
                      editTitle={editTitle}
                      setEditTitle={setEditTitle}
                      pendingDeletion={pending}
                      projects={projects}
                      onAssignProject={(projId) => assignChatToProject(chat.id, projId)}
                      onCreateProject={() => setProjectModalOpen(true, null)}
                      onSelect={() => {
                        setActiveChat(chat.id);
                        onClose();
                      }}
                      onPin={(e) => {
                        e.stopPropagation();
                        pinChat(chat.id);
                      }}
                      onStartEdit={(e) => handleStartEdit(chat.id, chat.title, e)}
                      onSaveEdit={(e) => handleSaveEdit(chat.id, e)}
                      onCancelEdit={(e) => {
                        e.stopPropagation();
                        setEditingId(null);
                      }}
                      onShare={() => {
                        setExportModalOpen(true);
                      }}
                      onTriggerDelete={(e) => handleTriggerDelete(chat.id, e)}
                      onCancelDelete={(e) => handleCancelDelete(chat.id, e)}
                      onForceDeleteNow={(e) => handleForceDeleteNow(chat.id, e)}
                      isWorking={isChatWorking(chat.id)}
                      justFinished={isChatFresh(chat.id)}
                      icon={toolIcon(chat.toolMode)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Regular Chats */}
          <div>
            <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 px-2 py-1 flex items-center justify-between">
              <span>{activeProject ? `Project Chats (${regularChats.length})` : <UiText source={"Recents"}/>}</span>
            </div>
            {regularChats.length === 0 && pinnedChats.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs opacity-50 space-y-2">
                <p><UiText source={"No conversations found."}/></p>
                <button
                  onClick={handleNewChat}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span><UiText source={"Start New Chat"}/></span>
                </button>
              </div>
            ) : (
              <div className="space-y-1 mt-0.5">
                {regularChats.map((chat) => {
                  const pending = pendingDeletions[chat.id];
                  return (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={activeChatId === chat.id}
                      isEditing={editingId === chat.id}
                      editTitle={editTitle}
                      setEditTitle={setEditTitle}
                      pendingDeletion={pending}
                      projects={projects}
                      onAssignProject={(projId) => assignChatToProject(chat.id, projId)}
                      onCreateProject={() => setProjectModalOpen(true, null)}
                      onSelect={() => {
                        setActiveChat(chat.id);
                        onClose();
                      }}
                      onPin={(e) => {
                        e.stopPropagation();
                        pinChat(chat.id);
                      }}
                      onStartEdit={(e) => handleStartEdit(chat.id, chat.title, e)}
                      onSaveEdit={(e) => handleSaveEdit(chat.id, e)}
                      onCancelEdit={(e) => {
                        e.stopPropagation();
                        setEditingId(null);
                      }}
                      onShare={() => {
                        setExportModalOpen(true);
                      }}
                      onTriggerDelete={(e) => handleTriggerDelete(chat.id, e)}
                      onCancelDelete={(e) => handleCancelDelete(chat.id, e)}
                      onForceDeleteNow={(e) => handleForceDeleteNow(chat.id, e)}
                      isWorking={isChatWorking(chat.id)}
                      justFinished={isChatFresh(chat.id)}
                      icon={toolIcon(chat.toolMode)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-2 border-t space-y-1" style={{ borderColor: 'var(--border-color)' }}>
          <WorkspaceControls/>
          <button
            id="btn-open-workspace"
            onClick={() => {
              onOpenWorkspace();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <FolderKanban className="w-4 h-4 opacity-70" />
            <span><UiText source={"Workspace & Hub"}/></span>
          </button>

          <button
            id="btn-open-settings"
            onClick={() => {
              setSettingsOpen(true);
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 opacity-70" />
              <span><UiText source={"Settings & Providers"}/></span>
            </div>
            <span className="text-[10px] opacity-50 font-medium"><UiText source={"Configure"}/></span>
          </button>
        </div>
      </aside>
      )}
    </>
  );
}

function ChatItem({
  chat,
  isActive,
  isEditing,
  editTitle,
  setEditTitle,
  pendingDeletion,
  projects,
  onAssignProject,
  onCreateProject,
  onSelect,
  onPin,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onShare,
  onTriggerDelete,
  onCancelDelete,
  onForceDeleteNow,
  isWorking,
  justFinished,
  icon,
}: {
  chat: ChatEntity;
  isActive: boolean;
  isEditing: boolean;
  editTitle: string;
  setEditTitle: (s: string) => void;
  pendingDeletion?: PendingDeletion;
  projects: ProjectEntity[];
  onAssignProject: (projId: string | null) => void;
  onCreateProject: () => void;
  onSelect: () => void;
  onPin: (e: React.MouseEvent) => void;
  onStartEdit: (e: React.MouseEvent) => void;
  onSaveEdit: (e: React.MouseEvent) => void;
  onCancelEdit: (e: React.MouseEvent) => void;
  onShare: () => void;
  onTriggerDelete: (e: React.MouseEvent) => void;
  onCancelDelete: (e: React.MouseEvent) => void;
  onForceDeleteNow: (e: React.MouseEvent) => void;
  isWorking?: boolean;
  justFinished?: boolean;
  icon: React.ReactNode;
}) {
  const $t=useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProjectSubmenu, setShowProjectSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const chatProject = projects.find((p) => p.id === chat.projectId);

  // Close context menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
        setShowProjectSubmenu(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // If in 7-second delete countdown, render interactive undo banner with animated progress
  if (pendingDeletion) {
    const seconds = Math.ceil(pendingDeletion.secondsLeft);
    const progressPercent = (pendingDeletion.secondsLeft / 7) * 100;

    return (
      <div
        id={`chat-delete-pending-${chat.id}`}
        className="relative overflow-hidden rounded-2xl p-2.5 bg-red-500/10 dark:bg-red-950/40 border border-red-500/40 text-red-700 dark:text-red-300 transition-all shadow-sm animate-in fade-in slide-in-from-left duration-200"
      >
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            {/* Animated circular countdown icon */}
            <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-red-200 dark:text-red-900/50"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-red-500 transition-all duration-100"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
            <span className="truncate text-xs font-bold text-red-600 dark:text-red-400">
               <UiText source={"Deleting in"}/> {seconds}<UiText source={"s"}/> </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onCancelDelete}
              title={$t("Undo deletion")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-semibold text-[11px] shadow-xs transition-colors cursor-pointer border border-black/10 dark:border-white/10 active:scale-95"
            >
              <RotateCcw className="w-3 h-3 text-neutral-700 dark:text-neutral-300" />
              <span><UiText source={"Undo"}/></span>
            </button>
            <button
              onClick={onForceDeleteNow}
              title={$t("Delete immediately")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-[11px] shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Zap className="w-3 h-3 fill-white" />
              <span><UiText source={"Now"}/></span>
            </button>
          </div>
        </div>

        {/* Bottom smooth animated progress line */}
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-red-500 transition-all duration-100 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-all ${
        isActive
          ? 'font-medium bg-black/5 dark:bg-white/10 shadow-2xs text-inherit'
          : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-85 hover:opacity-100'
      } ${isWorking ? 'ring-1 ring-violet-500/50 bg-violet-500/[0.07] dark:bg-violet-500/[0.12]' : ''}`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {isWorking ? (
          <span className="relative flex w-3.5 h-3.5 shrink-0" title={$t("AI is working in this chat")}>
            <span className="absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-60 animate-ping" />
            <Loader2 className="relative w-3.5 h-3.5 text-violet-500 animate-spin" />
          </span>
        ) : justFinished ? (
          <span className="shrink-0 animate-in fade-in zoom-in-95" title={$t("Just finished")}>
            <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
          </span>
        ) : (
          <span className="shrink-0">{icon}</span>
        )}
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveEdit(e as any);
              if (e.key === 'Escape') onCancelEdit(e as any);
            }}
            autoFocus
            style={{ borderColor: 'var(--accent-color)' }}
            className="bg-black/5 dark:bg-white/10 rounded-lg px-2 py-0.5 border focus:outline-none! ring-0! outline-none! w-full text-xs text-inherit font-medium shadow-2xs"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            <span className="truncate">{chat.title}</span>
            {chatProject && (
              <span
                className="text-[11px] text-neutral-400 dark:text-neutral-500 font-normal shrink-0 truncate max-w-[100px]"
                title={$t("Project: {0}",chatProject.name)}
              >
                {chatProject.name}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons & Context Menu */}
      {isEditing ? (
        <div className="flex items-center gap-1 shrink-0 ml-1">
          <button onClick={onSaveEdit} className="p-1 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={onCancelEdit} className="p-1 hover:text-red-500 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-0.5 shrink-0 ml-1">
          {/* Pin Icon (always visible if pinned, or on hover) */}
          {chat.pinned ? (
            <button
              onClick={onPin}
              title={$t("Unpin chat")}
              className="p-1 text-amber-500 hover:text-amber-600 cursor-pointer"
            >
              <Pin className="w-3.5 h-3.5 fill-amber-500" />
            </button>
          ) : (
            <button
              onClick={onPin}
              title={$t("Pin chat")}
              className="p-1 opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity hidden sm:block cursor-pointer"
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
          )}

          {/* 3-dots Context Menu Button (ChatGPT Style - Screenshot 3) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              title={$t("Options")}
              className={`p-1 rounded-md transition-all cursor-pointer ${
                menuOpen
                  ? 'opacity-100 bg-black/10 dark:bg-white/15'
                  : 'opacity-0 group-hover:opacity-70 hover:opacity-100'
              }`}
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {/* Popup Context Menu */}
            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 z-50 w-48 rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-2xl p-1.5 text-xs text-neutral-800 dark:text-neutral-200 animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 1. Share */}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onShare();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left cursor-pointer"
                >
                  <Share2 className="w-4 h-4 opacity-70" />
                  <span><UiText source={"Share"}/></span>
                </button>

                {/* 2. Rename */}
                <button
                  onClick={(e) => {
                    setMenuOpen(false);
                    onStartEdit(e);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left cursor-pointer"
                >
                  <Edit2 className="w-4 h-4 opacity-70" />
                  <span><UiText source={"Rename"}/></span>
                </button>

                {/* 3. Pin / Unpin */}
                <button
                  onClick={(e) => {
                    setMenuOpen(false);
                    onPin(e);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left cursor-pointer"
                >
                  <Pin className={`w-4 h-4 ${chat.pinned ? 'fill-amber-500 text-amber-500' : 'opacity-70'}`} />
                  <span>{chat.pinned ? <UiText source={"Unpin"}/> : <UiText source={"Pin chat"}/>}</span>
                </button>

                {/* 4. Move to Project (Hover flyout & click toggle) */}
                <div
                  className="relative"
                  onMouseEnter={() => setShowProjectSubmenu(true)}
                  onMouseLeave={() => setShowProjectSubmenu(false)}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowProjectSubmenu(!showProjectSubmenu);
                    }}
                    style={
                      showProjectSubmenu
                        ? { color: 'var(--accent-color)' }
                        : undefined
                    }
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-colors text-left cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <div className="flex items-center gap-2.5">
                      <Folder className="w-4 h-4 opacity-70" />
                      <span><UiText source={"Move to Project"}/></span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                  </button>

                  {showProjectSubmenu && (
                    <div
                      className="absolute left-full top-0 ml-1.5 z-[100] w-52 rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-2xl p-1.5 text-xs text-neutral-800 dark:text-neutral-200 animate-fadeIn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-2 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                         <UiText source={"Select Project"}/> </div>

                      {/* General (Remove from project) */}
                      <button
                        type="button"
                        onClick={() => {
                          onAssignProject(null);
                          setMenuOpen(false);
                          setShowProjectSubmenu(false);
                        }}
                        style={
                          !chat.projectId
                            ? {
                                backgroundColor: 'rgba(var(--accent-rgb), 0.12)',
                                color: 'var(--accent-color)',
                              }
                            : undefined
                        }
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-xl text-left text-xs cursor-pointer transition-colors ${
                          !chat.projectId
                            ? 'font-semibold'
                            : 'hover:bg-black/5 dark:hover:bg-white/10'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>ðŸ“</span>
                          <span><UiText source={"General (No project)"}/></span>
                        </span>
                        {!chat.projectId && <Check className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />}
                      </button>

                      {/* Projects List */}
                      {projects.length > 0 ? (
                        <div className="max-h-40 overflow-y-auto space-y-0.5 my-1 scrollbar-thin">
                          {projects.map((p) => {
                            const isCurrent = chat.projectId === p.id;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  onAssignProject(p.id);
                                  setMenuOpen(false);
                                  setShowProjectSubmenu(false);
                                }}
                                style={
                                  isCurrent
                                    ? {
                                        backgroundColor: 'rgba(var(--accent-rgb), 0.12)',
                                        color: 'var(--accent-color)',
                                      }
                                    : undefined
                                }
                                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-xl text-left text-xs truncate cursor-pointer transition-colors ${
                                  isCurrent
                                    ? 'font-semibold'
                                    : 'hover:bg-black/5 dark:hover:bg-white/10'
                                }`}
                              >
                                <span className="flex items-center gap-2 truncate">
                                  <span>{p.emoji || 'ðŸ“'}</span>
                                  <span className="truncate">{p.name}</span>
                                </span>
                                {isCurrent && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-color)' }} />}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="px-2 py-2 text-[11px] text-neutral-400 text-center italic">
                           <UiText source={"No projects yet"}/> </div>
                      )}

                      <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />

                      {/* Create New Project Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setShowProjectSubmenu(false);
                          onCreateProject();
                        }}
                        style={{ color: 'var(--accent-color)' }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-left text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <FolderPlus className="w-3.5 h-3.5 shrink-0" />
                        <span><UiText source={"Create New Project"}/></span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />

                {/* 5. Delete (Red) */}
                <button
                  onClick={(e) => {
                    setMenuOpen(false);
                    onTriggerDelete(e);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors text-left cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span><UiText source={"Delete"}/></span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
