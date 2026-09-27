'use client';

/* eslint-disable @next/next/no-img-element -- Uploaded and independently chosen images are user-controlled. */

import { useState } from 'react';
import { Search, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import type { SlideItem } from '@/lib/types';
import { compressImage } from '@/lib/client/images';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

interface Candidate { imageUrl: string; title?: string; imageSourceUrl?: string; }
export function SlideInspector({ slide, onChange }: { slide: SlideItem; onChange: (patch: Partial<SlideItem>) => void }) {
  const $t=useT();
  const [query, setQuery] = useState(slide.imageQuery || slide.title); const [results, setResults] = useState<Candidate[]>([]); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const search = async () => {
    setBusy(true); setError('');
    try { const response = await fetch(`/api/image?q=${encodeURIComponent(query)}`); if (!response.ok) throw new Error(); const json = await response.json(); const found = json.candidates || (json.imageUrl ? [json] : []); setResults(found); if (!found.length) setError('No matching photos. Try a specific topic or upload your own.'); }
    catch { setError('Photo search is unavailable. Try again or upload a photo.'); } finally { setBusy(false); }
  };
  const upload = async (file?: File) => {
    if (!file) return; if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { setError('Choose a JPG, PNG or WebP under 5 MB.'); return; }
    try{onChange({ imageUrl: await compressImage(file), imageDisabled: false, imageSourceUrl: undefined, imageCaption: file.name });setError('');}catch(error){setError(error instanceof Error?error.message:'Could not process this photo.');}
  };
  return <section aria-label={$t("Slide editor")} className="slide-inspector space-y-3 p-4 border-t border-[var(--border-color)]">
    <div className="grid sm:grid-cols-2 gap-3"><label className="text-[11px] space-y-1.5"><UiText source={"Title"}/><input aria-label={$t("Slide title")} dir="auto" value={slide.title} onChange={e => onChange({ title: e.target.value })} /></label><label className="text-[11px] space-y-1.5"><UiText source={"Subtitle"}/><input aria-label={$t("Slide subtitle")} dir="auto" value={slide.subtitle || ''} onChange={e => onChange({ subtitle: e.target.value })} /></label></div>
    <label className="block text-[11px] space-y-1.5"><UiText source={"Key points · one per line"}/><textarea aria-label={$t("Slide points")} dir="auto" rows={3} value={slide.bullets.join('\n')} onChange={e => onChange({ bullets: e.target.value.split('\n') })} /></label>
    <label className="block text-[11px] space-y-1.5"><UiText source={"Speaker notes"}/><textarea aria-label={$t("Speaker notes")} dir="auto" rows={3} value={slide.speakerNotes || ''} onChange={e => onChange({ speakerNotes: e.target.value })} /></label>
    <div className="flex items-center gap-2 text-xs font-semibold"><ImageIcon size={14} /><UiText source={"Photo direction"}/></div><form onSubmit={e => { e.preventDefault(); void search(); }} className="flex gap-2"><input aria-label={$t("Search slide photos")} value={query} onChange={e => setQuery(e.target.value)} placeholder={$t("Specific subject, e.g. solar panels")} /><button type="submit" aria-label={$t("Search photos")} disabled={busy || !query.trim()} className="p-2 rounded-xl bg-[var(--accent-color)] text-white disabled:opacity-40">{busy ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}</button></form>
    {error && <p role="status" className="text-[11px] text-muted">{error}</p>}
    {results.length > 0 && <div className="grid grid-cols-3 gap-2">{results.map(result => <button key={result.imageUrl} aria-label={$t("Use photo: {0}",result.title || 'Image')} onClick={() => onChange({ imageUrl: result.imageUrl, imageSourceUrl: result.imageSourceUrl, imageCaption: result.title, imageQuery: query, imageDisabled: false })} className="relative rounded-xl overflow-hidden border border-[var(--border-color)] hover:ring-2 hover:ring-[var(--accent-color)] text-left"><img src={result.imageUrl} alt={$t(result.title || 'Photo candidate')} className="w-full h-20 object-cover" /><span className="block text-[9px] p-1 truncate">{result.title}</span></button>)}</div>}
    <div className="flex flex-wrap gap-2 text-[11px]"><label className="flex items-center gap-1.5 border border-[var(--border-color)] rounded-xl px-3 py-2 cursor-pointer"><Upload size={12} /><UiText source={"Upload photo"}/><input type="file" aria-label={$t("Upload slide photo")} accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={e => void upload(e.target.files?.[0])} /></label>{slide.imageUrl && <button onClick={() => onChange({ imageUrl: undefined, imageSourceUrl: undefined, imageCaption: undefined, imageDisabled: true })} className="flex items-center gap-1.5 border border-[var(--border-color)] rounded-xl px-3 py-2"><X size={12} /><UiText source={"Remove photo"}/></button>}</div>
  </section>;
}
