import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { requireUser,checkOrigin } from '@/lib/server/session';
import { scopedQuery } from '@/lib/server/database';
import { seal } from '@/lib/server/encryption';
import { credentialSchema,idSchema,readJson } from '@/lib/server/validation';
import { apiFailure,HttpError,privateJson } from '@/lib/server/errors';
import { validateUrl } from '@/lib/server/network';
import { VISIBLE_PROVIDERS } from '@/lib/providers/catalog';
import { rateLimit } from '@/lib/server/rate-limit';

export async function GET(request:NextRequest){try{const user=await requireUser(request);const rows=await scopedQuery(user.id,'SELECT id,provider_id,label,base_url,api_format FROM app_credentials WHERE user_id=? ORDER BY created_at',[user.id]);return privateJson({credentials:rows.map(row=>({id:row.id,providerId:row.provider_id,label:row.label,baseUrl:row.base_url,apiFormat:row.api_format,keyPreview:'••••••••'}))});}catch(error){return apiFailure(error);}}
export async function POST(request:NextRequest){try{checkOrigin(request);const user=await requireUser(request);await rateLimit(`credentials:${user.id}`,100,60*60*1000);const input=await readJson(request,credentialSchema,16*1024),spec=VISIBLE_PROVIDERS.find(provider=>provider.id===input.providerId),baseUrl=input.baseUrl || spec?.baseUrl;
  if(!baseUrl)throw new HttpError(400,'Enter a provider endpoint.');await validateUrl(baseUrl,true);if(new URL(baseUrl).search)throw new HttpError(400,'Provider endpoints must not contain query credentials.');if(spec && baseUrl.replace(/\/+$/,'')!==spec.baseUrl.replace(/\/+$/,''))throw new HttpError(403,'Use the built-in endpoint or create a custom provider.');
  const id=randomUUID();await scopedQuery(user.id,'INSERT INTO app_credentials(id,user_id,provider_id,label,secret,base_url,api_format,created_at) VALUES(?,?,?,?,?,?,?,?)',[id,user.id,input.providerId,input.label,seal(input.apiKey,`credential:${user.id}:${id}`),baseUrl,spec?.apiFormat || input.apiFormat,Date.now()]);return privateJson({credential:{id,providerId:input.providerId,label:input.label,baseUrl,apiFormat:spec?.apiFormat || input.apiFormat,keyPreview:'••••••••'}},201);
}catch(error){return apiFailure(error);}}
export async function DELETE(request:NextRequest){try{checkOrigin(request);const user=await requireUser(request),id=idSchema.safeParse(request.nextUrl.searchParams.get('id'));if(!id.success)throw new HttpError(400,'Invalid credential id.');const rows=await scopedQuery(user.id,'DELETE FROM app_credentials WHERE id=? AND user_id=? RETURNING id',[id.data,user.id]);if(!rows.length)throw new HttpError(404,'Provider credential not found.');return privateJson({ok:true});}catch(error){return apiFailure(error);}}
