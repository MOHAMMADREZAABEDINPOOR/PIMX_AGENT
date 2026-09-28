'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  PanelRightClose,
  Sparkles,
  Code,
  Play,
  Copy,
  Check,
  Download,
  Maximize2,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { ArtifactEntity } from '@/lib/types';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { GeneratedPreview } from './GeneratedPreview';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export function ArtifactsPanel({ onClose }: { onClose: () => void }) {
  const $t=useT();
  const { activeChatId, artifacts } = useAppStore();
  const chatArtifacts = artifacts.filter((a) => a.chatId === activeChatId);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'PREVIEW' | 'CODE'>('PREVIEW');
  const [copied, setCopied] = useState(false);

  const activeArtifact: ArtifactEntity | undefined =
    chatArtifacts.find((a) => a.id === selectedId) || chatArtifacts[0];

  const handleCopy = () => {
    if (activeArtifact) {
      navigator.clipboard.writeText(activeArtifact.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!activeArtifact) return;
    const ext = activeArtifact.language === 'html' ? 'html' : activeArtifact.language === 'svg' ? 'svg' : 'tsx';
    const blob = new Blob([activeArtifact.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeArtifact.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate safe sandboxed HTML for iframe
  const iframeSrcDoc = getArtifactIframeSrcDoc(activeArtifact);

  return (
    <div
      id="artifacts-panel"
      className="h-full flex flex-col border-l border-[var(--border-color)] bg-[var(--surface-color)]"
    >
      {/* Header */}
      <div className="p-3 border-b border-[var(--border-color)] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          {chatArtifacts.length > 1 ? (
            <div className="w-48">
              <CustomSelect
                value={activeArtifact?.id || ''}
                onChange={(val) => setSelectedId(val)}
                options={chatArtifacts.map((a) => ({
                  value: a.id,
                  label: a.title,
                  badge: `v${a.version}`,
                }))}
                size="xs"
              />
            </div>
          ) : (
            <span className="font-semibold text-xs truncate">
              {activeArtifact?.title || 'Interactive Artifact Sandbox'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-0.5 text-[11px]">
            <button
              onClick={() => setViewMode('PREVIEW')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                viewMode === 'PREVIEW' ? 'bg-accent/20 text-accent dark:text-accent font-semibold' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
               <UiText source={"Preview"}/> </button>
            <button
              onClick={() => setViewMode('CODE')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                viewMode === 'CODE' ? 'bg-accent/20 text-accent dark:text-accent font-semibold' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
               <UiText source={"Code"}/> </button>
          </div>

          <button onClick={handleCopy} title={$t("Copy Code")} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors cursor-pointer">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button onClick={handleDownload} title={$t("Download File")} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors cursor-pointer">
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            title={$t("Minimize Panel")}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors cursor-pointer text-amber-600 dark:text-amber-400"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-hidden bg-black/40">
        {!activeArtifact ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-xs opacity-70">
            <Sparkles className="w-10 h-10 mb-3 opacity-60 text-amber-400" />
            <h4 className="font-semibold text-sm mb-1 text-neutral-900 dark:text-white"><UiText source={"No Active Artifacts Yet"}/></h4>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-xs leading-relaxed">
               <UiText source={"Ask AI in the chat to generate interactive code snippets, charts, SVG, or small React apps for you."}/> </p>
          </div>
        ) : viewMode === 'PREVIEW' ? (
          <GeneratedPreview
            title={$t(activeArtifact.title)}
            html={iframeSrcDoc}
            className="w-full h-full border-0 bg-white dark:bg-[#090A0C]"
          />
        ) : (
          <pre className="p-4 h-full overflow-auto font-mono text-xs text-emerald-200/90 leading-relaxed">
            <code>{activeArtifact.content}</code>
          </pre>
        )}
      </div>

      {/* Footer */}
      {activeArtifact && (
        <div className="p-2.5 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] font-mono opacity-60">
          <span><UiText source={"Kind:"}/> {activeArtifact.kind}  <UiText source={"• Lang:"}/> {activeArtifact.language}</span>
          <span><UiText source={"v"}/>{activeArtifact.version}</span>
        </div>
      )}
    </div>
  );
}

function getArtifactIframeSrcDoc(activeArtifact: ArtifactEntity | undefined): string {
  if (!activeArtifact) return '';
  if (activeArtifact.kind === 'HTML' || activeArtifact.language === 'html') {
    return activeArtifact.content;
  }
  if (activeArtifact.kind === 'SVG' || activeArtifact.language === 'svg') {
    return `<!DOCTYPE html><html><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#090A0C;">${activeArtifact.content}</body></html>`;
  }
  const source = activeArtifact.content
    .replace(/import\s+type\s+[\s\S]*?\s+from\s+['"][^'"]+['"];?/g, '')
    .replace(/import\s+([\s\S]*?)\s+from\s+['"]react['"];?/g, (_statement, bindings: string) => {
      const named = bindings.match(/\{([\s\S]*?)\}/)?.[1];
      const alias = bindings.split(',')[0].trim();
      const namespace = bindings.match(/\*\s+as\s+([a-zA-Z_$][\w$]*)/)?.[1];
      const declarations = named ? `const {${named.replace(/\bas\b/g, ':')}} = React;` : '';
      return (namespace && namespace !== 'React' ? `const ${namespace} = React;` : alias && !alias.startsWith('{') && alias !== 'React' && !alias.startsWith('*') ? `const ${alias} = React;` : '') + declarations;
    })
    .replace(/export\s+default\s+/g, 'const __PimxApp = ')
    .replace(/export\s+(?=(?:function|const|let|class)\b)/g, '');
  const runnable = source + `\nReactDOM.createRoot(document.getElementById('root')).render(React.createElement(typeof __PimxApp !== 'undefined' ? __PimxApp : App));`;
  const encoded = JSON.stringify(runnable).replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone@7.28.5/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>body { margin: 0; padding: 16px; font-family: system-ui; background: #090A0C; color: #F4F4F8; }</style>
</head>
<body>
  <div id="root"></div>
  <script>
    function showError(message) { const element = document.createElement('p'); element.setAttribute('role', 'alert'); element.textContent = message; document.body.append(element); }
    window.addEventListener('error', event => showError(event.message || 'The generated component could not run.'));
    try {
      const result = Babel.transform(${encoded}, { filename: 'artifact.tsx', presets: [['typescript', { isTSX: true, allExtensions: true }], 'react'] });
      const script = document.createElement('script'); script.textContent = result.code; document.body.append(script);
    } catch (error) { showError(error.message || 'The generated component could not run.'); }
  </script>
</body>
</html>`;
}
