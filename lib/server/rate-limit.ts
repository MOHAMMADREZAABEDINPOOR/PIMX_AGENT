import 'server-only';
import { query } from './database';
import { tokenHash } from './encryption';
import { HttpError } from './errors';
export const requestIp = (request: Request) => process.env.TRUST_PROXY === 'true' ? (request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown') : 'local';
export async function rateLimit(bucket: string, max: number, period: number) {
  const now = Date.now();
  const [row] = await query('INSERT INTO app_limits(bucket,count,reset_at) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=CASE WHEN app_limits.reset_at<=? THEN 1 ELSE app_limits.count+1 END, reset_at=CASE WHEN app_limits.reset_at<=? THEN ? ELSE app_limits.reset_at END RETURNING count,reset_at', [tokenHash(bucket),now+period,now,now,now+period]);
  if (Number(row.count)>max) throw new HttpError(429, 'Too many attempts. Please try again later.', 'RATE_LIMITED', Math.max(1,Math.ceil((Number(row.reset_at)-now)/1000)));
  if (Math.random()<0.01) await query('DELETE FROM app_limits WHERE reset_at<?',[now]);
}
export async function clearLimit(bucket: string) { await query('DELETE FROM app_limits WHERE bucket=?',[tokenHash(bucket)]); }
