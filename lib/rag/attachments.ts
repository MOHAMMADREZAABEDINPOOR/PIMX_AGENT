import type { Attachment } from '../types';
import { compressImage } from '../client/images';

export async function readAttachment(file: File): Promise<Attachment> {
  if (file.size > 20 * 1024 * 1024) throw new Error(`${file.name}: maximum file size is 20 MB.`);
  const image = file.type.startsWith('image/');
  const pdf = /\.pdf$/i.test(file.name);
  const docx = /\.docx$/i.test(file.name);
  const base: Attachment = { id: crypto.randomUUID(), name: file.name, kind: image ? 'IMAGE' : pdf ? 'PDF' : docx ? 'DOCUMENT' : 'TEXT', size: file.size, mimeType: file.type || 'text/plain' };
  if (image) {
    base.base64Data = await compressImage(file);
    base.mimeType = 'image/webp';
  } else if (pdf) {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), useSystemFonts: true });
    const document = await task.promise;
    const pages: string[] = [];
    try {
      if(document.numPages>200)throw new Error('PDF files are limited to 200 pages.');
      for (let page = 1; page <= document.numPages; page++) {
        const content = await (await document.getPage(page)).getTextContent();
        pages.push(`[Page ${page}]\n` + content.items.map(item => 'str' in item ? item.str : '').join(' '));
      }
    } finally { await task.destroy(); }
    base.extractedText = pages.join('\n\n');
    if (!base.extractedText.replace(/\[Page \d+\]/g, '').trim()) throw new Error(`${file.name}: this PDF has no selectable text. Upload a text-based PDF or paste its OCR text.`);
  } else if (docx) {
    const buffer=await file.arrayBuffer(),zip=await (await import('jszip')).default.loadAsync(buffer);
    let expanded=0;
    const entries=Object.values(zip.files);
    if(entries.length>2000 || !zip.file('word/document.xml'))throw new Error('This is not a supported DOCX document.');
    for(const entry of entries){expanded+=Number((entry as unknown as {_data?:{uncompressedSize:number}})._data?.uncompressedSize || 0);if(expanded>40*1024*1024)throw new Error('The expanded document is too large.');}
    const mammoth = await import('mammoth');
    base.extractedText = (await mammoth.extractRawText({ arrayBuffer: buffer })).value;
  } else {
    if(!/\.(txt|md|csv|json|html|css|js|ts|tsx|jsx|py|xml|yaml|yml|log)$/i.test(file.name) || file.size>1024*1024)throw new Error('Upload text or code files up to 1 MB, PDF, DOCX, PNG, JPEG or WebP.');
    base.extractedText = await file.text();
    if (base.extractedText.includes('\u0000')) throw new Error(`${file.name}: this binary file cannot be read as text. Use PDF, DOCX, images, or text files.`);
  }
  if(base.extractedText && base.extractedText.length>500000)throw new Error('The extracted text is too long. Split this document into smaller files.');
  return base;
}
