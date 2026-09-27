import { NextRequest } from 'next/server';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { requireUser,checkOrigin } from '@/lib/server/session';
import { scopedQuery,query } from '@/lib/server/database';
import { seal,unseal } from '@/lib/server/encryption';
import { readJson } from '@/lib/server/validation';
import { readShare } from '@/lib/server/shares';
import { appOrigin } from '@/lib/server/config';
import { apiFailure,HttpError,privateJson } from '@/lib/server/errors';
import { rateLimit,requestIp } from '@/lib/server/rate-limit';
const schema=z.object({title:z.string().max(200).optional(),messages:z.array(z.object({role:z.enum(['user','assistant','system','tool']),content:z.string().max(100000),modelId:z.string().max(200).optional(),createdAt:z.number().optional()}).passthrough()).min(1).max(200),modelId:z.string().max(200).optional(),toolMode:z.string().max(32).optional(),systemPrompt:z.string().optional(),projectId:z.string().optional(),projectName:z.string().optional()}).strict();
export async function POST(request:NextRequest){try{checkOrigin(request);const user=await requireUser(request);await rateLimit(`share:${user.id}`,30,60*60*1000);const input=await readJson(request,schema,2*1024*1024),id=randomBytes(32).toString('base64url'),now=Date.now();
  const snapshot={id,title:input.title || 'Shared Conversation',messages:input.messages.filter(message=>['user','assistant'].includes(message.role)).map((message,i)=>({id:`shared_${i}`,role:message.role,content:message.content,modelId:message.modelId,state:'DONE',createdAt:message.createdAt || now})),modelId:input.modelId,toolMode:input.toolMode,createdAt:now};
  await scopedQuery(user.id,'INSERT INTO app_shares(id,user_id,payload,expires_at,created_at) VALUES(?,?,?,?,?)',[id,user.id,seal(JSON.stringify(snapshot),`share:${user.id}:${id}`),now+7*24*60*60*1000,now]);await query('INSERT INTO app_share_index(id,user_id) VALUES(?,?)',[id,user.id]);return privateJson({success:true,shareId:id,shareUrl:`${appOrigin()}/share/${id}`},201);
}catch(error){return apiFailure(error);}}
export async function GET(request:NextRequest){try{if(request.nextUrl.searchParams.get('owned')==='1'){const user=await requireUser(request),rows=await scopedQuery(user.id,'SELECT id,payload,expires_at FROM app_shares WHERE user_id=? AND expires_at>? ORDER BY created_at DESC LIMIT 100',[user.id,Date.now()]);return privateJson({shares:rows.map(row=>({id:row.id,title:JSON.parse(unseal(String(row.payload),`share:${user.id}:${row.id}`)).title,expiresAt:row.expires_at,url:`${appOrigin()}/share/${row.id}`}))});}await rateLimit(`share-read:${requestIp(request)}`,120,60*1000);const snapshot=await readShare(request.nextUrl.searchParams.get('id') || '');if(!snapshot)throw new HttpError(404,'Shared conversation not found or expired.');return privateJson({success:true,snapshot});}catch(error){return apiFailure(error);}}
export async function DELETE(request:NextRequest){try{checkOrigin(request);const user=await requireUser(request),id=request.nextUrl.searchParams.get('id') || '';const rows=await scopedQuery(user.id,'DELETE FROM app_shares WHERE id=? AND user_id=? RETURNING id',[id,user.id]);if(!rows.length)throw new HttpError(404,'Shared conversation not found.');await query('DELETE FROM app_share_index WHERE id=? AND user_id=?',[id,user.id]);return privateJson({ok:true});}catch(error){return apiFailure(error);}}
