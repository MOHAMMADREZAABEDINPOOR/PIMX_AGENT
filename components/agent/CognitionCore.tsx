'use client';

/**
 * CognitionCore
 *
 * The instrument stage that represents the agent's mind while it works.
 *
 * Three planes sit at distinct Z depths inside a single perspective scene:
 *   rear  - mono telemetry read-outs (only values that really exist)
 *   mid   - the orbit rings, the scan sweep and the perspective floor grid
 *   front - the brand mark at the core plus the live phase label
 *
 * Ambient motion is driven by the `active` flag: the wrapper only receives
 * `.is-live` while a run is genuinely in progress, so an idle agent renders
 * as a completely still object. That keeps the motion honest (it means
 * "work happening") and keeps it inside WCAG 2.2.2, since nothing loops
 * unprompted for an idle surface.
 */

import React from 'react';
import { Activity, Brain, BookOpen, CheckCircle2, Clock, Globe, Sparkles, XCircle } from 'lucide-react';
import { NeuralField, OrbitRing, ScanSweep, StateChip, TelemetryStat } from './primitives';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export type CognitionState =
  | 'idle'
  | 'thinking'
  | 'searching'
  | 'reading'
  | 'synthesizing'
  | 'done'
  | 'failed';

const STATE_ICON: Record<CognitionState, typeof Brain> = {
  idle: Activity,
  thinking: Brain,
  searching: Globe,
  reading: BookOpen,
  synthesizing: Sparkles,
  done: CheckCircle2,
  failed: XCircle,
};

const STATE_PHASE: Record<CognitionState, string> = {
  idle: 'IDLE',
  thinking: 'REASON',
  searching: 'SEARCH',
  reading: 'READ',
  synthesizing: 'SYNTH',
  done: 'COMPLETE',
  failed: 'FAULT',
};

export interface CognitionCoreProps {
  state: CognitionState;
  /** Already localised live status text, supplied by the parent. */
  label: string;
  elapsedSecs?: number | null;
  stepCount?: number;
  /** True only while the run is genuinely live. Gates every ambient animation. */
  active: boolean;
  /** Localised labels for the telemetry read-outs. */
  labels?: {
    elapsed?: string;
    steps?: string;
    phase?: string;
  };
  compact?: boolean;
  className?: string;
}

export function CognitionCore({
  state,
  label,
  elapsedSecs = null,
  stepCount,
  active,
  labels,
  compact = false,
  className = '',
}: CognitionCoreProps) {
  const $t=useT();
  const Icon = STATE_ICON[state];
  const tone = state === 'failed' ? 'failed' : active ? 'live' : state === 'done' ? 'done' : 'idle';
  const coreSize = compact ? 84 : 132;
  const markSize = compact ? 34 : 52;

  return (
    <div
      className={`${active ? 'is-live' : ''} relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] ${className}`}
      style={{ boxShadow: 'var(--depth-2)' }}
    >
      {/* rear plane: atmosphere + constellation field */}
      <div className="absolute inset-0" aria-hidden="true">
        <NeuralField opacity={0.42} density={compact ? 0.7 : 1} linkDistance={compact ? 96 : 128} />
        <div className="grid-floor absolute inset-0 opacity-70" />
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 opacity-40"
          style={{
            background:
              'linear-gradient(180deg, transparent, color-mix(in srgb, var(--accent-color) 6%, transparent))',
          }}
        />
      </div>

      {/* mid plane: the instrument */}
      <div
        className="layer-3d relative flex items-center gap-4 px-4"
        style={{ paddingBlock: compact ? '14px' : '22px' }}
      >
        <div className="relative shrink-0" style={{ width: coreSize, height: coreSize }} aria-hidden="true">
          <OrbitRing size={coreSize} className="inset-0" />
          <OrbitRing size={coreSize * 0.74} reverse className="inset-0 m-auto" color="var(--accent-color)" />
          <span
            className="absolute inset-0 rounded-full"
            style={{
              border: '1px solid color-mix(in srgb, var(--accent-color) 26%, transparent)',
            }}
          />
          <span className="absolute inset-0 m-auto flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand-logo.webp"
              alt={$t("")}
              width={markSize}
              height={markSize}
              decoding="async"
              className="object-contain"
              style={{ width: markSize, height: markSize, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.35))' }}
            />
          </span>
          <ScanSweep height={compact ? 22 : 34} />
        </div>

        {/* front plane: the read-out */}
        <div className="plane-3d relative min-w-0 flex-1" style={{ transform: 'translateZ(24px)' }}>
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <StateChip tone={tone as 'live' | 'done' | 'failed' | 'idle'}>
              <Icon className="h-2.5 w-2.5" strokeWidth={2} />
              <span style={{ letterSpacing: 'normal' }}>{STATE_PHASE[state]}</span>
            </StateChip>
            {typeof elapsedSecs === 'number' ? (
              <span className="t-mono inline-flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                <Clock className="h-2.5 w-2.5" strokeWidth={1.75} />
                {elapsedSecs}<UiText source={"s"}/> </span>
            ) : null}
          </div>

          <p className="t-small font-semibold leading-snug text-[var(--text-color)]">{label}</p>

          {(typeof stepCount === 'number' && stepCount > 0) || typeof elapsedSecs === 'number' ? (
            <div className="mt-3 flex items-end gap-5">
              {typeof elapsedSecs === 'number' ? (
                <TelemetryStat label={$t(labels?.elapsed || 'Elapsed')} value={`${elapsedSecs}s`} />
              ) : null}
              {typeof stepCount === 'number' && stepCount > 0 ? (
                <TelemetryStat label={$t(labels?.steps || 'Steps')} value={stepCount} />
              ) : null}
              <TelemetryStat label={$t(labels?.phase || 'Phase')} value={STATE_PHASE[state]} accent />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
