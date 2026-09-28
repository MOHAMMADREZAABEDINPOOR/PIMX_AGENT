'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '@/lib/store/useAppStore';
import type { SlideDeckEntity, SlideItem } from '@/lib/types';
import { SlideCanvas } from './SlideCanvas';
import { SlideInspector } from './SlideInspector';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Presentation, Download, PanelRightClose, ChevronLeft, ChevronRight, Plus, Trash2, Maximize2, Minimize2, Pencil, Copy, Check } from 'lucide-react';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export function SlidesPanel({ onClose }: { onClose: () => void }) {
  const $t=useT();
  const { activeChatId, slideDecks, saveSlideDeck } = useAppStore();
  const deck: SlideDeckEntity = (activeChatId && slideDecks[activeChatId]) || { id: 'empty', chatId: activeChatId || '', title: 'Presentation Slides', theme: 'MODERN_DARK', slides: [], updatedAt: 0 };
  const [index, setIndex] = useState(0), [fullscreen, setFullscreen] = useState(false), [editor, setEditor] = useState(false), [exportOpen, setExportOpen] = useState(false), [exporting, setExporting] = useState(false), [copied, setCopied] = useState(false), [error, setError] = useState('');
  const printDeck = useRef<HTMLDivElement>(null);
  const currentIndex = Math.min(index, Math.max(0, deck.slides.length - 1)); const slide = deck.slides[currentIndex];
  const save = (patch: Partial<SlideDeckEntity>) => { if (activeChatId) saveSlideDeck(activeChatId, { ...deck, ...patch }); };
  const changeSlide = (patch: Partial<SlideItem>) => save({ slides: deck.slides.map((item, i) => i === currentIndex ? { ...item, ...patch } : item) });
  const add = () => { save({ slides: [...deck.slides, { id: `s_${Date.now()}`, title: 'Your next idea', subtitle: 'Give this slide a focus', bullets: ['Add a clear key point here'], layout: deck.slides.length ? 'cards' : 'cover' }] }); setIndex(deck.slides.length); setEditor(true); };
  useEffect(() => {
    if (!fullscreen) return;
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') setFullscreen(false); if (event.key === 'ArrowRight') setIndex(i => Math.min(i + 1, deck.slides.length - 1)); if (event.key === 'ArrowLeft') setIndex(i => Math.max(i - 1, 0)); };
    document.addEventListener('keydown', key); return () => document.removeEventListener('keydown', key);
  }, [fullscreen, deck.slides.length]);
  const markdown = () => deck.slides.map((s, i) => `# ${i + 1}. ${s.title}\n\n${s.subtitle || ''}\n\n${s.bullets.map(b => `- ${b}`).join('\n')}${s.imageUrl ? `\n\n![${s.imageCaption || s.title}](${s.imageUrl})` : ''}${s.imageSourceUrl ? `\nPhoto source: ${s.imageSourceUrl}` : ''}\n\nSpeaker notes: ${s.speakerNotes || ''}`).join('\n\n---\n\n');
  const exportPptx = async () => { setExportOpen(false); setExporting(true); setError(''); try { const { exportDeckToPptx } = await import('@/lib/slides/pptxExport'); await exportDeckToPptx(deck); } catch (err) { setError(err instanceof Error ? err.message : 'PowerPoint export failed.'); } finally { setExporting(false); } };
  const exportMarkdown = () => { setExportOpen(false); const url = URL.createObjectURL(new Blob([markdown()], { type: 'text/markdown;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = `${deck.title.replace(/[^\w\u0600-\u06ff]+/g, '_')}.md`; a.click(); URL.revokeObjectURL(url); };
  const print = async () => {
    setExportOpen(false);
    if (!printDeck.current) return;
    await Promise.all([document.fonts.ready, ...Array.from(printDeck.current.querySelectorAll('img')).map(image => image.decode().catch(() => {}))]);
    if (printDeck.current) window.print();
  };
  const viewer = <div className={fullscreen ? 'fixed inset-0 z-[120] bg-[#050811] flex flex-col p-3 sm:p-6' : 'flex-1 min-h-0 overflow-y-auto flex flex-col'} role={fullscreen ? 'dialog' : undefined} aria-label={$t(fullscreen ? 'Presentation mode' : undefined)}>
    {fullscreen && <div className="flex justify-between items-center text-white text-xs mb-4"><span>{deck.title}</span><button aria-label={$t("Exit Fullscreen")} onClick={() => setFullscreen(false)} className="p-2"><Minimize2 size={18} /></button></div>}
    <div className={`flex-1 flex flex-col items-center p-3 sm:p-5 ${fullscreen ? 'overflow-y-auto' : ''}`}>
      {slide ? <div className={`w-full my-auto ${fullscreen ? 'max-w-5xl' : 'max-w-4xl'}`}><SlideCanvas key={slide.id} slide={slide} deck={deck} index={currentIndex} /></div> : <div className="my-auto text-center p-8 text-muted"><Presentation size={38} className="mx-auto text-accent mb-4" /><h3 className="text-lg font-semibold text-[var(--text-color)]"><UiText source={"A stage for your next idea"}/></h3><p className="text-xs leading-6 my-3"><UiText source={"Ask for a presentation in chat, or start with a slide."}/></p><button onClick={add} className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-xl text-xs"><UiText source={"Create First Slide"}/></button></div>}
    </div>
    {deck.slides.length > 0 && <div className="flex items-center justify-center gap-4 p-2 text-xs"><button aria-label={$t("Previous slide")} disabled={!currentIndex} onClick={() => setIndex(currentIndex - 1)} className="p-2 rounded-xl border border-[var(--border-color)] disabled:opacity-30"><ChevronLeft size={16} /></button><span className={fullscreen ? 'text-white' : 'text-muted'}>{currentIndex + 1} / {deck.slides.length}</span><button aria-label={$t("Next slide")} disabled={currentIndex === deck.slides.length - 1} onClick={() => setIndex(currentIndex + 1)} className="p-2 rounded-xl border border-[var(--border-color)] disabled:opacity-30"><ChevronRight size={16} /></button></div>}
    {!fullscreen && editor && slide && <SlideInspector key={slide.id} slide={slide} onChange={changeSlide} />}
  </div>;
  return <div id="slides-panel" className="h-full min-h-0 flex flex-col bg-[var(--surface-color)] text-[var(--text-color)]">
    <header className="p-3 flex items-center gap-2 border-b border-[var(--border-color)] shrink-0"><Presentation size={16} className="text-accent shrink-0" /><input aria-label={$t("Presentation title")} dir="auto" value={deck.title} onChange={e => save({ title: e.target.value })} className="bg-transparent min-w-0 flex-1 text-xs font-semibold focus:outline-none" /><button title={$t("Present Fullscreen")} disabled={!slide} onClick={() => setFullscreen(true)} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30"><Maximize2 size={14} /></button><div className="relative"><button title={$t("Export Presentation (PPTX, PDF, Markdown)")} disabled={!slide || exporting} onClick={() => setExportOpen(!exportOpen)} className="flex items-center gap-1.5 text-[11px] font-semibold px-2 py-2 rounded-lg bg-black/5 dark:bg-white/10 disabled:opacity-40"><Download size={13} />{exporting ? <UiText source={"Exporting..."}/> : <UiText source={"Export"}/>}</button>{exportOpen && <div className="absolute end-0 top-full mt-2 w-52 z-50 rounded-xl border border-[var(--border-color)] p-1 bg-[var(--surface-color)] shadow-xl text-xs"><button className="w-full p-3 text-start rounded-lg hover:bg-black/5 dark:hover:bg-white/10" onClick={() => void exportPptx()}><UiText source={"PowerPoint (.pptx)"}/></button><button className="w-full p-3 text-start rounded-lg hover:bg-black/5 dark:hover:bg-white/10" onClick={print}><UiText source={"Print / Save PDF (.pdf)"}/></button><button className="w-full p-3 text-start rounded-lg hover:bg-black/5 dark:hover:bg-white/10" onClick={exportMarkdown}><UiText source={"Markdown (.md)"}/></button><button className="w-full p-3 text-start rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex gap-2" onClick={() => { void navigator.clipboard.writeText(markdown()); setCopied(true); }}>{copied ? <Check size={12} /> : <Copy size={12} />}<UiText source={"Copy Markdown Text"}/></button></div>}</div><button title={$t("Minimize Panel")} onClick={onClose} className="p-2 text-[var(--accent-color)]"><PanelRightClose size={14} /></button></header>
    {slide && <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-[var(--border-color)] shrink-0"><div className="flex-1 min-w-28"><CustomSelect ariaLabel="Deck theme" value={deck.theme} onChange={theme => save({ theme: theme as SlideDeckEntity['theme'] })} options={[{ value: 'MODERN_DARK', label: 'Midnight studio' }, { value: 'CLEAN_LIGHT', label: 'Clean editorial' }, { value: 'CYBERPUNK', label: 'Electric cyan' }, { value: 'MINIMAL_PURPLE', label: 'Soft purple' }]} /></div><div className="flex-1 min-w-24"><CustomSelect ariaLabel="Slide layout" value={slide.layout || 'split'} onChange={layout => changeSlide({ layout: layout as SlideItem['layout'] })} options={['cover', 'split', 'cards', 'statement', 'content', 'closing'].map(value => ({ value, label: value[0].toUpperCase() + value.slice(1) }))} /></div><button aria-label={$t("Edit slide")} aria-expanded={editor} onClick={() => setEditor(!editor)} className={`p-2 rounded-lg ${editor ? 'bg-accent/15 text-accent' : 'text-muted'}`}><Pencil size={14} /></button></div>}
    {error && <p role="alert" className="px-4 py-2 text-xs text-red-500">{error}</p>}
    {!fullscreen && viewer}
    {fullscreen && createPortal(viewer, document.body)}
    {deck.slides.length > 0 && <div aria-label={$t("Slide thumbnails")} className="flex gap-2 p-3 overflow-x-auto border-t border-[var(--border-color)] shrink-0">{deck.slides.map((item, i) => <button key={item.id} aria-label={$t("Go to slide {0}",i + 1)} aria-current={i === currentIndex ? 'true' : undefined} onClick={() => setIndex(i)} className={`shrink-0 rounded-xl border-2 p-1 ${i === currentIndex ? 'border-[var(--accent-color)]' : 'border-transparent'}`}><SlideCanvas thumbnail slide={item} deck={deck} index={i} /><span className="block text-[9px] text-muted mt-1 max-w-40 truncate">{i + 1}. {item.title}</span></button>)}</div>}
    <footer className="flex justify-between items-center p-2.5 border-t border-[var(--border-color)] shrink-0"><span className="text-[9px] text-muted">{deck.slides.length}  <UiText source={"slides - saved automatically"}/></span><div className="flex gap-2"><button onClick={add} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-lg bg-[var(--accent-color)] text-white"><Plus size={12} /><UiText source={"Add Slide"}/></button>{slide && <button title={$t("Delete Slide")} onClick={() => { save({ slides: deck.slides.filter((_, i) => i !== currentIndex) }); setIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 text-red-500"><Trash2 size={14} /></button>}</div></footer>
    {deck.slides.length > 0 && createPortal(<div id="pimx-slide-print-view" ref={printDeck} aria-hidden="true">{deck.slides.map((item, i) => <SlideCanvas print key={item.id} slide={item} deck={deck} index={i} />)}</div>, document.body)}
  </div>;
}
