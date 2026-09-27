import type { AppSettings, ChatTool, WebFileEntity } from '../types';

/** Only creation requests are routed; questions about a website stay in chat. */
export function detectCreationTool(prompt: string): ChatTool | null {
  if (/\b(?:don'?t|do not)\s+(?:build|create|make)|(?:نساز|نویس نکن)/i.test(prompt)) return null;
  const action = /\b(build|create|make|generate|design|write)\b|بساز|بنویس|طراحی کن|درست کن|آماده کن/i.test(prompt);
  if (!action) return null;
  if (/\b(slides?|presentation|slide deck|powerpoint)\b|اسلاید|پاورپوینت|پرزنتیشن|ارائه/i.test(prompt)) return 'SLIDES';
  if (/\b(website|web app|landing page|webpage|html page)\b|سایت|وب‌?سایت|وب اپ|صفحه وب|لندینگ/i.test(prompt)) return 'WEB_DEV';
  return null;
}

export function responsePreferences(settings: AppSettings): string {
  return [
    settings.responseLanguage !== 'AUTO' ? `Answer in ${settings.responseLanguage === 'FA' ? 'Persian' : 'English'}, unless the user explicitly requests another language.` : '',
    settings.responseStyle !== 'BALANCED' ? `Response length: ${settings.responseStyle?.toLowerCase()}.` : '',
    settings.responseTone !== 'NATURAL' ? `Writing tone: ${settings.responseTone?.toLowerCase()}.` : '',
    settings.includeExamples ? 'Include a concrete worked example when useful.' : '',
    settings.userProfileBio ? `User background: ${settings.userProfileBio}` : '',
    settings.userResponsePreferences ? `User response preferences: ${settings.userResponsePreferences}` : '',
    `When generating a slide deck, use ${settings.defaultSlideCount ?? 7} slides unless the user specifies a count. Theme: ${settings.defaultSlideTheme ?? 'MODERN_DARK'}. Include speakerNotes for each slide.`,
  ].filter(Boolean).join('\n');
}

/** Inline local assets by their referenced path rather than injecting only the first file. */
export function compileWebPreview(files: Pick<WebFileEntity, 'path' | 'content'>[]): string {
  const entry = files.find(f => f.path === 'index.html') || files.find(f => /\.html$/i.test(f.path));
  if (!entry) return '<!doctype html><html><body><p>This project has no HTML entry point. Download the project to run its build.</p></body></html>';
  const base = entry.path.split('/').slice(0, -1);
  const resolve = (path: string) => {
    if (/^(?:https?:|data:|\/\/)/i.test(path)) return undefined;
    const segments = path.startsWith('/') ? [] : [...base];
    for (const segment of path.split(/[?#]/)[0].split('/')) {
      if (segment === '..') segments.pop();
      else if (segment && segment !== '.') segments.push(segment);
    }
    return files.find(f => f.path.replace(/^\.\//, '') === segments.join('/'));
  };
  return entry.content
    .replace(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/gi, (tag, path) => {
      const file = resolve(path);
      return file && /\.css$/i.test(file.path) ? `<style>${file.content.replace(/<\/style/gi, '<\\/style')}</style>` : tag;
    })
    .replace(/<script\b([^>]*?)src=["']([^"']+)["']([^>]*)>\s*<\/script>/gi, (tag, before, path, after) => {
      const file = resolve(path);
      return file && /\.js$/i.test(file.path) ? `<script${before}${after}>${file.content.replace(/<\/script/gi, '<\\/script')}</script>` : tag;
    });
}
