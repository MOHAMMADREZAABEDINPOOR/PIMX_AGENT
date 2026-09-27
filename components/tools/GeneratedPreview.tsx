'use client';

import { useEffect, useId, useRef, useState } from 'react';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

/** POST navigation avoids persisting generated code or putting it in a URL. */
export function GeneratedPreview({ html, title, className = '' }: { html: string; title: string; className?: string }) {
  const $t=useT();
  const name = `pimx-preview-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const form = useRef<HTMLFormElement>(null);
  const submittedHtml = useRef<string | null>(null);
  const [loadedHtml, setLoadedHtml] = useState<string | null>(null);
  const loading = loadedHtml !== html;
  useEffect(() => {
    const timer = setTimeout(() => { submittedHtml.current = html; form.current?.submit(); }, 180);
    return () => clearTimeout(timer);
  }, [html]);
  return <div className={`relative ${className}`}>
    <form ref={form} action="/api/preview" method="POST" target={name} hidden>
      <input type="hidden" name="html" value={html} />
    </form>
    <iframe name={name} title={$t(title)} sandbox="allow-scripts allow-modals" onLoad={() => { if (submittedHtml.current !== null) setLoadedHtml(submittedHtml.current); }} className="w-full h-full border-0" />
    {loading && <div className="absolute inset-0 grid place-items-center bg-[var(--surface-color)] text-xs opacity-80" role="status"><UiText source={"Opening preview…"}/></div>}
  </div>;
}
