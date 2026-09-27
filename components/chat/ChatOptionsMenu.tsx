'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  MoreHorizontal,
  FolderPlus,
  Pin,
  PinOff,
  Archive,
  Trash2,
  Folder,
  Files,
  ChevronRight,
  Share2,
  Check,
  Plus,
} from 'lucide-react';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

interface ChatOptionsMenuProps {
  chatId: string;
}

export function ChatOptionsMenu({ chatId }: { chatId: string }) {
  const $t=useT();
  const [isOpen, setIsOpen] = useState(false);
  const [showProjectSubmenu, setShowProjectSubmenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError,setShareError]=useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    chats,
    projects,
    pinChat,
    deleteChat,
    setProjectModalOpen,
    setViewMode,
    updateChat,
    setActiveProject,
    getActivePath,
  } = useAppStore();

  const chat = chats.find((c) => c.id === chatId);
  const isPinned = chat?.pinned || false;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowProjectSubmenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShareLink = async () => {
    if (!chat) return;setShareError('');
    const activeMsgs = getActivePath(chat.id);
    const proj = projects.find((p) => p.id === chat.projectId);

    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: chat.title,
          messages: activeMsgs,
          modelId: chat.modelIds?.[0] || 'gemini-2.5-flash',
          systemPrompt: chat.systemPrompt,
          toolMode: chat.toolMode,
          projectId: chat.projectId,
          projectName: proj?.name,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.shareUrl) {
          navigator.clipboard.writeText(data.shareUrl);
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
            setIsOpen(false);
          }, 1500);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to create share link:', e);
    }

    setShareError('Could not create a shared link. Try again.');
  };

  const handleMoveToProject = (projectId?: string) => {
    if (chat) {
      updateChat(chat.id, { projectId });
      if (projectId) { setActiveProject(projectId); setViewMode('PROJECT_DETAIL', projectId); }
    }
    setIsOpen(false);
    setShowProjectSubmenu(false);
  };

  const handleNewProject = () => {
    setIsOpen(false);
    setShowProjectSubmenu(false);
    setProjectModalOpen(true, null, chatId);
  };

  const handleDelete = () => {
    setDeleteOpen(true); setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {shareError && <p role="alert" className="absolute end-0 top-12 z-50 bg-[var(--surface-color)] rounded-xl border border-red-300 p-3 w-60 text-xs text-red-600">{shareError}</p>}
      {deleteOpen && <ConfirmDialog title={$t("Delete conversation")} description={$t("This conversation and its saved messages will be removed from your history.")} confirmLabel={$t("Delete conversation")} onClose={() => setDeleteOpen(false)} onConfirm={() => { deleteChat(chatId); setDeleteOpen(false); }} />}
      <button
        id="btn-chat-3dots-menu"
        onClick={() => setIsOpen(!isOpen)}
        title={$t("More conversation options")}
        className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors opacity-75 hover:opacity-100 cursor-pointer"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          id="chat-options-dropdown"
          className="absolute right-0 top-full mt-1.5 w-52 rounded-2xl bg-white dark:bg-neutral-900 border shadow-2xl p-1.5 z-50 text-xs animate-fadeIn space-y-0.5"
          style={{ borderColor: 'var(--border-color)' }}
        >
          {/* Copy Shareable Link */}
          <button
            onClick={handleShareLink}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer text-left font-medium"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500 shrink-0" /> : <Share2 className="w-4 h-4 opacity-70 shrink-0" />}
            <span>{copied ? <UiText source={"Share Link Copied!"}/> : <UiText source={"Share Conversation"}/>}</span>
          </button>

          {/* View files in chat */}
          <button
            onClick={() => {
              setViewMode('LIBRARY');
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer text-left font-medium"
          >
            <Files className="w-4 h-4 opacity-70 shrink-0" />
            <span><UiText source={"View files in chat"}/></span>
          </button>

          {/* Pin / Unpin chat */}
          <button
            onClick={() => {
              pinChat(chatId);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer text-left font-medium"
          >
            {isPinned ? <PinOff className="w-4 h-4 text-amber-500 shrink-0" /> : <Pin className="w-4 h-4 opacity-70 shrink-0" />}
            <span>{isPinned ? <UiText source={"Unpin chat"}/> : <UiText source={"Pin chat"}/>}</span>
          </button>

          {/* Archive chat */}
          <button
            onClick={() => {
              if (chat) {
                updateChat(chat.id, { temporary: true });
              }
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer text-left font-medium"
          >
            <Archive className="w-4 h-4 opacity-70 shrink-0" />
            <span><UiText source={"Archive"}/></span>
          </button>

          {/* Delete chat */}
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors cursor-pointer text-left font-medium"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span><UiText source={"Delete"}/></span>
          </button>

          <div className="my-1 border-t border-black/5 dark:border-white/5" />

          {/* Move to project item with flyout submenu on hover / click */}
          <div
            className="relative"
            onMouseEnter={() => setShowProjectSubmenu(true)}
            onMouseLeave={() => setShowProjectSubmenu(false)}
          >
            <button
              onClick={() => setShowProjectSubmenu(true)}
              aria-expanded={showProjectSubmenu}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer text-left font-medium"
            >
              <div className="flex items-center gap-2.5">
                <Folder className="w-4 h-4 opacity-70 shrink-0" />
                <span><UiText source={"Move to project"}/></span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            {/* Submenu flyout */}
            {showProjectSubmenu && (
              <div
                id="project-sub-menu"
                className="relative mt-1 w-full lg:absolute lg:right-full lg:top-0 lg:mr-1.5 lg:mt-0 lg:w-48 rounded-2xl bg-white dark:bg-neutral-900 border shadow-2xl p-1.5 z-50 text-xs animate-fadeIn space-y-0.5 max-h-56 overflow-y-auto"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <button
                  onClick={handleNewProject}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold transition-colors cursor-pointer text-left"
                >
                  <Plus className="w-4 h-4" />
                  <span><UiText source={"New project"}/></span>
                </button>

                {chat?.projectId && (
                  <button
                    onClick={() => handleMoveToProject(undefined)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 font-medium transition-colors cursor-pointer text-left text-[11px]"
                  >
                    <span><UiText source={"Remove from project"}/></span>
                  </button>
                )}

                {projects.length > 0 && (
                  <div className="pt-1 border-t border-black/5 dark:border-white/5 space-y-0.5 max-h-48 overflow-y-auto">
                    {projects.map((proj) => {
                      const isSelected = chat?.projectId === proj.id;
                      return (
                        <button
                          key={proj.id}
                          onClick={() => handleMoveToProject(proj.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 font-semibold'
                              : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span>{proj.emoji || '📁'}</span>
                            <span className="truncate">{proj.name}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
