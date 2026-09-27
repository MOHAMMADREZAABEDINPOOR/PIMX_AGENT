import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { randomBytes } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { query } from './database';
import { tokenHash } from './encryption';
import { appOrigin, localDeployment, sessionCookie } from './config';
import { HttpError } from './errors';

export interface SessionUser { id: string; displayName: string; role: 'USER' | 'ADMIN'; }
async function userForToken(token?: string): Promise<SessionUser | null> {
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const now = Date.now();
  const [user] = await query('SELECT u.id,u.display_name,u.role FROM app_sessions s JOIN app_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND s.last_seen>?', [tokenHash(token), now, now - 24*60*60*1000]);
  if (!user) return null;
  await query('UPDATE app_sessions SET last_seen=? WHERE token_hash=?', [now, tokenHash(token)]);
  return { id: String(user.id), displayName: String(user.display_name), role: user.role === 'ADMIN' ? 'ADMIN' : 'USER' };
}
export async function currentUser(request?: NextRequest) { return userForToken(request ? request.cookies.get(sessionCookie())?.value : (await cookies()).get(sessionCookie())?.value); }
export async function requireUser(request: NextRequest) { const user = await currentUser(request); if (!user) throw new HttpError(401, 'Sign in to continue.', 'AUTH_REQUIRED'); return user; }
export async function requirePageUser(next = '/') { const user = await currentUser(); if (!user) redirect('/login?next=' + encodeURIComponent(next)); return user; }
export function checkOrigin(request: Request) {
  if (['GET','HEAD','OPTIONS'].includes(request.method)) return;
  if (request.headers.get('origin') !== appOrigin()) throw new HttpError(403, 'This request origin is not allowed.', 'CSRF_REJECTED');
  const site = request.headers.get('sec-fetch-site'); if (site && !['same-origin','none'].includes(site)) throw new HttpError(403, 'Cross-site requests are not allowed.');
}
export async function issueSession(userId: string, previous?: string) {
  if (previous) await query('DELETE FROM app_sessions WHERE token_hash=?', [tokenHash(previous)]);
  const token = randomBytes(32).toString('base64url'), now = Date.now();
  await query('INSERT INTO app_sessions(token_hash,user_id,expires_at,last_seen) VALUES(?,?,?,?)', [tokenHash(token), userId, now+7*24*60*60*1000, now]);
  return { token, options: { httpOnly: true, secure: !localDeployment(), sameSite: 'lax' as const, path: '/', maxAge: 7*24*60*60 } };
}
