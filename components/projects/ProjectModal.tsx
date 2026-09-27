'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  FolderPlus,
  Folder,
  X,
  Sparkles,
  Check,
  Trash2,
  FileText,
  Palette,
  MessageSquarePlus,
  Brain,
  Info,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { ProjectEntity } from '@/lib/types';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

const EMOJI_OPTIONS = [
  '📁', '🚀', '💻', '💡', '📊', '🎨', '🔬', '🤖',
  '📝', '⚡', '🌐', '🎯', '🛡️', '📚', '🛠️', '🧬',
  '💰', '🎓', '✒️', '⚖️', '🧭', '⭐', '❤️', '🔥'
];

const COLOR_OPTIONS = [
  { name: 'Dark Slate', hex: '#1E293B' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Green', hex: '#10B981' },
  { name: 'Sky', hex: '#0EA5E9' },
  { name: 'Indigo', hex: '#6366F1' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Pink', hex: '#EC4899' },
];

export function ProjectModal() {
  const { projectModalOpen, editingProjectId, setProjectModalOpen, projects } = useAppStore();

  if (!projectModalOpen) return null;

  const editingProject = projects.find((p) => p.id === editingProjectId);

  return (
    <div
      id="project-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={() => setProjectModalOpen(false)}
    >
      <ProjectModalContent
        key={editingProjectId || 'new'}
        editingProject={editingProject}
        editingProjectId={editingProjectId}
        onClose={() => setProjectModalOpen(false)}
      />
    </div>
  );
}

function ProjectModalContent({
  editingProject,
  editingProjectId,
  onClose,
}: {
  editingProject?: ProjectEntity;
  editingProjectId: string | null;
  onClose: () => void;
}) {
  const $t=useT();
  const { addProject, updateProject, deleteProject, setActiveProject, createChat, setViewMode, projectChatId, assignChatToProject } = useAppStore();

  const [name, setName] = useState(editingProject?.name || '');
  const [description, setDescription] = useState(editingProject?.description || '');
  const [instructions, setInstructions] = useState(editingProject?.standingInstructions || '');
  const [emoji, setEmoji] = useState(editingProject?.emoji || '📁');
  const [color, setColor] = useState(editingProject?.color || '#8B5CF6');
  const [memoryScope, setMemoryScope] = useState<'DEFAULT' | 'PROJECT_ONLY'>(editingProject?.memoryScope || 'DEFAULT');
  const [showMemoryDropdown, setShowMemoryDropdown] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleSave = (createChatNow = false) => {
    if (!name.trim()) return;

    let targetProjectId = editingProjectId;

    if (editingProject && editingProjectId) {
      updateProject(editingProjectId, {
        name: name.trim(),
        description: description.trim(),
        standingInstructions: instructions.trim(),
        emoji,
        color,
        memoryScope,
      });
      setActiveProject(editingProjectId);
      setViewMode('PROJECT_DETAIL', editingProjectId);
    } else {
      targetProjectId = addProject(
        name.trim(),
        description.trim(),
        instructions.trim(),
        emoji,
        color
      );
      updateProject(targetProjectId, { memoryScope });
      setActiveProject(targetProjectId);
      setViewMode('PROJECT_DETAIL', targetProjectId);
    }

    if (projectChatId && targetProjectId) assignChatToProject(projectChatId, targetProjectId);
    if (createChatNow && targetProjectId && !projectChatId) {
      createChat({
        projectId: targetProjectId,
        title: `Chat in ${name.trim()}`,
      });
      setViewMode('CHAT');
    }

    onClose();
  };

  const handleDelete = () => {
    setDeleteOpen(true);
  };
  const confirmDelete = () => {
    if (!editingProjectId) return;
    deleteProject(editingProjectId);
    setViewMode('PROJECTS_LIST');
    onClose();
  };

  return (<>
    {deleteOpen && <ConfirmDialog title={$t("Delete project")} description={$t("Delete “{0}”? Conversations stay in your chat history.",name)} confirmLabel={$t("Delete project")} onConfirm={confirmDelete} onClose={() => setDeleteOpen(false)} />}
    <div
      id="project-modal"
      className="w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div
        className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-xs border border-black/5 dark:border-white/10"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {emoji}
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-tight flex items-center gap-2">
              {editingProject ? <UiText source={"Edit Project"}/> : <UiText source={"Create New Project"}/>}
            </h2>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
               <UiText source={"Workspace container with dedicated chats & standing instructions"}/> </p>
          </div>
        </div>
        <button
          id="btn-close-project-modal"
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Body */}
      <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
        {/* Project Name */}
        <div className="space-y-1.5">
          <label className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <span><UiText source={"Project Name"}/></span>
            <span className="text-red-500">*</span>
          </label>
          <input
            id="input-project-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={$t("e.g. Web App Redesign, Research Paper, Python Bot...")}
            className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[var(--accent-color)] transition-colors shadow-2xs"
            autoFocus
          />
        </div>

        {/* Project Description */}
        <div className="space-y-1.5">
          <label className="font-semibold text-neutral-700 dark:text-neutral-300">
             <UiText source={"Description (Optional)"}/> </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={$t("Brief overview of this workspace...")}
            className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[var(--accent-color)] transition-colors shadow-2xs"
          />
        </div>

        {/* Emoji & Color Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-700 dark:text-neutral-300"><UiText source={"Project Icon"}/></label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 rounded-xl max-h-24 overflow-y-auto">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  style={emoji === e ? {
                    backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                    borderColor: 'var(--accent-color)',
                  } : undefined}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all cursor-pointer ${
                    emoji === e
                      ? 'scale-110 shadow-xs border'
                      : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 border border-transparent'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-700 dark:text-neutral-300"><UiText source={"Color Accent"}/></label>
            <div className="flex flex-wrap gap-2 p-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 rounded-xl items-center">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  title={$t(c.name)}
                  className={`w-6 h-6 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                    color === c.hex
                      ? 'scale-115 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900 shadow-xs ring-neutral-900 dark:ring-white'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {color === c.hex && <Check className="w-3 h-3 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Memory Scope Dropdown */}
        <div className="space-y-1.5 relative">
          <label className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
            <span><UiText source={"Memory Scope"}/></span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMemoryDropdown(!showMemoryDropdown)}
              className="w-full flex items-center justify-between bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-left hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors cursor-pointer"
            >
              <div>
                <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {memoryScope === 'DEFAULT' ? <UiText source={"Default memory"}/> : <UiText source={"Project-only memory"}/>}
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {memoryScope === 'DEFAULT'
                    ? <UiText source={"This project can access memory from outside chats, and vice versa."}/>
                    : <UiText source={"This project can only access its own memory. Its memory is hidden from outside chats."}/>}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0 ml-2" />
            </button>

            {showMemoryDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden py-1 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => {
                    setMemoryScope('DEFAULT');
                    setShowMemoryDropdown(false);
                  }}
                  style={memoryScope === 'DEFAULT' ? {
                    backgroundColor: 'rgba(var(--accent-rgb), 0.12)',
                  } : undefined}
                  className="w-full text-left px-3.5 py-2.5 text-xs flex items-start justify-between hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white"><UiText source={"Default memory"}/></div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                       <UiText source={"This project can access memory from outside chats, and vice versa."}/> </div>
                  </div>
                  {memoryScope === 'DEFAULT' && (
                    <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent-color)' }} />
                  )}
                </button>
                <div className="border-t border-neutral-100 dark:border-neutral-700/60 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setMemoryScope('PROJECT_ONLY');
                    setShowMemoryDropdown(false);
                  }}
                  style={memoryScope === 'PROJECT_ONLY' ? {
                    backgroundColor: 'rgba(var(--accent-rgb), 0.12)',
                  } : undefined}
                  className="w-full text-left px-3.5 py-2.5 text-xs flex items-start justify-between hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white"><UiText source={"Project-only memory"}/></div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                       <UiText source={"This project can only access its own memory. Its memory is hidden from outside chats."}/> </div>
                  </div>
                  {memoryScope === 'PROJECT_ONLY' && (
                    <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent-color)' }} />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tip Box */}
        <div className="p-3 bg-neutral-100/70 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/50 rounded-xl flex items-start gap-2.5 text-[11px] text-neutral-600 dark:text-neutral-300">
          <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
          <p>
             <UiText source={"Projects keep chats, files, and custom instructions in one place. Use them for ongoing work, or just to keep things tidy."}/> </p>
        </div>

        {/* Standing Instructions / System Prompt */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
              <span><UiText source={"Custom Instructions (Project System Prompt)"}/></span>
            </label>
            <span className="text-[10px] text-neutral-400"><UiText source={"Applied to all chats"}/></span>
          </div>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
            placeholder={$t("e.g. Always respond with clean TypeScript code, follow strict architecture guidelines, prioritize Next.js App Router patterns, and keep responses concise and structured...")}
            className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[var(--accent-color)] transition-colors resize-none leading-relaxed shadow-2xs"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div
        className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-50/50 dark:bg-neutral-950/40"
      >
        {editingProject ? (
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors border border-red-200 dark:border-red-900/40 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span><UiText source={"Delete Project"}/></span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
          >
             <UiText source={"Cancel"}/> </button>

          {!editingProject && !projectChatId && (
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={!name.trim()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition-colors disabled:opacity-40 text-neutral-800 dark:text-white cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-emerald-500" />
              <span><UiText source={"Save & Start Chat"}/></span>
            </button>
          )}

          <button
            id="btn-save-project"
            type="button"
            onClick={() => handleSave(false)}
            disabled={!name.trim()}
            style={{ backgroundColor: 'var(--accent-color)' }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-all hover:opacity-95 active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{editingProject ? <UiText source={"Save Changes"}/> : <UiText source={"Create Project"}/>}</span>
          </button>
        </div>
      </div>
    </div></>
  );
}
