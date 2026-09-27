'use client';

/**
 * AgentActivity
 *
 * The multi-step agent plan as a rail of depth cards. Each step sits at a depth
 * that matches its status, running steps carry a flowing signal on the rail,
 * and the planned queries read as mono chips.
 *
 * Props, STEP_META, the Persian detection and describeStep are unchanged.
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ListChecks,
  Loader2,
  XCircle,
} from 'lucide-react';
import type { ToolStep } from '@/lib/types';
import { DepthCard, Scene3D, StateChip, SignalRail } from '@/components/agent/primitives';
import {UiText} from '@/components/i18n/LocaleProvider';

interface AgentActivityProps {
  steps: ToolStep[];
}

const STEP_META: Record<string, { icon: typeof Brain; label: string; labelFa: string }> = {
  agent_plan: { icon: ListChecks, label: 'Agent plan', labelFa: 'برنامه ایجنت' },
  agent_read: { icon: BookOpen, label: 'Reading sources', labelFa: 'خواندن منابع' },
  agent_synthesize: { icon: Brain, label: 'Synthesizing', labelFa: 'سنتز نهایی' },
};

function isFa(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text || '');
}

function describeStep(step: ToolStep): string {
  try {
    if (step.toolName === 'agent_plan') {
      const input = step.input || {};
      const queries: string[] = Array.isArray(input.queries) ? input.queries : [];
      if (step.output && typeof step.output === 'string') return step.output;
      return queries.length > 0 ? `${queries.length} queries planned` : 'Planning…';
    }
    if (step.toolName === 'agent_read') {
      const input = step.input || {};
      const urls: string[] = Array.isArray(input.urls) ? input.urls : [];
      if (step.status === 'CALLING') {
        return urls.length > 0 ? `Opening ${urls.length} sources…` : 'Opening sources…';
      }
      if (step.output) {
        const parsed = JSON.parse(step.output);
        return `Read ${parsed.read ?? 0}/${parsed.of ?? urls.length} sources`;
      }
      return urls.length > 0 ? `Read ${urls.length} sources` : 'Sources read';
    }
  } catch {
    // fall through to generic
  }
  return step.status === 'CALLING' ? 'Working…' : 'Done';
}

export function AgentActivity({ steps }: AgentActivityProps) {
  const [open, setOpen] = useState(true);
  const agentSteps = (steps || []).filter((s) => s.toolName in STEP_META);
  if (agentSteps.length === 0) return null;

  const running = agentSteps.some((s) => s.status === 'CALLING');
  const failed = agentSteps.some((s) => s.status === 'FAILED');
  const fa = agentSteps.some((s) => isFa(s.output || '') || isFa(JSON.stringify(s.input || {})));

  const tintOf = (toolName: string) =>
    toolName === 'agent_plan' ? '#0ea5e9' : toolName === 'agent_read' ? '#10b981' : 'var(--accent-color)';

  return (
    <Scene3D near className="my-3">
      <DepthCard depth={2} className={`overflow-hidden rounded-2xl not-prose ${running ? 'is-live' : ''}`}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="agent-activity-body"
          className="flex w-full cursor-pointer items-center justify-between gap-3 px-3.5 py-2.5 text-start transition-colors hover:bg-[color-mix(in_srgb,var(--accent-color)_5%,transparent)]"
        >
          <span className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-color)]">
              {running ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.9} style={{ color: 'var(--accent-color)' }} />
              ) : failed ? (
                <XCircle className="h-3.5 w-3.5 text-red-500" strokeWidth={1.9} />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" strokeWidth={1.9} />
              )}
            </span>

            <span className={`t-small font-semibold text-[var(--text-color)] ${fa ? 'font-fa' : ''}`}>
              {running
                ? fa
                  ? <UiText source={"ایجنت در حال کار"}/>
                  : <UiText source={"Agent working"}/>
                : fa
                  ? <UiText source={"فعالیت ایجنت"}/>
                  : <UiText source={"Agent activity"}/>}
            </span>

            <StateChip tone={running ? 'live' : failed ? 'failed' : 'done'}>
              {agentSteps.length} {fa ? <UiText source={"گام"}/> : <UiText source={"steps"}/>}
            </StateChip>
          </span>

          <span className="shrink-0 text-[var(--text-muted)]" aria-hidden="true">
            {open ? <ChevronUp className="h-4 w-4" strokeWidth={1.75} /> : <ChevronDown className="h-4 w-4" strokeWidth={1.75} />}
          </span>
        </button>

        {open ? (
          <ul id="agent-activity-body" className="border-t border-[var(--border-color)] px-3.5 pb-3 pt-3">
            {agentSteps.map((step, index) => {
              const meta = STEP_META[step.toolName];
              const Icon = meta.icon;
              const tint = tintOf(step.toolName);
              const isLast = index === agentSteps.length - 1;
              const status = step.status;
              const queries: string[] =
                step.toolName === 'agent_plan' && Array.isArray(step.input?.queries) ? step.input.queries : [];

              return (
                <li key={step.id} className="relative flex gap-3">
                  <div className="relative flex w-5 shrink-0 flex-col items-center pt-2.5">
                    <span
                      className="relative z-10 grid h-4 w-4 place-items-center rounded-full border border-[var(--border-color)]"
                      style={{
                        background: 'var(--bg-color)',
                        boxShadow:
                          status === 'CALLING'
                            ? '0 0 0 3px color-mix(in srgb, var(--accent-color) 18%, transparent)'
                            : undefined,
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background: status === 'FAILED' ? 'rgb(239 68 68)' : tint,
                        }}
                      />
                    </span>
                    {!isLast ? <SignalRail active={status === 'CALLING'} done={status === 'DONE'} className="mt-1 flex-1" /> : null}
                  </div>

                  <DepthCard
                    depth={status === 'CALLING' ? 3 : 2}
                    accent={status === 'FAILED' ? 'rgb(239 68 68)' : tint}
                    className="mb-2 min-w-0 flex-1 rounded-xl px-3 py-2.5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} style={{ color: tint }} />
                      <span className={`t-cap font-semibold text-[var(--text-color)] ${fa ? 'font-fa' : ''}`}>
                        {fa ? meta.labelFa : <UiText source={meta.label}/>}
                      </span>
                      {status === 'CALLING' ? (
                        <StateChip tone="live">{fa ? <UiText source={"در حال اجرا"}/> : <UiText source={"live"}/>}</StateChip>
                      ) : status === 'FAILED' ? (
                        <StateChip tone="failed">{fa ? <UiText source={"خطا"}/> : <UiText source={"failed"}/>}</StateChip>
                      ) : null}
                    </div>

                    <p className={`mt-1 t-cap leading-relaxed text-[var(--text-muted)] ${fa ? 'font-fa' : ''}`} dir="auto">
                      {describeStep(step)}
                    </p>

                    {queries.length > 1 ? (
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {queries.map((query, queryIndex) => (
                          <li
                            key={`${query}-${queryIndex}`}
                            className="t-mono max-w-[240px] truncate rounded-md border border-[var(--border-color)] bg-[var(--bg-color)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]"
                            dir="auto"
                          >
                            {query}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </DepthCard>
                </li>
              );
            })}
          </ul>
        ) : null}
      </DepthCard>
    </Scene3D>
  );
}
