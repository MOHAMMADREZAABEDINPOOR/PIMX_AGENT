import type { SlideDeckEntity } from '../types';

export const SLIDE_PALETTES: Record<SlideDeckEntity['theme'], { background: string; text: string; muted: string; accent: string }> = {
  MODERN_DARK: { background: '#0F172A', text: '#E2E8F0', muted: '#94A3B8', accent: '#A78BFA' },
  CLEAN_LIGHT: { background: '#FFFFFF', text: '#1E293B', muted: '#64748B', accent: '#2563EB' },
  CYBERPUNK: { background: '#0B1020', text: '#CFFAFE', muted: '#67E8F9', accent: '#22D3EE' },
  MINIMAL_PURPLE: { background: '#F5F3FF', text: '#2E1065', muted: '#7C3AED', accent: '#7C3AED' },
};
export function slidePalette(theme: SlideDeckEntity['theme']) { return SLIDE_PALETTES[theme] || SLIDE_PALETTES.MODERN_DARK; }
export function slideAccent(custom: string | undefined, theme: SlideDeckEntity['theme']) {
  return custom && /^#[0-9a-f]{6}$/i.test(custom) && custom.toUpperCase() !== '#8B5CF6' ? custom : slidePalette(theme).accent;
}
