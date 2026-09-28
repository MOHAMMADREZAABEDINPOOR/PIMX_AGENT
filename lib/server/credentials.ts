import 'server-only';
import { scopedQuery } from './database';
import { unseal } from './encryption';
import { VISIBLE_PROVIDERS } from '@/lib/providers/catalog';
import { HttpError } from './errors';
import { validateUrl } from './network';
import { localDeployment } from './config';

export async function resolveCredential(userId: string, input: { credentialId?: string; providerId?: string; baseUrl?: string; apiFormat?: string }, allowDraftKey?: string) {
  const providerId=input.providerId || 'gemini', spec=VISIBLE_PROVIDERS.find(provider=>provider.id===providerId);
  if (input.credentialId) {
    const [record]=await scopedQuery(userId,'SELECT * FROM app_browser_credentials WHERE id=? AND user_id=?',[input.credentialId,userId]);
    if (!record) throw new HttpError(404,'Provider credential not found.');
    const baseUrl=String(record.base_url || spec?.baseUrl || '');
    if (record.provider_id!==providerId || (input.baseUrl && input.baseUrl.replace(/\/+$/,'')!==baseUrl.replace(/\/+$/,'')) || (input.apiFormat && input.apiFormat!==record.api_format)) throw new HttpError(403,'Saved provider fields cannot be overridden.','PROVIDER_FIELDS_LOCKED');
    if (baseUrl) await validateUrl(baseUrl,true);
    return { apiKey:unseal(String(record.secret),`credential:${userId}:${record.id}`),baseUrl,apiFormat:String(record.api_format),providerId };
  }
  const baseUrl=input.baseUrl || spec?.baseUrl || '';
  if(baseUrl && new URL(baseUrl).search)throw new HttpError(400,'Provider endpoints must not contain query credentials.');
  if(spec && baseUrl.replace(/\/+$/,'')!==spec.baseUrl.replace(/\/+$/,''))throw new HttpError(403,'Use the built-in endpoint or create a custom provider.','PROVIDER_FIELDS_LOCKED');
  if (baseUrl) await validateUrl(baseUrl,true);
  if (allowDraftKey) return {apiKey:allowDraftKey,baseUrl,apiFormat:input.apiFormat || spec?.apiFormat || 'OPENAI',providerId};
  const apiKey=localDeployment() || process.env.ALLOW_SHARED_PROVIDER_KEYS==='true' ? (providerId==='gemini' ? process.env.GEMINI_API_KEY || '' : '') : '';
  return {apiKey,baseUrl,apiFormat:input.apiFormat || spec?.apiFormat || 'OPENAI',providerId};
}
