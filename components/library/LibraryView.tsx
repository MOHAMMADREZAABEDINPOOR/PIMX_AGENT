'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  FileText,
  Image as ImageIcon,
  Code,
  FileCode,
  Sparkles,
  Search,
  Download,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Upload,
  Folder,
  Filter,
  Grid,
  List as ListIcon,
  X,
  Eye,
  Layers,
  Database,
  ArrowUpDown,
  Calendar,
  HardDrive,
} from 'lucide-react';
import { Attachment, SourceEntity, ArtifactEntity, CanvasDocument } from '@/lib/types';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export type LibraryCategory = 'ALL' | 'IMAGE' | 'DOCUMENT' | 'CODE' | 'SOURCE' | 'CANVAS';

export interface UnifiedFileItem {
  id: string;
  name: string;
  category: 'IMAGE' | 'DOCUMENT' | 'CODE' | 'SOURCE' | 'CANVAS';
  sourceType: 'ATTACHMENT' | 'SOURCE' | 'ARTIFACT' | 'CANVAS';
  sizeBytes?: number;
  mimeType?: string;
  createdAt: number;
  chatId?: string;
  projectId?: string;
  chatTitle?: string;
  projectName?: string;
  previewUrl?: string; // image base64 / data
  content?: string;
  language?: string;
}

export function LibraryView() {
  const $t=useT();
  const {
    chats,
    messages,
    sources,
    artifacts,
    canvasDocuments,
    projects,
    addSource,
    deleteSource,
    setActiveChat,
    setActiveProject,
    setViewMode,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LibraryCategory>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [viewStyle, setViewStyle] = useState<'GRID' | 'LIST'>('LIST');
  const [previewItem, setPreviewItem] = useState<UnifiedFileItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Map chats and projects for fast lookup
  const chatMap = useMemo(() => new Map(chats.map((c) => [c.id, c])), [chats]);
  const projectMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  // Aggregate all files from across the entire app
  const allFiles: UnifiedFileItem[] = useMemo(() => {
    const items: UnifiedFileItem[] = [];

    // 1. Chat Attachments
    Object.entries(messages).forEach(([chatId, msgList]) => {
      const chat = chatMap.get(chatId);
      const project = chat?.projectId ? projectMap.get(chat.projectId) : undefined;

      msgList.forEach((msg) => {
        if (msg.attachments && msg.attachments.length > 0) {
          msg.attachments.forEach((att) => {
            const isImg = att.kind === 'IMAGE' || att.mimeType.startsWith('image/');
            const isCode = att.kind === 'CODE';
            const cat = isImg ? 'IMAGE' : isCode ? 'CODE' : 'DOCUMENT';

            items.push({
              id: `att_${att.id}`,
              name: att.name,
              category: cat,
              sourceType: 'ATTACHMENT',
              sizeBytes: att.size,
              mimeType: att.mimeType,
              createdAt: msg.createdAt,
              chatId,
              projectId: chat?.projectId,
              chatTitle: chat?.title || 'Chat',
              projectName: project?.name,
              previewUrl: att.base64Data,
              content: att.extractedText,
            });
          });
        }
      });
    });

    // 2. Knowledge & Project Sources
    sources.forEach((src) => {
      const chat = src.chatId ? chatMap.get(src.chatId) : undefined;
      const project = src.chatId ? projectMap.get(src.chatId) : undefined;

      items.push({
        id: `src_${src.id}`,
        name: src.title,
        category: 'SOURCE',
        sourceType: 'SOURCE',
        sizeBytes: src.content.length,
        mimeType: src.mime,
        createdAt: src.createdAt,
        chatId: src.chatId,
        projectId: project ? project.id : chat?.projectId,
        chatTitle: chat?.title,
        projectName: project?.name || (chat?.projectId ? projectMap.get(chat.projectId)?.name : undefined),
        content: src.content,
      });
    });

    // 3. Generated Artifacts
    artifacts.forEach((art) => {
      const chat = chatMap.get(art.chatId);
      const project = chat?.projectId ? projectMap.get(chat.projectId) : undefined;

      items.push({
        id: `art_${art.id}`,
        name: `${art.title}.${art.language || 'txt'}`,
        category: 'CODE',
        sourceType: 'ARTIFACT',
        sizeBytes: art.content.length,
        createdAt: art.createdAt,
        chatId: art.chatId,
        projectId: chat?.projectId,
        chatTitle: chat?.title || 'Chat',
        projectName: project?.name,
        content: art.content,
        language: art.language,
      });
    });

    // 4. Canvas Documents
    Object.values(canvasDocuments).forEach((doc) => {
      const chat = chatMap.get(doc.chatId);
      const project = chat?.projectId ? projectMap.get(chat.projectId) : undefined;

      items.push({
        id: `canvas_${doc.id}`,
        name: `${doc.title || 'Canvas Document'}.md`,
        category: 'CANVAS',
        sourceType: 'CANVAS',
        sizeBytes: doc.content.length,
        createdAt: doc.updatedAt,
        chatId: doc.chatId,
        projectId: chat?.projectId,
        chatTitle: chat?.title || 'Chat',
        projectName: project?.name,
        content: doc.content,
      });
    });

    // Deduplicate by ID and sort newest first
    return items.sort((a, b) => b.createdAt - a.createdAt);
  }, [messages, sources, artifacts, canvasDocuments, chatMap, projectMap]);

  // Filter files
  const filteredFiles = useMemo(() => {
    return allFiles.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesChat = item.chatTitle?.toLowerCase().includes(q);
        const matchesProject = item.projectName?.toLowerCase().includes(q);
        const matchesContent = item.content?.toLowerCase().includes(q);
        if (!matchesName && !matchesChat && !matchesProject && !matchesContent) return false;
      }

      // Category
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }

      // Project filter
      if (selectedProjectId !== 'ALL') {
        if (item.projectId !== selectedProjectId) return false;
      }

      return true;
    });
  }, [allFiles, searchQuery, selectedCategory, selectedProjectId]);

  const handleCopyContent = (item: UnifiedFileItem) => {
    if (!item.content) return;
    navigator.clipboard.writeText(item.content);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (item: UnifiedFileItem) => {
    if (item.previewUrl && item.category === 'IMAGE') {
      const a = document.createElement('a');
      a.href = item.previewUrl;
      a.download = item.name;
      a.click();
      return;
    }

    if (item.content) {
      const blob = new Blob([item.content], { type: item.mimeType || 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDirectUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === 'string' ? reader.result : '';
        addSource(undefined, undefined, file.name, text || 'Uploaded binary/document content', 'Direct Library Upload');
      };
      reader.readAsText(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalSize = useMemo(() => {
    return allFiles.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);
  }, [allFiles]);

  return (
    <div id="library-view" className="flex-1 h-full overflow-y-auto bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col">
      {/* Top Header */}
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 pt-8 pb-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <span><UiText source={"Library"}/></span>
              <span
                className="text-xs px-2.5 py-0.5 rounded-full font-semibold border"
                style={{
                  backgroundColor: 'rgba(var(--accent-rgb), 0.12)',
                  borderColor: 'rgba(var(--accent-rgb), 0.25)',
                  color: 'var(--accent-color)',
                }}
              >
                {allFiles.length} {allFiles.length === 1 ? <UiText source={"file"}/> : <UiText source={"files"}/>}
              </span>
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xl leading-relaxed">
               <UiText source={"Browse, search, and manage all files, attachments, knowledge sources, and artifacts exchanged across your chats and projects."}/> </p>
          </div>

          {/* Quick upload & Actions */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleDirectUpload}
              multiple
              className="hidden"
            />
            <button
              id="btn-library-upload"
              onClick={() => fileInputRef.current?.click()}
              style={{ backgroundColor: 'var(--accent-color)' }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-white text-xs font-semibold shadow-sm transition-all hover:opacity-95 active:scale-95 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span><UiText source={"Upload to Library"}/></span>
            </button>
          </div>
        </div>

        {/* Search, Categories & Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {(
              [
                { key: 'ALL', label: 'All Files' },
                { key: 'IMAGE', label: 'Images' },
                { key: 'DOCUMENT', label: 'Documents' },
                { key: 'CODE', label: 'Code & Artifacts' },
                { key: 'SOURCE', label: 'Sources' },
                { key: 'CANVAS', label: 'Canvas Docs' },
              ] as { key: LibraryCategory; label: string }[]
            ).map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.key
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                    : 'bg-neutral-200/70 dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {<UiText source={cat.label}/>}
              </button>
            ))}
          </div>

          {/* Right Filters: Project Picker, Search, View Style */}
          <div className="flex items-center gap-2.5">
            {/* Project Filter */}
            {projects.length > 0 && (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL"><UiText source={"All Projects"}/></option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.emoji || '📁'} {p.name}
                  </option>
                ))}
              </select>
            )}

            {/* Search Box */}
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={$t("Search files...")}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-[var(--accent-color)] transition-colors shadow-2xs"
              />
            </div>

            {/* Grid / List Toggle */}
            <div className="flex items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-0.5 shadow-2xs">
              <button
                onClick={() => setViewStyle('GRID')}
                style={viewStyle === 'GRID' ? {
                  backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                  color: 'var(--accent-color)',
                } : undefined}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewStyle === 'GRID' ? 'font-semibold' : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                }`}
                title={$t("Grid View")}
              >
                <Grid className="w-3.5 h-3.5" />
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
                title={$t("List View")}
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main File Gallery / List - Unified padding */}
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 flex-1 pb-16">
        {filteredFiles.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-white/40 dark:bg-neutral-900/30 p-8">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xl text-neutral-400 mb-3">
              📂
            </div>
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200"><UiText source={"No files found"}/></h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mt-1 mb-4 leading-relaxed">
              {searchQuery
                ? `No files match your query "${searchQuery}". Try a different keyword.`
                : <UiText source={"Upload files in chats, create canvas documents, or import knowledge sources to populate your library."}/>}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ backgroundColor: 'var(--accent-color)' }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-sm transition-all hover:opacity-95 active:scale-95 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span><UiText source={"Upload First File"}/></span>
            </button>
          </div>
        ) : viewStyle === 'GRID' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pt-2">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => setPreviewItem(file)}
                className="group relative flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800/80 hover:border-[var(--accent-color)] hover:shadow-md dark:hover:shadow-neutral-900/50 transition-all cursor-pointer"
              >
                <div>
                  {/* Top Category Badge & Type */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      {file.category === 'IMAGE' ? (
                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      ) : file.category === 'CODE' ? (
                        <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                          <Code className="w-4 h-4" />
                        </div>
                      ) : file.category === 'SOURCE' ? (
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <Database className="w-4 h-4" />
                        </div>
                      ) : file.category === 'CANVAS' ? (
                        <div
                          className="p-1.5 rounded-lg"
                          style={{
                            backgroundColor: 'rgba(var(--accent-rgb), 0.12)',
                            color: 'var(--accent-color)',
                          }}
                        >
                          <Sparkles className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                      <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60">
                        {file.sourceType}
                      </span>
                    </div>

                    <span className="text-[10px] text-neutral-400 font-mono">
                      {formatFileSize(file.sizeBytes)}
                    </span>
                  </div>

                  {/* Thumbnail / Image Preview */}
                  {file.previewUrl ? (
                    <div className="w-full h-28 rounded-xl overflow-hidden mb-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-center">
                      <img src={file.previewUrl} alt={$t(file.name)} className="w-full h-full object-cover" />
                    </div>
                  ) : file.content ? (
                    <div className="w-full h-20 rounded-xl p-2.5 mb-3 bg-neutral-50 dark:bg-neutral-950/80 border border-neutral-200/60 dark:border-neutral-800/80 overflow-hidden font-mono text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">
                      {file.content.slice(0, 160)}...
                    </div>
                  ) : null}

                  {/* File Name */}
                  <h3 className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 group-hover:text-[var(--accent-color)] transition-colors truncate mb-1" title={$t(file.name)}>
                    {file.name}
                  </h3>

                  {/* Association (Chat or Project) */}
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                    {file.projectName ? (
                      <span className="flex items-center gap-1 font-medium truncate" style={{ color: 'var(--accent-color)' }}>
                        <Folder className="w-3 h-3 shrink-0" />
                        <span className="truncate">{file.projectName}</span>
                      </span>
                    ) : file.chatTitle ? (
                      <span className="truncate"><UiText source={"In:"}/> {file.chatTitle}</span>
                    ) : (
                      <span><UiText source={"Library Direct"}/></span>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>{new Date(file.createdAt).toLocaleDateString()}</span>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {file.content && (
                      <button
                        onClick={() => handleCopyContent(file)}
                        title={$t("Copy content")}
                        className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedId === file.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(file)}
                      title={$t("Download file")}
                      className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {file.chatId && (
                      <button
                        onClick={() => {
                          setActiveChat(file.chatId!);
                          setViewMode('CHAT');
                        }}
                        title={$t("Open Chat")}
                        className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 hover:text-[var(--accent-color)] transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table / List View */
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900/50 shadow-xs">
            <div className="grid grid-cols-12 px-5 py-3 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 uppercase tracking-wider">
              <div className="col-span-6 sm:col-span-5"><UiText source={"Name"}/></div>
              <div className="col-span-2 hidden sm:block"><UiText source={"Source"}/></div>
              <div className="col-span-2 hidden sm:block"><UiText source={"Size"}/></div>
              <div className="col-span-6 sm:col-span-3 text-right"><UiText source={"Actions"}/></div>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => setPreviewItem(file)}
                  className="grid grid-cols-12 px-5 py-3.5 items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer group text-xs"
                >
                  <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0">
                    <div className="shrink-0">
                      {file.category === 'IMAGE' ? (
                        <ImageIcon className="w-4 h-4 text-blue-500" />
                      ) : file.category === 'CODE' ? (
                        <Code className="w-4 h-4 text-cyan-500" />
                      ) : file.category === 'SOURCE' ? (
                        <Database className="w-4 h-4 text-emerald-500" />
                      ) : file.category === 'CANVAS' ? (
                        <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
                      ) : (
                        <FileText className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-[var(--accent-color)] transition-colors truncate">
                        {file.name}
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate">
                        {file.projectName || file.chatTitle || 'Library Direct'}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 hidden sm:block text-neutral-500 dark:text-neutral-400">
                    <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] font-medium uppercase">
                      {file.sourceType}
                    </span>
                  </div>

                  <div className="col-span-2 hidden sm:block text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
                    {formatFileSize(file.sizeBytes)}
                  </div>

                  <div className="col-span-6 sm:col-span-3 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    {file.content && (
                      <button
                        onClick={() => handleCopyContent(file)}
                        title={$t("Copy content")}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedId === file.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(file)}
                      title={$t("Download file")}
                      className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {file.chatId && (
                      <button
                        onClick={() => {
                          setActiveChat(file.chatId!);
                          setViewMode('CHAT');
                        }}
                        title={$t("Open Chat")}
                        className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 hover:text-[var(--accent-color)] transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* File Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-neutral-900 dark:text-neutral-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="p-2 rounded-xl shrink-0"
                  style={{
                    backgroundColor: 'rgba(var(--accent-rgb), 0.12)',
                    color: 'var(--accent-color)',
                  }}
                >
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate">{previewItem.name}</h3>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {formatFileSize(previewItem.sizeBytes)} • {new Date(previewItem.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(previewItem)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span><UiText source={"Download"}/></span>
                </button>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto flex-1 text-xs">
              {previewItem.previewUrl ? (
                <div className="flex items-center justify-center p-4 bg-neutral-100 dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                  <img src={previewItem.previewUrl} alt={$t(previewItem.name)} className="max-h-96 object-contain rounded-xl" />
                </div>
              ) : previewItem.content ? (
                <pre className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 font-mono text-xs leading-relaxed whitespace-pre-wrap select-text">
                  {previewItem.content}
                </pre>
              ) : (
                <div className="py-12 text-center text-neutral-400 italic">
                   <UiText source={"No text preview available for this binary file."}/> </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-50/50 dark:bg-neutral-950/40 text-xs">
              <div className="text-neutral-500 dark:text-neutral-400">
                {previewItem.projectName ? `Project: ${previewItem.projectName}` : previewItem.chatTitle ? `Chat: ${previewItem.chatTitle}` : <UiText source={"Direct Upload"}/>}
              </div>

              {previewItem.content && (
                <button
                  onClick={() => handleCopyContent(previewItem)}
                  style={{ backgroundColor: 'var(--accent-color)' }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white font-medium shadow-xs transition-all hover:opacity-95 active:scale-95 cursor-pointer"
                >
                  {copiedId === previewItem.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === previewItem.id ? <UiText source={"Copied!"}/> : <UiText source={"Copy Text"}/>}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
