'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronsLeftRight, Maximize2, Minimize2, Minus, Plus, PanelRightClose } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export function ResizableWorkspace({ children, closing }: { children: React.ReactNode; closing: boolean }) {
  const $t=useT();
  const { settings, updateSettings, setActiveToolPanel } = useAppStore();
  const [width, setWidth] = useState(settings.workspaceWidth || 580);
  const [expanded, setExpanded] = useState(false);
  const [maximum, setMaximum] = useState(1024);
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    const parent = panel.current?.parentElement; if (!parent) return;
    const observer = new ResizeObserver(() => setMaximum(Math.max(320, parent.clientWidth - 320)));
    observer.observe(parent); return () => observer.disconnect();
  }, []);
  const drag = useRef<{ start: number; width: number } | null>(null);
  const effectiveWidth = Math.min(width, maximum);
  const clamp = (value: number) => Math.round(Math.max(320, Math.min(value, maximum)));
  const change = (value: number) => { const next = clamp(value); setWidth(next); updateSettings({ workspaceWidth: next }); };
  return <aside ref={panel} id="workspace-side-panel" data-expanded={expanded} className={`workspace-frame ${expanded ? 'is-expanded' : ''} ${closing ? 'workspace-panel-exiting' : 'workspace-panel-entering'}`} style={{ '--workspace-width': `${effectiveWidth}px` } as React.CSSProperties}>
    {!expanded && <div role="separator" aria-label={$t("Resize workspace")} aria-orientation="vertical" aria-valuemin={320} aria-valuemax={maximum} aria-valuenow={effectiveWidth} tabIndex={0} className="workspace-resizer" onPointerDown={event => { drag.current = { start: event.clientX, width: effectiveWidth }; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={event => { if (drag.current) setWidth(clamp(drag.current.width + drag.current.start - event.clientX)); }} onPointerUp={event => { if (drag.current) { updateSettings({ workspaceWidth: width }); drag.current = null; event.currentTarget.releasePointerCapture(event.pointerId); } }} onPointerCancel={() => { drag.current = null; }} onKeyDown={event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); change(width + (event.key === 'ArrowLeft' ? 40 : -40)); } }}><span /></div>}
    <div className="workspace-size-controls flex items-center gap-1 px-3 py-1.5 border-b border-[var(--border-color)] text-muted text-[10px] shrink-0">
      <ChevronsLeftRight size={12} /><span className="flex-1"><UiText source={"Workspace"}/> <span className="hidden lg:inline tabular-nums">· {expanded ? <UiText source={"full"}/> : `${effectiveWidth}px`}</span></span>
      <button aria-label={$t("Make workspace smaller")} onClick={() => { setExpanded(false); change(effectiveWidth - 100); }} className="hidden lg:flex p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"><Minus size={13} /></button>
      <button aria-label={$t("Make workspace larger")} onClick={() => change(effectiveWidth + 100)} className="hidden lg:flex p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"><Plus size={13} /></button>
      <button aria-label={$t(expanded ? 'Restore workspace size' : 'Expand workspace')} onClick={() => setExpanded(!expanded)} className="hidden lg:flex p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">{expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}</button>
      <button aria-label={$t("Minimize workspace")} onClick={() => setActiveToolPanel('NONE')} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"><PanelRightClose size={13} /></button>
    </div><div className="flex-1 min-h-0 flex flex-col">{children}</div>
  </aside>;
}
