import PptxGenJS from 'pptxgenjs';
import type { SlideDeckEntity } from '../types';
import { slideAccent, slidePalette } from './themes';

async function photoData(url: string): Promise<string> {
  let blob:Blob;
  if(url.startsWith('data:')){const match=url.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+=*)$/);if(!match || match[2].length>14_000_000)throw new Error('Use a valid PNG, JPEG or WebP photo.');blob=new Blob([Uint8Array.from(atob(match[2]),char=>char.charCodeAt(0))],{type:match[1]});}
  else{const response=await fetch('/api/image/file?url='+encodeURIComponent(url),{signal:AbortSignal.timeout(20000)});if(!response.ok)throw new Error('A slide photo could not be downloaded. Replace or remove it, then export again.');blob=await response.blob();}
  if (!blob.type.startsWith('image/')) throw new Error('The slide photo URL did not return an image.');
  // Canvas standardizes approved raster photos into PowerPoint-compatible PNG.
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas'); canvas.width = 1000; canvas.height = Math.round(1000 * 5.3 / 4.63);
  const ratio = canvas.width / canvas.height; const cropW = Math.min(bitmap.width, bitmap.height * ratio), cropH = cropW / ratio; canvas.getContext('2d')!.drawImage(bitmap, (bitmap.width - cropW) / 2, (bitmap.height - cropH) / 2, cropW, cropH, 0, 0, canvas.width, canvas.height); bitmap.close();
  return canvas.toDataURL('image/png');
}
export async function exportDeckToPptx(deck: SlideDeckEntity): Promise<void> {
  if (!deck.slides.length) throw new Error('Add a slide before exporting.');
  const pptx = new PptxGenJS(); pptx.layout = 'LAYOUT_WIDE'; pptx.title = deck.title; pptx.subject = deck.title; pptx.author = 'PIMX'; pptx.company = 'PIMX Studio';
  const palette = slidePalette(deck.theme); const images = await Promise.all(deck.slides.map(slide => slide.imageUrl ? photoData(slide.imageUrl) : Promise.resolve(undefined)));
  const height = 7.5;
  deck.slides.forEach((item, index) => {
    const slide = pptx.addSlide(); slide.background = { color: palette.background.slice(1) };
    const accent = slideAccent(item.accentColor, deck.theme).slice(1);
    const fa = /[\u0600-\u06FF]/.test(item.title + item.bullets.join(' '));
    const textStyle = { color: palette.text.slice(1), fontFace: fa ? 'Vazirmatn' : 'Aptos', rtlMode: fa, lang: fa ? 'fa-IR' : 'en-US', align: fa ? 'right' as const : 'left' as const, margin: 0, breakLine: false };
    const image = images[index]; const layout = item.layout || (index ? 'split' : 'cover'); const hasPhoto = !!image;
    const copyX = fa && hasPhoto ? 6.0 : 0.7, copyW = hasPhoto ? 6.5 : 11.9;
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: .065, h: height, line: { transparency: 100 }, fill: { color: accent } });
    slide.addText(deck.title.toUpperCase(), { ...textStyle, x: .7, y: .35, w: 10.6, h: .25, fontSize: 10, color: palette.muted.slice(1), charSpacing: 1.5 });
    slide.addText(`${String(index + 1).padStart(2, '0')} / ${String(deck.slides.length).padStart(2, '0')}`, { x: 11.6, y: .35, w: 1, h: .25, fontSize: 10, color: palette.muted.slice(1), align: 'right', margin: 0 });
    const titleY = layout === 'statement' ? 1.7 : 1.05;
    slide.addText(item.title, { ...textStyle, x: copyX, y: titleY, w: copyW, h: 1.35, fontSize: hasPhoto ? 30 : layout === 'cover' || layout === 'closing' ? 42 : 35, bold: true, color: layout === 'statement' ? accent : textStyle.color, fit: 'shrink', valign: 'middle' });
    if (item.subtitle) slide.addText(item.subtitle, { ...textStyle, x: copyX, y: titleY + 1.4, w: copyW, h: .55, fontSize: 16, color: palette.muted.slice(1), fit: 'shrink' });
    const bodyY = titleY + 2.12, available = 6.7 - bodyY;
    if (layout === 'cards') {
      const gap = .2, rows = Math.ceil(item.bullets.length / 2), cardH = Math.min(1.5, (available - Math.max(0, rows - 1) * gap) / Math.max(1, rows)), cardW = (copyW - gap) / 2;
      item.bullets.forEach((point, i) => { const x = copyX + (fa ? 1 - i % 2 : i % 2) * (cardW + gap), y = bodyY + Math.floor(i / 2) * (cardH + gap); slide.addShape(pptx.ShapeType.roundRect, { x, y, w: cardW, h: cardH, line: { color: accent, transparency: 65, width: .8 }, fill: { color: accent, transparency: 94 } }); slide.addText(`${String(i + 1).padStart(2, '0')}  ${point}`, { ...textStyle, x: x + .2, y: y + .15, w: cardW - .4, h: cardH - .3, fontSize: hasPhoto ? 16 : 18, fit: 'shrink', valign: 'middle' }); });
    } else {
      const rows = Math.max(1, item.bullets.length), pointH = Math.min(.8, available / rows);
      item.bullets.forEach((point, i) => slide.addText(`${layout === 'statement' ? '' : String(i + 1).padStart(2, '0') + '  '}${point}`, { ...textStyle, x: copyX, y: bodyY + i * pointH, w: copyW, h: pointH - .06, fontSize: hasPhoto ? 17 : 21, fit: 'shrink', valign: 'middle' }));
    }
    if (hasPhoto) {
      const x = fa ? .7 : 8, y = 1.05, w = 4.63, h = 5.3;
      slide.addImage({ data: image, x, y, w, h, altText: item.imageCaption || item.title });
      if (item.imageSourceUrl) slide.addText(item.imageCaption || 'Photo source', { x, y: 6.45, w, h: .2, fontSize: 8, color: palette.muted.slice(1), hyperlink: { url: item.imageSourceUrl }, margin: 0, align: fa ? 'right' : 'left' });
    }
    slide.addText('PIMX / STUDIO', { ...textStyle, x: .7, y: 7.08, w: 2, h: .2, fontSize: 8, color: palette.muted.slice(1), charSpacing: 2 });
    slide.addShape(pptx.ShapeType.line, { x: 3, y: 7.18, w: 9.6, h: 0, line: { color: accent, transparency: 65, width: .7 } });
    if (item.speakerNotes || item.imageSourceUrl || item.codeSnippet) slide.addNotes([item.speakerNotes, item.codeSnippet, item.imageSourceUrl ? `Photo: ${item.imageCaption || ''}\nSource: ${item.imageSourceUrl}` : ''].filter(Boolean).join('\n\n'));
  });
  await pptx.writeFile({ fileName: `${(deck.title || 'presentation').replace(/[^a-zA-Z0-9\u0600-\u06FF]+/g, '_').slice(0, 70)}.pptx`, compression: true });
}
