import { NextRequest, NextResponse } from 'next/server';
import { checkOrigin, requireUser } from '@/lib/server/session';
import { HttpError } from '@/lib/server/errors';
import { readBody } from '@/lib/server/validation';
import { rateLimit } from '@/lib/server/rate-limit';
import { previewHeaders } from '@/lib/server/preview';
import { escapeHtml } from '@/lib/html';

export async function POST(request: NextRequest) {
  try {
    checkOrigin(request);
    const user = await requireUser(request);
    await rateLimit(`preview:${user.id}`, 120, 60_000);
    if (!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')) {
      throw new HttpError(415, 'Send a preview form.');
    }
    const fields = new URLSearchParams(await readBody(request, 8 * 1024 * 1024));
    if (fields.size !== 1 || !fields.has('html')) throw new HttpError(400, 'The preview form is invalid.');
    const html = fields.get('html')!;
    if (!html || Buffer.byteLength(html, 'utf8') > 2 * 1024 * 1024) throw new HttpError(413, 'This preview is too large.');
    // Direct response: no preview code, temporary chat or token is saved to disk.
    return new NextResponse(html, { headers: previewHeaders });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof HttpError ? error.message : 'This preview could not be opened. Try again.';
    return new NextResponse(`<!doctype html><html lang="en"><body style="font-family:system-ui;padding:24px"><p role="alert">${escapeHtml(message)}</p></body></html>`, { status, headers: previewHeaders });
  }
}
