'use client';

/**
 * AgentTimeline
 *
 * The agent's working memory, rendered as an instrument rather than a log.
 *
 * Honesty rules that this component enforces:
 *   - A reasoning duration is shown only when a real trace was captured. The
 *     store parks a placeholder seed while a run streams; that is not thinking,
 *     so it is never presented as "thought for N seconds".
 *   - Only phases that actually ran are listed. A finished run never leaves a
 *     permanently pending "Synthesize" row.
 *   - The captured reasoning is expanded by default, because the point of the
 *     surface is to show the thinking rather than hide it behind a chevron.
 *
 * Search parsing, the elapsed timer, the Persian/English string switching and
 * the tool-step handling are unchanged product behaviour.
 */

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Globe,
  Search,
  Sparkles,
  XCircle,
} from 'lucide-react';
import type { ToolStep } from '@/lib/types';
import { hasRealReasoning } from '@/lib/agent/orchestrator';
import { DepthCard, Scene3D, SignalRail, StateChip } from '@/components/agent/primitives';
import { useAppStore } from '@/lib/store/useAppStore';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

interface AgentTimelineProps {
  steps: ToolStep[];
  reasoning?: string;
  reasoningMs?: number;
  isStreaming?: boolean;
}

interface ParsedSearch {
  count: number;
  queries: string[];
  sources: Array<{ title: string; url: string; snippet?: string; source?: string }>;
}

function parseSearchStep(step: ToolStep): ParsedSearch {
  const fallback: ParsedSearch = { count: 0, queries: [], sources: [] };
  try {
    if (!step.output) {
      const q = step.input?.query;
      return { ...fallback, queries: q ? [String(q)] : [] };
    }
    const parsed = JSON.parse(step.output);
    return {
      count: parsed.count ?? (Array.isArray(parsed.sources) ? parsed.sources.length : 0),
      queries: Array.isArray(parsed.queries)
        ? parsed.queries.map(String)
        : step.input?.query
          ? [String(step.input.query)]
          : [],
      sources: Array.isArray(parsed.sources) ? parsed.sources : [],
    };
  } catch {
    return fallback;
  }
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'web';
  }
}

type PhaseKey = 'think' | 'search' | 'read' | 'synth';
type PhaseStatus = 'done' | 'active' | 'pending' | 'failed';

export function AgentTimeline({ steps, reasoning, reasoningMs, isStreaming = false }: AgentTimelineProps) {
  const $t=useT();
  const settings = useAppStore(s => s.settings);
  const [open, setOpen] = useState(true);
  // Thinking is visible by default: showing the trace is the whole point.
  const [thinkOpen, setThinkOpen] = useState(settings.expandThinking);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [now, setNow] = useState(0);

  const list = React.useMemo(() => steps || [], [steps]);
  const search = list.find((s) => s.toolName === 'web_search');
  const plan = list.find((s) => s.toolName === 'agent_plan' && s.input?.modelId);
  const read = list.find((s) => s.toolName === 'agent_read');
  const synth = list.find((s) => s.toolName === 'agent_synthesize');

  const startedAt = React.useMemo(() => {
    const ts = list.map((s) => s.timestamp || 0).filter(Boolean);
    return ts.length > 0 ? Math.min(...ts) : 0;
  }, [list]);

  useEffect(() => {
    if (!isStreaming) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [isStreaming]);

  const liveSecs =
    startedAt > 0 && now > 0 ? Math.max(0, (now - startedAt) / 1000).toFixed(0) : null;

  const fa = /[\u0600-\u06FF]/.test(`${reasoning || ''} ${search?.input?.query || ''} ${plan?.input?.query || ''}`);

  // Only a genuine trace counts. The live placeholder seed does not.
  const reasoningIsReal = hasRealReasoning(reasoning);
  const seconds = reasoningIsReal && reasoningMs ? (reasoningMs / 1000).toFixed(1) : null;

  const parsed = search ? parseSearchStep(search) : null;
  const shownSources = parsed ? (sourcesOpen ? parsed.sources : parsed.sources.slice(0, 6)) : [];

  let readInfo = { read: 0, of: 0 };
  try {
    if (read?.output) {
      const p = JSON.parse(read.output);
      readInfo = { read: p.read ?? 0, of: p.of ?? 0 };
    } else if (read?.input && Array.isArray((read.input as any).urls)) {
      readInfo = { read: 0, of: (read.input as any).urls.length };
    }
  } catch {
    // keep defaults
  }

  const T = fa
    ? {
        title: 'فعالیت ایجنت',
        thought: seconds ? `تفکر در ${seconds} ثانیه` : 'استدلال مدل',
        reasoningLive: 'در حال استدلال',
        searched: (n: number) => `جستجو در ${n} منبع وب`,
        searchedNone: 'جستجوی وب بدون نتیجه',
        read: `خواندن ${readInfo.read} از ${readInfo.of} منبع`,
        synth: 'سنتز نهایی',
        more: (n: number) => `+${n} مورد بیشتر`,
        liveSearch: (q: string) => (q ? `در حال جستجو: ${q}` : 'در حال جستجو در وب'),
        liveRead: 'در حال خواندن منابع',
        liveThink: 'در حال استدلال روی مسئله',
        liveSynth: 'در حال ترکیب نتایج',
        liveWork: 'در حال اجرا',
        noResults: 'هیچ منبعی از وب دریافت نشد؛ پاسخ از دانش خود مدل داده شده است.',
        phaseThink: 'تفکر',
        phaseSearch: 'جستجو',
        phaseRead: 'خواندن',
        phaseSynth: 'سنتز',
        elapsed: 'زمان',
        steps: 'گام‌ها',
        phase: 'وضعیت',
        failed: 'یک گام با خطا متوقف شد',
        collapse: 'بستن جزئیات فعالیت',
        expand: 'نمایش جزئیات فعالیت',
      }
    : {
        title: 'Agent activity',
        thought: seconds ? `Thought for ${seconds}s` : 'Model reasoning',
        reasoningLive: 'Reasoning',
        searched: (n: number) => `Searched ${n} web source${n === 1 ? '' : 's'}`,
        searchedNone: 'Web search returned nothing',
        read: `Read ${readInfo.read} of ${readInfo.of} sources`,
        synth: 'Synthesis',
        more: (n: number) => `+${n} more`,
        liveSearch: (q: string) => (q ? `Searching: ${q}` : 'Searching the web'),
        liveRead: 'Reading sources',
        liveThink: 'Reasoning through the problem',
        liveSynth: 'Synthesizing',
        liveWork: 'Working',
        noResults: 'No web sources were retrieved; the answer came from the model knowledge.',
        phaseThink: 'Think',
        phaseSearch: 'Search',
        phaseRead: 'Read',
        phaseSynth: 'Synthesize',
        elapsed: 'Elapsed',
        steps: 'Steps',
        phase: 'State',
        failed: 'A step stopped with an error',
        collapse: 'Collapse agent activity',
        expand: 'Expand agent activity',
      };

  const liveStep = [...list].reverse().find((s) => s.status === 'CALLING');
  let liveText = T.liveWork;
  if (liveStep?.toolName === 'web_search') {
    const q = liveStep.input?.queries?.[0] || liveStep.input?.query || '';
    liveText = T.liveSearch(String(q).slice(0, 80));
  } else if (liveStep?.toolName === 'agent_read') {
    liveText = T.liveRead;
  } else if (liveStep?.toolName === 'agent_synthesize') {
    liveText = T.liveSynth;
  } else if (liveStep?.toolName === 'agent_plan' || (isStreaming && reasoningIsReal)) {
    liveText = T.liveThink;
  }

  const hasFailed = list.some((s) => s.status === 'FAILED');

  // Only phases that actually happened (or are happening) are listed, so a
  // finished run cannot leave an empty "pending" row behind.
  const phases: Array<{ key: PhaseKey; label: string; icon: typeof Brain }> = [];
  if (plan || reasoningIsReal || isStreaming) {
    phases.push({ key: 'think', label: T.phaseThink, icon: Brain });
  }
  if (search) phases.push({ key: 'search', label: T.phaseSearch, icon: Globe });
  if (read) phases.push({ key: 'read', label: T.phaseRead, icon: BookOpen });
  if (synth) phases.push({ key: 'synth', label: T.phaseSynth, icon: Sparkles });

  const phaseStatus = (key: PhaseKey): PhaseStatus => {
    if (key === 'think') {
      if (plan) return plan.status === 'CALLING' ? 'active' : plan.status === 'FAILED' ? 'failed' : 'done';
      if (isStreaming) return reasoningIsReal ? 'active' : 'pending';
      return reasoningIsReal ? 'done' : 'pending';
    }
    const step = key === 'search' ? search : key === 'read' ? read : synth;
    if (!step) return 'pending';
    if (step.status === 'FAILED') return 'failed';
    if (step.status === 'CALLING') return 'active';
    return 'done';
  };

  const detailOf = (key: PhaseKey): string => {
    if (key === 'think') return seconds ? T.thought : reasoningIsReal ? T.reasoningLive : '';
    if (key === 'search') {
      const n = parsed?.count || parsed?.sources.length || 0;
      return n > 0 ? T.searched(n) : T.searchedNone;
    }
    if (key === 'read') return T.read;
    return synth?.output || T.synth;
  };

  const depthOf = (status: PhaseStatus) =>
    status === 'active' ? 3 : status === 'done' ? 2 : 1;

  const tintOf = (key: PhaseKey) => {
    if (key === 'think') return '#f59e0b';
    if (key === 'search') return '#0ea5e9';
    if (key === 'read') return '#10b981';
    return 'var(--accent-color)';
  };

  return (
    <Scene3D near className="my-3 agent-timeline">
      <DepthCard
        depth={2}
        className="overflow-hidden rounded-2xl not-prose"
        style={{ background: 'var(--surface-color)' }}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="agent-timeline-body"
          title={$t(open ? T.collapse : T.expand)}
          className="flex w-full cursor-pointer items-center gap-3 px-3.5 py-3 text-start transition-colors hover:bg-[color-mix(in_srgb,var(--accent-color)_5%,transparent)]"
        >
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="t-small font-semibold text-[var(--text-color)]">
                {isStreaming ? liveText : T.title}
              </span>
              {isStreaming ? (
                liveSecs !== null ? (
                  <StateChip tone="live">
                    <Clock className="h-2.5 w-2.5" strokeWidth={2} />
                    {liveSecs}<UiText source={"s"}/> </StateChip>
                ) : null
              ) : seconds ? (
                <StateChip tone="done">
                  <Clock className="h-2.5 w-2.5" strokeWidth={2} />
                  {seconds}<UiText source={"s"}/> </StateChip>
              ) : null}
              {hasFailed ? (
                <StateChip tone="failed">
                  <XCircle className="h-2.5 w-2.5" strokeWidth={2} />
                  <span className="font-fa">{T.failed}</span>
                </StateChip>
              ) : null}
            </span>
          </span>
          <span className="shrink-0 text-[var(--text-muted)]" aria-hidden="true">
            {open ? <ChevronUp className="h-4 w-4" strokeWidth={1.75} /> : <ChevronDown className="h-4 w-4" strokeWidth={1.75} />}
          </span>
        </button>

        <span aria-live="polite" className="sr-only">
          {isStreaming ? liveText : T.title}
        </span>

        {open ? (
          <div id="agent-timeline-body" className="px-3.5 pb-3.5">
            {phases.length > 0 ? (
              <ul className="mt-3.5 space-y-0">
                {phases.map((phase, index) => {
                  const status = phaseStatus(phase.key);
                  const Icon = phase.icon;
                  const tint = tintOf(phase.key);
                  const isLast = index === phases.length - 1;
                  const expandable = phase.key === 'think' && !!reasoning;
                  const searchExpandable =
                    phase.key === 'search' && !!parsed && parsed.sources.length > 0;
                  const phaseBodyId = `agent-phase-${phase.key}`;
                  const isOpen =
                    phase.key === 'think' ? thinkOpen : phase.key === 'search' ? sourcesOpen : true;

                  return (
                    <li key={phase.key} className="relative flex gap-3">
                      <div className="relative flex w-5 shrink-0 flex-col items-center pt-2.5">
                        <span
                          className="relative z-10 grid h-4 w-4 place-items-center rounded-full border"
                          style={{
                            borderColor:
                              status === 'active'
                                ? 'var(--accent-color)'
                                : status === 'failed'
                                  ? 'rgb(239 68 68 / 0.6)'
                                  : 'var(--border-color)',
                            background:
                              status === 'failed'
                                ? 'rgb(239 68 68 / 0.12)'
                                : 'var(--bg-color)',
                            boxShadow:
                              status === 'active'
                                ? '0 0 0 3px color-mix(in srgb, var(--accent-color) 18%, transparent)'
                                : undefined,
                          }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              background: status === 'failed' ? 'rgb(239 68 68)' : tint,
                            }}
                          />
                        </span>
                        {!isLast ? (
                          <SignalRail active={status === 'active'} done={status !== 'pending'} className="mt-1 flex-1" />
                        ) : null}
                      </div>

                      <DepthCard
                        depth={depthOf(status)}
                        accent={status === 'pending' ? undefined : tint}
                        className="mb-1.5 min-w-0 flex-1 rounded-xl px-3 py-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <Icon
                            className="h-3.5 w-3.5 shrink-0"
                            strokeWidth={1.75}
                            style={{ color: status === 'pending' ? 'var(--text-muted)' : tint }}
                          />
                          <span className={`t-cap font-semibold ${fa ? 'font-fa' : ''}`} style={{ color: 'var(--text-color)' }}>
                            {<UiText source={phase.label}/>}
                          </span>

                          {status === 'done' ? (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" strokeWidth={1.9} />
                          ) : status === 'failed' ? (
                            <XCircle className="h-3.5 w-3.5 shrink-0 text-red-500" strokeWidth={1.9} />
                          ) : null}

                          <span className={`min-w-0 flex-1 truncate t-cap text-[var(--text-muted)] ${fa ? 'font-fa' : ''}`}>
                            {detailOf(phase.key)}
                          </span>

                          {expandable || searchExpandable ? (
                            <button
                              type="button"
                              onClick={() =>
                                phase.key === 'think' ? setThinkOpen((v) => !v) : setSourcesOpen((v) => !v)
                              }
                              aria-expanded={isOpen}
                              aria-controls={phaseBodyId}
                              className="shrink-0 cursor-pointer rounded-md p-1 text-[var(--text-muted)] transition-colors hover:bg-[color-mix(in_srgb,var(--text-muted)_12%,transparent)] hover:text-[var(--text-color)]"
                              title={$t(isOpen ? T.collapse : T.expand)}
                            >
                              {isOpen ? (
                                <ChevronUp className="h-3.5 w-3.5" strokeWidth={1.75} />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.75} />
                              )}
                            </button>
                          ) : null}
                        </div>

                        {phase.key === 'think' && reasoning && thinkOpen ? (
                          <div
                            id={phaseBodyId}
                            style={{ fontSize: settings.reasoningTextSize || 14, maxHeight: settings.reasoningMaxHeight || 360, transform: 'none' }}
                            dir={fa ? 'rtl' : 'ltr'}
                            className={`reasoning-text mt-2.5 overflow-y-auto rounded-lg border border-[var(--border-color)] bg-[var(--bg-color)] p-3 text-[var(--text-color)] ${
                              fa ? 'font-fa' : ''
                            }`}
                          >
                            <div className="measure">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{reasoning}</ReactMarkdown>
                              {isStreaming ? <span className="stream-caret" aria-hidden="true" /> : null}
                            </div>
                          </div>
                        ) : null}

                        {phase.key === 'search' && parsed && sourcesOpen ? (
                          <div id={phaseBodyId} className="mt-2.5">
                            {parsed.queries.length > 0 ? (
                              <div className="mb-2 flex flex-wrap gap-1.5">
                                {parsed.queries.slice(0, 4).map((query, qIndex) => (
                                  <span
                                    key={`${query}-${qIndex}`}
                                    className="t-mono max-w-[240px] truncate rounded-md border border-[var(--border-color)] bg-[var(--bg-color)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]"
                                    dir="auto"
                                  >
                                    {query}
                                  </span>
                                ))}
                              </div>
                            ) : null}

                            {parsed.sources.length > 0 ? (
                              <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                                {shownSources.map((source, index) => {
                                  const domain = domainOf(source.url);
                                  return (
                                    <li key={`${source.url}-${index}`} className="min-w-0">
                                      <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={$t(source.snippet || source.title)}
                                        className="group flex min-w-0 items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-color)] px-2 py-1.5 transition-colors hover:border-[var(--accent-border)]"
                                      >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                                          alt={$t("")}
                                          width={14}
                                          height={14}
                                          loading="lazy"
                                          className="h-3.5 w-3.5 shrink-0 rounded"
                                          onError={(e) => {
                                            (e.target as HTMLElement).style.display = 'none';
                                          }}
                                        />
                                        <span className="min-w-0 flex-1 truncate t-cap text-[var(--text-color)]" dir="auto">
                                          {source.title || domain}
                                        </span>
                                        <bdi className="t-mono shrink-0 text-[10px] text-[var(--text-muted)]">
                                          [{index + 1}]
                                        </bdi>
                                        <ExternalLink
                                          className="h-3 w-3 shrink-0 text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100"
                                          strokeWidth={1.75}
                                        />
                                      </a>
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : (
                              <p className={`t-cap text-[var(--text-muted)] ${fa ? 'font-fa' : ''}`}>{T.noResults}</p>
                            )}

                            {!sourcesOpen && parsed.sources.length > 6 ? (
                              <span className="t-cap mt-1.5 inline-block text-[var(--text-muted)]">
                                {T.more(parsed.sources.length - 6)}
                              </span>
                            ) : null}
                          </div>
                        ) : null}

                        {phase.key === 'search' &&
                        parsed &&
                        parsed.count === 0 &&
                        parsed.sources.length === 0 ? (
                          <p className={`mt-1.5 t-cap text-[var(--text-muted)] ${fa ? 'font-fa' : ''}`}>
                            {T.noResults}
                          </p>
                        ) : null}

                        {phase.key === 'read' && status !== 'pending' && readInfo.of > 0 ? (
                          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--text-muted)_16%,transparent)]">
                            <span
                              className="block h-full rounded-full transition-[width] duration-500"
                              style={{
                                background: tint,
                                width: `${Math.min(100, Math.round((readInfo.read / readInfo.of) * 100))}%`,
                              }}
                            />
                          </div>
                        ) : null}
                      </DepthCard>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        ) : null}
      </DepthCard>
    </Scene3D>
  );
}
