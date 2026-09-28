import { requireWorkspace } from '@/lib/server/workspace';
import { rateLimit } from '@/lib/server/rate-limit';
import { apiFailure, HttpError } from '@/lib/server/errors';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface FreeSearchResult {
  title: string;
  snippet: string;
  url: string;
  source: string;
}

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Fresh/factual intent (prices, news, today…) — scholarly indexes are useless here.
const FRESH_RE =
  /(قیمت|نرخ|امروز|امشب|الان|همین الان|آخرین|جدیدترین|تازه|خبر|اخبار|نتیجه|بازی|وضعیت|بازار|دلار|طلا|ارز|price|rate|today|now|latest|breaking|news|score|who won|stock|weather|هوا)/i;
const SCHOLAR_RE =
  /(تحقیق|مقاله|پژوهش|علمی|دانشگاهی|پایان‌نامه|پایان نامه|paper|study|research|arxiv|doi|theorem|proof|journal)/i;
const TECH_RE =
  /(کد|برنامه|خطا|ارور|باگ|کتابخانه|فریمورک|آموزش برنامه|error|code|python|javascript|typescript|react|nextjs|bug|api|library|framework|tutorial|how to|npm|docker|linux|git)/i;

const FA_STOP = new Set(
  'و در به از که با را این است شده برای بر هم نیز یا ولی اما اگر چون تا کند کنند شد شود می ها های تر ترین چه کدام کجا چرا چگونه هست نیست بود بودند باشد باشند دارد دارند کرده کرد کنید کنیم کنم کن چیست چنده چقدر همین الان خیلی یه یک دو سه مورد درباره درمورد راجع'.split(' ')
);
const EN_STOP = new Set(
  'the a an and or of to in on for with is are was were be been as at by from that this it its into about what how much many price today now latest news current much'.split(' ')
);

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function domainOf(u: string): string {
  try {
    const h = new URL(u.startsWith('//') ? `https:${u}` : u).hostname.replace(/^www\./, '').toLowerCase();
    const parts = h.split('.');
    return parts.length > 2 ? parts.slice(-2).join('.') : h;
  } catch {
    return 'unknown';
  }
}

function normalizeUrl(u: string): string {
  try {
    const parsed = new URL(u.startsWith('//') ? `https:${u}` : u);
    parsed.hash = '';
    return parsed.toString().replace(/\/$/, '').toLowerCase();
  } catch {
    return u.trim().toLowerCase();
  }
}

function queryTokens(q: string): string[] {
  return (q || '')
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !FA_STOP.has(t) && !EN_STOP.has(t));
}

/** 0..1 keyword overlap between query and a result — kills off-topic junk. */
function overlapScore(qTokens: string[], title: string, snippet: string): number {
  if (qTokens.length === 0) return 0.5;
  const hay = `${title} ${snippet}`.toLowerCase();
  let hit = 0;
  for (const t of qTokens) {
    if (hay.includes(t)) hit++;
  }
  return hit / qTokens.length;
}

// ---------- Free translation FA→EN (MyMemory, no key, best-effort) ----------
async function translateFaToEn(q: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.mymemory.net/get?q=${encodeURIComponent(q)}&langpair=fa|en`, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text: string = data?.responseData?.translatedText || '';
    if (!text || /MYMEMORY WARNING|QUERY LENGTH LIMIT|INVALID/i.test(text)) return null;
    if (!/[a-zA-Z]{2,}/.test(text)) return null;
    return text.trim();
  } catch {
    return null;
  }
}

// ---------- DuckDuckGo: lite POST, fallback to /html/ GET ----------
async function searchDDG(q: string): Promise<FreeSearchResult[]> {
  const out: FreeSearchResult[] = [];
  try {
    const res = await fetch(`https://lite.duckduckgo.com/lite/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
      body: `q=${encodeURIComponent(q)}`,
      signal: AbortSignal.timeout(4500),
    });
    if (res.ok) {
      const html = await res.text();
      const linkRegex = /<a class="result-link"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
      const snippetRegex = /<td class="result-snippet">([\s\S]*?)<\/td>/gi;
      const links: Array<{ url: string; title: string }> = [];
      const snippets: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = linkRegex.exec(html)) !== null && links.length < 8) {
        const title = stripTags(m[2]);
        let url = m[1];
        if (url.startsWith('//')) url = `https:${url}`;
        if (title && url.startsWith('http')) links.push({ url, title });
      }
      while ((m = snippetRegex.exec(html)) !== null && snippets.length < 8) {
        snippets.push(stripTags(m[1]));
      }
      links.forEach((l, i) => {
        out.push({ title: l.title, snippet: snippets[i] || '', url: l.url, source: 'DuckDuckGo' });
      });
    }
  } catch {
    // fall through to /html/ endpoint
  }
  if (out.length > 0) return out;

  // Fallback: /html/ endpoint (different markup, resilient to lite blocks)
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(4500),
    });
    if (!res.ok) return out;
    const html = await res.text();
    const linkRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    const snipRegex = /<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
    const links: Array<{ url: string; title: string }> = [];
    const snippets: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = linkRegex.exec(html)) !== null && links.length < 8) {
      let url = m[1];
      const uddg = /[?&]uddg=([^&"]+)/.exec(url);
      if (uddg) {
        try {
          url = decodeURIComponent(uddg[1]);
        } catch {
          continue;
        }
      }
      if (url.startsWith('//')) url = `https:${url}`;
      const title = stripTags(m[2]);
      if (title && url.startsWith('http') && !url.includes('duckduckgo.com')) links.push({ url, title });
    }
    while ((m = snipRegex.exec(html)) !== null && snippets.length < 8) {
      snippets.push(stripTags(m[1]));
    }
    links.forEach((l, i) => {
      out.push({ title: l.title, snippet: snippets[i] || '', url: l.url, source: 'DuckDuckGo' });
    });
  } catch {
    // ignore
  }
  return out;
}

async function searchWiki(q: string, lang: 'en' | 'fa'): Promise<FreeSearchResult[]> {
  const out: FreeSearchResult[] = [];
  try {
    const res = await fetch(
      `https://${lang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=5&namespace=0&format=json`,
      { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return out;
    const data = await res.json();
    const titles: string[] = data[1] || [];
    const descs: string[] = data[2] || [];
    const urls: string[] = data[3] || [];
    titles.forEach((t, i) => {
      if (t && urls[i]) {
        out.push({
          title: t,
          snippet: descs[i] || '',
          url: urls[i],
          source: lang === 'fa' ? 'Wikipedia FA' : 'Wikipedia',
        });
      }
    });
  } catch {
    // ignore
  }
  return out;
}

async function searchOpenAlex(q: string): Promise<FreeSearchResult[]> {
  const out: FreeSearchResult[] = [];
  try {
    const res = await fetch(
      `https://api.openalex.org/works?search=${encodeURIComponent(q)}&per-page=5&select=id,display_name,publication_year,doi,cited_by_count`,
      { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(4500) }
    );
    if (!res.ok) return out;
    const data = await res.json();
    for (const w of data.results || []) {
      const title: string = w.display_name || '';
      if (!title || title.toLowerCase() === 'null') continue;
      const url = w.doi ? `https://doi.org/${String(w.doi).replace(/^https?:\/\/(dx\.)?doi\.org\//, '')}` : w.id;
      out.push({
        title,
        snippet: `Scholarly work${w.publication_year ? ` (${w.publication_year})` : ''}${w.cited_by_count ? ` — cited by ${w.cited_by_count}` : ''}.`,
        url,
        source: 'OpenAlex',
      });
    }
  } catch {
    // ignore
  }
  return out;
}

async function searchArxiv(q: string): Promise<FreeSearchResult[]> {
  const out: FreeSearchResult[] = [];
  try {
    const res = await fetch(
      `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(q)}&start=0&max_results=5&sortBy=submittedDate&sortOrder=descending`,
      { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(4500) }
    );
    if (!res.ok) return out;
    const xml = await res.text();
    const entries = xml.split('<entry>').slice(1);
    for (const e of entries.slice(0, 5)) {
      const title = stripTags(/<title>([\s\S]*?)<\/title>/.exec(e)?.[1] || '').replace(/\s+/g, ' ');
      const summary = stripTags(/<summary>([\s\S]*?)<\/summary>/.exec(e)?.[1] || '').slice(0, 280);
      const id = /<id>([\s\S]*?)<\/id>/.exec(e)?.[1]?.trim();
      if (title && id) out.push({ title, snippet: summary || 'arXiv preprint.', url: id, source: 'arXiv' });
    }
  } catch {
    // ignore
  }
  return out;
}

async function searchCrossref(q: string): Promise<FreeSearchResult[]> {
  const out: FreeSearchResult[] = [];
  try {
    const res = await fetch(
      `https://api.crossref.org/works?query=${encodeURIComponent(q)}&rows=5&select=DOI,title,URL,published`,
      { headers: { 'User-Agent': `${UA} pimx-agent/1.0 (mailto:agent@pimx.local)` }, signal: AbortSignal.timeout(4500) }
    );
    if (!res.ok) return out;
    const data = await res.json();
    for (const item of data.message?.items || []) {
      const title = Array.isArray(item.title) ? item.title[0] : item.title;
      const url = item.URL || (item.DOI ? `https://doi.org/${item.DOI}` : '');
      if (title && url) {
        const year = item.published?.['date-parts']?.[0]?.[0];
        out.push({ title, snippet: `Crossref record${year ? ` (${year})` : ''} — DOI: ${item.DOI || ''}`, url, source: 'Crossref' });
      }
    }
  } catch {
    // ignore
  }
  return out;
}

async function searchHN(q: string): Promise<FreeSearchResult[]> {
  const out: FreeSearchResult[] = [];
  try {
    const res = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=5`,
      { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return out;
    const data = await res.json();
    for (const h of data.hits || []) {
      const title: string = h.title || '';
      if (!title) continue;
      const url: string = h.url || `https://news.ycombinator.com/item?id=${h.objectID}`;
      out.push({
        title,
        snippet: `HN discussion — ${h.points ?? 0} points, ${h.num_comments ?? 0} comments.`,
        url,
        source: 'HackerNews',
      });
    }
  } catch {
    // ignore
  }
  return out;
}

async function searchStack(q: string): Promise<FreeSearchResult[]> {
  const out: FreeSearchResult[] = [];
  try {
    const res = await fetch(
      `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${encodeURIComponent(q)}&site=stackoverflow&pagesize=5&filter=!nNPvSNdWme`,
      { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(4500) }
    );
    if (!res.ok) return out;
    const data = await res.json();
    for (const item of data.items || []) {
      if (!item.title || !item.link) continue;
      const tags = Array.isArray(item.tags) ? item.tags.slice(0, 4).join(', ') : '';
      out.push({
        title: stripTags(item.title),
        snippet: `StackOverflow — score ${item.score ?? 0}${item.is_answered ? ', answered' : ''}${tags ? ` [${tags}]` : ''}.`,
        url: item.link,
        source: 'StackOverflow',
      });
    }
  } catch {
    // ignore
  }
  return out;
}

const SCHOLARLY_SOURCES = new Set(['openalex', 'arxiv', 'crossref']);

export async function GET(req: NextRequest) {
  try { const user=await requireWorkspace(req); await rateLimit('evidence:'+user.id,180,60*1000); const checkedQuery=req.nextUrl.searchParams.get('q') || '';if(checkedQuery.length>500)throw new HttpError(400,'Search query is too long.');
  const started = Date.now();
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  if (!q) return NextResponse.json({ query: '', results: [], meta: { degraded: true } });

  const isPersian = /[\u0600-\u06FF]/.test(q);
  const isFresh = FRESH_RE.test(q);
  const isScholarQ = SCHOLAR_RE.test(q);
  const skipScholarly = isFresh && !isScholarQ;

  // Persian queries: also search the English translation (free MyMemory API).
  let translatedQuery: string | null = null;
  if (isPersian) translatedQuery = await translateFaToEn(q);
  const isTech = TECH_RE.test(q) || (translatedQuery ? TECH_RE.test(translatedQuery) : false);

  const querySet: Array<{ text: string; lang: 'fa' | 'en' }> = [{ text: q, lang: isPersian ? 'fa' : 'en' }];
  if (translatedQuery && translatedQuery.toLowerCase() !== q.toLowerCase()) {
    querySet.push({ text: translatedQuery, lang: 'en' });
  }

  const tasks: Array<{ name: string; run: () => Promise<FreeSearchResult[]> }> = [];
  for (const qs of querySet) {
    tasks.push({ name: `ddg:${qs.text.slice(0, 24)}`, run: () => searchDDG(qs.text) });
    tasks.push({ name: `wiki_${qs.lang}`, run: () => searchWiki(qs.text, qs.lang) });
  }
  if (!skipScholarly) {
    tasks.push({ name: 'openalex', run: () => searchOpenAlex(q) });
    tasks.push({ name: 'arxiv', run: () => searchArxiv(q) });
    tasks.push({ name: 'crossref', run: () => searchCrossref(q) });
  }
  if (!isFresh || isTech) {
    // Fresh non-tech queries (prices, news) skip community noise.
    tasks.push({ name: 'hn', run: () => searchHN(translatedQuery || q) });
    tasks.push({ name: 'stack', run: () => searchStack(translatedQuery || q) });
  }

  const settled = await Promise.allSettled(tasks.map((t) => t.run()));
  const okCount = settled.filter((s) => s.status === 'fulfilled').length;

  // Score: keyword overlap (relevance) + source weight + position. Scholarly must prove relevance.
  const refTokens = queryTokens(translatedQuery ? `${q} ${translatedQuery}` : q);
  const scored: Array<{ r: FreeSearchResult; score: number; order: number }> = [];
  let order = 0;
  settled.forEach((s, taskIdx) => {
    if (s.status !== 'fulfilled') return;
    const taskName = tasks[taskIdx].name;
    const scholarly = SCHOLARLY_SOURCES.has(taskName);
    s.value.forEach((r, idx) => {
      if (!r?.url || !r?.title) return;
      const overlap = overlapScore(refTokens, r.title, r.snippet);
      if (scholarly && overlap < 0.2) return; // drop off-topic scholarly junk
      if (isFresh && overlap === 0 && scholarly) return;
      let base = 2;
      if (r.source === 'DuckDuckGo') base = isFresh ? 6 : 4;
      else if (r.source.startsWith('Wikipedia')) base = 5;
      else if (scholarly) base = 3;
      else if (r.source === 'StackOverflow') base = isTech ? 4.5 : 2;
      else if (r.source === 'HackerNews') base = 2.5;
      scored.push({ r, score: overlap * 10 + base + Math.max(0, 5 - idx) * 0.3, order: order++ });
    });
  });
  scored.sort((a, b) => b.score - a.score || a.order - b.order);

  // Diversify: max 3 per source, max 2 per domain — no more 10x doi.org walls.
  const merged: FreeSearchResult[] = [];
  const seenUrl = new Set<string>();
  const perSource = new Map<string, number>();
  const perDomain = new Map<string, number>();
  for (const { r } of scored) {
    const urlKey = normalizeUrl(r.url);
    if (seenUrl.has(urlKey)) continue;
    const srcCount = perSource.get(r.source) || 0;
    if (srcCount >= 3) continue;
    const dom = domainOf(r.url);
    const domCount = perDomain.get(dom) || 0;
    if (domCount >= 2) continue;
    seenUrl.add(urlKey);
    perSource.set(r.source, srcCount + 1);
    perDomain.set(dom, domCount + 1);
    merged.push(r.title && r.snippet ? r : { ...r, snippet: r.snippet || r.title });
    if (merged.length >= 10) break;
  }

  return NextResponse.json({
    query: q,
    results: merged,
    meta: {
      sourcesQueried: tasks.map((t) => t.name),
      sourcesOk: okCount,
      degraded: merged.length === 0,
      isPersian,
      intent: isFresh ? 'fresh' : isScholarQ ? 'scholarly' : 'general',
      translatedQuery,
      ms: Date.now() - started,
    },
  });
  } catch(error) { return apiFailure(error); }
}
