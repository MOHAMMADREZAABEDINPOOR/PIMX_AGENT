'use client';

import { useState } from 'react';
import { X, MessageSquarePlus, Settings2 } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export function PimxPet() {
  const $t=useT();
  const { settings, isGenerating, generatingChatId, activeChatId, messages, activeToolPanel, lastCompletedChatId, createChat, setSettingsOpen, updateSettings } = useAppStore();
  const [open, setOpen] = useState(false); const [patted, setPatted] = useState(false);
  const message = (messages[generatingChatId || activeChatId || ''] || []).findLast(m => m.role === 'assistant');
  const step = message?.toolSteps?.findLast(s => s.status === 'CALLING');
  const mood = isGenerating ? step?.toolName === 'web_search' || step?.toolName === 'agent_read' ? 'search' : step?.toolName === 'agent_plan' ? 'think' : 'work' : lastCompletedChatId ? 'happy' : patted ? 'happy' : 'idle';
  const fa = settings.responseLanguage === 'FA' || /[\u0600-\u06FF]/.test((messages[activeChatId || ''] || []).findLast(m => m.role === 'user')?.content || message?.reasoning || '');
  const labels = { idle: fa ? 'من اینجام؛ آمادهٔ یه ایدهٔ تازه؟' : 'Right here. Ready for your next idea?', think: fa ? 'داریم مسیر حل رو بررسی می‌کنیم…' : 'Working out the plan…', search: fa ? 'داریم منابع رو بررسی می‌کنیم…' : 'Following the evidence…', work: fa ? 'مدل داره روی درخواستت کار می‌کنه…' : 'Your model is working on it…', happy: lastCompletedChatId ? (fa ? 'آماده‌ست! بیا یه نگاه بندازیم.' : 'All set! Take a look.') : (fa ? 'سلام! خوش اومدی.' : 'Hello! Good to see you.') };
  if (settings.petEnabled === false || activeToolPanel !== 'NONE') return null;
  return <div className="pimx-pet" data-mood={mood}>
    {open && <div className="pet-dialog rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-3 shadow-xl mb-2 text-[var(--text-color)]"><div className="flex items-center justify-between gap-4"><strong className="text-xs"><UiText source={"Pip · PIMX companion"}/></strong><button aria-label={$t("Close companion")} onClick={() => setOpen(false)} className="p-1"><X size={13} /></button></div><p className="text-xs leading-6 text-muted my-2" dir="auto" role="status">{labels[mood]}</p><div className="flex gap-2"><button aria-label={$t("Start a chat with Pip")} disabled={isGenerating} onClick={() => { createChat(); setOpen(false); }} className="rounded-lg p-2 bg-[var(--accent-color)] text-white disabled:opacity-40"><MessageSquarePlus size={14} /></button><button aria-label={$t("Companion settings")} onClick={() => { setSettingsOpen(true, 'general'); setOpen(false); }} className="rounded-lg p-2 border border-[var(--border-color)]"><Settings2 size={14} /></button><button onClick={() => updateSettings({ petEnabled: false })} className="text-[10px] text-muted ms-auto"><UiText source={"Hide pet"}/></button></div></div>}
    <button aria-label={$t("PIMX companion Pip")} aria-expanded={open} onClick={() => { setOpen(!open); setPatted(true); }} className="pet-body focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-color)]">
      <svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><defs><linearGradient id="pip-body" x1="20" y1="20" x2="80" y2="85" gradientUnits="userSpaceOnUse"><stop stopColor="#c4b5fd" /><stop offset="1" stopColor="#6d28d9" /></linearGradient></defs><ellipse className="pet-shadow" cx="50" cy="88" rx="27" ry="5" fill="#8b5cf6" opacity=".18" /><g className="pet-creature"><path d="M24 38 17 18Q16 10 25 14L40 26M76 38 83 18Q84 10 75 14L60 26" fill="#c4b5fd" stroke="#8b5cf6" strokeWidth="3" /><path d="M20 49Q20 24 50 24Q80 24 80 49V64Q80 85 50 85Q20 85 20 64Z" fill="url(#pip-body)" /><path d="M27 78 24 87M73 78 76 87" stroke="#8b5cf6" strokeWidth="9" strokeLinecap="round" /><rect x="27" y="39" width="46" height="28" rx="13" fill="#231943" /><g className="pet-eyes"><ellipse cx="40" cy="52" rx="3.5" ry="5" fill="#a5f3fc" /><ellipse cx="60" cy="52" rx="3.5" ry="5" fill="#a5f3fc" /></g><path className="pet-smile" d="M44 61Q50 65 56 61" stroke="#a5f3fc" strokeWidth="2" strokeLinecap="round" /><path d="M13 54 8 63M87 54 92 63" stroke="#a78bfa" strokeWidth="7" strokeLinecap="round" /><path d="m47 31 3-5 3 5-3 4z" fill="#e9d5ff" /></g><g className="pet-spark" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"><path d="M87 8v8M83 12h8M8 35v6M5 38h6" /></g></svg>
      <span className="pet-status" aria-hidden="true" />
    </button>
  </div>;
}
