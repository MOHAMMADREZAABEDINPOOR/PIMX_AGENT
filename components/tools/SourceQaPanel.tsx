'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  PanelRightClose,
  Database,
  Plus,
  Trash2,
  Globe,
  FileText,
  Search,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { retrievePassages } from '@/lib/rag/engine';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export function SourceQaPanel({ onClose }: { onClose: () => void }) {
  const $t=useT();
  const { activeChatId, sources: allSources, sourceChunks, addSource, deleteSource, sendMessage } = useAppStore();
  const sources = allSources.filter(source => !source.chatId || source.chatId === activeChatId);

  const [addMode, setAddMode] = useState<'TEXT' | 'URL'>('TEXT');
  const [title, setTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [testQuery, setTestQuery] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);

  const handleAddText = () => {
    if (!title.trim() || !textContent.trim()) return;
    addSource(activeChatId || undefined, undefined, title.trim(), textContent.trim(), 'PASTE');
    setTitle('');
    setTextContent('');
  };

  const handleFetchUrl = async () => {
    if (!urlInput.trim()) return;
    setIsFetchingUrl(true);
    try {
      const res = await fetch(`/api/fetch?url=${encodeURIComponent(urlInput.trim())}`);
      if (!res.ok) throw new Error(`Source could not be opened (HTTP ${res.status}).`);
      const text = await res.text();
      const pageTitle = urlInput.replace(/^https?:\/\//, '').split('/')[0];
      addSource(activeChatId || undefined, undefined, pageTitle, text, urlInput.trim());
      setUrlInput('');
    } catch (err: any) {
      alert(`Failed to fetch URL: ${err.message}`);
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleTestRetrieval = () => {
    if (!testQuery.trim()) return;
    const results = retrievePassages(testQuery.trim(), sources, sourceChunks, 5);
    setTestResults(results);
  };

  return (
    <div
      id="source-qa-panel"
      className="h-full flex flex-col border-l border-[var(--border-color)] bg-[var(--surface-color)]"
    >
      {/* Header */}
      <div className="p-3 border-b border-[var(--border-color)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-xs"><UiText source={"Chat with Sources (RAG)"}/></span>
        </div>
        <button
          onClick={onClose}
          title={$t("Minimize Panel")}
          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors cursor-pointer text-emerald-600 dark:text-emerald-400"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Source Addition Card */}
        <div
          className="p-3.5 rounded-2xl border space-y-3"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-color)' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-neutral-900 dark:text-white"><UiText source={"Add Knowledge Source"}/></span>
            <div className="flex items-center rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-0.5 text-[11px]">
              <button
                onClick={() => setAddMode('TEXT')}
                className={`px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                  addMode === 'TEXT' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 font-semibold' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                 <UiText source={"Paste Text / Markdown"}/> </button>
              <button
                onClick={() => setAddMode('URL')}
                className={`px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                  addMode === 'URL' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 font-semibold' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                 <UiText source={"Fetch Web URL"}/> </button>
            </div>
          </div>

          {addMode === 'TEXT' ? (
            <div className="space-y-2">
              <input
                type="text"
                placeholder={$t("Source Title / Document Name...")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black/[0.03] dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-purple-500 text-neutral-900 dark:text-white placeholder-neutral-400"
              />
              <textarea
                rows={3}
                placeholder={$t("Paste document text or content to index...")}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="w-full bg-black/[0.03] dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-purple-500 resize-none font-mono text-[11px] text-neutral-900 dark:text-white placeholder-neutral-400"
              />
              <button
                onClick={handleAddText}
                disabled={!title.trim() || !textContent.trim()}
                className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all shadow-xs disabled:opacity-40 cursor-pointer"
              >
                 <UiText source={"Chunk & Index Document"}/> </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder={$t("https://example.com/article")}
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 bg-black/[0.03] dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-purple-500 text-neutral-900 dark:text-white placeholder-neutral-400"
                />
                <button
                  onClick={handleFetchUrl}
                  disabled={!urlInput.trim() || isFetchingUrl}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all disabled:opacity-40 shrink-0 cursor-pointer"
                >
                  {isFetchingUrl ? <UiText source={"Scraping..."}/> : <UiText source={"Fetch"}/>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Existing Indexed Sources */}
        <div className="space-y-2">
          <div className="font-semibold text-xs opacity-75"><UiText source={"Indexed Sources ("}/>{sources.length})</div>
          {sources.length === 0 ? (
            <div className="py-6 text-center text-xs opacity-40"><UiText source={"No sources indexed yet."}/></div>
          ) : (
            sources.map((src, i) => (
              <div
                key={src.id}
                className="p-3 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="font-medium text-xs truncate flex items-center gap-1.5">
                    <span className="text-emerald-400 font-mono text-[10px]"><UiText source={"[S"}/>{i + 1}]</span>
                    <span className="truncate">{src.title}</span>
                  </div>
                  <div className="text-[10px] opacity-60 font-mono">
                    {src.chunkCount}  <UiText source={"chunks •"}/> {src.origin}
                  </div>
                </div>
                <button
                  onClick={() => deleteSource(src.id)}
                  className="p-1 text-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Citation Search Tester */}
        {sources.length > 0 && (
          <div
            className="p-3 rounded-2xl border space-y-2"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-color)' }}
          >
            <span className="font-semibold text-xs"><UiText source={"Test Grounding Retrieval"}/></span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={$t("Enter query to test TF-IDF retrieval...")}
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTestRetrieval()}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none"
              />
              <button
                onClick={handleTestRetrieval}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 font-medium"
              >
                 <UiText source={"Test"}/> </button>
            </div>

            {testResults.length > 0 && (
              <div className="space-y-1.5 mt-2 max-h-48 overflow-y-auto">
                {testResults.map((r, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] space-y-1"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-emerald-300">
                      <span>[{r.citationKey}] {r.sourceTitle}</span>
                      <span><UiText source={"Score:"}/> {r.score.toFixed(3)}</span>
                    </div>
                    <p className="opacity-90 leading-tight line-clamp-3">{r.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
