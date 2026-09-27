'use client';

/* eslint-disable @next/next/no-img-element -- Uploaded and independently chosen images are user-controlled. */

import type { SlideDeckEntity, SlideItem } from '@/lib/types';
import { slideAccent, slidePalette } from '@/lib/slides/themes';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export function SlideCanvas({ slide, deck, index, thumbnail = false, print = false }: { slide: SlideItem; deck: SlideDeckEntity; index: number; thumbnail?: boolean; print?: boolean }) {
  const $t=useT();
  const palette = slidePalette(deck.theme); const accent = slideAccent(slide.accentColor, deck.theme);
  const fa = /[\u0600-\u06FF]/.test(slide.title + slide.bullets.join(' '));
  const layout = slide.layout || (index === 0 ? 'cover' : 'split');
  return <article aria-hidden={thumbnail || undefined} data-testid={thumbnail || print ? undefined : 'slide-preview'} data-layout={layout} className={`slide-canvas layout-${layout} ${thumbnail ? 'is-thumbnail' : ''} ${slide.imageUrl ? 'has-photo' : ''}`} dir={fa ? 'rtl' : 'ltr'} style={{ background: palette.background, color: palette.text, '--slide-accent': accent, '--slide-muted': palette.muted } as React.CSSProperties}>
    <div className="slide-decor" aria-hidden="true"><i /><i /><i /></div>
    <header className="slide-kicker"><span><i />{deck.title}</span><span dir="ltr">{String(index + 1).padStart(2, '0')} / {String(deck.slides.length).padStart(2, '0')}</span></header>
    <div className="slide-body"><section className="slide-copy"><h2>{slide.title}</h2>{slide.subtitle && <p className="slide-subtitle">{<UiText source={slide.subtitle}/>}</p>}<div className="slide-points">{slide.bullets.map((point, i) => <div className="slide-point" key={i}><span className="slide-point-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><p>{point}</p></div>)}</div>{slide.codeSnippet && <pre dir="ltr"><code>{slide.codeSnippet}</code></pre>}</section>
    {slide.imageUrl && <figure className="slide-photo"><img src={slide.imageUrl} alt={$t(slide.imageCaption || slide.title)} loading={thumbnail ? 'lazy' : 'eager'} onError={e => { e.currentTarget.style.visibility = 'hidden'; }} />{!thumbnail && slide.imageSourceUrl && <a href={slide.imageSourceUrl} target="_blank" rel="noopener noreferrer" className="slide-credit">{slide.imageCaption || 'Photo source'} ↗</a>}</figure>}
    </div><footer className="slide-footer"><span>{layout === 'closing' ? (fa ? 'قدم بعدی، از اینجا شروع می‌شود.' : 'The next chapter starts here.') : <UiText source={"PIMX / STUDIO"}/>}</span><span className="slide-footer-rule" /></footer>
  </article>;
}
