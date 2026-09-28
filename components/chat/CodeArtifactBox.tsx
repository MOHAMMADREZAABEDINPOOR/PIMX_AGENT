'use client';

import React, { useState, useMemo } from 'react';
import { GeneratedPreview } from '@/components/tools/GeneratedPreview';
import {
  Copy,
  Check,
  Download,
  Eye,
  Code2,
  Maximize2,
  Minimize2,
  Sparkles,
  FileCode,
  Globe,
  Terminal,
  FileText,
} from 'lucide-react';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export interface CodeArtifactBoxProps {
  language: string;
  code: string;
  title?: string;
  onSaveArtifact?: (title: string, kind: string) => void;
}

// Map language to extension and file type
function getFileMeta(lang: string, title?: string): { filename: string; ext: string; icon: any } {
  const l = (lang || '').toLowerCase().trim();
  if (title && title.includes('.')) {
    const ext = title.split('.').pop() || 'txt';
    return { filename: title, ext, icon: FileCode };
  }

  switch (l) {
    case 'html':
    case 'htm':
      return { filename: title ? `${title}.html` : 'index.html', ext: 'html', icon: Globe };
    case 'css':
      return { filename: title ? `${title}.css` : 'styles.css', ext: 'css', icon: FileCode };
    case 'js':
    case 'javascript':
      return { filename: title ? `${title}.js` : 'app.js', ext: 'js', icon: FileCode };
    case 'ts':
    case 'typescript':
      return { filename: title ? `${title}.ts` : 'main.ts', ext: 'ts', icon: FileCode };
    case 'tsx':
    case 'react':
    case 'jsx':
      return { filename: title ? `${title}.tsx` : 'Component.tsx', ext: 'tsx', icon: FileCode };
    case 'py':
    case 'python':
      return { filename: title ? `${title}.py` : 'script.py', ext: 'py', icon: Terminal };
    case 'json':
      return { filename: title ? `${title}.json` : 'data.json', ext: 'json', icon: FileText };
    case 'sql':
      return { filename: title ? `${title}.sql` : 'query.sql', ext: 'sql', icon: FileText };
    case 'bash':
    case 'sh':
    case 'shell':
      return { filename: title ? `${title}.sh` : 'script.sh', ext: 'sh', icon: Terminal };
    case 'svg':
      return { filename: title ? `${title}.svg` : 'illustration.svg', ext: 'svg', icon: Globe };
    default:
      return { filename: title ? `${title}.${l || 'txt'}` : `snippet.${l || 'txt'}`, ext: l || 'txt', icon: FileCode };
  }
}

export function CodeArtifactBox({
  language,
  code,
  title,
  onSaveArtifact,
}: CodeArtifactBoxProps) {
  const $t=useT();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const cleanLang = (language || 'text').toLowerCase().trim();
  const isWebPreviewable = ['html', 'htm', 'svg'].includes(cleanLang);
  const meta = useMemo(() => getFileMeta(cleanLang, title), [cleanLang, title]);
  const lines = useMemo(() => code.split('\n'), [code]);

  // Copy code with 3-second animated checkmark
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Direct file download to user's computer
  const handleDownload = () => {
    const mimeTypes: Record<string, string> = {
      html: 'text/html;charset=utf-8',
      css: 'text/css;charset=utf-8',
      js: 'text/javascript;charset=utf-8',
      ts: 'text/typescript;charset=utf-8',
      tsx: 'text/typescript;charset=utf-8',
      py: 'text/x-python;charset=utf-8',
      json: 'application/json;charset=utf-8',
      svg: 'image/svg+xml;charset=utf-8',
      sql: 'application/sql;charset=utf-8',
    };

    const mime = mimeTypes[meta.ext] || 'text/plain;charset=utf-8';
    const blob = new Blob([code], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = meta.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const Icon = meta.icon;

  return (
    <div
      className={`my-3.5 rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm not-prose ${
        isFullscreen
          ? 'fixed inset-4 z-50 bg-neutral-950/95 backdrop-blur-xl border-accent/50 shadow-2xl flex flex-col'
          : 'border-black/15 dark:border-white/10 bg-neutral-950 text-neutral-100'
      }`}
    >
      {/* 1. Header Toolbar (Filename, Tabs, Actions) */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-neutral-900/90 border-b border-white/10 select-none">
        {/* Left: File Badge & Tabs */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
            <Icon className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="font-semibold text-white truncate max-w-[180px] sm:max-w-[240px]">
              {meta.filename}
            </span>
            <span className="text-[10px] text-neutral-400 opacity-70 uppercase font-sans">
              ({cleanLang})
            </span>
          </div>

          {/* Toggle between Code and Live Preview if web previewable */}
          {isWebPreviewable && (
            <div className="flex items-center p-0.5 rounded-xl bg-black/40 border border-white/10 text-[11px] font-sans">
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  activeTab === 'code'
                    ? 'bg-accent text-white font-medium shadow-2xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3 h-3" />
                <span><UiText source={"Code"}/></span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-accent text-white font-medium shadow-2xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span><UiText source={"Live Preview"}/></span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Actions (Download, Copy, Save Artifact, Fullscreen) */}
        <div className="flex items-center gap-1.5 shrink-0 text-xs">
          {/* Line count */}
          <span className="hidden sm:inline text-[10px] font-mono text-neutral-400 mr-1">
            {lines.length}  <UiText source={"lines"}/> </span>

          {/* Download File Button */}
          <button
            type="button"
            onClick={handleDownload}
            title={$t("Download {0}",meta.filename)}
            className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-medium hidden xs:inline"><UiText source={"Download"}/></span>
          </button>

          {/* Copy Code Button (with 3-second animated state) */}
          <button
            type="button"
            onClick={handleCopy}
            className={`px-2.5 py-1 rounded-xl border text-[11px] font-medium transition-all duration-300 flex items-center gap-1 cursor-pointer ${
              copied
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 scale-[1.03] shadow-xs'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-200 hover:text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 animate-in zoom-in-50 duration-200" />
                <span><UiText source={"Copied!"}/></span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 opacity-70" />
                <span><UiText source={"Copy"}/></span>
              </>
            )}
          </button>

          {/* Save Artifact Shortcut */}
          {onSaveArtifact && isWebPreviewable && (
            <button
              type="button"
              onClick={() => onSaveArtifact(title || meta.filename, cleanLang.toUpperCase())}
              className="px-2.5 py-1 rounded-xl bg-accent/15 hover:bg-accent/25 border border-accent/30 text-accent transition-colors flex items-center gap-1 cursor-pointer"
              title={$t("Save as Workspace Artifact")}
            >
              <Sparkles className="w-3 h-3 text-accent" />
              <span className="text-[11px] hidden sm:inline"><UiText source={"Artifact"}/></span>
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={$t(isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View')}
            className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Body View: Code View or Live Preview */}
      {activeTab === 'preview' && isWebPreviewable ? (
        <div className={`w-full bg-white dark:bg-neutral-900 ${isFullscreen ? 'flex-1 min-h-0' : 'h-[360px] sm:h-[420px]'}`}>
          <GeneratedPreview
            html={
              cleanLang === 'svg'
                ? `<!DOCTYPE html><html><body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f172a;">${code}</body></html>`
                : code
            }
            title={$t(meta.filename)}
            className="w-full h-full border-none"
          />
        </div>
      ) : (
        <div className={`relative overflow-x-auto ${isFullscreen ? 'flex-1 min-h-0 overflow-y-auto' : 'max-h-[460px] overflow-y-auto'}`}>
          <div className="flex font-mono text-[12px] sm:text-[13px] leading-relaxed select-text">
            {/* Line Numbers Column */}
            <div className="py-3 px-2.5 bg-neutral-900/50 text-neutral-500 select-none text-right font-mono border-r border-white/5 shrink-0 min-w-[42px]">
              {lines.map((_, i) => (
                <div key={i} className="leading-relaxed">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code Content */}
            <pre className="p-3 text-emerald-200/90 whitespace-pre overflow-x-auto flex-1 leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
