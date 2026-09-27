import { requireUser } from '@/lib/server/session';
import { safeFetch, limitedText } from '@/lib/server/network';
import { apiFailure, HttpError } from '@/lib/server/errors';
import { rateLimit } from '@/lib/server/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function decodeEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => {
      try {
        return String.fromCharCode(parseInt(n, 10));
      } catch {
        return '';
      }
    });
}

export async function GET(req: NextRequest) {
  try { const user=await requireUser(req); await rateLimit('fetch:'+user.id,120,60*1000);
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url') || '';
  const maxChars = Math.min(parseInt(searchParams.get('maxChars') || '12000', 10) || 12000, 20000);

  if (!targetUrl || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://'))) {
    return NextResponse.json({ error: 'Valid HTTP/HTTPS url parameter required' }, { status: 400 });
  }

  try {
    const res = await safeFetch(targetUrl, {
      headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml,text/plain,*/*' },

      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Upstream HTTP ${res.status}`, url: targetUrl }, { status: res.status });
    }

    const contentType = res.headers.get('content-type') || '';
    const raw = await limitedText(res);

    let text: string;
    if (contentType.includes('application/json')) {
      text = raw.slice(0, maxChars + 2000);
    } else {
      text = raw
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
        .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
        .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
        .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
        .replace(/<!--[\s\S]*?-->/g, ' ')
        .replace(/<[^>]+>/g, ' ');
      text = decodeEntities(text)
        .replace(/[ \t\u00a0]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .join('\n')
        .trim();
    }

    const truncated = text.length > maxChars;
    return new Response(truncated ? text.slice(0, maxChars) : text, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) { return apiFailure(error); }
  } catch (error) { return apiFailure(error); }
}
