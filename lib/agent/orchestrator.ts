import type { ChatTool, SlideItem } from '../types';

/**
 * Attach ranked topical images from Wikipedia. Keep source links and distinct photos.
 * Runs fully parallel and never throws.
 */
export async function enrichDeckWithImages(
  slides: SlideItem[],
  _deckSeed: string,
  signal?: AbortSignal
): Promise<SlideItem[] | null> {
  const targets = slides
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => !s.imageUrl && !s.imageDisabled && s.layout !== 'cards' && s.layout !== 'statement')
    .sort((a, b) => a.i - b.i);
  if (targets.length === 0) return null;

  const resolved = await Promise.allSettled(
    targets.map(async ({ s }) => {
      const q = s.imageQuery || s.title;
      try {
        const res = await fetch(`/api/image?q=${encodeURIComponent(q.slice(0, 80))}`, { signal });
        if (res.ok) {
          const json = await res.json();
          if (typeof json.imageUrl === 'string' && json.imageUrl) return { imageUrl: json.imageUrl as string, imageSourceUrl: json.imageSourceUrl as string | undefined, imageCaption: json.title as string | undefined, candidates: json.candidates as Array<{ imageUrl: string; imageSourceUrl?: string; title?: string }> | undefined };
        }
      } catch {
        // Keep the slide's visual design when no topical image is available.
      }
      return undefined;
    })
  );

  let changed = false;
  const used = new Set(slides.map(s => s.imageUrl).filter(Boolean));
  const next = slides.map((s) => ({ ...s }));
  targets.forEach(({ i }, k) => {
    const r = resolved[k];
    if (r.status === 'fulfilled' && r.value) {
      const selected = [r.value, ...(r.value.candidates || []).map(c => ({ ...c, imageCaption: c.title }))].find(c => !used.has(c.imageUrl));
      if (selected) { next[i].imageUrl = selected.imageUrl; next[i].imageSourceUrl = selected.imageSourceUrl; next[i].imageCaption = selected.imageCaption; used.add(selected.imageUrl); changed = true; }
    }
  });
  return changed ? next : null;
}

/**
 * Unified agentic orchestrator — turns a single user prompt into a
 * visible multi-step run: PLAN → SEARCH (parallel free queries) →
 * READ (open top sources) → SYNTHESIZE (single streaming LLM call).
 *
 * Runs client-side so it works with every BYOK provider. Intermediate
 * steps are reported through `onStep` and stored as message `toolSteps`;
 * only the final synthesis streams into the chat bubble.
 */

export type AgentDepth = 'QUICK' | 'DEEP';

export interface AgentSource {
  title: string;
  url: string;
  snippet: string;
  source: string;
  excerpt?: string;
}

export interface AgentStepUpdate {
  id: string;
  toolName: 'agent_plan' | 'web_search' | 'agent_read' | 'agent_synthesize';
  input: Record<string, any>;
  output?: string;
  status: 'CALLING' | 'DONE' | 'FAILED';
}

export type OnAgentStep = (step: AgentStepUpdate) => void;

export interface EvidenceResult {
  queries: string[];
  sources: AgentSource[];
  evidenceContext: string;
  degraded: boolean;
  ms: number;
}

/** Modes that benefit from live web evidence before synthesis. */
export const EVIDENCE_MODES: ChatTool[] = [
  'WEB_SEARCH',
  'DEEP_RESEARCH',
  'SOURCE_QA',
  'SLIDES',
  'WEB_DEV',
  'LEARN',
  'DEBATE',
];

/** Shared 100-emoji picker and AI reaction vocabulary. */
export const AI_REACTION_SET = [
  '❤️', '🔥', '👍', '😂', '😮',
  '🙏', '👏', '🎉', '🤔', '💡',
  '⭐', '😍', '😢', '👎', '💯',
  '🚀', '👌', '🤝', '🫡', '😎',
  '✨', '👋', '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😊',
  '🙂', '🙃', '😉', '😇', '🥰', '😘', '😋', '😛', '🤪', '🤗',
  '🤭', '🫢', '🫣', '🤫', '🧐', '🤓', '🥳', '🤩', '😏', '😌',
  '😔', '🥺', '😭', '😤', '😡', '🤯', '😳', '🥵', '🥶', '😱',
  '😴', '🤤', '🤐', '😵', '🤖', '👽', '👻', '💀', '💩', '🙈',
  '💜', '💙', '💚', '💛', '🧡', '🩷', '🤍', '🖤', '💔', '❤️‍🔥',
  '💪', '✌️', '🤞', '🤟', '🤌', '🤷', '🧠', '👀', '🎯', '🏆',
  '🥇', '🎨', '🎵', '🌈', '🌟', '⚡', '🌹', '🍀', '☕', '🎁',
];

/** Heuristic fallback when the model-based reaction call fails. */
export function heuristicReaction(query: string): string {
  const q = query || '';
  if (/[؟?]/.test(q)) return '🤔';
  if (/تبریک|ممنون|مرسی|thanks|thank you|عالی|دمت/.test(q)) return '🎉';
  if (/سلام|درود|^hi\b|hello/i.test(q.trim())) return '👋';
  if (/سایت|وب|کد|app|code|website|اپلیکیشن/.test(q)) return '🔥';
  if (/اسلاید|ارائه|slide|present/.test(q)) return '✨';
  return '✨';
}

export function isPersianText(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text || '');
}

/** Thinking seed shown while the model reasons — cleared automatically if the run errors. */
export const THINK_SEED_FA = 'در حال تحلیل عمیق مسئله، بررسی فرض‌ها و طراحی مسیر پاسخ…';
export const THINK_SEED_EN = 'Thinking deeply: analyzing assumptions and planning the answer…';

/**
 * The seed above is a live placeholder shown while a run is in flight. It is
 * not a captured reasoning trace, so anything that reports "thought for N
 * seconds" must check this first.
 */
export function isThinkSeed(text?: string | null): boolean {
  if (!text) return false;
  const value = text.trim();
  return value === THINK_SEED_FA.trim() || value === THINK_SEED_EN.trim();
}

/** True only when a genuine reasoning trace was captured. */
export function hasRealReasoning(text?: string | null): boolean {
  return !!text && text.trim().length > 0 && !isThinkSeed(text);
}

/**
 * Rescue when a model dumps its whole answer inside <think> (empty visible content,
 * huge reasoning). Splits trailing answer out: returns {content, reasoning} or null.
 */
export function rescueAnswerFromReasoning(reasoning: string): { content: string; reasoning: string } | null {
  const text = (reasoning || '').trim();
  if (text.length < 300) return null;
  const cutAt = Math.floor(text.length * 0.45);
  let split = text.lastIndexOf('\n\n', Math.max(cutAt, text.length - 2000));
  if (split < cutAt) split = text.indexOf('\n\n', cutAt);
  if (split <= 0 || split >= text.length - 50) return null;
  const head = text.slice(0, split).trim();
  const tail = text.slice(split).trim();
  if (tail.length < 100) return null;
  return { content: tail, reasoning: head };
}

const FA_STOP = new Set(
  'و در به از که با را این است شده برای بر هم نیز یا ولی اما اگر چون تا کند کنند شد شود می ها های تر ترین چه کدام کجا چرا چگونه هست نیست بود بودند باشد باشند دارد دارند کرده کرد کنید کنیم کنم کن ببین بگو برو بیا لطفا لطفاً سلام درود ممنون خیلی یه یک دو سه مورد درباره درمورد راجع تحقیق مقاله آموزش یادگیری سایت اسلاید بساز بکن بده بزن'.split(' ')
);
const EN_STOP = new Set(
  'the a an and or of to in on for with is are was were be been as at by from that this it its into about research make create build write please explain tell overview guide tutorial best how what why when where which'.split(' ')
);

function extractKeywords(query: string): string {
  const tokens = (query || '')
    .replace(/[?!،؛:؛"«»()[\]{}<>|/\\*_=+#~`@$%^&]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !FA_STOP.has(t) && !EN_STOP.has(t.toLowerCase()));
  return tokens.slice(0, 8).join(' ');
}

/** Heuristic multi-query planner (deterministic, no extra LLM call). */
export function planSubQueries(query: string, depth: AgentDepth, mode: ChatTool): string[] {
  const q = (query || '').trim().slice(0, 160);
  if (!q) return [];
  const fa = isPersianText(q);
  const kw = extractKeywords(q) || q.slice(0, 60);
  if (depth === 'QUICK') {
    const out = [q];
    if (kw !== q && kw.length > 2) out.push(kw);
    return out.slice(0, 2);
  }
  const out = [q];
  if (kw !== q && kw.length > 2) out.push(kw);
  if (mode === 'WEB_DEV' || mode === 'ARTIFACTS') {
    out.push(fa ? `${kw} مثال کد مستندات` : `${kw} documentation examples`);
    out.push(fa ? `${kw} بهترین روش طراحی` : `${kw} best practices tutorial`);
  } else if (mode === 'DEEP_RESEARCH' || mode === 'SOURCE_QA' || mode === 'DEBATE') {
    out.push(fa ? `${kw} بررسی جامع علمی` : `${kw} in-depth scientific review`);
    out.push(fa ? `${kw} آخرین تحقیقات آمار` : `${kw} latest research statistics`);
  } else {
    out.push(fa ? `${kw} بررسی کامل` : `${kw} comprehensive overview`);
    out.push(fa ? `${kw} مثال کاربردی` : `${kw} practical examples`);
  }
  return [...new Set(out)].slice(0, 4);
}

function normalizeUrl(u: string): string {
  try {
    const p = new URL(u);
    p.hash = '';
    return p.toString().replace(/\/$/, '').toLowerCase();
  } catch {
    return (u || '').trim().toLowerCase();
  }
}

function sourceWeight(source: string, mode: ChatTool): number {
  const s = (source || '').toLowerCase();
  if (s.includes('wikipedia')) return 5;
  if (mode === 'WEB_DEV' || mode === 'ARTIFACTS' || mode === 'CANVAS') {
    if (s.includes('stackoverflow')) return 5;
    if (s.includes('hackernews') || s.includes('duckduckgo')) return 3;
    if (s.includes('arxiv') || s.includes('openalex') || s.includes('crossref')) return 2;
    return 2.5;
  }
  if (s.includes('openalex') || s.includes('arxiv') || s.includes('crossref')) return 4;
  if (s.includes('stackoverflow')) return 3;
  if (s.includes('duckduckgo')) return 3;
  if (s.includes('hackernews')) return 2;
  return 2;
}

async function searchMany(
  queries: string[],
  mode: ChatTool,
  signal?: AbortSignal
): Promise<{ sources: AgentSource[]; perQuery: number[] }> {
  const settled = await Promise.allSettled(
    queries.map(async (qq) => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(qq)}`, { signal });
      if (!res.ok) return [] as AgentSource[];
      const json = await res.json();
      return (json.results || []) as AgentSource[];
    })
  );
  const perQuery = settled.map((s) => (s.status === 'fulfilled' ? s.value.length : 0));
  const scored: Array<{ src: AgentSource; score: number; order: number }> = [];
  let order = 0;
  settled.forEach((s) => {
    if (s.status !== 'fulfilled') return;
    s.value.forEach((src, idx) => {
      if (!src?.url || !src?.title) return;
      scored.push({ src, score: sourceWeight(src.source, mode) + Math.max(0, 6 - idx) * 0.3, order: order++ });
    });
  });
  scored.sort((a, b) => b.score - a.score || a.order - b.order);
  const seen = new Set<string>();
  const perDomain = new Map<string, number>();
  const merged: AgentSource[] = [];
  for (const { src } of scored) {
    const key = normalizeUrl(src.url);
    if (seen.has(key)) continue;
    let dom = 'unknown';
    try {
      const h = new URL(src.url).hostname.replace(/^www\./, '').toLowerCase().split('.');
      dom = h.length > 2 ? h.slice(-2).join('.') : h.join('.');
    } catch {
      // keep unknown
    }
    if ((perDomain.get(dom) || 0) >= 3) continue; // diversity: never one domain wall
    seen.add(key);
    perDomain.set(dom, (perDomain.get(dom) || 0) + 1);
    merged.push(src);
    if (merged.length >= 15) break;
  }
  return { sources: merged, perQuery };
}

async function readTop(
  sources: AgentSource[],
  budget: number,
  excerptChars: number,
  signal?: AbortSignal
): Promise<{ read: number; failed: number }> {
  const targets = sources.slice(0, budget);
  let read = 0;
  let failed = 0;
  await Promise.allSettled(
    targets.map(async (s) => {
      try {
        const res = await fetch(
          `/api/fetch?url=${encodeURIComponent(s.url)}&maxChars=${excerptChars}`,
          { signal }
        );
        if (!res.ok) {
          failed++;
          return;
        }
        const text = (await res.text()).trim();
        if (text.length > 200) {
          s.excerpt = text.slice(0, excerptChars);
          read++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    })
  );
  return { read, failed };
}

export function buildEvidenceContext(sources: AgentSource[]): string {
  if (sources.length === 0) return '';
  const blocks = sources.map((s, i) => {
    const n = i + 1;
    const lines = [`### [${n}] ${s.title}`, `URL: ${s.url}`, `Summary: ${s.snippet}`];
    if (s.excerpt) lines.push(`Content excerpt:\n${s.excerpt.slice(0, 3500)}`);
    return lines.join('\n');
  });
  return [
    '### LIVE WEB EVIDENCE (free multi-source search, already browsed for you):',
    ...blocks,
    '',
    'RULES: Ground factual claims in these sources with inline numeric citations like [1], [2]. If the evidence does not establish something, say so plainly instead of inventing facts.',
  ].join('\n\n');
}

export function planSummaryText(query: string, queries: string[], depth: AgentDepth): string {
  const fa = isPersianText(query);
  if (fa) {
    return depth === 'DEEP'
      ? `برنامه ایجنت (عمیق): ${queries.length} جستجوی موازی، خواندن ${Math.min(5, queries.length + 2)} منبع، سپس سنتز نهایی با استناد.`
      : `برنامه ایجنت (سریع): ${queries.length} جستجوی موازی، خواندن ۲ منبع کلیدی، سپس پاسخ نهایی.`;
  }
  return depth === 'DEEP'
    ? `Agent plan (deep): ${queries.length} parallel searches, read top sources, then cited synthesis.`
    : `Agent plan (quick): ${queries.length} parallel searches, read 2 key sources, then final answer.`;
}

/** Strict per-tool behavior prompt — complements TOOL_PROMPTS in prompt/assembly. */
export function agentBehaviorPrompt(mode: ChatTool, fa: boolean, sourceCount: number): string {
  const cite = sourceCount > 0
    ? (fa
      ? `از شواهد وب بالا استفاده کن و ادعاهای واقعی را با استناد عددی [1] تا [${sourceCount}] مشخص کن.`
      : `Use the web evidence above and cite factual claims with numeric citations [1]–[${sourceCount}].`)
    : '';
  const think = fa
    ? 'در صورت ارائهٔ استدلال، فقط خلاصهٔ کوتاه و قابل‌نمایش از هدف، شواهد و روش حل را داخل <think> بنویس. جواب کامل و خروجی فایل‌ها باید پس از </think> باشد.'
    : 'If providing reasoning, put only a brief display-safe summary of the goal, evidence and approach inside <think>. The complete answer and generated files must follow </think>.';
  const extras: Record<string, string> = {
    SLIDES: fa
      ? 'در انتها دقیقاً یک بلوک ```slides با تعداد اسلاید خواسته‌شده توسط کاربر یا تنظیم پیش‌فرض بده. هر اسلاید غنی شامل title، subtitle، ۳-۵ bullet، speakerNotes و codeSnippet در صورت فنی بودن باشد. متن گفتگو فقط ۲-۴ جمله خلاصه مدیریتی باشد.'
      : 'End with exactly one ```slides block using the user-requested count or configured default. Each rich slide should include title, subtitle, 3–5 bullets, speakerNotes and codeSnippet when technical. Keep chat prose to a 2–4 sentence executive summary.',
    WEB_DEV: fa
      ? 'خروجی فایل‌ها فقط با پروتکل <file path="...">...</file> باشد: حداقل index.html کامل و خودکفا (Tailwind CDN + جاوااسکریپت تمیز، بدون TODO). در متن چت معماری و نحوه تعامل را کوتاه توضیح بده.'
      : 'Emit files only via the <file path="...">...</file> protocol: at minimum a complete self-contained index.html (Tailwind CDN + clean JS, no TODOs). Briefly explain architecture in chat prose.',
    DEEP_RESEARCH: fa
      ? 'ساختار: خلاصه مدیریتی، یافته‌های کلیدی، تحلیل تطبیقی، ریسک‌ها و چشم‌انداز، سؤالات باز. عمیق و کاربردی، نه خلاصه سطحی.'
      : 'Structure: executive summary, key findings, comparative analysis, risks & outlook, open questions. Deep and actionable, not a shallow summary.',
    LEARN: fa
      ? 'ساختار درس: مدل ذهنی با مثال ملموس، تجزیه قدم‌به‌قدم (اول چرا بعد چگونه)، مثال حل‌شده، ۱-۲ سؤال سقراطی برای یادآوری فعال.'
      : 'Lesson structure: mental model with vivid analogy, step-by-step breakdown (why before how), worked example, 1–2 Socratic recall questions.',
    DEBATE: fa
      ? 'ساختار مناظره: ادعا، شواهد، استدلال، پاسخ به مخالف برای هر طرف، سپس داوری با نمره و رأی مستدل.'
      : 'Debate structure: claim, evidence, warrant, rebuttal per side, then judged verdict with scores.',
    SOURCE_QA: fa
      ? 'فقط بر اساس شواهد داده‌شده جواب بده و هر ادعای مهم را با [S1:C2] یا [n] استناد کن. اگر منبع کافی نیست، صریح بگو.'
      : 'Answer only from the provided evidence with citations per material claim. Say plainly when evidence is insufficient.',
  };
  return [`[AGENT EXECUTION RULES]`, think, cite, extras[mode] || ''].filter(Boolean).join('\n');
}

/**
 * Full evidence phase: plan → parallel searches → read top sources.
 * Emits progress via onStep. Never throws — returns degraded flag instead.
 */
export async function runEvidencePhase(
  query: string,
  opts: {
    mode: ChatTool;
    depth: AgentDepth;
    maxSteps: number;
    signal?: AbortSignal;
    onStep?: OnAgentStep;
    readSources?: boolean;
    maxSources?: number;
    plannedQueries?: string[];
  }
): Promise<EvidenceResult> {
  const started = Date.now();
  const { mode, signal, onStep } = opts;
  const depth = opts.depth === 'DEEP' ? 'DEEP' : 'QUICK';
  const maxSteps = Math.max(2, Math.min(opts.maxSteps || 5, 10));
  const queries = (opts.plannedQueries?.length ? opts.plannedQueries : planSubQueries(query, depth, mode)).slice(0, depth === 'DEEP' ? Math.min(4, maxSteps) : 2);

  if (!opts.plannedQueries?.length) onStep?.({
    id: `step_plan_${Date.now()}`,
    toolName: 'agent_plan',
    input: { query: query.slice(0, 120), depth, queries },
    output: planSummaryText(query, queries, depth),
    status: 'DONE',
  });

  if (queries.length === 0) {
    return { queries: [], sources: [], evidenceContext: '', degraded: true, ms: Date.now() - started };
  }

  const searchStepId = `step_search_${Date.now()}`;
  onStep?.({ id: searchStepId, toolName: 'web_search', input: { query: queries[0], queries }, status: 'CALLING' });

  let sources: AgentSource[] = [];
  try {
    const { sources: merged } = await searchMany(queries, mode, signal);
    sources = merged.slice(0, Math.max(1, Math.min(opts.maxSources || 8, 12)));
  } catch {
    sources = [];
  }

  onStep?.({
    id: searchStepId,
    toolName: 'web_search',
    input: { query: queries[0], queries },
    output: JSON.stringify({
      count: sources.length,
      queries,
      sources: sources.slice(0, 12).map((s) => ({ title: s.title, url: s.url, snippet: s.snippet, source: s.source })),
    }),
    status: 'DONE',
  });

  const readBudget = depth === 'DEEP' ? Math.min(5, maxSteps) : 2;
  const excerptChars = depth === 'DEEP' ? 4000 : 3000;
  const readStepId = `step_read_${Date.now()}`;
  const topUrls = sources.slice(0, readBudget).map((s) => s.url);
  if (topUrls.length > 0 && opts.readSources !== false) {
    onStep?.({ id: readStepId, toolName: 'agent_read', input: { urls: topUrls }, status: 'CALLING' });
    let read = 0;
    try {
      ({ read } = await readTop(sources, readBudget, excerptChars, signal));
    } catch {
      read = 0;
    }
    onStep?.({
      id: readStepId,
      toolName: 'agent_read',
      input: { urls: topUrls },
      output: JSON.stringify({ read, of: topUrls.length }),
      status: 'DONE',
    });
  }

  const withContent = sources.filter((s) => s.excerpt);
  const ranked = [...withContent, ...sources.filter((s) => !s.excerpt)].slice(0, depth === 'DEEP' ? 8 : 5);
  return {
    queries,
    sources: ranked,
    evidenceContext: buildEvidenceContext(ranked),
    degraded: ranked.length === 0,
    ms: Date.now() - started,
  };
}

/** Fallback deck builder — guarantees a rich deck even if the model output is malformed. */
export function buildSlidesFallback(query: string, sources: AgentSource[]): Array<{ title: string; subtitle: string; bullets: string[] }> {
  const fa = isPersianText(query);
  const topic = query.trim().slice(0, 70) || (fa ? 'موضوع ارائه' : 'Presentation topic');
  const pick = (i: number) => sources[i % Math.max(1, sources.length)];
  const bullet = (i: number, k: number) => {
    const s = pick(i);
    const base = s.snippet || s.title;
    return base.length > 140 ? base.slice(0, 140) + '…' : base;
  };
  const T = fa
    ? {
        cover: `معرفی: ${topic}`,
        coverSub: 'نگاه اجرایی و نقشه راه ارائه',
        key: 'یافته‌های کلیدی',
        deep: 'تحلیل عمیق',
        evidence: 'شواهد و منابع',
        apply: 'کاربرد عملی',
        next: 'جمع‌بندی و گام بعد',
      }
    : {
        cover: `Introducing: ${topic}`,
        coverSub: 'Executive view and roadmap',
        key: 'Key findings',
        deep: 'Deep dive',
        evidence: 'Evidence & sources',
        apply: 'Practical application',
        next: 'Wrap-up & next steps',
      };
  const slides = [
    { title: T.cover, subtitle: T.coverSub, bullets: fa ? ['هدف ارائه و مخاطب', 'نقشه سه‌بخشی: مسئله، شواهد، اقدام', 'چرا این موضوع الان مهم است'] : ['Goal and audience', 'Three-part roadmap: problem, evidence, action', 'Why this matters now'] },
    { title: T.key, subtitle: sources[0]?.title || '', bullets: [bullet(0, 0), bullet(1, 1), bullet(2, 2)] },
    { title: `${T.deep} ۱`, subtitle: sources[1]?.title || '', bullets: [bullet(1, 0), bullet(3, 1), bullet(0, 2)] },
    { title: `${T.deep} ۲`, subtitle: sources[2]?.title || '', bullets: [bullet(2, 0), bullet(4, 1), bullet(1, 2)] },
    { title: T.evidence, subtitle: fa ? 'استناد به منابع زنده' : 'Grounded in live sources', bullets: sources.slice(0, 4).map((s, i) => `[${i + 1}] ${s.title}`) },
    { title: T.apply, subtitle: fa ? 'از دانسته تا اقدام' : 'From insight to action', bullets: fa ? ['سه اقدام پیشنهادی هفته آینده', 'معیار موفقیت قابل اندازه‌گیری', 'ریسک‌ها و راه مهار'] : ['Three actions for next week', 'Measurable success criteria', 'Risks and mitigations'] },
    { title: T.next, subtitle: fa ? 'پیام اصلی ارائه' : 'One takeaway', bullets: fa ? ['جمله طلایی ارائه', 'دعوت به اقدام مشخص', 'منابع برای مطالعه بیشتر'] : ['The one-line takeaway', 'A concrete call to action', 'Sources for further reading'] },
  ];
  return sources.length === 0 ? slides.slice(0, 5) : slides;
}

/** Extract a living Canvas document from model output (```markdown Title block). */
export function extractCanvasDocument(content: string): { title: string; content: string } | null {
  if (!content) return null;
  const re = /```markdown\s+([^\n`]{1,120})\n([\s\S]*?)```/gi;
  let best: { title: string; content: string } | null = null;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const title = m[1].trim();
    const body = m[2].trim();
    if (title && body.length > 100 && (!best || body.length > best.content.length)) {
      best = { title, content: body };
    }
  }
  return best;
}

/** Strict role prompts for real multi-model council & debate flows (bilingual). */
export function councilMemberPrompt(fa: boolean): string {
  return fa
    ? 'تو یکی از اعضای شورای تخصصی هستی. مستقل و عمیق استدلال کن، بهترین راه‌حل خودت را با شواهد بده. در پایان ۳ نقطه قوت و ۱ نقطه ضعف راه‌حلت را صادانه بنویس.'
    : 'You are an expert council member. Reason independently and deeply, give your best solution with evidence. End with 3 honest strengths and 1 weakness of your solution.';
}

export function councilJudgePrompt(fa: boolean): string {
  return fa
    ? `[ROLE: COUNCIL JUDGE & SYNTHESIZER]
پاسخ‌های اعضای شورا (مدل‌های مختلف) در ادامه آمده. وظیفه تو:
1. هر پاسخ را در جدول امتیازدهی کن (دقت، عمق، شواهد، کاربردی‌بودن — از ۱۰).
2. بهترین ایده‌های هر عضو را استخراج و در «پاسخ نهایی شورا» ترکیب کن — پاسخی که از تک‌تک اعضا بهتر باشد.
3. اختلاف‌نظرهای واقعی باقی‌مانده را صریح بنویس.
قالب: جدول امتیاز → پاسخ نهایی شورا → اختلاف‌ها.`
    : `[ROLE: COUNCIL JUDGE & SYNTHESIZER]
Council member answers (different models) follow. You must:
1. Score each answer in a table (accuracy, depth, evidence, usefulness — out of 10).
2. Extract the best ideas into a "Final Council Answer" better than any single member.
3. State remaining genuine disagreements plainly.
Format: score table → final council answer → disagreements.`;
}

export function debateProponentPrompt(fa: boolean): string {
  return fa
    ? 'تو «مدافع» مناظره هستی. فقط از موضع موافق استدلال کن: ادعا، شواهد با استناد [n]، و پیش‌بینی پاسخ مخالف. قاطع ولی منصف باش.'
    : 'You are the debate PROPONENT. Argue only the affirmative: claim, cited evidence [n], and anticipate the opponent. Forceful but fair.';
}

export function debateOpponentPrompt(fa: boolean): string {
  return fa
    ? 'تو «منتقد» مناظره هستی. فقط از موضع مخالف استدلال کن: مغالطه‌ها و نقاط ضعف موضع موافق را با شواهد [n] بشکاف و بدیل خودت را بده.'
    : 'You are the debate OPPONENT. Argue only the negative: expose fallacies and weaknesses of the affirmative with evidence [n], and offer your alternative.';
}

export function debateJudgePrompt(fa: boolean): string {
  return fa
    ? `[ROLE: DEBATE JUDGE]
استدلال مدافع و منتقد (دو مدل مستقل) در ادامه آمده. وظیفه تو:
1. جدول امتیاز: کیفیت شواهد، اعتبار منطق، پاسخ به اعتراض، پیامد عملی (هرکدام از ۱۰).
2. رأی مستدل: برنده هر محور و برنده کلی.
3. سنتز نهایی: بهترین موضع ترکیبی که از هر دو طرف قوی‌تر است.`
    : `[ROLE: DEBATE JUDGE]
Proponent and opponent arguments (two independent models) follow. You must:
1. Score table: evidence quality, logical validity, objection handling, practical consequences (each /10).
2. Reasoned verdict: winner per axis and overall.
3. Final synthesis: the strongest combined position.`;
}

/** Extract web files from model output — supports <file> protocol + ```html fallback. */
export function extractWebFiles(content: string): Array<{ path: string; language: string; content: string }> {
  const files: Array<{ path: string; language: string; content: string }> = [];
  const xmlRe = /<file\s+path=["']([^"']+)["']>([\s\S]*?)<\/file>/gi;
  let m: RegExpExecArray | null;
  while ((m = xmlRe.exec(content)) !== null) {
    const p = m[1].trim();
    const body = m[2].trim();
    if (p && body) files.push({ path: p, language: p.split('.').pop() || 'html', content: body });
  }
  if (files.length === 0) {
    const htmlRe = /```html\s+([^\n]*)\n([\s\S]*?)```/i;
    const hm = htmlRe.exec(content);
    if (hm && hm[2].trim().length > 300) {
      files.push({ path: 'index.html', language: 'html', content: hm[2].trim() });
    }
  }
  return files;
}
