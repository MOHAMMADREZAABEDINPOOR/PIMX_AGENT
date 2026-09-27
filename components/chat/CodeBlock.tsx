'use client';

import React, { useState } from 'react';
import { Sparkles, Check, Copy } from 'lucide-react';
import {UiText} from '@/components/i18n/LocaleProvider';

export function CodeBlock({
  language,
  code,
  onSaveArtifact,
}: {
  language: string;
  code: string;
  onSaveArtifact?: (title: string, kind: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isArtifactKind = ['html', 'react', 'svg', 'mermaid'].includes(language.toLowerCase());

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/10 bg-black/40 text-xs" dir="ltr">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-white/5 border-b border-white/10 font-mono text-[11px]">
        <span className="uppercase text-muted font-bold">{language}</span>
        <div className="flex items-center gap-1">
          {isArtifactKind && onSaveArtifact && (
            <button
              type="button"
              onClick={() => onSaveArtifact(`${language.toUpperCase()} Artifact`, language.toUpperCase())}
              className="px-2 py-0.5 rounded-sm bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 flex items-center gap-1 text-[10px] cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span><UiText source={"Save Artifact"}/></span>
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="px-2 py-0.5 rounded-sm hover:bg-white/10 flex items-center gap-1 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? <UiText source={"Copied"}/> : <UiText source={"Copy"}/>}</span>
          </button>
        </div>
      </div>
      <pre className="p-3.5 overflow-x-auto text-[13px] font-mono leading-relaxed text-emerald-200/90">
        <code>{code}</code>
      </pre>
    </div>
  );
}
