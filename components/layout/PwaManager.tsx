'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { Download, Smartphone, CheckCircle2 } from 'lucide-react';
import {UiText} from '@/components/i18n/LocaleProvider';

interface InstallPrompt extends Event { prompt(): Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>; }
const useInstall = create<{ prompt: InstallPrompt | null; installed: boolean }>(() => ({ prompt: null, installed: false }));

export function PwaManager() {
  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone;
    useInstall.setState({ installed: Boolean(standalone) });
    const ready = (event: Event) => { event.preventDefault(); useInstall.setState({ prompt: event as InstallPrompt }); };
    const installed = () => useInstall.setState({ prompt: null, installed: true });
    window.addEventListener('beforeinstallprompt', ready); window.addEventListener('appinstalled', installed);
    if ('serviceWorker' in navigator && window.isSecureContext && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => {});
    }
    return () => { window.removeEventListener('beforeinstallprompt', ready); window.removeEventListener('appinstalled', installed); };
  }, []);
  return null;
}

export function InstallAppCard() {
  const { prompt, installed } = useInstall();
  const [instructions, setInstructions] = useState(false);
  return <div className="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-subtle)] p-3">
    <div className="flex items-center gap-2"><Smartphone size={17} className="text-[var(--accent-color)]" /><span className="text-xs font-semibold flex-1"><UiText source={"PIMX on your home screen"}/></span><button type="button" onClick={async () => { if (prompt) { await prompt.prompt(); await prompt.userChoice; useInstall.setState({ prompt: null }); } else setInstructions(!instructions); }} disabled={installed} className="flex items-center gap-1.5 rounded-lg bg-[var(--accent-color)] text-[var(--accent-contrast)] px-3 py-2 text-xs cursor-pointer disabled:opacity-70">{installed ? <CheckCircle2 size={13} /> : <Download size={13} />}{installed ? <UiText source={"Installed"}/> : <UiText source={"Install app"}/>}</button></div>
    <p className="text-[10px] leading-5 text-muted mt-2"><UiText source={"Use the same workspace on mobile as an installed app. Saved chats stay available on this device; AI and web search require a connection."}/></p>
    {instructions && <p className="text-[11px] leading-6 mt-2"><UiText source={"iPhone / iPad: open in Safari → Share → Add to Home Screen. Android / desktop: use your browser’s Install app menu. Installation is available over HTTPS."}/></p>}
  </div>;
}
