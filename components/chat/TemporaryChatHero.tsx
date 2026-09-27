'use client';

import { EyeOff, ShieldCheck, RefreshCw, History } from 'lucide-react';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export function TemporaryChatHero() {
  const $t=useT();
  return <section className="temporary-hero relative w-full overflow-hidden rounded-[28px] border border-amber-500/20 bg-[var(--surface-color)] p-6 sm:p-10 text-center" aria-label={$t("Temporary chat")}>
    <div className="temporary-halo" aria-hidden="true" />
    <div className="temporary-symbol mx-auto mb-5 grid h-16 w-16 place-items-center rounded-[22px] border border-amber-500/25 bg-amber-500/10 text-amber-500"><EyeOff size={29} strokeWidth={1.6} /></div>
    <span className="temporary-reveal inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400" style={{ animationDelay: '80ms' }}><ShieldCheck size={12} /><UiText source={"TEMPORARY CHAT"}/></span>
    <h2 className="temporary-reveal mt-4 text-2xl sm:text-4xl font-semibold tracking-tight" style={{ animationDelay: '150ms' }}><UiText source={"A little space, just for now."}/></h2>
    <p className="temporary-reveal mx-auto mt-3 max-w-md text-xs sm:text-sm leading-7 text-muted" style={{ animationDelay: '230ms' }}><UiText source={"Explore freely. This conversation and its generated files stay in this tab and won’t appear in your saved history."}/></p>
    <div className="temporary-reveal mt-6 flex flex-wrap justify-center gap-3 text-[10px] text-muted" style={{ animationDelay: '310ms' }}><span className="flex items-center gap-1.5"><History size={13} /><UiText source={"No saved history"}/></span><span className="flex items-center gap-1.5"><RefreshCw size={13} /><UiText source={"Cleared on reload"}/></span></div>
    <p className="temporary-reveal mt-4 text-[10px] leading-5 text-muted" style={{ animationDelay: '380ms' }}><UiText source={"Messages are still sent to your chosen AI provider to generate a response."}/></p>
  </section>;
}
