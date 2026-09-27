'use client';

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, X } from 'lucide-react';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export function ConfirmDialog({ title, description, confirmLabel = 'Delete', onConfirm, onClose }: { title: string; description: string; confirmLabel?: string; onConfirm: () => void; onClose: () => void }) {
  const $t=useT();
  const id = useId(); const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLButtonElement>('[data-cancel]')?.focus();
    function key(event: KeyboardEvent) {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key !== 'Tab') return;
      const buttons = Array.from(panel.current?.querySelectorAll<HTMLButtonElement>('button') || []);
      const first = buttons[0], last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); previous?.focus(); };
  }, [onClose]);
  return createPortal(<div className="fixed inset-0 z-[150] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div ref={panel} role="alertdialog" aria-modal="true" aria-labelledby={id} aria-describedby={`${id}-body`} className="w-full max-w-sm rounded-3xl border border-[var(--border-color)] bg-[var(--surface-color)] p-6 shadow-2xl text-[var(--text-color)]"><div className="flex justify-between items-start"><span className="p-3 rounded-2xl bg-red-500/10 text-red-500"><Trash2 size={22} /></span><button aria-label={$t("Close dialog")} onClick={onClose} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10"><X size={16} /></button></div><h2 id={id} className="text-lg font-semibold mt-5">{title}</h2><p id={`${id}-body`} className="text-sm text-muted leading-6 mt-2">{description}</p><div className="flex justify-end gap-2 mt-6"><button data-cancel onClick={onClose} className="rounded-xl border border-[var(--border-color)] px-4 py-2 text-sm"><UiText source={"Cancel"}/></button><button onClick={onConfirm} className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-semibold">{confirmLabel}</button></div></div></div>, document.body);
}
