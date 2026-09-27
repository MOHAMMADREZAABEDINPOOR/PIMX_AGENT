'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { MessageBubble } from './MessageBubble';
import { CompareGrid } from './CompareGrid';
import { Brain, Database, Edit3, EyeOff, Shield, Sparkles } from 'lucide-react';
import { DepthCard, NeuralField, OrbitRing, Scene3D, TelemetryStat } from '@/components/agent/primitives';
import { TemporaryChatHero } from './TemporaryChatHero';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export function MessageList() {
  const { activeChatId, chats, personas, getActivePath, isGenerating, settings } = useAppStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeMessages = activeChatId ? getActivePath(activeChatId) : [];

  useEffect(() => {
    if (settings.autoScroll !== false) bottomRef.current?.scrollIntoView({ behavior: settings.reduceMotion ? 'instant' : 'smooth' });
  }, [activeMessages.length, isGenerating, settings.autoScroll, settings.reduceMotion]);

  // Group assistant messages sharing groupId into side-by-side compare grids
  const groupedItems = useMemo(() => {
    const items: Array<
      | { type: 'single'; message: (typeof activeMessages)[0] }
      | { type: 'compare_group'; groupId: string; messages: typeof activeMessages }
    > = [];

    let currentGroup: typeof activeMessages = [];
    let currentGroupId: string | null = null;

    for (let i = 0; i < activeMessages.length; i++) {
      const msg = activeMessages[i];
      if (msg.role === 'assistant' && msg.groupId) {
        if (currentGroupId === msg.groupId) {
          currentGroup.push(msg);
        } else {
          if (currentGroup.length > 0) {
            if (currentGroup.length === 1) {
              items.push({ type: 'single', message: currentGroup[0] });
            } else {
              items.push({ type: 'compare_group', groupId: currentGroupId!, messages: currentGroup });
            }
          }
          currentGroup = [msg];
          currentGroupId = msg.groupId;
        }
      } else {
        if (currentGroup.length > 0) {
          if (currentGroup.length === 1) {
            items.push({ type: 'single', message: currentGroup[0] });
          } else {
            items.push({ type: 'compare_group', groupId: currentGroupId!, messages: currentGroup });
          }
          currentGroup = [];
          currentGroupId = null;
        }
        items.push({ type: 'single', message: msg });
      }
    }

    if (currentGroup.length > 0) {
      if (currentGroup.length === 1) {
        items.push({ type: 'single', message: currentGroup[0] });
      } else {
        items.push({ type: 'compare_group', groupId: currentGroupId!, messages: currentGroup });
      }
    }

    return items;
  }, [activeMessages]);

  if (activeMessages.length === 0) {
    return null;
  }

  return (
    <div
      id="message-list"
      className="flex-1 overflow-y-auto pt-16 sm:pt-16 pb-6 px-1 sm:px-2 space-y-2"
    >
      {groupedItems.map((item, idx) =>
        item.type === 'single' ? (
          <MessageBubble key={item.message.id} message={item.message} />
        ) : (
          <CompareGrid key={`group-${item.groupId}-${idx}`} messages={item.messages} />
        )
      )}
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}

/**
 * The first-use surface.
 *
 * An agent product should open on the agent, so this stage is built around the
 * brand mark sitting at the centre of an instrument: a constellation field, a
 * perspective floor and a pair of orbit rings. The rings only turn while the
 * model is actually generating, so an idle screen is still.
 *
 * The stat row reports only counts that exist in the store. There are no
 * marketing numbers here, because inventing them would be the fastest way to
 * make the surface untrustworthy.
 */
export function EmptyChatHero({ currentProject, currentChat }: { currentProject?: any; currentChat?: any }) {
  const $t=useT();
  const { personas, models, accounts, isGenerating } = useAppStore();
  const isTemporary = !!currentChat?.temporary;
  const currentPersona = personas.find((p) => p.id === currentChat?.personaId);
  if (isTemporary) return <TemporaryChatHero />;

  if (currentProject) {
    return (
      <Scene3D near className="w-full select-none">
        <DepthCard depth={3} className="mx-auto w-full rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col items-center text-center">
            <div
              className="mb-3 grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border-color)] text-2xl sm:h-16 sm:w-16 sm:text-3xl"
              style={{
                backgroundColor: `${currentProject.color || 'var(--accent-color)'}22`,
                color: currentProject.color || 'var(--accent-color)',
                boxShadow: 'var(--depth-2)',
              }}
            >
              {currentProject.emoji || '📁'}
            </div>

            <h2 className="t-h1 text-[var(--text-color)]">{currentProject.name}</h2>
            <p className="mt-1.5 max-w-md t-small leading-relaxed text-[var(--text-muted)]">
              {currentProject.description ||
                'A dedicated workspace with its own system prompt, knowledge sources and focused chats.'}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-subtle)] px-3 py-1 t-cap font-semibold text-[var(--accent-color)]">
                <Sparkles className="h-3 w-3" strokeWidth={1.9} />
                 <UiText source={"Project instructions active"}/> </span>
              {currentProject.memoryScope === 'PROJECT_ONLY' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-color)] px-3 py-1 t-cap font-semibold text-[var(--text-color)]">
                  <Shield className="h-3 w-3 text-emerald-500" strokeWidth={1.9} />
                   <UiText source={"Project-only memory"}/> </span>
              ) : null}
            </div>
          </div>
        </DepthCard>
      </Scene3D>
    );
  }

  if (currentPersona) {
    return (
      <Scene3D near className="w-full select-none">
        <DepthCard depth={3} className="mx-auto w-full rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col items-center text-center">
            <div
              className="mb-3 grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border-color)] text-3xl sm:h-16 sm:w-16"
              style={{
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent-color)',
                boxShadow: 'var(--depth-2)',
              }}
            >
              {currentPersona.symbol || '🤖'}
            </div>

            <h2 className="t-h1 text-[var(--text-color)]">{currentPersona.name}</h2>
            <p className="mt-1.5 max-w-md t-small leading-relaxed text-[var(--text-muted)]">
              {currentPersona.description || currentPersona.instructions.slice(0, 120)}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-subtle)] px-3 py-1 t-cap font-semibold text-[var(--accent-color)]">
                <Sparkles className="h-3 w-3" strokeWidth={1.9} />
                 <UiText source={"Persona instructions active"}/> </span>
              {currentPersona.category ? (
                <span className="rounded-full border border-[var(--border-color)] bg-[var(--bg-color)] px-3 py-1 t-mono text-[10px] text-[var(--text-muted)]">
                  {currentPersona.category}
                </span>
              ) : null}
              {currentPersona.responseStyle && currentPersona.responseStyle !== 'DEFAULT' ? (
                <span className="rounded-full border border-[var(--border-color)] bg-[var(--bg-color)] px-3 py-1 t-mono text-[10px] text-[var(--text-muted)]">
                  {currentPersona.responseStyle}
                </span>
              ) : null}
            </div>
          </div>
        </DepthCard>
      </Scene3D>
    );
  }

  if (isTemporary) {
    return (
      <Scene3D near className="w-full select-none">
        <DepthCard
          depth={3}
          accent="rgb(245 158 11)"
          className="mx-auto w-full rounded-2xl p-5 sm:p-6"
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl border border-amber-500/30 bg-amber-500/15 text-amber-500">
              <EyeOff className="h-6 w-6" strokeWidth={1.9} />
            </div>

            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/12 px-3 py-1 t-cap font-semibold text-amber-600 dark:text-amber-400">
              <Shield className="h-3 w-3" strokeWidth={1.9} />
               <UiText source={"Temporary chat"}/> </span>

            <h2 className="t-h1 text-[var(--text-color)]"><UiText source={"Nothing here is saved"}/></h2>
            <p className="mt-1.5 max-w-md t-small leading-relaxed text-[var(--text-muted)]">
               <UiText source={"Messages in this conversation are not written to your history or database. Reload or close the tab and they are gone."}/> </p>
          </div>
        </DepthCard>
      </Scene3D>
    );
  }

  const providerCount = accounts?.length ?? 0;
  const modelCount = models?.length ?? 0;

  return (
    <Scene3D className={`relative w-full select-none ${isGenerating ? 'is-live' : ''}`}>
      <div className="mx-auto w-full max-w-2xl text-center">
        {/* Instrument core */}
        <div className="relative mx-auto mb-5 grid h-32 w-32 place-items-center sm:h-36 sm:w-36">
          <span aria-hidden="true" className="pointer-events-none absolute inset-0">
            <NeuralField opacity={0.5} density={0.85} linkDistance={104} />
          </span>
          <OrbitRing size={128} className="inset-0 m-auto" />
          <OrbitRing size={92} reverse className="inset-0 m-auto" color="var(--accent-color)" />
          <span
            aria-hidden="true"
            className="absolute inset-0 m-auto rounded-full border"
            style={{
              width: 112,
              height: 112,
              borderColor: 'color-mix(in srgb, var(--accent-color) 24%, transparent)',
            }}
          />
          <span className="relative grid place-items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand-logo.webp"
              alt={$t("Pimx Agent AI")}
              width={72}
              height={72}
              decoding="async"
              className="h-[72px] w-[72px] object-contain"
              style={{ filter: 'drop-shadow(0 10px 26px rgba(0,0,0,0.4))' }}
            />
          </span>
        </div>

        <h1 className="t-h1 text-[var(--text-color)]">
          {currentChat?.title && currentChat.title !== 'New Conversation' ? currentChat.title : <UiText source={"Pimx Agent AI"}/>}
        </h1>
        <p className="mx-auto mt-2 max-w-md t-small leading-relaxed text-[var(--text-muted)]">
           <UiText source={"An agent that reasons in the open: it plans, searches the live web, reads what it finds, and shows you the trace while it works."}/> </p>

        {providerCount > 0 || modelCount > 0 ? (
          <div className="mt-5 flex items-end justify-center gap-6">
            {providerCount > 0 ? <TelemetryStat label={$t("Providers")} value={providerCount} /> : null}
            {modelCount > 0 ? <TelemetryStat label={$t("Models")} value={modelCount} accent /> : null}
          </div>
        ) : null}
      </div>
    </Scene3D>
  );
}

export function StarterCards({ currentProject }: { currentProject?: any }) {
  const $t=useT();
  if (currentProject) {
    return (
      <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-2.5 px-2 text-start t-small sm:grid-cols-2 sm:px-4">
        <StarterCard
          icon={<Sparkles className="w-4 h-4" style={{ color: 'var(--accent-color)' }} strokeWidth={1.75} />}
          title={$t("Brainstorm with {0}",currentProject.name)}
          desc="Generate ideas and strategies tailored strictly to this project's guidelines."
          prompt={`What are the top 3 high-impact priorities and creative ideas we should pursue for ${currentProject.name}?`}
        />
        <StarterCard
          icon={<Edit3 className="w-4 h-4 text-blue-500" strokeWidth={1.75} />}
          title={$t("Draft Project Document")}
          desc="Create a comprehensive specification, guide, or plan in Canvas."
          prompt={`Draft an executive summary and detailed architectural overview for ${currentProject.name}.`}
        />
        <StarterCard
          icon={<Database className="w-4 h-4 text-emerald-500" strokeWidth={1.75} />}
          title={$t("Analyze Project Knowledge")}
          desc="Extract insights and cross-reference against project documents."
          prompt={`Summarize the key objectives and requirements for ${currentProject.name} step by step.`}
        />
        <StarterCard
          icon={<Brain className="w-4 h-4 text-amber-500" strokeWidth={1.75} />}
          title={$t("Step-by-Step Problem Solving")}
          desc="Deep reasoning and structured action plan for your current milestone."
          prompt={`Help me break down the most challenging tasks in ${currentProject.name} into clear execution steps.`}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-2.5 px-2 text-start t-small sm:grid-cols-2 sm:px-4">
      <StarterCard
        icon={<Sparkles className="w-4 h-4 text-amber-500" strokeWidth={1.75} />}
        title={$t("Create an Interactive Artifact")}
        desc="Generate a full React or HTML calculator with a live preview."
        prompt="Create an interactive React component for a clean financial budget calculator."
      />
      <StarterCard
        icon={<Edit3 className="w-4 h-4 text-blue-500" strokeWidth={1.75} />}
        title={$t("Open Canvas Document")}
        desc="Draft and iterate on a complete specification with version history."
        prompt="Write a comprehensive Product Requirements Document for a real-time collaborative whiteboard."
      />
      <StarterCard
        icon={<Brain className="w-4 h-4 text-purple-500" strokeWidth={1.75} />}
        title={$t("Multi-Agent Research")}
        desc="Independent agents, adversarial critique, then one synthesis."
        prompt="Perform a deep research synthesis comparing SQL vs Document stores in distributed systems."
      />
      <StarterCard
        icon={<Database className="w-4 h-4 text-emerald-500" strokeWidth={1.75} />}
        title={$t("Ground with Sources")}
        desc="Extract citations and verify claims strictly against local documents."
        prompt="Explain the difference between Anthropic and OpenAI message wire formats with exact examples."
      />
    </div>
  );
}

export function StarterCard({
  icon,
  title,
  desc,
  prompt,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  prompt: string;
}) {
  const { sendMessage } = useAppStore();

  return (
    <DepthCard
      depth={2}
      interactive
      className="group flex flex-col rounded-xl p-3.5 text-start"
    >
      <button
        type="button"
        onClick={() => sendMessage(prompt)}
        className="flex cursor-pointer flex-col text-start"
      >
        <span className="flex items-center gap-2 t-small font-semibold text-[var(--text-color)]">
          {icon}
          <span>{title}</span>
        </span>
        <span className="mt-1 t-cap leading-normal text-[var(--text-muted)]">{desc}</span>
      </button>
    </DepthCard>
  );
}
