import 'server-only';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { Agent,fetch as transport } from 'undici';
import { localDeployment } from './config';
import { HttpError } from './errors';

export function privateAddress(address: string) {
  const value = address.toLowerCase();
  if (value.startsWith('::ffff:')) return privateAddress(value.slice(7));
  if (isIP(value) === 6) return value === '::' || value === '::1' || /^(f[cd]|fe[89ab]|ff|2001:db8)/.test(value);
  if (isIP(value) !== 4) return true;
  const [a,b] = value.split('.').map(Number);
  return a===0 || a===10 || a===127 || a>=224 || (a===169 && b===254) || (a===172 && b>=16 && b<=31) || (a===192 && (b===168 || b===0 || b===2)) || (a===100 && b>=64 && b<=127) || (a===198 && [18,19,51].includes(b)) || (a===203 && b===0);
}
export async function validateUrl(input: string, allowProviderLocal = false) {
  let url: URL; try { url = new URL(input); } catch { throw new HttpError(400, 'A valid URL is required.'); }
  if (url.username || url.password || url.hash || !['http:','https:'].includes(url.protocol)) throw new HttpError(400, 'URL credentials and unsupported schemes are not allowed.');
  const localProvider = allowProviderLocal && localDeployment() && process.env.ALLOW_LOCAL_PROVIDERS === 'true' && ['localhost','127.0.0.1','[::1]'].includes(url.hostname);
  if (url.protocol !== 'https:' && !localProvider) throw new HttpError(400, 'Use an HTTPS endpoint.');
  if (!localProvider) {
    const host = url.hostname.replace(/^\[|\]$/g,'');
    const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
    if (!addresses.length || addresses.some(item => privateAddress(item.address))) throw new HttpError(403, 'Private network addresses are not allowed.', 'PRIVATE_NETWORK_BLOCKED');
  }
  return { url, localProvider };
}
export async function safeFetch(input: string | URL, options: RequestInit = {}, provider = false): Promise<Response> {
  let target = String(input);
  for (let hop=0;hop<4;hop++) {
    const { url, localProvider } = await validateUrl(target, provider);
    const dispatcher = new Agent({ connect: { lookup(hostname, opts, callback) {
      void lookup(hostname, { all: true }).then(addresses => {
        if (!addresses.length || (!localProvider && addresses.some(item => privateAddress(item.address)))) return callback(new Error('Blocked network address'), []);
        if (typeof opts === 'object' && opts.all) callback(null, addresses);
        else { const address = addresses.find(item => !opts.family || item.family===opts.family) || addresses[0]; callback(null, address.address, address.family); }
      }, error => callback(error, []));
    } } });
    const response = await transport(url, { ...options, redirect: 'manual', signal: options.signal || AbortSignal.timeout(15000), dispatcher } as Parameters<typeof transport>[1]);
    if ([301,302,303,307,308].includes(response.status)) { await response.body?.cancel(); void dispatcher.close().catch(()=>{}); const location = response.headers.get('location'); if (!location) throw new HttpError(502, 'The source returned an invalid redirect.'); const next = new URL(location,url); const headers=new Headers(options.headers);if ((headers.has('authorization') || headers.has('x-api-key') || url.searchParams.has('key')) && next.origin!==url.origin) throw new HttpError(502, 'Cross-origin credential redirects are not allowed.'); target=next.href; continue; }
    void dispatcher.close().catch(()=>{}); return response as unknown as Response;
  }
  throw new HttpError(502, 'Too many source redirects.');
}
export async function limitedText(response: Response, maxBytes=2*1024*1024) {
  if (Number(response.headers.get('content-length'))>maxBytes) { await response.body?.cancel(); throw new HttpError(413, 'The source page is too large.'); }
  const reader=response.body?.getReader(); if(!reader)return ''; let bytes=0, text=''; const decoder=new TextDecoder();
  try { while(true){const {value,done}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>maxBytes){await reader.cancel();throw new HttpError(413,'The source page is too large.');}text+=decoder.decode(value,{stream:true});} return text+decoder.decode(); } finally {reader.releaseLock();}
}
