import { copyFile } from 'node:fs/promises';
await copyFile(new URL('../node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs', import.meta.url), new URL('../public/pdf.worker.min.mjs', import.meta.url));
