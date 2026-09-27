'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  PanelRightClose,
  Edit3,
  Eye,
  FileText,
  Save,
  Download,
  Copy,
  Check,
  History,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { escapeHtml } from '@/lib/html';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export function CanvasPanel({ onClose }: { onClose: () => void }) {
  const $t=useT();
  const { activeChatId, canvasDocuments, saveCanvasDocument } = useAppStore();
  const currentDoc = activeChatId ? canvasDocuments[activeChatId] : null;

  const [title, setTitle] = useState(currentDoc?.title || 'Document Title');
  const [content, setContent] = useState(currentDoc?.content || '# Title\n\nWrite your document here...');
  const [prevDocVersion, setPrevDocVersion] = useState(currentDoc?.version);
  const [mode, setMode] = useState<'EDIT' | 'PREVIEW'>('EDIT');
  const [copied, setCopied] = useState(false);

  if (currentDoc && currentDoc.version !== prevDocVersion) {
    setPrevDocVersion(currentDoc.version);
    setTitle(currentDoc.title);
    setContent(currentDoc.content);
  }

  const handleSave = () => {
    if (activeChatId) {
      saveCanvasDocument(activeChatId, title, content);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleDownload = (format: 'MD' | 'HTML' | 'TXT' | 'PDF') => {
    setShowExportMenu(false);
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const safeTitle=escapeHtml(title),safeContent=escapeHtml(content);

    if (format === 'PDF') {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${safeTitle}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; max-width: 800px; margin: 0 auto; }
            h1, h2, h3 { color: #0f172a; }
            pre { background: #f1f5f9; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 13px; }
            code { background: #f1f5f9; padding: 2px 4px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <h1>${safeTitle}</h1>
          <hr/>
          <div style="white-space: pre-wrap;">${safeContent}</div>
          <script>window.onload = () => { window.print(); }</script>
        </body>
        </html>
      `);
      printWindow.document.close();
      return;
    }

    if (format === 'HTML') {
      const htmlDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${safeTitle}</title><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.6;color:#1e293b;}</style></head><body><h1>${safeTitle}</h1><div>${safeContent.replace(/\n/g, '<br/>')}</div></body></html>`;
      const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cleanTitle}.html`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    if (format === 'TXT') {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cleanTitle}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    // Default Markdown
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cleanTitle}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div
      id="canvas-panel"
      className="h-full flex flex-col border-l border-[var(--border-color)] bg-[var(--surface-color)]"
    >
      {/* Header */}
      <div className="p-3 border-b border-[var(--border-color)] flex items-center justify-between gap-2 relative">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Edit3 className="w-4 h-4 text-blue-400 shrink-0" />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            className="bg-transparent font-semibold text-xs border-b border-transparent focus:border-purple-500 focus:outline-none w-full truncate text-neutral-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-0.5 text-[11px]">
            <button
              onClick={() => setMode('EDIT')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                mode === 'EDIT' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 font-semibold' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
               <UiText source={"Edit"}/> </button>
            <button
              onClick={() => setMode('PREVIEW')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                mode === 'PREVIEW' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 font-semibold' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
               <UiText source={"Preview"}/> </button>
          </div>

          <button onClick={handleCopy} title={$t("Copy Markdown")} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors cursor-pointer">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Export dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              title={$t("Export Canvas Document")}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            {showExportMenu && (
              <div
                className="absolute right-0 top-full mt-1.5 w-40 rounded-xl shadow-xl border bg-white dark:bg-neutral-900 z-50 p-1 text-xs space-y-0.5 animate-fadeIn"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <button
                  onClick={() => handleDownload('MD')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors font-medium flex items-center justify-between cursor-pointer"
                >
                  <span><UiText source={"Markdown"}/></span>
                  <span className="text-[10px] opacity-50"><UiText source={".md"}/></span>
                </button>
                <button
                  onClick={() => handleDownload('HTML')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors font-medium flex items-center justify-between cursor-pointer"
                >
                  <span><UiText source={"HTML Webpage"}/></span>
                  <span className="text-[10px] opacity-50"><UiText source={".html"}/></span>
                </button>
                <button
                  onClick={() => handleDownload('PDF')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors font-medium flex items-center justify-between cursor-pointer"
                >
                  <span><UiText source={"Printable PDF"}/></span>
                  <span className="text-[10px] opacity-50"><UiText source={".pdf"}/></span>
                </button>
                <button
                  onClick={() => handleDownload('TXT')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors font-medium flex items-center justify-between cursor-pointer"
                >
                  <span><UiText source={"Plain Text"}/></span>
                  <span className="text-[10px] opacity-50"><UiText source={".txt"}/></span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            title={$t("Minimize Panel")}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors cursor-pointer text-blue-600 dark:text-blue-400"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor / Preview Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {mode === 'EDIT' ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            placeholder={$t("Write markdown here...")}
            className="w-full h-full min-h-[400px] bg-transparent focus:outline-none resize-none font-mono text-xs leading-relaxed text-[var(--text-color)]"
          />
        ) : (
          <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] font-mono opacity-60">
        <div className="flex items-center gap-2">
          <span>{wordCount}  <UiText source={"words"}/></span>
          <span>• {content.length}  <UiText source={"chars"}/></span>
        </div>
        <div className="flex items-center gap-1">
          <History className="w-3 h-3" />
          <span><UiText source={"v"}/>{currentDoc?.version || 1}</span>
        </div>
      </div>
    </div>
  );
}
