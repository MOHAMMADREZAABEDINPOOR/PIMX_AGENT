import { SlideDeckEntity, SlideItem } from '../types';

export function parseSlideDeckFromContent(content: string, chatId: string): SlideDeckEntity | null {
  if (!content || typeof content !== 'string') return null;

  // 1. Try structured code block ```slides ... ``` or ```json:slides ... ```
  const jsonMatch = /```(?:slides|slide-deck|json:slides)\s*([\s\S]*?)```/i.exec(content);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1].trim());
      const slides = Array.isArray(parsed) ? parsed : parsed?.slides;
      if (Array.isArray(slides) && slides.length > 0 && slides.every(s => typeof s?.title === 'string' && Array.isArray(s?.bullets))) {
        return {
          id: `deck_${chatId}`,
          chatId,
          title: parsed.title || slides[0]?.title || 'Presentation Slides',
          theme: 'MODERN_DARK',
          slides: slides.map((s, idx) => ({
            id: `s_${chatId}_${idx}`,
            title: s.title || `Slide ${idx + 1}`,
            subtitle: s.subtitle || undefined,
            bullets: Array.isArray(s.bullets)
              ? s.bullets.map(String)
              : typeof s.bullets === 'string'
              ? [s.bullets]
              : [],
            codeSnippet: s.codeSnippet || undefined,
            speakerNotes: typeof s.speakerNotes === 'string' ? s.speakerNotes : undefined,
            accentColor: s.accentColor || '#8B5CF6',
            imageUrl: typeof s.imageUrl === 'string' ? s.imageUrl : undefined,
            imageQuery: typeof s.imageQuery === 'string' ? s.imageQuery.slice(0, 80) : undefined,
            icon: typeof s.icon === 'string' ? s.icon.toLowerCase().slice(0, 24) : undefined,
            layout: ['cover', 'content', 'split', 'cards', 'statement', 'closing'].includes(s.layout) ? s.layout : idx === 0 ? 'cover' : idx === slides.length - 1 ? 'closing' : idx % 2 ? 'split' : 'cards',
          })),
          updatedAt: Date.now(),
        };
      }
    } catch {}
  }

  // 2. Parse natural slide headers in Persian, English, etc.
  // Patterns: "اسلاید ۱:", "اسلاید 1 -", "Slide 1:", "### Slide 1", "# اسلاید ۲", etc.
  const slideHeaderRegex = /(?:^|\n)(?:#{1,4}\s*)?(?:اسلاید|Slide)\s*([۰-۹0-9]+)\s*[:\-—\s*]([^\n]*)/gi;
  const matches: { index: number; slideNum: string; headerRest: string }[] = [];
  let m: RegExpExecArray | null;

  while ((m = slideHeaderRegex.exec(content)) !== null) {
    matches.push({
      index: m.index,
      slideNum: m[1],
      headerRest: (m[2] || '').trim(),
    });
  }

  if (matches.length >= 2 || (matches.length === 1 && content.length > 80)) {
    const slides: SlideItem[] = [];

    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const next = matches[i + 1];
      const chunk = content.slice(current.index, next ? next.index : undefined);

      const lines = chunk
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      // Extract slide title: from headerRest, or next non-empty line
      let title = current.headerRest.replace(/^[*_#`\s]+|[*_#`\s]+$/g, '');
      let lineIndex = 1;

      if (!title && lines.length > 1) {
        title = lines[1].replace(/^[*_#`\s]+|[*_#`\s]+$/g, '');
        lineIndex = 2;
      }

      if (!title) {
        title = `Slide ${current.slideNum}`;
      }

      let subtitle: string | undefined;
      const bullets: string[] = [];
      let codeSnippet: string | undefined;

      // Check for code snippet inside this chunk
      const codeMatch = /```(?:\w+)?\n([\s\S]*?)```/.exec(chunk);
      if (codeMatch) {
        codeSnippet = codeMatch[1].trim();
      }

      for (let j = lineIndex; j < lines.length; j++) {
        const line = lines[j];
        if (line.startsWith('```')) continue;

        // Clean markdown bold or bullet prefixes: -, *, •, 1., etc.
        const cleanBullet = line
          .replace(/^[-*•]\s+/, '')
          .replace(/^\d+[\.\)]\s+/, '')
          .replace(/^[*_]{2}(.*?)[*_]{2}$/, '$1')
          .trim();

        if (!cleanBullet) continue;

        // If first descriptive line is short and no subtitle yet, consider as subtitle
        if (
          !subtitle &&
          cleanBullet.length < 60 &&
          !line.startsWith('-') &&
          !line.startsWith('*') &&
          !line.startsWith('•') &&
          bullets.length === 0
        ) {
          subtitle = cleanBullet;
        } else {
          bullets.push(cleanBullet);
        }
      }

      // If no bullets were found, use subtitle or first bullet
      if (bullets.length === 0 && subtitle) {
        bullets.push(subtitle);
        subtitle = undefined;
      }

      slides.push({
        id: `s_${Date.now()}_${i}`,
        title,
        subtitle,
        bullets: bullets.slice(0, 8),
        codeSnippet,
        accentColor: '#8B5CF6',
        imageQuery: `${title} ${subtitle || ''}`.trim().slice(0, 80) || undefined,
        layout: i === 0 ? 'cover' : 'content',
      });
    }

    if (slides.length > 0) {
      // Find overall presentation title from top lines before slide 1
      const preText = content.slice(0, matches[0].index).trim();
      const firstLine = preText.split('\n')[0]?.replace(/^[*_#`\s]+|[*_#`\s]+$/g, '');
      const deckTitle =
        firstLine && firstLine.length < 90 && !firstLine.toLowerCase().includes('http')
          ? firstLine
          : slides[0]?.title || 'Presentation Slides';

      return {
        id: `deck_${chatId}`,
        chatId,
        title: deckTitle,
        theme: 'MODERN_DARK',
        slides,
        updatedAt: Date.now(),
      };
    }
  }

  return null;
}
