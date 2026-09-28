'use client';

import React, { useState, useEffect,useContext,useCallback } from 'react';
import {WorkspaceContext,OPEN_TRANSFER} from '../security/WorkspaceControls';
import {TransferModal} from '../security/TransferModal';
import { useAppStore } from '@/lib/store/useAppStore';
import { ThemeApplier } from './ThemeApplier';
import { ResizableWorkspace } from './ResizableWorkspace';
import { PimxPet } from './PimxPet';
import { ChatDrawer } from '../drawer/ChatDrawer';
import { MessageList, EmptyChatHero } from '../chat/MessageList';
import { Composer } from '../chat/Composer';
import { ActiveToolStrip } from '../chat/ActiveToolStrip';
import { ModelPickerModal } from '../chat/ModelPickerModal';
import { CompareModal } from '../chat/CompareModal';
import { CouncilModal } from '../chat/CouncilModal';
import { CommandPalette } from '../chat/CommandPalette';
import { ExportModal } from '../chat/ExportModal';
import { VoiceModal } from '../voice/VoiceModal';
import { SettingsModal } from '../settings/SettingsModal';
import { WorkspaceModal } from '../tools/WorkspaceModal';
import { ProjectModal } from '../projects/ProjectModal';
import { ProjectsView } from '../projects/ProjectsView';
import { LibraryView } from '../library/LibraryView';
import { ProviderConfigModal } from '../providers/ProviderConfigModal';
import { ProviderLogo } from '../ui/ProviderLogo';
import { NetworkStatusBanner } from '../ui/NetworkStatusBanner';
import { ChatOptionsMenu } from '../chat/ChatOptionsMenu';
import { ChatEntity } from '@/lib/types';

// Right tool side-panels
import { CanvasPanel } from '../tools/CanvasPanel';
import { ArtifactsPanel } from '../tools/ArtifactsPanel';
import { WebDevPanel } from '../tools/WebDevPanel';
import { SourceQaPanel } from '../tools/SourceQaPanel';
import { ResearchDebatePanel } from '../tools/ResearchDebatePanel';
import { LearnPanel } from '../tools/LearnPanel';
import { SlidesPanel } from '../tools/SlidesPanel';

import {
  Menu,
  Sparkles,
  Download,
  Search,
  Settings,
  FolderKanban,
  SlidersHorizontal,
  Bot,
  EyeOff,
  ChevronRight,
  Folder,
  Files,
  ShieldAlert,
  Share2,
  Check,
  Plus,
  ArrowLeftRight,
  ChevronLeft,
  PanelRightOpen,
} from 'lucide-react';
import {UiText,useT,useLocale} from '@/components/i18n/LocaleProvider';

export function AppShell() {
  const $t=useT(),locale=useLocale(),prefix=locale==='fa'?'/fa':'';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const workspace=useContext(WorkspaceContext),[transferOpen,setTransferOpen]=useState(false);
  const closeTransfer=useCallback(()=>setTransferOpen(false),[]);
  useEffect(()=>{const open=()=>{setTransferOpen(true);setDrawerOpen(false);};window.addEventListener(OPEN_TRANSFER,open);return()=>window.removeEventListener(OPEN_TRANSFER,open);},[]);

  const {
    workspaceModalOpen,
    setWorkspaceModalOpen,
    activeChatId,
    chats,
    selectedModelIds,
    models,
    activeToolPanel,
    setActiveToolPanel,
    setModelPickerOpen,
    setCommandPaletteOpen,
    setExportModalOpen,
    setSettingsOpen,
    projects,
    setProjectModalOpen,
    viewMode,
    setViewMode,
    getActivePath,
    toggleTemporaryChat,
    hydrateFromStorage,
    setActiveChat,
    createChat,
    setActiveProject,
    chatDirection,
    toggleChatDirection,
  } = useAppStore();

  const [copiedLink, setCopiedLink] = useState(false);
  const [shareError,setShareError]=useState('');
  const initialUrlChecked = React.useRef(false);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  // Synchronize active conversation with dedicated URL path on mount only
  useEffect(() => {
    if (typeof window === 'undefined' || initialUrlChecked.current) return;
    initialUrlChecked.current = true;

    const pathname = window.location.pathname.replace(/^\/fa(?=\/|$)/,'') || '/';

    let targetIdFromUrl: string | null = null;
    if (pathname.startsWith('/chat/')) {
      targetIdFromUrl = pathname.replace('/chat/', '').split('/')[0].split('?')[0];
    } else {
      const params = new URLSearchParams(window.location.search);
      targetIdFromUrl = params.get('c');
    }

    if (targetIdFromUrl) {
      const exists = chats.some((c) => c.id === targetIdFromUrl);
      if (exists) {
        setActiveChat(targetIdFromUrl);
      } else {
        fetch(`/api/share?id=${targetIdFromUrl}`)
          .then((res) => res.json())
          .then((data) => {
            if (data?.snapshot) {
              const snap = data.snapshot;
              const newChat: ChatEntity = {
                id: snap.id || targetIdFromUrl!,
                title: snap.title || 'Shared Conversation',
                modelIds: [snap.modelId || 'gemini-2.0-flash'],
                systemPrompt: snap.systemPrompt,
                toolMode: snap.toolMode || 'NONE',
                activeTools: snap.toolMode && snap.toolMode !== 'NONE' ? [snap.toolMode] : [],
                projectId: snap.projectId,
                createdAt: snap.createdAt || Date.now(),
                updatedAt: Date.now(),
              };
              const msgs = snap.messages || [];
              useAppStore.setState((s) => ({
                chats: [newChat, ...s.chats.filter((c) => c.id !== newChat.id)],
                messages: { ...s.messages, [newChat.id]: msgs },
                activeChatId: newChat.id,
                viewMode: 'CHAT',
              }));
            }
          })
          .catch(() => {});
      }
    }
  }, [chats, setActiveChat]);

  // Keep browser URL pathname in sync with conversation without overriding activeChatId
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const pathname = window.location.pathname;
    const activeMsgs = activeChatId ? getActivePath(activeChatId) : [];
    if (!activeChatId || activeMsgs.length === 0) {
      if (pathname.startsWith('/chat/')) {
        window.history.replaceState(null, '', prefix+'/chat');
      }
    } else {
      const targetPath = prefix+`/chat/${activeChatId}`;
      if (window.location.pathname !== targetPath && !pathname.startsWith('/share/')) {
        window.history.replaceState(null, '', targetPath);
      }
    }
  }, [activeChatId, getActivePath]);

  const currentChat = chats.find((c) => c.id === activeChatId);
  const primaryModelId = currentChat?.modelIds?.[0] || selectedModelIds[0];
  const primaryModel = models.find((m) => m.id === primaryModelId);
  const currentProject = projects.find((p) => p.id === currentChat?.projectId);

  const activeMessages = activeChatId ? getActivePath(activeChatId) : [];
  const isChatEmpty = activeMessages.length === 0;

  const isPanelOpen = activeToolPanel !== 'NONE';
  const [isMounted, setIsMounted] = useState(isPanelOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [activePanelTool, setActivePanelTool] = useState(activeToolPanel);

  useEffect(() => {
    if (isPanelOpen) {
      setActivePanelTool(activeToolPanel);
      setIsClosing(false);
      setIsMounted(true);
    } else if (isMounted) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsMounted(false);
        setIsClosing(false);
      }, 320);
      return () => clearTimeout(timer);
    }
  }, [isPanelOpen, activeToolPanel]);
  const isProjectsView = viewMode === 'PROJECTS_LIST' || viewMode === 'PROJECT_DETAIL';
  const isLibraryView = viewMode === 'LIBRARY';

  return (
    <div id="app-shell" className="relative flex h-dvh w-full overflow-hidden bg-[var(--bg-color)] text-[var(--text-color)]">
      <ThemeApplier />
      <NetworkStatusBanner />

      {/* Left Chat History Drawer */}
      <ChatDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenWorkspace={() => setWorkspaceModalOpen(true)}
      />

      {/* Main Chat & Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-0">
        <PimxPet />
        {/* Mobile Floating Drawer Toggle Button */}
        <button
          id="btn-toggle-drawer"
          onClick={() => setDrawerOpen(!drawerOpen)}
          className={`absolute top-3.5 left-4 z-20 p-2 rounded-xl border border-black/10 dark:border-white/10 bg-[var(--surface-color)]/80 hover:bg-[var(--surface-color)] backdrop-blur-md shadow-xs transition-all lg:hidden cursor-pointer text-[var(--text-color)] ${isMounted ? 'hidden' : ''}`}
          title={$t("Open Navigation Drawer")}
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Center Split: Chat Stream or Projects View or Library View + Optional Tool Side Panel */}
        <div
          key={`${viewMode}-${activeChatId || 'empty'}`}
          className="flex-1 flex overflow-hidden animate-page-in"
        >
          {isLibraryView ? (
            <LibraryView />
          ) : isProjectsView ? (
            <ProjectsView />
          ) : (
            <>
              {/* Chat Stream Section */}
              <main
                dir={chatDirection}
                className={`flex-1 flex flex-col h-full min-w-0 overflow-hidden relative transition-colors duration-500 ${
                  currentChat?.temporary ? 'bg-amber-500/[0.015] dark:bg-amber-500/[0.025]' : ''
                }`}
              >
                {/* Top Header Floating Controls Area (Directly inside Chat Column, never overlapping Workspace) */}
                <div className="absolute top-0 right-0 left-0 h-16 z-20 pointer-events-none flex items-center justify-end px-4 bg-gradient-to-b from-[var(--bg-color)] via-[var(--bg-color)]/70 to-transparent">
                  <div className="flex items-center gap-2 pointer-events-auto max-w-[calc(100%-2rem)] select-none">
                    {/* Compact Active Tool / Persona Pill - Right alongside the 3 buttons! */}
                    {!isChatEmpty && <ActiveToolStrip />}

                  {/* 1. When Chat is Empty: Show ONLY Temporary Chat Toggle */}
                  {!isProjectsView && !isLibraryView && isChatEmpty && (
                    <button
                      id="btn-temporary-chat-toggle"
                      onClick={toggleTemporaryChat}
                      title={$t(currentChat?.temporary ? 'Temporary chat is active (will not be saved)' : 'Enable Temporary / Incognito Chat')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border backdrop-blur-md transition-all duration-300 active:scale-90 cursor-pointer ${
                        currentChat?.temporary
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-700 dark:text-amber-300 shadow-sm temporary-glow-pulse ring-2 ring-amber-500/20 scale-[1.02]'
                          : 'bg-[var(--surface-color)]/70 hover:bg-[var(--surface-color)] border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-300 opacity-80 hover:opacity-100 shadow-2xs hover:scale-[1.02]'
                      }`}
                    >
                      <EyeOff className={`w-3.5 h-3.5 transition-transform duration-300 ${currentChat?.temporary ? 'text-amber-500 rotate-12 scale-110' : ''}`} />
                      <span><UiText source={"Temporary"}/></span>
                      {currentChat?.temporary && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse ml-0.5" />
                      )}
                    </button>
                  )}

                  {/* 2. When Chat has Messages (After First Message): Show Share and 3-Dots Menu */}
                  {!isProjectsView && !isLibraryView && !isChatEmpty && (
                    <>
                      {/* Share Button (Exact match with reference image) */}
                      <button
                        id="btn-nav-share"
                        onClick={async () => {
                          if (activeChatId && currentChat && typeof window !== 'undefined') {
                            setShareError('');
                            try {
                              const res = await fetch('/api/share', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  title: currentChat.title,
                                  messages: activeMessages,
                                  modelId: currentChat.modelIds?.[0] || primaryModelId,
                                  systemPrompt: currentChat.systemPrompt,
                                  toolMode: currentChat.toolMode,
                                  projectId: currentChat.projectId,
                                  projectName: currentProject?.name,
                                }),
                              });
                              if (res.ok) {
                                const data = await res.json();
                                if (data.shareUrl) {
                                  navigator.clipboard.writeText(data.shareUrl);
                                  setCopiedLink(true);
                                  setTimeout(() => setCopiedLink(false), 2500);
                                  return;
                                }
                              }
                            } catch (e) {
                              console.error('Failed to create share link:', e);
                            }
                            setShareError('Could not create a shared link. Try again.');

                          }
                        }}
                        title={$t("Share Conversation")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-[var(--surface-color)]/70 hover:bg-[var(--surface-color)] backdrop-blur-md transition-all text-neutral-700 dark:text-neutral-300 text-xs font-medium cursor-pointer shadow-2xs opacity-85 hover:opacity-100"
                      >
                        {copiedLink ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold"><UiText source={"Link Copied!"}/></span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5" />
                            <span className="text-xs font-semibold"><UiText source={"Share"}/></span>
                          </>
                        )}
                      </button>

                      {/* 3-Dots Context Menu (Exact match with reference image) */}
                      {activeChatId && <ChatOptionsMenu chatId={activeChatId} />}
                    </>
                  )}

                  {/* Direction Toggle (LTR / RTL) */}
                  <button
                    id="btn-toggle-direction"
                    onClick={toggleChatDirection}
                    className="px-2.5 py-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-[var(--surface-color)]/70 hover:bg-[var(--surface-color)] backdrop-blur-md text-xs font-bold font-mono transition-all cursor-pointer shadow-2xs flex items-center gap-1 opacity-85 hover:opacity-100 text-neutral-700 dark:text-neutral-300"
                    title={$t("Switch layout direction to {0}",chatDirection === 'rtl' ? 'LTR (Left to Right)' : 'RTL (Right to Left)')}
                  >
                    <ArrowLeftRight className="w-3 h-3 opacity-60" />
                    <span>{chatDirection.toUpperCase()}</span>
                  </button>
                </div>
              </div>

                {/* Temporary Chat Active Pill Indicator */}
                {currentChat?.temporary && !isProjectsView && !isLibraryView && (
                  <div className="hidden md:block absolute top-3.5 left-1/2 -translate-x-1/2 z-20 animate-temporary-banner select-none pointer-events-none">
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-700 dark:text-amber-300 text-[10px] sm:text-[11px] font-semibold backdrop-blur-md shadow-xs">
                      <EyeOff className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="hidden md:inline"><UiText source={"Temporary Chat • Messages not saved to history"}/></span>
                      <span className="md:hidden"><UiText source={"Temporary Chat"}/></span>
                    </div>
                  </div>
                )}

                {/* Floating Restore Button for Minimized Workspace Panel (Only when chat has active content) */}
                {currentChat?.toolMode &&
                  ['CANVAS', 'SLIDES', 'ARTIFACTS', 'WEB_DEV', 'SOURCE_QA', 'DEEP_RESEARCH', 'DEBATE', 'LEARN'].includes(
                    currentChat.toolMode
                  ) &&
                  !isChatEmpty &&
                  !isPanelOpen && (
                    <button
                      id="btn-floating-workspace-restore"
                      onClick={() => setActiveToolPanel(currentChat.toolMode)}
                      style={{
                        backgroundColor: 'var(--accent-color, #8B5CF6)',
                        color: 'var(--accent-contrast, #ffffff)',
                        boxShadow:
                          '0 4px 18px var(--accent-glow, rgba(139, 92, 246, 0.4)), -2px 0 12px var(--accent-subtle, rgba(139, 92, 246, 0.2))',
                      }}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-30 flex items-center gap-1.5 py-2 px-2.5 rounded-l-xl transition-all duration-300 cursor-pointer group border-y border-l border-white/30 hover:scale-105 hover:pr-3.5 active:scale-95 shadow-xl animate-fade-in"
                      title={$t("Open Workspace Panel ({0})",currentChat.toolMode)}
                    >
                      <PanelRightOpen className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                      <span className="text-[11px] font-bold tracking-wide select-none [writing-mode:vertical-lr] py-1 uppercase">
                         <UiText source={"Workspace"}/> </span>
                    </button>
                  )}
                {isChatEmpty ? (
                  <div className="flex-1 overflow-y-auto flex flex-col items-center p-3 sm:p-6 w-full">
                    <div className="w-full max-w-3xl flex flex-col items-center my-auto space-y-6">
                      {/* Welcome Hero */}
                      <EmptyChatHero key={currentChat?.temporary ? 'temporary' : 'saved'} currentProject={currentProject} currentChat={currentChat} />

                      {/* Textbox always centered when chat is empty */}
                      <div className="w-full">
                        <Composer />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <MessageList />
                    <Composer />
                  </>
                )}
              </main>

              {/* Mobile Backdrop Blur Overlay */}
              {isMounted && !isClosing && (
                <div
                  onClick={() => setActiveToolPanel('NONE')}
                  className="fixed inset-0 z-25 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity duration-300 animate-fade-in"
                  aria-hidden="true"
                />
              )}

              {/* Split Right Side Panel for Tool Workspaces with Guaranteed Smooth Slide Animation */}
              {isMounted && (
                <ResizableWorkspace closing={isClosing}>
                  <div className="w-full h-full flex flex-col relative workspace-content-glide">
                    {/* Delicate glowing accent edge line on left border */}
                    <div
                      className="absolute top-0 left-0 bottom-0 w-[2.5px] pointer-events-none z-30 animate-workspace-glow"
                      style={{
                        background:
                          'linear-gradient(180deg, transparent 0%, var(--accent-color) 20%, var(--accent-color) 80%, transparent 100%)',
                        boxShadow: '0 0 12px var(--accent-color)',
                      }}
                    />

                    {activePanelTool === 'CANVAS' && <CanvasPanel onClose={() => setActiveToolPanel('NONE')} />}
                    {activePanelTool === 'SLIDES' && <SlidesPanel onClose={() => setActiveToolPanel('NONE')} />}
                    {activePanelTool === 'ARTIFACTS' && <ArtifactsPanel onClose={() => setActiveToolPanel('NONE')} />}
                    {activePanelTool === 'WEB_DEV' && <WebDevPanel onClose={() => setActiveToolPanel('NONE')} />}
                    {activePanelTool === 'SOURCE_QA' && <SourceQaPanel onClose={() => setActiveToolPanel('NONE')} />}
                    {(activePanelTool === 'DEEP_RESEARCH' || activePanelTool === 'DEBATE') && (
                      <ResearchDebatePanel onClose={() => setActiveToolPanel('NONE')} />
                    )}
                    {activePanelTool === 'LEARN' && <LearnPanel onClose={() => setActiveToolPanel('NONE')} />}
                  </div>
                </ResizableWorkspace>
              )}
            </>
          )}
        </div>
      </div>

      {shareError && <div role="alert" className="fixed top-16 left-1/2 -translate-x-1/2 z-[160] max-w-[90vw] rounded-xl bg-red-50 border border-red-200 text-red-800 p-3 text-xs">{shareError}<button className="ms-3" onClick={()=>setShareError('')}><UiText source={"Dismiss"}/></button></div>}
      {/* Global Modals */}
      <ModelPickerModal />
      <CompareModal />
      <CouncilModal />
      <ProviderConfigModal />
      <ProjectModal />
      <CommandPalette />
      <ExportModal />
      <VoiceModal />
      <SettingsModal />
      {transferOpen&&workspace?.id&&<TransferModal id={workspace.id} onClose={closeTransfer}/>}
      <WorkspaceModal isOpen={workspaceModalOpen} onClose={() => setWorkspaceModalOpen(false)} />
    </div>
  );
}
