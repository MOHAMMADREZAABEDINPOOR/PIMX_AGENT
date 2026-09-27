import catalog from './catalog.json';
export type Locale = 'en' | 'fa';
const entries = catalog as Record<string, string[]>;
export function translate(source: string, locale: Locale, ...values: (string | number | undefined)[]) {
  const normalized=source.replace(/\s+/g,' ').trim();
  const match=entries[normalized]?.[locale === 'fa' ? 1 : 0];
  const text=match===undefined?source:(/^\s/.test(source)?' ':'')+match+(/\s$/.test(source)?' ':'');
  return values.length ? text.replace(/\{(\d+)\}/g, (_match, index) => String(values[Number(index)] ?? '')) : text;
}
export function localizedHref(path: string, locale: Locale) {
  if (!path.startsWith('/') || path.startsWith('/api/') || path.startsWith('/fa/')) return path;
  return locale === 'fa' ? '/fa' + path : path;
}
