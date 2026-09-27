'use client';

/**
 * CapabilityDeck
 *
 * The product's capability set, presented as a depth grid. Every entry comes
 * from the shared tool catalog, so the deck and the composer tools menu can
 * never drift apart.
 *
 * The deck is functional, not an illustration: each cell toggles the same
 * store action the composer uses, reflects the real active state, and mirrors
 * the mutually-exclusive dedicated-workspace rule. Accent hue is used only as
 * a small signal (icon tint and a hairline rim); surfaces stay neutral so the
 * grid does not collapse into one wash of colour.
 */

import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { Check, Lock } from 'lucide-react';
import type { ChatTool } from '@/lib/types';
import { DEDICATED_TOOLS, TOOL_OPTIONS } from '@/lib/tools/catalog';
import { DepthCard, Scene3D } from '@/components/agent/primitives';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

const SPAN: Partial<Record<ChatTool, string>> = {
  WEB_SEARCH: 'lg:col-span-2',
  THINK: 'lg:col-span-2',
  DEEP_RESEARCH: 'lg:col-span-2',
  CANVAS: 'lg:col-span-2',
  SLIDES: 'lg:col-span-2',
  WEB_DEV: 'lg:col-span-2',
  SOURCE_QA: 'lg:col-span-3',
  LEARN: 'lg:col-span-3',
  DEBATE: 'lg:col-span-2',
  COMPARE: 'lg:col-span-2',
  COUNCIL: 'sm:col-span-2 lg:col-span-2',
};

/** One lead cell gets a perspective floor, so the grid is not 11 identical boxes. */
function LeadAtmosphere() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <span
        className="grid-floor grid-floor-tilt absolute inset-x-0 top-0 block h-[220%] opacity-80"
        style={{ transformOrigin: '50% 0%' }}
      />
      <span
        className="absolute inset-0 block"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--accent-color) 7%, transparent), transparent 62%)',
        }}
      />
    </span>
  );
}

/** Three planes at three depths, illustrating structured reasoning. */
function DepthStackGlyph() {
  return (
    <span aria-hidden="true" className="relative block h-16 w-full">
      <span className="absolute inset-x-2 top-0 h-8 rounded-md border border-[var(--border-color)] bg-[var(--bg-color)] opacity-45" style={{ transform: 'translateY(-7px) scale(0.9)' }} />
      <span className="absolute inset-x-1 top-0 h-9 rounded-md border border-[var(--border-color)] bg-[var(--bg-color)] opacity-75" style={{ transform: 'translateY(-3px) scale(0.95)' }} />
      <span className="absolute inset-x-0 top-0 h-10 rounded-md border border-[var(--border-color)] bg-[var(--surface-color)]" style={{ boxShadow: 'var(--depth-1)' }} />
      <span className="absolute inset-x-0 top-0 flex h-10 flex-col justify-center gap-1 px-2.5">
        <span className="block h-1 w-2/3 rounded-full bg-[var(--accent-color)] opacity-70" />
        <span className="block h-1 w-1/2 rounded-full bg-[var(--text-muted)] opacity-40" />
        <span className="block h-1 w-4/5 rounded-full bg-[var(--text-muted)] opacity-25" />
      </span>
    </span>
  );
}

/** A four-node pipeline rail, illustrating the research hierarchy. */
function PipelineGlyph() {
  const stages = ['Plan', 'Search', 'Critique', 'Synthesize'];
  return (
    <span aria-hidden="true" className="flex items-center gap-1.5">
      {stages.map((stage, index) => (
        <span key={stage} className="flex items-center gap-1.5">
          <span className="flex flex-col items-center gap-1">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: index === stages.length - 1 ? 'var(--accent-color)' : 'var(--text-muted)',
                opacity: index === stages.length - 1 ? 1 : 0.5,
              }}
            />
            <span className="t-mono text-[9px] text-[var(--text-muted)]">{stage}</span>
          </span>
          {index < stages.length - 1 ? <SignalRailH /> : null}
        </span>
      ))}
    </span>
  );
}

function SignalRailH() {
  return <span aria-hidden="true" className="mb-3 block h-px w-4 bg-[var(--rail-color)]" />;
}

const VISUAL: Partial<Record<ChatTool, () => React.ReactElement>> = {
  THINK: DepthStackGlyph,
  DEEP_RESEARCH: PipelineGlyph,
};

export function CapabilityDeck({ className = '' }: { className?: string }) {
  const $t=useT();
  const {
    activeChatId,
    chats,
    toggleChatTool,
    toggleWebSearch,
    toggleThinking,
    setCompareModalOpen,
    setCouncilModalOpen,
  } = useAppStore();

  const currentChat = chats.find((chat) => chat.id === activeChatId);
  const activeTools: ChatTool[] =
    currentChat?.activeTools ||
    (currentChat?.toolMode && currentChat.toolMode !== 'NONE' ? [currentChat.toolMode] : []);
  const isWebSearchActive = !!(currentChat?.webSearchEnabled || activeTools.includes('WEB_SEARCH'));
  const isThinkingActive = !!(currentChat?.thinkingEnabled || activeTools.includes('THINK'));
  const activeDedicatedTool = activeTools.find((tool) => DEDICATED_TOOLS.includes(tool));

  const isActive = (tool: ChatTool) => {
    if (tool === 'WEB_SEARCH') return isWebSearchActive;
    if (tool === 'THINK') return isThinkingActive;
    return activeTools.includes(tool);
  };

  const isIncompatible = (tool: ChatTool) =>
    !!activeDedicatedTool && activeDedicatedTool !== tool && DEDICATED_TOOLS.includes(tool);

  const activate = (tool: ChatTool) => {
    // The store's tool actions require an active conversation. On a fresh
    // screen there is none yet, so create the empty conversation first;
    // otherwise arming a capability from the deck would silently do nothing.
    const state = useAppStore.getState();
    if (!state.activeChatId) state.createChat();

    if (tool === 'WEB_SEARCH') {
      toggleWebSearch();
      return;
    }
    if (tool === 'THINK') {
      toggleThinking();
      return;
    }
    if (tool === 'COMPARE') {
      const alreadyActive = activeTools.includes('COMPARE');
      toggleChatTool('COMPARE');
      if (!alreadyActive) setCompareModalOpen(true);
      return;
    }
    if (tool === 'COUNCIL') {
      const alreadyActive = activeTools.includes('COUNCIL');
      toggleChatTool('COUNCIL');
      if (!alreadyActive) setCouncilModalOpen(true);
      return;
    }
    toggleChatTool(tool);
  };

  const activeCount = TOOL_OPTIONS.filter((option) => isActive(option.tool)).length;

  return (
    <section className={className} aria-labelledby="capability-deck-heading">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="capability-deck-heading" className="t-h2 text-[var(--text-color)]">
           <UiText source={"Capabilities"}/> </h2>
        <p className="t-cap text-[var(--text-muted)]">
          {activeCount > 0
            ? `${activeCount} active in this conversation`
            : <UiText source={"Tap any capability to arm it before you send"}/>}
        </p>
      </div>

      <Scene3D>
        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-6">
          {TOOL_OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = isActive(option.tool);
            const incompatible = isIncompatible(option.tool);
            const Visual = VISUAL[option.tool];
            const isLead = option.tool === 'WEB_SEARCH';

            return (
              <li key={option.tool} className={`min-w-0 ${SPAN[option.tool] || 'lg:col-span-2'}`}>
                <DepthCard
                  as="div"
                  depth={active ? 3 : 2}
                  accent={active ? 'var(--accent-color)' : undefined}
                  className={`relative flex h-full flex-col overflow-hidden rounded-xl p-3.5 text-start ${
                    incompatible ? 'opacity-45' : ''
                  }`}
                  style={
                    active
                      ? {
                          borderColor: 'var(--accent-border)',
                          background: 'color-mix(in srgb, var(--accent-color) 7%, var(--surface-color))',
                        }
                      : undefined
                  }
                >
                  {isLead ? <LeadAtmosphere /> : null}

                  <div className="relative flex items-start justify-between gap-2">
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-color)]"
                      style={{ boxShadow: 'var(--edge-hi)' }}
                    >
                      <Icon className={`h-4 w-4 ${option.color}`} strokeWidth={1.75} />
                    </span>

                    {active ? (
                      <span
                        className="grid h-5 w-5 shrink-0 place-items-center rounded-full"
                        style={{ background: 'var(--accent-color)', color: 'var(--accent-contrast, #fff)' }}
                        title={$t("Active")}
                      >
                        <Check className="h-3 w-3" strokeWidth={2.6} />
                      </span>
                    ) : incompatible ? (
                      <span className="text-[var(--text-muted)]" title={$t("Not combinable with {0}",activeDedicatedTool)}>
                        <Lock className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </span>
                    ) : null}
                  </div>

                  <div className="relative mt-2.5 flex-1">
                    <h3 className="t-small font-semibold text-[var(--text-color)]">{<UiText source={option.label}/>}</h3>
                    <p className="mt-0.5 t-cap leading-relaxed text-[var(--text-muted)]">{<UiText source={option.description}/>}</p>
                  </div>

                  {Visual ? (
                    <div className="relative mt-3">
                      <Visual />
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => activate(option.tool)}
                    disabled={incompatible}
                    aria-pressed={active}
                    title={$t(incompatible?$t("Not combinable with {0}",activeDedicatedTool):active?$t("Turn off {0}",$t(option.label)):$t("Turn on {0}",$t(option.label)))}
                    className="relative mt-3 flex w-full cursor-pointer items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-color)] py-1.5 t-cap font-semibold text-[var(--text-color)] transition-transform duration-150 hover:border-[var(--accent-border)] active:scale-[0.985] disabled:cursor-not-allowed"
                  >
                    {active ? <UiText source={"Active"}/> : incompatible ? <UiText source={"Unavailable"}/> : <UiText source={"Arm"}/>}
                  </button>
                </DepthCard>
              </li>
            );
          })}
        </ul>
      </Scene3D>
    </section>
  );
}
