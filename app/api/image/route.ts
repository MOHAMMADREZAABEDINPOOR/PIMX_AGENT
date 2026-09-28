import { requireWorkspace } from '@/lib/server/workspace';
import { rateLimit } from '@/lib/server/rate-limit';
import { apiFailure, HttpError } from '@/lib/server/errors';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UA = 'PIMXAgentSite/1.0 (presentation image search)';
interface WikiPage { title: string; index?: number; fullurl?: string; pageimage?: string; thumbnail?: { source: string; width: number; height: number }; }

/** Topical thumbnail via Wikipedia search + pageimages (free, no key). Tries EN then FA. */
async function wikiThumb(query: string, lang: 'en' | 'fa', signal: AbortSignal) {
  try {
    const api = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(
      query
    )}&gsrlimit=12&gsrnamespace=0&prop=pageimages|info&piprop=thumbnail|name&pithumbsize=1600&inprop=url&pilicense=free`;
    const res = await fetch(api, { headers: { 'User-Agent': UA }, signal: AbortSignal.any([signal, AbortSignal.timeout(7000)]) });
    if (!res.ok) return [];
    const data = await res.json();
    const pages = Object.values(data?.query?.pages || {}) as WikiPage[];
    const normalize = (text: string) => text.toLowerCase().replace(/[^a-z\u0600-\u06ff0-9]+/g, ' ').split(/\s+/).filter(Boolean).map(word => word.endsWith('s') && word.length > 3 ? word.slice(0, -1) : word);
    const words = normalize(query).filter(word => word.length > 2 && !['photo', 'image', 'picture', 'photograph'].includes(word));
    return pages.filter(page => page.thumbnail?.source.startsWith('https://') && page.thumbnail.width >= 250).map(page => {
      const titleWords = normalize(page.title);
      const titleMatches = words.filter(word => titleWords.includes(word)).length;
      const matches = words.filter(word => normalize(`${page.title} ${page.pageimage}`).includes(word)).length;
      const logo = /logo|flag|icon|coat.of.arms|\.svg/i.test(page.pageimage || '');
      const fileWiki = page.thumbnail!.source.includes('/commons/') ? 'commons.wikimedia.org' : `${lang}.wikipedia.org`;
      return { imageUrl: page.thumbnail!.source, title: page.title, pageUrl: page.fullurl || '', source: `wikipedia-${lang}`, imageSourceUrl: page.pageimage ? `https://${fileWiki}/wiki/File:${encodeURIComponent(page.pageimage)}` : page.fullurl, score: matches * 8 + titleMatches * 5 + titleMatches / Math.max(1, titleWords.length) * 12 + (page.thumbnail!.width / page.thumbnail!.height > 1.2 ? 2 : 0) - (logo && !/logo|flag|icon/i.test(query) ? 12 : 0) - (page.index || 1) / 10 };
    }).sort((a, b) => b.score - a.score);
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  try { const user=await requireWorkspace(req); await rateLimit('evidence:'+user.id,180,60*1000); const checkedQuery=req.nextUrl.searchParams.get('q') || '';if(checkedQuery.length>500)throw new HttpError(400,'Search query is too long.');
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim().slice(0, 80);
  if (!q) return NextResponse.json({ imageUrl: null, candidates: [] });
  const lang = /[\u0600-\u06FF]/.test(q) ? 'fa' : 'en';
  const results = await wikiThumb(q, lang, req.signal);
  return NextResponse.json({ ...results[0], imageUrl: results[0]?.imageUrl || null, candidates: results.slice(0, 8) });
  } catch(error) { return apiFailure(error); }
}
