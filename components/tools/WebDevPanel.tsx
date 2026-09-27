'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  PanelRightClose,
  FileCode,
  FolderPlus,
  FilePlus,
  Play,
  Copy,
  Check,
  Download,
  Trash2,
  Terminal,
} from 'lucide-react';
import { WebFileEntity } from '@/lib/types';

import JSZip from 'jszip';
import { compileWebPreview } from '@/lib/agent/preferences';
import { GeneratedPreview } from './GeneratedPreview';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export function WebDevPanel({ onClose }: { onClose: () => void }) {
  const $t=useT();
  const { activeChatId, webFiles, saveWebFile, messages } = useAppStore();
  const projectId = activeChatId || 'default_proj';

  const defaultFiles = useMemo<WebFileEntity[]>(
    () => [
      {
        id: 'wf_idx',
        projectId,
        path: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="style.css">
</head>
<body class="bg-zinc-950 text-zinc-100 p-8 flex flex-col items-center justify-center min-h-screen">
  <div class="max-w-md w-full p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl text-center space-y-4">
    <div class="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center mx-auto text-2xl">⚡</div>
    <h1 class="text-xl font-bold">Pimx Web Sandbox</h1>
    <p class="text-xs text-zinc-400">Multi-file HTML, CSS, and JS live project workspace.</p>
    <button id="btn-click" class="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold transition-all">
      Interactive Counter: <span id="count">0</span>
    </button>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
        version: 1,
        createdAt: 0,
      },
      {
        id: 'wf_css',
        projectId,
        path: 'style.css',
        language: 'css',
        content: `/* Custom CSS Styles */
body {
  font-family: system-ui, -apple-system, sans-serif;
}`,
        version: 1,
        createdAt: 0,
      },
      {
        id: 'wf_js',
        projectId,
        path: 'script.js',
        language: 'javascript',
        content: `// Interactive JS
let count = 0;
const btn = document.getElementById('btn-click');
const countSpan = document.getElementById('count');

btn?.addEventListener('click', () => {
  count++;
  countSpan.textContent = count;
});`,
        version: 1,
        createdAt: 0,
      },
    ],
    [projectId]
  );

  const storedFiles = webFiles[projectId] || [];

  // Retroactively scan active chat messages if store has no files yet
  useEffect(() => {
    if (storedFiles.length === 0 && activeChatId && messages[activeChatId]) {
      const chatMsgs = messages[activeChatId];
      const fileXmlRegex = /<file\s+path=["']([^"']+)["']>([\s\S]*?)<\/file>/gi;
      let foundAny = false;

      for (let i = chatMsgs.length - 1; i >= 0; i--) {
        const msg = chatMsgs[i];
        if (msg.role === 'assistant' && msg.content) {
          let match;
          while ((match = fileXmlRegex.exec(msg.content)) !== null) {
            const filePath = match[1];
            const content = match[2].trim();
            const ext = filePath.split('.').pop() || 'txt';
            saveWebFile(projectId, filePath, ext, content);
            foundAny = true;
          }
          if (foundAny) break;
        }
      }
    }
  }, [activeChatId, storedFiles.length, messages]);

  // Never masquerade the starter template as AI output — empty means empty (honest empty state below).
  const files = storedFiles;

  const [activeFilePath, setActiveFilePath] = useState<string>('index.html');
  const [activeTab, setActiveTab] = useState<'CODE' | 'RUNNER'>('RUNNER');
  const [isZipping, setIsZipping] = useState(false);

  const activeFile = files.find((f) => f.path === activeFilePath) || files[0];

  const handleUpdateContent = (newContent: string) => {
    if (activeFile) {
      saveWebFile(projectId, activeFile.path, activeFile.language, newContent);
    }
  };

  const handleDownloadProject = async () => {
    if (files.length === 0) return;
    if (files.length === 1) {
      // Single file download
      const single = files[0];
      const blob = new Blob([single.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = single.path;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    // Multi-file ZIP download
    try {
      setIsZipping(true);
      const zip = new JSZip();
      files.forEach((file) => {
        zip.file(file.path, file.content);
      });
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectId.replace(/[^a-zA-Z0-9_-]/g, '_')}_project.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate ZIP project:', err);
    } finally {
      setIsZipping(false);
    }
  };

  // Compile combined bundle for live iframe runner
  const bundleHtml = useMemo(() => {
    return compileWebPreview(files);
  }, [files]);

  return (
    <div
      id="webdev-panel"
      className="h-full flex flex-col border-l border-[var(--border-color)] bg-[var(--surface-color)]"
    >
      {/* Header */}
      <div className="p-3 border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-semibold text-xs"><UiText source={"Web Dev Project IDE"}/></span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleDownloadProject}
            disabled={isZipping || files.length === 0}
            title={$t(files.length > 1 ? 'Download Project as ZIP' : 'Download File')}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 disabled:opacity-20 transition-colors flex items-center gap-1 text-xs font-mono cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{files.length > 1 ? <UiText source={"ZIP"}/> : <UiText source={"File"}/>}</span>
          </button>

          {files.length > 0 && (
            <div className="flex items-center rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-0.5 text-[11px]">
              <button
                onClick={() => setActiveTab('RUNNER')}
                className={`px-2 py-0.5 rounded-md font-medium transition-all flex items-center gap-1 cursor-pointer ${
                  activeTab === 'RUNNER' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 font-semibold' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Play className="w-3 h-3 text-emerald-500" />
                <span><UiText source={"Live Run"}/></span>
              </button>
              <button
                onClick={() => setActiveTab('CODE')}
                className={`px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                  activeTab === 'CODE' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 font-semibold' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                 <UiText source={"Editor"}/> </button>
            </div>
          )}

          <button
            onClick={onClose}
            title={$t("Minimize Panel")}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors cursor-pointer text-cyan-600 dark:text-cyan-400"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* File Tree & Editor or Live Runner OR Empty State */}
      {files.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 border border-cyan-500/20 shadow-sm">
            <FileCode className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold mb-1.5 text-neutral-900 dark:text-white">
             <UiText source={"No Files Created Yet"}/> </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-5">
             <UiText source={"Ask AI in the chat to write web, React, or HTML/CSS code for you, or create the first file manually."}/> </p>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
            <button
              onClick={() => {
                saveWebFile(
                  projectId,
                  'index.html',
                  'html',
                  '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>New Project</title>\n</head>\n<body style="font-family: sans-serif; padding: 2rem; background: #111; color: #fff;">\n  <h1>New Project</h1>\n  <p>Place your code in this section.</p>\n</body>\n</html>'
                );
                setActiveFilePath('index.html');
                setActiveTab('CODE');
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white shadow-sm bg-cyan-600 hover:bg-cyan-500 cursor-pointer transition-all active:scale-95"
            >
              <FilePlus className="w-4 h-4" />
              <span><UiText source={"Create index.html"}/></span>
            </button>
            <button
              onClick={() => {
                defaultFiles.forEach((f) => saveWebFile(projectId, f.path, f.language, f.content));
                setActiveFilePath('index.html');
                setActiveTab('RUNNER');
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
            >
              <span><UiText source={"Load Sample Project"}/></span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden min-h-0">
          {/* File Sidebar */}
          <div className={`${activeTab === 'RUNNER' ? 'hidden sm:block' : ''} w-full sm:w-40 max-h-32 sm:max-h-none border-b sm:border-b-0 sm:border-r border-[var(--border-color)] bg-black/[0.02] dark:bg-black/20 p-2 space-y-1 overflow-y-auto shrink-0`}>
            <div className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 opacity-50"><UiText source={"Files"}/></div>
            {files.map((f) => (
              <button
                key={f.path}
                onClick={() => {
                  setActiveFilePath(f.path);
                  setActiveTab('CODE');
                }}
                className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-left truncate transition-colors cursor-pointer ${
                  activeFilePath === f.path && activeTab === 'CODE'
                    ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 font-semibold shadow-2xs'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <span className="text-[11px] opacity-60">📄</span>
                <span className="truncate">{f.path}</span>
              </button>
            ))}
          </div>

          {/* Workspace Center */}
          <div className="flex-1 overflow-hidden flex flex-col bg-black/40">
            {activeTab === 'RUNNER' ? (
              <GeneratedPreview
                title={$t("Web Dev Sandbox")}
                html={bundleHtml}
                className="w-full h-full border-0 bg-zinc-950"
              />
            ) : (
              <div className="h-full flex flex-col">
                <div className="px-3 py-1.5 border-b border-white/5 bg-white/5 flex items-center justify-between text-xs font-mono">
                  <span>{activeFile?.path}</span>
                  <span className="text-[10px] opacity-50"><UiText source={"v"}/>{activeFile?.version || 1}</span>
                </div>
                <textarea
                  value={activeFile?.content || ''}
                  onChange={(e) => handleUpdateContent(e.target.value)}
                  className="flex-1 p-3 bg-transparent font-mono text-xs text-emerald-200/90 resize-none focus:outline-none leading-relaxed"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
