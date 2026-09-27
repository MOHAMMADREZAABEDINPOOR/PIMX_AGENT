'use client';

/**
 * Cognition primitives.
 *
 * Shared building blocks for the agent's instrument surfaces: CSS-3D scenes,
 * depth cards, state-bound telemetry motion and the canvas constellation field.
 *
 * Two rules govern every file in components/agent:
 *   1. Motion is bound to a live state. Nothing loops when the agent is idle.
 *   2. Nothing moves under the pointer. Depth is a static composition; hover is
 *      expressed with border and rim colour only. Cards that shift on hover make
 *      dense reading surfaces feel unstable, so the tilt experiment is gone.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

type DepthLevel = 1 | 2 | 3 | 4;

const DEPTH_CLASS: Record<DepthLevel, string> = {
  1: 'depth-1',
  2: 'depth-2',
  3: 'depth-3',
  4: 'depth-4',
};

/** Perspective wrapper. `near` tightens the frustum for compact stages. */
export function Scene3D({
  children,
  near = false,
  className = '',
}: {
  children: React.ReactNode;
  near?: boolean;
  className?: string;
}) {
  return (
    <div className={`${near ? 'scene-3d-near' : 'scene-3d'} layer-3d ${className}`}>
      {children}
    </div>
  );
}

/** Framed surface with a physical edge highlight. The base of most panels. */
export function EdgeFrame({
  children,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section';
}) {
  return (
    <Tag className={`edge-light border border-[var(--border-color)] bg-[var(--surface-color)] ${className}`}>
      {children}
    </Tag>
  );
}

/**
 * A surface resting at a fixed depth in the scene.
 *
 * Static by design: it never translates, rotates or scales in response to the
 * pointer. `accent` draws a hairline rim light along the top edge, which is the
 * only tool-identity colour a card is allowed to carry.
 */
export function DepthCard({
  children,
  depth = 2,
  accent,
  className = '',
  interactive = false,
  as = 'div',
  style,
  ...rest
}: {
  children: React.ReactNode;
  depth?: DepthLevel;
  accent?: string;
  className?: string;
  interactive?: boolean;
  as?: 'div' | 'li' | 'article' | 'section';
} & React.HTMLAttributes<HTMLElement>) {
  const Tag = as as React.ElementType;

  return (
    <Tag
      style={style}
      className={`${DEPTH_CLASS[depth]} relative border border-[var(--border-color)] bg-[var(--surface-color)] ${
        interactive
          ? 'transition-[border-color] duration-150 hover:border-[var(--accent-border)]'
          : ''
      } ${className}`}
      {...rest}
    >
      {accent ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        />
      ) : null}
      {children}
    </Tag>
  );
}

/**
 * Two counter-rotating rings. Rotation only runs while `active` is true
 * (the parent carries `.is-live`), so an idle agent is completely still.
 */
export function OrbitRing({
  size = 132,
  color,
  reverse = false,
  className = '',
}: {
  size?: number;
  color?: string;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`orbit-ring pointer-events-none absolute ${reverse ? 'orbit-ring-reverse' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        ...(color ? { filter: `drop-shadow(0 0 6px ${color})` } : null),
      }}
    />
  );
}

/** A soft accent sweep that scans a surface while a run is live. */
export function ScanSweep({
  className = '',
  height = 42,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <span className="scan-sweep absolute inset-x-0 block opacity-0" style={{ height }} />
    </span>
  );
}

/**
 * Vertical connector between agent nodes. The accent gradient flows only
 * while `active`, so it reads as live current, not as decoration.
 */
export function SignalRail({
  active = false,
  done = false,
  className = '',
}: {
  active?: boolean;
  done?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`relative block w-px ${className}`}
      style={{ background: 'var(--rail-color)', opacity: done ? 1 : 0.72 }}
    >
      {active ? <span className="signal-rail-flow absolute inset-0 block" /> : null}
    </span>
  );
}

/** Horizontal connector, direction-agnostic. */
export function SignalRailH({
  active = false,
  className = '',
}: {
  active?: boolean;
  className?: string;
}) {
  return (
    <span aria-hidden="true" className={`signal-rail-h relative block h-px ${className}`}>
      {active ? (
        <span
          className="absolute inset-0 block"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--accent-color), transparent)',
            backgroundSize: '220% 100%',
          }}
        />
      ) : null}
    </span>
  );
}

/** Mono read-out. Numbers only ever come from real state. */
export function TelemetryStat({
  label,
  value,
  accent,
  className = '',
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <span className="t-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </span>
      <span
        className="t-mono text-[13px] font-semibold"
        style={accent ? { color: 'var(--accent-color)' } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

type Particle = { x: number; y: number; vx: number; vy: number; r: number };

/**
 * Canvas constellation field.
 *
 * Cost control: capped particle count, no per-particle shadow, paused when
 * off-screen or when the tab is hidden, and a single static frame under
 * reduced motion. Purely atmospheric, so it is hidden from assistive tech.
 */
export function NeuralField({
  className = '',
  density = 1,
  opacity = 0.5,
  linkDistance = 118,
}: {
  className?: string;
  density?: number;
  opacity?: number;
  linkDistance?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visible, setVisible] = useState(true);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = canvas.parentElement;
    if (!host) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let running = false;
    let destroyed = false;

    const readAccent = () => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim();
      const parts = raw.split(',').map((piece) => Number.parseFloat(piece));
      if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) return parts;
      return [139, 124, 255];
    };

    let rgb = readAccent();

    const build = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(
        18,
        Math.min(70, Math.round(((width * height) / 16000) * density))
      );
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.3 + 0.5,
      }));
    };

    const draw = (step: boolean) => {
      context.clearRect(0, 0, width, height);
      const [r, g, b] = rgb;

      for (const particle of particles) {
        if (step) {
          particle.x += particle.vx;
          particle.y += particle.vy;
          if (particle.x < -8) particle.x = width + 8;
          if (particle.x > width + 8) particle.x = -8;
          if (particle.y < -8) particle.y = height + 8;
          if (particle.y > height + 8) particle.y = -8;
        }
        context.beginPath();
        context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        context.fillStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
        context.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.hypot(dx, dy);
          if (distance > linkDistance) continue;
          const strength = (1 - distance / linkDistance) * 0.22;
          context.beginPath();
          context.moveTo(particles[i].x, particles[i].y);
          context.lineTo(particles[j].x, particles[j].y);
          context.strokeStyle = `rgba(${r}, ${g}, ${b}, ${strength})`;
          context.lineWidth = 1;
          context.stroke();
        }
      }
    };

    const loop = () => {
      if (destroyed || !running) return;
      draw(true);
      frame = window.requestAnimationFrame(loop);
    };

    const start = () => {
      if (destroyed || running || !visible || document.hidden) return;
      running = true;
      if (reduce) {
        draw(false);
        running = false;
        return;
      }
      frame = window.requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };

    build();
    if (reduce) draw(false);
    start();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            build();
            if (reduce || !running) draw(false);
          })
        : null;
    resizeObserver?.observe(host);

    const intersectionObserver =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              const entry = entries[0];
              const nowVisible = entry.isIntersecting && entry.intersectionRatio > 0.02;
              setVisible(nowVisible);
              if (nowVisible) start();
              else stop();
            },
            { threshold: [0, 0.02, 0.3] }
          )
        : null;
    intersectionObserver?.observe(host);

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const themeObserver =
      typeof MutationObserver !== 'undefined'
        ? new MutationObserver(() => {
            rgb = readAccent();
            if (!running) draw(false);
          })
        : null;
    themeObserver?.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });

    return () => {
      destroyed = true;
      stop();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      themeObserver?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [density, linkDistance, reduce, visible]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ opacity }}
    />
  );
}

/** Reusable state pill for run status. `tone` maps to semantic state, not hue. */
export function StateChip({
  tone = 'idle',
  children,
  className = '',
}: {
  tone?: 'idle' | 'live' | 'done' | 'failed';
  children: React.ReactNode;
  className?: string;
}) {
  const toneClass =
    tone === 'live'
      ? 'border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--accent-color)]'
      : tone === 'done'
        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
        : tone === 'failed'
          ? 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
          : 'border-[var(--border-color)] bg-[color-mix(in_srgb,var(--text-muted)_8%,transparent)] text-[var(--text-muted)]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-[3px] t-mono text-[10px] font-semibold ${toneClass} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full bg-current ${tone === 'live' ? 'telemetry-dot' : ''}`}
      />
      {children}
    </span>
  );
}
