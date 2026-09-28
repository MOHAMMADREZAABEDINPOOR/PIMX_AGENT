import 'server-only';
import { createHmac } from 'node:crypto';
import { encryptionKey } from './encryption';
export function deviceInfo(request: Request) {
  const agent = (request.headers.get('user-agent') || '').slice(0, 500);
  const device = /iPad|Tablet/i.test(agent) ? 'Tablet' : /Mobile|Android|iPhone/i.test(agent) ? 'Mobile' : 'Desktop';
  const browser = /Edg\//.test(agent) ? 'Edge' : /Firefox\//.test(agent) ? 'Firefox' : /Chrome\//.test(agent) ? 'Chrome' : /Safari\//.test(agent) ? 'Safari' : 'Other';
  let geo: { country?: string; city?: string; region?: string } = {};
  // Only the secret-authenticated Cloudflare ingress may assert geolocation.
  if (process.env.TRUST_PROXY === 'true' && request.headers.get('x-pimx-proxy-secret') === process.env.APP_PROXY_SECRET) {
    try { const source = JSON.parse(request.headers.get('x-pimx-geo') || '{}'); geo = Object.fromEntries(['country','city','region'].map(key => [key, String(source[key] || '').slice(0,100)])); } catch { /* Location unavailable. */ }
  }
  return { device, browser, ...geo };
}
export const visitorHash = (value: string) => createHmac('sha256', encryptionKey()).update('visitor\0' + value).digest('hex');
