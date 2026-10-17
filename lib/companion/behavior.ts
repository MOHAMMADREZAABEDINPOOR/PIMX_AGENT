import type { MessageEntity } from '../types';

export type PetMood = 'idle' | 'think' | 'search' | 'work' | 'happy' | 'error' | 'sleep';
export type Point = { x: number; y: number };
export const PET_SIZE = 88;

export function petMood(generating: boolean, message: MessageEntity | undefined, happy: boolean, sleepy: boolean): PetMood {
  if (generating) {
    const step = message?.toolSteps?.findLast(item => item.status === 'CALLING');
    if (step?.toolName === 'web_search' || step?.toolName === 'agent_read') return 'search';
    if (step?.toolName === 'agent_plan') return 'think';
    if (step) return 'work';
    if (message?.reasoning && !message.content && !message.toolSteps?.length) return 'think';
    return 'work';
  }
  if (message?.state === 'ERROR') return 'error';
  return happy ? 'happy' : sleepy ? 'sleep' : 'idle';
}

export function petBounds(point: Point, width: number, height: number): Point {
  return {
    x: Math.max(8, Math.min(point.x, Math.max(8, width - PET_SIZE - 8))),
    y: Math.max(64, Math.min(point.y, Math.max(64, height - PET_SIZE - 12))),
  };
}

/** A planted foot travels backwards at ground speed; only its return arc lifts. */
export function pawPosition(phase: number) {
  const p = ((phase % 1) + 1) % 1;
  const stance = 0.62;
  if (p < stance) return { x: 9 - 18 * p / stance, lift: 0 };
  const swing = (p - stance) / (1 - stance);
  return { x: -9 + 18 * swing, lift: Math.sin(swing * Math.PI) * 9 };
}

export function paintGait(svg: SVGSVGElement | null, distance: number, walking: boolean) {
  if (!svg) return;
  const phase = distance / (18 / 0.62 * PET_SIZE / 120);
  const bob = walking ? -Math.abs(Math.sin(phase * Math.PI * 2)) * 1.2 : 0;
  svg.style.setProperty('--body-bob', `${bob}px`);
  svg.querySelectorAll<SVGGElement>('[data-leg]').forEach(leg => {
    const hipX = Number(leg.dataset.hip);
    const far = leg.dataset.far === 'true';
    const offset = (hipX < 50 ? 0 : 0.5) + (far ? 0.5 : 0);
    const paw = walking ? pawPosition(phase + offset) : { x: 0, lift: 0 };
    const hipY = 65 + bob;
    const footX = hipX + paw.x;
    const footY = 86 - paw.lift + (far ? -2 : 0);
    // Two equal links bend toward the hock, with the paw flat on its stance.
    const dx = footX - hipX, dy = footY - hipY;
    const reach = Math.max(0.1, Math.hypot(dx, dy));
    const bend = Math.sqrt(Math.max(0, 13 * 13 - reach * reach / 4));
    const kneeX = (hipX + footX) / 2 - dy / reach * bend;
    const kneeY = (hipY + footY) / 2 + dx / reach * bend;
    leg.querySelector('path')?.setAttribute('d', `M${hipX} ${hipY}L${kneeX} ${kneeY}L${footX} ${footY}`);
    leg.querySelector('circle')?.setAttribute('cx', String(kneeX));
    leg.querySelector('circle')?.setAttribute('cy', String(kneeY));
    leg.querySelector('rect')?.setAttribute('x', String(footX - 4));
    leg.querySelector('rect')?.setAttribute('y', String(footY - 2));
  });
}
