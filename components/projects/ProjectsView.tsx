'use client';

import React, { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  Folder,
  FolderPlus,
  Search,
  Plus,
  MoreHorizontal,
  MessageSquare,
  FileText,
  Clock,
  Sparkles,
  ArrowLeft,
  Share2,
  Trash2,
  Edit3,
  ExternalLink,
  ChevronRight,
  Brain,
  Globe,
  Upload,
  Send,
  Sliders,
  Layers,
  Shield,
  LayoutGrid,
  List,
  Check,
} from 'lucide-react';
import { ProjectEntity, ChatEntity, SourceEntity } from '@/lib/types';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

function formatProjectDate(timestamp: number): string {
  if (!timestamp) return 'Recently';
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ProjectsView() {
  const { viewMode, viewProjectId, projects } = useAppStore();

  const currentProject = projects.find((p) => p.id === viewProjectId);

  if (viewMode === 'PROJECT_DETAIL' && currentProject) {
    return <ProjectDetailView project={currentProject} />;
  }

  return <ProjectsListView />;
}

function ProjectsListView() {
  const $t=useT();
  const { projects, chats, sources, setViewMode, setProjectModalOpen, setActiveProject, deleteProject } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE_CHATS' | 'KNOWLEDGE' | 'ISOLATED_MEMORY'>('ALL');
  const [viewStyle, setViewStyle] = useState<'GRID' | 'LIST'>('GRID');
  const [activeMenuProjectId, setActiveMenuProjectId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectEntity | null>(null);

  // Aggregated studio metrics
  const totalProjectChats = chats.filter((c) => !!c.projectId).length;
  const totalProjectSources = sources.filter((s) => projects.some((p) => p.id === s.chatId)).length;

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'ACTIVE_CHATS') {
      return chats.some((c) => c.projectId === p.id);
    }
    if (filterTab === 'KNOWLEDGE') {
      return sources.some((s) => s.chatId === p.id);
    }
    if (filterTab === 'ISOLATED_MEMORY') {
      return p.memoryScope === 'PROJECT_ONLY';
    }
    return true;
  });

  return (
    <div id="projects-list-view" className="flex-1 h-full overflow-y-auto bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col">
      {deleteTarget && <ConfirmDialog title={$t("Delete project")} description={$t("Delete “{0}”? Its conversations will remain in your chat history, outside this project.",deleteTarget.name)} confirmLabel={$t("Delete project")} onClose={() => setDeleteTarget(null)} onConfirm={() => { deleteProject(deleteTarget.id); setDeleteTarget(null); }} />}
      {/* Top Header - Unified container sizing */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-16 lg:pt-8 pb-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pl-14 lg:pl-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <span><UiText source={"Projects Studio"}/></span>
              <span
                className="text-xs px-2.5 py-0.5 rounded-full font-semibold border"
                style={{
                  backgroundColor: 'rgba(var(--accent-rgb), 0.12)',
                  borderColor: 'rgba(var(--accent-rgb), 0.25)',
                  color: 'var(--accent-color)',
                }}
              >
                {projects.length} {projects.length === 1 ? <UiText source={"project"}/> : <UiText source={"projects"}/>}
              </span>
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xl leading-relaxed">
               <UiText source={"Organized AI workspaces with dedicated system instructions, curated knowledge sources, and scoped memory."}/> </p>
          </div>

          {/* Quick Create Project Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-new-project-top"
              onClick={() => setProjectModalOpen(true, null)}
              style={{ backgroundColor: 'var(--accent-color)' }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-sm transition-all hover:opacity-95 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span><UiText source={"Create Project"}/></span>
            </button>
          </div>
        </div>

        {/* Executive Studio KPI Cards Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between shadow-2xs">
            <div>
              <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400"><UiText source={"Total Workspaces"}/></div>
              <div className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">{projects.length}</div>
            </div>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
              style={{
                backgroundColor: 'rgba(var(--accent-rgb), 0.12)',
                color: 'var(--accent-color)',
              }}
            >
              <Folder className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between shadow-2xs">
            <div>
              <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400"><UiText source={"Linked Conversations"}/></div>
              <div className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">{totalProjectChats}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between shadow-2xs">
            <div>
              <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400"><UiText source={"Knowledge Files"}/></div>
              <div className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">{totalProjectSources}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Search, Filter Categories & Grid/List View Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Projects' },
              { id: 'ACTIVE_CHATS', label: 'Active Chats' },
              { id: 'KNOWLEDGE', label: 'Knowledge Bases' },
              { id: 'ISOLATED_MEMORY', label: 'Isolated Memory' },
            ].map((f) => {
              const isActive = filterTab === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilterTab(f.id as any)}
                  style={isActive ? {
                    backgroundColor: 'var(--accent-color)',
                    color: '#ffffff',
                  } : undefined}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'shadow-xs font-semibold'
                      : 'bg-neutral-200/70 dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {<UiText source={f.label}/>}
                </button>
              );
            })}
          </div>

          {/* Right Controls: Search Box & View Style Toggle */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={$t("Search projects...")}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-8 pr-8 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-[var(--accent-color)] transition-colors shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Grid vs List View Toggle */}
            <div className="flex items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-0.5 shadow-2xs shrink-0">
              <button
                onClick={() => setViewStyle('GRID')}
                style={viewStyle === 'GRID' ? {
                  backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                  color: 'var(--accent-color)',
                } : undefined}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewStyle === 'GRID' ? 'font-semibold' : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                }`}
                title={$t("Studio Grid View")}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewStyle('LIST')}
                style={viewStyle === 'LIST' ? {
                  backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                  color: 'var(--accent-color)',
                } : undefined}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewStyle === 'LIST' ? 'font-semibold' : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                }`}
                title={$t("Executive List View")}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Body Content - Unified 6xl max-width container */}
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 flex-1 pb-16">
        {filteredProjects.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-white/40 dark:bg-neutral-900/30 p-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 text-2xl shadow-xs"
              style={{
                backgroundColor: 'rgba(var(--accent-rgb), 0.12)',
                color: 'var(--accent-color)',
              }}
            >
              <FolderPlus className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-800 dark:text-white">
              {searchQuery ? <UiText source={"No matching projects found"}/> : <UiText source={"No projects created yet"}/>}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mt-1 mb-5 leading-relaxed">
              {searchQuery
                ? `No projects matched "${searchQuery}". Try a different search term or clear the filter.`
                : <UiText source={"Projects give your chats dedicated system prompts, custom instructions, and isolated document repositories."}/>}
            </p>
            <button
              onClick={() => {
                if (searchQuery) setSearchQuery('');
                else setProjectModalOpen(true, null);
              }}
              style={{ backgroundColor: 'var(--accent-color)' }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-sm transition-all hover:opacity-95 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{searchQuery ? <UiText source={"Clear search filter"}/> : <UiText source={"Create your first project"}/>}</span>
            </button>
          </div>
        ) : viewStyle === 'GRID' ? (
          /* 1. DISTINCTIVE STUDIO GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredProjects.map((project) => {
              const projectChats = chats.filter((c) => c.projectId === project.id);
              const projectSources = sources.filter((s) => s.chatId === project.id);
              const isMenuOpen = activeMenuProjectId === project.id;

              return (
                <div
                  key={project.id}
                  onClick={() => {
                    setActiveProject(project.id);
                    setViewMode('PROJECT_DETAIL', project.id);
                  }}
                  className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-neutral-900/70 border border-neutral-200/80 dark:border-neutral-800/80 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-xs"
                  style={{
                    borderColor: undefined,
                  }}
                >
                  <div>
                    {/* Top Row: Avatar Badge + Context Menu */}
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs border transition-transform duration-300 group-hover:scale-105"
                        style={{
                          backgroundColor: `${project.color || 'var(--accent-color)'}20`,
                          borderColor: `${project.color || 'var(--accent-color)'}40`,
                        }}
                      >
                        {project.emoji || '📁'}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectModalOpen(true, project.id);
                          }}
                          className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400 transition-all cursor-pointer"
                          title={$t("Edit Project")}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(project);
                          }}
                          className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-red-500/10 text-neutral-500 hover:text-red-500 transition-all cursor-pointer"
                          title={$t("Delete Project")}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-[var(--accent-color)] transition-colors truncate mb-1">
                      {project.name}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-3 min-h-[32px]">
                      {project.description || 'Dedicated workspace with custom prompt instructions and attached documents.'}
                    </p>

                    {/* Feature Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-4">
                      {project.memoryScope === 'PROJECT_ONLY' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
                          <Shield className="w-2.5 h-2.5" />
                          <span><UiText source={"Isolated Memory"}/></span>
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 font-medium flex items-center gap-1">
                          <Globe className="w-2.5 h-2.5" />
                          <span><UiText source={"Shared Memory"}/></span>
                        </span>
                      )}

                      {project.standingInstructions && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-md border font-medium flex items-center gap-1"
                          style={{
                            backgroundColor: 'rgba(var(--accent-rgb), 0.1)',
                            borderColor: 'rgba(var(--accent-rgb), 0.25)',
                            color: 'var(--accent-color)',
                          }}
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span><UiText source={"Instructions"}/></span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer Meta Row */}
                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
                    <div className="flex items-center gap-2.5 font-medium">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{projectChats.length}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>{projectSources.length}</span>
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                      {formatProjectDate(project.updatedAt || project.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* 2. EXECUTIVE LIST VIEW */
          <div className="pt-2 space-y-2">
            {filteredProjects.map((project) => {
              const projectChats = chats.filter((c) => c.projectId === project.id);
              const projectSources = sources.filter((s) => s.chatId === project.id);

              return (
                <div
                  key={project.id}
                  onClick={() => {
                    setActiveProject(project.id);
                    setViewMode('PROJECT_DETAIL', project.id);
                  }}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white dark:bg-neutral-900/70 border border-neutral-200/80 dark:border-neutral-800/80 hover:shadow-md transition-all cursor-pointer gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border"
                      style={{
                        backgroundColor: `${project.color || 'var(--accent-color)'}20`,
                        borderColor: `${project.color || 'var(--accent-color)'}40`,
                      }}
                    >
                      {project.emoji || '📁'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-[var(--accent-color)] transition-colors truncate">
                          {project.name}
                        </h4>
                        {project.memoryScope === 'PROJECT_ONLY' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                             <UiText source={"Isolated"}/> </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate max-w-lg mt-0.5">
                        {project.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 text-xs">
                    <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400 font-medium text-[11px]">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{projectChats.length}  <UiText source={"chats"}/></span>
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>{projectSources.length}  <UiText source={"files"}/></span>
                      </span>
                    </div>

                    <div className="text-[10px] font-mono text-neutral-400">
                      {formatProjectDate(project.updatedAt || project.createdAt)}
                    </div>

                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[var(--accent-color)] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectDetailView({ project }: { project: ProjectEntity }) {
  const $t=useT();
  const {
    chats,
    sources,
    setViewMode,
    setActiveProject,
    setActiveChat,
    createChat,
    setProjectModalOpen,
    deleteProject,
    addSource,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'CHATS' | 'SOURCES' | 'INSTRUCTIONS'>('CHATS');
  const [quickPrompt, setQuickPrompt] = useState('');
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [sourceTitle, setSourceTitle] = useState('');
  const [sourceContent, setSourceContent] = useState('');

  const projectChats = chats.filter((c) => c.projectId === project.id);
  const projectSources = sources.filter((s) => s.chatId === project.id);

  const handleStartChat = () => {
    const newChatId = createChat({
      projectId: project.id,
      title: quickPrompt ? quickPrompt.slice(0, 32) : `Chat in ${project.name}`,
    });
    if (quickPrompt.trim()) {
      useAppStore.getState().sendMessage(quickPrompt);
    }
    setViewMode('CHAT');
  };

  const handleCreateSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceTitle.trim() || !sourceContent.trim()) return;
    addSource(project.id, undefined, sourceTitle.trim(), sourceContent.trim(), 'Project Source');
    setSourceTitle('');
    setSourceContent('');
    setIsAddingSource(false);
  };

  return (
    <div id="project-detail-view" className="flex-1 h-full overflow-y-auto bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col">
      {/* Top Breadcrumb Header - Unified 6xl container */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-16 lg:pt-8 pb-4 shrink-0 pl-14 lg:pl-0">
        <button
          onClick={() => setViewMode('PROJECTS_LIST')}
          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors mb-5 cursor-pointer font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span><UiText source={"Back to Projects Studio"}/></span>
        </button>

        {/* Main Project Hero Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 border border-black/5 dark:border-white/10 shadow-sm"
              style={{
                backgroundColor: `${project.color || 'var(--accent-color)'}25`,
                color: project.color || 'var(--accent-color)',
              }}
            >
              {project.emoji || '📁'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium">
                  {project.memoryScope === 'PROJECT_ONLY' ? <UiText source={"🔒 Project-only memory"}/> : <UiText source={"🌐 Shared memory"}/>}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-xl leading-relaxed">
                {project.description || 'Workspace container with customized instructions, source files, and dedicated chats.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setProjectModalOpen(true, project.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span><UiText source={"Edit Project"}/></span>
            </button>
            <button
              onClick={() => handleStartChat()}
              style={{ backgroundColor: 'var(--accent-color)' }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-md transition-all hover:opacity-95 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span><UiText source={"New chat in"}/> {project.name}</span>
            </button>
          </div>
        </div>

        {/* Interactive Quick Composer Box */}
        <div className="my-6 p-4 rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center gap-2 mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
            <span><UiText source={"Start a conversation with"}/> {project.name}  <UiText source={"instructions"}/></span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleStartChat();
              }}
              placeholder={$t("Ask anything in {0}...",project.name)}
              className="flex-1 bg-neutral-50 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[var(--accent-color)] transition-colors"
            />
            <button
              onClick={handleStartChat}
              style={{ backgroundColor: 'var(--accent-color)' }}
              className="p-2.5 rounded-xl text-white transition-all hover:opacity-95 active:scale-95 cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('CHATS')}
            style={activeTab === 'CHATS' ? { color: 'var(--accent-color)' } : undefined}
            className={`pb-3 flex items-center gap-2 transition-colors relative cursor-pointer ${
              activeTab === 'CHATS' ? 'font-bold' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span><UiText source={"Chats ("}/>{projectChats.length})</span>
            {activeTab === 'CHATS' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }} />
            )}
          </button>

          <button
            onClick={() => setActiveTab('SOURCES')}
            style={activeTab === 'SOURCES' ? { color: 'var(--accent-color)' } : undefined}
            className={`pb-3 flex items-center gap-2 transition-colors relative cursor-pointer ${
              activeTab === 'SOURCES' ? 'font-bold' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span><UiText source={"Sources & Files ("}/>{projectSources.length})</span>
            {activeTab === 'SOURCES' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }} />
            )}
          </button>

          <button
            onClick={() => setActiveTab('INSTRUCTIONS')}
            style={activeTab === 'INSTRUCTIONS' ? { color: 'var(--accent-color)' } : undefined}
            className={`pb-3 flex items-center gap-2 transition-colors relative cursor-pointer ${
              activeTab === 'INSTRUCTIONS' ? 'font-bold' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span><UiText source={"Standing Instructions"}/></span>
            {activeTab === 'INSTRUCTIONS' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }} />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content Body - Unified 6xl container */}
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 flex-1 pb-16">
        {/* Chats Tab */}
        {activeTab === 'CHATS' && (
          <div>
            {projectChats.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-white/40 dark:bg-neutral-900/20 p-8">
                <MessageSquare className="w-10 h-10 text-neutral-400 dark:text-neutral-600 mb-3" />
                <h3 className="text-sm font-semibold text-neutral-800 dark:text-white"><UiText source={"No chats in"}/> {project.name}  <UiText source={"yet"}/></h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mt-1 mb-4">
                   <UiText source={"Chats created in this project will automatically inherit its custom instructions and sources."}/> </p>
                <button
                  onClick={() => handleStartChat()}
                  style={{ backgroundColor: 'var(--accent-color)' }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-md transition-all hover:opacity-95 active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span><UiText source={"Start first chat"}/></span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {projectChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setActiveChat(chat.id);
                      setViewMode('CHAT');
                    }}
                    className="p-4 rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800/80 hover:shadow-md hover:border-[var(--accent-color)] transition-all cursor-pointer group shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <MessageSquare className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-color)' }} />
                        <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-[var(--accent-color)] transition-colors truncate">
                          {chat.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500 shrink-0 font-mono">
                        {new Date(chat.updatedAt || chat.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {chat.toolMode !== 'NONE' && (
                      <div className="mt-2.5 flex items-center gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700/60 font-mono">
                          {chat.toolMode}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sources & Files Tab */}
        {activeTab === 'SOURCES' && (
          <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                 <UiText source={"Uploaded sources are indexed and automatically available for RAG question answering in this project."}/> </p>
              <button
                onClick={() => setIsAddingSource(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-800 dark:text-white transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span><UiText source={"Add Source"}/></span>
              </button>
            </div>

            {isAddingSource && (
              <form onSubmit={handleCreateSource} className="p-4 mb-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/80 shadow-md space-y-3">
                <h4 className="text-xs font-semibold text-neutral-900 dark:text-white"><UiText source={"Add Knowledge Source to"}/> {project.name}</h4>
                <input
                  type="text"
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                  placeholder={$t("Source Title (e.g. API Docs, Technical Spec, Guidelines)...")}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[var(--accent-color)]"
                  autoFocus
                />
                <textarea
                  value={sourceContent}
                  onChange={(e) => setSourceContent(e.target.value)}
                  rows={4}
                  placeholder={$t("Paste documentation text, notes, or reference material here...")}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[var(--accent-color)] resize-none"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingSource(false)}
                    className="px-3 py-1.5 rounded-xl text-xs text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white"
                  >
                     <UiText source={"Cancel"}/> </button>
                  <button
                    type="submit"
                    disabled={!sourceTitle.trim() || !sourceContent.trim()}
                    style={{ backgroundColor: 'var(--accent-color)' }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white disabled:opacity-40 shadow-xs cursor-pointer"
                  >
                     <UiText source={"Save Source"}/> </button>
                </div>
              </form>
            )}

            {projectSources.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center justify-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-white/40 dark:bg-neutral-900/20 p-8">
                <FileText className="w-10 h-10 text-neutral-400 dark:text-neutral-600 mb-3" />
                <h3 className="text-sm font-semibold text-neutral-800 dark:text-white"><UiText source={"No sources in this project yet"}/></h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mt-1 mb-4">
                   <UiText source={"Add documents, code files, or reference text to give your chats project-specific knowledge."}/> </p>
                <button
                  onClick={() => setIsAddingSource(true)}
                  style={{ backgroundColor: 'var(--accent-color)' }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span><UiText source={"Add First Source"}/></span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projectSources.map((source) => (
                  <div
                    key={source.id}
                    className="p-4 rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800/80 hover:border-[var(--accent-color)] transition-colors shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                        <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">{source.title}</h4>
                      </div>
                      <span className="text-[10px] text-neutral-400 shrink-0 font-mono">{source.chunkCount}  <UiText source={"chunks"}/></span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-2 font-mono bg-neutral-50 dark:bg-neutral-950/60 p-2 rounded-xl border border-neutral-100 dark:border-neutral-800/60">
                      {source.content.slice(0, 140)}...
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Standing Instructions Tab */}
        {activeTab === 'INSTRUCTIONS' && (
          <div className="pt-2 max-w-3xl">
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
                  <span><UiText source={"Project Standing System Prompt"}/></span>
                </h3>
                <button
                  onClick={() => setProjectModalOpen(true, project.id)}
                  style={{ color: 'var(--accent-color)' }}
                  className="text-xs hover:underline font-semibold cursor-pointer"
                >
                   <UiText source={"Edit Instructions"}/> </button>
              </div>

              {project.standingInstructions ? (
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800/80 font-mono text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {project.standingInstructions}
                </div>
              ) : (
                <div className="py-8 text-center text-neutral-400 dark:text-neutral-500 text-xs italic">
                   <UiText source={"No standing instructions configured for this project."}/> </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
