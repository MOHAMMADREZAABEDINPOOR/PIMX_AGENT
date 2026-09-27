'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Smile, X } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { AI_REACTION_SET } from '@/lib/agent/orchestrator';
import type { MessageReaction } from '@/lib/types';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export function MessageReactions({ chatId, msgId, reactions = [], variant }: { chatId: string; msgId: string; reactions?: MessageReaction[]; variant: 'user' | 'assistant' }) {
  const $t=useT();
  const toggleReaction = useAppStore(s => s.toggleReaction);
  const enabled = useAppStore(s => s.settings.showReactions !== false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const selected = reactions.find(r => r.by === (variant === 'user' ? 'ai' : 'user'));
  useEffect(() => {
    if (!position) return;
    panel.current?.querySelector<HTMLButtonElement>('button[data-emoji]')?.focus({ preventScroll: true });
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setPosition(null); trigger.current?.focus(); } };
    const dismiss = (event: Event) => {
      if (event.target instanceof Node && panel.current?.contains(event.target)) return;
      setPosition(null);
    };
    window.addEventListener('keydown', close); window.addEventListener('resize', dismiss);
    document.addEventListener('scroll', dismiss, true);
    return () => { window.removeEventListener('keydown', close); window.removeEventListener('resize', dismiss); document.removeEventListener('scroll', dismiss, true); };
  }, [position]);
  if (!enabled || (variant === 'user' && !selected)) return null;
  return <div className={`message-reactions flex items-center gap-1.5 mt-2 px-2 not-prose ${variant === 'user' ? 'justify-end' : 'justify-start'}`} data-message={msgId}>
    {selected && (variant === 'user' ? <span title={$t("AI reaction")} className="reaction-pill">{selected.emoji}</span> : <button type="button" aria-label={$t("Remove your reaction")} onClick={() => toggleReaction(chatId, msgId, selected.emoji, 'user')} className="reaction-pill selected">{selected.emoji}</button>)}
    {variant === 'assistant' && <button ref={trigger} type="button" aria-label={$t("React to message")} aria-expanded={!!position} aria-haspopup="dialog" className="h-8 w-8 rounded-full grid place-items-center text-muted hover:bg-[var(--accent-subtle)] hover:text-[var(--accent-color)] cursor-pointer" onClick={() => {
      if (position) { setPosition(null); return; }
      const rect = trigger.current!.getBoundingClientRect();
      setPosition({ left: Math.max(8, Math.min(rect.left, window.innerWidth - 304)), top: Math.max(8, Math.min(rect.top - 340, window.innerHeight - 348)) });
    }}><Smile size={16} /></button>}
    {position && createPortal(<>
      <div className="fixed inset-0 z-[80]" onClick={() => setPosition(null)} />
      <div ref={panel} role="dialog" aria-label={$t("Choose one reaction")} className="reaction-picker fixed z-[81] w-[296px] rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-3 shadow-2xl" style={position}>
        <div className="flex justify-between items-center pb-2 mb-2 border-b border-[var(--border-color)] text-xs"><span><UiText source={"100 reactions · choose one"}/></span><button type="button" aria-label={$t("Close reactions")} onClick={() => { setPosition(null); trigger.current?.focus(); }} className="p-1"><X size={14} /></button></div>
        <div className="grid grid-cols-8 gap-1 max-h-[270px] overflow-y-auto overscroll-contain">{AI_REACTION_SET.map(emoji => <button key={emoji} type="button" data-emoji={emoji} aria-label={$t("React {0}",emoji)} aria-pressed={selected?.emoji === emoji} className="h-8 rounded-lg text-xl hover:bg-[var(--accent-subtle)] focus-visible:outline-2 focus-visible:outline-[var(--accent-color)] cursor-pointer" onClick={() => { toggleReaction(chatId, msgId, emoji, 'user'); setPosition(null); trigger.current?.focus(); }}>{emoji}</button>)}</div>
      </div>
    </>, document.body)}
  </div>;
}
