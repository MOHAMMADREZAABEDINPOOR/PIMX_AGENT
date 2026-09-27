import 'server-only';
import { localDeployment, appOrigin } from './config';
import { HttpError } from './errors';

export async function checkBot(input: { website?: string; turnstileToken?: string }, action: string) {
  if (input.website) throw new HttpError(400, 'This submission could not be verified.');
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) { if (localDeployment()) return; throw new HttpError(503, 'Form verification is not configured. Please try again later.', 'BOT_CONFIGURATION_REQUIRED'); }
  if (!input.turnstileToken) throw new HttpError(400, 'Complete the verification challenge.', 'BOT_VERIFICATION_REQUIRED');
  let verification: { success?: boolean; hostname?: string; action?: string };
  try { const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secret, response: input.turnstileToken }), signal: AbortSignal.timeout(8000) }); verification = await response.json(); } catch { throw new HttpError(503, 'Verification is unavailable. Please try again.'); }
  if (!verification.success || verification.hostname !== new URL(appOrigin()).hostname || verification.action !== action) throw new HttpError(400, 'Verification expired or failed. Please try again.', 'BOT_VERIFICATION_FAILED');
}
