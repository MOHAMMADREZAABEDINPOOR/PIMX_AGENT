'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  X,
  Download,
  FileText,
  FileCode,
  FileCheck,
  Printer,
  Copy,
  Check,
} from 'lucide-react';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export function ExportModal() {
  const $t=useT();
  const {
    exportModalOpen,
    setExportModalOpen,
    activeChatId,
    chats,
    getActivePath,
  } = useAppStore();

  const [format, setFormat] = useState<'MARKDOWN' | 'JSON' | 'HTML' | 'PDF'>('MARKDOWN');
  const [copied, setCopied] = useState(false);

  if (!exportModalOpen) return null;

  const currentChat = chats.find((c) => c.id === activeChatId);
  const messages = activeChatId ? getActivePath(activeChatId) : [];

  const generateMarkdown = () => {
    let md = `# ${currentChat?.title || 'Conversation Transcript'}\n\n`;
    md += `*Exported on ${new Date().toLocaleString()} from Pimx Agent AI*\n\n---\n\n`;

    for (const msg of messages) {
      const sender = msg.role === 'user' ? '**User**' : `**Assistant (${msg.modelId || 'Model'})**`;
      md += `### ${sender}\n\n${msg.content}\n\n`;
      if (msg.reasoning) {
        md += `> **Thinking Process:**\n> ${msg.reasoning.replace(/\n/g, '\n> ')}\n\n`;
      }
      md += `---\n\n`;
    }
    return md;
  };

  const generateJSON = () => {
    return JSON.stringify(
      {
        chat: currentChat,
        exportedAt: new Date().toISOString(),
        messages: messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          modelId: m.modelId,
          reasoning: m.reasoning,
          promptTokens: m.promptTokens,
          completionTokens: m.completionTokens,
          createdAt: m.createdAt,
        })),
      },
      null,
      2
    );
  };

  const generateHTML = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${currentChat?.title || 'Chat Transcript'}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #090A0C; color: #F4F4F8; line-height: 1.6; padding: 32px; max-width: 800px; margin: auto; }
    h1 { border-bottom: 1px solid #333; padding-bottom: 12px; }
    .msg { margin-bottom: 24px; padding: 16px; border-radius: 12px; background: #121417; border: 1px solid #222; }
    .user { background: #181c24; border-color: #2b3548; }
    .role { font-weight: bold; font-size: 13px; margin-bottom: 8px; color: #8B7CFF; }
    pre { background: #000; padding: 12px; border-radius: 8px; overflow-x: auto; color: #a7f3d0; }
  </style>
</head>
<body>
  <h1>${currentChat?.title || 'Chat Transcript'}</h1>
  ${messages
    .map(
      (m) => `
    <div class="msg ${m.role}">
      <div class="role">${m.role.toUpperCase()} ${m.modelId ? `(${m.modelId})` : ''}</div>
      <div>${m.content.replace(/\n/g, '<br/>')}</div>
    </div>
  `
    )
    .join('')}
</body>
</html>`;
  };

  const handleDownload = () => {
    let content = '';
    let mimeType = 'text/plain';
    let ext = 'txt';

    if (format === 'MARKDOWN') {
      content = generateMarkdown();
      mimeType = 'text/markdown';
      ext = 'md';
    } else if (format === 'JSON') {
      content = generateJSON();
      mimeType = 'application/json';
      ext = 'json';
    } else if (format === 'HTML') {
      content = generateHTML();
      mimeType = 'text/html';
      ext = 'html';
    } else if (format === 'PDF') {
      window.print();
      return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(currentChat?.title || 'transcript').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    setExportModalOpen(false);
  };

  const handleCopy = () => {
    let content = '';
    if (format === 'MARKDOWN') content = generateMarkdown();
    if (format === 'JSON') content = generateJSON();
    if (format === 'HTML') content = generateHTML();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="export-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
    >
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        style={{
          backgroundColor: 'var(--surface-color)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h3 className="font-semibold text-sm"><UiText source={"Export Conversation"}/></h3>
            <p className="text-xs text-muted"><UiText source={"Exports on-screen active branch only with preserved markdown."}/></p>
          </div>
          <button onClick={() => setExportModalOpen(false)} className="p-1 rounded-md opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <FormatOption
              title={$t("Markdown")}
              icon={<FileText className="w-4 h-4" />}
              active={format === 'MARKDOWN'}
              onClick={() => setFormat('MARKDOWN')}
            />
            <FormatOption
              title={$t("JSON Data")}
              icon={<FileCode className="w-4 h-4" />}
              active={format === 'JSON'}
              onClick={() => setFormat('JSON')}
            />
            <FormatOption
              title={$t("HTML File")}
              icon={<FileCheck className="w-4 h-4" />}
              active={format === 'HTML'}
              onClick={() => setFormat('HTML')}
            />
            <FormatOption
              title={$t("Print / PDF")}
              icon={<Printer className="w-4 h-4" />}
              active={format === 'PDF'}
              onClick={() => setFormat('PDF')}
            />
          </div>

          <div
            className="p-3 rounded-xl border text-xs font-mono max-h-48 overflow-y-auto opacity-75"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-color)' }}
          >
            <pre className="whitespace-pre-wrap">
              {format === 'MARKDOWN' && generateMarkdown()}
              {format === 'JSON' && generateJSON()}
              {format === 'HTML' && generateHTML()}
              {format === 'PDF' && 'Will open platform printer dialog for high-resolution vector PDF export.'}
            </pre>
          </div>
        </div>

        <div className="p-4 border-t flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={handleCopy}
            disabled={format === 'PDF'}
            className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-xs font-medium flex items-center gap-1.5 disabled:opacity-30 transition-colors text-neutral-800 dark:text-neutral-200 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? <UiText source={"Copied to Clipboard"}/> : <UiText source={"Copy All"}/>}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setExportModalOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-xs font-medium transition-colors text-neutral-600 dark:text-neutral-300 cursor-pointer"
            >
               <UiText source={"Cancel"}/> </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl text-xs font-medium text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{format === 'PDF' ? <UiText source={"Print Document"}/> : <UiText source={"Download File"}/>}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormatOption({
  title,
  icon,
  active,
  onClick,
}: {
  title: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 text-xs font-medium transition-all cursor-pointer ${
        active
          ? 'bg-accent/15 dark:bg-white/15 border-accent dark:border-white/30 text-accent dark:text-white shadow-2xs font-semibold'
          : 'bg-black/[0.02] dark:bg-white/5 border-black/10 dark:border-transparent hover:border-black/20 dark:hover:border-white/15 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
      }`}
    >
      {icon}
      <span>{title}</span>
    </button>
  );
}
