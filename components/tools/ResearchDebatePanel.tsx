'use client';

/**
 * ResearchDebatePanel
 *
 * Deep Research and Debate share this surface. It is now a control room that
 * shows the shape of the run before it starts: the agent hierarchy, the phase
 * pipeline and the exact objective that will be dispatched.
 *
 * Live progress observes the running conversation; the timeline contains the
 * actual search, reading and synthesis events.
 */

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Download,
  FileText,
  Layers,
  PanelRightClose,
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { DepthCard, EdgeFrame, Scene3D, SignalRail, StateChip, TelemetryStat } from '@/components/agent/primitives';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

interface HierarchyNode {
  id: string;
  label: string;
  role: string;
  icon: typeof Brain;
  depth: 1 | 2 | 3 | 4;
  tint: string;
}

const RESEARCH_NODES: HierarchyNode[] = [
  {
    id: 'lead',
    label: 'Query planner',
    role: 'Extracts focused queries from your research objective',
    icon: Target,
    depth: 3,
    tint: 'var(--accent-color)',
  },
  {
    id: 'analysts',
    label: 'Parallel web searches',
    role: 'Searches multiple queries and ranks diverse results',
    icon: Users,
    depth: 2,
    tint: '#0ea5e9',
  },
  {
    id: 'redteam',
    label: 'Source reader',
    role: 'Opens selected pages and extracts evidence when enabled',
    icon: ShieldAlert,
    depth: 2,
    tint: '#f59e0b',
  },
  {
    id: 'synth',
    label: 'Synthesis model',
    role: 'Evaluates the collected evidence and writes a cited report',
    icon: FileText,
    depth: 3,
    tint: '#10b981',
  },
];

const DEBATE_NODES: HierarchyNode[] = [
  {
    id: 'proponent',
    label: 'Proponent',
    role: 'Affirmative case, opening statement and supported claims',
    icon: Target,
    depth: 3,
    tint: '#ec4899',
  },
  {
    id: 'opponent',
    label: 'Opponent',
    role: 'Direct rebuttal, counter-evidence and cross-examination',
    icon: ShieldAlert,
    depth: 2,
    tint: '#f59e0b',
  },
  {
    id: 'judge',
    label: 'Judge',
    role: 'Scores logic and evidence, then states the reasoned verdict',
    icon: Users,
    depth: 3,
    tint: '#10b981',
  },
];

const RESEARCH_PHASES = ['Plan', 'Search', 'Read', 'Synthesize'];
const DEBATE_PHASES = ['Openings', 'Rebuttals', 'Verdict'];

export function ResearchDebatePanel({ onClose }: { onClose: () => void }) {
  const $t=useT();
  const { activeToolPanel, sendMessage, isGenerating, generatingChatId, activeChatId, chats, models, artifacts, updateChat, getActivePath } = useAppStore();
  const currentChat = chats.find(c => c.id === activeChatId);
  const availableModels = models.filter(m => m.visible);
  const isDebate = activeToolPanel === 'DEBATE';
  const report = !activeChatId ? undefined : isDebate
    ? getActivePath(activeChatId).findLast(m => m.role === 'assistant' && m.state === 'DONE' && m.toolSteps?.some(s => s.toolName === 'agent_synthesize'))
    : artifacts.find(a => a.chatId === activeChatId && a.kind === 'DOCUMENT');

  const [topic, setTopic] = useState('');
  const [proponent, setProponent] = useState(currentChat?.toolState?.debateModelIds?.[0] || availableModels[0]?.id || '');
  const [opponent, setOpponent] = useState(currentChat?.toolState?.debateModelIds?.[1] || availableModels[1]?.id || '');
  const [judge, setJudge] = useState(currentChat?.toolState?.debateJudgeModelId || availableModels[0]?.id || '');
  const [rounds, setRounds] = useState(Number(currentChat?.toolState?.debateRounds) || 3);
  const justDispatched = isGenerating && generatingChatId === activeChatId;
  const [touched, setTouched] = useState(false);

  const nodes = isDebate ? DEBATE_NODES : RESEARCH_NODES;
  const phases = isDebate ? DEBATE_PHASES : RESEARCH_PHASES;
  const isValid = topic.trim().length > 0 && (!isDebate || Boolean(proponent && opponent && proponent !== opponent));

  const handleStart = () => {
    if (!isValid) {
      setTouched(true);
      return;
    }

    if (isDebate) {
      if (activeChatId) updateChat(activeChatId, { toolState: { ...currentChat?.toolState, debateModelIds: [proponent, opponent], debateJudgeModelId: judge, debateRounds: rounds } });
      const prompt = `[DIALECTIC MULTI-MODEL DEBATE]
Topic: "${topic.trim()}"
Proponent Role: ${proponent}
Opponent Role: ${opponent}
Judge Role: ${judge}
Rounds: ${rounds}

Please execute this debate turn-by-turn with clear round headings, arguments, formal rebuttals, cross-examination, and conclude with the Judge's structured scorecard scoring logic, evidence, and final synthesis.`;
      sendMessage(prompt);
    } else {
      const prompt = `[DEEP RESEARCH WORKSPACE]
Research Objective: "${topic.trim()}"
Research stages: Plan -> Search -> Read -> Compare evidence -> Synthesize

Please conduct an exhaustive deep research synthesis with:
1. Executive Summary & Core Theses
2. Findings across 3 relevant perspectives
3. Adversarial Red-Team Critique & Edge-Cases
4. Synthesized Consensus & Recommended Next Steps.`;
      sendMessage(prompt);
    }

  };

  return (
    <div
      id="research-debate-panel"
      className="flex h-full flex-col border-s border-[var(--border-color)] bg-[var(--surface-color)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] p-3">
        <div className="flex min-w-0 items-center gap-2">
          {isDebate ? (
            <Layers className="h-4 w-4 shrink-0 text-pink-500" strokeWidth={1.75} />
          ) : (
            <Brain className="h-4 w-4 shrink-0" style={{ color: 'var(--accent-color)' }} strokeWidth={1.75} />
          )}
          <div className="min-w-0">
            <p className="t-small truncate font-semibold text-[var(--text-color)]">
              {isDebate ? <UiText source={"Multi-Model Dialectic Debate"}/> : <UiText source={"Deep Research"}/>}
            </p>
            <p className="t-cap truncate text-[var(--text-muted)]">
              {isDebate
                ? <UiText source={"Role-based arguments, rebuttals and a scored verdict"}/>
                : <UiText source={"Plan, search, read, cross-check and synthesize"}/>}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          title={$t("Minimize Panel")}
          className="shrink-0 cursor-pointer rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[color-mix(in_srgb,var(--text-muted)_12%,transparent)] hover:text-[var(--text-color)]"
        >
          <PanelRightClose className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {report && <section className="rounded-2xl border border-[var(--border-color)] p-4 mb-4 space-y-3"><div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold">{isDebate ? <UiText source={"Latest verdict"}/> : <UiText source={"Latest research report"}/>}</span><button type="button" aria-label={$t("Download report")} className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-color)] cursor-pointer" onClick={() => { const url = URL.createObjectURL(new Blob([report.content], { type: 'text/markdown;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = isDebate ? 'debate-verdict.md' : 'research-report.md'; link.click(); URL.revokeObjectURL(url); }}><Download size={13} /><UiText source={"Markdown"}/></button></div><p className="text-xs text-muted leading-6 line-clamp-5 whitespace-pre-wrap" dir="auto">{report.content}</p></section>}
        <Scene3D near className="space-y-4">
          {/* Agent hierarchy */}
          <EdgeFrame className="rounded-2xl p-3.5" as="section">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="t-cap font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                {isDebate ? <UiText source={"Model roles"}/> : <UiText source={"Research workflow"}/>}
              </h3>
              <StateChip tone={justDispatched ? 'live' : 'idle'}>
                {justDispatched ? <UiText source={"Running"}/> : <UiText source={"Standby"}/>}
              </StateChip>
            </div>

            <ul className={`space-y-0 ${justDispatched ? 'is-live' : ''}`}>
              {nodes.map((node, index) => {
                const Icon = node.icon;
                const isLast = index === nodes.length - 1;
                return (
                  <li key={node.id} className="relative flex gap-3">
                    <div className="relative flex w-5 shrink-0 flex-col items-center pt-3">
                      <span
                        className="relative z-10 grid h-4 w-4 place-items-center rounded-full border border-[var(--border-color)]"
                        style={{ background: 'var(--bg-color)' }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: node.tint }} />
                      </span>
                      {!isLast ? <SignalRail active={justDispatched} className="mt-1 flex-1" /> : null}
                    </div>

                    <DepthCard
                      depth={node.depth}
                      accent={node.tint}
                      className="mb-2 min-w-0 flex-1 rounded-xl px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} style={{ color: node.tint }} />
                        <span className="t-cap font-semibold text-[var(--text-color)]">{<UiText source={node.label}/>}</span>
                      </div>
                      <p className="mt-1 t-cap leading-relaxed text-[var(--text-muted)]">{node.role}</p>
                    </DepthCard>
                  </li>
                );
              })}
            </ul>
          </EdgeFrame>

          {/* Phase pipeline */}
          <EdgeFrame className="rounded-2xl p-3.5" as="section">
            <h3 className="mb-3 t-cap font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
               <UiText source={"Phase pipeline"}/> </h3>
            <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
              {phases.map((phase, index) => (
                <li key={phase} className="flex items-center gap-1.5">
                  <span
                    className="t-mono rounded-md border border-[var(--border-color)] px-1.5 py-0.5 text-[10px]"
                    style={{
                      background: 'var(--bg-color)',
                      color: justDispatched && index === 0 ? 'var(--accent-color)' : 'var(--text-muted)',
                      borderColor: justDispatched && index === 0 ? 'var(--accent-border)' : 'var(--border-color)',
                    }}
                  >
                    {phase}
                  </span>
                  {index < phases.length - 1 ? (
                    <ArrowRight className="h-3 w-3 shrink-0 text-[var(--text-muted)] rtl:-scale-x-100" strokeWidth={1.75} />
                  ) : null}
                </li>
              ))}
            </ol>
            <div className="mt-3 flex items-end gap-5 border-t border-[var(--border-color)] pt-3">
              <TelemetryStat label={$t("Stages")} value={phases.length} />
              <TelemetryStat label={$t("Agents")} value={nodes.length} />
              {isDebate ? <TelemetryStat label={$t("Rounds")} value={rounds} /> : null}
              <TelemetryStat label={$t("Mode")} value={isDebate ? 'DEBATE' : 'RESEARCH'} accent />
            </div>
          </EdgeFrame>

          {/* Objective */}
          <div className="space-y-1.5">
            <label htmlFor="rdp-topic" className="t-cap font-semibold text-[var(--text-color)]">
              {isDebate ? <UiText source={"Debate resolution or proposition"}/> : <UiText source={"Research objective and scope"}/>}
            </label>
            <textarea
              id="rdp-topic"
              rows={3}
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              onBlur={() => setTouched(true)}
              placeholder={$t(isDebate
                  ? 'e.g. Resolved: monolithic architectures give Series-A startups more lifetime developer velocity than microservices.'
                  : 'e.g. Compare stateful edge compute architectures on Cloudflare Workers against AWS Lambda@Edge.')}
              className="w-full resize-none rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] p-2.5 t-small leading-relaxed text-[var(--text-color)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] focus:outline-none"
              dir="auto"
            />
            {touched && !isValid ? (
              <p role="alert" className="t-cap font-semibold text-red-500">
                 <UiText source={"Add a"}/> {isDebate ? <UiText source={"resolution"}/> : <UiText source={"research objective"}/>}  <UiText source={"before dispatching the run."}/> </p>
            ) : (
              <p className="t-cap text-[var(--text-muted)]">
                {isDebate
                  ? <UiText source={"The judge scores logic and evidence, so state the proposition as a claim to be tested."}/>
                  : <UiText source={"The lead agent turns this into search queries, so name the domain and the comparison you care about."}/>}
              </p>
            )}
          </div>

          {/* Role configuration */}
          {isDebate ? (
            <div className="space-y-2.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] p-3.5">
              <p className="flex items-center gap-1.5 t-cap font-semibold text-[var(--text-color)]">
                <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
                 <UiText source={"Participant roles"}/> </p>

              <div className="space-y-2">
                <div className="space-y-1">
                  <label htmlFor="rdp-proponent" className="t-cap text-[var(--text-muted)]">
                     <UiText source={"Proponent, affirmative stance"}/> </label>
                  <CustomSelect
                    id="rdp-proponent"
                    value={proponent}
                    onChange={setProponent}
                    options={availableModels.map(model => ({ value: model.id, label: model.displayName }))}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="rdp-opponent" className="t-cap text-[var(--text-muted)]">
                     <UiText source={"Opponent, critique and skeptic"}/> </label>
                  <CustomSelect
                    id="rdp-opponent"
                    value={opponent}
                    onChange={setOpponent}
                    options={availableModels.map(model => ({ value: model.id, label: model.displayName, disabled: model.id === proponent }))}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="rdp-judge" className="t-cap text-[var(--text-muted)]">
                     <UiText source={"Neutral judge and scorekeeper"}/> </label>
                  <CustomSelect
                    id="rdp-judge"
                    value={judge}
                    onChange={setJudge}
                    options={availableModels.map(model => ({ value: model.id, label: model.displayName }))}
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="t-cap shrink-0 text-[var(--text-color)]"><UiText source={"Debate rounds"}/></span>
                  <div className="w-56">
                    <CustomSelect
                      value={String(rounds)}
                      onChange={(val) => setRounds(Number(val))}
                      options={[
                        { value: '2', label: '2 Rounds (Opening & Rebuttal)' },
                        { value: '3', label: '3 Rounds (Full Standard)' },
                        { value: '4', label: '4 Rounds (In-Depth Cross-Exam)' },
                      ]}
                      size="xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] p-3.5">
              <p className="flex items-center gap-1.5 t-cap font-semibold text-[var(--text-color)]">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} style={{ color: 'var(--accent-color)' }} />
                 <UiText source={"What the run will produce"}/> </p>
              <ul className="space-y-1.5 t-cap leading-relaxed text-[var(--text-muted)]">
                <li className="flex gap-2">
                  <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-current" />
                   <UiText source={"Executive summary and the core theses under test"}/> </li>
                <li className="flex gap-2">
                  <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-current" />
                   <UiText source={"Independent findings from three sub-vectors of the objective"}/> </li>
                <li className="flex gap-2">
                  <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-current" />
                   <UiText source={"Adversarial critique of fallacies, weak citations and edge cases"}/> </li>
                <li className="flex gap-2">
                  <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-current" />
                   <UiText source={"A synthesised consensus with the recommended next steps"}/> </li>
              </ul>
            </div>
          )}

          {/* Action */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleStart}
              disabled={isGenerating}
              aria-busy={isGenerating}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-transparent py-2.5 t-small font-semibold text-white transition-transform duration-150 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-45"
              style={{
                backgroundColor: isDebate ? '#db2777' : 'var(--accent-color)',
                boxShadow: 'var(--depth-2)',
              }}
            >
              <Play className="h-4 w-4" strokeWidth={1.9} />
              {isGenerating
                ? <UiText source={"Model busy, wait for the current run"}/>
                : isDebate
                  ? <UiText source={"Launch Multi-Model Debate"}/>
                  : <UiText source={"Launch Deep Research Pipeline"}/>}
            </button>

            {justDispatched ? (
              <div
                className="motion-rise-in rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] p-3"
                role="status"
              >
                <p className="flex items-center gap-1.5 t-cap font-semibold text-[var(--text-color)]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" strokeWidth={1.9} />
                   <UiText source={"Run dispatched to this conversation"}/> </p>
                <p className="mt-1 t-cap leading-relaxed text-[var(--text-muted)]">
                   <UiText source={"Live phases, sources and reasoning appear in the agent timeline on the message itself."}/> </p>
                <button
                  type="button"
                  onClick={() => setTopic('')}
                  className="mt-2 inline-flex cursor-pointer items-center gap-1.5 t-cap font-semibold text-[var(--accent-color)]"
                >
                  <RotateCcw className="h-3 w-3" strokeWidth={1.9} />
                   <UiText source={"Prepare another run"}/> </button>
              </div>
            ) : null}
          </div>
        </Scene3D>
      </div>
    </div>
  );
}
