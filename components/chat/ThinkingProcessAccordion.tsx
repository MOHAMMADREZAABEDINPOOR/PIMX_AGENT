'use client';

import { useId, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Brain, Check, ChevronDown, Clock, Copy } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { hasRealReasoning } from '@/lib/agent/orchestrator';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export interface ThinkingProcessAccordionProps {
  reasoning: string; reasoningMs?: number; isThinking?: boolean; defaultOpen?: boolean;
}

export function ThinkingProcessAccordion({ reasoning, reasoningMs, isThinking = false, defaultOpen = false }: ThinkingProcessAccordionProps) {
  const $t=useT();
  const settings = useAppStore(s => s.settings);
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const id = useId();
  const real = hasRealReasoning(reasoning);
  if (!real && !isThinking) return null;
  const fa = /[\u0600-\u06FF]/.test(reasoning);
  return (
    <section className="reasoning-panel not-prose mb-3" dir={fa ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-start text-xs font-semibold cursor-pointer" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={id}>
          <Brain className={`h-4 w-4 shrink-0 ${isThinking ? 'text-violet-500' : 'text-muted'}`} />
          <span>{fa ? <UiText source={"خلاصهٔ استدلال مدل"}/> : <UiText source={"Model reasoning summary"}/>}</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {real && reasoningMs ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-600 dark:text-emerald-400" dir="ltr"><Clock className="h-3 w-3" />{(reasoningMs / 1000).toFixed(1)}<UiText source={"s"}/></span> : null}
        {real && <button type="button" aria-label={$t("Copy reasoning")} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer" onClick={async () => { await navigator.clipboard.writeText(reasoning); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}</button>}
      </div>
      {open && <div id={id} className="reasoning-text border-t border-[var(--border-color)] overflow-y-auto px-4 py-3" style={{ fontSize: settings.reasoningTextSize ?? 14, maxHeight: settings.reasoningMaxHeight ?? 360 }}>
        {real ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{reasoning}</ReactMarkdown> : <p className="text-muted">{fa ? <UiText source={"در انتظار خلاصهٔ استدلال از مدل…"}/> : <UiText source={"Waiting for the model’s reasoning summary…"}/>}</p>}
      </div>}
    </section>
  );
}
