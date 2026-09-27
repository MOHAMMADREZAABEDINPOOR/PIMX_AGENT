'use client';

import React, { useState } from 'react';
import {
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export interface WebSearchSource {
  title: string;
  url: string;
  snippet?: string;
  domain?: string;
}

export interface WebBrowsingActivityProps {
  query?: string;
  sources?: WebSearchSource[];
  isSearching?: boolean;
}

function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return 'web';
  }
}

export function WebBrowsingActivity({
  query,
  sources = [],
  isSearching = false,
}: WebBrowsingActivityProps) {
  const $t=useT();
  const [isOpen, setIsOpen] = useState(false);

  if (!query && sources.length === 0 && !isSearching) return null;

  const shown = isOpen ? sources : sources.slice(0, 4);

  return (
    <div className="my-2 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] overflow-hidden text-xs not-prose">
      {/* Compact single-line header (ChatGPT/Grok style) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setIsOpen(!isOpen);
        }}
        className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors cursor-pointer select-none"
      >
        {isSearching ? (
          <Loader2 className="w-3.5 h-3.5 text-neutral-500 animate-spin shrink-0" />
        ) : (
          <Globe className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
        )}
        <span className="font-medium text-neutral-700 dark:text-neutral-300 truncate">
          {isSearching
            ? query
              ? `Searching: ${query}`
              : <UiText source={"Searching the web…"}/>
            : `${sources.length} source${sources.length === 1 ? '' : 's'}`}
        </span>
        {sources.length > 0 && (
          <span className="shrink-0 text-[10px] text-neutral-400 dark:text-neutral-500">
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </span>
        )}
      </div>

      {/* Compact source rows: favicon + title + domain */}
      {sources.length > 0 && (
        <div className="px-2 pb-2 pt-0.5 flex flex-wrap gap-1.5">
          {shown.map((src, idx) => {
            const domain = src.domain || extractDomain(src.url);
            return (
              <a
                key={`${src.url}-${idx}`}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                title={$t(src.snippet || src.title)}
                className="group inline-flex items-center gap-1.5 max-w-full pl-1 pr-2 py-1 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                  alt={$t("")}
                  className="w-3.5 h-3.5 rounded-full shrink-0 bg-neutral-100 dark:bg-neutral-800"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="text-[11px] text-neutral-700 dark:text-neutral-300 truncate max-w-[180px] group-hover:text-neutral-900 dark:group-hover:text-white">
                  {src.title || domain}
                </span>
                <span className="text-[10px] font-mono text-neutral-400 shrink-0">[{idx + 1}]</span>
                <ExternalLink className="w-2.5 h-2.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>
            );
          })}
          {!isOpen && sources.length > 4 && (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center px-2 py-1 rounded-full text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
            >
              +{sources.length - 4}  <UiText source={"more"}/> </button>
          )}
        </div>
      )}
    </div>
  );
}
